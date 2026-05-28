import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Inter, Poppins } from "next/font/google";
import { Plus, CheckCircle, Circle, Loader2, X, AlertTriangle } from "lucide-react";
import { supabaseClient } from "@/lib/supabaseClient";
import AdminSidebar from "@/components/AdminSidebar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({ weight: ["600", "700"], subsets: ["latin"], variable: "--font-poppins" });

const ADMIN_ROLES = ["admin", "director", "director_adjunct"];

interface AdminProfile { full_name: string; role: string; school_id: string; }

interface SchoolYear {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" });
}

export default function AnScolarPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [noSchool, setNoSchool] = useState(false);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [years, setYears] = useState<SchoolYear[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [makeActive, setMakeActive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activating, setActivating] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session) { router.replace("/login"); return; }

      const { data: prof } = await supabaseClient
        .from("profiles").select("full_name, role, school_id").eq("id", session.user.id).single();

      if (!prof || !ADMIN_ROLES.includes(prof.role)) { router.replace("/dashboard"); return; }
      setProfile(prof);

      if (!prof.school_id) {
        setNoSchool(true);
        setReady(true);
        return;
      }

      await fetchYears(prof.school_id);
      setReady(true);
    }
    load();
  }, [router]);

  async function fetchYears(schoolId: string) {
    const { data } = await supabaseClient
      .from("school_years")
      .select("id, name, start_date, end_date, is_active")
      .eq("school_id", schoolId)
      .order("start_date", { ascending: false });
    setYears((data ?? []) as SchoolYear[]);
  }

  async function handleCreate() {
    if (!name || !startDate || !endDate) { setError("Completați toate câmpurile."); return; }
    if (startDate >= endDate) { setError("Data de început trebuie să fie înainte de data de sfârșit."); return; }
    setSaving(true);
    setError(null);

    if (makeActive) {
      // Deactivate all existing years first
      await supabaseClient
        .from("school_years")
        .update({ is_active: false })
        .eq("school_id", profile!.school_id);
    }

    const { error: insertErr } = await supabaseClient.from("school_years").insert({
      name,
      start_date: startDate,
      end_date: endDate,
      is_active: makeActive,
      school_id: profile!.school_id,
    });

    if (insertErr) {
      setError(insertErr.message);
    } else {
      setShowForm(false);
      setName(""); setStartDate(""); setEndDate(""); setMakeActive(false);
      await fetchYears(profile!.school_id);
    }
    setSaving(false);
  }

  async function handleActivate(yearId: string) {
    setActivating(yearId);
    // Deactivate all, then activate the selected one
    await supabaseClient
      .from("school_years")
      .update({ is_active: false })
      .eq("school_id", profile!.school_id);
    await supabaseClient
      .from("school_years")
      .update({ is_active: true })
      .eq("id", yearId);
    await fetchYears(profile!.school_id);
    setActivating(null);
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-sm text-gray-400 animate-pulse">Se încarcă...</div>
      </div>
    );
  }

  const activeYear = years.find((y) => y.is_active);

  return (
    <>
      <Head><title>An Școlar — Admin AgendAI</title></Head>
      <div className={`${inter.variable} ${poppins.variable} font-sans flex min-h-screen bg-slate-50 dark:bg-gray-900`}>
        <AdminSidebar fullName={profile?.full_name ?? ""} role={profile?.role ?? ""} />

        <main className="ml-64 flex-1 p-8">
          {noSchool ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <AlertTriangle size={36} className="text-orange-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md">
                Contul tău nu este asociat cu o școală. Contactează administratorul platformei.
              </p>
            </div>
          ) : (<>
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-white">An Școlar</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gestionează anii școlari</p>
            </div>
            <button
              onClick={() => { setShowForm(true); setError(null); }}
              className="flex items-center gap-2 bg-[#164B2E] hover:bg-[#0d2819] text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              <Plus size={15} /> An școlar nou
            </button>
          </div>

          {/* Active year banner */}
          {activeYear && (
            <div className="relative bg-[#164B2E] rounded-2xl p-6 mb-6 overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={16} className="text-white/70" />
                  <span className="text-white/70 text-sm font-medium">An școlar activ</span>
                </div>
                <p className="font-heading text-3xl font-bold text-white">{activeYear.name}</p>
                <p className="text-white/60 text-sm mt-1.5">
                  {formatDate(activeYear.start_date)} — {formatDate(activeYear.end_date)}
                </p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            </div>
          )}

          {/* New year form */}
          {showForm && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 mb-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">An școlar nou</h3>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X size={16} /></button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Denumire</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ex: 2025-2026"
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#164B2E]/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Data început</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#164B2E]/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Data sfârșit</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#164B2E]/30"
                  />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMakeActive(!makeActive)}
                  className={`w-9 h-5 rounded-full transition-colors relative ${makeActive ? "bg-[#164B2E]" : "bg-gray-300 dark:bg-gray-600"}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${makeActive ? "translate-x-4" : "translate-x-0.5"}`} />
                </button>
                <label className="text-sm text-gray-600 dark:text-gray-400 select-none cursor-pointer" onClick={() => setMakeActive(!makeActive)}>
                  Activează imediat
                </label>
              </div>
              {error && <p className="text-xs text-red-500 mt-3">{error}</p>}
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleCreate}
                  disabled={saving}
                  className="flex items-center gap-2 bg-[#164B2E] hover:bg-[#0d2819] disabled:opacity-60 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  Salvează
                </button>
              </div>
            </div>
          )}

          {/* Years list */}
          <div className="space-y-3">
            {years.length === 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 px-5 py-8 text-center text-gray-400 dark:text-gray-500 text-sm">
                Niciun an școlar adăugat încă.
              </div>
            )}
            {years.map((y) => (
              <div
                key={y.id}
                className={`bg-white dark:bg-gray-800 rounded-2xl border flex items-center justify-between px-5 py-4 ${
                  y.is_active
                    ? "border-[#164B2E]/30 dark:border-green-700/40"
                    : "border-gray-100 dark:border-gray-700"
                }`}
              >
                <div className="flex items-center gap-4">
                  {y.is_active ? (
                    <CheckCircle size={18} className="text-[#164B2E] dark:text-green-400 shrink-0" />
                  ) : (
                    <Circle size={18} className="text-gray-300 dark:text-gray-600 shrink-0" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{y.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {formatDate(y.start_date)} — {formatDate(y.end_date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {y.is_active ? (
                    <span className="text-xs font-semibold bg-[#164B2E]/10 dark:bg-green-900/30 text-[#164B2E] dark:text-green-400 px-3 py-1 rounded-full">
                      Activ
                    </span>
                  ) : (
                    <button
                      onClick={() => handleActivate(y.id)}
                      disabled={activating === y.id}
                      className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-[#164B2E] dark:hover:text-green-400 border border-gray-200 dark:border-gray-600 px-3 py-1.5 rounded-xl font-medium transition-colors disabled:opacity-60"
                    >
                      {activating === y.id && <Loader2 size={12} className="animate-spin" />}
                      Activează
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          </>)}
        </main>
      </div>
    </>
  );
}
