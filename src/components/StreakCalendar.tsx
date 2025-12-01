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
              Streak de studiu
            </h2>
            <p className="text-sm text-gray-600">Octombrie 2024</p>
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
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day) => (
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
                    <div
                      className="w-full h-full rounded-lg bg-gradient-to-br from-yellow-400 via-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-base shadow-lg"
                      style={{
                        filter: 'drop-shadow(0 8px 20px rgba(251, 146, 60, 0.6)) drop-shadow(0 4px 12px rgba(249, 115, 22, 0.4))',
                        fontFamily: 'Poppins, sans-serif',
                        letterSpacing: '-0.5px',
                        textShadow: '0 1px 2px rgba(255,255,255,0.3), 0 0 6px rgba(180, 83, 9, 0.5)',
                      }}
                    >
                      {date}
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
                Streak de 7 zile activ
              </p>
              <p className="text-sm text-orange-700">Ai studiat 7 zile la rând</p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-green-500 rounded-full shadow-sm"></div>
            <span className="text-gray-600 font-medium">Zi de studiu</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gradient-to-br from-yellow-400 via-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-sm">
              <Flame className="w-3 h-3 text-white" />
            </div>
            <span className="text-gray-600 font-medium">Zi cu streak</span>
          </div>
        </div>
      </div>
    </div>
  );
}
