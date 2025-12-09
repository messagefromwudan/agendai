import { TrendingUp, TrendingDown, Minus, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import SubjectInsights from '../components/SubjectInsights';
import SimpleTooltip from '../components/SimpleTooltip';
import InsightActionButton from '../components/InsightActionButton';
import {
  fetchSubjects,
  fetchAIInsights,
  calculateSemesterAverage,
  type Subject,
  type AIInsight,
} from '../utils/gradesHelpers';

export default function Grades() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [semesterAverage, setSemesterAverage] = useState<number>(0);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGradesData();
  }, []);

  const loadGradesData = async () => {
    setLoading(true);
    const [subjectsList, insightsList, average] = await Promise.all([
      fetchSubjects(),
      fetchAIInsights(),
      calculateSemesterAverage(),
    ]);

    setSubjects(subjectsList);
    setInsights(insightsList);
    setSemesterAverage(average);
    setLoading(false);
  };

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId) || null;

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getTrendStatus = (trend: 'up' | 'down' | 'stable', trendData?: { current: number; previous: number; assessments: number }) => {
    if (trend === 'up') {
      const improvement = (trendData?.current ?? 0) - (trendData?.previous ?? 0);
      return {
        label: 'În creștere',
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        tooltip: `În creștere: +${improvement.toFixed(1)} în ultimele ${trendData?.assessments ?? 3} evaluări.`,
      };
    } else if (trend === 'down') {
      const decline = (trendData?.previous ?? 0) - (trendData?.current ?? 0);
      return {
        label: 'Necesită atenție',
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
        tooltip: `Necesită atenție: -${decline.toFixed(1)} în ultimele ${trendData?.assessments ?? 3} evaluări.`,
      };
    }
    return {
      label: 'Performanță constantă',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-700',
      tooltip: 'Performanța ta a fost constantă în ultimele evaluări.',
    };
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string }> = {
      blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
      green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
      purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
      orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
      red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
      teal: { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700' },
    };
    return colors[color] || colors.blue;
  };

  const getInsightIcon = (type: 'positive' | 'improvement' | 'attention') => {
    if (type === 'positive' || type === 'improvement') {
      return <TrendingUp className="w-4 h-4 text-white" />;
    }
    return <Minus className="w-4 h-4 text-white" />;
  };

  const getInsightBgColor = (type: 'positive' | 'improvement' | 'attention') => {
    if (type === 'positive' || type === 'improvement') {
      return { bg: 'bg-green-50', border: 'border-green-200', icon: 'bg-green-500' };
    }
    return { bg: 'bg-orange-50', border: 'border-orange-200', icon: 'bg-orange-500' };
  };

  const handlePracticeSubject = (subject: string) => {
    console.log(`Practice ${subject}`);
  };

  const handleOpenTutor = (subject: string) => {
    console.log(`Open tutor for ${subject}`);
  };

  const handlePlanSession = (subject: string) => {
    console.log(`Plan session for ${subject}`);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Catalog Digital
        </h1>
        <div className="bg-white rounded-xl px-6 py-3 border border-gray-200">
          <p className="text-sm text-gray-600">Medie semestrială</p>
          <p className="text-3xl font-bold text-[#164B2E]">{semesterAverage.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">Bazat pe {subjects.length} materii în acest semestru</p>
        </div>
      </div>

      <SubjectInsights
        isOpen={selectedSubjectId !== null}
        onClose={() => setSelectedSubjectId(null)}
        subject={selectedSubject}
      />

      {subjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => {
            const colorClasses = getColorClasses(subject.color);
            const trendStatus = getTrendStatus(subject.trend, subject.trendData);
            return (
              <div
                key={subject.id}
                onClick={() => setSelectedSubjectId(subject.id)}
                className={`bg-white border ${colorClasses.border} rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer group`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900">{subject.name}</h3>
                    <div className="flex items-center gap-1">
                      <p className="text-sm text-gray-500">{subject.teacher}</p>
                      {subject.profileType && (
                        <span className="text-xs text-gray-400">· {subject.profileType}</span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                </div>

                <div className="flex items-end justify-between mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{subject.gradeType || 'Nota curentă'}</p>
                    <p className={`text-4xl font-bold ${colorClasses.text}`}>{subject.grade}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">{subject.averageType || 'Medie'}</p>
                    <p className="text-2xl font-semibold text-gray-600">{subject.average}</p>
                  </div>
                </div>

                <div className="relative group/tooltip">
                  <div className={`flex items-center gap-2 ${trendStatus.bgColor} px-3 py-2 rounded-lg cursor-help`}>
                    {getTrendIcon(subject.trend)}
                    <span className={`text-sm font-medium ${trendStatus.textColor}`}>
                      {trendStatus.label}
                    </span>
                  </div>
                  <SimpleTooltip text={trendStatus.tooltip} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
          <p className="text-gray-500">Nu sunt materii înregistrate încă. Adaugă-ți materiile pentru a vedea notele.</p>
        </div>
      )}

      {insights.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="font-semibold text-lg mb-4 text-gray-900">Analiză Performanță AI</h3>
          <div className="space-y-4">
            {insights.map((insight) => {
              const colors = getInsightBgColor(insight.type);
              return (
                <div key={insight.id} className={`${colors.bg} border ${colors.border} rounded-xl p-4`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`w-8 h-8 ${colors.icon} rounded-full flex items-center justify-center flex-shrink-0`}>
                        {getInsightIcon(insight.type)}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 mb-1">{insight.title}</p>
                        <p className="text-sm text-gray-600">{insight.description}</p>
                        <InsightActionButton
                          label={insight.actionLabel}
                          onClick={() => {
                            if (insight.actionType === 'practice') {
                              handlePracticeSubject(insight.subject);
                            } else if (insight.actionType === 'plan') {
                              handlePlanSession(insight.subject);
                            } else {
                              handleOpenTutor(insight.subject);
                            }
                          }}
                          variant={insight.type === 'attention' ? 'outline' : undefined}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
