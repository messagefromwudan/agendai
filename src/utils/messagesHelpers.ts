import { supabase } from '../lib/supabase';

export type Conversation = {
  id: string;
  name: string;
  role: string;
  subject: string;
  lastMessage: string;
  lastMessageTime: Date;
  unread: number;
  online: boolean;
};

export type Message = {
  id: string;
  conversationId: string;
  sender: string;
  content: string;
  time: string;
  isOwn: boolean;
  reactions: string[];
  createdAt: string;
};

export async function fetchConversations(): Promise<Conversation[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: conversations } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', user.id)
    .order('last_message_time', { ascending: false });

  if (!conversations) return [];

  return conversations.map((c) => ({
    id: c.id,
    name: c.name,
    role: c.role,
    subject: c.subject,
    lastMessage: c.last_message || '',
    lastMessageTime: new Date(c.last_message_time),
    unread: c.unread_count || 0,
    online: c.online || false,
  }));
}

export async function fetchMessages(conversationId: string): Promise<Message[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (!messages) return [];

  return messages.map((m) => ({
    id: m.id,
    conversationId: m.conversation_id,
    sender: m.sender,
    content: m.content,
    time: m.time,
    isOwn: m.is_own,
    reactions: m.reactions || [],
    createdAt: m.created_at,
  }));
}

export async function createMessage(
  conversationId: string,
  sender: string,
  content: string,
  isOwn: boolean
): Promise<Message | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const now = new Date();
  const timeString = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const { data: newMessage, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      user_id: user.id,
      sender,
      content,
      time: timeString,
      is_own: isOwn,
      reactions: [],
    })
    .select()
    .single();

  if (error || !newMessage) return null;

  await supabase
    .from('conversations')
    .update({
      last_message: content,
      last_message_time: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', conversationId);

  return {
    id: newMessage.id,
    conversationId: newMessage.conversation_id,
    sender: newMessage.sender,
    content: newMessage.content,
    time: newMessage.time,
    isOwn: newMessage.is_own,
    reactions: newMessage.reactions || [],
    createdAt: newMessage.created_at,
  };
}

export async function updateMessageReactions(
  messageId: string,
  reactions: string[]
): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from('messages')
    .update({
      reactions,
    })
    .eq('id', messageId)
    .eq('user_id', user.id);

  return !error;
}

export async function updateUnreadCount(
  conversationId: string,
  count: number
): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from('conversations')
    .update({
      unread_count: count,
      updated_at: new Date().toISOString(),
    })
    .eq('id', conversationId)
    .eq('user_id', user.id);

  return !error;
}

export async function markConversationAsRead(conversationId: string): Promise<boolean> {
  return updateUnreadCount(conversationId, 0);
}
