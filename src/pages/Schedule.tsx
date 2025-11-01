import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';

export default function Schedule() {
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const dates = ['28', '29', '30', '31', '1'];

  const events = [
    {
      id: 1,
      title: 'Mathematics',
      time: '08:00 - 09:30',
      location: 'Room 204',
      teacher: 'Ms. Johnson',
      type: 'class',
      color: 'blue',
    },
    {
      id: 2,
      title: 'Physics Lab',
      time: '10:00 - 12:00',
      location: 'Lab 3',
      teacher: 'Dr. Smith',
      type: 'class',
      color: 'green',
    },
    {
      id: 3,
      title: 'Literature',
      time: '13:00 - 14:00',
      location: 'Room 101',
      teacher: 'Mr. Anderson',
      type: 'class',
      color: 'purple',
    },
    {
      id: 4,
      title: 'Study Session',
      time: '15:00 - 16:00',
      location: 'Library',
      teacher: '',
      type: 'study',
      color: 'orange',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string; light: string }> = {
      blue: { bg: 'bg-blue-500', border: 'border-blue-500', text: 'text-blue-700', light: 'bg-blue-50' },
      green: { bg: 'bg-green-500', border: 'border-green-500', text: 'text-green-700', light: 'bg-green-50' },
      purple: { bg: 'bg-purple-500', border: 'border-purple-500', text: 'text-purple-700', light: 'bg-purple-50' },
      orange: { bg: 'bg-orange-500', border: 'border-orange-500', text: 'text-orange-700', light: 'bg-orange-50' },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Smart Schedule
        </h1>
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

      <div className="grid grid-cols-5 gap-2 mb-6">
        {weekDays.map((day, index) => {
          const isToday = index === 4;
          return (
            <button
              key={day}
              className={`p-4 rounded-xl transition-all ${
                isToday
                  ? 'bg-[#164B2E] text-[#F1F5F9] shadow-lg'
                  : 'bg-white border border-gray-200 text-gray-700 hover:shadow-md'
              }`}
            >
              <p className={`text-xs mb-1 ${isToday ? 'text-[#F1F5F9]/70' : 'text-gray-500'}`}>{day}</p>
              <p className="text-2xl font-bold">{dates[index]}</p>
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Today's Schedule - Friday, Nov 1</h2>
        <div className="space-y-4">
          {events.map((event) => {
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
                  <div className={`px-3 py-1 ${colorClasses.light} border ${colorClasses.border} rounded-lg`}>
                    <span className={`text-xs font-medium ${colorClasses.text} capitalize`}>
                      {event.type}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

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
