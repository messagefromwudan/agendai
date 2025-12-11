import { supabase } from '../lib/supabase';

type NotificationType = 'homework' | 'tests' | 'streak' | 'messages' | 'aiTutor';

export type NotificationSettings = Record<NotificationType, boolean>;

export type UserPreferences = {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'ro';
  notifications: NotificationSettings;
};

export const getDefaultPreferences = (): UserPreferences => ({
  theme: 'light',
  language: 'en',
  notifications: {
    homework: true,
    tests: true,
    streak: true,
    messages: true,
    aiTutor: true,
  },
});

export const loadPreferences = async (): Promise<UserPreferences> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return getDefaultPreferences();

    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!prefs) {
      await createDefaultPreferences(user.id);
      return getDefaultPreferences();
    }

    return {
      theme: (prefs.theme as 'light' | 'dark' | 'system') || 'light',
      language: (prefs.language as 'en' | 'ro') || 'en',
      notifications: {
        homework: prefs.notify_homework ?? true,
        tests: prefs.notify_tests ?? true,
        streak: prefs.notify_streak ?? true,
        messages: prefs.notify_messages ?? true,
        aiTutor: prefs.notify_ai_tutor ?? true,
      },
    };
  } catch (error) {
    console.error('Failed to load preferences:', error);
    return getDefaultPreferences();
  }
};

const createDefaultPreferences = async (userId: string): Promise<void> => {
  try {
    await supabase.from('user_preferences').insert({
      user_id: userId,
      theme: 'light',
      language: 'en',
      notify_homework: true,
      notify_tests: true,
      notify_streak: true,
      notify_messages: true,
      notify_ai_tutor: true,
    });
  } catch (error) {
    console.error('Failed to create default preferences:', error);
  }
};

export const updateTheme = async (theme: 'light' | 'dark' | 'system'): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        theme,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    return !error;
  } catch (error) {
    console.error('Failed to update theme:', error);
    return false;
  }
};

export const updateLanguage = async (language: 'en' | 'ro'): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        language,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    return !error;
  } catch (error) {
    console.error('Failed to update language:', error);
    return false;
  }
};

export const updateNotificationSetting = async (
  type: NotificationType,
  enabled: boolean
): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const columnMap: Record<NotificationType, string> = {
      homework: 'notify_homework',
      tests: 'notify_tests',
      streak: 'notify_streak',
      messages: 'notify_messages',
      aiTutor: 'notify_ai_tutor',
    };

    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        [columnMap[type]]: enabled,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    return !error;
  } catch (error) {
    console.error('Failed to update notification setting:', error);
    return false;
  }
};
