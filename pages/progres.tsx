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
  Zap,
  Layers,
  Activity,
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
  current_streak: number;
  total_xp: number;
  thinking_credits: number;
}

interface SubjectProgress {
  id: string;
  name: string;
  mastery_score: number;
  sessions_count: number;
  cards_mastered: number;
  total_cards: number;
}

interface LearningEvent {
  id: string;
  event_type: string;
  subject_name: string | null;
  topic_name: string | null;
  created_at: string;
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

const EVENT_LABELS: Record<string, string> = {
  session_completed: "Sesiune finalizată",
  card_mastered: "Card stăpânit",
  streak_extended: "Streak extins",
  quiz_completed: "Test completat",
  lesson_completed: "Lecție finalizată",
  topic_completed: "Temă finalizată",
  xp_earned: "XP câștigat",
};

const EVENT_COLORS: Record<string, string> = {
  session_completed: "bg-blue-500",
  card_mastered: "bg-green-500",
  streak_extended: "bg-orange-500",
  quiz_completed: "bg-purple-500",
  lesson_completed: "bg-teal-500",
  topic_completed: "bg-[#164B2E]",
  xp_earned: "bg-yellow-500",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getLast30Days(): string[] {
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split("T")[0];
  });
}

function masteryColor(score: number): string {
  if (score >= 70) return "bg-[#164B2E]";
  if (score >= 40) return "bg-orange-400";
  return "bg-red-400";
}

function masteryLabel(score: number): string {
  if (score >= 70) return "Avansat";
  if (score >= 40) return "Mediu";
  return "Începător";
}

export default function ProgresPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subjectProgress, setSubjectProgress] = useState<SubjectProgress[]>([]);
  const [events, setEvents] = useState<LearningEvent[]>([]);
  const [activeDays, setActiveDays] = useState<Set<string>>(new Set());

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

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
      const sinceDate = thirtyDaysAgo.toISOString().split("T")[0];

      const [profileRes, topicProgressRes, eventsRes, streakLogRes] =
        await Promise.all([
          supabaseClient
            .from("profiles")
            .select("full_name, current_streak, total_xp, thinking_credits")
            .eq("id", userId)
            .single(),
          supabaseClient
            .from("topic_progress")
            .select(
              "id, subject_id, mastery_score, sessions_count, cards_mastered, total_cards, subjects(name)"
            )
            .eq("user_id", userId),
          supabaseClient
            .from("learning_events")
            .select(
              "id, event_type, created_at, subjects(name), topics(name)"
            )
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(10),
          supabaseClient
            .from("streak_log")
            .select("date")
            .eq("user_id", userId)
            .gte("date", sinceDate),
        ]);

      if (profileRes.data) setProfile(profileRes.data as Profile);

      // Group topic_progress by subject
      if (topicProgressRes.data) {
        const subMap: Record<
          string,
          {
            name: string;
            scores: number[];
            sessions: number;
            mastered: number;
            total: number;
          }
        > = {};
        for (const row of topicProgressRes.data as unknown as { subject_id: string; subjects?: { name: string } | null; mastery_score: number | null; sessions_count: number | null; cards_mastered: number | null; total_cards: number | null }[]) {
          const sid = row.subject_id;
          if (!subMap[sid]) {
            subMap[sid] = {
              name: row.subjects?.name ?? "—",
              scores: [],
              sessions: 0,
              mastered: 0,
              total: 0,
            };
          }
          subMap[sid].scores.push(row.mastery_score ?? 0);
          subMap[sid].sessions += row.sessions_count ?? 0;
          subMap[sid].mastered += row.cards_mastered ?? 0;
          subMap[sid].total += row.total_cards ?? 0;
        }
        setSubjectProgress(
          Object.entries(subMap)
            .map(([id, s]) => ({
              id,
              name: s.name,
              mastery_score:
                s.scores.length > 0
                  ? Math.round(
                      s.scores.reduce((a, b) => a + b, 0) / s.scores.length
                    )
                  : 0,
              sessions_count: s.sessions,
              cards_mastered: s.mastered,
              total_cards: s.total,
            }))
            .sort((a, b) => b.mastery_score - a.mastery_score)
        );
      }

      // Learning events
      if (eventsRes.data) {
        setEvents(
          (eventsRes.data as unknown as { id: string; event_type: string; subjects?: { name: string } | null; topics?: { name: string } | null; created_at: string }[]).map((e) => ({
            id: e.id,
            event_type: e.event_type,
            subject_name: e.subjects?.name ?? null,
            topic_name: e.topics?.name ?? null,
            created_at: e.created_at,
          }))
        );
      }

      // Streak log
      if (streakLogRes.data) {
        setActiveDays(
          new Set((streakLogRes.data as { date: string }[]).map((r) => r.date))
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

  const initials = profile?.full_name ? getInitials(profile.full_name) : "?";
  const last30Days = getLast30Days();

  return (
    <>
      <Head>
        <title>Progres — AgendAI</title>
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
              const active = href === "/progres";
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
          <div className="mb-6">
            <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-white">
              Progres
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Urmărește evoluția ta de învățare
            </p>
          </div>

          {/* ── 1. Top stats row ── */}
          <div className="grid grid-cols-3 gap-5 mb-8">
            <StatCard
              label="Streak curent"
              value={`${profile?.current_streak ?? 0} zile`}
              icon={Flame}
              iconColor="text-orange-500"
              iconBg="bg-orange-50 dark:bg-orange-900/20"
              note={
                (profile?.current_streak ?? 0) > 0
                  ? "Continuă tot așa!"
                  : "Începe azi!"
              }
            />
            <StatCard
              label="Total XP"
              value={String(profile?.total_xp ?? 0)}
              icon={Zap}
              iconColor="text-yellow-500"
              iconBg="bg-yellow-50 dark:bg-yellow-900/20"
              note="Puncte de experiență"
            />
            <StatCard
              label="Credite Tuto"
              value={String(profile?.thinking_credits ?? 0)}
              icon={Brain}
              iconColor="text-[#164B2E] dark:text-green-400"
              iconBg="bg-green-50 dark:bg-green-900/20"
              note="Sesiuni AI disponibile"
            />
          </div>

          {/* ── 2. Tuto Activity ── */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Layers size={18} className="text-[#164B2E] dark:text-green-400" />
              <h2 className="font-heading font-semibold text-gray-900 dark:text-white text-lg">
                Activitate Tuto
              </h2>
            </div>

            {subjectProgress.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 text-center">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-4 inline-flex mb-4">
                  <Brain size={28} className="text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  Nu ai activitate Tuto încă.
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Începe să înveți cu tutorele AI!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {subjectProgress.map((s) => (
                  <div
                    key={s.id}
                    className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5"
                  >
                    {/* Subject name + level */}
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-heading font-semibold text-gray-900 dark:text-white text-sm">
                        {s.name}
                      </h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${masteryColor(s.mastery_score)}`}
                      >
                        {masteryLabel(s.mastery_score)}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Stăpânire
                        </span>
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          {s.mastery_score}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${masteryColor(s.mastery_score)}`}
                          style={{ width: `${s.mastery_score}%` }}
                        />
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-50 dark:border-gray-700">
                      <div className="text-center">
                        <p className="text-base font-bold text-gray-900 dark:text-white">
                          {s.sessions_count}
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                          Sesiuni
                        </p>
                      </div>
                      <div className="text-center border-x border-gray-100 dark:border-gray-700">
                        <p className="text-base font-bold text-gray-900 dark:text-white">
                          {s.cards_mastered}
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                          Stăpânite
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-base font-bold text-gray-900 dark:text-white">
                          {s.total_cards > 0
                            ? `${Math.round((s.cards_mastered / s.total_cards) * 100)}%`
                            : "—"}
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                          Completat
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── 3 & 4. Bottom two columns: events + streak ── */}
          <div className="grid grid-cols-2 gap-6">
            {/* Learning events timeline */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-5">
                <Activity
                  size={17}
                  className="text-[#164B2E] dark:text-green-400"
                />
                <h2 className="font-heading font-semibold text-gray-900 dark:text-white">
                  Activitate recentă
                </h2>
              </div>

              {events.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Nicio activitate înregistrată.
                </p>
              ) : (
                <ol className="relative">
                  {events.map((e, i) => {
                    const dotColor =
                      EVENT_COLORS[e.event_type] ?? "bg-gray-400";
                    const label =
                      EVENT_LABELS[e.event_type] ?? e.event_type;
                    const isLast = i === events.length - 1;
                    return (
                      <li key={e.id} className="flex gap-3 pb-4 last:pb-0">
                        {/* Timeline line + dot */}
                        <div className="flex flex-col items-center shrink-0">
                          <div
                            className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${dotColor}`}
                          />
                          {!isLast && (
                            <div className="w-px flex-1 bg-gray-100 dark:bg-gray-700 mt-1" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="min-w-0 pb-1">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-100 leading-snug">
                            {label}
                          </p>
                          {(e.subject_name || e.topic_name) && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                              {[e.subject_name, e.topic_name]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                          )}
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                            {formatDateTime(e.created_at)}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </section>

            {/* Streak calendar */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Flame
                    size={17}
                    className="text-orange-500"
                  />
                  <h2 className="font-heading font-semibold text-gray-900 dark:text-white">
                    Istoric streak
                  </h2>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  Ultimele 30 zile
                </span>
              </div>

              {/* Calendar grid: 6 cols × 5 rows */}
              <div className="grid grid-cols-6 gap-1.5 mb-4">
                {last30Days.map((date) => {
                  const isActive = activeDays.has(date);
                  const isToday =
                    date === new Date().toISOString().split("T")[0];
                  return (
                    <div
                      key={date}
                      title={date}
                      className={`aspect-square rounded-md transition-colors ${
                        isActive
                          ? "bg-[#164B2E] dark:bg-[#164B2E]"
                          : "bg-gray-100 dark:bg-gray-700"
                      } ${isToday ? "ring-2 ring-orange-400 ring-offset-1 dark:ring-offset-gray-800" : ""}`}
                    />
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-700" />
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    Inactiv
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-[#164B2E]" />
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    Activ
                  </span>
                </div>
                <div className="flex items-center gap-1.5 ml-auto">
                  <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-700 ring-2 ring-orange-400" />
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    Azi
                  </span>
                </div>
              </div>

              {/* Active day count */}
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {activeDays.size}
                </span>{" "}
                {activeDays.size === 1 ? "zi activă" : "zile active"} din
                ultimele 30
              </p>
            </section>
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
  note: string;
}

function StatCard({
  label,
  value,
  icon: Icon,
  iconColor,
  iconBg,
  note,
}: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 flex items-start gap-4">
      <div className={`${iconBg} rounded-xl p-3 shrink-0`}>
        <Icon size={22} className={iconColor} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5 font-heading">
          {value}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
          {note}
        </p>
      </div>
    </div>
  );
}
