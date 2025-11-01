import { TrendingUp, Award, Target, Zap } from 'lucide-react';

export default function Progress() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
        My Progress & Analytics
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="font-semibold text-lg mb-6 text-gray-900">GPA Trend</h3>
          <div className="relative h-64">
            <div className="absolute inset-0 flex items-end justify-between gap-2">
              {[8.9, 9.0, 9.1, 9.15, 9.2, 9.3, 9.37].map((value, index) => {
                const height = ((value - 8.5) / (10 - 8.5)) * 100;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-gradient-to-t from-[#164B2E] to-[#2a7d4f] rounded-t-lg transition-all hover:opacity-80 cursor-pointer relative group"
                      style={{ height: `${height}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {value}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {['Sep', 'Oct 1', 'Oct 8', 'Oct 15', 'Oct 22', 'Oct 29', 'Nov 1'][index]}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 text-green-600">
            <TrendingUp className="w-5 h-5" />
            <span className="font-semibold">+0.47 improvement since September</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="font-semibold text-lg mb-6 text-gray-900">Subject Performance</h3>
          <div className="space-y-4">
            {[
              { subject: 'Mathematics', score: 95, change: 8, color: 'blue' },
              { subject: 'Physics', score: 92, change: 5, color: 'green' },
              { subject: 'History', score: 91, change: 12, color: 'red' },
              { subject: 'Literature', score: 88, change: -2, color: 'purple' },
              { subject: 'Chemistry', score: 85, change: 0, color: 'orange' },
            ].map((item) => {
              const colors: Record<string, string> = {
                blue: 'bg-blue-500',
                green: 'bg-green-500',
                red: 'bg-red-500',
                purple: 'bg-purple-500',
                orange: 'bg-orange-500',
              };

              return (
                <div key={item.subject}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{item.subject}</span>
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
                  <div className="relative w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`${colors[item.color]} h-2 rounded-full transition-all duration-1000`}
                      style={{ width: `${item.score}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="font-semibold text-lg mb-6 text-gray-900">AI Performance Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-green-900 mb-1">Math Improvement Detected</p>
                <p className="text-sm text-green-700 mb-2">
                  +0.8 grade increase since September. Your problem-solving approach has significantly improved.
                </p>
                <div className="bg-white/50 rounded-lg p-2 text-xs text-green-800">
                  <strong>Key Strengths:</strong> Algebraic reasoning, logical thinking
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-blue-900 mb-1">Consistent Study Pattern</p>
                <p className="text-sm text-blue-700 mb-2">
                  You've maintained a 7-day study streak! Your consistency is paying off.
                </p>
                <div className="bg-white/50 rounded-lg p-2 text-xs text-blue-800">
                  <strong>Average:</strong> 6 hours/day • <strong>Peak:</strong> Afternoons
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-orange-900 mb-1">Literature Needs Focus</p>
                <p className="text-sm text-orange-700 mb-2">
                  Slight grade decrease detected. Consider spending more time on essay analysis.
                </p>
                <button className="text-xs font-semibold text-[#164B2E] hover:underline">
                  Schedule AI tutoring session →
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-purple-900 mb-1">Goal Achievement</p>
                <p className="text-sm text-purple-700 mb-2">
                  You've reached your goal of 9.3+ GPA! Time to set a new target.
                </p>
                <div className="bg-white/50 rounded-lg p-2 text-xs text-purple-800">
                  <strong>Suggested:</strong> Maintain 9.4+ for next semester
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">12</p>
          <p className="text-sm text-gray-600">Achievements Unlocked</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-white" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">89%</p>
          <p className="text-sm text-gray-600">Goals Completed</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">1,247</p>
          <p className="text-sm text-gray-600">Knowledge Points</p>
        </div>
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
