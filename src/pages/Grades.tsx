import { TrendingUp, TrendingDown, Minus, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export default function Grades() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const subjects = [
    { id: 1, name: 'Mathematics', grade: 9.5, average: 9.4, trend: 'up', teacher: 'Ms. Johnson', color: 'blue' },
    { id: 2, name: 'Physics', grade: 9.2, average: 9.0, trend: 'up', teacher: 'Dr. Smith', color: 'green' },
    { id: 3, name: 'Literature', grade: 8.8, average: 8.9, trend: 'down', teacher: 'Mr. Anderson', color: 'purple' },
    { id: 4, name: 'Chemistry', grade: 9.0, average: 9.0, trend: 'stable', teacher: 'Dr. Brown', color: 'orange' },
    { id: 5, name: 'History', grade: 9.3, average: 9.1, trend: 'up', teacher: 'Mrs. Davis', color: 'red' },
    { id: 6, name: 'English', grade: 8.7, average: 8.8, trend: 'stable', teacher: 'Ms. Wilson', color: 'teal' },
  ];

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Digital Catalog
        </h1>
        <div className="bg-white rounded-xl px-6 py-3 border border-gray-200">
          <p className="text-sm text-gray-600">Semester Average</p>
          <p className="text-3xl font-bold text-[#164B2E]">9.08</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((subject) => {
          const colorClasses = getColorClasses(subject.color);
          return (
            <div
              key={subject.id}
              onClick={() => setSelectedSubject(subject.id.toString())}
              className={`bg-white border ${colorClasses.border} rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer group`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{subject.name}</h3>
                  <p className="text-sm text-gray-500">{subject.teacher}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </div>

              <div className="flex items-end justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Current Grade</p>
                  <p className={`text-4xl font-bold ${colorClasses.text}`}>{subject.grade}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">Average</p>
                  <p className="text-2xl font-semibold text-gray-600">{subject.average}</p>
                </div>
              </div>

              <div className={`flex items-center gap-2 ${colorClasses.bg} px-3 py-2 rounded-lg`}>
                {getTrendIcon(subject.trend)}
                <span className="text-sm font-medium text-gray-700">
                  {subject.trend === 'up' && 'Improving'}
                  {subject.trend === 'down' && 'Needs attention'}
                  {subject.trend === 'stable' && 'Stable performance'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="font-semibold text-lg mb-4 text-gray-900">AI Performance Analysis</h3>
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Strong Progress in Mathematics</p>
                <p className="text-sm text-gray-600">
                  You're showing excellent understanding of complex problems. Your strength lies in algebraic reasoning and problem-solving techniques.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Physics Lab Skills Improving</p>
                <p className="text-sm text-gray-600">
                  Your experimental methodology and data analysis have shown significant improvement this semester.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Minus className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Literature: Focus on Analysis</p>
                <p className="text-sm text-gray-600">
                  Consider deepening your literary analysis skills. The AI Tutor can help with essay structure and critical thinking.
                </p>
                <button className="mt-2 text-sm font-semibold text-[#164B2E] hover:underline">
                  Ask AI Tutor for help →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
