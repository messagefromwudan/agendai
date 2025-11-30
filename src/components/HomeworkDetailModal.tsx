import { X, Calendar, Star, Paperclip, MessageSquare } from 'lucide-react';
import { useState } from 'react';

type HomeworkDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  homework: {
    id: number;
    title: string;
    subject: string;
    difficulty: number;
    dueDate: string;
    description?: string;
    type?: string;
    color: string;
    aiSuggestion: string;
  } | null;
};

export default function HomeworkDetailModal({ isOpen, onClose, homework }: HomeworkDetailModalProps) {
  const [comment, setComment] = useState('');

  if (!isOpen || !homework) return null;

  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate);
    const days = ['Duminică', 'Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă'];
    const months = ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie', 'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'];
    const dayName = days[date.getDay()];
    const monthName = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${dayName}, ${day} ${monthName} ${year} la ${hours}:${minutes}`;
  };

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

  const colorClasses = getColorClasses(homework.color);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`${colorClasses.bg} p-6 text-white`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {homework.title}
              </h2>
              <p className="text-white/80">{homework.subject}</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/20 transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {homework.type && (
            <div className="inline-block bg-white/20 px-3 py-1 rounded-lg text-sm font-medium backdrop-blur-sm">
              {homework.type}
            </div>
          )}
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-gray-500 mb-1">Termen Limită</p>
              <div className="flex items-center gap-2 text-gray-900">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium">{formatDueDate(homework.dueDate)}</span>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Dificultate</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= homework.difficulty ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {homework.description && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Descriere</h3>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-4">{homework.description}</p>
            </div>
          )}

          {homework.aiSuggestion && (
            <div className={`${colorClasses.light} border-l-4 ${colorClasses.bg} rounded-r-xl p-4`}>
              <h3 className={`font-semibold ${colorClasses.text} mb-2 text-sm`}>Sugestie AI</h3>
              <p className="text-sm text-gray-700">{homework.aiSuggestion}</p>
            </div>
          )}

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Atașamente</h3>
            <button className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700 w-full">
              <Paperclip className="w-4 h-4" />
              Niciun atașament încă - Click pentru a adăuga
            </button>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Comentarii & Notițe</h3>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Adaugă notițe sau întrebări despre această temă..."
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#164B2E] text-sm resize-none"
            />
            <button className="mt-2 flex items-center gap-2 px-4 py-2 bg-[#164B2E] hover:bg-[#0d2819] text-white rounded-lg text-sm font-medium transition-colors">
              <MessageSquare className="w-4 h-4" />
              Adaugă Comentariu
            </button>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Închide
            </button>
            <button className="flex-1 px-6 py-3 bg-[#164B2E] text-white rounded-xl font-medium hover:bg-[#0d2819] transition-colors shadow-lg hover:shadow-xl">
              Salvează Modificările
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
