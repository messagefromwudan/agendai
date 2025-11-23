type NotificationType = 'homework' | 'tests' | 'streak' | 'messages' | 'aiTutor';

export type NotificationSettings = Record<NotificationType, boolean>;

export type UserPreferences = {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'ro';
  notifications: NotificationSettings;
};

const STORAGE_KEY = 'agendai_user_preferences';

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

export const loadPreferences = (): UserPreferences => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...getDefaultPreferences(), ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Failed to load preferences:', error);
  }
  return getDefaultPreferences();
};

export const savePreferences = (preferences: UserPreferences): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Failed to save preferences:', error);
  }
};

export const updateTheme = (theme: 'light' | 'dark' | 'system'): void => {
  const preferences = loadPreferences();
  preferences.theme = theme;
  savePreferences(preferences);
};

export const updateLanguage = (language: 'en' | 'ro'): void => {
  const preferences = loadPreferences();
  preferences.language = language;
  savePreferences(preferences);
};

export const updateNotificationSetting = (
  type: NotificationType,
  enabled: boolean
): void => {
  const preferences = loadPreferences();
  preferences.notifications[type] = enabled;
  savePreferences(preferences);
};
