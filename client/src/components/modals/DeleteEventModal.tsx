import { useState, useEffect } from 'react';
import { Trash2, X, Delete } from '@/components/icons';
import BaseModal from '../ui/BaseModal';
import { WineEvent } from '@shared/schema';
import { formatEventName, formatEventDate } from '@/lib/utils';

interface DeleteEventModalProps {
  isOpen: boolean;
  event: WineEvent | null;
  onClose: () => void;
  onConfirm: (eventId: number) => void;
  isProtected?: boolean;
}

type ModalStep = 'confirm' | 'pin' | 'final';

export default function DeleteEventModal({ 
  isOpen, 
  event, 
  onClose, 
  onConfirm,
  isProtected = false 
}: DeleteEventModalProps) {
  const [step, setStep] = useState<ModalStep>('confirm');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(5);
  const ADMIN_PIN = localStorage.getItem('diagonale_admin_pin') || '000';

  // Reset state quando il modal si apre/chiude
  useEffect(() => {
    if (isOpen) {
      setStep('confirm');
      setPin('');
      setError('');
      setCountdown(5);
    }
  }, [isOpen]);

  // Countdown per conferma finale
  useEffect(() => {
    if (step === 'final' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [step, countdown]);

  if (!isOpen || !event) return null;

  const handleClose = () => {
    setStep('confirm');
    setPin('');
    setError('');
    setCountdown(5);
    onClose();
  };

  const handleFirstConfirm = () => {
    if (isProtected) {
      setError('Questo evento è protetto e non può essere eliminato');
      return;
    }
    setStep('pin');
  };

  const handleNumberClick = (number: string) => {
    if (pin.length < 3) {
      setPin(prev => prev + number);
      setError('');
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  const handlePinConfirm = () => {
    if (pin === ADMIN_PIN) {
      setStep('final');
      setError('');
    } else {
      setError('PIN Admin non valido');
      setPin('');
    }
  };

  const handleFinalConfirm = () => {
    if (countdown === 0) {
      onConfirm(event.id);
      handleClose();
    }
  };

  const renderConfirmStep = () => (
    <div className="space-y-6">
      {/* Warning Icon */}
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <Trash2 className="w-8 h-8 text-red-600" />
        </div>
      </div>

      {/* Event Info */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-bold text-gray-900">
          {formatEventName(event.name)}
        </h3>
        <p className="text-sm text-gray-600">
          {formatEventDate(event.date)}
        </p>
      </div>

      {/* Warning Message */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Trash2 className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-red-800">
            <p className="font-semibold mb-2">⚠️ ATTENZIONE: Eliminazione Definitiva</p>
            <ul className="space-y-1 text-xs">
              <li>• Tutti i vini dell'evento verranno eliminati</li>
              <li>• Tutti i voti associati andranno persi</li>
              <li>• I report generati verranno cancellati</li>
              <li>• <strong>Questa azione NON può essere annullata</strong></li>
            </ul>
          </div>
        </div>
      </div>

      {isProtected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <X className="w-5 h-5 text-yellow-600" />
            <p className="text-sm font-semibold text-yellow-800">
              🛡️ Evento Protetto - Non eliminabile
            </p>
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={handleClose}
          className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
        >
          Annulla
        </button>
        <button
          onClick={handleFirstConfirm}
          disabled={isProtected}
          className={`flex-1 px-4 py-3 font-medium rounded-xl transition-colors ${
            isProtected
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          Continua
        </button>
      </div>
    </div>
  );

  const renderPinStep = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Trash2 className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Autenticazione Admin</h3>
        <p className="text-sm text-gray-600 mt-1">Inserisci il PIN Admin per confermare</p>
      </div>

      {/* PIN Display */}
      <div className="space-y-4">
        <div className="flex justify-center space-x-4">
          {[0, 1, 2].map(index => (
            <div
              key={index}
              className={`w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                index < pin.length 
                  ? 'bg-red-600 border-red-600 shadow-lg' 
                  : 'border-red-300 bg-white'
              }`}
            />
          ))}
        </div>
        {error && (
          <p className="text-red-500 text-sm text-center font-medium">{error}</p>
        )}
      </div>

      {/* Number Pad */}
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(number => (
          <button
            key={number}
            onClick={() => handleNumberClick(number.toString())}
            className="h-12 bg-white hover:bg-red-50 border border-red-200 hover:border-red-300 rounded-lg text-lg font-semibold text-red-700 transition-all duration-200 active:scale-95"
          >
            {number}
          </button>
        ))}
        
        <div></div>
        <button
          onClick={() => handleNumberClick('0')}
          className="h-12 bg-white hover:bg-red-50 border border-red-200 hover:border-red-300 rounded-lg text-lg font-semibold text-red-700 transition-all duration-200 active:scale-95"
        >
          0
        </button>
        <button
          onClick={handleDelete}
          className="h-12 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center text-gray-600 transition-all duration-200 active:scale-95"
        >
          <Delete className="w-5 h-5" />
        </button>
      </div>

      {/* Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={handleClose}
          className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
        >
          Annulla
        </button>
        <button
          onClick={handlePinConfirm}
          disabled={pin.length === 0}
          className={`flex-1 px-4 py-3 font-medium rounded-xl transition-colors ${
            pin === ADMIN_PIN
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : pin.length > 0
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Conferma PIN
        </button>
      </div>
    </div>
  );

  const renderFinalStep = () => (
    <div className="space-y-6">
      {/* Danger Icon */}
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center animate-pulse">
          <Trash2 className="w-8 h-8 text-white" />
        </div>
      </div>

      {/* Final Warning */}
      <div className="text-center space-y-3">
        <h3 className="text-xl font-bold text-red-600">ULTIMA CONFERMA</h3>
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-red-800 mb-2">
            Stai per eliminare definitivamente:
          </p>
          <p className="text-lg font-bold text-red-900">
            {formatEventName(event.name)}
          </p>
          <p className="text-sm text-red-700 mt-2">
            Tutti i dati associati verranno persi per sempre
          </p>
        </div>
      </div>

      {/* Countdown */}
      <div className="text-center">
        <div className={`text-4xl font-bold ${countdown > 0 ? 'text-red-600' : 'text-green-600'}`}>
          {countdown > 0 ? countdown : '✓'}
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {countdown > 0 ? 'Attendi per confermare...' : 'Pronto per eliminare'}
        </p>
      </div>

      {/* Final Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={handleClose}
          className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
        >
          Annulla
        </button>
        <button
          onClick={handleFinalConfirm}
          disabled={countdown > 0}
          className={`flex-1 px-4 py-3 font-bold rounded-xl transition-all duration-200 ${
            countdown === 0
              ? 'bg-red-600 hover:bg-red-700 text-white active:scale-95'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {countdown === 0 ? 'ELIMINA DEFINITIVAMENTE' : `Attendi ${countdown}s`}
        </button>
      </div>
    </div>
  );

  const getStepContent = () => {
    switch (step) {
      case 'confirm': return renderConfirmStep();
      case 'pin': return renderPinStep();
      case 'final': return renderFinalStep();
    }
  };

  const title = (
    <div className="flex items-center space-x-2">
      <Trash2 className="w-5 h-5" />
      <span>Elimina Evento</span>
    </div>
  );

  return (
    <BaseModal
      open={isOpen}
      onOpenChange={handleClose}
      title={title}
      size="sm"
      headerClassName="bg-gradient-to-r from-red-600 to-red-700 text-white"
      className="bg-white border border-red-200"
    >
      {getStepContent()}
    </BaseModal>
  );
}
