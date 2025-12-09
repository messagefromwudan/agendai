import { supabase } from '../lib/supabase';

export type HomeworkItem = {
  id: string;
  userId: string;
  subjectId: string | null;
  subjectName: string;
  title: string;
  description: string | null;
  difficulty: number;
  dueDate: string;
  completed: boolean;
  completedAt: string | null;
  aiSuggestion: string | null;
  type: string;
  important: boolean;
  color: string;
  createdAt: string;
  updatedAt: string;
};

export type NewHomeworkItem = {
  subject: string;
  title: string;
  type: 'Homework' | 'Project' | 'Test Prep' | 'Lab Report';
  deadline: string;
  difficulty: number;
  description: string;
  attachments?: string[];
};

export async function fetchHomework(): Promise<HomeworkItem[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: homework } = await supabase
    .from('homework')
    .select(`
      *,
      subjects (
        name
      )
    `)
    .eq('user_id', user.id)
    .order('due_date', { ascending: true });

  if (!homework) return [];

  return homework.map((h) => ({
    id: h.id,
    userId: h.user_id,
    subjectId: h.subject_id,
    subjectName: h.subjects?.name || 'Unknown Subject',
    title: h.title,
    description: h.description,
    difficulty: h.difficulty,
    dueDate: h.due_date,
    completed: h.completed,
    completedAt: h.completed_at,
    aiSuggestion: h.ai_suggestion,
    type: h.type || 'Homework',
    important: h.important || false,
    color: h.color || 'blue',
    createdAt: h.created_at,
    updatedAt: h.updated_at,
  }));
}

export async function createHomework(homework: NewHomeworkItem): Promise<HomeworkItem | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Find the subject ID by name
  const { data: subject } = await supabase
    .from('subjects')
    .select('id')
    .eq('user_id', user.id)
    .eq('name', homework.subject)
    .maybeSingle();

  const colors = ['blue', 'green', 'purple', 'orange', 'red', 'teal'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  const { data: newHomework, error } = await supabase
    .from('homework')
    .insert({
      user_id: user.id,
      subject_id: subject?.id || null,
      title: homework.title,
      description: homework.description || null,
      difficulty: homework.difficulty,
      due_date: homework.deadline,
      completed: false,
      ai_suggestion: 'AI va analiza această temă și va oferi sugestii personalizate în curând.',
      type: homework.type,
      important: false,
      color: randomColor,
    })
    .select(`
      *,
      subjects (
        name
      )
    `)
    .single();

  if (error || !newHomework) return null;

  return {
    id: newHomework.id,
    userId: newHomework.user_id,
    subjectId: newHomework.subject_id,
    subjectName: newHomework.subjects?.name || 'Unknown Subject',
    title: newHomework.title,
    description: newHomework.description,
    difficulty: newHomework.difficulty,
    dueDate: newHomework.due_date,
    completed: newHomework.completed,
    completedAt: newHomework.completed_at,
    aiSuggestion: newHomework.ai_suggestion,
    type: newHomework.type || 'Homework',
    important: newHomework.important || false,
    color: newHomework.color || 'blue',
    createdAt: newHomework.created_at,
    updatedAt: newHomework.updated_at,
  };
}

export async function updateHomeworkCompletion(
  id: string,
  completed: boolean
): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from('homework')
    .update({
      completed,
      completed_at: completed ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id);

  return !error;
}

export async function updateHomeworkDueDate(
  id: string,
  newDueDate: string
): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from('homework')
    .update({
      due_date: newDueDate,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id);

  return !error;
}

export async function updateHomeworkImportance(
  id: string,
  important: boolean
): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from('homework')
    .update({
      important,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id);

  return !error;
}

export async function deleteHomework(id: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from('homework')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  return !error;
}

export async function fetchSubjectsForHomework(): Promise<string[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: subjects } = await supabase
    .from('subjects')
    .select('name')
    .eq('user_id', user.id)
    .order('name');

  return subjects?.map(s => s.name) || [];
}