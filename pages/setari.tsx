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
  Eye,
  EyeOff,
  Bell,
  CreditCard,
  LogOut,
  Trash2,
  ChevronRight,
  Check,
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
  notifications_enabled: boolean;
  streak_reminders: boolean;
  subscription_plan: string | null;
  subscription_expires_at: string | null;
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

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
        checked ? "bg-[#164B2E]" : "bg-gray-200 dark:bg-gray-600"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export default function SetariPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState("");

  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);

  // Notifications
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [streakReminders, setStreakReminders] = useState(false);
  const [notifSaving, setNotifSaving] = useState(false);
  const [notifSaved, setNotifSaved] = useState(false);

  // Danger zone
  const [showDeleteTooltip, setShowDeleteTooltip] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    async function load() {
      const {
        data: { session },
      } = await supabaseClient.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      setEmail(session.user.email ?? "");

      const { data } = await supabaseClient
        .from("profiles")
        .select(
          "full_name, notifications_enabled, streak_reminders, subscription_plan, subscription_expires_at"
        )
        .eq("id", session.user.id)
        .single();

      if (data) {
        setProfile(data);
        setNotificationsEnabled(data.notifications_enabled ?? false);
        setStreakReminders(data.streak_reminders ?? false);
      }

      setReady(true);
    }
    load();
  }, [router]);

  async function handlePasswordChange() {
    setPasswordError("");

    if (!newPassword || !confirmPassword) {
      setPasswordError("Completează toate câmpurile.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("Parola nouă trebuie să aibă cel puțin 8 caractere.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Parolele nu coincid.");
      return;
    }

    setPasswordSaving(true);
    const { error } = await supabaseClient.auth.updateUser({
      password: newPassword,
    });
    setPasswordSaving(false);

    if (error) {
      setPasswordError(error.message);
      return;
    }

    setPasswordSaved(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => {
      setPasswordSaved(false);
      setShowPasswordForm(false);
    }, 2000);
  }

  async function handleSaveNotifications() {
    setNotifSaving(true);
    const {
      data: { session },
    } = await supabaseClient.auth.getSession();
    if (session) {
      await supabaseClient
        .from("profiles")
        .update({
          notifications_enabled: notificationsEnabled,
          streak_reminders: streakReminders,
        })
        .eq("id", session.user.id);
    }
    setNotifSaving(false);
    setNotifSaved(true);
    setTimeout(() => setNotifSaved(false), 2500);
  }

  async function handleSignOut() {
    setSigningOut(true);
    await supabaseClient.auth.signOut();
    router.replace("/login");
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
  const isPremium =
    profile?.subscription_plan === "premium" ||
    profile?.subscription_plan === "Premium";

  return (
    <>
      <Head>
        <title>Setări — AgendAI</title>
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
            {MAIN_NAV.map(({ label, icon: Icon, href }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
              >
                <Icon size={17} />
                {label}
              </Link>
            ))}
          </nav>

          <div className="px-3 py-3 border-t border-gray-100 dark:border-gray-700 space-y-0.5 shrink-0">
            {BOTTOM_NAV.map(({ label, icon: Icon, href }) => {
              const active = href === "/setari";
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

        {/* ── Main content ── */}
        <div className="ml-64 flex-1 flex flex-col min-h-screen">
          {/* Header */}
          <div className="flex items-center gap-3 px-8 py-5 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0">
            <Settings size={20} className="text-[#164B2E] dark:text-green-400" />
            <h1 className="font-heading text-xl font-bold text-gray-900 dark:text-white">
              Setări
            </h1>
          </div>

          <div className="flex-1 overflow-y-auto px-8 py-8">
            <div className="max-w-2xl space-y-8">

              {/* ── Cont ── */}
              <section>
                <h2 className="font-heading text-base font-semibold text-gray-900 dark:text-white mb-4">
                  Cont
                </h2>
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                  {/* Email row */}
                  <div className="px-5 py-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">
                        Adresă email
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {email}
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-full uppercase tracking-wide shrink-0">
                      Doar citire
                    </span>
                  </div>

                  {/* Password row */}
                  <div className="px-5 py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">
                          Parolă
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          ••••••••
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setShowPasswordForm((v) => !v);
                          setPasswordError("");
                          setCurrentPassword("");
                          setNewPassword("");
                          setConfirmPassword("");
                        }}
                        className="flex items-center gap-1.5 text-sm font-medium text-[#164B2E] dark:text-green-400 hover:underline shrink-0"
                      >
                        Schimbă parola
                        <ChevronRight
                          size={14}
                          className={`transition-transform ${showPasswordForm ? "rotate-90" : ""}`}
                        />
                      </button>
                    </div>

                    {showPasswordForm && (
                      <div className="mt-4 space-y-3">
                        {/* Current password */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Parola curentă
                          </label>
                          <div className="relative">
                            <input
                              type={showCurrent ? "text" : "password"}
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              placeholder="Parola curentă"
                              className="w-full pr-10 pl-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-slate-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#164B2E]/30"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrent((v) => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                        </div>

                        {/* New password */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Parola nouă
                          </label>
                          <div className="relative">
                            <input
                              type={showNew ? "text" : "password"}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Minim 8 caractere"
                              className="w-full pr-10 pl-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-slate-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#164B2E]/30"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNew((v) => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                        </div>

                        {/* Confirm password */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Confirmă parola nouă
                          </label>
                          <div className="relative">
                            <input
                              type={showConfirm ? "text" : "password"}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Repetă parola nouă"
                              className="w-full pr-10 pl-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-slate-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#164B2E]/30"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirm((v) => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                        </div>

                        {passwordError && (
                          <p className="text-xs text-red-500 dark:text-red-400">
                            {passwordError}
                          </p>
                        )}

                        <div className="flex items-center gap-3 pt-1">
                          <button
                            onClick={handlePasswordChange}
                            disabled={passwordSaving || passwordSaved}
                            className="flex items-center gap-2 px-4 py-2 bg-[#164B2E] text-white text-sm font-medium rounded-xl hover:bg-[#0d2819] transition-colors disabled:opacity-60"
                          >
                            {passwordSaved ? (
                              <>
                                <Check size={14} />
                                Salvat!
                              </>
                            ) : passwordSaving ? (
                              "Se salvează..."
                            ) : (
                              "Salvează parola"
                            )}
                          </button>
                          <button
                            onClick={() => setShowPasswordForm(false)}
                            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                          >
                            Anulează
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* ── Notificări ── */}
              <section>
                <h2 className="font-heading text-base font-semibold text-gray-900 dark:text-white mb-4">
                  Notificări
                </h2>
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                  <div className="px-5 py-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Notificări activate
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        Primești alerte pentru teme, note și activitate
                      </p>
                    </div>
                    <Toggle
                      checked={notificationsEnabled}
                      onChange={setNotificationsEnabled}
                    />
                  </div>

                  <div className="px-5 py-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Remindere streak
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        Ești notificat când streakul tău e în pericol
                      </p>
                    </div>
                    <Toggle
                      checked={streakReminders}
                      onChange={setStreakReminders}
                    />
                  </div>

                  <div className="px-5 py-4 flex items-center justify-between gap-4">
                    <div />
                    <button
                      onClick={handleSaveNotifications}
                      disabled={notifSaving || notifSaved}
                      className="flex items-center gap-2 px-4 py-2 bg-[#164B2E] text-white text-sm font-medium rounded-xl hover:bg-[#0d2819] transition-colors disabled:opacity-60"
                    >
                      {notifSaved ? (
                        <>
                          <Check size={14} />
                          Salvat!
                        </>
                      ) : notifSaving ? (
                        "Se salvează..."
                      ) : (
                        <>
                          <Bell size={14} />
                          Salvează preferințele
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </section>

              {/* ── Abonament ── */}
              <section>
                <h2 className="font-heading text-base font-semibold text-gray-900 dark:text-white mb-4">
                  Abonament
                </h2>
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                  <div className="px-5 py-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">
                        Plan curent
                      </p>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-semibold px-2.5 py-0.5 rounded-full ${
                            isPremium
                              ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          {isPremium ? "Premium" : "Gratuit"}
                        </span>
                        {isPremium && profile?.subscription_expires_at && (
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            expiră {formatDate(profile.subscription_expires_at)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {!isPremium && (
                    <div className="px-5 py-4">
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-100 dark:border-amber-800/30">
                        <CreditCard
                          size={18}
                          className="text-amber-500 shrink-0 mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                            Upgrade la Premium
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                            Acces nelimitat la Tutore AI, statistici avansate și conținut exclusiv.
                          </p>
                        </div>
                        <div className="relative shrink-0 group">
                          <button
                            disabled
                            className="px-3 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded-lg opacity-50 cursor-not-allowed"
                          >
                            În curând
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* ── Pericol ── */}
              <section>
                <h2 className="font-heading text-base font-semibold text-red-600 dark:text-red-400 mb-4">
                  Pericol
                </h2>
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-red-200 dark:border-red-800/50 divide-y divide-red-100 dark:divide-red-800/30">
                  {/* Sign out */}
                  <div className="px-5 py-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Deconectează-te
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        Ieși din contul tău pe acest dispozitiv
                      </p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      disabled={signingOut}
                      className="flex items-center gap-2 px-4 py-2 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 text-sm font-medium rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                    >
                      <LogOut size={14} />
                      {signingOut ? "Se deconectează..." : "Deconectează-te"}
                    </button>
                  </div>

                  {/* Delete account */}
                  <div className="px-5 py-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Șterge contul
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        Acțiune permanentă și ireversibilă
                      </p>
                    </div>
                    <div className="relative">
                      <button
                        disabled
                        onMouseEnter={() => setShowDeleteTooltip(true)}
                        onMouseLeave={() => setShowDeleteTooltip(false)}
                        onFocus={() => setShowDeleteTooltip(true)}
                        onBlur={() => setShowDeleteTooltip(false)}
                        className="flex items-center gap-2 px-4 py-2 border border-red-200 dark:border-red-700 text-red-400 dark:text-red-600 text-sm font-medium rounded-xl opacity-50 cursor-not-allowed"
                      >
                        <Trash2 size={14} />
                        Șterge contul
                      </button>
                      {showDeleteTooltip && (
                        <div className="absolute right-0 bottom-full mb-2 w-52 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-xl px-3 py-2 shadow-lg z-10">
                          Contactează administratorul pentru a șterge contul.
                          <div className="absolute right-4 top-full border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
