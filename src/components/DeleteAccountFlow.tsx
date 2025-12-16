import { X, AlertTriangle, Lock } from 'lucide-react';
import { useState } from 'react';

type DeleteAccountFlowProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

type Step = 'password' | 'confirmation' | 'final';

export default function DeleteAccountFlow({ isOpen, onClose, onConfirm }: DeleteAccountFlowProps) {
  const [step, setStep] = useState<Step>('password');
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');

  if (!isOpen) return null;

  const handlePasswordSubmit = () => {
    if (!password) {
      setPasswordError('Parola este obligatorie');
      return;
    }
    setPasswordError('');
    setStep('confirmation');
  };

  const handleConfirmationSubmit = () => {
    if (confirmText !== 'DELETE') {
      setConfirmError('Te rugăm să tastezi DELETE exact așa cum apare');
      return;
    }
    setConfirmError('');
    setStep('final');
  };

  const handleFinalConfirm = () => {
    onConfirm();
    handleClose();
  };

  const handleClose = () => {
    setStep('password');
    setPassword('');
    setConfirmText('');
    setPasswordError('');
    setConfirmError('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-red-500 p-6 text-white rounded-t-2xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Ștergere cont
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-white/90 text-sm">
            Această acțiune este permanentă. Datele tale nu pot fi recuperate.
          </p>
        </div>

        <div className="p-6 space-y-6">
          {step === 'password' && (
            <>
              <div>
                <p className="text-sm text-gray-700 mb-4">
                  Pentru a continua, introdu parola pentru a-ți verifica identitatea.
                </p>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordError('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handlePasswordSubmit();
                      }
                    }}
                    placeholder="Introdu parola ta"
                    className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${
                      passwordError ? 'border-red-500' : 'border-gray-200'
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm`}
                    autoFocus
                  />
                </div>
                {passwordError && (
                  <p className="text-red-600 text-xs mt-2">{passwordError}</p>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Anulează
                </button>
                <button
                  onClick={handlePasswordSubmit}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
                >
                  Continuă
                </button>
              </div>
            </>
          )}

          {step === 'confirmation' && (
            <>
              <div>
                <p className="text-sm text-gray-700 mb-4">
                  Tastează <strong className="font-mono text-red-600">DELETE</strong> pentru a confirma că vrei să ștergi definitiv contul.
                </p>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => {
                    setConfirmText(e.target.value);
                    setConfirmError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleConfirmationSubmit();
                    }
                  }}
                  placeholder="Tastează DELETE"
                  className={`w-full px-4 py-3 bg-gray-50 border ${
                    confirmError ? 'border-red-500' : 'border-gray-200'
                  } rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm font-mono`}
                  autoFocus
                />
                {confirmError && (
                  <p className="text-red-600 text-xs mt-2">{confirmError}</p>
                )}
              </div>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-800">
                  <strong>Atenție:</strong> Toate datele tale, inclusiv note, teme, mesaje și progresul cu AI, vor fi șterse definitiv.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Anulează
                </button>
                <button
                  onClick={handleConfirmationSubmit}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
                >
                  Continuă
                </button>
              </div>
            </>
          )}

          {step === 'final' && (
            <>
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Confirmare finală</h3>
                <p className="text-sm text-gray-600">
                  Ești absolut sigur(ă) că vrei să îți ștergi contul? Acest lucru nu poate fi anulat.
                </p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <ul className="text-sm text-red-800 space-y-1">
                  <li>• Toate datele tale academice vor fi șterse</li>
                  <li>• Progresul tău la învățare va fi pierdut</li>
                  <li>• Mesajele și notificările vor fi eliminate</li>
                  <li>• Această acțiune este ireversibilă</li>
                </ul>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Anulează
                </button>
                <button
                  onClick={handleFinalConfirm}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors shadow-lg hover:shadow-xl"
                >
                  Șterge contul meu
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
