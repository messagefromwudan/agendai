import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Student = {
  id: string;
  full_name: string;
  student_id: string;
  class_name: string;
  institution: string;
  avatar_url?: string;
  current_gpa: number;
  total_study_time: number;
  badges: string[];
  created_at: string;
  updated_at: string;
};

export type Subject = {
  id: string;
  student_id: string;
  name: string;
  teacher_name: string;
  current_grade: number;
  semester_average: number;
  trend: 'up' | 'down' | 'stable';
  created_at: string;
};

export type Grade = {
  id: string;
  subject_id: string;
  student_id: string;
  grade_value: number;
  grade_type: 'test' | 'quiz' | 'homework' | 'project';
  description?: string;
  date_received: string;
  teacher_notes?: string;
  created_at: string;
};

export type Homework = {
  id: string;
  student_id: string;
  subject_id: string;
  title: string;
  description?: string;
  difficulty: 1 | 2 | 3;
  due_date: string;
  completed: boolean;
  ai_suggestion?: string;
  created_at: string;
  completed_at?: string;
};

export type ScheduleEvent = {
  id: string;
  student_id: string;
  subject_id?: string;
  title: string;
  event_type: 'class' | 'test' | 'meeting' | 'study';
  start_time: string;
  end_time: string;
  location?: string;
  description?: string;
  created_at: string;
};

export type Message = {
  id: string;
  student_id: string;
  sender_name: string;
  sender_type: 'teacher' | 'student' | 'admin';
  subject: string;
  content: string;
  read: boolean;
  created_at: string;
};

export type Achievement = {
  id: string;
  student_id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  created_at: string;
};
