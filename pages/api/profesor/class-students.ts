import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

const PROF_ROLES = ["teacher", "professor"];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const classId = req.query.classId as string;
  if (!classId) return res.status(400).json({ error: "classId required" });

  // Verify caller is a professor
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

  // Use service role to bypass RLS
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Get student IDs enrolled in this class
  const { data: enrollments, error: enrollErr } = await supabaseAdmin
    .from("class_enrollments")
    .select("student_id")
    .eq("class_id", classId);

  if (enrollErr) return res.status(500).json({ error: enrollErr.message });
  if (!enrollments || enrollments.length === 0) return res.status(200).json({ students: [] });

  const studentIds = enrollments.map((e: { student_id: string }) => e.student_id);

  // Fetch profiles for those students
  const { data: profiles, error: profileErr } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name")
    .in("id", studentIds);

  if (profileErr) return res.status(500).json({ error: profileErr.message });

  return res.status(200).json({ students: profiles ?? [] });
}
