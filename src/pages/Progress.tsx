import { useState } from 'react';
import { TrendingUp, Award, Target, Zap, BookOpen, Calendar, Sparkles, Brain } from 'lucide-react';
import GPAChart from '../components/GPAChart';

type Interval = 'month' | 'semester' | 'year';

type ProgressProps = {
  onNavigate?: (page: string) => void;
};

export default function Progress({ onNavigate }: ProgressProps = {}) {
  const [interval, setInterval] = useState<Interval>('month');

  const gpaDataByInterval = {
    month: [
      { label: 'Week 1', value: 8.9, date: 'Sep 1' },
      { label: 'Week 2', value: 9.0, date: 'Sep 8' },
      { label: 'Week 3', value: 9.1, date: 'Sep 15' },
      { label: 'Week 4', value: 9.15, date: 'Sep 22' },
    ],
    semester: [
      { label: 'Sep', value: 8.9, date: 'September' },
      { label: 'Oct', value: 9.15, date: 'October' },
      { label: 'Nov', value: 9.37, date: 'November' },
    ],
    year: [
      { label: 'Q1', value: 8.7, date: 'Jan-Mar' },
      { label: 'Q2', value: 8.9, date: 'Apr-Jun' },
      { label: 'Q3', value: 9.15, date: 'Jul-Sep' },
      { label: 'Q4', value: 9.37, date: 'Oct-Dec' },
    ],
  };

  const subjects = [
    { id: 1, subject: 'Mathematics', score: 95, change: 8, color: 'blue' },
    { id: 2, subject: 'Physics', score: 92, change: 5, color: 'green' },
    { id: 3, subject: 'History', score: 91, change: 12, color: 'red' },
    { id: 4, subject: 'Literature', score: 88, change: -2, color: 'teal' },
    { id: 5, subject: 'Chemistry', score: 85, change: 0, color: 'orange' },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      red: 'bg-red-500',
      teal: 'bg-teal-500',
      orange: 'bg-orange-500',
    };
    return colors[color] || colors.blue;
  };

  const handleSubjectClick = (subjectName: string) => {
    onNavigate?.('grades');
  };

  const handleGeneratePractice = () => {
    onNavigate?.('ai-tutor');
  };

  const handleScheduleSession = () => {
    onNavigate?.('schedule');
  };

  const handleTalkToAI = () => {
    onNavigate?.('ai-tutor');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
        My Progress & Analytics
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-gray-900">GPA Trend</h3>
            <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
              {(['month', 'semester', 'year'] as Interval[]).map((int) => (
                <button
                  key={int}
                  onClick={() => setInterval(int)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    interval === int
                      ? 'bg-white text-[#164B2E] shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {int.charAt(0).toUpperCase() + int.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <GPAChart data={gpaDataByInterval[interval]} interval={interval} />
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-center gap-2 text-green-600">
              <TrendingUp className="w-5 h-5" />
              <span className="font-semibold">+0.47 improvement since September</span>
            </div>
            <p className="text-center text-sm text-gray-600">
              Class average: +0.20
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h3 className="font-semibold text-lg mb-6 text-gray-900">Subject Performance</h3>
          <div className="space-y-4">
            {subjects.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSubjectClick(item.subject)}
                className="w-full group text-left"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 group-hover:text-[#164B2E] transition-colors">
                    {item.subject}
                  </span>
                  <div className="flex items-center gap-3">
                    {item.change !== 0 && (
                      <span
                        className={`text-xs font-semibold ${item.change > 0 ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {item.change > 0 ? '+' : ''}
                        {item.change}%
                      </span>
                    )}
                    <span className="text-sm font-bold text-gray-900">{item.score}%</span>
                  </div>
                </div>
                <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`${getColorClasses(item.color)} h-3 rounded-full transition-all duration-1000 group-hover:opacity-80`}
                    style={{
                      width: `${item.score}%`,
                      animation: 'slideInFromLeft 1s ease-out',
                    }}
                  ></div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <h3 className="font-semibold text-lg mb-6 text-gray-900">AI Performance Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5 hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-green-900 mb-1">Math Improvement Detected</p>
                <p className="text-sm text-green-700 mb-3">
                  +0.8 grade increase since September. Your problem-solving approach has significantly improved.
                </p>
                <div className="bg-white/50 rounded-lg p-2 text-xs text-green-800 mb-3">
                  <strong>Key Strengths:</strong> Algebraic reasoning, logical thinking
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleGeneratePractice}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-medium transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    Generate practice set
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-200 rounded-2xl p-5 hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-blue-900 mb-1">Consistent Study Pattern</p>
                <p className="text-sm text-blue-700 mb-3">
                  You've maintained a 7-day study streak! Your consistency is paying off.
                </p>
                <div className="bg-white/50 rounded-lg p-2 text-xs text-blue-800 mb-3">
                  <strong>Average:</strong> 6 hours/day • <strong>Peak:</strong> Afternoons
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleScheduleSession}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-medium transition-colors"
                  >
                    <Calendar className="w-3 h-3" />
                    Schedule extra session
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-5 hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-orange-900 mb-1">Literature Needs Focus</p>
                <p className="text-sm text-orange-700 mb-3">
                  Slight grade decrease detected. Consider spending more time on essay analysis.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleTalkToAI}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-medium transition-colors"
                  >
                    <Brain className="w-3 h-3" />
                    Talk to AI Tutor
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200 rounded-2xl p-5 hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-teal-900 mb-1">Goal Achievement</p>
                <p className="text-sm text-teal-700 mb-3">
                  You've reached your goal of 9.3+ GPA! Time to set a new target.
                </p>
                <div className="bg-white/50 rounded-lg p-2 text-xs text-teal-800 mb-3">
                  <strong>Suggested:</strong> Maintain 9.4+ for next semester
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleGeneratePractice}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-xs font-medium transition-colors"
                  >
                    <BookOpen className="w-3 h-3" />
                    Generate practice set
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => onNavigate?.('profile')}
          className="bg-white rounded-2xl p-6 border border-gray-200 text-center hover:shadow-lg transition-all hover:scale-105 group"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">12</p>
          <p className="text-sm text-gray-600">Achievements Unlocked</p>
          <p className="text-xs text-[#164B2E] mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            Click to view all
          </p>
        </button>

        <button
          onClick={() => onNavigate?.('progress')}
          className="bg-white rounded-2xl p-6 border border-gray-200 text-center hover:shadow-lg transition-all hover:scale-105 group"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Target className="w-8 h-8 text-white" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">89%</p>
          <p className="text-sm text-gray-600">Goals Completed</p>
          <p className="text-xs text-[#164B2E] mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            Click to view goals
          </p>
        </button>

        <button
          onClick={() => onNavigate?.('ai-tutor')}
          className="bg-white rounded-2xl p-6 border border-gray-200 text-center hover:shadow-lg transition-all hover:scale-105 group"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">1,247</p>
          <p className="text-sm text-gray-600">Knowledge Points</p>
          <p className="text-xs text-[#164B2E] mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            Click for XP breakdown
          </p>
        </button>
      </div>
    </div>
  );
}

function Trophy({ className }: { className: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M20 7h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v3H4c-1.1 0-2 .9-2 2v3c0 1.86 1.28 3.41 3 3.86V18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-2.14c1.72-.45 3-2 3-3.86V9c0-1.1-.9-2-2-2zM6 12c-1.1 0-2-.9-2-2V9h2v3zm4 6v-2h4v2h-4zm7-2h-2v-3h2v3zm3-4c0 1.1-.9 2-2 2v-3h2v1z" />
    </svg>
  );
}
