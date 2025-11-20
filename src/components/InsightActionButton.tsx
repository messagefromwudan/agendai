import { ArrowRight } from 'lucide-react';

type InsightActionButtonProps = {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'outline';
};

export default function InsightActionButton({
  label,
  onClick,
  variant = 'default',
}: InsightActionButtonProps) {
  if (variant === 'outline') {
    return (
      <button
        onClick={onClick}
        className="inline-flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors mt-2 group"
      >
        {label}
        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-900 hover:bg-gray-200 transition-colors mt-2"
    >
      {label}
      <ArrowRight className="w-3 h-3" />
    </button>
  );
}
