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

  const { submissionId, grade } = req.body as { submissionId: string; grade: number };
  if (!submissionId || typeof grade !== "number" || grade < 1 || grade > 10) {
    return res.status(400).json({ error: "Date invalide" });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { error } = await supabaseAdmin
    .from("assignment_submissions")
    .update({ grade })
    .eq("id", submissionId);

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ success: true });
}
