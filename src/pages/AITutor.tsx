import { useState } from 'react';
import { Send, Paperclip, Mic, Sparkles, Lightbulb, BookOpen, Calculator } from 'lucide-react';

export default function AITutor() {
  const [message, setMessage] = useState('');
  const [mode, setMode] = useState<'explain' | 'quiz' | 'homework'>('explain');

  const modes = [
    { id: 'explain', label: 'Explică', icon: Lightbulb },
    { id: 'quiz', label: 'Test', icon: BookOpen },
    { id: 'homework', label: 'Ajutor Teme', icon: Calculator },
  ];

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#164B2E] to-[#0d2819] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Sparkles className="w-6 h-6 text-[#F1F5F9]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#F1F5F9]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Asistent Învățare AI
                </h1>
                <p className="text-[#F1F5F9]/70 text-sm">Mentorul tău personal, disponibil 24/7</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-[#F1F5F9] text-sm font-medium">Activ</span>
            </div>
          </div>

          <div className="flex gap-2">
            {modes.map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id as typeof mode)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                    mode === m.id
                      ? 'bg-white text-[#164B2E] shadow-lg'
                      : 'bg-white/10 text-[#F1F5F9] hover:bg-white/20'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#164B2E] to-[#0d2819] rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-[#F1F5F9]" />
              </div>
              <div className="bg-white rounded-2xl rounded-tl-none p-6 shadow-sm max-w-[80%]">
                <p className="text-gray-900 mb-4">
                  Salut Bianca! Sunt asistentul tău de învățare AI. Sunt aici pentru a te ajuta să înțelegi conceptele, să te pregătești pentru teste și să-ți completezi temele. Ce ai vrea să explorezi astazi?
                </p>
                <div className="flex flex-wrap gap-2">
                  <button className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm transition-colors">
                    Explică fotosinteza
                  </button>
                  <button className="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm transition-colors">
                    Testează-mă la algebră
                  </button>
                  <button className="bg-purple-50 hover:bg-purple-100 text-purple-700 px-3 py-2 rounded-lg text-sm transition-colors">
                    Ajutor cu structura eseului
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-end">
              <div className="bg-[#164B2E] text-[#F1F5F9] rounded-2xl rounded-tr-none p-6 shadow-sm max-w-[80%]">
                <p>Mă poți ajuta să înțeleg ecuațiile pătratice?</p>
              </div>
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0"></div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#164B2E] to-[#0d2819] rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-[#F1F5F9]" />
              </div>
              <div className="bg-white rounded-2xl rounded-tl-none p-6 shadow-sm max-w-[80%]">
                <p className="text-gray-900 mb-4 font-semibold">Să explorăm ecuațiile pătratice împreună!</p>
                <p className="text-gray-900 mb-4">
                  O ecuație pătratică are forma: <span className="font-mono bg-gray-100 px-2 py-1 rounded">ax² + bx + c = 0</span>
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                  <p className="text-sm font-semibold text-blue-900 mb-2">Componente principale:</p>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• a, b și c sunt constante</li>
                    <li>• x este variabila pe care o rezolvăm</li>
                    <li>• Cea mai mare putere a lui x este 2 (asta o face pătratică)</li>
                  </ul>
                </div>
                <p className="text-gray-900 mb-4">
                  Vrei ca te arăt cum să o rezolvi cu un exemplu, sau preferi să încerci mai întâi o problemă de practică?
                </p>
                <div className="flex gap-2">
                  <button className="bg-[#164B2E] hover:bg-[#0d2819] text-[#F1F5F9] px-4 py-2 rounded-lg text-sm transition-colors">
                    Arată-mi un exemplu
                  </button>
                  <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm transition-colors">
                    Dă-mi o problemă de practică
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-green-900">Progresul Lecției</p>
                  <p className="text-sm text-green-700">Ai câștigat 25 Puncte de Cunoaștere în această sesiune!</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <button className="p-3 hover:bg-gray-100 rounded-xl transition-colors">
                <Paperclip className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-3 hover:bg-gray-100 rounded-xl transition-colors">
                <Mic className="w-5 h-5 text-gray-600" />
              </button>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Întreabă-mă orice despre studiile tale..."
                className="flex-1 px-6 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#164B2E] text-sm"
              />
              <button className="bg-[#164B2E] hover:bg-[#0d2819] text-[#F1F5F9] px-6 py-3 rounded-xl transition-colors flex items-center gap-2">
                <Send className="w-5 h-5" />
                <span className="font-medium">Trimite</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
