import { useState } from 'react';
import { Plus, Star, Calendar, CheckCircle2, Circle } from 'lucide-react';

type HomeworkItem = {
  id: number;
  title: string;
  subject: string;
  difficulty: number;
  dueDate: string;
  completed: boolean;
  aiSuggestion: string;
  color: string;
};

export default function Homework() {
  const [homework, setHomework] = useState<HomeworkItem[]>([
    {
      id: 1,
      title: 'Quadratic Equations Problem Set',
      subject: 'Mathematics',
      difficulty: 3,
      dueDate: '2024-11-03',
      completed: false,
      aiSuggestion: 'Review the quadratic formula notes from last week before starting.',
      color: 'blue',
    },
    {
      id: 2,
      title: 'Lab Report: Newton\'s Laws',
      subject: 'Physics',
      difficulty: 2,
      dueDate: '2024-11-04',
      completed: false,
      aiSuggestion: 'Structure your report with hypothesis, method, results, and conclusion.',
      color: 'green',
    },
    {
      id: 3,
      title: 'Essay: Romantic Poetry Analysis',
      subject: 'Literature',
      difficulty: 2,
      dueDate: '2024-11-05',
      completed: true,
      aiSuggestion: 'Great work! Your analysis was thorough and well-structured.',
      color: 'purple',
    },
    {
      id: 4,
      title: 'Chemical Reactions Worksheet',
      subject: 'Chemistry',
      difficulty: 1,
      dueDate: '2024-11-02',
      completed: true,
      aiSuggestion: 'Excellent understanding of balancing equations!',
      color: 'orange',
    },
  ]);

  const toggleCompletion = (id: number) => {
    setHomework((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string; light: string }> = {
      blue: { bg: 'bg-blue-500', border: 'border-blue-200', text: 'text-blue-700', light: 'bg-blue-50' },
      green: { bg: 'bg-green-500', border: 'border-green-200', text: 'text-green-700', light: 'bg-green-50' },
      purple: { bg: 'bg-purple-500', border: 'border-purple-200', text: 'text-purple-700', light: 'bg-purple-50' },
      orange: { bg: 'bg-orange-500', border: 'border-orange-200', text: 'text-orange-700', light: 'bg-orange-50' },
    };
    return colors[color] || colors.blue;
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date('2024-11-01');
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const pending = homework.filter((h) => !h.completed);
  const completed = homework.filter((h) => h.completed);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Homework & Projects
        </h1>
        <button className="flex items-center gap-2 bg-[#164B2E] hover:bg-[#0d2819] text-[#F1F5F9] px-6 py-3 rounded-xl transition-colors shadow-lg hover:shadow-xl">
          <Plus className="w-5 h-5" />
          <span className="font-medium">Add Homework</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <p className="text-sm text-blue-700 mb-2">Total Assignments</p>
          <p className="text-4xl font-bold text-blue-900">{homework.length}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
          <p className="text-sm text-orange-700 mb-2">Pending</p>
          <p className="text-4xl font-bold text-orange-900">{pending.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <p className="text-sm text-green-700 mb-2">Completed This Week</p>
          <p className="text-4xl font-bold text-green-900">{completed.length}</p>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Assignments</h2>
        <div className="space-y-3">
          {pending.map((item) => {
            const colorClasses = getColorClasses(item.color);
            const daysUntil = getDaysUntilDue(item.dueDate);
            const isUrgent = daysUntil <= 2;

            return (
              <div
                key={item.id}
                className={`bg-white border ${colorClasses.border} rounded-xl p-6 hover:shadow-lg transition-all group`}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleCompletion(item.id)}
                    className="mt-1 group-hover:scale-110 transition-transform"
                  >
                    <Circle className="w-6 h-6 text-gray-400 hover:text-[#164B2E]" />
                  </button>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 mb-1">{item.title}</h3>
                        <p className={`text-sm font-medium ${colorClasses.text}`}>{item.subject}</p>
                      </div>
                      <div className={`${isUrgent ? 'bg-red-100 border-red-300 text-red-700' : 'bg-gray-100 border-gray-300 text-gray-700'} border px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-2`}>
                        <Calendar className="w-4 h-4" />
                        {daysUntil === 0 ? 'Due today' : daysUntil === 1 ? 'Due tomorrow' : `${daysUntil} days left`}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs text-gray-500">Difficulty:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${star <= item.difficulty ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>

                    {item.aiSuggestion && (
                      <div className={`${colorClasses.light} border ${colorClasses.border} rounded-lg p-3`}>
                        <p className="text-xs font-medium text-gray-500 mb-1">AI Suggestion</p>
                        <p className="text-sm text-gray-700">{item.aiSuggestion}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Completed</h2>
        <div className="space-y-3">
          {completed.map((item) => {
            const colorClasses = getColorClasses(item.color);

            return (
              <div
                key={item.id}
                className={`bg-white border ${colorClasses.border} rounded-xl p-6 opacity-60`}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleCompletion(item.id)}
                    className="mt-1 hover:scale-110 transition-transform"
                  >
                    <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                  </button>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 mb-1 line-through">{item.title}</h3>
                        <p className={`text-sm font-medium ${colorClasses.text}`}>{item.subject}</p>
                      </div>
                      <div className="bg-green-100 border border-green-300 text-green-700 px-3 py-1 rounded-lg text-sm font-medium">
                        Completed
                      </div>
                    </div>

                    {item.aiSuggestion && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-500 mb-1">AI Feedback</p>
                        <p className="text-sm text-gray-700">{item.aiSuggestion}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
