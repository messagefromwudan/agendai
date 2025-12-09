import { supabase } from '../lib/supabase';

export type ScheduleEvent = {
  id: string;
  title: string;
  time: string;
  location: string;
  teacher: string;
  type: string;
  color: string;
  homeworkCompleted: boolean;
  description?: string;
  notes?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

export type AITip = {
  id: string;
  type: 'focus' | 'break' | 'recap' | 'test_prep';
  icon: string;
  color: string;
  title: string;
  content: string;
  action: string;
  priority: number;
};

export async function fetchWeekSchedule(): Promise<Record<number, ScheduleEvent[]>> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return {};

  const { data: events } = await supabase
    .from('schedule_events')
    .select('*')
    .eq('user_id', user.id)
    .eq('event_type', 'class')
    .order('start_time', { ascending: true });

  if (!events) return {};

  const weekSchedule: Record<number, ScheduleEvent[]> = {};

  events.forEach((event) => {
    const dayOfWeek = event.day_of_week;

    if (!weekSchedule[dayOfWeek]) {
      weekSchedule[dayOfWeek] = [];
    }

    weekSchedule[dayOfWeek].push({
      id: event.id,
      title: event.title,
      time: `${event.start_time.slice(0, 5)} - ${event.end_time.slice(0, 5)}`,
      location: event.location || 'TBA',
      teacher: event.teacher || 'TBA',
      type: event.event_type,
      color: event.color || 'blue',
      homeworkCompleted: event.homework_completed || false,
      description: event.description,
      notes: event.notes,
      dayOfWeek: event.day_of_week,
      startTime: event.start_time,
      endTime: event.end_time,
    });
  });

  return weekSchedule;
}

export async function fetchAITips(): Promise<AITip[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: tips } = await supabase
    .from('ai_schedule_tips')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('priority', { ascending: true });

  if (!tips) return [];

  return tips.map((tip) => ({
    id: tip.id,
    type: tip.tip_type as 'focus' | 'break' | 'recap' | 'test_prep',
    icon: tip.icon_name,
    color: tip.color,
    title: tip.title,
    content: tip.content,
    action: tip.action,
    priority: tip.priority,
  }));
}

export async function updateEventNotes(eventId: string, notes: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from('schedule_events')
    .update({
      notes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', eventId)
    .eq('user_id', user.id);

  return !error;
}

export async function updateHomeworkCompletion(
  eventId: string,
  completed: boolean
): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from('schedule_events')
    .update({
      homework_completed: completed,
      updated_at: new Date().toISOString(),
    })
    .eq('id', eventId)
    .eq('user_id', user.id);

  return !error;
}

export async function createScheduleEvent(
  event: Omit<ScheduleEvent, 'id' | 'time'>
): Promise<ScheduleEvent | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: newEvent, error } = await supabase
    .from('schedule_events')
    .insert({
      user_id: user.id,
      title: event.title,
      event_type: event.type,
      start_time: event.startTime,
      end_time: event.endTime,
      day_of_week: event.dayOfWeek,
      location: event.location,
      teacher: event.teacher,
      color: event.color,
      homework_completed: event.homeworkCompleted,
      description: event.description,
      notes: event.notes,
    })
    .select()
    .single();

  if (error || !newEvent) return null;

  return {
    id: newEvent.id,
    title: newEvent.title,
    time: `${newEvent.start_time.slice(0, 5)} - ${newEvent.end_time.slice(0, 5)}`,
    location: newEvent.location || 'TBA',
    teacher: newEvent.teacher || 'TBA',
    type: newEvent.event_type,
    color: newEvent.color || 'blue',
    homeworkCompleted: newEvent.homework_completed || false,
    description: newEvent.description,
    notes: newEvent.notes,
    dayOfWeek: newEvent.day_of_week,
    startTime: newEvent.start_time,
    endTime: newEvent.end_time,
  };
}

export async function deleteScheduleEvent(eventId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from('schedule_events')
    .delete()
    .eq('id', eventId)
    .eq('user_id', user.id);

  return !error;
}
