import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

const PROF_ROLES = ["teacher", "professor"];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const assignmentId = req.query.assignmentId as string;
  if (!assignmentId) return res.status(400).json({ error: "assignmentId required" });

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

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: subs, error: subsErr } = await supabaseAdmin
    .from("assignment_submissions")
    .select("id, student_id, submitted_at, grade")
    .eq("assignment_id", assignmentId)
    .order("submitted_at");

  if (subsErr) return res.status(500).json({ error: subsErr.message });
  if (!subs || subs.length === 0) return res.status(200).json({ submissions: [] });

  const studentIds = [...new Set(subs.map((s: { student_id: string }) => s.student_id))];
  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name")
    .in("id", studentIds);

  const nameMap: Record<string, string> = {};
  for (const p of (profiles ?? []) as { id: string; full_name: string }[]) nameMap[p.id] = p.full_name;

  const submissions = subs.map((s: { id: string; student_id: string; submitted_at: string; grade: number | null }) => ({
    id: s.id,
    student_id: s.student_id,
    studentName: nameMap[s.student_id] ?? "—",
    submitted_at: s.submitted_at,
    grade: s.grade ?? null,
  }));

  return res.status(200).json({ submissions });
}
