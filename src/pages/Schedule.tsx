import { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon, CheckCircle2, Circle } from 'lucide-react';

type ClassEvent = {
  id: number;
  title: string;
  time: string;
  location: string;
  teacher: string;
  type: string;
  color: string;
  homeworkCompleted: boolean;
};

type DaySchedule = {
  [key: number]: ClassEvent[];
};

export default function Schedule() {
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [selectedDay, setSelectedDay] = useState(4);

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const dates = ['28', '29', '30', '31', '1'];

  const weekSchedule: DaySchedule = {
    0: [
      { id: 1, title: 'Mathematics', time: '08:00 - 09:30', location: 'Room 204', teacher: 'Ms. Johnson', type: 'class', color: 'blue', homeworkCompleted: true },
      { id: 2, title: 'Physics', time: '10:00 - 11:00', location: 'Lab 3', teacher: 'Dr. Smith', type: 'class', color: 'green', homeworkCompleted: false },
      { id: 3, title: 'Literature', time: '13:00 - 14:00', location: 'Room 101', teacher: 'Mr. Anderson', type: 'class', color: 'purple', homeworkCompleted: true },
    ],
    1: [
      { id: 4, title: 'Chemistry', time: '09:00 - 10:30', location: 'Lab 2', teacher: 'Dr. Brown', type: 'class', color: 'orange', homeworkCompleted: true },
      { id: 5, title: 'History', time: '11:00 - 12:00', location: 'Room 305', teacher: 'Mrs. Davis', type: 'class', color: 'red', homeworkCompleted: false },
    ],
    2: [
      { id: 6, title: 'English', time: '08:00 - 09:00', location: 'Room 210', teacher: 'Ms. Wilson', type: 'class', color: 'teal', homeworkCompleted: true },
      { id: 7, title: 'Mathematics', time: '10:00 - 11:30', location: 'Room 204', teacher: 'Ms. Johnson', type: 'class', color: 'blue', homeworkCompleted: true },
    ],
    3: [
      { id: 8, title: 'Physics Lab', time: '09:00 - 11:00', location: 'Lab 3', teacher: 'Dr. Smith', type: 'class', color: 'green', homeworkCompleted: false },
      { id: 9, title: 'Chemistry', time: '13:00 - 14:00', location: 'Lab 2', teacher: 'Dr. Brown', type: 'class', color: 'orange', homeworkCompleted: true },
    ],
    4: [
      { id: 10, title: 'Mathematics', time: '08:00 - 09:30', location: 'Room 204', teacher: 'Ms. Johnson', type: 'class', color: 'blue', homeworkCompleted: true },
      { id: 11, title: 'Physics Lab', time: '10:00 - 12:00', location: 'Lab 3', teacher: 'Dr. Smith', type: 'class', color: 'green', homeworkCompleted: false },
      { id: 12, title: 'Literature', time: '13:00 - 14:00', location: 'Room 101', teacher: 'Mr. Anderson', type: 'class', color: 'purple', homeworkCompleted: true },
    ],
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Smart Schedule
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
              Week View
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'day'
                  ? 'bg-[#164B2E] text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Day View
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <span className="font-semibold text-gray-900 px-4">Week of Oct 28 - Nov 1</span>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#164B2E] to-[#0d2819] rounded-2xl p-6 text-[#F1F5F9]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#F1F5F9]/70 text-sm mb-2">Next Class</p>
            <h2 className="text-2xl font-bold mb-1">Mathematics</h2>
            <p className="text-[#F1F5F9]/90">Room 204 • Ms. Johnson</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm mb-2">
              <Clock className="w-10 h-10 text-[#F1F5F9]" />
            </div>
            <p className="text-2xl font-bold">45m</p>
            <p className="text-sm text-[#F1F5F9]/70">until start</p>
          </div>
        </div>
      </div>

      {viewMode === 'week' ? (
        <div className="grid grid-cols-5 gap-4">
          {weekDays.map((day, index) => {
            const isToday = index === 4;
            const dayClasses = weekSchedule[index] || [];
            return (
              <button
                key={day}
                onClick={() => {
                  setSelectedDay(index);
                  setViewMode('day');
                }}
                className={`p-4 rounded-xl transition-all text-left ${
                  isToday
                    ? 'bg-[#164B2E] text-[#F1F5F9] shadow-lg'
                    : 'bg-white border border-gray-200 text-gray-700 hover:shadow-md'
                }`}
              >
                <div className="mb-3">
                  <p className={`text-xs mb-1 ${isToday ? 'text-[#F1F5F9]/70' : 'text-gray-500'}`}>{day}</p>
                  <p className="text-2xl font-bold">{dates[index]}</p>
                </div>

                <div className="space-y-2">
                  {dayClasses.map((classEvent) => {
                    const colorClasses = getColorClasses(classEvent.color);
                    return (
                      <div
                        key={classEvent.id}
                        className={`${isToday ? 'bg-white/10 border-white/20' : `${colorClasses.light} border ${colorClasses.border}`} border rounded-lg p-2 transition-all hover:scale-105`}
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
              {weekDays[selectedDay]}, {dates[selectedDay]} - Detailed Schedule
            </h2>
            <button
              onClick={() => setViewMode('week')}
              className="flex items-center gap-2 text-[#164B2E] hover:bg-green-50 px-4 py-2 rounded-lg transition-colors"
            >
              <CalendarIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Week</span>
            </button>
          </div>
          <div className="space-y-4">
            {(weekSchedule[selectedDay] || []).map((event) => {
              const colorClasses = getColorClasses(event.color);
              return (
                <div
                  key={event.id}
                  className={`border-l-4 ${colorClasses.border} ${colorClasses.light} rounded-r-xl p-4 hover:shadow-md transition-all cursor-pointer group`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-center min-w-[80px]">
                      <p className="text-xs text-gray-500 mb-1">Time</p>
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
                            <span className="text-xs font-medium text-green-700">Homework Done</span>
                          </>
                        ) : (
                          <>
                            <Circle className="w-3 h-3 text-red-600" />
                            <span className="text-xs font-medium text-red-700">Homework Pending</span>
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

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Clock className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-semibold text-blue-900 mb-1">AI Scheduling Tip</p>
            <p className="text-sm text-blue-700">
              You have a 30-minute gap before your study session. Would you like to schedule a quick focus session for Physics test preparation?
            </p>
            <button className="mt-2 text-sm font-semibold text-[#164B2E] hover:underline">
              Schedule now →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
