import { supabase } from '../lib/supabase';

export type AITutorMode = 'explain' | 'quiz' | 'homework';

export type AITutorSession = {
  id: string;
  userId: string;
  mode: AITutorMode;
  subject?: string;
  topic?: string;
  knowledgePointsEarned: number;
  startedAt: string;
  lastActivityAt: string;
  isActive: boolean;
};

export type MessageFormattedContent = {
  sections?: Array<{
    type: 'heading' | 'paragraph' | 'info_box';
    content?: string;
    title?: string;
    color?: string;
    items?: string[];
    inline_code?: string;
  }>;
  actions?: Array<{
    label: string;
    style: 'primary' | 'secondary';
  }>;
  type?: 'progress';
  title?: string;
  message?: string;
  points?: number;
  color?: string;
};

export type QuickAction = {
  label: string;
  colorScheme: string;
};

export type AITutorMessage = {
  id: string;
  sessionId: string;
  senderType: 'ai' | 'user';
  content: string;
  formattedContent?: MessageFormattedContent;
  quickActions?: QuickAction[];
  messageType: 'message' | 'progress_notification' | 'suggestion';
  createdAt: string;
};

export type AITutorQuickAction = {
  id: string;
  label: string;
  prompt: string;
  category: string;
  colorScheme: string;
  iconName: string;
  orderIndex: number;
};

export async function fetchActiveSession(): Promise<AITutorSession | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: session } = await supabase
    .from('ai_tutor_sessions')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('last_activity_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!session) return null;

  return {
    id: session.id,
    userId: session.user_id,
    mode: session.mode,
    subject: session.subject,
    topic: session.topic,
    knowledgePointsEarned: session.knowledge_points_earned,
    startedAt: session.started_at,
    lastActivityAt: session.last_activity_at,
    isActive: session.is_active,
  };
}

export async function fetchSessionMessages(sessionId: string): Promise<AITutorMessage[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: messages } = await supabase
    .from('ai_tutor_messages')
    .select('*')
    .eq('session_id', sessionId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (!messages) return [];

  return messages.map((m) => ({
    id: m.id,
    sessionId: m.session_id,
    senderType: m.sender_type,
    content: m.content,
    formattedContent: m.formatted_content,
    quickActions: m.quick_actions,
    messageType: m.message_type,
    createdAt: m.created_at,
  }));
}

export async function fetchQuickActions(): Promise<AITutorQuickAction[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: actions } = await supabase
    .from('ai_tutor_quick_actions')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('order_index', { ascending: true });

  if (!actions) return [];

  return actions.map((a) => ({
    id: a.id,
    label: a.label,
    prompt: a.prompt,
    category: a.category,
    colorScheme: a.color_scheme,
    iconName: a.icon_name,
    orderIndex: a.order_index,
  }));
}

export async function createSession(
  mode: AITutorMode,
  subject?: string,
  topic?: string
): Promise<AITutorSession | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: session, error } = await supabase
    .from('ai_tutor_sessions')
    .insert({
      user_id: user.id,
      mode,
      subject,
      topic,
      knowledge_points_earned: 0,
      is_active: true,
    })
    .select()
    .single();

  if (error || !session) return null;

  return {
    id: session.id,
    userId: session.user_id,
    mode: session.mode,
    subject: session.subject,
    topic: session.topic,
    knowledgePointsEarned: session.knowledge_points_earned,
    startedAt: session.started_at,
    lastActivityAt: session.last_activity_at,
    isActive: session.is_active,
  };
}

export async function addMessage(
  sessionId: string,
  senderType: 'ai' | 'user',
  content: string,
  formattedContent?: MessageFormattedContent,
  quickActions?: QuickAction[],
  messageType: 'message' | 'progress_notification' | 'suggestion' = 'message'
): Promise<AITutorMessage | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: message, error } = await supabase
    .from('ai_tutor_messages')
    .insert({
      session_id: sessionId,
      user_id: user.id,
      sender_type: senderType,
      content,
      formatted_content: formattedContent,
      quick_actions: quickActions,
      message_type: messageType,
    })
    .select()
    .single();

  if (error || !message) return null;

  await supabase
    .from('ai_tutor_sessions')
    .update({ last_activity_at: new Date().toISOString() })
    .eq('id', sessionId);

  return {
    id: message.id,
    sessionId: message.session_id,
    senderType: message.sender_type,
    content: message.content,
    formattedContent: message.formatted_content,
    quickActions: message.quick_actions,
    messageType: message.message_type,
    createdAt: message.created_at,
  };
}

export async function updateSessionKnowledgePoints(
  sessionId: string,
  pointsToAdd: number
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: session } = await supabase
    .from('ai_tutor_sessions')
    .select('knowledge_points_earned')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single();

  if (!session) return;

  await supabase
    .from('ai_tutor_sessions')
    .update({
      knowledge_points_earned: session.knowledge_points_earned + pointsToAdd,
      last_activity_at: new Date().toISOString(),
    })
    .eq('id', sessionId);
}

export async function endSession(sessionId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from('ai_tutor_sessions')
    .update({
      is_active: false,
      last_activity_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
    .eq('user_id', user.id);
}
