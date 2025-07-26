import { useState } from 'react';
import { X, Delete } from 'lucide-react';

interface AdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminPinModal({ isOpen, onClose, onSuccess }: AdminPinModalProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const ADMIN_PIN = '00';

  if (!isOpen) return null;

  const handleNumberClick = (number: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + number);
      setError('');
    }
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  const handleConfirm = () => {
    if (pin === ADMIN_PIN) {
      onSuccess();
      setPin('');
      setError('');
    } else {
      setError('Codice non valido');
      setPin('');
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Accesso Admin</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* PIN Display */}
        <div className="mb-6">
          <div className="flex justify-center space-x-3 mb-2">
            {[0, 1, 2, 3].map(index => (
              <div
                key={index}
                className={`w-4 h-4 rounded-full border-2 transition-colors ${
                  index < pin.length 
                    ? 'bg-[#300505] border-[#300505]' 
                    : 'border-gray-300 bg-gray-100'
                }`}
              />
            ))}
          </div>
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}
        </div>

        {/* Number Pad */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(number => (
            <button
              key={number}
              onClick={() => handleNumberClick(number.toString())}
              className="h-16 bg-gray-50 hover:bg-gray-100 rounded-xl text-xl font-semibold text-gray-700 transition-colors active:scale-95"
            >
              {number}
            </button>
          ))}
          
          {/* Bottom row */}
          <button
            onClick={handleClear}
            className="h-16 bg-red-50 hover:bg-red-100 rounded-xl text-sm font-medium text-red-600 transition-colors active:scale-95"
          >
            Clear
          </button>
          
          <button
            onClick={() => handleNumberClick('0')}
            className="h-16 bg-gray-50 hover:bg-gray-100 rounded-xl text-xl font-semibold text-gray-700 transition-colors active:scale-95"
          >
            0
          </button>
          
          <button
            onClick={handleDelete}
            className="h-16 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 transition-colors active:scale-95"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>

        {/* Confirm Button */}
        <button
          onClick={handleConfirm}
          disabled={pin.length === 0}
          className={`w-full h-12 rounded-xl font-semibold transition-all ${
            pin.length > 0
              ? 'bg-[#300505] hover:bg-[#8d0303] text-white active:scale-95'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Conferma
        </button>
      </div>
    </div>
  );
}