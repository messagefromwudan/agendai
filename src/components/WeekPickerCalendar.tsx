import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

type WeekPickerCalendarProps = {
  isOpen: boolean;
  onClose: () => void;
  currentWeekOffset: number;
  onSelectWeek: (weekOffset: number) => void;
};

export default function WeekPickerCalendar({
  isOpen,
  onClose,
  currentWeekOffset,
  onSelectWeek,
}: WeekPickerCalendarProps) {
  const [viewMonth, setViewMonth] = useState(new Date());

  if (!isOpen) return null;

  const getWeekOffset = (date: Date) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1);
    startOfWeek.setHours(0, 0, 0, 0);

    const targetStartOfWeek = new Date(date);
    targetStartOfWeek.setDate(date.getDate() - date.getDay() + 1);
    targetStartOfWeek.setHours(0, 0, 0, 0);

    const diffTime = targetStartOfWeek.getTime() - startOfWeek.getTime();
    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
    return diffWeeks;
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const handlePrevMonth = () => {
    setViewMonth(new Date(year, month - 1));
  };

  const handleNextMonth = () => {
    setViewMonth(new Date(year, month + 1));
  };

  const handleDateClick = (day: number) => {
    const selectedDate = new Date(year, month, day);
    const weekOffset = getWeekOffset(selectedDate);
    onSelectWeek(weekOffset);
    onClose();
  };

  const isCurrentWeek = (day: number) => {
    const date = new Date(year, month, day);
    const weekOffset = getWeekOffset(date);
    return weekOffset === currentWeekOffset;
  };

  const monthNames = [
    'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
    'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'
  ];

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Alege săptămâna
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="font-semibold text-gray-900">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sâ', 'Du'].map((day) => (
            <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square"></div>
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isCurrent = isCurrentWeek(day);
            return (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                  isCurrent
                    ? 'bg-[#164B2E] text-white shadow-md'
                    : 'hover:bg-gray-100 text-gray-900'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>

        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-800">
            Dă click pe orice dată pentru a sări la săptămâna respectivă. Săptămâna evidențiată este cea selectată acum.
          </p>
        </div>
      </div>
    </div>
  );
}
