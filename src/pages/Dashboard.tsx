import { useState } from 'react';
import { BookOpen, Brain, Calendar, Backpack, TrendingUp, Award, Flame } from 'lucide-react';
import StreakCalendar from '../components/StreakCalendar';

export default function Dashboard() {
  const [showStreakCalendar, setShowStreakCalendar] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Welcome back, Bianca
          </h1>
          <p className="text-gray-600 mt-1">Let's make today productive!</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowStreakCalendar(true)}
            className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-xl hover:bg-orange-100 transition-all hover:scale-105 cursor-pointer"
          >
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="text-sm font-semibold text-orange-700">7 day streak</span>
          </button>
          <div className="w-14 h-14 bg-gradient-to-br from-[#164B2E] to-[#0d2819] rounded-full border-4 border-white shadow-lg"></div>
        </div>
      </div>

      <StreakCalendar isOpen={showStreakCalendar} onClose={() => setShowStreakCalendar(false)} />

      <div className="bg-gradient-to-br from-[#164B2E] to-[#0d2819] rounded-2xl p-6 text-[#F1F5F9] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#F1F5F9]/70 text-sm mb-2">Current GPA</p>
              <h2 className="text-5xl font-bold mb-4">9.37</h2>
              <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-lg backdrop-blur-sm">
                <TrendingUp className="w-4 h-4 text-green-300" />
                <span className="text-sm">Top 10% of class</span>
              </div>
            </div>
            <div className="w-32 h-32 bg-white/10 rounded-full backdrop-blur-sm flex items-center justify-center">
              <Award className="w-16 h-16 text-[#F1F5F9]" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">8</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Active Subjects</h3>
          <p className="text-sm text-gray-500">All on track</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">23</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">AI Sessions</h3>
          <p className="text-sm text-gray-500">This week</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Backpack className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">5/8</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Homework</h3>
          <p className="text-sm text-gray-500">Due this week</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">3</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Events Today</h3>
          <p className="text-sm text-gray-500">Next in 45 min</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="font-semibold text-lg mb-4 text-gray-900">AI Insights Feed</h3>
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 font-medium">Your physics test is tomorrow</p>
                  <p className="text-xs text-gray-600 mt-1">Revise with a 5-min quiz!</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Award className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 font-medium">New achievement unlocked!</p>
                  <p className="text-xs text-gray-600 mt-1">10/10 in Romanian literature</p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 font-medium">Math grade improved!</p>
                  <p className="text-xs text-gray-600 mt-1">+0.8 since last month</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="font-semibold text-lg mb-4 text-gray-900">Upcoming Schedule</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="text-center">
                <p className="text-xs text-gray-500">09:00</p>
                <p className="text-lg font-bold text-[#164B2E]">45m</p>
              </div>
              <div className="h-12 w-1 bg-[#164B2E] rounded-full"></div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Mathematics</p>
                <p className="text-sm text-gray-500">Room 204 • Ms. Johnson</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="text-center">
                <p className="text-xs text-gray-500">11:00</p>
                <p className="text-lg font-bold text-blue-600">2h</p>
              </div>
              <div className="h-12 w-1 bg-blue-600 rounded-full"></div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Physics Lab</p>
                <p className="text-sm text-gray-500">Lab 3 • Dr. Smith</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="text-center">
                <p className="text-xs text-gray-500">14:00</p>
                <p className="text-lg font-bold text-purple-600">1h</p>
              </div>
              <div className="h-12 w-1 bg-purple-600 rounded-full"></div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Literature</p>
                <p className="text-sm text-gray-500">Room 101 • Mr. Anderson</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
