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
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Star,
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

interface Submission {
  id: string;
  content: string | null;
  submitted_at: string;
  grade: number | null;
}

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
  subject_id: string;
  subject_name: string;
  submission: Submission | null;
}

type TabKey = "all" | "pending" | "submitted" | "overdue";
type AssignmentStatus = "pending" | "submitted" | "graded" | "overdue";

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

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "Toate" },
  { key: "pending", label: "În așteptare" },
  { key: "submitted", label: "Predate" },
  { key: "overdue", label: "Întârziate" },
];

const SUBJECT_COLORS = [
  "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
  "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300",
  "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300",
  "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
  "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300",
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function getStatus(a: Assignment): AssignmentStatus {
  if (a.submission) {
    return a.submission.grade !== null ? "graded" : "submitted";
  }
  return a.due_date < todayStr() ? "overdue" : "pending";
}

function dueDateDisplay(dateStr: string): { text: string; className: string } {
  const today = todayStr();
  if (dateStr < today) {
    return {
      text: `Termen expirat: ${formatDate(dateStr)}`,
      className: "text-red-600 dark:text-red-400",
    };
  }
  if (dateStr === today) {
    return {
      text: `Azi · ${formatDate(dateStr)}`,
      className: "text-orange-500 dark:text-orange-400",
    };
  }
  return {
    text: `Termen: ${formatDate(dateStr)}`,
    className: "text-gray-500 dark:text-gray-400",
  };
}

export default function TemePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [submissionTexts, setSubmissionTexts] = useState<
    Record<string, string>
  >({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Build a stable subject → color index map
  const [subjectColorMap, setSubjectColorMap] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    async function load() {
      const {
        data: { session },
      } = await supabaseClient.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      const uid = session.user.id;
      setUserId(uid);

      const [profileRes, enrollmentRes] = await Promise.all([
        supabaseClient
          .from("profiles")
          .select("full_name")
          .eq("id", uid)
          .single(),
        supabaseClient
          .from("class_enrollments")
          .select("class_id")
          .eq("student_id", uid)
          .single(),
      ]);

      if (profileRes.data) setProfile(profileRes.data);

      const classId = enrollmentRes.data?.class_id ?? null;

      const [assignmentsRes, submissionsRes] = await Promise.all([
        classId
          ? supabaseClient
              .from("assignments")
              .select("id, title, description, due_date, subject_id, subjects(name)")
              .eq("class_id", classId)
              .eq("is_published", true)
              .order("due_date", { ascending: true })
          : Promise.resolve({ data: [] as any[], error: null }),
        supabaseClient
          .from("assignment_submissions")
          .select("id, assignment_id, content, submitted_at, grade")
          .eq("student_id", uid),
      ]);

      // Index submissions by assignment_id
      const subMap: Record<string, Submission> = {};
      if (submissionsRes.data) {
        for (const s of submissionsRes.data as any[]) {
          subMap[s.assignment_id] = {
            id: s.id,
            content: s.content,
            submitted_at: s.submitted_at,
            grade: s.grade ?? null,
          };
        }
      }

      // Build assignments with submission status
      const rows: Assignment[] = [];
      const colorMap: Record<string, number> = {};
      let colorIdx = 0;

      if (assignmentsRes.data) {
        for (const a of assignmentsRes.data as any[]) {
          const sid = a.subject_id;
          if (!(sid in colorMap)) {
            colorMap[sid] = colorIdx % SUBJECT_COLORS.length;
            colorIdx++;
          }
          rows.push({
            id: a.id,
            title: a.title,
            description: a.description ?? null,
            due_date: a.due_date,
            subject_id: sid,
            subject_name: a.subjects?.name ?? "—",
            submission: subMap[a.id] ?? null,
          });
        }
      }

      setAssignments(rows);
      setSubjectColorMap(colorMap);
      setReady(true);
    }

    load();
  }, [router]);

  async function handleSubmitAssignment(assignmentId: string) {
    setSubmitting(assignmentId);
    setSubmitError(null);

    const content = submissionTexts[assignmentId] ?? "";

    const { data, error } = await supabaseClient
      .from("assignment_submissions")
      .insert({ assignment_id: assignmentId, student_id: userId, content })
      .select("id, content, submitted_at, grade")
      .single();

    if (error || !data) {
      setSubmitError("A apărut o eroare. Încearcă din nou.");
    } else {
      const newSub: Submission = {
        id: (data as any).id,
        content: (data as any).content,
        submitted_at: (data as any).submitted_at,
        grade: (data as any).grade ?? null,
      };
      setAssignments((prev) =>
        prev.map((a) =>
          a.id === assignmentId ? { ...a, submission: newSub } : a
        )
      );
      setExpandedId(null);
    }

    setSubmitting(null);
  }

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

  const filtered = assignments.filter((a) => {
    const status = getStatus(a);
    if (activeTab === "all") return true;
    if (activeTab === "pending") return status === "pending";
    if (activeTab === "submitted")
      return status === "submitted" || status === "graded";
    if (activeTab === "overdue") return status === "overdue";
    return true;
  });

  const tabCounts: Record<TabKey, number> = {
    all: assignments.length,
    pending: assignments.filter((a) => getStatus(a) === "pending").length,
    submitted: assignments.filter(
      (a) => getStatus(a) === "submitted" || getStatus(a) === "graded"
    ).length,
    overdue: assignments.filter((a) => getStatus(a) === "overdue").length,
  };

  return (
    <>
      <Head>
        <title>Teme — AgendAI</title>
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
              const active = href === "/teme";
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
              Teme
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {assignments.length} teme în total
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 mb-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-1 w-fit">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  activeTab === key
                    ? "bg-[#164B2E] text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                {label}
                {tabCounts[key] > 0 && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      activeTab === key
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {tabCounts[key]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Assignment list */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-4 mb-4">
                <Backpack size={28} className="text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                Nu ai teme momentan.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((a) => {
                const status = getStatus(a);
                const due = dueDateDisplay(a.due_date);
                const isExpanded = expandedId === a.id;
                const subjectColor =
                  SUBJECT_COLORS[
                    subjectColorMap[a.subject_id] ?? 0
                  ];

                return (
                  <div
                    key={a.id}
                    className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden"
                  >
                    {/* Card header */}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Subject badge + status */}
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span
                              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${subjectColor}`}
                            >
                              {a.subject_name}
                            </span>
                            <StatusBadge status={status} grade={a.submission?.grade ?? null} />
                          </div>

                          {/* Title */}
                          <h3 className="font-heading font-semibold text-gray-900 dark:text-white text-base leading-snug">
                            {a.title}
                          </h3>

                          {/* Description preview */}
                          {a.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2">
                              {a.description}
                            </p>
                          )}

                          {/* Due date */}
                          <div className={`flex items-center gap-1 mt-2.5 text-xs font-medium ${due.className}`}>
                            <Clock size={12} />
                            {due.text}
                          </div>
                        </div>

                        {/* Expand button */}
                        {status !== "graded" && (
                          <button
                            onClick={() =>
                              setExpandedId(isExpanded ? null : a.id)
                            }
                            className="flex items-center gap-1.5 text-xs font-medium text-[#164B2E] dark:text-green-400 hover:text-[#0d2819] dark:hover:text-green-300 transition-colors shrink-0 mt-0.5"
                          >
                            {isExpanded ? (
                              <>
                                Închide <ChevronUp size={14} />
                              </>
                            ) : (
                              <>
                                Vezi detalii <ChevronDown size={14} />
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expanded panel */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 dark:border-gray-700 px-5 py-4 bg-slate-50 dark:bg-gray-700/30">
                        {/* Full description */}
                        {a.description && (
                          <div className="mb-4">
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                              Descriere
                            </p>
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                              {a.description}
                            </p>
                          </div>
                        )}

                        {status === "submitted" ? (
                          <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 rounded-xl px-4 py-3 text-sm text-green-700 dark:text-green-400">
                            <CheckCircle2 size={16} />
                            Tema a fost predată. Aștepți evaluarea profesorului.
                          </div>
                        ) : (
                          <>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                              Răspunsul tău
                            </p>
                            <textarea
                              rows={4}
                              value={submissionTexts[a.id] ?? ""}
                              onChange={(e) =>
                                setSubmissionTexts((prev) => ({
                                  ...prev,
                                  [a.id]: e.target.value,
                                }))
                              }
                              placeholder="Scrie răspunsul sau soluția ta aici..."
                              className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#164B2E] transition-all duration-200 resize-none"
                            />

                            {submitError && (
                              <p className="text-xs text-red-500 mt-2">
                                {submitError}
                              </p>
                            )}

                            <div className="flex justify-end mt-3">
                              <button
                                onClick={() => handleSubmitAssignment(a.id)}
                                disabled={
                                  submitting === a.id ||
                                  !(submissionTexts[a.id] ?? "").trim()
                                }
                                className="flex items-center gap-2 bg-[#164B2E] hover:bg-[#0d2819] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl px-5 py-2.5 transition-colors duration-200"
                              >
                                <CheckCircle2 size={15} />
                                {submitting === a.id
                                  ? "Se trimite..."
                                  : "Predă tema"}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </>
  );
}

function StatusBadge({
  status,
  grade,
}: {
  status: AssignmentStatus;
  grade: number | null;
}) {
  if (status === "graded") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
        <Star size={10} />
        Notată: {grade}
      </span>
    );
  }
  if (status === "submitted") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
        <CheckCircle2 size={10} />
        Predată
      </span>
    );
  }
  if (status === "overdue") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
        <AlertCircle size={10} />
        Întârziată
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
      <Clock size={10} />
      Nepredată
    </span>
  );
}
