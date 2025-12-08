import { supabase } from '../lib/supabase';

export type ProfileData = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  studentId: string;
  className: string;
  institution: string;
  academicYear: string;
  profileImage: string;
  mainBadgeType: 'top-10' | 'hard-worker' | 'comeback' | 'consistent-learner' | 'star';
  additionalBadges: ('top-10' | 'hard-worker' | 'comeback' | 'consistent-learner' | 'star')[];
};

export type ProfileStats = {
  subjectsMastered: number;
  studyHoursThisWeek: number;
  knowledgePoints: number;
};

export type Achievement = {
  id: string;
  name: string;
  icon: string;
  color: string;
  earned: boolean;
  description: string;
  howToGet: string;
  earnedAt?: string;
};

export type SubjectProgress = {
  id: string;
  subjectName: string;
  score: number;
};

export async function fetchProfileData(): Promise<ProfileData | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [profileResult, studentResult] = await Promise.all([
    supabase.from('profiles').select('first_name, last_name, avatar_url').eq('id', user.id).single(),
    supabase
      .from('students')
      .select('student_id, class_name, institution, academic_year, profile_image, main_badge_type, additional_badges')
      .eq('id', user.id)
      .maybeSingle(),
  ]);

  if (!profileResult.data) return null;

  const profile = profileResult.data;
  const student = studentResult.data;

  return {
    id: user.id,
    firstName: profile.first_name || '',
    lastName: profile.last_name || '',
    fullName: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Student',
    studentId: student?.student_id || 'N/A',
    className: student?.class_name || 'Not Set',
    institution: student?.institution || 'Not Set',
    academicYear: student?.academic_year || 'Not Set',
    profileImage: student?.profile_image || profile.avatar_url || 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
    mainBadgeType: (student?.main_badge_type as any) || 'consistent-learner',
    additionalBadges: (student?.additional_badges as any) || [],
  };
}

export async function fetchProfileStats(): Promise<ProfileStats | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: student } = await supabase
    .from('students')
    .select('subjects_mastered, study_hours_this_week, knowledge_points')
    .eq('id', user.id)
    .maybeSingle();

  if (!student) {
    return {
      subjectsMastered: 0,
      studyHoursThisWeek: 0,
      knowledgePoints: 0,
    };
  }

  return {
    subjectsMastered: student.subjects_mastered || 0,
    studyHoursThisWeek: student.study_hours_this_week || 0,
    knowledgePoints: student.knowledge_points || 0,
  };
}

export async function fetchAchievements(): Promise<Achievement[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: achievements } = await supabase
    .from('achievements')
    .select('*')
    .eq('user_id', user.id)
    .order('earned', { ascending: false })
    .order('created_at', { ascending: false });

  if (!achievements) return [];

  return achievements.map((a) => ({
    id: a.id,
    name: a.name,
    icon: a.icon,
    color: a.color,
    earned: a.earned,
    description: a.description,
    howToGet: a.how_to_get,
    earnedAt: a.earned_at,
  }));
}

export async function fetchSubjectProgress(): Promise<SubjectProgress[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: progress } = await supabase
    .from('subject_progress')
    .select('*')
    .eq('user_id', user.id)
    .order('score', { ascending: false });

  if (!progress) return [];

  return progress.map((p) => ({
    id: p.id,
    subjectName: p.subject_name,
    score: p.score,
  }));
}

export async function updateProfileImage(imageUrl: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from('students')
    .upsert({
      id: user.id,
      profile_image: imageUrl,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'id',
    });

  return !error;
}
