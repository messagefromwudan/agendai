import { useEffect, useRef, useState } from "react";
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
  Send,
  Plus,
  Zap,
  ChevronDown,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
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
}

interface Subject {
  id: string;
  name: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
  error?: boolean;
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

const SUGGESTION_CHIPS = [
  "Explică-mi o lecție",
  "Ajutor cu tema",
  "Pregătire pentru test",
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

const MarkdownComponents = {
  p: ({ children }: any) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
  h1: ({ children }: any) => <p className="font-bold text-base mb-2 mt-1">{children}</p>,
  h2: ({ children }: any) => <p className="font-semibold mb-1.5 mt-1">{children}</p>,
  h3: ({ children }: any) => <p className="font-semibold mb-1 mt-0.5">{children}</p>,
  ul: ({ children }: any) => <ul className="list-disc ml-5 mb-2 space-y-0.5">{children}</ul>,
  ol: ({ children }: any) => <ol className="list-decimal ml-5 mb-2 space-y-0.5">{children}</ol>,
  li: ({ children }: any) => <li className="leading-relaxed">{children}</li>,
  pre: ({ children }: any) => (
    <pre className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg p-3 text-xs font-mono overflow-x-auto mb-2">
      {children}
    </pre>
  ),
  code: ({ className, children }: any) => (
    <code
      className={
        className
          ? className
          : "bg-black/8 dark:bg-white/8 px-1 py-0.5 rounded text-[0.8em] font-mono"
      }
    >
      {children}
    </code>
  ),
  strong: ({ children }: any) => <strong className="font-semibold">{children}</strong>,
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-2 border-gray-300 dark:border-gray-600 pl-3 my-2 italic text-gray-500 dark:text-gray-400">
      {children}
    </blockquote>
  ),
};

export default function TutorePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [credits, setCredits] = useState(0);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [subjectOpen, setSubjectOpen] = useState(false);
  const [sendError, setSendError] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
          .select("full_name, thinking_credits")
          .eq("id", userId)
          .single(),
        supabaseClient
          .from("class_enrollments")
          .select("class_id")
          .eq("student_id", userId)
          .single(),
      ]);

      if (profileRes.data) {
        setProfile(profileRes.data);
        setCredits(profileRes.data.thinking_credits ?? 0);
      }

      const classId = enrollmentRes.data?.class_id ?? null;

      const [subjectsRes, latestSessionRes] = await Promise.all([
        classId
          ? supabaseClient
              .from("class_subjects")
              .select("subject_id, subjects(id, name)")
              .eq("class_id", classId)
          : Promise.resolve({ data: [] as any[], error: null }),
        supabaseClient
          .from("chat_sessions")
          .select("id")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1),
      ]);

      if (subjectsRes.data) {
        const subjectList: Subject[] = (subjectsRes.data as any[])
          .map((row: any) => row.subjects)
          .filter(Boolean)
          .map((s: any) => ({ id: s.id, name: s.name }));
        setSubjects(subjectList);
      }

      const latestSession = latestSessionRes.data?.[0] ?? null;
      if (latestSession) {
        setCurrentSessionId(latestSession.id);
        const { data: msgs } = await supabaseClient
          .from("chat_messages")
          .select("id, role, content")
          .eq("session_id", latestSession.id)
          .order("created_at", { ascending: true });

        if (msgs && msgs.length > 0) {
          setMessages(
            (msgs as any[]).map((m) => ({
              id: m.id,
              role: m.role as "user" | "assistant",
              content: m.content,
            }))
          );
        }
      }

      setReady(true);
    }
    load();
  }, [router]);

  // Auto-scroll when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInputText(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 120) + "px";
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  async function handleSend(text?: string) {
    const messageText = (text ?? inputText).trim();
    if (!messageText || isStreaming || credits <= 0) return;

    setSendError("");

    const {
      data: { session },
    } = await supabaseClient.auth.getSession();
    if (!session) {
      router.replace("/login");
      return;
    }

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: messageText,
    };
    const aiPlaceholder: Message = {
      id: "streaming",
      role: "assistant",
      content: "",
      streaming: true,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages([...updatedMessages, aiPlaceholder]);
    setInputText("");
    setIsStreaming(true);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const selectedSubjectName =
      subjects.find((s) => s.id === selectedSubjectId)?.name ?? null;

    const apiMessages = updatedMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          messages: apiMessages,
          subject: selectedSubjectName,
          sessionId: currentSessionId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === "streaming"
              ? { ...m, id: crypto.randomUUID(), content: data.error ?? "A apărut o eroare.", streaming: false, error: true }
              : m
          )
        );
        return;
      }

      if (data.sessionId && !currentSessionId) {
        setCurrentSessionId(data.sessionId);
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === "streaming"
            ? { ...m, id: crypto.randomUUID(), content: data.response ?? "", streaming: false }
            : m
        )
      );
      setCredits((prev) => Math.max(0, prev - 1));
      await supabaseClient
        .from("profiles")
        .update({ thinking_credits: Math.max(0, credits - 1) })
        .eq("id", session.user.id);
    } catch (err) {
      console.error("handleSend error:", err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === "streaming"
            ? { ...m, id: crypto.randomUUID(), content: "Conexiune întreruptă. Încearcă din nou.", streaming: false, error: true }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  }

  function handleNewSession() {
    if (isStreaming) return;
    setCurrentSessionId(null);
    setMessages([]);
    setInputText("");
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
  const selectedSubjectName =
    subjects.find((s) => s.id === selectedSubjectId)?.name ?? null;
  const noCredits = credits <= 0;

  return (
    <>
      <Head>
        <title>Tutore AI — AgendAI</title>
      </Head>
      <div
        className={`${inter.variable} ${poppins.variable} font-sans flex h-screen overflow-hidden bg-slate-50 dark:bg-gray-900`}
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
              const active = href === "/tutore";
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

        {/* ── Chat main ── */}
        <div className="ml-64 flex-1 flex flex-col h-screen min-w-0">
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-3.5 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0">
            <Brain size={18} className="text-[#164B2E] dark:text-green-400 shrink-0" />
            <h1 className="font-heading text-lg font-bold text-gray-900 dark:text-white shrink-0">
              Tutore AI
            </h1>

            {/* Subject selector */}
            {subjects.length > 0 && (
              <div className="relative ml-2">
                <button
                  onClick={() => setSubjectOpen((v) => !v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-slate-50 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <span>{selectedSubjectName ?? "Toate materiile"}</span>
                  <ChevronDown size={13} className={`transition-transform ${subjectOpen ? "rotate-180" : ""}`} />
                </button>
                {subjectOpen && (
                  <div className="absolute top-full left-0 mt-1.5 w-52 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg z-20 py-1 overflow-hidden">
                    <button
                      onClick={() => { setSelectedSubjectId(""); setSubjectOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                        !selectedSubjectId
                          ? "bg-[#164B2E]/5 text-[#164B2E] dark:text-green-400 font-medium"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      Toate materiile
                    </button>
                    {subjects.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => { setSelectedSubjectId(s.id); setSubjectOpen(false); }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          selectedSubjectId === s.id
                            ? "bg-[#164B2E]/5 text-[#164B2E] dark:text-green-400 font-medium"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="ml-auto flex items-center gap-3">
              {/* Credits badge */}
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${
                  noCredits
                    ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                    : "bg-[#164B2E]/8 dark:bg-green-900/20 text-[#164B2E] dark:text-green-400"
                }`}
              >
                <Zap size={12} />
                {credits} credite
              </div>

              {/* New session */}
              <button
                onClick={handleNewSession}
                disabled={isStreaming}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <Plus size={14} />
                Sesiune nouă
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {messages.length === 0 ? (
              /* Empty state */
              <div className="h-full flex flex-col items-center justify-center gap-6">
                <div className="text-center">
                  <div className="inline-flex bg-[#164B2E]/8 dark:bg-green-900/20 rounded-3xl p-5 mb-4">
                    <Brain size={36} className="text-[#164B2E] dark:text-green-400" />
                  </div>
                  <p className="font-heading font-semibold text-gray-800 dark:text-gray-200 text-lg">
                    Bună! Sunt tutorele tău AI.
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 mt-1 text-sm">
                    Cu ce te pot ajuta azi?
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 justify-center">
                  {SUGGESTION_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => handleSend(chip)}
                      disabled={isStreaming || noCredits}
                      className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 hover:border-[#164B2E]/40 hover:bg-[#164B2E]/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto space-y-5">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {/* AI avatar */}
                    {msg.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-[#164B2E] flex items-center justify-center shrink-0 mt-0.5">
                        <Brain size={14} className="text-white" />
                      </div>
                    )}

                    {/* Bubble */}
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-[#164B2E] text-white rounded-br-sm"
                          : msg.error
                          ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-bl-sm"
                          : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-sm"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <p>{msg.content}</p>
                      ) : (
                        <div className="text-sm">
                          <ReactMarkdown components={MarkdownComponents}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      )}
                      {msg.streaming && !msg.content && (
                        <span className="inline-flex gap-1 mt-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Error banner */}
          {sendError && (
            <div className="shrink-0 px-6 py-2 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
              <div className="max-w-3xl mx-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <Zap size={14} className="text-red-500 shrink-0" />
                <p className="text-sm text-red-600 dark:text-red-400 font-medium flex-1">
                  {sendError}
                </p>
                <button
                  onClick={() => setSendError("")}
                  className="text-red-400 hover:text-red-600 dark:hover:text-red-300 text-lg leading-none shrink-0"
                  aria-label="Închide"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Input area */}
          <div
            className="shrink-0 px-6 py-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700"
            onClick={() => setSubjectOpen(false)}
          >
            <div className="max-w-3xl mx-auto">
              {noCredits ? (
                <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <Zap size={14} className="text-red-500 shrink-0" />
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                    Nu mai ai credite Tuto. Contactează administratorul pentru reîncărcare.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-end gap-3">
                    <textarea
                      ref={textareaRef}
                      rows={1}
                      value={inputText}
                      onChange={handleTextareaChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Scrie întrebarea ta..."
                      disabled={isStreaming}
                      className="flex-1 resize-none rounded-xl border border-gray-200 dark:border-gray-600 bg-slate-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#164B2E]/30 disabled:opacity-60 transition-all"
                      style={{ maxHeight: "120px" }}
                    />
                    <button
                      onClick={() => handleSend()}
                      disabled={!inputText.trim() || isStreaming}
                      className="w-10 h-10 bg-[#164B2E] rounded-xl flex items-center justify-center hover:bg-[#0d2819] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    >
                      <Send size={15} className="text-white" />
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1.5 text-center">
                    Costă 1 credit per răspuns · Enter pentru trimitere · Shift+Enter pentru linie nouă
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
