import { X, Flame } from 'lucide-react';

type StreakCalendarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function StreakCalendar({ isOpen, onClose }: StreakCalendarProps) {
  if (!isOpen) return null;

  const studyDates = [
    { date: 26, studied: true, streak: true },
    { date: 27, studied: true, streak: true },
    { date: 28, studied: true, streak: true },
    { date: 29, studied: true, streak: true },
    { date: 30, studied: true, streak: true },
    { date: 31, studied: true, streak: true },
    { date: 1, studied: true, streak: true },
  ];

  const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1);
  const emptyDays = 4;

  const getDateStatus = (date: number) => {
    return studyDates.find((d) => d.date === date);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Study Streak
            </h2>
            <p className="text-sm text-gray-600">October 2024</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="mb-6">
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: emptyDays }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square"></div>
            ))}

            {calendarDays.map((date) => {
              const status = getDateStatus(date);
              return (
                <div key={date} className="aspect-square flex items-center justify-center">
                  {status?.streak ? (
                    <div className="relative w-full h-full flex items-center justify-center p-1">
                      <svg
                        viewBox="0 0 64 80"
                        className="w-full h-full"
                        style={{
                          filter: 'drop-shadow(0 4px 12px rgba(251, 146, 60, 0.6)) drop-shadow(0 0 8px rgba(251, 146, 60, 0.4))',
                        }}
                      >
                        <defs>
                          <linearGradient id={`flameGradient-${date}`} x1="50%" y1="0%" x2="50%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#FCD34D', stopOpacity: 1 }} />
                            <stop offset="40%" style={{ stopColor: '#FBBF24', stopOpacity: 1 }} />
                            <stop offset="70%" style={{ stopColor: '#FB923C', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: '#EA580C', stopOpacity: 1 }} />
                          </linearGradient>
                        </defs>

                        <path
                          d="M 32 4
                             C 28 4, 22 12, 20 24
                             C 18 36, 20 48, 28 60
                             C 32 68, 36 72, 40 60
                             C 48 48, 50 36, 48 24
                             C 46 12, 40 4, 36 4
                             C 35 8, 34 12, 34 16
                             C 34 20, 35 24, 36 28
                             C 33 24, 31 20, 30 16
                             C 30 12, 31 8, 32 4 Z"
                          fill={`url(#flameGradient-${date})`}
                          stroke="#D97706"
                          strokeWidth="0.5"
                          strokeLinejoin="round"
                        />

                        <path
                          d="M 32 12
                             C 29 18, 28 26, 30 34
                             C 32 42, 36 48, 40 48
                             C 44 48, 48 42, 50 34
                             C 52 26, 51 18, 48 12
                             C 45 16, 40 18, 36 18
                             C 32 18, 28 16, 25 12"
                          fill="rgba(253, 224, 71, 0.5)"
                          opacity="0.6"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span
                          className="text-white font-bold text-sm leading-none"
                          style={{
                            textShadow: '0 1px 3px rgba(0,0,0,0.6), 0 0 6px rgba(210, 100, 0, 0.8)',
                            fontFamily: 'Poppins, sans-serif',
                          }}
                        >
                          {date}
                        </span>
                      </div>
                    </div>
                  ) : status?.studied ? (
                    <div className="w-full h-full rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
                      {date}
                    </div>
                  ) : (
                    <div className="w-full h-full rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 text-sm font-medium hover:bg-gray-200 transition-colors">
                      {date}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 via-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-orange-900 text-lg flex items-center gap-1">
                <Flame className="w-5 h-5 inline" />
                7-Day Streak Active
              </p>
              <p className="text-sm text-orange-700">You've studied for 7 days in a row</p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-green-500 rounded-full shadow-sm"></div>
            <span className="text-gray-600 font-medium">Study day</span>
          </div>
          <div className="flex items-center gap-2">
            <svg
              viewBox="0 0 64 80"
              className="w-5 h-5"
              style={{
                filter: 'drop-shadow(0 2px 6px rgba(251, 146, 60, 0.5))',
              }}
            >
              <defs>
                <linearGradient id="legendFlame" x1="50%" y1="0%" x2="50%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#FCD34D', stopOpacity: 1 }} />
                  <stop offset="40%" style={{ stopColor: '#FBBF24', stopOpacity: 1 }} />
                  <stop offset="70%" style={{ stopColor: '#FB923C', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#EA580C', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              <path
                d="M 32 4
                   C 28 4, 22 12, 20 24
                   C 18 36, 20 48, 28 60
                   C 32 68, 36 72, 40 60
                   C 48 48, 50 36, 48 24
                   C 46 12, 40 4, 36 4
                   C 35 8, 34 12, 34 16
                   C 34 20, 35 24, 36 28
                   C 33 24, 31 20, 30 16
                   C 30 12, 31 8, 32 4 Z"
                fill="url(#legendFlame)"
                stroke="#D97706"
                strokeWidth="0.5"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-gray-600 font-medium">Streak day</span>
          </div>
        </div>
      </div>
    </div>
  );
}
