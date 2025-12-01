import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon, CheckCircle2, Circle, Coffee, Brain, BookOpen, Target } from 'lucide-react';
import ClassDetailModal from '../components/ClassDetailModal';
import WeekPickerCalendar from '../components/WeekPickerCalendar';

type ClassEvent = {
  id: number;
  title: string;
  time: string;
  location: string;
  teacher: string;
  type: string;
  color: string;
  homeworkCompleted: boolean;
  description?: string;
  notes?: string;
};

type DaySchedule = {
  [key: number]: ClassEvent[];
};

type ClassStatus = 'upcoming' | 'in-progress' | 'finished';

type AITip = {
  type: 'focus' | 'break' | 'recap' | 'test_prep';
  icon: any;
  color: string;
  title: string;
  content: string;
  action: string;
};

export default function Schedule() {
  const [viewMode, setViewMode] = useState<'week' | 'day'>(() => {
    return (localStorage.getItem('scheduleViewMode') as 'week' | 'day') || 'week';
  });
  const [selectedDay, setSelectedDay] = useState(4);
  const [weekOffset, setWeekOffset] = useState(0);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassEvent | null>(null);
  const [showClassModal, setShowClassModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentTip, setCurrentTip] = useState(0);

  const weekDays = ['Lun', 'Mar', 'Mie', 'Joi', 'Vin'];
  const dates = ['28', '29', '30', '31', '1'];

  const weekSchedule: DaySchedule = {
    0: [
      { id: 1, title: 'Mathematics', time: '08:00 - 09:30', location: 'Room 204', teacher: 'Ms. Johnson', type: 'class', color: 'blue', homeworkCompleted: true, description: 'Advanced Calculus - Derivatives and integrals', notes: 'Remember to review the homework from last week' },
      { id: 2, title: 'Physics', time: '10:00 - 11:00', location: 'Lab 3', teacher: 'Dr. Smith', type: 'class', color: 'green', homeworkCompleted: false, description: 'Newton\'s Laws - Practical applications' },
      { id: 3, title: 'Literature', time: '13:00 - 14:00', location: 'Room 101', teacher: 'Mr. Anderson', type: 'class', color: 'purple', homeworkCompleted: true, description: 'Romantic Poetry Analysis' },
    ],
    1: [
      { id: 4, title: 'Chemistry', time: '09:00 - 10:30', location: 'Lab 2', teacher: 'Dr. Brown', type: 'class', color: 'orange', homeworkCompleted: true, description: 'Chemical reactions and balancing equations' },
      { id: 5, title: 'History', time: '11:00 - 12:00', location: 'Room 305', teacher: 'Mrs. Davis', type: 'class', color: 'red', homeworkCompleted: false, description: 'World War II - Key events and outcomes' },
    ],
    2: [
      { id: 6, title: 'English', time: '08:00 - 09:00', location: 'Room 210', teacher: 'Ms. Wilson', type: 'class', color: 'teal', homeworkCompleted: true, description: 'Grammar and composition' },
      { id: 7, title: 'Mathematics', time: '10:00 - 11:30', location: 'Room 204', teacher: 'Ms. Johnson', type: 'class', color: 'blue', homeworkCompleted: true, description: 'Problem-solving session' },
    ],
    3: [
      { id: 8, title: 'Physics Lab', time: '09:00 - 11:00', location: 'Lab 3', teacher: 'Dr. Smith', type: 'class', color: 'green', homeworkCompleted: false, description: 'Hands-on experiments with motion and force' },
      { id: 9, title: 'Chemistry', time: '13:00 - 14:00', location: 'Lab 2', teacher: 'Dr. Brown', type: 'class', color: 'orange', homeworkCompleted: true, description: 'Lab report review session' },
    ],
    4: [
      { id: 10, title: 'Mathematics', time: '08:00 - 09:30', location: 'Room 204', teacher: 'Ms. Johnson', type: 'class', color: 'blue', homeworkCompleted: true, description: 'Quiz on derivatives' },
      { id: 11, title: 'Physics Lab', time: '10:00 - 12:00', location: 'Lab 3', teacher: 'Dr. Smith', type: 'class', color: 'green', homeworkCompleted: false, description: 'Final lab project presentation' },
      { id: 12, title: 'Literature', time: '13:00 - 14:00', location: 'Room 101', teacher: 'Mr. Anderson', type: 'class', color: 'purple', homeworkCompleted: true, description: 'Group discussion on assigned reading' },
    ],
  };

  const aiTips: AITip[] = [
    {
      type: 'focus',
      icon: Brain,
      color: 'blue',
      title: 'Recomandare Sesiune de Concentrare',
      content: 'Ai o pauză de 30 de minute înainte de sesiunea ta de studiu. Vrei să programezi o sesiune scurtă de concentrare pentru pregătirea testului la Fizică?',
      action: 'Programează acum',
    },
    {
      type: 'break',
      icon: Coffee,
      color: 'orange',
      title: 'Memento Pauză',
      content: 'Ai studiat 2 ore continuu. Ia o pauză de 15 minute pentru a te reîncărca și pentru a îmbunătăți retenția.',
      action: 'Setează cronometru pauză',
    },
    {
      type: 'recap',
      icon: BookOpen,
      color: 'purple',
      title: 'Sesiune de Recapitulare',
      content: 'Ora ta de Matematică s-a încheiat acum o oră. O recapitulare rapidă de 10 minute acum va îmbunătăți retenția pe termen lung cu 40%.',
      action: 'Începe recapitularea',
    },
    {
      type: 'test_prep',
      icon: Target,
      color: 'green',
      title: 'Sfat Pregătire Test',
      content: 'Testul tău la Fizică este în 2 zile. Pe baza programului tău, cel mai bun moment pentru revizuire este mâine la ora 15:00. Vrei să blochez acel timp?',
      action: 'Blochează timpul',
    },
  ];

  useEffect(() => {
    localStorage.setItem('scheduleViewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const tipTimer = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % aiTips.length);
    }, 86400000);
    return () => clearInterval(tipTimer);
  }, []);

  const getWeekRange = (offset: number) => {
    const today = new Date();
    const currentDay = today.getDay();
    const diff = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff + offset * 7);

    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);

    const formatDate = (date: Date) => {
      const months = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Noi', 'Dec'];
      return `${months[date.getMonth()]} ${date.getDate()}`;
    };

    return `Săptămâna ${formatDate(monday)} - ${formatDate(friday)}`;
  };

  const getNextClass = () => {
    const now = currentTime;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

    const todayClasses = weekSchedule[4] || [];

    for (const classEvent of todayClasses) {
      const startTime = classEvent.time.split(' - ')[0];
      if (startTime > currentTimeStr) {
        return classEvent;
      }
    }

    return weekSchedule[4]?.[0] || null;
  };

  const getClassStatus = (classEvent: ClassEvent): ClassStatus => {
    const now = currentTime;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

    const [startTime, endTime] = classEvent.time.split(' - ');

    if (currentTimeStr < startTime) {
      return 'upcoming';
    } else if (currentTimeStr >= startTime && currentTimeStr < endTime) {
      return 'in-progress';
    } else {
      return 'finished';
    }
  };

  const getMinutesUntilStart = (classEvent: ClassEvent) => {
    const now = currentTime;
    const [hours, minutes] = classEvent.time.split(' - ')[0].split(':').map(Number);
    const classTime = new Date(now);
    classTime.setHours(hours, minutes, 0);

    const diff = classTime.getTime() - now.getTime();
    const minutesDiff = Math.floor(diff / 60000);

    if (minutesDiff < 0) return 0;
    return minutesDiff;
  };

  const nextClass = getNextClass();
  const nextClassStatus = nextClass ? getClassStatus(nextClass) : 'upcoming';
  const minutesUntil = nextClass ? getMinutesUntilStart(nextClass) : 0;

  const getStatusChip = (status: ClassStatus) => {
    const configs = {
      upcoming: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Urmează' },
      'in-progress': { bg: 'bg-green-100', text: 'text-green-700', label: 'În Desfășurare' },
      finished: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Finalizat' },
    };
    const config = configs[status];
    return (
      <div className={`${config.bg} ${config.text} px-3 py-1 rounded-lg text-sm font-medium`}>
        {config.label}
      </div>
    );
  };

  const getCurrentDayIndex = () => {
    const today = new Date();
    const day = today.getDay();
    return day === 0 ? -1 : day - 1;
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string; light: string }> = {
      blue: { bg: 'bg-blue-500', border: 'border-blue-500', text: 'text-blue-700', light: 'bg-blue-50' },
      green: { bg: 'bg-green-500', border: 'border-green-500', text: 'text-green-700', light: 'bg-green-50' },
      purple: { bg: 'bg-purple-500', border: 'border-purple-500', text: 'text-purple-700', light: 'bg-purple-50' },
      orange: { bg: 'bg-orange-500', border: 'border-orange-500', text: 'text-orange-700', light: 'bg-orange-50' },
      red: { bg: 'bg-red-500', border: 'border-red-500', text: 'text-red-700', light: 'bg-red-50' },
      teal: { bg: 'bg-teal-500', border: 'border-teal-500', text: 'text-teal-700', light: 'bg-teal-50' },
    };
    return colors[color] || colors.blue;
  };

  const handleClassClick = (classEvent: ClassEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedClass(classEvent);
    setShowClassModal(true);
  };

  const handleSaveNotes = (notes: string) => {
    console.log('Saving notes:', notes);
  };

  const currentDayIndex = getCurrentDayIndex();
  const activeTip = aiTips[currentTip];
  const TipIcon = activeTip.icon;

  const tipColorMap: Record<string, { bg: string; border: string; icon: string }> = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'bg-blue-500' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', icon: 'bg-orange-500' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'bg-purple-500' },
    green: { bg: 'bg-green-50', border: 'border-green-200', icon: 'bg-green-500' },
  };
  const tipColors = tipColorMap[activeTip.color];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Orar Inteligent
        </h1>
        <div className="flex items-center gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-1 flex gap-1">
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'week'
                  ? 'bg-[#164B2E] text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Vedere Săptămână
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'day'
                  ? 'bg-[#164B2E] text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Vedere Zi
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWeekOffset(weekOffset - 1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => setShowCalendar(true)}
              className="font-semibold text-gray-900 px-4 hover:bg-gray-100 rounded-lg transition-colors py-2"
            >
              {getWeekRange(weekOffset)}
            </button>
            <button
              onClick={() => setWeekOffset(weekOffset + 1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {nextClass && (
        <div className="bg-gradient-to-r from-[#164B2E] to-[#0d2819] rounded-2xl p-6 text-[#F1F5F9]">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <p className="text-[#F1F5F9]/70 text-sm">Următoarea Oră</p>
                {getStatusChip(nextClassStatus)}
              </div>
              <h2 className="text-2xl font-bold mb-1">{nextClass.title}</h2>
              <p className="text-[#F1F5F9]/90">{nextClass.location} • {nextClass.teacher}</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm mb-2">
                <Clock className="w-10 h-10 text-[#F1F5F9]" />
              </div>
              {nextClassStatus === 'upcoming' && (
                <>
                  <p className="text-2xl font-bold">{minutesUntil}m</p>
                  <p className="text-sm text-[#F1F5F9]/70">până la început</p>
                </>
              )}
              {nextClassStatus === 'in-progress' && (
                <>
                  <p className="text-lg font-bold">Acum</p>
                  <p className="text-sm text-[#F1F5F9]/70">în desfășurare</p>
                </>
              )}
              {nextClassStatus === 'finished' && (
                <>
                  <p className="text-lg font-bold">Gata</p>
                  <p className="text-sm text-[#F1F5F9]/70">finalizat</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'week' ? (
        <div className="grid grid-cols-5 gap-4 items-start">
          {weekDays.map((day, index) => {
            const isToday = index === currentDayIndex;
            const dayClasses = weekSchedule[index] || [];
            return (
              <button
                key={day}
                onClick={() => {
                  setSelectedDay(index);
                  setViewMode('day');
                }}
                className={`p-4 rounded-xl transition-all text-left flex flex-col h-full ${
                  isToday
                    ? 'bg-[#164B2E] text-[#F1F5F9] shadow-lg ring-4 ring-[#164B2E]/20'
                    : 'bg-white border border-gray-200 text-gray-700 hover:shadow-md'
                }`}
              >
                <div className="mb-3 flex-shrink-0">
                  <p className={`text-xs mb-1 ${isToday ? 'text-[#F1F5F9]/70' : 'text-gray-500'}`}>{day}</p>
                  <p className="text-2xl font-bold">{dates[index]}</p>
                </div>

                <div className="space-y-2 flex-1 overflow-y-auto max-h-96">
                  {dayClasses.map((classEvent) => {
                    const colorClasses = getColorClasses(classEvent.color);
                    return (
                      <div
                        key={classEvent.id}
                        onClick={(e) => handleClassClick(classEvent, e)}
                        className={`${isToday ? 'bg-white/10 border-white/20' : `${colorClasses.light} border ${colorClasses.border}`} border rounded-lg p-2 transition-all hover:scale-105 cursor-pointer`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className={`text-xs font-semibold truncate ${isToday ? 'text-[#F1F5F9]' : colorClasses.text}`}>
                            {classEvent.title}
                          </p>
                          {classEvent.homeworkCompleted ? (
                            <CheckCircle2 className={`w-3 h-3 flex-shrink-0 ${isToday ? 'text-green-300' : 'text-green-600'}`} />
                          ) : (
                            <Circle className={`w-3 h-3 flex-shrink-0 ${isToday ? 'text-red-300' : 'text-red-600'}`} />
                          )}
                        </div>
                        <p className={`text-xs ${isToday ? 'text-[#F1F5F9]/70' : 'text-gray-500'}`}>
                          {classEvent.time.split(' - ')[0]}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {weekDays[selectedDay]}, {dates[selectedDay]} - Orar Detaliat
            </h2>
            <button
              onClick={() => setViewMode('week')}
              className="flex items-center gap-2 text-[#164B2E] hover:bg-green-50 px-4 py-2 rounded-lg transition-colors"
            >
              <CalendarIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Înapoi la Săptămână</span>
            </button>
          </div>
          <div className="space-y-4">
            {(weekSchedule[selectedDay] || []).map((event) => {
              const colorClasses = getColorClasses(event.color);
              return (
                <div
                  key={event.id}
                  onClick={(e) => handleClassClick(event, e)}
                  className={`border-l-4 ${colorClasses.border} ${colorClasses.light} rounded-r-xl p-4 hover:shadow-md transition-all cursor-pointer group`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-center min-w-[80px]">
                      <p className="text-xs text-gray-500 mb-1">Oră</p>
                      <p className="font-semibold text-gray-900 text-sm">{event.time}</p>
                    </div>
                    <div className={`w-1 ${colorClasses.bg} rounded-full self-stretch`}></div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-1 group-hover:text-[#164B2E] transition-colors">
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{event.location}</span>
                        {event.teacher && <span>• {event.teacher}</span>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className={`px-3 py-1 ${colorClasses.light} border ${colorClasses.border} rounded-lg`}>
                        <span className={`text-xs font-medium ${colorClasses.text} capitalize`}>
                          {event.type}
                        </span>
                      </div>
                      <div className={`flex items-center gap-1 px-3 py-1 rounded-lg ${
                        event.homeworkCompleted
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-red-50 border border-red-200'
                      }`}>
                        {event.homeworkCompleted ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-green-600" />
                            <span className="text-xs font-medium text-green-700">Temă Făcută</span>
                          </>
                        ) : (
                          <>
                            <Circle className="w-3 h-3 text-red-600" />
                            <span className="text-xs font-medium text-red-700">Temă În Așteptare</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className={`${tipColors.bg} border ${tipColors.border} rounded-xl p-4`}>
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 ${tipColors.icon} rounded-full flex items-center justify-center flex-shrink-0`}>
            <TipIcon className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 mb-1">{activeTip.title}</p>
            <p className="text-sm text-gray-700">
              {activeTip.content}
            </p>
            <button className="mt-2 text-sm font-semibold text-[#164B2E] hover:underline">
              {activeTip.action} →
            </button>
          </div>
        </div>
      </div>

      <WeekPickerCalendar
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
        currentWeekOffset={weekOffset}
        onSelectWeek={setWeekOffset}
      />

      <ClassDetailModal
        isOpen={showClassModal}
        onClose={() => setShowClassModal(false)}
        classEvent={selectedClass}
        onSaveNotes={handleSaveNotes}
      />
    </div>
  );
}
