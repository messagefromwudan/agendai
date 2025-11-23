import { X, Award, TrendingUp, Target, Sparkles } from 'lucide-react';

type AIHomeworkFeedbackModalProps = {
  isOpen: boolean;
  onClose: () => void;
  homework: {
    title: string;
    subject: string;
  } | null;
  onRequestExercise?: () => void;
};

export default function AIHomeworkFeedbackModal({
  isOpen,
  onClose,
  homework,
  onRequestExercise,
}: AIHomeworkFeedbackModalProps) {
  if (!isOpen || !homework) return null;

  const mockFeedback = {
    score: 95,
    qualityRating: 'Excellent',
    strengths: [
      'Clear understanding of core concepts demonstrated',
      'Well-structured solutions with logical flow',
      'Good attention to detail in calculations',
    ],
    improvements: [
      'Consider showing intermediate steps more explicitly',
      'Practice explaining your reasoning in written form',
    ],
    nextSteps: [
      'Try advanced problems on quadratic equations',
      'Explore real-world applications of this concept',
      'Review the connection to polynomial functions',
    ],
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-[#164B2E] to-[#0d2819] p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  AI Feedback
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

          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm mb-1">Quality Score</p>
                <p className="text-4xl font-bold">{mockFeedback.score}%</p>
              </div>
              <div className="text-right">
                <p className="text-white/70 text-sm mb-1">Rating</p>
                <p className="text-2xl font-semibold">{mockFeedback.qualityRating}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg text-gray-900">Strengths</h3>
            </div>
            <ul className="space-y-2">
              {mockFeedback.strengths.map((strength, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-green-600 font-bold mt-0.5">•</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="font-semibold text-lg text-gray-900">Areas to Improve</h3>
            </div>
            <ul className="space-y-2">
              {mockFeedback.improvements.map((improvement, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-orange-600 font-bold mt-0.5">•</span>
                  <span>{improvement}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg text-gray-900">Suggested Next Steps</h3>
            </div>
            <ul className="space-y-2">
              {mockFeedback.nextSteps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-blue-600 font-bold mt-0.5">{idx + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-gray-700 mb-3">
              Ready to continue your learning journey? I can generate personalized practice exercises based on your performance.
            </p>
            <button
              onClick={() => {
                onRequestExercise?.();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#164B2E] hover:bg-[#0d2819] text-white rounded-lg font-medium transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Ask AI for follow-up exercise
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
