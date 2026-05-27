import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Inter, Poppins } from "next/font/google";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { supabaseClient } from "@/lib/supabaseClient";
import ProfesorSidebar from "@/components/ProfesorSidebar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({ weight: ["600", "700"], subsets: ["latin"], variable: "--font-poppins" });

const PROF_ROLES = ["teacher", "professor"];

interface ScheduleEntry {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room: string | null;
  subject_name: string;
  class_name: string;
}

const DAYS = [
  { dow: 1, label: "Luni" },
  { dow: 2, label: "Marți" },
  { dow: 3, label: "Miercuri" },
  { dow: 4, label: "Joi" },
  { dow: 5, label: "Vineri" },
];

function formatTime(t: string) { return t.slice(0, 5); }
function weekMonday(base: Date): Date {
  const d = new Date(base);
  const dow = d.getDay();
  d.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}
function addDays(d: Date, n: number): Date {
  const r = new Date(d); r.setDate(r.getDate() + n); return r;
}
function formatWeekRange(monday: Date): string {
  const friday = addDays(monday, 4);
  const fmt = (d: Date) => d.toLocaleDateString("ro-RO", { day: "numeric", month: "long" });
  return `${fmt(monday)} – ${fmt(friday)} ${friday.getFullYear()}`;
}
function formatDayDate(monday: Date, dow: number): string {
  return addDays(monday, dow - 1).toLocaleDateString("ro-RO", { day: "numeric", month: "short" });
}

export default function ProfesorOrarPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [profName, setProfName] = useState("");
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session) { router.replace("/login"); return; }

      const { data: prof } = await supabaseClient
        .from("profiles").select("full_name, role").eq("id", session.user.id).single();
      if (!prof || !PROF_ROLES.includes(prof.role)) { router.replace("/dashboard"); return; }
      setProfName(prof.full_name);

      const { data } = await supabaseClient
        .from("schedule")
        .select("id, day_of_week, start_time, end_time, room, subjects(name), classes(name)")
        .eq("teacher_id", session.user.id)
        .gte("day_of_week", 1)
        .lte("day_of_week", 5)
        .order("day_of_week")
        .order("start_time");

      if (data) {
        setSchedule((data as any[]).map((item) => ({
          id: item.id,
          day_of_week: item.day_of_week,
          start_time: item.start_time,
          end_time: item.end_time,
          room: item.room ?? null,
          subject_name: item.subjects?.name ?? "—",
          class_name: item.classes?.name ?? "—",
        })));
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

  const baseDate = addDays(new Date(), weekOffset * 7);
  const monday = weekMonday(baseDate);
  const isCurrentWeek = weekOffset === 0;
  const todayDow = new Date().getDay();
  const todaySchoolDow = todayDow >= 1 && todayDow <= 5 ? todayDow : null;

  const timeSlots = Array.from(
    new Map(schedule.map((e) => [`${e.start_time}|${e.end_time}`, e])).values()
  ).map((e) => ({ start: e.start_time, end: e.end_time }))
    .sort((a, b) => a.start.localeCompare(b.start));

  const byDayTime: Record<number, Record<string, ScheduleEntry>> = {};
  for (const entry of schedule) {
    if (!byDayTime[entry.day_of_week]) byDayTime[entry.day_of_week] = {};
    byDayTime[entry.day_of_week][entry.start_time] = entry;
  }

  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const todayEntries = todaySchoolDow
    ? schedule.filter((e) => e.day_of_week === todaySchoolDow).sort((a, b) => a.start_time.localeCompare(b.start_time))
    : [];
  const nextClass = isCurrentWeek
    ? todayEntries.find((e) => e.start_time.slice(0, 5) > currentTime) ?? null
    : null;

  return (
    <>
      <Head><title>Orar — AgendAI</title></Head>
      <div className={`${inter.variable} ${poppins.variable} font-sans flex min-h-screen bg-slate-50 dark:bg-gray-900`}>
        <ProfesorSidebar fullName={profName} />

        <main className="ml-64 flex-1 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-white">Orar</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{formatWeekRange(monday)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setWeekOffset((w) => w - 1)}
                className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              {!isCurrentWeek && (
                <button
                  onClick={() => setWeekOffset(0)}
                  className="text-xs font-medium text-[#164B2E] dark:text-green-400 hover:underline px-2"
                >
                  Azi
                </button>
              )}
              <button
                onClick={() => setWeekOffset((w) => w + 1)}
                className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Weekly grid */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden mb-6">
            {/* Day headers */}
            <div className="grid grid-cols-[72px_repeat(5,1fr)] border-b border-gray-100 dark:border-gray-700">
              <div className="px-3 py-3 border-r border-gray-100 dark:border-gray-700" />
              {DAYS.map(({ dow, label }) => {
                const isToday = isCurrentWeek && dow === todaySchoolDow;
                return (
                  <div
                    key={dow}
                    className={`px-3 py-3 text-center border-r last:border-r-0 border-gray-100 dark:border-gray-700 ${isToday ? "bg-[#164B2E]/5 dark:bg-[#164B2E]/15" : ""}`}
                  >
                    <p className={`text-xs font-semibold uppercase tracking-wide ${isToday ? "text-[#164B2E] dark:text-green-400" : "text-gray-500 dark:text-gray-400"}`}>
                      {label}
                    </p>
                    <p className={`text-[11px] mt-0.5 ${isToday ? "text-[#164B2E]/70 dark:text-green-400/70" : "text-gray-400 dark:text-gray-500"}`}>
                      {formatDayDate(monday, dow)}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Time slot rows */}
            {timeSlots.length === 0 ? (
              <div className="py-16 text-center text-sm text-gray-400 dark:text-gray-500">
                Nicio oră programată.
              </div>
            ) : (
              timeSlots.map((slot, rowIdx) => (
                <div
                  key={slot.start}
                  className={`grid grid-cols-[72px_repeat(5,1fr)] ${rowIdx < timeSlots.length - 1 ? "border-b border-gray-100 dark:border-gray-700" : ""}`}
                >
                  <div className="flex flex-col items-center justify-center px-2 py-3 border-r border-gray-100 dark:border-gray-700 shrink-0">
                    <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500">{formatTime(slot.start)}</span>
                    <span className="text-[9px] text-gray-300 dark:text-gray-600 mt-0.5">{formatTime(slot.end)}</span>
                  </div>
                  {DAYS.map(({ dow }) => {
                    const entry = byDayTime[dow]?.[slot.start];
                    const isToday = isCurrentWeek && dow === todaySchoolDow;
                    return (
                      <div
                        key={dow}
                        className={`px-2 py-2 border-r last:border-r-0 border-gray-100 dark:border-gray-700 min-h-[72px] ${isToday ? "bg-[#164B2E]/5 dark:bg-[#164B2E]/10" : ""}`}
                      >
                        {entry ? (
                          <div className="h-full min-h-[56px] rounded-lg border-l-[3px] border-[#164B2E] bg-[#164B2E]/8 dark:bg-[#164B2E]/20 px-2.5 py-2 flex flex-col justify-center gap-0.5">
                            <p className="text-xs font-semibold text-gray-900 dark:text-white leading-snug line-clamp-1">{entry.subject_name}</p>
                            <p className="text-[10px] font-medium text-[#164B2E] dark:text-green-400">{entry.class_name}</p>
                            {entry.room && <p className="text-[10px] text-gray-500 dark:text-gray-400">Sala {entry.room}</p>}
                          </div>
                        ) : (
                          <div className="w-full h-full min-h-[56px] rounded-lg bg-gray-50 dark:bg-gray-700/30" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Ora următoare */}
          {isCurrentWeek && (
            <div>
              <h2 className="font-heading font-semibold text-gray-900 dark:text-white mb-3 text-base">Ora următoare</h2>
              {todayEntries.length === 0 ? (
                <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/15 border border-green-100 dark:border-green-900/30 rounded-2xl px-5 py-4">
                  <span className="text-lg">🎉</span>
                  <div>
                    <p className="text-sm font-semibold text-green-700 dark:text-green-400">Ești liber azi!</p>
                    <p className="text-xs text-green-600/80 dark:text-green-500/70 mt-0.5">Nu ai nicio oră programată pentru astăzi.</p>
                  </div>
                </div>
              ) : nextClass ? (
                <div className="flex items-start gap-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl px-5 py-4">
                  <div className="bg-[#164B2E]/10 dark:bg-[#164B2E]/20 rounded-xl p-3 shrink-0">
                    <Clock size={20} className="text-[#164B2E] dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{nextClass.subject_name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {formatTime(nextClass.start_time)} – {formatTime(nextClass.end_time)}
                      {nextClass.room && ` · Sala ${nextClass.room}`}
                    </p>
                    <p className="text-xs text-[#164B2E] dark:text-green-400 mt-0.5 font-medium">Clasa {nextClass.class_name}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-slate-100 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4">
                  <span className="text-lg">✅</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Ai terminat orele pentru azi!</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Nu mai ai ore rămase astăzi.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
