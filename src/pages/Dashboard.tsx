import { useState, useEffect } from 'react';
import { BookOpen, Brain, Calendar, Backpack, TrendingUp, Award, Flame, Info, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import StreakCalendar from '../components/StreakCalendar';
import { fetchDashboardData, type DashboardData } from '../utils/dashboardHelpers';

type DashboardProps = {
  onNavigate?: (page: string) => void;
};

type TooltipState = {
  visible: boolean;
  x: number;
  y: number;
};

export default function Dashboard({ onNavigate }: DashboardProps = {}) {
  const [showStreakCalendar, setShowStreakCalendar] = useState(false);
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0 });
  const [countdown, setCountdown] = useState<Record<number, string>>({});
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    const dashboardData = await fetchDashboardData();
    setData(dashboardData);
    setLoading(false);
  };

  useEffect(() => {
    if (!data) return;

    const interval = setInterval(() => {
      const now = new Date();
      const updated: Record<number, string> = {};

      data.classesToday.forEach((cls, idx) => {
        const [hours, mins] = cls.time.split(':').map(Number);
        const classTime = new Date();
        classTime.setHours(hours, mins, 0);
        const diff = classTime.getTime() - now.getTime();

        if (diff > 0) {
          const minutesLeft = Math.floor(diff / 60000);
          if (minutesLeft < 60) {
            updated[idx] = `În ${minutesLeft} minute`;
          } else {
            const hoursLeft = Math.floor(minutesLeft / 60);
            updated[idx] = `În ${hoursLeft} ore`;
          }
        } else {
          updated[idx] = 'A început';
        }
      });

      setCountdown(updated);
    }, 60000);

    const timer = setTimeout(() => {
      setCountdown({});
    }, 0);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [data]);

  const getSubheadline = () => {
    if (!data) return "Hai să facem ziua de azi una productivă!";

    if (data.upcomingEvents.length > 0) {
      const event = data.upcomingEvents[0];
      if (event.daysUntil === 1) {
        return `Mâine ai un test important – hai să ne concentrăm azi pe ${event.subject.toLowerCase()}.`;
      }
    }
    return "Hai să facem ziua de azi una productivă!";
  };

  const getSubjectStatus = () => {
    if (!data) return 'Toate la zi';

    if (data.activeSubjects.needingAttention === 0) {
      return 'Toate la zi';
    } else if (data.activeSubjects.needingAttention <= 2) {
      return `${data.activeSubjects.needingAttention} Necesită atenție`;
    }
    return 'Necesită focalizare';
  };

  const handleInfoHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  };

  const handleInsightClick = (insight: string) => {
    setSelectedInsight(insight);
    if (insight === 'physics-test') {
      onNavigate?.('ai-tutor');
    } else if (insight === 'achievement') {
      onNavigate?.('progress');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#164B2E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Se încarcă...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Nu s-au putut încărca datele.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Bine ai revenit, {data.user.name}
          </h1>
          <p className="text-gray-600 mt-1">{getSubheadline()}</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowStreakCalendar(true)}
            className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-xl hover:bg-orange-100 transition-all hover:scale-105 cursor-pointer"
          >
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="text-sm font-semibold text-orange-700">Streak de 7 zile</span>
          </button>
          <div className="w-14 h-14 bg-gradient-to-br from-[#164B2E] to-[#0d2819] rounded-full border-4 border-white shadow-lg"></div>
        </div>
      </div>

      <StreakCalendar isOpen={showStreakCalendar} onClose={() => setShowStreakCalendar(false)} />

      <div className="bg-gradient-to-br from-[#164B2E] to-[#0d2819] rounded-2xl p-6 text-[#F1F5F9] relative overflow-visible">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-[#F1F5F9]/70 text-sm">Media semestrială</p>
                <button
                  onMouseEnter={handleInfoHover}
                  onMouseLeave={() => setTooltip({ ...tooltip, visible: false })}
                  className="flex-shrink-0 relative group"
                >
                  <Info className="w-4 h-4 text-[#F1F5F9]/50 hover:text-[#F1F5F9] transition-colors" />
                  {tooltip.visible && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 pointer-events-none">
                      <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
                        Media este calculată pe baza tuturor notelor, ponderate în funcție de credite și importanța materiei.
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  )}
                </button>
              </div>
              <p className="text-xs text-[#F1F5F9]/50 mb-4">Media generală este disponibilă în Profil.</p>
              <h2 className="text-5xl font-bold mb-4">{data.gpa.toFixed(2)}</h2>
              <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-lg backdrop-blur-sm">
                <TrendingUp className="w-4 h-4 text-green-300" />
                <span className="text-sm">{data.gpaStatus}</span>
              </div>
            </div>
            <div className="w-32 h-32 bg-white/10 rounded-full backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <Award className="w-16 h-16 text-[#F1F5F9]" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate?.('grades')}
          className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{data.activeSubjects.total}</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Materii active</h3>
          <p className="text-sm text-gray-500">{getSubjectStatus()}</p>
        </div>

        <div
          onClick={() => onNavigate?.('ai-tutor')}
          className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{data.aiSessions.thisWeek}</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Sesiuni AI</h3>
          <p className="text-sm text-gray-500">Medie {data.aiSessions.avgPerDay.toFixed(1)}/zi</p>
        </div>

        <div
          onClick={() => onNavigate?.('homework')}
          className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Backpack className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{data.homework.completed}/{data.homework.total}</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Teme</h3>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Termen în această săptămână</p>
            {data.homework.dueTomorrow > 0 && (
              <p className="text-xs text-orange-600 font-medium">{data.homework.dueTomorrow} termen mâine</p>
            )}
          </div>
        </div>

        <div
          onClick={() => onNavigate?.('schedule')}
          className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{data.classesToday.length}</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Orele de azi</h3>
          <p className="text-sm text-gray-500">{countdown[0] || 'Următoarea în 45 min'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="font-semibold text-lg mb-4 text-gray-900">Recomandări AI</h3>
          <div className="space-y-3">
            <button
              onClick={() => handleInsightClick('physics-test')}
              className="w-full text-left bg-blue-50 border border-blue-200 rounded-xl p-4 hover:shadow-md hover:border-blue-300 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 font-medium">Testul la fizică e mâine</p>
                    <p className="text-xs text-gray-600 mt-1">Repetă cu un test de 5 minute!</p>
                  </div>
                </div>
              </div>
              <div className="ml-11 mt-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate?.('ai-tutor');
                  }}
                  className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                >
                  Începe testul
                </button>
              </div>
            </button>

            <button
              onClick={() => handleInsightClick('achievement')}
              className="w-full text-left bg-green-50 border border-green-200 rounded-xl p-4 hover:shadow-md hover:border-green-300 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Award className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 font-medium">Realizare nouă deblocată!</p>
                  <p className="text-xs text-gray-600 mt-1">10/10 la literatura română</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setSelectedInsight('math-improvement')}
              className="w-full text-left bg-orange-50 border border-orange-200 rounded-xl p-4 hover:shadow-md hover:border-orange-300 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 font-medium">Nota la matematică s-a îmbunătățit!</p>
                    <p className="text-xs text-gray-600 mt-1">+0.8 față de luna trecută</p>
                  </div>
                </div>
              </div>
              <div className="ml-11 mt-3">
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 text-xs font-medium transition-colors"
                >
                  Vezi progresul tău
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="font-semibold text-lg mb-4 text-gray-900">Orarul următor</h3>
          <div className="space-y-3">
            {data.classesToday.slice(0, 3).map((cls, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">{cls.time}</p>
                    <p className="text-lg font-bold" style={{ color: cls.color }}>
                      {cls.duration}
                    </p>
                  </div>
                  <div className="h-12 w-1 rounded-full" style={{ backgroundColor: cls.color }}></div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{cls.subject}</p>
                    <p className="text-sm text-gray-500">
                      {cls.room} • {cls.teacher}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!cls.ended ? (
                    <button
                      onClick={() => onNavigate?.('schedule')}
                      title="Deschide în Orar"
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <Calendar className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                      title="Marchează ca finalizat"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
