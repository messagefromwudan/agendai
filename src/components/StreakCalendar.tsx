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
                    <svg
                      viewBox="0 0 24 24"
                      className="w-full h-full"
                      style={{ filter: 'drop-shadow(0 2px 4px rgba(251, 146, 60, 0.3))' }}
                    >
                      <defs>
                        <linearGradient id={`flameGradient-${date}`} x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" style={{ stopColor: '#FBBF24', stopOpacity: 1 }} />
                          <stop offset="50%" style={{ stopColor: '#FB923C', stopOpacity: 1 }} />
                          <stop offset="100%" style={{ stopColor: '#F97316', stopOpacity: 1 }} />
                        </linearGradient>
                      </defs>
                      <path
                        d="M12 2C12 2 8 6 8 10C8 13 10 15 12 15C14 15 16 13 16 10C16 6 12 2 12 2Z M12 15C12 15 9 17 9 19.5C9 21.5 10.3 23 12 23C13.7 23 15 21.5 15 19.5C15 17 12 15 12 15Z"
                        fill={`url(#flameGradient-${date})`}
                        stroke="#FB923C"
                        strokeWidth="0.5"
                      />
                      <text
                        x="12"
                        y="13"
                        textAnchor="middle"
                        fill="white"
                        fontSize="7"
                        fontWeight="bold"
                      >
                        {date}
                      </text>
                    </svg>
                  ) : status?.studied ? (
                    <div className="w-full h-full rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-medium shadow-sm">
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

        <div className="mt-4 flex items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">Study day</span>
          </div>
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="w-4 h-4">
              <defs>
                <linearGradient id="legendFlame" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#FBBF24', stopOpacity: 1 }} />
                  <stop offset="50%" style={{ stopColor: '#FB923C', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#F97316', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              <path
                d="M12 2C12 2 8 6 8 10C8 13 10 15 12 15C14 15 16 13 16 10C16 6 12 2 12 2Z M12 15C12 15 9 17 9 19.5C9 21.5 10.3 23 12 23C13.7 23 15 21.5 15 19.5C15 17 12 15 12 15Z"
                fill="url(#legendFlame)"
              />
            </svg>
            <span className="text-gray-600">Streak day</span>
          </div>
        </div>
      </div>
    </div>
  );
}
