import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { Inter, Poppins } from "next/font/google";
import { Users, GraduationCap, ClipboardList, TrendingUp, BookOpen } from "lucide-react";
import { supabaseClient } from "@/lib/supabaseClient";
import ProfesorSidebar from "@/components/ProfesorSidebar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({ weight: ["600", "700"], subsets: ["latin"], variable: "--font-poppins" });

const PROF_ROLES = ["teacher", "professor"];

interface ProfProfile { full_name: string; role: string; school_id: string; }
interface ClassCard { classId: string; className: string; subjectId: string; subjectName: string; studentCount: number; }
interface PendingItem { submissionId: string; studentName: string; assignmentTitle: string; className: string; subjectName: string; }

export default function ProfesorDashboard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<ProfProfile | null>(null);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalClasses, setTotalClasses] = useState(0);
  const [pendingGrading, setPendingGrading] = useState(0);
  const [avgGrade, setAvgGrade] = useState<number | null>(null);
  const [classCards, setClassCards] = useState<ClassCard[]>([]);
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session) { router.replace("/login"); return; }

      const { data: prof } = await supabaseClient
        .from("profiles").select("full_name, role, school_id").eq("id", session.user.id).single();

      if (!prof || !PROF_ROLES.includes(prof.role)) { router.replace("/dashboard"); return; }
      setProfile(prof);

      const userId = session.user.id;

      // Get all class_subjects the professor teaches
      const { data: csRows } = await supabaseClient
        .from("class_subjects")
        .select("class_id, subject_id, subjects(name), classes(name)")
        .eq("teacher_id", userId);

      if (!csRows || csRows.length === 0) { setReady(true); return; }

      const classIds = Array.from(new Set((csRows as any[]).map((r) => r.class_id)));
      const subjectIds = Array.from(new Set((csRows as any[]).map((r) => r.subject_id)));

      // Enrollments for student count
      const { data: enrollRows } = await supabaseClient
        .from("class_enrollments")
        .select("class_id, student_id")
        .in("class_id", classIds);

      const enrollData = (enrollRows ?? []) as { class_id: string; student_id: string }[];
      const countPerClass: Record<string, number> = {};
      const allStudentIds = new Set<string>();
      for (const e of enrollData) {
        countPerClass[e.class_id] = (countPerClass[e.class_id] ?? 0) + 1;
        allStudentIds.add(e.student_id);
      }

      setTotalStudents(allStudentIds.size);
      setTotalClasses(classIds.length);

      // Build class cards
      const cards: ClassCard[] = (csRows as any[]).map((r) => ({
        classId: r.class_id,
        className: r.classes?.name ?? "—",
        subjectId: r.subject_id,
        subjectName: r.subjects?.name ?? "—",
        studentCount: countPerClass[r.class_id] ?? 0,
      }));
      setClassCards(cards);

      // Average grade across professor's subjects
      if (allStudentIds.size > 0 && subjectIds.length > 0) {
        const { data: gradesData } = await supabaseClient
          .from("grades")
          .select("grade")
          .in("subject_id", subjectIds)
          .in("student_id", Array.from(allStudentIds));

        const grades = (gradesData ?? []) as { grade: number }[];
        if (grades.length > 0) {
          const sum = grades.reduce((s, g) => s + g.grade, 0);
          setAvgGrade(Math.round((sum / grades.length) * 100) / 100);
        }
      }

      // Pending grading: submissions with no grade for assignments in professor's classes
      const { data: assignData } = await supabaseClient
        .from("assignments")
        .select("id, title, class_id, subject_id")
        .in("class_id", classIds)
        .in("subject_id", subjectIds);

      const assignments = (assignData ?? []) as { id: string; title: string; class_id: string; subject_id: string }[];
      const assignIds = assignments.map((a) => a.id);

      if (assignIds.length > 0) {
        const { data: subData } = await supabaseClient
          .from("assignment_submissions")
          .select("id, assignment_id, student_id, profiles(full_name)")
          .in("assignment_id", assignIds)
          .is("grade", null)
          .order("submitted_at", { ascending: false })
          .limit(10);

        const subs = (subData ?? []) as any[];
        setPendingGrading(subs.length);

        const assignMap: Record<string, { title: string; class_id: string; subject_id: string }> = {};
        for (const a of assignments) assignMap[a.id] = a;

        const classNameMap: Record<string, string> = {};
        const subjectNameMap: Record<string, string> = {};
        for (const r of (csRows as any[])) {
          classNameMap[r.class_id] = r.classes?.name ?? "—";
          subjectNameMap[r.subject_id] = r.subjects?.name ?? "—";
        }

        setPendingItems(
          subs.map((s) => ({
            submissionId: s.id,
            studentName: (s.profiles as any)?.full_name ?? "—",
            assignmentTitle: assignMap[s.assignment_id]?.title ?? "—",
            className: classNameMap[assignMap[s.assignment_id]?.class_id ?? ""] ?? "—",
            subjectName: subjectNameMap[assignMap[s.assignment_id]?.subject_id ?? ""] ?? "—",
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
        <div className="text-sm text-gray-400 animate-pulse">Se încarcă...</div>
      </div>
    );
  }

  const firstName = profile?.full_name?.split(" ")[0] ?? "Profesor";

  return (
    <>
      <Head><title>Dashboard Profesor — AgendAI</title></Head>
      <div className={`${inter.variable} ${poppins.variable} font-sans flex min-h-screen bg-slate-50 dark:bg-gray-900`}>
        <ProfesorSidebar fullName={profile?.full_name ?? ""} />

        <main className="ml-64 flex-1 p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-white">
              Bine ai revenit, {firstName}!
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Panou profesor
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-5 mb-8">
            <StatCard label="Elevi predați" value={String(totalStudents)} icon={Users} iconColor="text-blue-500" iconBg="bg-blue-50 dark:bg-blue-900/20" />
            <StatCard label="Clase" value={String(totalClasses)} icon={GraduationCap} iconColor="text-purple-500" iconBg="bg-purple-50 dark:bg-purple-900/20" />
            <StatCard label="Teme de notat" value={String(pendingGrading)} icon={ClipboardList} iconColor="text-orange-500" iconBg="bg-orange-50 dark:bg-orange-900/20" />
            <StatCard label="Medie generală" value={avgGrade !== null ? avgGrade.toFixed(2) : "—"} icon={TrendingUp} iconColor="text-[#164B2E] dark:text-green-400" iconBg="bg-green-50 dark:bg-green-900/20" />
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Clasele mele */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <GraduationCap size={17} className="text-[#164B2E] dark:text-green-400" />
                  <h2 className="font-heading font-semibold text-gray-900 dark:text-white">Clasele mele</h2>
                </div>
                <Link href="/profesor/clasele-mele" className="text-xs text-[#164B2E] dark:text-green-400 hover:underline font-medium">
                  Vezi toate
                </Link>
              </div>
              {classCards.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500">Nu predai nicio clasă momentan.</p>
              ) : (
                <div className="space-y-2">
                  {classCards.slice(0, 5).map((c, i) => (
                    <Link
                      key={i}
                      href={`/profesor/clasa/${c.classId}?subject=${c.subjectId}`}
                      className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl px-4 py-3 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{c.className}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{c.subjectName}</p>
                      </div>
                      <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Users size={12} /> {c.studentCount}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Teme de notat */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-5">
                <ClipboardList size={17} className="text-[#164B2E] dark:text-green-400" />
                <h2 className="font-heading font-semibold text-gray-900 dark:text-white">Teme de notat</h2>
              </div>
              {pendingItems.length === 0 ? (
                <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/15 border border-green-100 dark:border-green-900/30 rounded-xl px-4 py-4">
                  <span className="text-lg">✅</span>
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">
                    Toate temele sunt notate!
                  </p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {pendingItems.map((item) => (
                    <li key={item.submissionId} className="flex items-start gap-3 bg-orange-50 dark:bg-orange-900/15 border border-orange-100 dark:border-orange-900/30 rounded-xl px-4 py-3">
                      <BookOpen size={14} className="text-orange-500 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-orange-700 dark:text-orange-400 truncate">
                          {item.assignmentTitle}
                        </p>
                        <p className="text-xs text-orange-500/80 dark:text-orange-400/70 mt-0.5">
                          {item.studentName} · {item.className} · {item.subjectName}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </main>
      </div>
    </>
  );
}

interface StatCardProps {
  label: string; value: string;
  icon: React.ElementType; iconColor: string; iconBg: string;
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
