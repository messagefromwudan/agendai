import type { NextApiRequest, NextApiResponse } from "next";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

export const config = {
  api: { responseLimit: false },
};

const SYSTEM_PROMPT = `Ești un tutore AI dedicat elevilor din Republica Moldova. Curriculumul tău acoperă materiile din sistemul educațional moldovenesc: matematică, limba română, limba rusă, fizică, chimie, biologie, istorie, geografie, informatică, educație civică și altele.

Rolul tău:
- Explici conceptele clar, adaptat nivelului elevului
- Ajuți cu temele ghidând elevul pas cu pas, fără a da direct răspunsul final
- Pregătești pentru teste și examene cu exerciții și recapitulări
- Răspunzi în română (sau rusă dacă elevul scrie în rusă)
- Ești răbdător, prietenos și încurajator
- Folosești exemple din viața cotidiană din Moldova când ajută
- Folosești formatare markdown (titluri, liste, bold) pentru claritate

Fii concis și la obiect. Nu repeta inutil informații deja discutate.`;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function makeSupabase(key: string) {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  // Verify user via their JWT
  const supabaseUser = makeSupabase(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const {
    data: { user },
    error: authError,
  } = await supabaseUser.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: "Unauthorized" });

  // Admin client for writes (service role if available, else anon)
  const supabase = makeSupabase(
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const {
    messages,
    subject,
    sessionId,
  } = req.body as {
    messages: { role: "user" | "assistant"; content: string }[];
    subject: string | null;
    sessionId: string | null;
  };

  // Check credits
  const { data: profile } = await supabase
    .from("profiles")
    .select("thinking_credits")
    .eq("id", user.id)
    .single();

  if (!profile || profile.thinking_credits <= 0) {
    return res.status(402).json({ error: "Nu mai ai credite Tuto" });
  }

  // Get or create session
  let activeSessionId = sessionId;
  if (!activeSessionId) {
    const { data: newSession, error: sessionError } = await supabase
      .from("chat_sessions")
      .insert({ user_id: user.id })
      .select("id")
      .single();

    if (sessionError || !newSession) {
      return res.status(500).json({ error: "Nu s-a putut crea sesiunea" });
    }
    activeSessionId = newSession.id;
  }

  // Save user message (last in array)
  const lastMsg = messages[messages.length - 1];
  if (lastMsg?.role === "user") {
    await supabase.from("chat_messages").insert({
      session_id: activeSessionId,
      role: "user",
      content: lastMsg.content,
    });
  }

  // SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  // Send session id first so client can track it
  res.write(`data: ${JSON.stringify({ sessionId: activeSessionId })}\n\n`);

  let fullResponse = "";

  try {
    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system:
        SYSTEM_PROMPT + (subject ? `\n\nMateria selectată: ${subject}` : ""),
      messages,
    });

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        fullResponse += event.delta.text;
        res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
      }
    }
  } catch {
    res.write(
      `data: ${JSON.stringify({ error: "Eroare la generarea răspunsului. Încearcă din nou." })}\n\n`
    );
    res.write("data: [DONE]\n\n");
    res.end();
    return;
  }

  // Persist AI response
  if (fullResponse) {
    await supabase.from("chat_messages").insert({
      session_id: activeSessionId,
      role: "assistant",
      content: fullResponse,
    });
  }

  // Decrement credits via RPC (function must exist in Supabase)
  const { error: rpcError } = await supabase.rpc("decrement_credits", {
    p_user_id: user.id,
  });
  if (rpcError) {
    // Fallback: direct decrement
    await supabase
      .from("profiles")
      .update({ thinking_credits: Math.max(0, profile.thinking_credits - 1) })
      .eq("id", user.id);
  }

  res.write("data: [DONE]\n\n");
  res.end();
}
