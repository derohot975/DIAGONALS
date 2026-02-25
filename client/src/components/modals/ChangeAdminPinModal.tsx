import { useState } from 'react';
import { Delete, Key } from '@/components/icons';
import BaseModal from '../ui/BaseModal';

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

  const title = (
    <div className="flex items-center space-x-2">
      <Key className="w-5 h-5" />
      <span>Modifica PIN Admin</span>
    </div>
  );

  return (
    <BaseModal
      open={isOpen}
      onOpenChange={handleClose}
      title={title}
      size="sm"
      headerClassName="bg-gradient-to-r from-[#300505] to-[#8d0303] text-white"
      className=""
    >
      {/* Step Title */}
      <div className="mb-4">
        <p className="text-sm font-medium text-center text-white/65">{getStepTitle()}</p>
      </div>

      {/* PIN Display */}
      <div className="mb-8">
        <div className="flex justify-center space-x-4 mb-4">
          {[0, 1, 2].map(index => (
            <div
              key={index}
              className={`w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                index < getCurrentValue().length 
                  ? 'bg-white border-white shadow-lg' 
                  : 'border-white/20 bg-transparent'
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
            className="h-16 bg-white/8 hover:bg-white/15 border border-white/12 rounded-xl text-xl font-semibold text-white transition-all duration-200 active:scale-95"
          >
            {number}
          </button>
        ))}
        
        {/* Bottom row */}
        <div></div>
        
        <button
          onClick={() => handleNumberClick('0')}
          className="h-16 bg-white/8 hover:bg-white/15 border border-white/12 rounded-xl text-xl font-semibold text-white transition-all duration-200 active:scale-95"
        >
          0
        </button>
        
        <button
          onClick={handleDelete}
          className="h-16 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center text-white/50 transition-all duration-200 active:scale-95"
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
            : 'bg-white/5 text-white/25 cursor-not-allowed'
        }`}
      >
        {step === 'confirm' ? 'Salva PIN' : 'Conferma'}
      </button>
    </BaseModal>
  );
}