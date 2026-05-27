import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Inter, Poppins } from "next/font/google";
import { Plus, ChevronDown, ChevronUp, X, Loader2, Users } from "lucide-react";
import { supabaseClient } from "@/lib/supabaseClient";
import AdminSidebar from "@/components/AdminSidebar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({ weight: ["600", "700"], subsets: ["latin"], variable: "--font-poppins" });

const ADMIN_ROLES = ["admin", "director", "director_adjunct"];

interface AdminProfile { full_name: string; role: string; school_id: string; }

interface ClassRow {
  id: string;
  name: string;
  grade_level: number;
  class_teacher_id: string | null;
  teacher_name: string | null;
  student_count: number;
}

interface Teacher { id: string; full_name: string; }
interface Student { id: string; full_name: string; }
interface Subject { id: string; name: string; }

interface ClassSubjectRow {
  subject_id: string;
  subject_name: string;
  teacher_id: string | null;
  teacher_name: string | null;
}

interface ClassDetail {
  students: Student[];
  subjects: ClassSubjectRow[];
}

export default function ClasePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);

  // New class form
  const [showNewClass, setShowNewClass] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newGradeLevel, setNewGradeLevel] = useState("1");
  const [newTeacherId, setNewTeacherId] = useState("");
  const [savingClass, setSavingClass] = useState(false);
  const [classError, setClassError] = useState<string | null>(null);

  // Expanded class
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [details, setDetails] = useState<Record<string, ClassDetail>>({});
  const [loadingDetail, setLoadingDetail] = useState<string | null>(null);

  // Add student to class
  const [addStudentClassId, setAddStudentClassId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState("");

  // Add subject to class
  const [addSubjectClassId, setAddSubjectClassId] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedSubjectTeacherId, setSelectedSubjectTeacherId] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session) { router.replace("/login"); return; }

      const { data: prof } = await supabaseClient
        .from("profiles").select("full_name, role, school_id").eq("id", session.user.id).single();

      if (!prof || !ADMIN_ROLES.includes(prof.role)) { router.replace("/dashboard"); return; }
      setProfile(prof);

      await loadAll(prof.school_id);
      setReady(true);
    }
    load();
  }, [router]);

  async function loadAll(schoolId: string) {
    const [classesRes, teachersRes, studentsRes, subjectsRes] = await Promise.all([
      supabaseClient.from("classes").select("id, name, grade_level, class_teacher_id").eq("school_id", schoolId).order("grade_level").order("name"),
      supabaseClient.from("profiles").select("id, full_name").eq("school_id", schoolId).eq("role", "teacher").order("full_name"),
      supabaseClient.from("profiles").select("id, full_name").eq("school_id", schoolId).eq("role", "student").order("full_name"),
      supabaseClient.from("subjects").select("id, name").order("name"),
    ]);

    const rawClasses = (classesRes.data ?? []) as { id: string; name: string; grade_level: number; class_teacher_id: string | null }[];
    const teacherMap: Record<string, string> = {};
    ((teachersRes.data ?? []) as Teacher[]).forEach((t) => { teacherMap[t.id] = t.full_name; });

    // Get student counts per class
    const classIds = rawClasses.map((c) => c.id);
    const enrollmentsRes = classIds.length
      ? await supabaseClient.from("class_enrollments").select("class_id").in("class_id", classIds)
      : { data: [] };

    const countMap: Record<string, number> = {};
    ((enrollmentsRes.data ?? []) as { class_id: string }[]).forEach((e) => {
      countMap[e.class_id] = (countMap[e.class_id] ?? 0) + 1;
    });

    setClasses(rawClasses.map((c) => ({
      ...c,
      teacher_name: c.class_teacher_id ? (teacherMap[c.class_teacher_id] ?? null) : null,
      student_count: countMap[c.id] ?? 0,
    })));
    setTeachers((teachersRes.data ?? []) as Teacher[]);
    setAllStudents((studentsRes.data ?? []) as Student[]);
    setAllSubjects((subjectsRes.data ?? []) as Subject[]);
  }

  async function loadClassDetail(classId: string) {
    setLoadingDetail(classId);
    const [enrollRes, subjectsRes] = await Promise.all([
      supabaseClient.from("class_enrollments").select("student_id, profiles(full_name)").eq("class_id", classId),
      supabaseClient.from("class_subjects").select("subject_id, teacher_id, subjects(name), profiles(full_name)").eq("class_id", classId),
    ]);

    const students: Student[] = ((enrollRes.data ?? []) as any[]).map((e) => ({
      id: e.student_id,
      full_name: e.profiles?.full_name ?? "—",
    }));

    const subjects: ClassSubjectRow[] = ((subjectsRes.data ?? []) as any[]).map((s) => ({
      subject_id: s.subject_id,
      subject_name: s.subjects?.name ?? "—",
      teacher_id: s.teacher_id,
      teacher_name: s.profiles?.full_name ?? null,
    }));

    setDetails((prev) => ({ ...prev, [classId]: { students, subjects } }));
    setLoadingDetail(null);
  }

  function toggleExpand(classId: string) {
    if (expandedId === classId) {
      setExpandedId(null);
    } else {
      setExpandedId(classId);
      if (!details[classId]) loadClassDetail(classId);
    }
  }

  async function handleAddClass() {
    if (!newClassName) { setClassError("Introduceți numele clasei."); return; }
    setSavingClass(true);
    setClassError(null);
    const { error } = await supabaseClient.from("classes").insert({
      name: newClassName,
      grade_level: parseInt(newGradeLevel),
      class_teacher_id: newTeacherId || null,
      school_id: profile!.school_id,
    });
    if (error) { setClassError(error.message); } else {
      setShowNewClass(false);
      setNewClassName(""); setNewGradeLevel("1"); setNewTeacherId("");
      await loadAll(profile!.school_id);
    }
    setSavingClass(false);
  }

  async function handleAddStudent(classId: string) {
    if (!selectedStudentId) return;
    await supabaseClient.from("class_enrollments").insert({ class_id: classId, student_id: selectedStudentId });
    setAddStudentClassId(null);
    setSelectedStudentId("");
    await loadAll(profile!.school_id);
    await loadClassDetail(classId);
  }

  async function handleRemoveStudent(classId: string, studentId: string) {
    await supabaseClient.from("class_enrollments").delete().eq("class_id", classId).eq("student_id", studentId);
    await loadAll(profile!.school_id);
    await loadClassDetail(classId);
  }

  async function handleAddSubject(classId: string) {
    if (!selectedSubjectId) return;
    await supabaseClient.from("class_subjects").insert({
      class_id: classId,
      subject_id: selectedSubjectId,
      teacher_id: selectedSubjectTeacherId || null,
    });
    setAddSubjectClassId(null);
    setSelectedSubjectId(""); setSelectedSubjectTeacherId("");
    await loadClassDetail(classId);
  }

  async function handleRemoveSubject(classId: string, subjectId: string) {
    await supabaseClient.from("class_subjects").delete().eq("class_id", classId).eq("subject_id", subjectId);
    await loadClassDetail(classId);
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
      <Head><title>Clase — Admin AgendAI</title></Head>
      <div className={`${inter.variable} ${poppins.variable} font-sans flex min-h-screen bg-slate-50 dark:bg-gray-900`}>
        <AdminSidebar fullName={profile?.full_name ?? ""} role={profile?.role ?? ""} />

        <main className="ml-64 flex-1 p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-white">Clase</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gestionează clasele din școală</p>
            </div>
            <button
              onClick={() => { setShowNewClass(true); setClassError(null); }}
              className="flex items-center gap-2 bg-[#164B2E] hover:bg-[#0d2819] text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              <Plus size={15} /> Adaugă clasă
            </button>
          </div>

          {/* New class form */}
          {showNewClass && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 mb-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Clasă nouă</h3>
                <button onClick={() => setShowNewClass(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X size={16} /></button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Nume clasă</label>
                  <input
                    type="text"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    placeholder="ex: 10B"
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#164B2E]/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Nivel clasă (1–12)</label>
                  <select
                    value={newGradeLevel}
                    onChange={(e) => setNewGradeLevel(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#164B2E]/30"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>Clasa {n}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Diriginte</label>
                  <select
                    value={newTeacherId}
                    onChange={(e) => setNewTeacherId(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#164B2E]/30"
                  >
                    <option value="">— fără diriginte —</option>
                    {teachers.map((t) => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                  </select>
                </div>
              </div>
              {classError && <p className="text-xs text-red-500 mt-3">{classError}</p>}
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleAddClass}
                  disabled={savingClass}
                  className="flex items-center gap-2 bg-[#164B2E] hover:bg-[#0d2819] disabled:opacity-60 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  {savingClass && <Loader2 size={14} className="animate-spin" />}
                  Salvează
                </button>
              </div>
            </div>
          )}

          {/* Class list */}
          <div className="space-y-3">
            {classes.length === 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 px-5 py-8 text-center text-gray-400 dark:text-gray-500 text-sm">
                Nicio clasă adăugată încă.
              </div>
            )}
            {classes.map((cls) => {
              const isExpanded = expandedId === cls.id;
              const detail = details[cls.id];
              const isLoading = loadingDetail === cls.id;
              const enrolledIds = new Set((detail?.students ?? []).map((s) => s.id));
              const unenrolled = allStudents.filter((s) => !enrolledIds.has(s.id));

              return (
                <div key={cls.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                  {/* Class card header */}
                  <button
                    onClick={() => toggleExpand(cls.id)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-[#164B2E]/10 dark:bg-[#164B2E]/20 rounded-xl px-3 py-1.5 shrink-0">
                        <span className="font-bold text-[#164B2E] dark:text-green-400 text-sm">{cls.name}</span>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Clasa {cls.grade_level}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          Diriginte: {cls.teacher_name ?? "—"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                        <Users size={13} />
                        {cls.student_count} elevi
                      </div>
                      {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 dark:border-gray-700 px-5 py-4 space-y-5">
                      {isLoading ? (
                        <div className="flex justify-center py-4">
                          <Loader2 size={18} className="animate-spin text-gray-400" />
                        </div>
                      ) : (
                        <>
                          {/* Students section */}
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Elevi</h4>
                              {addStudentClassId !== cls.id ? (
                                <button
                                  onClick={() => { setAddStudentClassId(cls.id); setSelectedStudentId(""); }}
                                  className="flex items-center gap-1 text-xs text-[#164B2E] dark:text-green-400 hover:underline font-medium"
                                >
                                  <Plus size={12} /> Adaugă elev
                                </button>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <select
                                    value={selectedStudentId}
                                    onChange={(e) => setSelectedStudentId(e.target.value)}
                                    className="text-xs px-2 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none"
                                  >
                                    <option value="">— selectează elev —</option>
                                    {unenrolled.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                                  </select>
                                  <button onClick={() => handleAddStudent(cls.id)} className="text-xs bg-[#164B2E] text-white px-3 py-1.5 rounded-lg font-medium hover:bg-[#0d2819]">Adaugă</button>
                                  <button onClick={() => setAddStudentClassId(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X size={14} /></button>
                                </div>
                              )}
                            </div>
                            {detail?.students.length === 0 ? (
                              <p className="text-xs text-gray-400 dark:text-gray-500">Niciun elev înscris.</p>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {detail?.students.map((s) => (
                                  <span key={s.id} className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2.5 py-1 rounded-full">
                                    {s.full_name}
                                    <button onClick={() => handleRemoveStudent(cls.id, s.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                      <X size={11} />
                                    </button>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Subjects section */}
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Materii</h4>
                              {addSubjectClassId !== cls.id ? (
                                <button
                                  onClick={() => { setAddSubjectClassId(cls.id); setSelectedSubjectId(""); setSelectedSubjectTeacherId(""); }}
                                  className="flex items-center gap-1 text-xs text-[#164B2E] dark:text-green-400 hover:underline font-medium"
                                >
                                  <Plus size={12} /> Adaugă materie
                                </button>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <select
                                    value={selectedSubjectId}
                                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                                    className="text-xs px-2 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none"
                                  >
                                    <option value="">— materie —</option>
                                    {allSubjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                  </select>
                                  <select
                                    value={selectedSubjectTeacherId}
                                    onChange={(e) => setSelectedSubjectTeacherId(e.target.value)}
                                    className="text-xs px-2 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none"
                                  >
                                    <option value="">— profesor —</option>
                                    {teachers.map((t) => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                                  </select>
                                  <button onClick={() => handleAddSubject(cls.id)} className="text-xs bg-[#164B2E] text-white px-3 py-1.5 rounded-lg font-medium hover:bg-[#0d2819]">Adaugă</button>
                                  <button onClick={() => setAddSubjectClassId(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><X size={14} /></button>
                                </div>
                              )}
                            </div>
                            {detail?.subjects.length === 0 ? (
                              <p className="text-xs text-gray-400 dark:text-gray-500">Nicio materie adăugată.</p>
                            ) : (
                              <div className="space-y-1.5">
                                {detail?.subjects.map((s) => (
                                  <div key={s.subject_id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-xl px-3 py-2">
                                    <div>
                                      <span className="text-xs font-medium text-gray-900 dark:text-white">{s.subject_name}</span>
                                      {s.teacher_name && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">· {s.teacher_name}</span>
                                      )}
                                    </div>
                                    <button
                                      onClick={() => handleRemoveSubject(cls.id, s.subject_id)}
                                      className="text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                      <X size={13} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </>
  );
}
