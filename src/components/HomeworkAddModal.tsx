import { X, Calendar, Star, Paperclip } from 'lucide-react';
import { useState } from 'react';

type HomeworkAddModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (homework: NewHomework) => void;
};

export type NewHomework = {
  subject: string;
  title: string;
  type: 'Homework' | 'Project' | 'Test Prep' | 'Lab Report';
  deadline: string;
  difficulty: number;
  description: string;
  attachments?: string[];
};

const subjects = [
  'Mathematics',
  'Physics',
  'Literature',
  'Chemistry',
  'History',
  'English',
  'Biology',
  'Computer Science',
];

export default function HomeworkAddModal({ isOpen, onClose, onSave }: HomeworkAddModalProps) {
  const [formData, setFormData] = useState<NewHomework>({
    subject: '',
    title: '',
    type: 'Homework',
    deadline: '',
    difficulty: 2,
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.subject) newErrors.subject = 'Subject is required';
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.type) newErrors.type = 'Type is required';
    if (!formData.deadline) newErrors.deadline = 'Deadline is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
      setFormData({
        subject: '',
        title: '',
        type: 'Homework',
        deadline: '',
        difficulty: 2,
        description: '',
      });
      setErrors({});
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit(e as any);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Add New Assignment
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Subject <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className={`w-full px-4 py-3 bg-gray-50 border ${
                errors.subject ? 'border-red-500' : 'border-gray-200'
              } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#164B2E] text-sm`}
            >
              <option value="">Select a subject</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
            {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Complete Chapter 5 exercises"
              className={`w-full px-4 py-3 bg-gray-50 border ${
                errors.title ? 'border-red-500' : 'border-gray-200'
              } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#164B2E] text-sm`}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as NewHomework['type'] })}
              className={`w-full px-4 py-3 bg-gray-50 border ${
                errors.type ? 'border-red-500' : 'border-gray-200'
              } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#164B2E] text-sm`}
            >
              <option value="Homework">Homework</option>
              <option value="Project">Project</option>
              <option value="Test Prep">Test Prep</option>
              <option value="Lab Report">Lab Report</option>
            </select>
            {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Deadline <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className={`w-full px-4 py-3 bg-gray-50 border ${
                  errors.deadline ? 'border-red-500' : 'border-gray-200'
                } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#164B2E] text-sm`}
              />
              <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
            {errors.deadline && <p className="text-red-500 text-xs mt-1">{errors.deadline}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty (Optional)</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setFormData({ ...formData, difficulty: level })}
                  className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Star
                    className={`w-6 h-6 ${
                      level <= formData.difficulty ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Attach Files (Optional)</label>
            <button
              type="button"
              onClick={() => console.log('Mock file upload')}
              className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700 w-full justify-center"
            >
              <Paperclip className="w-4 h-4" />
              Choose files or take photo
            </button>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Notes / Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add any additional details..."
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#164B2E] text-sm resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-[#164B2E] text-white rounded-xl font-medium hover:bg-[#0d2819] transition-colors shadow-lg hover:shadow-xl"
            >
              Save Assignment
            </button>
          </div>
          <p className="text-xs text-gray-500 text-center">Press Ctrl+Enter to save quickly</p>
        </form>
      </div>
    </div>
  );
}
