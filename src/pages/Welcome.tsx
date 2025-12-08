import { Brain } from 'lucide-react';

type WelcomeProps = {
  onNavigate: (page: string) => void;
};

export default function Welcome({ onNavigate }: WelcomeProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center animate-fade-in">
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 bg-gradient-to-br from-[#164B2E] to-[#0d2819] rounded-2xl flex items-center justify-center shadow-lg">
            <Brain className="w-10 h-10 text-[#F1F5F9]" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-3">AgendAI</h1>
        <p className="text-lg text-gray-600 mb-12">
          Your intelligent learning companion for success
        </p>

        <div className="space-y-3">
          <button
            onClick={() => onNavigate('signup')}
            className="w-full bg-[#164B2E] hover:bg-[#0d2819] text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
          >
            Creează cont
          </button>

          <button
            onClick={() => onNavigate('login')}
            className="w-full bg-white hover:bg-gray-50 text-[#164B2E] font-semibold py-3 px-4 rounded-xl border-2 border-[#164B2E] transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
          >
            Autentificare
          </button>
        </div>

        <p className="text-sm text-gray-500 mt-8">
          © 2024 AgendAI. All rights reserved.
        </p>
      </div>
    </div>
  );
}
