import { useState } from 'react';
import { Moon, Sun, Monitor, Bell, Globe, User, Shield, Trash2, Save } from 'lucide-react';

export default function Settings() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState<'en' | 'ro'>('en');
  const [showToast, setShowToast] = useState(false);

  const handleSave = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
        Settings
      </h1>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Appearance</h2>
          <p className="text-sm text-gray-600">Customize how AgendAI looks on your device</p>
        </div>

        <div className="p-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setTheme('light')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                theme === 'light'
                  ? 'border-[#164B2E] bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Sun className={`w-6 h-6 ${theme === 'light' ? 'text-[#164B2E]' : 'text-gray-600'}`} />
              <span className={`text-sm font-medium ${theme === 'light' ? 'text-[#164B2E]' : 'text-gray-700'}`}>
                Light
              </span>
            </button>

            <button
              onClick={() => setTheme('dark')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                theme === 'dark'
                  ? 'border-[#164B2E] bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Moon className={`w-6 h-6 ${theme === 'dark' ? 'text-[#164B2E]' : 'text-gray-600'}`} />
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-[#164B2E]' : 'text-gray-700'}`}>
                Dark
              </span>
            </button>

            <button
              onClick={() => setTheme('system')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                theme === 'system'
                  ? 'border-[#164B2E] bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Monitor className={`w-6 h-6 ${theme === 'system' ? 'text-[#164B2E]' : 'text-gray-600'}`} />
              <span className={`text-sm font-medium ${theme === 'system' ? 'text-[#164B2E]' : 'text-gray-700'}`}>
                System
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Notifications</h2>
          <p className="text-sm text-gray-600">Manage your study reminders and alerts</p>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Enable Notifications</p>
                <p className="text-sm text-gray-600">Receive study reminders and deadline alerts</p>
              </div>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                notifications ? 'bg-[#164B2E]' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  notifications ? 'translate-x-6' : 'translate-x-0'
                }`}
              ></div>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Language & Region</h2>
          <p className="text-sm text-gray-600">Choose your preferred language</p>
        </div>

        <div className="p-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Language</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setLanguage('en')}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                language === 'en'
                  ? 'border-[#164B2E] bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Globe className={`w-5 h-5 ${language === 'en' ? 'text-[#164B2E]' : 'text-gray-600'}`} />
              <span className={`font-medium ${language === 'en' ? 'text-[#164B2E]' : 'text-gray-700'}`}>
                English
              </span>
            </button>

            <button
              onClick={() => setLanguage('ro')}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                language === 'ro'
                  ? 'border-[#164B2E] bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Globe className={`w-5 h-5 ${language === 'ro' ? 'text-[#164B2E]' : 'text-gray-600'}`} />
              <span className={`font-medium ${language === 'ro' ? 'text-[#164B2E]' : 'text-gray-700'}`}>
                Română
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Privacy & Account</h2>
          <p className="text-sm text-gray-600">Manage your account settings and privacy</p>
        </div>

        <div className="p-6 space-y-4">
          <button className="w-full flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-gray-900">Manage Email</p>
              <p className="text-sm text-gray-600">bianca.popescu@student.ro</p>
            </div>
          </button>

          <button className="w-full flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-gray-900">Change Password</p>
              <p className="text-sm text-gray-600">Update your account password</p>
            </div>
          </button>

          <button className="w-full flex items-center gap-3 p-4 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 transition-colors">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-red-900">Delete Account</p>
              <p className="text-sm text-red-700">Permanently delete your account and data</p>
            </div>
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-[#164B2E] text-white rounded-xl font-medium hover:bg-[#0d2819] transition-colors shadow-lg hover:shadow-xl"
        >
          <Save className="w-5 h-5" />
          Save Changes
        </button>
      </div>

      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-slide-up z-50">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          <span className="font-medium">Settings saved successfully!</span>
        </div>
      )}
    </div>
  );
}
