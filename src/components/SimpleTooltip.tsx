import { Info } from 'lucide-react';
import { useState } from 'react';

type SimpleTooltipProps = {
  text: string;
  children?: React.ReactNode;
};

export default function SimpleTooltip({ text, children }: SimpleTooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative inline-block z-20">
      <button
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
      >
        {children || <Info className="w-4 h-4" />}
      </button>
      {visible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 pointer-events-none">
          <div
            className="bg-gray-900 text-white text-xs leading-snug rounded-lg px-3 py-2 whitespace-normal break-words min-w-[260px] max-w-[320px] text-left shadow-xl"
          >
            {text}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
}
