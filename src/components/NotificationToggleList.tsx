import { Bell, BookOpen, Target, MessageSquare, Brain, Flame } from 'lucide-react';

type NotificationType = 'homework' | 'tests' | 'streak' | 'messages' | 'aiTutor';

type NotificationSettings = Record<NotificationType, boolean>;

type NotificationToggleListProps = {
  settings: NotificationSettings;
  onChange: (type: NotificationType, enabled: boolean) => void;
};

const notificationConfig = {
  homework: {
    icon: BookOpen,
    label: 'Homework Reminders',
    description: 'Get notified about upcoming assignments and deadlines',
    color: 'blue',
  },
  tests: {
    icon: Target,
    label: 'Test Reminders',
    description: 'Receive alerts for upcoming tests and exams',
    color: 'orange',
  },
  streak: {
    icon: Flame,
    label: 'Daily Streak',
    description: 'Daily reminders to maintain your study streak',
    color: 'red',
  },
  messages: {
    icon: MessageSquare,
    label: 'Messages',
    description: 'Notifications for new messages from teachers',
    color: 'purple',
  },
  aiTutor: {
    icon: Brain,
    label: 'AI Tutor Suggestions',
    description: 'Get personalized study recommendations from AI',
    color: 'green',
  },
};

const colorClasses: Record<string, string> = {
  blue: 'bg-blue-50',
  orange: 'bg-orange-50',
  red: 'bg-orange-50',
  purple: 'bg-purple-50',
  green: 'bg-green-50',
};

const iconColors: Record<string, string> = {
  blue: 'text-blue-600',
  orange: 'text-orange-600',
  red: 'text-orange-600',
  purple: 'text-purple-600',
  green: 'text-green-600',
};

export default function NotificationToggleList({ settings, onChange }: NotificationToggleListProps) {
  return (
    <div className="space-y-3">
      {(Object.keys(notificationConfig) as NotificationType[]).map((type) => {
        const config = notificationConfig[type];
        const Icon = config.icon;
        const isEnabled = settings[type];

        return (
          <div
            key={type}
            className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className={`w-10 h-10 ${colorClasses[config.color]} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${iconColors[config.color]}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">{config.label}</p>
                <p className="text-sm text-gray-600">{config.description}</p>
              </div>
            </div>
            <button
              onClick={() => onChange(type, !isEnabled)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onChange(type, !isEnabled);
                }
              }}
              className={`relative w-14 h-8 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#164B2E] focus:ring-offset-2 flex-shrink-0 ${
                isEnabled ? 'bg-[#164B2E]' : 'bg-gray-300'
              }`}
              role="switch"
              aria-checked={isEnabled}
              aria-label={`Toggle ${config.label}`}
            >
              <div
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  isEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              ></div>
            </button>
          </div>
        );
      })}
    </div>
  );
}
