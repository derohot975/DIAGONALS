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
  const ADMIN_PIN = '000';

  if (!isOpen) return null;

  const handleNumberClick = (number: string) => {
    if (pin.length < 3) {
      setPin(prev => prev + number);
      setError('');
    }
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
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 w-full max-w-sm mx-auto shadow-2xl border border-[#300505]/10">
        {/* Header */}
        <div className="flex items-center justify-end mb-6">
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#300505]/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-[#300505]" />
          </button>
        </div>

        {/* PIN Display */}
        <div className="mb-8">
          <div className="flex justify-center space-x-4 mb-4">
            {[0, 1, 2].map(index => (
              <div
                key={index}
                className={`w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                  index < pin.length 
                    ? 'bg-[#300505] border-[#300505] shadow-lg' 
                    : 'border-[#300505]/30 bg-white'
                }`}
              />
            ))}
          </div>
          {error && (
            <p className="text-red-500 text-sm text-center font-medium">{error}</p>
          )}
        </div>

        {/* Number Pad */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(number => (
            <button
              key={number}
              onClick={() => handleNumberClick(number.toString())}
              className="h-16 bg-white hover:bg-[#300505] hover:text-white border border-[#300505]/20 hover:border-[#300505] rounded-xl text-xl font-semibold text-[#300505] transition-all duration-200 active:scale-95 shadow-sm"
            >
              {number}
            </button>
          ))}
          
          {/* Bottom row */}
          <div></div>
          
          <button
            onClick={() => handleNumberClick('0')}
            className="h-16 bg-white hover:bg-[#300505] hover:text-white border border-[#300505]/20 hover:border-[#300505] rounded-xl text-xl font-semibold text-[#300505] transition-all duration-200 active:scale-95 shadow-sm"
          >
            0
          </button>
          
          <button
            onClick={handleDelete}
            className="h-16 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl flex items-center justify-center text-gray-600 transition-all duration-200 active:scale-95"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>

        {/* Confirm Button */}
        <button
          onClick={handleConfirm}
          disabled={pin.length === 0}
          className={`w-full h-14 rounded-xl font-semibold transition-all duration-200 ${
            pin === ADMIN_PIN
              ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white active:scale-95 shadow-lg'
              : pin.length > 0
              ? 'bg-gradient-to-r from-[#300505] to-[#8d0303] hover:from-[#8d0303] hover:to-[#300505] text-white active:scale-95 shadow-lg'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Conferma
        </button>
      </div>
    </div>
  );
}