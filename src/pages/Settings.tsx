import { useState, useEffect } from 'react';
import { Moon, Sun, Monitor, User, Shield, Trash2, CheckCircle2, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import SettingsSection from '../components/SettingsSection';
import ThemeOptionPreview from '../components/ThemeOptionPreview';
import NotificationToggleList from '../components/NotificationToggleList';
import LanguageSelector from '../components/LanguageSelector';
import DeleteAccountFlow from '../components/DeleteAccountFlow';
import {
  loadPreferences,
  updateTheme,
  updateLanguage,
  updateNotificationSetting,
  type NotificationSettings,
} from '../utils/settingsHelpers';

type ToastType = {
  message: string;
  show: boolean;
};

type NotificationType = 'homework' | 'tests' | 'streak' | 'messages' | 'aiTutor';

export default function Settings() {
  const { user } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [language, setLanguage] = useState<'en' | 'ro'>('en');
  const [notifications, setNotifications] = useState<NotificationSettings>({
    homework: true,
    tests: true,
    streak: true,
    messages: true,
    aiTutor: true,
  });
  const [toast, setToast] = useState<ToastType>({ message: '', show: false });
  const [showDeleteFlow, setShowDeleteFlow] = useState(false);
  const [allChangesSaved, setAllChangesSaved] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    setLoading(true);
    const prefs = await loadPreferences();
    setTheme(prefs.theme);
    setLanguage(prefs.language);
    setNotifications(prefs.notifications);
    setLoading(false);
  };

  const showToast = (message: string) => {
    setToast({ message, show: true });
    setTimeout(() => {
      setToast({ message: '', show: false });
    }, 3000);
  };

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    const success = await updateTheme(newTheme);
    if (success) {
      showToast('Temă actualizată');
    }
  };

  const handleLanguageChange = async (newLanguage: 'en' | 'ro') => {
    setLanguage(newLanguage);
    const success = await updateLanguage(newLanguage);
    if (success) {
      showToast('Limbă actualizată');
    }
  };

  const handleNotificationChange = async (type: NotificationType, enabled: boolean) => {
    setNotifications((prev) => ({ ...prev, [type]: enabled }));
    const success = await updateNotificationSetting(type, enabled);
    if (success) {
      showToast('Notificări actualizate');
    }
  };

  const handleDeleteAccount = () => {
    console.log('Account deletion confirmed');
    showToast('Ștergere cont inițiată');
  };

  const handleManageEmail = () => {
    console.log('Manage email clicked');
  };

  const handleChangePassword = () => {
    console.log('Change password clicked');
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#164B2E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Se încarcă setările...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Setări
        </h1>
        {allChangesSaved && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle2 className="w-4 h-4" />
            <span className="font-medium">Toate modificările au fost salvate</span>
          </div>
        )}
      </div>

      <SettingsSection
        title="Aspect"
        description="Personalizează cum arată AgendAI pe dispozitivul tău"
      >
        <label className="block text-sm font-medium text-gray-700 mb-3">Temă</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(['light', 'dark', 'system'] as const).map((themeOption) => {
            const icons = {
              light: Sun,
              dark: Moon,
              system: Monitor,
            };
            const Icon = icons[themeOption];
            const isSelected = theme === themeOption;

            return (
              <button
                key={themeOption}
                onClick={() => handleThemeChange(themeOption)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleThemeChange(themeOption);
                  }
                }}
                className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-[#164B2E] focus:ring-offset-2 ${
                  isSelected
                    ? 'border-[#164B2E] bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <ThemeOptionPreview theme={themeOption} />
                <div className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-[#164B2E]' : 'text-gray-600'}`} />
                  <span className={`text-sm font-medium capitalize ${isSelected ? 'text-[#164B2E]' : 'text-gray-700'}`}>
                    {themeOption}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </SettingsSection>

      <SettingsSection
        title="Notificări"
        description="Gestionează mementourile și alertele de studiu"
      >
        <NotificationToggleList
          settings={notifications}
          onChange={handleNotificationChange}
        />
      </SettingsSection>

      <SettingsSection
        title="Limbă și Regiune"
        description="Alege limba preferată"
      >
        <LanguageSelector selected={language} onChange={handleLanguageChange} />
      </SettingsSection>

      <SettingsSection
        title="Confidențialitate și Cont"
        description="Gestionează setările contului și confidențialitatea"
      >
        <div className="space-y-4">
          <button
            onClick={handleManageEmail}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleManageEmail();
              }
            }}
            className="w-full flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#164B2E] focus:ring-offset-2"
          >
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-gray-900">Gestionează Email</p>
              <p className="text-sm text-gray-600">{user?.email || 'No email'}</p>
            </div>
          </button>

          <button
            onClick={handleChangePassword}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleChangePassword();
              }
            }}
            className="w-full flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#164B2E] focus:ring-offset-2"
          >
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-gray-900">Schimbă Parola</p>
              <p className="text-sm text-gray-600">Actualizează parola contului</p>
            </div>
          </button>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleLogout();
              }
            }}
            className="w-full flex items-center gap-3 p-4 rounded-xl border border-orange-200 bg-orange-50 hover:bg-orange-100 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50"
          >
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <LogOut className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-orange-900">Deconectare</p>
              <p className="text-sm text-orange-700">Ieși din contul tău</p>
            </div>
          </button>

          <button
            onClick={() => setShowDeleteFlow(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setShowDeleteFlow(true);
              }
            }}
            className="w-full flex items-center gap-3 p-4 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-red-900">Șterge Contul</p>
              <p className="text-sm text-red-700">
                Această acțiune este permanentă. Datele tale nu pot fi recuperate.
              </p>
            </div>
          </button>
        </div>
      </SettingsSection>

      <DeleteAccountFlow
        isOpen={showDeleteFlow}
        onClose={() => setShowDeleteFlow(false)}
        onConfirm={handleDeleteAccount}
      />

      {toast.show && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-slide-up z-50">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          <span className="font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
