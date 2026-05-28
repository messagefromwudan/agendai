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
}

interface GradeEntry {
  id: string;
  value: number;
  grade_type: string;
  created_at: string;
}

interface SubjectCard {
  id: string;
  name: string;
  grades: GradeEntry[];
  average: number | null;
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

function getSchoolYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  return now.getMonth() + 1 >= 9
    ? `${year}–${year + 1}`
    : `${year - 1}–${year}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "short",
    year: "numeric",
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

const GRADE_TYPE_LABELS: Record<string, string> = {
  current: "Curentă",
  semester: "Semestrială",
  annual: "Anuală",
  exam: "Examen",
};

const GRADE_TYPE_STYLES: Record<string, string> = {
  current: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  semester:
    "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  annual:
    "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
  exam: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
};

export default function CatalogPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subjects, setSubjects] = useState<SubjectCard[]>([]);
  const [overallAverage, setOverallAverage] = useState<number | null>(null);
  const [totalGrades, setTotalGrades] = useState(0);

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
          .select("full_name")
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

      const [subjectsRes, gradesRes] = await Promise.all([
        classId
          ? supabaseClient
              .from("class_subjects")
              .select("subject_id, subjects(id, name)")
              .eq("class_id", classId)
          : Promise.resolve({ data: [] as unknown as { subject_id: string; subjects?: { id: string; name: string } | null }[], error: null }),
        supabaseClient
          .from("grades")
          .select("id, subject_id, grade, grade_type, created_at")
          .eq("student_id", userId)
          .order("created_at", { ascending: false }),
      ]);

      // Group grades by subject_id
      const gradesBySubject: Record<string, GradeEntry[]> = {};
      if (gradesRes.data) {
        for (const g of gradesRes.data as { id: string; subject_id: string; grade: number; grade_type: string | null; created_at: string }[]) {
          const sid = g.subject_id;
          if (!gradesBySubject[sid]) gradesBySubject[sid] = [];
          gradesBySubject[sid].push({
            id: g.id,
            value: g.grade,
            grade_type: g.grade_type ?? "current",
            created_at: g.created_at,
          });
        }
      }

      // Build subject cards
      const cards: SubjectCard[] = [];
      if (subjectsRes.data) {
        for (const row of subjectsRes.data as unknown as { subject_id: string; subjects?: { id: string; name: string } | null }[]) {
          const subjectId = row.subject_id ?? row.subjects?.id;
          const subjectName = row.subjects?.name ?? "—";
          const gradeList = gradesBySubject[subjectId] ?? [];
          const avg =
            gradeList.length > 0
              ? Math.round(
                  (gradeList.reduce((s, g) => s + g.value, 0) /
                    gradeList.length) *
                    100
                ) / 100
              : null;
          cards.push({
            id: subjectId,
            name: subjectName,
            grades: gradeList,
            average: avg,
          });
        }
      }

      // Sort: subjects with grades first, then alphabetically
      cards.sort((a, b) => {
        if (a.grades.length > 0 && b.grades.length === 0) return -1;
        if (a.grades.length === 0 && b.grades.length > 0) return 1;
        return a.name.localeCompare(b.name, "ro");
      });

      setSubjects(cards);

      // Overall stats
      const allGrades = cards.flatMap((c) => c.grades);
      setTotalGrades(allGrades.length);
      if (allGrades.length > 0) {
        const sum = allGrades.reduce((s, g) => s + g.value, 0);
        setOverallAverage(Math.round((sum / allGrades.length) * 100) / 100);
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

  const initials = profile?.full_name ? getInitials(profile.full_name) : "?";

  return (
    <>
      <Head>
        <title>Catalog — AgendAI</title>
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
              const active = href === "/catalog";
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
            {BOTTOM_NAV.map(({ label, icon: Icon, href }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
              >
                <Icon size={17} />
                {label}
              </Link>
            ))}
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
        <main className="ml-64 flex-1 p-8">
          {/* Page header */}
          <div className="mb-6">
            <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-white">
              Catalog
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Anul școlar {getSchoolYear()}
            </p>
          </div>

          {/* Summary bar */}
          <div className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 px-6 py-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-[#164B2E]/10 dark:bg-[#164B2E]/20 rounded-xl p-2.5">
                <BookOpen
                  size={18}
                  className="text-[#164B2E] dark:text-green-400"
                />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Media generală
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white font-heading leading-tight">
                  {overallAverage !== null ? overallAverage.toFixed(2) : "—"}
                </p>
              </div>
            </div>

            <div className="w-px h-10 bg-gray-100 dark:bg-gray-700 mx-2" />

            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Total note
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white font-heading leading-tight">
                {totalGrades}
              </p>
            </div>

            <div className="w-px h-10 bg-gray-100 dark:bg-gray-700 mx-2" />

            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Materii
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white font-heading leading-tight">
                {subjects.length}
              </p>
            </div>
          </div>

          {/* Subject cards grid */}
          {subjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-4 mb-4">
                <BookOpen size={28} className="text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                Nicio materie înscrisă momentan.
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Contactează dirigintele pentru a fi înscris într-o clasă.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5">
              {subjects.map((subject) => (
                <SubjectCardComponent key={subject.id} subject={subject} />
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}

function SubjectCardComponent({ subject }: { subject: SubjectCard }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 flex flex-col">
      {/* Subject name */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading font-semibold text-gray-900 dark:text-white text-base">
          {subject.name}
        </h2>
        {subject.average !== null && (
          <span className="text-xs font-semibold bg-[#164B2E]/10 dark:bg-[#164B2E]/25 text-[#164B2E] dark:text-green-400 px-2.5 py-1 rounded-full">
            Media: {subject.average.toFixed(2)}
          </span>
        )}
      </div>

      {/* Grades list */}
      {subject.grades.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 flex-1">
          Nicio notă încă.
        </p>
      ) : (
        <ul className="flex-1 space-y-2 mb-4">
          {subject.grades.map((g, i) => (
            <li
              key={g.id}
              className={`flex items-center justify-between gap-3 py-2 ${
                i < subject.grades.length - 1
                  ? "border-b border-gray-50 dark:border-gray-700/60"
                  : ""
              }`}
            >
              {/* Grade value */}
              <span className="text-2xl font-bold text-gray-900 dark:text-white font-heading w-8 shrink-0">
                {g.value}
              </span>

              {/* Badge + date */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                    GRADE_TYPE_STYLES[g.grade_type] ?? GRADE_TYPE_STYLES.current
                  }`}
                >
                  {GRADE_TYPE_LABELS[g.grade_type] ?? g.grade_type}
                </span>
              </div>

              <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                {formatDate(g.created_at)}
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* Average footer */}
      {subject.grades.length > 0 && (
        <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Medie materie
          </span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            {subject.average?.toFixed(2) ?? "—"}
          </span>
        </div>
      )}
    </div>
  );
}
