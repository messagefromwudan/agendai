import { TrendingUp, TrendingDown, Minus, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import SubjectInsights from '../components/SubjectInsights';
import SimpleTooltip from '../components/SimpleTooltip';
import InsightActionButton from '../components/InsightActionButton';

type Subject = {
  id: number;
  name: string;
  grade: number;
  average: number;
  trend: 'up' | 'down' | 'stable';
  teacher: string;
  color: string;
  profileType?: string;
  gradeType?: string;
  averageType?: string;
  trendData?: { current: number; previous: number; assessments: number };
};

export default function Grades() {
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);

  const subjects: Subject[] = [
    {
      id: 1,
      name: 'Matematică',
      grade: 9.5,
      average: 9.4,
      trend: 'up',
      teacher: 'Dna. Johnson',
      color: 'blue',
      profileType: 'Profil Real',
      gradeType: 'Medie semestru',
      averageType: 'Medie clasă',
      trendData: { current: 9.5, previous: 8.7, assessments: 3 },
    },
    {
      id: 2,
      name: 'Fizică',
      grade: 9.2,
      average: 9.0,
      trend: 'up',
      teacher: 'Dr. Smith',
      color: 'green',
      profileType: 'Filieră Științe',
      gradeType: 'Medie semestru',
      averageType: 'Medie clasă',
      trendData: { current: 9.2, previous: 8.8, assessments: 4 },
    },
    {
      id: 3,
      name: 'Literatură',
      grade: 8.8,
      average: 8.9,
      trend: 'down',
      teacher: 'Dl. Anderson',
      color: 'purple',
      profileType: 'Filieră Umană',
      gradeType: 'Medie semestru',
      averageType: 'Media ta de anul trecut',
      trendData: { current: 8.8, previous: 9.2, assessments: 3 },
    },
    {
      id: 4,
      name: 'Chimie',
      grade: 9.0,
      average: 9.0,
      trend: 'stable',
      teacher: 'Dr. Brown',
      color: 'orange',
      profileType: 'Filieră Științe',
      gradeType: 'Medie semestru',
      averageType: 'Medie clasă',
      trendData: { current: 9.0, previous: 9.0, assessments: 2 },
    },
    {
      id: 5,
      name: 'Istorie',
      grade: 9.3,
      average: 9.1,
      trend: 'up',
      teacher: 'Dna. Davis',
      color: 'red',
      profileType: 'Uman',
      gradeType: 'Ultima notă',
      averageType: 'Medie clasă',
      trendData: { current: 9.3, previous: 9.0, assessments: 2 },
    },
    {
      id: 6,
      name: 'Engleză',
      grade: 8.7,
      average: 8.8,
      trend: 'stable',
      teacher: 'Dna. Wilson',
      color: 'teal',
      profileType: 'Profil Real',
      gradeType: 'Medie semestru',
      averageType: 'Medie clasă',
      trendData: { current: 8.7, previous: 8.7, assessments: 3 },
    },
  ];

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
      label: 'Performanță stabilă',
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

  const handlePracticeSubject = (subject: string) => {
    console.log(`Practice ${subject}`);
  };

  const handleOpenTutor = (subject: string) => {
    console.log(`Open tutor for ${subject}`);
  };

  const handlePlanSession = (subject: string) => {
    console.log(`Plan session for ${subject}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Catalog Digital
        </h1>
        <div className="bg-white rounded-xl px-6 py-3 border border-gray-200">
          <p className="text-sm text-gray-600">Medie semestru</p>
          <p className="text-3xl font-bold text-[#164B2E]">9.08</p>
          <p className="text-xs text-gray-500 mt-1">Bazat pe {subjects.length} materii în acest semestru</p>
        </div>
      </div>

      <SubjectInsights
        isOpen={selectedSubjectId !== null}
        onClose={() => setSelectedSubjectId(null)}
        subject={selectedSubject}
      />

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

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="font-semibold text-lg mb-4 text-gray-900">Analiză Performanță AI</h3>
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 mb-1">Progres excelent la Matematică</p>
                  <p className="text-sm text-gray-600">
                    Demonstrezi o înțelegere excelentă a problemelor complexe. Punctul tău forte este raționamentul algebric și tehnicile de rezolvare a problemelor.
                  </p>
                  <InsightActionButton
                    label="Exersează Matematică acum"
                    onClick={() => handlePracticeSubject('Mathematics')}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 mb-1">Îmbunătățiri la Laborator Fizică</p>
                  <p className="text-sm text-gray-600">
                    Metodologia ta experimentală și analiza datelor au arătat îmbunătățiri semnificative în acest semestru.
                  </p>
                  <InsightActionButton
                    label="Planifică o sesiune de recapitulare Fizică"
                    onClick={() => handlePlanSession('Physics')}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Minus className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 mb-1">Literatură: Concentrare pe Analiză</p>
                  <p className="text-sm text-gray-600">
                    Consideră aprofundarea abilităților tale de analiză literară. Tutorele AI poate ajuta cu structura eseului și gândirea critică.
                  </p>
                  <InsightActionButton
                    label="Întreabă Tutorele AI despre Literatură"
                    onClick={() => handleOpenTutor('Literature')}
                    variant="outline"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
