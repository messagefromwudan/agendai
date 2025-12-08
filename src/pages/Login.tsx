import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Brain, AlertCircle } from 'lucide-react';

type LoginProps = {
  onNavigate: (page: string) => void;
};

export default function Login({ onNavigate }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        setError(loginError.message);
        return;
      }

      onNavigate('dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-8 flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#164B2E] to-[#0d2819] rounded-2xl flex items-center justify-center shadow-lg">
            <Brain className="w-8 h-8 text-[#F1F5F9]" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
          Autentificare
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Bun venit înapoi la AgendAI
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-gap-3 gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#164B2E] transition-all"
              placeholder="ion@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Parolă
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#164B2E] transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#164B2E] hover:bg-[#0d2819] disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
          >
            {loading ? 'Se conectează...' : 'Autentificare'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Nu ai cont?{' '}
          <button
            onClick={() => onNavigate('signup')}
            className="text-[#164B2E] font-semibold hover:underline"
          >
            Creează cont
          </button>
        </p>
      </div>
    </div>
  );
}
