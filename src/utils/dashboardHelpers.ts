import { supabase } from '../lib/supabase';

export type DashboardData = {
  user: { name: string };
  upcomingEvents: Array<{ type: string; subject: string; daysUntil: number }>;
  gpa: number;
  gpaStatus: string;
  activeSubjects: { total: number; needingAttention: number };
  aiSessions: { thisWeek: number; avgPerDay: number };
  homework: { completed: number; total: number; dueTomorrow: number; overdue: number };
  classesToday: Array<{
    time: string;
    duration: string;
    subject: string;
    room: string;
    teacher: string;
    color: string;
    ended: boolean;
  }>;
};

export async function fetchDashboardData(): Promise<DashboardData | null> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const [
    profileResult,
    studentResult,
    statsResult,
    subjectsResult,
    homeworkResult,
    scheduleResult,
  ] = await Promise.all([
    supabase.from('profiles').select('first_name, last_name').eq('id', user.id).single(),
    supabase.from('students').select('current_gpa, gpa_status').eq('id', user.id).maybeSingle(),
    supabase.from('dashboard_stats').select('*').eq('user_id', user.id).maybeSingle(),
    supabase.from('subjects').select('*').eq('user_id', user.id),
    supabase.from('homework').select('*').eq('user_id', user.id),
    supabase.from('schedule_events').select('*, subjects(name)').eq('user_id', user.id),
  ]);

  const profile = profileResult.data;
  const student = studentResult.data;
  const stats = statsResult.data;
  const subjects = subjectsResult.data || [];
  const homework = homeworkResult.data || [];
  const scheduleEvents = scheduleResult.data || [];

  const userName = profile?.first_name || 'Student';

  const gpa = student?.current_gpa ? Number(student.current_gpa) : 0;
  const gpaStatus = student?.gpa_status || 'Good Standing';

  const activeSubjectsTotal = subjects.length;
  const activeSubjectsNeedingAttention = subjects.filter(s => s.current_grade && Number(s.current_grade) < 7).length;

  const aiSessionsThisWeek = stats?.ai_sessions_this_week || 0;
  const aiSessionsAvgPerDay = stats?.ai_sessions_avg_per_day ? Number(stats.ai_sessions_avg_per_day) : 0;

  const homeworkCompleted = homework.filter(h => h.completed).length;
  const homeworkTotal = homework.length;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const dayAfterTomorrow = new Date(tomorrow);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

  const homeworkDueTomorrow = homework.filter(h => {
    if (h.completed) return false;
    const dueDate = new Date(h.due_date);
    return dueDate >= tomorrow && dueDate < dayAfterTomorrow;
  }).length;

  const now = new Date();
  const homeworkOverdue = homework.filter(h => {
    if (h.completed) return false;
    const dueDate = new Date(h.due_date);
    return dueDate < now;
  }).length;

  const upcomingEvents = scheduleEvents
    .filter(event => {
      if (event.event_type !== 'test') return false;
      const eventDate = new Date();
      const [hours, minutes] = event.start_time.split(':').map(Number);
      eventDate.setHours(hours, minutes, 0, 0);

      const daysUntil = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil >= 0 && daysUntil <= 7;
    })
    .map(event => ({
      type: event.event_type,
      subject: event.title,
      daysUntil: Math.ceil((new Date(event.start_time).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    }))
    .sort((a, b) => a.daysUntil - b.daysUntil);

  const todayDayOfWeek = now.getDay();
  const adjustedDayOfWeek = todayDayOfWeek === 0 ? 6 : todayDayOfWeek - 1;

  const classesToday = scheduleEvents
    .filter(event => event.day_of_week === adjustedDayOfWeek && event.event_type === 'class')
    .map(event => {
      const [startHours, startMinutes] = event.start_time.split(':').map(Number);
      const [endHours, endMinutes] = event.end_time.split(':').map(Number);

      const durationMs = (endHours * 60 + endMinutes - (startHours * 60 + startMinutes)) * 60000;
      const durationHours = Math.floor(durationMs / 3600000);
      const durationMinutes = Math.floor((durationMs % 3600000) / 60000);

      let duration = '';
      if (durationHours > 0) {
        duration = `${durationHours}h`;
        if (durationMinutes > 0) {
          duration += ` ${durationMinutes}m`;
        }
      } else {
        duration = `${durationMinutes}m`;
      }

      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const endMinutesTotal = endHours * 60 + endMinutes;
      const ended = currentMinutes >= endMinutesTotal;

      return {
        time: event.start_time,
        duration,
        subject: event.title,
        room: event.location || 'TBA',
        teacher: event.teacher || 'TBA',
        color: event.color || '#164B2E',
        ended,
      };
    })
    .sort((a, b) => a.time.localeCompare(b.time));

  return {
    user: { name: userName },
    upcomingEvents,
    gpa,
    gpaStatus,
    activeSubjects: {
      total: activeSubjectsTotal,
      needingAttention: activeSubjectsNeedingAttention,
    },
    aiSessions: {
      thisWeek: aiSessionsThisWeek,
      avgPerDay: aiSessionsAvgPerDay,
    },
    homework: {
      completed: homeworkCompleted,
      total: homeworkTotal,
      dueTomorrow: homeworkDueTomorrow,
      overdue: homeworkOverdue,
    },
    classesToday,
  };
}

export async function updateDashboardStats(userId: string): Promise<void> {
  const [subjectsResult, homeworkResult, aiSessionsResult] = await Promise.all([
    supabase.from('subjects').select('current_grade').eq('user_id', userId),
    supabase.from('homework').select('completed, due_date').eq('user_id', userId),
    supabase.from('ai_sessions').select('session_date').eq('user_id', userId).gte('session_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
  ]);

  const subjects = subjectsResult.data || [];
  const homework = homeworkResult.data || [];
  const aiSessions = aiSessionsResult.data || [];

  const activeSubjectsTotal = subjects.length;
  const activeSubjectsNeedingAttention = subjects.filter(s => s.current_grade && Number(s.current_grade) < 7).length;

  const homeworkCompleted = homework.filter(h => h.completed).length;
  const homeworkTotal = homework.length;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const dayAfterTomorrow = new Date(tomorrow);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

  const homeworkDueTomorrow = homework.filter(h => {
    if (h.completed) return false;
    const dueDate = new Date(h.due_date);
    return dueDate >= tomorrow && dueDate < dayAfterTomorrow;
  }).length;

  const now = new Date();
  const homeworkOverdue = homework.filter(h => {
    if (h.completed) return false;
    const dueDate = new Date(h.due_date);
    return dueDate < now;
  }).length;

  const aiSessionsThisWeek = aiSessions.length;
  const aiSessionsAvgPerDay = aiSessionsThisWeek / 7;

  await supabase
    .from('dashboard_stats')
    .upsert({
      user_id: userId,
      active_subjects_total: activeSubjectsTotal,
      active_subjects_needing_attention: activeSubjectsNeedingAttention,
      ai_sessions_this_week: aiSessionsThisWeek,
      ai_sessions_avg_per_day: aiSessionsAvgPerDay,
      homework_completed: homeworkCompleted,
      homework_total: homeworkTotal,
      homework_due_tomorrow: homeworkDueTomorrow,
      homework_overdue: homeworkOverdue,
      last_updated: new Date().toISOString(),
    }, {
      onConflict: 'user_id',
    });
}
