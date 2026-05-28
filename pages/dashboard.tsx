import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { Inter, Poppins } from "next/font/google";
import {
  Brain,
  Home,
  BookOpen,
  Backpack,
  Calendar,
  TrendingUp,
  MessageSquare,
  User,
  Settings,
  Flame,
  Clock,
  Info,
  Award,
  AlertCircle,
} from "lucide-react";
import { supabaseClient } from "@/lib/supabaseClient";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({
  weight: ["600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

interface Profile {
  full_name: string;
  thinking_credits: number;
  current_streak: number;
  school_id: string | null;
}

interface ScheduleItem {
  id: string;
  subject_name: string;
  start_time: string;
  end_time: string;
  room: string | null;
}

interface Assignment {
  id: string;
  title: string;
  subject_name: string;
  due_date: string;
}

const MAIN_NAV = [
  { label: "Acasă", icon: Home, href: "/dashboard" },
  { label: "Profil", icon: User, href: "/profil" },
  { label: "Catalog", icon: BookOpen, href: "/catalog" },
  { label: "Tutore AI", icon: Brain, href: "/tutore" },
  { label: "Teme", icon: Backpack, href: "/teme" },
  { label: "Orar", icon: Calendar, href: "/orar" },
  { label: "Progres", icon: TrendingUp, href: "/progres" },
  { label: "Mesaje", icon: MessageSquare, href: "/mesaje" },
];

const BOTTOM_NAV = [{ label: "Setări", icon: Settings, href: "/setari" }];

function formatTime(time: string): string {
  return time.slice(0, 5);
}

function formatDueDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "short",
  });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export default function DashboardPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [gpa, setGpa] = useState<number | null>(null);
  const [subjectsCount, setSubjectsCount] = useState(0);
  const [aiSessionsCount, setAiSessionsCount] = useState(0);
  const [totalAssignments, setTotalAssignments] = useState(0);
  const [completedAssignments, setCompletedAssignments] = useState(0);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [overdueAssignments, setOverdueAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    async function load() {
      const {
        data: { session },
      } = await supabaseClient.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      const userId = session.user.id;

      const [profileRes, enrollmentRes] = await Promise.all([
        supabaseClient
          .from("profiles")
          .select("full_name, thinking_credits, current_streak, school_id")
          .eq("id", userId)
          .single(),
        supabaseClient
          .from("class_enrollments")
          .select("class_id")
          .eq("student_id", userId)
          .single(),
      ]);

      if (profileRes.data) setProfile(profileRes.data);

      const classId = enrollmentRes.data?.class_id ?? null;
      const todayDow = new Date().getDay();
      const todayStr = new Date().toISOString().split("T")[0];

      const scheduleQuery = supabaseClient
        .from("schedule")
        .select("id, start_time, end_time, room, subjects(name)")
        .eq("day_of_week", todayDow)
        .order("start_time");
      if (classId) scheduleQuery.eq("class_id", classId);

      const [
        scheduleRes,
        gradesRes,
        subjectsRes,
        aiSessionsRes,
        totalAssignmentsRes,
        completedAssignmentsRes,
        overdueRes,
      ] = await Promise.all([
        scheduleQuery,
        supabaseClient.from("grades").select("grade").eq("student_id", userId),
        classId
          ? supabaseClient
              .from("class_subjects")
              .select("id", { count: "exact", head: true })
              .eq("class_id", classId)
          : Promise.resolve({ count: 0, error: null }),
        supabaseClient
          .from("chat_sessions")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId),
        classId
          ? supabaseClient
              .from("assignments")
              .select("id", { count: "exact", head: true })
              .eq("class_id", classId)
              .eq("is_published", true)
          : Promise.resolve({ count: 0, error: null }),
        supabaseClient
          .from("submissions")
          .select("id", { count: "exact", head: true })
          .eq("student_id", userId),
        classId
          ? supabaseClient
              .from("assignments")
              .select("id, title, due_date, subjects(name)")
              .eq("class_id", classId)
              .eq("is_published", true)
              .lt("due_date", todayStr)
              .order("due_date", { ascending: true })
              .limit(5)
          : Promise.resolve({ data: [] as unknown as { id: string; title: string; due_date: string; subjects?: { name: string } | null }[], error: null }),
      ]);

      if (scheduleRes.data) {
        setSchedule(
          (scheduleRes.data as unknown as { id: string; start_time: string; end_time: string; room: string | null; subjects?: { name: string } | null }[]).map((item) => ({
            id: item.id,
            subject_name: item.subjects?.name ?? "—",
            start_time: item.start_time,
            end_time: item.end_time,
            room: item.room ?? null,
          }))
        );
      }

      if (gradesRes.data && gradesRes.data.length > 0) {
        const sum = (gradesRes.data as { grade: number }[]).reduce(
          (acc, g) => acc + (g.grade ?? 0),
          0
        );
        setGpa(Math.round((sum / gradesRes.data.length) * 100) / 100);
      }

      setSubjectsCount(subjectsRes.count ?? 0);
      setAiSessionsCount(aiSessionsRes.count ?? 0);
      setTotalAssignments(totalAssignmentsRes.count ?? 0);
      setCompletedAssignments(completedAssignmentsRes.count ?? 0);

      const overdueData = overdueRes.data;
      if (overdueData) {
        setOverdueAssignments(
          (overdueData as unknown as { id: string; title: string; due_date: string; subjects?: { name: string } | null }[]).map((a) => ({
            id: a.id,
            title: a.title,
            subject_name: a.subjects?.name ?? "—",
            due_date: a.due_date,
          }))
        );
      }

      setReady(true);
    }

    load();
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-sm text-gray-400 dark:text-gray-500 animate-pulse">
          Se încarcă...
        </div>
      </div>
    );
  }

  const firstName = profile?.full_name?.split(" ")[0] ?? "Student";
  const initials = profile?.full_name ? getInitials(profile.full_name) : "?";

  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;
  const nextClass =
    schedule.find((item) => item.start_time.slice(0, 5) > currentTime) ?? null;

  return (
    <>
      <Head>
        <title>Dashboard — AgendAI</title>
      </Head>
      <div
        className={`${inter.variable} ${poppins.variable} font-sans flex min-h-screen bg-slate-50 dark:bg-gray-900`}
      >
        {/* ── Sidebar ── */}
        <aside className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 flex flex-col z-10">
          {/* Logo */}
          <div className="px-5 py-5 border-b border-gray-100 dark:border-gray-700 shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-[#164B2E] rounded-2xl p-2 shrink-0">
                <Brain className="text-white" size={22} />
              </div>
              <span className="font-heading text-lg font-bold text-gray-900 dark:text-white">
                AgendAI
              </span>
            </div>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1.5 pl-[44px] leading-tight">
              Centru inteligent de învățare
            </p>
          </div>

          {/* Main nav */}
          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            {MAIN_NAV.map(({ label, icon: Icon, href }) => {
              const active = router.pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 ${
                    active
                      ? "bg-[#164B2E] text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <Icon size={17} />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Bottom nav */}
          <div className="px-3 py-3 border-t border-gray-100 dark:border-gray-700 space-y-0.5 shrink-0">
            {BOTTOM_NAV.map(({ label, icon: Icon, href }) => {
              const active = router.pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 ${
                    active
                      ? "bg-[#164B2E] text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <Icon size={17} />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Profile footer */}
          <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-700 shrink-0 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#164B2E] flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">{initials}</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                {profile?.full_name ?? "—"}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Student</p>
            </div>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="ml-64 flex-1 p-8 pb-24">
          {/* 1. Header row */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-white">
                Bine ai revenit, {firstName}!
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Hai să facem ziua de azi una productivă!
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0 mt-1">
              <button className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50 rounded-xl px-4 py-2 text-sm font-medium hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors">
                <Flame size={15} />
                Începe un streak
              </button>
              <div className="w-10 h-10 rounded-full bg-[#164B2E] flex items-center justify-center shrink-0">
                <span className="text-white text-sm font-bold">{initials}</span>
              </div>
            </div>
          </div>

          {/* 2. Hero card */}
          <div className="relative bg-[#164B2E] rounded-2xl p-7 mb-6 overflow-hidden">
            <div className="relative z-10 max-w-[65%]">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-white/70 text-sm font-medium">
                  Media semestrială
                </span>
                <Info size={13} className="text-white/40" />
              </div>
              {gpa !== null ? (
                <p className="font-heading text-5xl font-bold text-white leading-none">
                  {gpa.toFixed(2)}
                </p>
              ) : (
                <>
                  <span className="inline-flex items-center bg-white/15 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    În așteptare
                  </span>
                  <p className="text-white/55 text-sm mt-3 leading-relaxed">
                    Notele vor apărea după ce profesorul le va atribui.
                  </p>
                </>
              )}
            </div>
            <Award
              size={100}
              className="absolute right-7 top-1/2 -translate-y-1/2 text-white opacity-[0.12]"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          </div>

          {/* 3. Stats row */}
          <div className="grid grid-cols-4 gap-5 mb-6">
            <StatCard
              label="Materii active"
              value={String(subjectsCount)}
              icon={BookOpen}
              iconColor="text-blue-500"
              iconBg="bg-blue-50 dark:bg-blue-900/20"
            />
            <StatCard
              label="Sesiuni AI"
              value={String(aiSessionsCount)}
              icon={Brain}
              iconColor="text-purple-500"
              iconBg="bg-purple-50 dark:bg-purple-900/20"
            />
            <StatCard
              label="Teme"
              value={`${completedAssignments}/${totalAssignments}`}
              icon={Backpack}
              iconColor="text-[#164B2E] dark:text-green-400"
              iconBg="bg-green-50 dark:bg-green-900/20"
            />
            <StatCard
              label="Orele de azi"
              value={String(schedule.length)}
              icon={Calendar}
              iconColor="text-orange-500"
              iconBg="bg-orange-50 dark:bg-orange-900/20"
            />
          </div>

          {/* 4. Two columns */}
          <div className="grid grid-cols-2 gap-6">
            {/* Left: Recomandări AI */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-5">
                <Brain size={17} className="text-[#164B2E] dark:text-green-400" />
                <h2 className="font-heading font-semibold text-gray-900 dark:text-white">
                  Recomandări AI
                </h2>
              </div>
              {overdueAssignments.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Nicio temă restantă. Continuă tot așa!
                </p>
              ) : (
                <ul className="space-y-2">
                  {overdueAssignments.map((a) => (
                    <li
                      key={a.id}
                      className="flex items-start gap-3 bg-red-50 dark:bg-red-900/15 border border-red-100 dark:border-red-900/30 rounded-xl px-4 py-3"
                    >
                      <AlertCircle
                        size={15}
                        className="text-red-500 shrink-0 mt-0.5"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-red-700 dark:text-red-400 truncate">
                          {a.title}
                        </p>
                        <p className="text-xs text-red-500/80 dark:text-red-400/70 mt-0.5">
                          {a.subject_name} · Termen: {formatDueDate(a.due_date)}
                        </p>
                      </div>
                      <span className="shrink-0 text-[10px] font-bold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">
                        Restantă
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Right: Orarul următor */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-5">
                <Calendar
                  size={17}
                  className="text-[#164B2E] dark:text-green-400"
                />
                <h2 className="font-heading font-semibold text-gray-900 dark:text-white">
                  Orarul următor
                </h2>
              </div>
              {nextClass ? (
                <div className="flex items-start gap-4">
                  <div className="bg-[#164B2E]/10 dark:bg-[#164B2E]/20 rounded-xl p-3 shrink-0">
                    <Clock
                      size={20}
                      className="text-[#164B2E] dark:text-green-400"
                    />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-gray-900 dark:text-white">
                      {nextClass.subject_name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {formatTime(nextClass.start_time)} –{" "}
                      {formatTime(nextClass.end_time)}
                    </p>
                    {nextClass.room && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        Sala {nextClass.room}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/15 border border-green-100 dark:border-green-900/30 rounded-xl px-4 py-4">
                  <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0 text-lg">
                    🎉
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                      Ești liber!
                    </p>
                    <p className="text-xs text-green-600/80 dark:text-green-500/70 mt-0.5">
                      Nu mai ai ore pentru azi.
                    </p>
                  </div>
                </div>
              )}
            </section>
          </div>
        </main>

        {/* 5. Floating AI button */}
        <button
          className="fixed bottom-6 right-6 w-14 h-14 bg-[#164B2E] hover:bg-[#0d2819] rounded-full shadow-lg flex items-center justify-center transition-colors duration-200 z-20"
          aria-label="Tutore AI"
        >
          <Brain className="text-white" size={24} />
        </button>
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
        <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5 truncate">
          {value}
        </p>
      </div>
    </div>
  );
}
