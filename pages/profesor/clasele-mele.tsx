import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { Inter, Poppins } from "next/font/google";
import { Users, ChevronRight } from "lucide-react";
import { supabaseClient } from "@/lib/supabaseClient";
import ProfesorSidebar from "@/components/ProfesorSidebar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({ weight: ["600", "700"], subsets: ["latin"], variable: "--font-poppins" });

const PROF_ROLES = ["teacher", "professor"];

interface ProfProfile { full_name: string; role: string; }
interface ClassCard {
  classId: string; className: string; gradeLevel: number;
  subjectId: string; subjectName: string; studentCount: number;
}

export default function ClasEleMelePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<ProfProfile | null>(null);
  const [cards, setCards] = useState<ClassCard[]>([]);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session) { router.replace("/login"); return; }

      const { data: prof } = await supabaseClient
        .from("profiles").select("full_name, role").eq("id", session.user.id).single();
      if (!prof || !PROF_ROLES.includes(prof.role)) { router.replace("/dashboard"); return; }
      setProfile(prof);

      const { data: csRows } = await supabaseClient
        .from("class_subjects")
        .select("class_id, subject_id, subjects(name), classes(id, name, grade_level)")
        .eq("teacher_id", session.user.id);

      if (!csRows || csRows.length === 0) { setReady(true); return; }

      const classIds = (csRows as any[]).map((r) => r.class_id);
      const { data: enrollData } = await supabaseClient
        .from("class_enrollments")
        .select("class_id")
        .in("class_id", classIds);

      const countMap: Record<string, number> = {};
      for (const e of (enrollData ?? []) as { class_id: string }[]) {
        countMap[e.class_id] = (countMap[e.class_id] ?? 0) + 1;
      }

      setCards(
        (csRows as any[]).map((r) => ({
          classId: r.class_id,
          className: r.classes?.name ?? "—",
          gradeLevel: r.classes?.grade_level ?? 0,
          subjectId: r.subject_id,
          subjectName: r.subjects?.name ?? "—",
          studentCount: countMap[r.class_id] ?? 0,
        })).sort((a, b) => a.gradeLevel - b.gradeLevel || a.className.localeCompare(b.className))
      );

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

  return (
    <>
      <Head><title>Clasele mele — AgendAI</title></Head>
      <div className={`${inter.variable} ${poppins.variable} font-sans flex min-h-screen bg-slate-50 dark:bg-gray-900`}>
        <ProfesorSidebar fullName={profile?.full_name ?? ""} />

        <main className="ml-64 flex-1 p-8">
          <div className="mb-6">
            <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-white">Clasele mele</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {cards.length} {cards.length === 1 ? "clasă" : "clase"} · {new Set(cards.map((c) => c.subjectName)).size} materii
            </p>
          </div>

          {cards.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 px-5 py-16 text-center">
              <p className="text-gray-400 dark:text-gray-500 text-sm">Nu predai nicio clasă momentan.</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Contactează administratorul pentru a fi asociat cu o clasă.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-5">
              {cards.map((card, i) => (
                <Link
                  key={i}
                  href={`/profesor/clasa/${card.classId}?subject=${card.subjectId}`}
                  className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 hover:border-[#164B2E]/30 dark:hover:border-green-700/40 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-[#164B2E]/10 dark:bg-[#164B2E]/20 rounded-xl px-3 py-1.5">
                      <span className="font-bold text-[#164B2E] dark:text-green-400 text-sm">{card.className}</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 dark:text-gray-600 group-hover:text-[#164B2E] dark:group-hover:text-green-400 transition-colors mt-1" />
                  </div>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">{card.subjectName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Clasa {card.gradeLevel}</p>
                  <div className="flex items-center gap-1.5 mt-4 text-xs text-gray-500 dark:text-gray-400">
                    <Users size={13} />
                    {card.studentCount} {card.studentCount === 1 ? "elev" : "elevi"}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
