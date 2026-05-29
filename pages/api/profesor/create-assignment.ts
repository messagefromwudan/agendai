import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

const PROF_ROLES = ["teacher", "professor"];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return Object.entries(req.cookies).map(([name, value]) => ({ name, value: value ?? "" }));
        },
        setAll() {},
      },
    }
  );

  const { data: { session } } = await supabaseAuth.auth.getSession();
  if (!session) return res.status(401).json({ error: "Neautorizat" });

  const { data: prof } = await supabaseAuth
    .from("profiles").select("role").eq("id", session.user.id).single();
  if (!prof || !PROF_ROLES.includes(prof.role)) {
    return res.status(403).json({ error: "Acces interzis" });
  }

  const { title, description, due_date, is_published, class_id, subject_id } = req.body as {
    title: string; description: string | null; due_date: string;
    is_published: boolean; class_id: string; subject_id: string;
  };

  if (!title || !due_date || !class_id || !subject_id) {
    return res.status(400).json({ error: "Câmpuri lipsă" });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { error } = await supabaseAdmin.from("assignments").insert({
    title, description: description || null,
    due_date, is_published: is_published ?? false,
    class_id, subject_id,
    professor_id: session.user.id,
  });

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json({ success: true });
}
