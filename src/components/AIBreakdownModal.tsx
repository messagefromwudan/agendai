import { X, CheckCircle2, Circle } from 'lucide-react';
import { useState } from 'react';

type AIBreakdownModalProps = {
  isOpen: boolean;
  onClose: () => void;
  homework: {
    title: string;
    subject: string;
  } | null;
};

type Step = {
  id: number;
  text: string;
  completed: boolean;
};

export default function AIBreakdownModal({ isOpen, onClose, homework }: AIBreakdownModalProps) {
  const [steps, setSteps] = useState<Step[]>([
    { id: 1, text: 'Citește toate problemele și identifică conceptele cheie', completed: false },
    { id: 2, text: 'Revizuiește notițele despre ecuațiile de gradul doi și formula', completed: false },
    { id: 3, text: 'Începe cu problemele mai ușoare pentru a-ți crește încrederea', completed: false },
    { id: 4, text: 'Lucrează problemele de dificultate medie', completed: false },
    { id: 5, text: 'Abordează problemele dificile la final', completed: false },
    { id: 6, text: 'Verifică din nou toate soluțiile și confirmă răspunsurile', completed: false },
  ]);

  const toggleStep = (id: number) => {
    setSteps(steps.map(step => step.id === id ? { ...step, completed: !step.completed } : step));
  };

  if (!isOpen || !homework) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Plan Pas cu Pas
              </h2>
              <p className="text-white/80 text-sm">{homework.title}</p>
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
            Am împărțit această temă în pași gestionabili. Bifează-i pe măsură ce îi finalizezi!
          </p>

          <div className="space-y-3">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => toggleStep(step.id)}
                className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 transition-all ${
                  step.completed
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200 hover:border-blue-300'
                }`}
              >
                {step.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 text-left">
                  <span className="font-semibold text-xs text-gray-500">Pasul {index + 1}</span>
                  <p className={`text-sm ${step.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                    {step.text}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-900">
              <strong>Progres:</strong> {steps.filter(s => s.completed).length} din {steps.length} pași finalizați
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-6 px-6 py-3 bg-[#164B2E] text-white rounded-xl font-medium hover:bg-[#0d2819] transition-colors"
          >
            Am înțeles, mulțumesc!
          </button>
        </div>
      </div>
    </div>
  );
}
