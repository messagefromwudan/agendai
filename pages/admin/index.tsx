import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Inter, Poppins } from "next/font/google";
import { Users, GraduationCap, Calendar, BookOpen } from "lucide-react";
import { supabaseClient } from "@/lib/supabaseClient";
import AdminSidebar from "@/components/AdminSidebar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({ weight: ["600", "700"], subsets: ["latin"], variable: "--font-poppins" });

const ADMIN_ROLES = ["admin", "director", "director_adjunct"];

interface AdminProfile {
  full_name: string;
  role: string;
  school_id: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalProfessors, setTotalProfessors] = useState(0);
  const [totalClasses, setTotalClasses] = useState(0);
  const [activeYear, setActiveYear] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session) { router.replace("/login"); return; }

      const { data: prof } = await supabaseClient
        .from("profiles")
        .select("full_name, role, school_id")
        .eq("id", session.user.id)
        .single();

      if (!prof || !ADMIN_ROLES.includes(prof.role)) {
        router.replace("/dashboard");
        return;
      }

      setProfile(prof);
      const schoolId = prof.school_id;

      const [studentsRes, professorsRes, classesRes, yearRes] = await Promise.all([
        supabaseClient
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("school_id", schoolId)
          .eq("role", "student"),
        supabaseClient
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("school_id", schoolId)
          .eq("role", "teacher"),
        supabaseClient
          .from("classes")
          .select("id", { count: "exact", head: true })
          .eq("school_id", schoolId),
        supabaseClient
          .from("school_years")
          .select("name")
          .eq("school_id", schoolId)
          .eq("is_active", true)
          .single(),
      ]);

      setTotalStudents((studentsRes as any).count ?? 0);
      setTotalProfessors((professorsRes as any).count ?? 0);
      setTotalClasses((classesRes as any).count ?? 0);
      setActiveYear(yearRes.data?.name ?? null);
      setReady(true);
    }
    load();
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-sm text-gray-400 dark:text-gray-500 animate-pulse">Se încarcă...</div>
      </div>
    );
  }

  const firstName = profile?.full_name?.split(" ")[0] ?? "Admin";

  return (
    <>
      <Head><title>Admin — AgendAI</title></Head>
      <div className={`${inter.variable} ${poppins.variable} font-sans flex min-h-screen bg-slate-50 dark:bg-gray-900`}>
        <AdminSidebar fullName={profile?.full_name ?? ""} role={profile?.role ?? ""} />

        <main className="ml-64 flex-1 p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-white">
              Bine ai revenit, {firstName}!
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Panou de administrare școală
            </p>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-4 gap-5">
            <StatCard
              label="Elevi"
              value={String(totalStudents)}
              icon={Users}
              iconColor="text-blue-500"
              iconBg="bg-blue-50 dark:bg-blue-900/20"
            />
            <StatCard
              label="Profesori"
              value={String(totalProfessors)}
              icon={GraduationCap}
              iconColor="text-purple-500"
              iconBg="bg-purple-50 dark:bg-purple-900/20"
            />
            <StatCard
              label="Clase"
              value={String(totalClasses)}
              icon={Calendar}
              iconColor="text-orange-500"
              iconBg="bg-orange-50 dark:bg-orange-900/20"
            />
            <StatCard
              label="An școlar activ"
              value={activeYear ?? "—"}
              icon={BookOpen}
              iconColor="text-[#164B2E] dark:text-green-400"
              iconBg="bg-green-50 dark:bg-green-900/20"
            />
          </div>
        </main>
      </div>
    </>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
}

function StatCard({ label, value, icon: Icon, iconColor, iconBg }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 flex items-start gap-4">
      <div className={`${iconBg} rounded-xl p-2.5 shrink-0`}>
        <Icon size={20} className={iconColor} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5 truncate">{value}</p>
      </div>
    </div>
  );
}
