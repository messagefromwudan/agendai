import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Inter, Poppins } from "next/font/google";
import { Search, Plus, X, Loader2, AlertTriangle } from "lucide-react";
import { supabaseClient } from "@/lib/supabaseClient";
import AdminSidebar from "@/components/AdminSidebar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({ weight: ["600", "700"], subsets: ["latin"], variable: "--font-poppins" });

const ADMIN_ROLES = ["admin", "director", "director_adjunct", "secretary"];

interface AdminProfile {
  full_name: string;
  role: string;
  school_id: string;
}

interface UserRow {
  id: string;
  full_name: string;
  email: string | null;
  created_at: string;
  grade: number | null;
}

interface NewUserForm {
  full_name: string;
  email: string;
  password: string;
}

const EMPTY_FORM: NewUserForm = { full_name: "", email: "", password: "" };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ro-RO", { day: "numeric", month: "short", year: "numeric" });
}

export default function UtilizatoriPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [noSchool, setNoSchool] = useState(false);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [activeTab, setActiveTab] = useState<"elevi" | "profesori">("elevi");
  const [students, setStudents] = useState<UserRow[]>([]);
  const [teachers, setTeachers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NewUserForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session) { router.replace("/login"); return; }

      const { data: prof } = await supabaseClient
        .from("profiles")
        .select("full_name, role, school_id")
        .eq("id", session.user.id)
        .single();

      console.log("[admin/utilizatori] fetched role:", prof?.role ?? null);

      if (!prof) {
        // Profile fetch returned null — transient error, do not redirect
        return;
      }
      if (!ADMIN_ROLES.includes(prof.role)) {
        router.replace("/dashboard");
        return;
      }

      setProfile(prof);

      if (!prof.school_id) {
        setNoSchool(true);
        setReady(true);
        return;
      }

      await fetchUsers(prof.school_id);
      setReady(true);
    }
    load();
  }, [router]);

  async function fetchUsers(schoolId: string) {
    console.log("[utilizatori] fetchUsers school_id:", schoolId);
    const [studentsRes, teachersRes] = await Promise.all([
      supabaseClient
        .from("profiles")
        .select("id, full_name, email, created_at, grade")
        .eq("school_id", schoolId)
        .eq("role", "student")
        .order("full_name"),
      supabaseClient
        .from("profiles")
        .select("id, full_name, email, created_at, grade")
        .eq("school_id", schoolId)
        .in("role", ["teacher", "professor"])
        .order("full_name"),
    ]);
    console.log("[utilizatori] studentsRes:", { data: studentsRes.data, error: studentsRes.error });
    console.log("[utilizatori] teachersRes:", { data: teachersRes.data, error: teachersRes.error });
    if (studentsRes.data) setStudents(studentsRes.data as UserRow[]);
    if (teachersRes.data) setTeachers(teachersRes.data as UserRow[]);
  }

  async function handleAddUser() {
    if (!form.full_name || !form.email || !form.password) {
      setFormError("Completați toate câmpurile.");
      return;
    }
    setSubmitting(true);
    setFormError(null);
    const res = await fetch("/api/admin/create-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.email,
        password: form.password,
        full_name: form.full_name,
        role: activeTab === "elevi" ? "student" : "teacher",
        school_id: profile!.school_id,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      setFormError(json.error ?? "Eroare necunoscută");
    } else {
      setShowForm(false);
      setForm(EMPTY_FORM);
      await fetchUsers(profile!.school_id);
    }
    setSubmitting(false);
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-sm text-gray-400 animate-pulse">Se încarcă...</div>
      </div>
    );
  }

  const rows = activeTab === "elevi" ? students : teachers;
  const filtered = rows.filter((u) =>
    u.full_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Head><title>Utilizatori — Admin AgendAI</title></Head>
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
          <div className="mb-6">
            <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-white">Utilizatori</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gestionează elevii și profesorii din școală</p>
          </div>

          {/* Tabs + actions */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
              {(["elevi", "profesori"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setShowForm(false); setSearch(""); }}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  {tab === "elevi" ? "Elevi" : "Profesori"}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Caută după nume..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 pr-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#164B2E]/30 w-56"
                />
              </div>

              <button
                onClick={() => { setShowForm(true); setFormError(null); setForm(EMPTY_FORM); }}
                className="flex items-center gap-2 bg-[#164B2E] hover:bg-[#0d2819] text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                <Plus size={15} />
                Adaugă {activeTab === "elevi" ? "elev" : "profesor"}
              </button>
            </div>
          </div>

          {/* Inline add form */}
          {showForm && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 mb-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                  Adaugă {activeTab === "elevi" ? "elev nou" : "profesor nou"}
                </h3>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <X size={16} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Nume complet</label>
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#164B2E]/30"
                    placeholder="Ion Popescu"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#164B2E]/30"
                    placeholder="ion@scoala.ro"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Parolă temporară</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#164B2E]/30"
                    placeholder="minim 6 caractere"
                  />
                </div>
              </div>
              {formError && (
                <p className="text-xs text-red-500 mt-3">{formError}</p>
              )}
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleAddUser}
                  disabled={submitting}
                  className="flex items-center gap-2 bg-[#164B2E] hover:bg-[#0d2819] disabled:opacity-60 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  Salvează
                </button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Nume</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Email</th>
                  {activeTab === "elevi" && (
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Clasă</th>
                  )}
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Înregistrat</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={activeTab === "elevi" ? 4 : 3} className="px-5 py-8 text-center text-gray-400 dark:text-gray-500 text-sm">
                      {search ? "Niciun rezultat pentru căutare." : `Niciun ${activeTab === "elevi" ? "elev" : "profesor"} adăugat încă.`}
                    </td>
                  </tr>
                ) : (
                  filtered.map((u, i) => (
                    <tr
                      key={u.id}
                      className={`border-b border-gray-50 dark:border-gray-700/50 last:border-0 ${
                        i % 2 === 0 ? "" : "bg-gray-50/40 dark:bg-gray-700/10"
                      }`}
                    >
                      <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white">{u.full_name}</td>
                      <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">{u.email ?? "—"}</td>
                      {activeTab === "elevi" && (
                        <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">
                          {u.grade ? `Clasa ${u.grade}` : "—"}
                        </td>
                      )}
                      <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">{formatDate(u.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          </>)}
        </main>
      </div>
    </>
  );
}
