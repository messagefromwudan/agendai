import { X, Clock, MapPin, User, FileText, BookOpen } from 'lucide-react';
import { useState } from 'react';

type ClassDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  classEvent: {
    id: string;
    title: string;
    time: string;
    location: string;
    teacher: string;
    color: string;
    description?: string;
    notes?: string;
  } | null;
  onSaveNotes?: (notes: string) => void;
};

export default function ClassDetailModal({
  isOpen,
  onClose,
  classEvent,
  onSaveNotes,
}: ClassDetailModalProps) {
  const [notes, setNotes] = useState(classEvent?.notes || '');

  if (!isOpen || !classEvent) return null;

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

  const colorClasses = getColorClasses(classEvent.color);

  const handleSave = () => {
    if (onSaveNotes) {
      onSaveNotes(notes);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`${colorClasses.bg} p-6 text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {classEvent.title}
              </h2>
              <div className="flex items-center gap-2 text-white/80">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{classEvent.time}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className={`${colorClasses.light} border border-gray-200 rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className={`w-4 h-4 ${colorClasses.text}`} />
                <p className="text-xs font-semibold text-gray-600">Location</p>
              </div>
              <p className="text-sm font-medium text-gray-900">{classEvent.location}</p>
            </div>

            <div className={`${colorClasses.light} border border-gray-200 rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <User className={`w-4 h-4 ${colorClasses.text}`} />
                <p className="text-xs font-semibold text-gray-600">Teacher</p>
              </div>
              <p className="text-sm font-medium text-gray-900">{classEvent.teacher}</p>
            </div>
          </div>

          {classEvent.description && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Class Description</h3>
              </div>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-4">
                {classEvent.description}
              </p>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Personal Notes</h3>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your notes about this class..."
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#164B2E] text-sm resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 bg-[#164B2E] text-white rounded-xl font-medium hover:bg-[#0d2819] transition-colors shadow-lg hover:shadow-xl"
            >
              Save Notes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
