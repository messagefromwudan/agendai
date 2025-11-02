import { Award, Clock, BookOpen, Trophy, Zap, Target } from 'lucide-react';

export default function Profile() {
  const badges = [
    { id: 1, name: 'Focus Hero', icon: Target, color: 'blue', earned: true },
    { id: 2, name: 'Math Whiz', icon: Trophy, color: 'yellow', earned: true },
    { id: 3, name: 'Perfect Week', icon: Award, color: 'green', earned: true },
    { id: 4, name: 'Quick Learner', icon: Zap, color: 'purple', earned: false },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
        Student Profile
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center">
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 bg-gradient-to-br from-[#164B2E] to-[#0d2819] rounded-full border-4 border-white shadow-xl mx-auto relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg')] bg-cover bg-center"></div>
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#164B2E] text-[#F1F5F9] px-4 py-1 rounded-full text-xs font-semibold shadow-lg">
                Top 10%
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-1">Bianca Popescu</h2>
            <p className="text-gray-500 mb-4">Class 11-A</p>

            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="text-xs text-gray-500 mb-1">Student ID</p>
              <div className="flex items-center justify-center gap-2">
                <span className="font-mono font-bold text-gray-900">ST-2024-1337</span>
                <div className="w-8 h-8 bg-[#164B2E] rounded flex items-center justify-center">
                  <div className="w-6 h-6 bg-white/20 rounded"></div>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-left">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Institution</span>
                <span className="text-sm font-semibold text-gray-900">Colegiul National</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Academic Year</span>
                <span className="text-sm font-semibold text-gray-900">2024-2025</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h3 className="font-semibold text-lg mb-4 text-gray-900">Learning Statistics</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
                <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-900">8</p>
                <p className="text-xs text-blue-700">Subjects Mastered</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
                <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-900">42h</p>
                <p className="text-xs text-green-700">Study Time (Week)</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
                <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-900">1,247</p>
                <p className="text-xs text-purple-700">Knowledge Points</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h3 className="font-semibold text-lg mb-4 text-gray-900">Achievements & Badges</h3>
            <div className="grid grid-cols-2 gap-4">
              {badges.map((badge) => {
                const Icon = badge.icon;
                const colors = {
                  blue: { bg: 'bg-blue-100', icon: 'text-blue-600', border: 'border-blue-200' },
                  yellow: { bg: 'bg-yellow-100', icon: 'text-yellow-600', border: 'border-yellow-200' },
                  green: { bg: 'bg-green-100', icon: 'text-green-600', border: 'border-green-200' },
                  purple: { bg: 'bg-purple-100', icon: 'text-purple-600', border: 'border-purple-200' },
                };
                const color = colors[badge.color as keyof typeof colors];

                return (
                  <div
                    key={badge.id}
                    className={`border ${color.border} ${color.bg} rounded-xl p-4 text-center ${
                      badge.earned ? 'opacity-100' : 'opacity-40'
                    } transition-all hover:scale-105`}
                  >
                    <div className={`w-16 h-16 ${color.bg} rounded-full flex items-center justify-center mx-auto mb-3 ${
                      badge.earned ? 'ring-4 ring-white shadow-lg' : ''
                    }`}>
                      <Icon className={`w-8 h-8 ${color.icon}`} />
                    </div>
                    <p className="font-semibold text-sm text-gray-900">{badge.name}</p>
                    {badge.earned && (
                      <p className="text-xs text-gray-500 mt-1">Earned</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h3 className="font-semibold text-lg mb-4 text-gray-900">Subject Strengths</h3>
            <div className="space-y-3">
              {[
                { name: 'Mathematics', score: 95, color: 'bg-blue-500' },
                { name: 'Physics', score: 92, color: 'bg-green-500' },
                { name: 'Literature', score: 88, color: 'bg-purple-500' },
                { name: 'Chemistry', score: 85, color: 'bg-orange-500' },
              ].map((subject) => (
                <div key={subject.name}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{subject.name}</span>
                    <span className="text-sm font-bold text-gray-900">{subject.score}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${subject.color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${subject.score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
