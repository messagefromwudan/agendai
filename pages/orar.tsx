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
  Clock,
  ChevronLeft,
  ChevronRight,
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

interface ScheduleEntry {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room: string | null;
  subject_name: string;
  professor_name: string | null;
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

// 1=Luni … 5=Vineri, matching JavaScript's getDay() for Mon–Fri
const DAYS: { dow: number; label: string; short: string }[] = [
  { dow: 1, label: "Luni", short: "L" },
  { dow: 2, label: "Marți", short: "Ma" },
  { dow: 3, label: "Miercuri", short: "Mi" },
  { dow: 4, label: "Joi", short: "J" },
  { dow: 5, label: "Vineri", short: "V" },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function formatTime(t: string): string {
  return t.slice(0, 5);
}

/** Monday of the week that contains `base` */
function weekMonday(base: Date): Date {
  const d = new Date(base);
  const dow = d.getDay(); // 0=Sun
  d.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function formatWeekRange(monday: Date): string {
  const friday = addDays(monday, 4);
  const fmtDay = (d: Date) =>
    d.toLocaleDateString("ro-RO", { day: "numeric", month: "long" });
  return `${fmtDay(monday)} – ${fmtDay(friday)} ${friday.getFullYear()}`;
}

function formatDayDate(monday: Date, dow: number): string {
  const d = addDays(monday, dow - 1);
  return d.toLocaleDateString("ro-RO", { day: "numeric", month: "short" });
}

export default function OrarPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  // weekOffset: 0 = current week, -1 = last week, +1 = next week
  const [weekOffset, setWeekOffset] = useState(0);

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

      if (classId) {
        const { data } = await supabaseClient
          .from("schedule")
          .select(
            "id, day_of_week, start_time, end_time, room, subjects(name), teacher:profiles(full_name)"
          )
          .eq("class_id", classId)
          .gte("day_of_week", 1)
          .lte("day_of_week", 5)
          .order("day_of_week")
          .order("start_time");

        if (data) {
          setSchedule(
            (data as unknown as { id: string; day_of_week: number; start_time: string; end_time: string; room: string | null; subjects?: { name: string } | null; teacher?: { full_name: string } | null; profiles?: { full_name: string } | null }[]).map((item) => ({
              id: item.id,
              day_of_week: item.day_of_week,
              start_time: item.start_time,
              end_time: item.end_time,
              room: item.room ?? null,
              subject_name: item.subjects?.name ?? "—",
              professor_name:
                item.teacher?.full_name ?? item.profiles?.full_name ?? null,
            }))
          );
        }
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

  // Week navigation
  const baseDate = addDays(new Date(), weekOffset * 7);
  const monday = weekMonday(baseDate);
  const isCurrentWeek = weekOffset === 0;

  // Today's dow (1-5), null if weekend
  const todayDow = new Date().getDay(); // 0=Sun … 6=Sat
  const todaySchoolDow = todayDow >= 1 && todayDow <= 5 ? todayDow : null;

  // Derive unique time slots from schedule, sorted
  const timeSlots = Array.from(
    new Map(
      schedule.map((e) => [`${e.start_time}|${e.end_time}`, e])
    ).values()
  )
    .map((e) => ({ start: e.start_time, end: e.end_time }))
    .sort((a, b) => a.start.localeCompare(b.start));

  // Index: dow → startTime → entry
  const byDayTime: Record<number, Record<string, ScheduleEntry>> = {};
  for (const entry of schedule) {
    if (!byDayTime[entry.day_of_week]) byDayTime[entry.day_of_week] = {};
    byDayTime[entry.day_of_week][entry.start_time] = entry;
  }

  // Next class today
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;
  const todayEntries = todaySchoolDow
    ? schedule
        .filter((e) => e.day_of_week === todaySchoolDow)
        .sort((a, b) => a.start_time.localeCompare(b.start_time))
    : [];
  const nextClass = isCurrentWeek
    ? todayEntries.find((e) => e.start_time.slice(0, 5) > currentTime) ?? null
    : null;

  return (
    <>
      <Head>
        <title>Orar — AgendAI</title>
      </Head>
      <div
        className={`${inter.variable} ${poppins.variable} font-sans flex min-h-screen bg-slate-50 dark:bg-gray-900`}
      >
        {/* ── Sidebar ── */}
        <aside className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 flex flex-col z-10">
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

          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            {MAIN_NAV.map(({ label, icon: Icon, href }) => {
              const active = href === "/orar";
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
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-white">
                Orar
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {formatWeekRange(monday)}
              </p>
            </div>

            {/* Week navigator */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setWeekOffset((w) => w - 1)}
                className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Săptămâna anterioară"
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
                aria-label="Săptămâna următoare"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Weekly grid */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden mb-6">
            {/* Day headers */}
            <div className="grid grid-cols-[72px_repeat(5,1fr)] border-b border-gray-100 dark:border-gray-700">
              {/* Empty time column header */}
              <div className="px-3 py-3 border-r border-gray-100 dark:border-gray-700" />

              {DAYS.map(({ dow, label }) => {
                const isToday = isCurrentWeek && dow === todaySchoolDow;
                const dateLabel = formatDayDate(monday, dow);
                return (
                  <div
                    key={dow}
                    className={`px-3 py-3 text-center border-r last:border-r-0 border-gray-100 dark:border-gray-700 ${
                      isToday
                        ? "bg-[#164B2E]/5 dark:bg-[#164B2E]/15"
                        : ""
                    }`}
                  >
                    <p
                      className={`text-xs font-semibold uppercase tracking-wide ${
                        isToday
                          ? "text-[#164B2E] dark:text-green-400"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {label}
                    </p>
                    <p
                      className={`text-[11px] mt-0.5 ${
                        isToday
                          ? "text-[#164B2E]/70 dark:text-green-400/70"
                          : "text-gray-400 dark:text-gray-500"
                      }`}
                    >
                      {dateLabel}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Time slot rows */}
            {timeSlots.length === 0 ? (
              <div className="py-16 text-center text-sm text-gray-400 dark:text-gray-500">
                Nicio oră programată în această săptămână.
              </div>
            ) : (
              timeSlots.map((slot, rowIdx) => (
                <div
                  key={slot.start}
                  className={`grid grid-cols-[72px_repeat(5,1fr)] ${
                    rowIdx < timeSlots.length - 1
                      ? "border-b border-gray-100 dark:border-gray-700"
                      : ""
                  }`}
                >
                  {/* Time label */}
                  <div className="flex flex-col items-center justify-center px-2 py-3 border-r border-gray-100 dark:border-gray-700 shrink-0">
                    <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500">
                      {formatTime(slot.start)}
                    </span>
                    <span className="text-[9px] text-gray-300 dark:text-gray-600 mt-0.5">
                      {formatTime(slot.end)}
                    </span>
                  </div>

                  {/* Day cells */}
                  {DAYS.map(({ dow }) => {
                    const entry = byDayTime[dow]?.[slot.start];
                    const isToday = isCurrentWeek && dow === todaySchoolDow;

                    return (
                      <div
                        key={dow}
                        className={`px-2 py-2 border-r last:border-r-0 border-gray-100 dark:border-gray-700 min-h-[72px] ${
                          isToday
                            ? "bg-[#164B2E]/5 dark:bg-[#164B2E]/10"
                            : ""
                        }`}
                      >
                        {entry ? (
                          <ClassBlock entry={entry} />
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
              <h2 className="font-heading font-semibold text-gray-900 dark:text-white mb-3 text-base">
                Ora următoare
              </h2>

              {todayEntries.length === 0 ? (
                <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/15 border border-green-100 dark:border-green-900/30 rounded-2xl px-5 py-4">
                  <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0 text-lg">
                    🎉
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                      Ești liber azi!
                    </p>
                    <p className="text-xs text-green-600/80 dark:text-green-500/70 mt-0.5">
                      Nu ai nicio oră programată pentru astăzi.
                    </p>
                  </div>
                </div>
              ) : nextClass ? (
                <div className="flex items-start gap-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl px-5 py-4">
                  <div className="bg-[#164B2E]/10 dark:bg-[#164B2E]/20 rounded-xl p-3 shrink-0">
                    <Clock size={20} className="text-[#164B2E] dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {nextClass.subject_name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {formatTime(nextClass.start_time)} – {formatTime(nextClass.end_time)}
                      {nextClass.room && ` · Sala ${nextClass.room}`}
                    </p>
                    {nextClass.professor_name && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        Prof. {nextClass.professor_name}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-slate-100 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4">
                  <div className="w-9 h-9 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center shrink-0 text-lg">
                    ✅
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Ai terminat orele pentru azi!
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Nu mai ai ore rămase astăzi.
                    </p>
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

function ClassBlock({ entry }: { entry: ScheduleEntry }) {
  return (
    <div className="h-full min-h-[56px] rounded-lg border-l-[3px] border-[#164B2E] bg-[#164B2E]/8 dark:bg-[#164B2E]/20 px-2.5 py-2 flex flex-col justify-center gap-0.5">
      <p className="text-xs font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2">
        {entry.subject_name}
      </p>
      {entry.room && (
        <p className="text-[10px] text-gray-500 dark:text-gray-400">
          Sala {entry.room}
        </p>
      )}
      {entry.professor_name && (
        <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
          {entry.professor_name}
        </p>
      )}
    </div>
  );
}
