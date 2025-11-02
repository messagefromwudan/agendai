import { X, TrendingUp, Award, BookOpen } from 'lucide-react';

type SubjectInsightsProps = {
  isOpen: boolean;
  onClose: () => void;
  subject: {
    name: string;
    grade: number;
    average: number;
    trend: string;
    teacher: string;
    color: string;
  } | null;
};

export default function SubjectInsights({ isOpen, onClose, subject }: SubjectInsightsProps) {
  if (!isOpen || !subject) return null;

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; light: string }> = {
      blue: { bg: 'bg-blue-500', text: 'text-blue-700', light: 'bg-blue-50' },
      green: { bg: 'bg-green-500', text: 'text-green-700', light: 'bg-green-50' },
      purple: { bg: 'bg-purple-500', text: 'text-purple-700', light: 'bg-purple-50' },
      orange: { bg: 'bg-orange-500', text: 'text-orange-700', light: 'bg-orange-50' },
      red: { bg: 'bg-red-500', text: 'text-red-700', light: 'bg-red-50' },
      teal: { bg: 'bg-teal-500', text: 'text-teal-700', light: 'bg-teal-50' },
    };
    return colors[color] || colors.blue;
  };

  const colorClasses = getColorClasses(subject.color);
  const improvementValue = ((subject.grade - subject.average) * 10).toFixed(1);

  const gradeHistory = [8.8, 9.0, 9.1, 9.3, 9.4, 9.5];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`${colorClasses.bg} p-6 text-white`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {subject.name}
              </h2>
              <p className="text-white/80 text-sm">{subject.teacher}</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-white/70 text-xs mb-1">Current Grade</p>
              <p className="text-4xl font-bold">{subject.grade}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-white/70 text-xs mb-1">Class Average</p>
              <p className="text-4xl font-bold">{subject.average}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-4 text-gray-900">Grade Progression</h3>
            <div className="relative h-48 bg-gray-50 rounded-xl p-4">
              <div className="absolute inset-4 flex items-end justify-between gap-2">
                {gradeHistory.map((grade, index) => {
                  const height = ((grade - 8) / (10 - 8)) * 100;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div
                        className={`w-full ${colorClasses.bg} rounded-t-lg transition-all hover:opacity-80 cursor-pointer relative group`}
                        style={{ height: `${height}%` }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {grade}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {['Sep', 'Oct 1', 'Oct 8', 'Oct 15', 'Oct 22', 'Oct 29'][index]}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className={`${colorClasses.light} border border-${subject.color}-200 rounded-xl p-4`}>
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 ${colorClasses.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className={`font-semibold ${colorClasses.text} mb-1`}>AI Performance Analysis</p>
                <p className="text-sm text-gray-700">
                  You've improved by <strong>+{improvementValue} points</strong> this semester. Your consistent effort in problem-solving and homework completion has significantly contributed to this growth.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-3 text-gray-900">Strengths & Areas to Improve</h3>
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-green-600" />
                  <p className="font-semibold text-green-900 text-sm">Strengths</p>
                </div>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Strong problem-solving skills</li>
                  <li>• Consistent homework completion</li>
                  <li>• Active class participation</li>
                </ul>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-orange-600" />
                  <p className="font-semibold text-orange-900 text-sm">Areas to Improve</p>
                </div>
                <ul className="text-sm text-orange-800 space-y-1">
                  <li>• Focus on theoretical concepts</li>
                  <li>• Practice more complex problems</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
            <button className="flex-1 px-6 py-3 bg-[#164B2E] text-white rounded-xl font-medium hover:bg-[#0d2819] transition-colors">
              Schedule AI Tutoring
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
