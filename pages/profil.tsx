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
  Pencil,
  X,
  Plus,
  Flame,
  Zap,
  Check,
  School,
} from "lucide-react";
import { supabaseClient } from "@/lib/supabaseClient";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({
  weight: ["600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

interface ProfileData {
  full_name: string;
  school: string | null;
  grade: number | null;
  learning_style: string | null;
  study_goal: string | null;
  total_xp: number;
  current_streak: number;
  thinking_credits: number;
  language: string | null;
  preferred_difficulty: string | null;
  weak_subjects: string[] | null;
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

const ROMAN = [
  "",
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
];

function formatGrade(grade: number): string {
  if (grade === 1) return "Clasa I";
  return `Clasa a ${ROMAN[grade]}-a`;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function getLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 50)) + 1;
}

const LEARNING_STYLES = [
  { value: "visual", label: "Visual" },
  { value: "auditiv", label: "Auditiv" },
  { value: "kinestezic", label: "Kinestezic" },
];

const DIFFICULTY_OPTIONS = [
  { value: "usor", label: "Ușor" },
  { value: "mediu", label: "Mediu" },
  { value: "dificil", label: "Dificil" },
];

const LANGUAGE_OPTIONS = [
  { value: "ro", label: "Română" },
  { value: "ru", label: "Rusă" },
];

const inputClass =
  "w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#164B2E] transition-all duration-200";

const selectClass =
  "w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#164B2E] transition-all duration-200";

export default function ProfilPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState("");
  const [profile, setProfile] = useState<ProfileData | null>(null);

  // Edit mode
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    school: "",
    grade: 9,
    learning_style: "visual",
    study_goal: "",
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Preferences
  const [prefLanguage, setPrefLanguage] = useState("ro");
  const [prefDifficulty, setPrefDifficulty] = useState("mediu");
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefSaved, setPrefSaved] = useState(false);

  // Weak subjects
  const [weakSubjects, setWeakSubjects] = useState<string[]>([]);
  const [newSubject, setNewSubject] = useState("");
  const [savingSubjects, setSavingSubjects] = useState(false);

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

      const { data } = await supabaseClient
        .from("profiles")
        .select(
          "full_name, school, grade, learning_style, study_goal, total_xp, current_streak, thinking_credits, language, preferred_difficulty, weak_subjects"
        )
        .eq("id", uid)
        .single();

      if (data) {
        const p = data as ProfileData;
        setProfile(p);
        setEditForm({
          full_name: p.full_name ?? "",
          school: p.school ?? "",
          grade: p.grade ?? 9,
          learning_style: p.learning_style ?? "visual",
          study_goal: p.study_goal ?? "",
        });
        setPrefLanguage(p.language ?? "ro");
        setPrefDifficulty(p.preferred_difficulty ?? "mediu");
        setWeakSubjects(p.weak_subjects ?? []);
      }

      setReady(true);
    }
    load();
  }, [router]);

  async function handleSaveProfile() {
    setSaving(true);
    setSaveError(null);

    const { error } = await supabaseClient
      .from("profiles")
      .update({
        full_name: editForm.full_name,
        school: editForm.school || null,
        grade: editForm.grade,
        learning_style: editForm.learning_style,
        study_goal: editForm.study_goal || null,
      })
      .eq("id", userId);

    if (error) {
      setSaveError("A apărut o eroare. Încearcă din nou.");
    } else {
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              full_name: editForm.full_name,
              school: editForm.school || null,
              grade: editForm.grade,
              learning_style: editForm.learning_style,
              study_goal: editForm.study_goal || null,
            }
          : prev
      );
      setEditMode(false);
    }
    setSaving(false);
  }

  async function handleSavePrefs() {
    setSavingPrefs(true);
    await supabaseClient
      .from("profiles")
      .update({ language: prefLanguage, preferred_difficulty: prefDifficulty })
      .eq("id", userId);
    setSavingPrefs(false);
    setPrefSaved(true);
    setTimeout(() => setPrefSaved(false), 2500);
  }

  async function handleSaveSubjects(updated: string[]) {
    setSavingSubjects(true);
    await supabaseClient
      .from("profiles")
      .update({ weak_subjects: updated })
      .eq("id", userId);
    setSavingSubjects(false);
  }

  function addSubject() {
    const trimmed = newSubject.trim();
    if (!trimmed || weakSubjects.includes(trimmed)) return;
    const updated = [...weakSubjects, trimmed];
    setWeakSubjects(updated);
    setNewSubject("");
    handleSaveSubjects(updated);
  }

  function removeSubject(s: string) {
    const updated = weakSubjects.filter((w) => w !== s);
    setWeakSubjects(updated);
    handleSaveSubjects(updated);
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
  const level = getLevel(profile?.total_xp ?? 0);

  return (
    <>
      <Head>
        <title>Profil — AgendAI</title>
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
              const active = href === "/profil";
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
        <main className="ml-64 flex-1 p-8 max-w-3xl">
          <div className="mb-6">
            <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-white">
              Profil
            </h1>
          </div>

          {/* ── 1. Profile header card ── */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden mb-6">
            {/* Green top banner */}
            <div className="h-20 bg-gradient-to-r from-[#164B2E] to-[#1e6b40]" />

            <div className="px-6 pb-6">
              {/* Avatar row */}
              <div className="flex items-end justify-between -mt-10 mb-4">
                <div className="w-20 h-20 rounded-full bg-[#164B2E] border-4 border-white dark:border-gray-800 flex items-center justify-center shadow-md shrink-0">
                  <span className="text-white text-2xl font-bold font-heading">
                    {initials}
                  </span>
                </div>
                {!editMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-[#164B2E] dark:hover:text-green-400 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-1.5 transition-colors"
                  >
                    <Pencil size={14} />
                    Editează
                  </button>
                )}
              </div>

              {!editMode ? (
                /* View mode */
                <div>
                  <h2 className="font-heading text-xl font-bold text-gray-900 dark:text-white">
                    {profile?.full_name ?? "—"}
                  </h2>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-xs font-semibold bg-[#164B2E]/10 dark:bg-[#164B2E]/25 text-[#164B2E] dark:text-green-400 px-2.5 py-0.5 rounded-full">
                      Student
                    </span>
                    {profile?.grade && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatGrade(profile.grade)}
                      </span>
                    )}
                  </div>
                  {profile?.school && (
                    <div className="flex items-center gap-1.5 mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <School size={14} />
                      {profile.school}
                    </div>
                  )}
                  {profile?.learning_style && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Stil de învățare:{" "}
                      <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {profile.learning_style}
                      </span>
                    </p>
                  )}
                  {profile?.study_goal && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 leading-relaxed border-l-2 border-[#164B2E]/30 pl-3 italic">
                      {profile.study_goal}
                    </p>
                  )}
                </div>
              ) : (
                /* Edit mode */
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                        Nume complet
                      </label>
                      <input
                        type="text"
                        value={editForm.full_name}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            full_name: e.target.value,
                          }))
                        }
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                        Școala
                      </label>
                      <input
                        type="text"
                        value={editForm.school}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, school: e.target.value }))
                        }
                        placeholder="Liceul Teoretic ..."
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                        Clasa
                      </label>
                      <select
                        value={editForm.grade}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            grade: Number(e.target.value),
                          }))
                        }
                        className={selectClass}
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(
                          (g) => (
                            <option key={g} value={g}>
                              {formatGrade(g)}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                        Stil de învățare
                      </label>
                      <select
                        value={editForm.learning_style}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            learning_style: e.target.value,
                          }))
                        }
                        className={selectClass}
                      >
                        {LEARNING_STYLES.map(({ value, label }) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                      Obiectiv de studiu
                    </label>
                    <textarea
                      rows={3}
                      value={editForm.study_goal}
                      onChange={(e) =>
                        setEditForm((f) => ({
                          ...f,
                          study_goal: e.target.value,
                        }))
                      }
                      placeholder="Ex: Vreau să obțin media 9 la bacalaureat..."
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  {saveError && (
                    <p className="text-sm text-red-500">{saveError}</p>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="flex items-center gap-2 bg-[#164B2E] hover:bg-[#0d2819] disabled:opacity-60 text-white text-sm font-semibold rounded-xl px-5 py-2.5 transition-colors"
                    >
                      <Check size={15} />
                      {saving ? "Se salvează..." : "Salvează"}
                    </button>
                    <button
                      onClick={() => setEditMode(false)}
                      className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-xl px-5 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Anulează
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── 2. Stats row ── */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 flex items-start gap-3">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-2.5 shrink-0">
                <Zap size={20} className="text-yellow-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Total XP
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5 font-heading">
                  {profile?.total_xp ?? 0}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  Nivel {level}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 flex items-start gap-3">
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-2.5 shrink-0">
                <Flame size={20} className="text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Streak curent
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5 font-heading">
                  {profile?.current_streak ?? 0} zile
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {(profile?.current_streak ?? 0) > 0
                    ? "Continuă!"
                    : "Începe azi"}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 flex items-start gap-3">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-2.5 shrink-0">
                <Brain size={20} className="text-[#164B2E] dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Credite Tuto
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5 font-heading">
                  {profile?.thinking_credits ?? 0}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  Sesiuni AI
                </p>
              </div>
            </div>
          </div>

          {/* ── 3. Preferințe ── */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 mb-6">
            <h2 className="font-heading font-semibold text-gray-900 dark:text-white mb-5">
              Preferințe
            </h2>

            <div className="space-y-5">
              {/* Language */}
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Limbă preferată
                </p>
                <div className="flex gap-2">
                  {LANGUAGE_OPTIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setPrefLanguage(value)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors duration-150 ${
                        prefLanguage === value
                          ? "bg-[#164B2E] text-white border-[#164B2E]"
                          : "text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dificultate preferată
                </p>
                <div className="flex gap-2">
                  {DIFFICULTY_OPTIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setPrefDifficulty(value)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors duration-150 ${
                        prefDifficulty === value
                          ? "bg-[#164B2E] text-white border-[#164B2E]"
                          : "text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={handleSavePrefs}
                  disabled={savingPrefs}
                  className="flex items-center gap-2 bg-[#164B2E] hover:bg-[#0d2819] disabled:opacity-60 text-white text-sm font-semibold rounded-xl px-5 py-2.5 transition-colors"
                >
                  <Check size={14} />
                  {savingPrefs ? "Se salvează..." : "Salvează preferințele"}
                </button>
                {prefSaved && (
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                    Salvat!
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* ── 4. Subiecte slabe ── */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="font-heading font-semibold text-gray-900 dark:text-white mb-1">
              Subiecte slabe
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              Adaugă materiile la care vrei să te îmbunătățești.
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {weakSubjects.length === 0 && (
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Niciun subiect adăugat.
                </p>
              )}
              {weakSubjects.map((s) => (
                <span
                  key={s}
                  className="flex items-center gap-1.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30 text-sm font-medium px-3 py-1.5 rounded-xl"
                >
                  {s}
                  <button
                    onClick={() => removeSubject(s)}
                    className="text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
                    aria-label={`Elimină ${s}`}
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>

            {/* Add input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSubject()}
                placeholder="Ex: Fizică, Chimie..."
                className={`${inputClass} flex-1`}
              />
              <button
                onClick={addSubject}
                disabled={!newSubject.trim() || savingSubjects}
                className="flex items-center gap-1.5 bg-[#164B2E] hover:bg-[#0d2819] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl px-4 py-2.5 transition-colors shrink-0"
              >
                <Plus size={15} />
                Adaugă
              </button>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
