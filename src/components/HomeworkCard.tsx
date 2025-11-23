import { Star, Clock, Circle, CheckCircle2, MoreVertical, Pin, Share2, Calendar, Lightbulb, ListTree } from 'lucide-react';
import { useState } from 'react';

export type HomeworkCardData = {
  id: number;
  title: string;
  subject: string;
  difficulty: number;
  dueDate: string;
  completed: boolean;
  aiSuggestion: string;
  color: string;
  important?: boolean;
  description?: string;
  type?: string;
  completedAt?: string;
};

type HomeworkCardProps = {
  homework: HomeworkCardData;
  onToggleComplete: (id: number) => void;
  onReschedule: (id: number, newDate: string) => void;
  onToggleImportant: (id: number) => void;
  onShare: (id: number) => void;
  onBreakDown: (id: number) => void;
  onGetHints: (id: number) => void;
  onClick: (id: number) => void;
  onViewFeedback?: (id: number) => void;
};

export default function HomeworkCard({
  homework,
  onToggleComplete,
  onReschedule,
  onToggleImportant,
  onShare,
  onBreakDown,
  onGetHints,
  onClick,
  onViewFeedback,
}: HomeworkCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string; light: string }> = {
      blue: { bg: 'bg-blue-500', border: 'border-blue-200', text: 'text-blue-700', light: 'bg-blue-50' },
      green: { bg: 'bg-green-500', border: 'border-green-200', text: 'text-green-700', light: 'bg-green-50' },
      purple: { bg: 'bg-purple-500', border: 'border-purple-200', text: 'text-purple-700', light: 'bg-purple-50' },
      orange: { bg: 'bg-orange-500', border: 'border-orange-200', text: 'text-orange-700', light: 'bg-orange-50' },
      red: { bg: 'bg-red-500', border: 'border-red-200', text: 'text-red-700', light: 'bg-red-50' },
      teal: { bg: 'bg-teal-500', border: 'border-teal-200', text: 'text-teal-700', light: 'bg-teal-50' },
    };
    return colors[color] || colors.blue;
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dayName = days[date.getDay()];
    const monthName = months[date.getMonth()];
    const day = date.getDate();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${dayName}, ${monthName} ${day} • ${hours}:${minutes}`;
  };

  const colorClasses = getColorClasses(homework.color);
  const daysUntil = getDaysUntilDue(homework.dueDate);
  const isUrgent = daysUntil <= 1 && !homework.completed;
  const isWarning = daysUntil === 2 && !homework.completed;

  const getDueDateLabel = () => {
    if (daysUntil < 0) return { text: 'Overdue', color: 'bg-red-100 border-red-300 text-red-700' };
    if (daysUntil === 0) return { text: 'Due today', color: 'bg-red-100 border-red-300 text-red-700' };
    if (daysUntil === 1) return { text: 'Due tomorrow', color: 'bg-red-100 border-red-300 text-red-700' };
    if (daysUntil === 2) return { text: '2 days left', color: 'bg-orange-100 border-orange-300 text-orange-700' };
    return { text: `${daysUntil} days left`, color: 'bg-gray-100 border-gray-300 text-gray-700' };
  };

  const dueDateLabel = getDueDateLabel();

  return (
    <div
      className={`bg-white border-l-4 ${
        isUrgent ? 'border-l-red-500' : isWarning ? 'border-l-orange-500' : colorClasses.border
      } ${colorClasses.border} rounded-r-xl p-6 hover:shadow-lg transition-all group ${
        homework.completed ? 'opacity-60' : ''
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false);
        setShowReschedule(false);
      }}
    >
      <div className="flex items-start gap-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete(homework.id);
          }}
          className="mt-1 group-hover:scale-110 transition-transform focus:outline-none"
        >
          {homework.completed ? (
            <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
          ) : (
            <Circle className="w-6 h-6 text-gray-400 hover:text-[#164B2E]" />
          )}
        </button>

        <div className="flex-1 cursor-pointer" onClick={() => onClick(homework.id)}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3
                  className={`font-semibold text-lg text-gray-900 ${homework.completed ? 'line-through' : ''}`}
                >
                  {homework.title}
                </h3>
                {homework.important && <Pin className="w-4 h-4 text-orange-500 fill-orange-500" />}
              </div>
              <p className={`text-sm font-medium ${colorClasses.text}`}>{homework.subject}</p>
            </div>
            {!homework.completed && (
              <div className={`${dueDateLabel.color} border px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-2`}>
                <Clock className="w-4 h-4" />
                {dueDateLabel.text}
              </div>
            )}
            {homework.completed && homework.completedAt && (
              <div className="bg-green-100 border border-green-300 text-green-700 px-3 py-1 rounded-lg text-sm font-medium">
                Completed
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            <span>Due • {formatDueDate(homework.dueDate)}</span>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-gray-500">Difficulty:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${star <= homework.difficulty ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
          </div>

          {homework.aiSuggestion && (
            <div className={`${colorClasses.light} border ${colorClasses.border} rounded-lg p-3`}>
              <p className="text-xs font-medium text-gray-500 mb-1">AI Suggestion</p>
              <p className="text-sm text-gray-700">{homework.aiSuggestion}</p>
            </div>
          )}

          {!homework.completed && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onBreakDown(homework.id);
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium transition-colors"
              >
                <ListTree className="w-3 h-3" />
                Break into steps
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onGetHints(homework.id);
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-medium transition-colors"
              >
                <Lightbulb className="w-3 h-3" />
                Get quick hints
              </button>
            </div>
          )}

          {homework.completed && onViewFeedback && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewFeedback(homework.id);
              }}
              className="mt-3 flex items-center gap-1 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-xs font-medium transition-colors"
            >
              View feedback from AI
            </button>
          )}
        </div>

        {showActions && !homework.completed && (
          <div className="relative">
            <button
              onClick={(e) => e.stopPropagation()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-600" />
            </button>
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-2 min-w-[160px] z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowReschedule(!showReschedule);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg text-sm text-gray-700 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                Reschedule
              </button>
              {showReschedule && (
                <div className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="datetime-local"
                    onChange={(e) => {
                      onReschedule(homework.id, e.target.value);
                      setShowReschedule(false);
                    }}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                  />
                </div>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleImportant(homework.id);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg text-sm text-gray-700 transition-colors"
              >
                <Pin className="w-4 h-4" />
                {homework.important ? 'Unmark important' : 'Mark important'}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onShare(homework.id);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg text-sm text-gray-700 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
