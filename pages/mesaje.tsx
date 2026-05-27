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
  Send,
  Clock,
  Search,
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

interface MockConversation {
  id: string;
  name: string;
  role: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  initials: string;
  avatarColor: string;
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

// Static preview conversations — backend not yet implemented
const MOCK_CONVERSATIONS: MockConversation[] = [
  {
    id: "1",
    name: "Doamna Popescu",
    role: "Diriginte",
    lastMessage: "Bună ziua! Ai primit tema pentru mâine?",
    timestamp: "10:30",
    unread: 2,
    initials: "DP",
    avatarColor: "bg-purple-500",
  },
  {
    id: "2",
    name: "Ionescu Maria",
    role: "Colegă",
    lastMessage: "Știi răspunsul la exercițiul 5?",
    timestamp: "Ieri",
    unread: 0,
    initials: "IM",
    avatarColor: "bg-blue-500",
  },
  {
    id: "3",
    name: "Dl. Gheorghe",
    role: "Profesor Matematică",
    lastMessage: "Felicitări pentru nota de la test!",
    timestamp: "Lun",
    unread: 0,
    initials: "GH",
    avatarColor: "bg-teal-500",
  },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export default function MesajePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draftText, setDraftText] = useState("");

  useEffect(() => {
    async function load() {
      const {
        data: { session },
      } = await supabaseClient.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      const { data } = await supabaseClient
        .from("profiles")
        .select("full_name")
        .eq("id", session.user.id)
        .single();

      if (data) setProfile(data);
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
  const selected = MOCK_CONVERSATIONS.find((c) => c.id === selectedId) ?? null;

  return (
    <>
      <Head>
        <title>Mesaje — AgendAI</title>
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
              const active = href === "/mesaje";
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

        {/* ── Main: split view ── */}
        <div className="ml-64 flex-1 flex flex-col min-h-screen">
          {/* Page header */}
          <div className="flex items-center gap-3 px-8 py-5 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0">
            <h1 className="font-heading text-xl font-bold text-gray-900 dark:text-white">
              Mesaje
            </h1>
            <span className="text-[10px] font-bold bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2.5 py-1 rounded-full uppercase tracking-wide">
              În curând
            </span>
          </div>

          {/* Split pane */}
          <div className="flex flex-1 overflow-hidden">
            {/* ── Left: conversation list ── */}
            <div className="w-80 shrink-0 border-r border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
              {/* Search */}
              <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Caută conversații..."
                    disabled
                    className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-slate-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none cursor-not-allowed opacity-60"
                  />
                </div>
              </div>

              {/* Conversation list */}
              <div className="flex-1 overflow-y-auto">
                {MOCK_CONVERSATIONS.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedId(conv.id)}
                    className={`w-full flex items-start gap-3 px-4 py-3.5 text-left border-b border-gray-50 dark:border-gray-700/60 transition-colors ${
                      selectedId === conv.id
                        ? "bg-[#164B2E]/5 dark:bg-[#164B2E]/15"
                        : "hover:bg-gray-50 dark:hover:bg-gray-700/40"
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-10 h-10 rounded-full ${conv.avatarColor} flex items-center justify-center shrink-0`}
                    >
                      <span className="text-white text-xs font-bold">
                        {conv.initials}
                      </span>
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`text-sm font-semibold truncate ${
                            selectedId === conv.id
                              ? "text-[#164B2E] dark:text-green-400"
                              : "text-gray-900 dark:text-white"
                          }`}
                        >
                          {conv.name}
                        </p>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 shrink-0">
                          {conv.timestamp}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                        {conv.role}
                      </p>
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {conv.lastMessage}
                        </p>
                        {conv.unread > 0 && (
                          <span className="shrink-0 w-4 h-4 rounded-full bg-[#164B2E] text-white text-[9px] font-bold flex items-center justify-center">
                            {conv.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Right: message thread ── */}
            <div className="flex-1 flex flex-col bg-slate-50 dark:bg-gray-900">
              {selected ? (
                <>
                  {/* Thread header */}
                  <div className="flex items-center gap-3 px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 shrink-0">
                    <div
                      className={`w-9 h-9 rounded-full ${selected.avatarColor} flex items-center justify-center shrink-0`}
                    >
                      <span className="text-white text-xs font-bold">
                        {selected.initials}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {selected.name}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {selected.role}
                      </p>
                    </div>
                  </div>

                  {/* Coming-soon notice */}
                  <div className="flex-1 flex items-center justify-center px-6">
                    <div className="text-center max-w-xs">
                      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 inline-flex mb-4">
                        <Clock size={28} className="text-gray-300 dark:text-gray-600" />
                      </div>
                      <p className="font-heading font-semibold text-gray-700 dark:text-gray-300">
                        Funcționalitate în construcție
                      </p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1.5 leading-relaxed">
                        Sistemul de mesagerie va fi disponibil în curând. Vei putea comunica direct cu profesorii și colegii.
                      </p>
                    </div>
                  </div>

                  {/* Input bar — disabled */}
                  <div className="px-6 py-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 shrink-0">
                    <div className="flex items-end gap-3">
                      <textarea
                        rows={1}
                        value={draftText}
                        onChange={(e) => setDraftText(e.target.value)}
                        placeholder="Scrie un mesaj... (în curând)"
                        disabled
                        className="flex-1 rounded-xl border border-gray-200 dark:border-gray-600 bg-slate-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 py-2.5 text-sm focus:outline-none resize-none cursor-not-allowed opacity-60"
                      />
                      <button
                        disabled
                        className="w-10 h-10 bg-[#164B2E] rounded-xl flex items-center justify-center opacity-40 cursor-not-allowed shrink-0"
                      >
                        <Send size={16} className="text-white" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* Empty state — nothing selected */
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 inline-flex mb-4">
                      <MessageSquare
                        size={28}
                        className="text-gray-300 dark:text-gray-600"
                      />
                    </div>
                    <p className="font-heading font-semibold text-gray-600 dark:text-gray-400">
                      Selectează o conversație
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                      Alege o conversație din lista din stânga.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
