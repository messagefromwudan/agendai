import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

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

// Anon client — used only for verifying the user's JWT
const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Admin client — bypasses RLS for all DB writes
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  // Verify user via their JWT
  const {
    data: { user },
    error: authError,
  } = await supabaseAnon.auth.getUser(token);
  if (authError || !user) {
    console.error("[tutor API] auth error:", authError?.message);
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Server-side credit check
  const { data: profileData } = await supabaseAdmin
    .from("profiles")
    .select("thinking_credits")
    .eq("id", user.id)
    .single();
  if (!profileData || profileData.thinking_credits <= 0) {
    return res.status(402).json({ error: "Nu mai ai credite Tuto. Contactează administratorul pentru reîncărcare." });
  }

  const { messages, subject, sessionId } = req.body as {
    messages: { role: "user" | "assistant"; content: string }[];
    subject: string | null;
    sessionId: string | null;
  };

  // Session creation — non-fatal, AI call proceeds regardless
  let activeSessionId = sessionId ?? null;
  if (!activeSessionId) {
    const { data: newSession, error: sessionError } = await supabaseAdmin
      .from("chat_sessions")
      .insert({ user_id: user.id })
      .select("id")
      .single();

    if (sessionError) {
      console.error("[tutor API] session create error:", sessionError.message, sessionError.code);
    }
    activeSessionId = newSession?.id ?? null;
  }

  // Save user message — skip if no session
  const lastMsg = messages?.[messages.length - 1];
  if (activeSessionId && lastMsg?.role === "user") {
    const { error: msgError } = await supabaseAdmin.from("chat_messages").insert({
      session_id: activeSessionId,
      role: "user",
      content: lastMsg.content,
    });
    if (msgError) console.error("[tutor API] save user msg error:", msgError.message);
  }

  // OpenAI call
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT + (subject ? `\n\nMateria selectată: ${subject}` : ""),
        },
        ...(messages ?? []).map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ],
    });

    const responseText = completion.choices[0]?.message?.content ?? "";

    // Save AI response
    if (activeSessionId && responseText) {
      const { error: aiMsgError } = await supabaseAdmin.from("chat_messages").insert({
        session_id: activeSessionId,
        role: "assistant",
        content: responseText,
      });
      if (aiMsgError) console.error("[tutor API] save ai msg error:", aiMsgError.message);
    }

    return res.status(200).json({ response: responseText, sessionId: activeSessionId });
  } catch (error: any) {
    console.error("[tutor API] full error:", JSON.stringify(error, null, 2));
    return res.status(500).json({
      error: error?.message ?? "Unknown error",
      status: error?.status,
      code: error?.code,
    });
  }
}
