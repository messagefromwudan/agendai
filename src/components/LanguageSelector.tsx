import { Globe, Check } from 'lucide-react';

type Language = 'en' | 'ro';

type LanguageSelectorProps = {
  selected: Language;
  onChange: (language: Language) => void;
};

const languages = {
  en: { label: 'Engleză', flag: '🇬🇧' },
  ro: { label: 'Română', flag: '🇷🇴' },
};

export default function LanguageSelector({ selected, onChange }: LanguageSelectorProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-medium text-gray-700">Limbă</label>
        <p className="text-xs text-gray-500 italic">Schimbările se aplică instant.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {(Object.keys(languages) as Language[]).map((lang) => {
          const isSelected = selected === lang;
          return (
            <button
              key={lang}
              onClick={() => onChange(lang)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onChange(lang);
                }
              }}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-[#164B2E] focus:ring-offset-2 ${
                isSelected
                  ? 'border-[#164B2E] bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Globe className={`w-5 h-5 ${isSelected ? 'text-[#164B2E]' : 'text-gray-600'}`} />
              <span className={`font-medium flex-1 text-left ${isSelected ? 'text-[#164B2E]' : 'text-gray-700'}`}>
                {languages[lang].label}
              </span>
              {isSelected && (
                <Check className="w-5 h-5 text-[#164B2E]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
