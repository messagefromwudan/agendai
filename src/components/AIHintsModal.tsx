import { X, Lightbulb } from 'lucide-react';

type AIHintsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  homework: {
    title: string;
    subject: string;
  } | null;
};

export default function AIHintsModal({ isOpen, onClose, homework }: AIHintsModalProps) {
  if (!isOpen || !homework) return null;

  const hints = [
    'Start by identifying what the problem is asking - write it down in your own words',
    'Remember the quadratic formula: x = (-b ± √(b² - 4ac)) / 2a',
    'Check your discriminant (b² - 4ac) first to know how many solutions to expect',
  ];

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Quick Hints
                </h2>
                <p className="text-white/80 text-sm">{homework.title}</p>
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

        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Here are some helpful pointers to get you started:
          </p>

          <div className="space-y-3">
            {hints.map((hint, index) => (
              <div key={index} className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    {index + 1}
                  </div>
                  <p className="text-sm text-gray-900 flex-1">{hint}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-purple-200 rounded-xl p-4">
            <p className="text-sm text-gray-700">
              <strong>Need more help?</strong> Click on "Break into steps" for a detailed plan, or chat with the AI Tutor for interactive guidance.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-6 px-6 py-3 bg-[#164B2E] text-white rounded-xl font-medium hover:bg-[#0d2819] transition-colors"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
}
