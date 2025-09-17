import { useState } from 'react';
import { X, Delete, Key } from '@/components/icons';

interface ChangeAdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newPin: string) => void;
}

export default function ChangeAdminPinModal({ isOpen, onClose, onSuccess }: ChangeAdminPinModalProps) {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'current' | 'new' | 'confirm'>('current');
  const [error, setError] = useState('');
  const CURRENT_ADMIN_PIN = '000';

  if (!isOpen) return null;

  const handleNumberClick = (number: string) => {
    const getCurrentInput = () => {
      switch (step) {
        case 'current': return currentPin;
        case 'new': return newPin;
        case 'confirm': return confirmPin;
      }
    };

    const currentInput = getCurrentInput();
    if (currentInput.length < 3) {
      const newValue = currentInput + number;
      switch (step) {
        case 'current':
          setCurrentPin(newValue);
          break;
        case 'new':
          setNewPin(newValue);
          break;
        case 'confirm':
          setConfirmPin(newValue);
          break;
      }
      setError('');
    }
  };

  const handleDelete = () => {
    switch (step) {
      case 'current':
        setCurrentPin(prev => prev.slice(0, -1));
        break;
      case 'new':
        setNewPin(prev => prev.slice(0, -1));
        break;
      case 'confirm':
        setConfirmPin(prev => prev.slice(0, -1));
        break;
    }
    setError('');
  };

  const handleConfirm = () => {
    switch (step) {
      case 'current':
        if (currentPin === CURRENT_ADMIN_PIN) {
          setStep('new');
          setError('');
        } else {
          setError('PIN corrente non valido');
          setCurrentPin('');
        }
        break;
      case 'new':
        if (newPin.length === 3) {
          setStep('confirm');
          setError('');
        } else {
          setError('Il PIN deve essere di 3 cifre');
        }
        break;
      case 'confirm':
        if (confirmPin === newPin) {
          onSuccess(newPin);
          handleClose();
        } else {
          setError('I PIN non corrispondono');
          setConfirmPin('');
        }
        break;
    }
  };

  const handleClose = () => {
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
    setStep('current');
    setError('');
    onClose();
  };

  const getCurrentValue = () => {
    switch (step) {
      case 'current': return currentPin;
      case 'new': return newPin;
      case 'confirm': return confirmPin;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'current': return 'Inserisci PIN corrente';
      case 'new': return 'Inserisci nuovo PIN';
      case 'confirm': return 'Conferma nuovo PIN';
    }
  };

  const canConfirm = () => {
    const currentValue = getCurrentValue();
    switch (step) {
      case 'current':
        return currentValue === CURRENT_ADMIN_PIN;
      case 'new':
        return currentValue.length === 3;
      case 'confirm':
        return currentValue === newPin;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 w-full max-w-sm mx-auto shadow-2xl border border-[#300505]/10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Key className="w-5 h-5 text-[#300505]" />
            <h2 className="text-lg font-semibold text-[#300505]">Modifica PIN Admin</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-[#300505]/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-[#300505]" />
          </button>
        </div>

        {/* Step Title */}
        <div className="mb-4">
          <p className="text-sm font-medium text-center text-[#300505]">{getStepTitle()}</p>
        </div>

        {/* PIN Display */}
        <div className="mb-8">
          <div className="flex justify-center space-x-4 mb-4">
            {[0, 1, 2].map(index => (
              <div
                key={index}
                className={`w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                  index < getCurrentValue().length 
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
          disabled={getCurrentValue().length === 0}
          className={`w-full h-14 rounded-xl font-semibold transition-all duration-200 ${
            canConfirm()
              ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white active:scale-95 shadow-lg'
              : getCurrentValue().length > 0
              ? 'bg-gradient-to-r from-[#300505] to-[#8d0303] hover:from-[#8d0303] hover:to-[#300505] text-white active:scale-95 shadow-lg'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {step === 'confirm' ? 'Salva PIN' : 'Conferma'}
        </button>
      </div>
    </div>
  );
}