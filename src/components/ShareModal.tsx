import { X, Copy, Mail, MessageSquare, Users } from 'lucide-react';
import { useState } from 'react';

type ShareModalProps = {
  isOpen: boolean;
  onClose: () => void;
  homework: {
    title: string;
    subject: string;
  } | null;
};

export default function ShareModal({ isOpen, onClose, homework }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !homework) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(`Vezi această temă: ${homework.title} (${homework.subject})`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Distribuie Tema
            </h2>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">{homework.title}</p>
        </div>

        <div className="p-6 space-y-3">
          <button
            onClick={handleCopy}
            className="w-full flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Copy className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-gray-900">{copied ? 'Copiat!' : 'Copiază Link'}</p>
              <p className="text-sm text-gray-600">Distribuie prin clipboard</p>
            </div>
          </button>

          <button
            onClick={() => console.log('Share via email')}
            className="w-full flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors"
          >
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Mail className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-gray-900">Email</p>
              <p className="text-sm text-gray-600">Trimite colegilor</p>
            </div>
          </button>

          <button
            onClick={() => console.log('Share via message')}
            className="w-full flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-gray-900">Mesaj</p>
              <p className="text-sm text-gray-600">Distribuie în chat</p>
            </div>
          </button>

          <button
            onClick={() => console.log('Share to study group')}
            className="w-full flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors"
          >
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-gray-900">Grup de Studiu</p>
              <p className="text-sm text-gray-600">Postează în grup</p>
            </div>
          </button>
        </div>

        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            Anulează
          </button>
        </div>
      </div>
    </div>
  );
}
