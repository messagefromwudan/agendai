import { X } from 'lucide-react';

type BadgeDetailsModalProps = {
  isOpen: boolean;
  badgeName: string;
  description: string;
  howToGet: string;
  earned: boolean;
  onPractice?: () => void;
  onClose: () => void;
};

export default function BadgeDetailsModal({
  isOpen,
  badgeName,
  description,
  howToGet,
  earned,
  onPractice,
  onClose,
}: BadgeDetailsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{badgeName}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          {earned ? (
            <>
              <div>
                <h3 className="font-semibold text-sm text-gray-600 mb-2">
                  Cum ai obținut această realizare
                </h3>
                <p className="text-sm text-gray-700">{description}</p>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-gray-600 mb-2">
                  Cum poți menține acest nivel
                </h3>
                <p className="text-sm text-gray-700">{howToGet}</p>
              </div>
            </>
          ) : (
            <>
              <div>
                <h3 className="font-semibold text-sm text-orange-600 mb-2">
                  Încă neblocată – dar ești aproape!
                </h3>
                <p className="text-sm text-gray-700">
                  Iată ce trebuie să faci pentru a debloca realizarea „{badgeName}”:
                </p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
                <p className="text-sm text-orange-800 whitespace-pre-line">
                  {howToGet}
                </p>
              </div>
            </>
          )}
        </div>

        <div className="space-y-3 mt-6">
          {onPractice && (
            <button
              onClick={onPractice}
              className="w-full bg-[#164B2E] text-white py-2.5 rounded-lg hover:bg-[#0d2819] transition-colors font-medium text-sm"
            >
              Lucrează la această realizare cu Asistentul AI
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full border border-gray-300 text-gray-800 py-2.5 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
          >
            Închide
          </button>
        </div>
      </div>
    </div>
  );
}
