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
                        viewBox="0 0 100 120"
                        className="w-full h-full"
                        style={{
                          filter: 'drop-shadow(0 4px 8px rgba(251, 146, 60, 0.5)) drop-shadow(0 0 12px rgba(251, 146, 60, 0.3))',
                        }}
                      >
                        <defs>
                          <linearGradient id={`flameGradient-${date}`} x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#FDE047', stopOpacity: 1 }} />
                            <stop offset="25%" style={{ stopColor: '#FBBF24', stopOpacity: 1 }} />
                            <stop offset="60%" style={{ stopColor: '#FB923C', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: '#F97316', stopOpacity: 1 }} />
                          </linearGradient>
                          <radialGradient id={`flameGlow-${date}`}>
                            <stop offset="0%" style={{ stopColor: '#FDE047', stopOpacity: 0.6 }} />
                            <stop offset="100%" style={{ stopColor: '#F97316', stopOpacity: 0 }} />
                          </radialGradient>
                        </defs>

                        <ellipse cx="50" cy="95" rx="35" ry="15" fill={`url(#flameGlow-${date})`} opacity="0.4" />

                        <path
                          d="M 50 10
                             Q 60 25, 65 40
                             Q 70 55, 72 70
                             Q 73 85, 70 95
                             Q 65 105, 50 110
                             Q 35 105, 30 95
                             Q 27 85, 28 70
                             Q 30 55, 35 40
                             Q 40 25, 50 10 Z"
                          fill={`url(#flameGradient-${date})`}
                          stroke="#EA580C"
                          strokeWidth="1.5"
                          strokeLinejoin="round"
                          strokeLinecap="round"
                        />

                        <path
                          d="M 50 25
                             Q 55 35, 57 48
                             Q 58 60, 56 70
                             Q 54 80, 50 85
                             Q 46 80, 44 70
                             Q 42 60, 43 48
                             Q 45 35, 50 25 Z"
                          fill="rgba(253, 224, 71, 0.4)"
                          opacity="0.7"
                        />

                        <path
                          d="M 50 10
                             Q 52 15, 58 28
                             L 62 35
                             Q 68 25, 75 35
                             Q 70 45, 65 40
                             Q 60 30, 55 25
                             L 50 10"
                          fill={`url(#flameGradient-${date})`}
                          opacity="0.8"
                        />

                        <path
                          d="M 50 10
                             Q 48 15, 42 28
                             L 38 35
                             Q 32 25, 25 35
                             Q 30 45, 35 40
                             Q 40 30, 45 25
                             L 50 10"
                          fill={`url(#flameGradient-${date})`}
                          opacity="0.8"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center" style={{ marginTop: '2px' }}>
                        <span
                          className="text-white font-bold text-base leading-none"
                          style={{
                            textShadow: '0 2px 4px rgba(0,0,0,0.5), 0 0 8px rgba(234, 88, 12, 0.8)',
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
              viewBox="0 0 100 120"
              className="w-5 h-5"
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(251, 146, 60, 0.4))',
              }}
            >
              <defs>
                <linearGradient id="legendFlame" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#FDE047', stopOpacity: 1 }} />
                  <stop offset="25%" style={{ stopColor: '#FBBF24', stopOpacity: 1 }} />
                  <stop offset="60%" style={{ stopColor: '#FB923C', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#F97316', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              <path
                d="M 50 10
                   Q 60 25, 65 40
                   Q 70 55, 72 70
                   Q 73 85, 70 95
                   Q 65 105, 50 110
                   Q 35 105, 30 95
                   Q 27 85, 28 70
                   Q 30 55, 35 40
                   Q 40 25, 50 10 Z"
                fill="url(#legendFlame)"
                stroke="#EA580C"
                strokeWidth="1.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <path
                d="M 50 25
                   Q 55 35, 57 48
                   Q 58 60, 56 70
                   Q 54 80, 50 85
                   Q 46 80, 44 70
                   Q 42 60, 43 48
                   Q 45 35, 50 25 Z"
                fill="rgba(253, 224, 71, 0.4)"
                opacity="0.7"
              />
            </svg>
            <span className="text-gray-600 font-medium">Streak day</span>
          </div>
        </div>
      </div>
    </div>
  );
}
