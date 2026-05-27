import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

const ADMIN_ROLES = ["admin", "director", "director_adjunct"];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Verify the caller is an admin using the anon client + cookie session
  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return Object.entries(req.cookies).map(([name, value]) => ({
            name,
            value: value ?? "",
          }));
        },
        setAll() {},
      },
    }
  );

  const {
    data: { session },
  } = await supabaseAuth.auth.getSession();

  if (!session) {
    return res.status(401).json({ error: "Neautorizat" });
  }

  const { data: callerProfile } = await supabaseAuth
    .from("profiles")
    .select("role, school_id")
    .eq("id", session.user.id)
    .single();

  if (!callerProfile || !ADMIN_ROLES.includes(callerProfile.role)) {
    return res.status(403).json({ error: "Acces interzis" });
  }

  const { email, password, full_name, role, school_id } = req.body as {
    email: string;
    password: string;
    full_name: string;
    role: string;
    school_id: string;
  };

  if (!email || !password || !full_name || !role || !school_id) {
    return res.status(400).json({ error: "Câmpuri lipsă" });
  }

  // Only allow creating users within the same school
  if (school_id !== callerProfile.school_id) {
    return res.status(403).json({ error: "Acces interzis" });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (authError || !authData.user) {
    return res.status(400).json({ error: authError?.message ?? "Eroare la creare utilizator" });
  }

  const { error: profileError } = await supabaseAdmin.from("profiles").insert({
    id: authData.user.id,
    full_name,
    role,
    school_id,
  });

  if (profileError) {
    // Roll back the auth user if profile insert fails
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    return res.status(400).json({ error: profileError.message });
  }

  return res.status(201).json({ user: { id: authData.user.id, email, full_name, role } });
}
