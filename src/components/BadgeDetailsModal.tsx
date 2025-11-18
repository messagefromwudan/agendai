import { X } from 'lucide-react';

type BadgeDetailsModalProps = {
  isOpen: boolean;
  badgeName: string;
  description: string;
  howToGet: string;
  onClose: () => void;
};

export default function BadgeDetailsModal({
  isOpen,
  badgeName,
  description,
  howToGet,
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
          <div>
            <h3 className="font-semibold text-sm text-gray-600 mb-2">How You Earned It</h3>
            <p className="text-sm text-gray-700">{description}</p>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-gray-600 mb-2">How to Maintain</h3>
            <p className="text-sm text-gray-700">{howToGet}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
        >
          Close
        </button>
      </div>
    </div>
  );
}
