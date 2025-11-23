import { CheckCircle2, X } from 'lucide-react';

type ToastProps = {
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose: () => void;
};

export default function Toast({ message, action, onClose }: ToastProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 animate-slide-up z-50 max-w-md">
      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
      <span className="font-medium flex-1">{message}</span>
      {action && (
        <button
          onClick={action.onClick}
          className="text-blue-300 hover:text-blue-200 font-semibold text-sm transition-colors"
        >
          {action.label}
        </button>
      )}
      <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
