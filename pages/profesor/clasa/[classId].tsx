import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Inter, Poppins } from "next/font/google";
import { Plus, X, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { supabaseClient } from "@/lib/supabaseClient";
import ProfesorSidebar from "@/components/ProfesorSidebar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({ weight: ["600", "700"], subsets: ["latin"], variable: "--font-poppins" });

const PROF_ROLES = ["teacher", "professor"];

const GRADE_TYPE_LABELS: Record<string, string> = {
  current: "Curentă", semester: "Semestrială", annual: "Anuală", exam: "Examen",
};
const GRADE_TYPE_STYLES: Record<string, string> = {
  current: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  semester: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  annual: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
  exam: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
};

interface Student { id: string; full_name: string; }
interface GradeRow { id: string; value: number; grade_type: string; semester: number | null; date: string | null; note: string | null; created_at: string; }
interface StudentGrades { student: Student; grades: GradeRow[]; average: number | null; }
interface Assignment { id: string; title: string; description: string | null; due_date: string; is_published: boolean; submissionCount: number; }
interface Submission { id: string; student_id: string; studentName: string; submitted_at: string; grade: number | null; }

interface AddGradeForm { value: string; grade_type: string; semester: string; date: string; note: string; }
const EMPTY_GRADE_FORM: AddGradeForm = { value: "", grade_type: "current", semester: "1", date: new Date().toISOString().split("T")[0], note: "" };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ro-RO", { day: "numeric", month: "short", year: "numeric" });
}
function avg(grades: GradeRow[]) {
  if (!grades.length) return null;
  return Math.round((grades.reduce((s, g) => s + g.value, 0) / grades.length) * 100) / 100;
}

export default function ClasaDetailPage() {
  const router = useRouter();
  const { classId } = router.query as { classId: string };
  const subjectId = router.query.subject as string | undefined;

  const [ready, setReady] = useState(false);
  const [profId, setProfId] = useState("");
  const [profName, setProfName] = useState("");
  const [className, setClassName] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [activeTab, setActiveTab] = useState<"note" | "teme">("note");

  // Elevi & Note
  const [studentGrades, setStudentGrades] = useState<StudentGrades[]>([]);
  const [addingGradeFor, setAddingGradeFor] = useState<string | null>(null);
  const [gradeForm, setGradeForm] = useState<AddGradeForm>(EMPTY_GRADE_FORM);
  const [savingGrade, setSavingGrade] = useState(false);
  const [gradeError, setGradeError] = useState<string | null>(null);

  // Teme
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showNewAssignment, setShowNewAssignment] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newPublished, setNewPublished] = useState(false);
  const [savingAssignment, setSavingAssignment] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [gradingAssignId, setGradingAssignId] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [submissionGrades, setSubmissionGrades] = useState<Record<string, string>>({});
  const [savingSubmission, setSavingSubmission] = useState<string | null>(null);

  useEffect(() => {
    if (!classId) return;
    async function load() {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session) { router.replace("/login"); return; }

      const { data: prof } = await supabaseClient
        .from("profiles").select("full_name, role").eq("id", session.user.id).single();
      if (!prof || !PROF_ROLES.includes(prof.role)) { router.replace("/dashboard"); return; }
      setProfId(session.user.id);
      setProfName(prof.full_name);

      // Load class info
      const { data: classData } = await supabaseClient
        .from("classes").select("name").eq("id", classId).single();
      setClassName(classData?.name ?? "—");

      // Load subject info for the active subjectId
      let activeSubjectId = subjectId;
      if (!activeSubjectId) {
        const { data: firstCs } = await supabaseClient
          .from("class_subjects").select("subject_id").eq("class_id", classId).eq("professor_id", session.user.id).limit(1).single();
        activeSubjectId = firstCs?.subject_id;
      }
      if (activeSubjectId) {
        const { data: subData } = await supabaseClient
          .from("subjects").select("name").eq("id", activeSubjectId).single();
        setSubjectName(subData?.name ?? "—");
      }

      await loadStudentGrades(classId, activeSubjectId ?? "");
      await loadAssignments(classId, activeSubjectId ?? "");
      setReady(true);
    }
    load();
  }, [classId, subjectId, router]);

  async function loadStudentGrades(cid: string, sid: string) {
    console.log("[clasa] loadStudentGrades called — cid:", cid, "sid:", sid);
    const enrollResponse = await supabaseClient
      .from("class_enrollments")
      .select("student_id")
      .eq("class_id", cid);
    console.log("[clasa] enrollments:", JSON.stringify(enrollResponse));

    const enrollments = (enrollResponse.data ?? []) as { student_id: string }[];
    if (enrollments.length === 0) { setStudentGrades([]); return; }

    const studentsRes = await fetch(`/api/profesor/class-students?classId=${cid}`);
    const studentsJson = await studentsRes.json();
    console.log("[clasa] profiles via API:", studentsJson);

    const students: Student[] = ((studentsJson.students ?? []) as { id: string; full_name: string }[])
      .map((p) => ({ id: p.id, full_name: p.full_name ?? "—" }))
      .sort((a, b) => a.full_name.localeCompare(b.full_name, "ro"));

    if (students.length === 0) { setStudentGrades([]); return; }

    const { data: gradesData } = await supabaseClient
      .from("grades")
      .select("id, student_id, value, grade_type, semester, date, note, created_at")
      .eq("subject_id", sid)
      .in("student_id", students.map((s) => s.id))
      .order("created_at", { ascending: false });

    const gradesByStudent: Record<string, GradeRow[]> = {};
    for (const g of (gradesData ?? []) as { id: string; student_id: string; value: number; grade_type: string | null; semester: number | null; date: string | null; note: string | null; created_at: string }[]) {
      if (!gradesByStudent[g.student_id]) gradesByStudent[g.student_id] = [];
      gradesByStudent[g.student_id].push({
        id: g.id, value: g.value, grade_type: g.grade_type ?? "current",
        semester: g.semester ?? null, date: g.date ?? null, note: g.note ?? null, created_at: g.created_at,
      });
    }

    setStudentGrades(students.map((s) => ({
      student: s,
      grades: gradesByStudent[s.id] ?? [],
      average: avg(gradesByStudent[s.id] ?? []),
    })));
  }

  async function loadAssignments(cid: string, sid: string) {
    const { data: assignData } = await supabaseClient
      .from("assignments")
      .select("id, title, description, due_date, is_published")
      .eq("class_id", cid)
      .eq("subject_id", sid)
      .order("due_date", { ascending: false });

    if (!assignData || assignData.length === 0) { setAssignments([]); return; }

    const ids = (assignData as { id: string; title: string; description: string | null; due_date: string; is_published: boolean }[]).map((a) => a.id);
    const { data: submCounts } = await supabaseClient
      .from("assignment_submissions")
      .select("assignment_id")
      .in("assignment_id", ids);

    const countMap: Record<string, number> = {};
    for (const s of (submCounts ?? []) as { assignment_id: string }[]) {
      countMap[s.assignment_id] = (countMap[s.assignment_id] ?? 0) + 1;
    }

    setAssignments((assignData as { id: string; title: string; description: string | null; due_date: string; is_published: boolean }[]).map((a) => ({
      id: a.id, title: a.title, description: a.description ?? null,
      due_date: a.due_date, is_published: a.is_published ?? false,
      submissionCount: countMap[a.id] ?? 0,
    })));
  }

  async function handleAddGrade(studentId: string) {
    const val = parseInt(gradeForm.value);
    if (!gradeForm.value || isNaN(val) || val < 1 || val > 10) {
      setGradeError("Nota trebuie să fie între 1 și 10."); return;
    }
    setSavingGrade(true); setGradeError(null);
    const activeSubjectId = subjectId ?? "";
    const { error } = await supabaseClient.from("grades").insert({
      student_id: studentId,
      class_id: classId,
      subject_id: activeSubjectId,
      professor_id: profId,
      value: val,
      grade_type: gradeForm.grade_type,
      semester: parseInt(gradeForm.semester),
      date: gradeForm.date || null,
      note: gradeForm.note || null,
    });
    if (error) { setGradeError(error.message); } else {
      setAddingGradeFor(null);
      setGradeForm(EMPTY_GRADE_FORM);
      await loadStudentGrades(classId, activeSubjectId);
    }
    setSavingGrade(false);
  }

  async function handleCreateAssignment() {
    if (!newTitle || !newDueDate) { setAssignError("Completați titlul și termenul limită."); return; }
    setSavingAssignment(true); setAssignError(null);
    const activeSubjectId = subjectId ?? "";
    const res = await fetch("/api/profesor/create-assignment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTitle, description: newDesc || null,
        due_date: newDueDate, is_published: newPublished,
        class_id: classId, subject_id: activeSubjectId,
      }),
    });
    const json = await res.json();
    if (!res.ok) { setAssignError(json.error ?? "Eroare necunoscută"); } else {
      setShowNewAssignment(false);
      setNewTitle(""); setNewDesc(""); setNewDueDate(""); setNewPublished(false);
      await loadAssignments(classId, activeSubjectId);
    }
    setSavingAssignment(false);
  }

  async function loadSubmissions(assignId: string) {
    const res = await fetch(`/api/profesor/submissions?assignmentId=${assignId}`);
    const json = await res.json();
    const subs: Submission[] = (json.submissions ?? []) as Submission[];
    setSubmissions(subs);
    const initGrades: Record<string, string> = {};
    for (const s of subs) if (s.grade !== null) initGrades[s.id] = String(s.grade);
    setSubmissionGrades(initGrades);
  }

  async function toggleGrading(assignId: string) {
    if (gradingAssignId === assignId) { setGradingAssignId(null); return; }
    setGradingAssignId(assignId);
    await loadSubmissions(assignId);
  }

  async function handleSaveSubmissionGrade(submId: string) {
    const val = parseInt(submissionGrades[submId] ?? "");
    if (isNaN(val) || val < 1 || val > 10) return;
    setSavingSubmission(submId);
    await fetch("/api/profesor/grade-submission", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submissionId: submId, grade: val }),
    });
    await loadSubmissions(gradingAssignId!);
    setSavingSubmission(null);
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-sm text-gray-400 animate-pulse">Se încarcă...</div>
      </div>
    );
  }

  return (
    <>
      <Head><title>{className} · {subjectName} — AgendAI</title></Head>
      <div className={`${inter.variable} ${poppins.variable} font-sans flex min-h-screen bg-slate-50 dark:bg-gray-900`}>
        <ProfesorSidebar fullName={profName} />

        <main className="ml-64 flex-1 p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer hover:underline" onClick={() => router.push("/profesor/clasele-mele")}>
                Clasele mele
              </span>
              <span className="text-gray-300 dark:text-gray-600">/</span>
              <span className="text-sm text-gray-900 dark:text-white font-medium">{className}</span>
            </div>
            <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-white">{subjectName}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Clasa {className} · {studentGrades.length} elevi</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl w-fit mb-6">
            {([["note", "Elevi & Note"], ["teme", "Teme"]] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === key
                    ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ── Tab: Elevi & Note ── */}
          {activeTab === "note" && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              {studentGrades.length === 0 ? (
                <div className="py-12 text-center text-sm text-gray-400 dark:text-gray-500">Niciun elev înscris în această clasă.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-700">
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Elev</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Note</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Medie</th>
                      <th className="px-5 py-3.5" />
                    </tr>
                  </thead>
                  <tbody>
                    {studentGrades.map(({ student, grades, average }) => (
                      <React.Fragment key={student.id}>
                        <tr className="border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                          <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white">{student.full_name}</td>
                          <td className="px-5 py-3.5">
                            {grades.length === 0 ? (
                              <span className="text-gray-400 dark:text-gray-500 text-xs">—</span>
                            ) : (
                              <div className="flex flex-wrap gap-1.5">
                                {grades.map((g) => (
                                  <span key={g.id} className={`text-xs font-bold px-2 py-0.5 rounded-full ${GRADE_TYPE_STYLES[g.grade_type] ?? GRADE_TYPE_STYLES.current}`}>
                                    {g.value}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-3.5">
                            {average !== null ? (
                              <span className="font-bold text-gray-900 dark:text-white">{average.toFixed(2)}</span>
                            ) : (
                              <span className="text-gray-400 dark:text-gray-500 text-xs">—</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <button
                              onClick={() => {
                                if (addingGradeFor === student.id) { setAddingGradeFor(null); }
                                else { setAddingGradeFor(student.id); setGradeForm(EMPTY_GRADE_FORM); setGradeError(null); }
                              }}
                              className="flex items-center gap-1.5 text-xs font-medium text-[#164B2E] dark:text-green-400 hover:underline ml-auto"
                            >
                              <Plus size={13} /> Adaugă notă
                            </button>
                          </td>
                        </tr>
                        {addingGradeFor === student.id && (
                          <tr key={`form-${student.id}`} className="border-b border-gray-50 dark:border-gray-700/50">
                            <td colSpan={4} className="px-5 pb-4 pt-2">
                              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                <div className="grid grid-cols-5 gap-3 mb-3">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Notă (1–10)</label>
                                    <input
                                      type="number" min={1} max={10}
                                      value={gradeForm.value}
                                      onChange={(e) => setGradeForm({ ...gradeForm, value: e.target.value })}
                                      className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#164B2E]/30"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Tip notă</label>
                                    <select
                                      value={gradeForm.grade_type}
                                      onChange={(e) => setGradeForm({ ...gradeForm, grade_type: e.target.value })}
                                      className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#164B2E]/30"
                                    >
                                      {Object.entries(GRADE_TYPE_LABELS).map(([v, l]) => (
                                        <option key={v} value={v}>{l}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Semestru</label>
                                    <select
                                      value={gradeForm.semester}
                                      onChange={(e) => setGradeForm({ ...gradeForm, semester: e.target.value })}
                                      className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#164B2E]/30"
                                    >
                                      <option value="1">Semestrul 1</option>
                                      <option value="2">Semestrul 2</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Data</label>
                                    <input
                                      type="date"
                                      value={gradeForm.date}
                                      onChange={(e) => setGradeForm({ ...gradeForm, date: e.target.value })}
                                      className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#164B2E]/30"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Observație</label>
                                    <input
                                      type="text"
                                      value={gradeForm.note}
                                      onChange={(e) => setGradeForm({ ...gradeForm, note: e.target.value })}
                                      placeholder="opțional"
                                      className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#164B2E]/30"
                                    />
                                  </div>
                                </div>
                                {gradeError && <p className="text-xs text-red-500 mb-2">{gradeError}</p>}
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleAddGrade(student.id)}
                                    disabled={savingGrade}
                                    className="flex items-center gap-1.5 bg-[#164B2E] hover:bg-[#0d2819] disabled:opacity-60 text-white px-4 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                  >
                                    {savingGrade && <Loader2 size={12} className="animate-spin" />}
                                    Salvează nota
                                  </button>
                                  <button
                                    onClick={() => setAddingGradeFor(null)}
                                    className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 px-3 py-1.5"
                                  >
                                    Anulează
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── Tab: Teme ── */}
          {activeTab === "teme" && (
            <div className="space-y-4">
              {/* Add assignment button */}
              <div className="flex justify-end">
                <button
                  onClick={() => { setShowNewAssignment(true); setAssignError(null); }}
                  className="flex items-center gap-2 bg-[#164B2E] hover:bg-[#0d2819] text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  <Plus size={15} /> Adaugă temă
                </button>
              </div>

              {/* New assignment form */}
              {showNewAssignment && (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Temă nouă</h3>
                    <button onClick={() => setShowNewAssignment(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X size={16} /></button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Titlu</label>
                      <input
                        type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="ex: Rezolvare probleme cap. 3"
                        className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#164B2E]/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Descriere (opțional)</label>
                      <textarea
                        value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={3}
                        className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#164B2E]/30 resize-none"
                      />
                    </div>
                    <div className="flex items-end gap-4">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Termen limită</label>
                        <input
                          type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#164B2E]/30"
                        />
                      </div>
                      <div className="flex items-center gap-2 pb-2">
                        <button
                          type="button" onClick={() => setNewPublished(!newPublished)}
                          className={`w-9 h-5 rounded-full transition-colors relative ${newPublished ? "bg-[#164B2E]" : "bg-gray-300 dark:bg-gray-600"}`}
                        >
                          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${newPublished ? "translate-x-4" : "translate-x-0.5"}`} />
                        </button>
                        <label className="text-sm text-gray-600 dark:text-gray-400 select-none cursor-pointer" onClick={() => setNewPublished(!newPublished)}>
                          Publică
                        </label>
                      </div>
                    </div>
                  </div>
                  {assignError && <p className="text-xs text-red-500 mt-2">{assignError}</p>}
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={handleCreateAssignment} disabled={savingAssignment}
                      className="flex items-center gap-2 bg-[#164B2E] hover:bg-[#0d2819] disabled:opacity-60 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors"
                    >
                      {savingAssignment && <Loader2 size={14} className="animate-spin" />}
                      Salvează
                    </button>
                  </div>
                </div>
              )}

              {/* Assignment list */}
              {assignments.length === 0 && !showNewAssignment ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 py-12 text-center text-sm text-gray-400 dark:text-gray-500">
                  Nicio temă adăugată pentru această materie.
                </div>
              ) : (
                assignments.map((a) => (
                  <div key={a.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{a.title}</p>
                          <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            a.is_published
                              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                          }`}>
                            {a.is_published ? "Publicată" : "Draft"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          Termen: {formatDate(a.due_date)} · {a.submissionCount} {a.submissionCount === 1 ? "predare" : "predări"}
                        </p>
                      </div>
                      <button
                        onClick={() => toggleGrading(a.id)}
                        className="flex items-center gap-1.5 text-xs font-medium text-[#164B2E] dark:text-green-400 border border-[#164B2E]/20 dark:border-green-700/30 px-3 py-1.5 rounded-lg hover:bg-[#164B2E]/5 dark:hover:bg-green-900/10 transition-colors ml-4 shrink-0"
                      >
                        Notează
                        {gradingAssignId === a.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>
                    </div>

                    {/* Grading panel */}
                    {gradingAssignId === a.id && (
                      <div className="border-t border-gray-100 dark:border-gray-700 px-5 py-4">
                        {submissions.length === 0 ? (
                          <p className="text-sm text-gray-400 dark:text-gray-500">Nicio predare pentru această temă.</p>
                        ) : (
                          <div className="space-y-2">
                            {submissions.map((s) => (
                              <div key={s.id} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl px-4 py-2.5">
                                <p className="text-sm text-gray-900 dark:text-white font-medium flex-1">{s.studentName}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500">{formatDate(s.submitted_at)}</p>
                                <div className="flex items-center gap-2 shrink-0">
                                  <input
                                    type="number" min={1} max={10} placeholder="1–10"
                                    value={submissionGrades[s.id] ?? ""}
                                    onChange={(e) => setSubmissionGrades({ ...submissionGrades, [s.id]: e.target.value })}
                                    className="w-16 px-2 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-center focus:outline-none focus:ring-2 focus:ring-[#164B2E]/30"
                                  />
                                  <button
                                    onClick={() => handleSaveSubmissionGrade(s.id)}
                                    disabled={savingSubmission === s.id}
                                    className="flex items-center gap-1 bg-[#164B2E] hover:bg-[#0d2819] disabled:opacity-60 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                                  >
                                    {savingSubmission === s.id ? <Loader2 size={11} className="animate-spin" /> : "Salvează"}
                                  </button>
                                  {s.grade !== null && (
                                    <span className="text-xs font-bold text-green-600 dark:text-green-400">✓ {s.grade}</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
