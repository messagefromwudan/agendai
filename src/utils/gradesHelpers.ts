import { supabase } from '../lib/supabase';

export type Subject = {
  id: string;
  name: string;
  grade: number;
  average: number;
  trend: 'up' | 'down' | 'stable';
  teacher: string;
  color: string;
  profileType?: string;
  gradeType?: string;
  averageType?: string;
  trendData?: { current: number; previous: number; assessments: number };
};

export type GradeEntry = {
  id: string;
  subjectId: string;
  subjectName: string;
  gradeValue: number;
  gradeType: 'test' | 'quiz' | 'homework' | 'project';
  description?: string;
  dateReceived: string;
  teacherNotes?: string;
};

export type AIInsight = {
  id: string;
  subject: string;
  type: 'positive' | 'improvement' | 'attention';
  title: string;
  description: string;
  actionLabel: string;
  actionType: 'practice' | 'plan' | 'tutor';
};

export async function fetchSubjects(): Promise<Subject[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: subjects } = await supabase
    .from('subjects')
    .select('*')
    .eq('user_id', user.id)
    .order('name');

  if (!subjects) return [];

  return subjects.map((s) => ({
    id: s.id,
    name: s.name,
    grade: s.current_grade || 0,
    average: s.semester_average || 0,
    trend: (s.trend as 'up' | 'down' | 'stable') || 'stable',
    teacher: s.teacher_name || 'Unknown',
    color: s.color || 'blue',
    profileType: s.profile_type,
    gradeType: s.grade_type,
    averageType: s.average_type,
    trendData: {
      current: s.current_grade || 0,
      previous: s.semester_average || 0,
      assessments: 3,
    },
  }));
}

export async function fetchGradeEntries(): Promise<GradeEntry[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: grades } = await supabase
    .from('grades')
    .select('id, subject_id, grade_value, grade_type, description, date_received, teacher_notes')
    .eq('user_id', user.id)
    .order('date_received', { ascending: false });

  if (!grades) return [];

  const subjectMap = new Map<string, string>();
  const { data: subjects } = await supabase
    .from('subjects')
    .select('id, name')
    .eq('user_id', user.id);

  subjects?.forEach((s) => subjectMap.set(s.id, s.name));

  return grades.map((g) => ({
    id: g.id,
    subjectId: g.subject_id,
    subjectName: subjectMap.get(g.subject_id) || 'Unknown',
    gradeValue: g.grade_value,
    gradeType: g.grade_type,
    description: g.description,
    dateReceived: g.date_received,
    teacherNotes: g.teacher_notes,
  }));
}

export async function fetchAIInsights(): Promise<AIInsight[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: subjects } = await supabase
    .from('subjects')
    .select('*')
    .eq('user_id', user.id)
    .order('current_grade', { ascending: false });

  if (!subjects || subjects.length === 0) return [];

  const insights: AIInsight[] = [];

  subjects.forEach((subject, index) => {
    const trend = subject.trend;
    const grade = subject.current_grade || 0;

    if (index === 0 && grade >= 9) {
      insights.push({
        id: `insight-1`,
        subject: subject.name,
        type: 'positive',
        title: `Progres excelent la ${subject.name}`,
        description: `Demonstrezi o înțelegere excelentă. Punctul tău forte este raționamentul și tehnicile de rezolvare a problemelor.`,
        actionLabel: `Exersează ${subject.name} acum`,
        actionType: 'practice',
      });
    } else if (trend === 'up') {
      insights.push({
        id: `insight-${index}`,
        subject: subject.name,
        type: 'improvement',
        title: `Îmbunătățiri la ${subject.name}`,
        description: `Metodologia și analiza ta au arătat îmbunătățiri semnificative în acest semestru.`,
        actionLabel: `Planifică o sesiune de recapitulare la ${subject.name.toLowerCase()}`,
        actionType: 'plan',
      });
    } else if (trend === 'down' || grade < 8) {
      insights.push({
        id: `insight-${index}`,
        subject: subject.name,
        type: 'attention',
        title: `${subject.name}: Concentrare pe Analiză`,
        description: `Consideră aprofundarea abilităților tale. Tutorele AI poate ajuta cu strategii și exerciții practice.`,
        actionLabel: `Întreabă Tutorele AI despre ${subject.name}`,
        actionType: 'tutor',
      });
    }
  });

  return insights.slice(0, 3);
}

export async function calculateSemesterAverage(): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { data: subjects } = await supabase
    .from('subjects')
    .select('current_grade')
    .eq('user_id', user.id);

  if (!subjects || subjects.length === 0) return 0;

  const total = subjects.reduce((sum, s) => sum + (s.current_grade || 0), 0);
  return parseFloat((total / subjects.length).toFixed(2));
}
