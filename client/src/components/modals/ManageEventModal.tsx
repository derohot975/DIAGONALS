import { useState, useEffect } from 'react';
import { Settings } from '@/components/icons';
import BaseModal from '../ui/BaseModal';
import { WineEvent } from '@shared/schema';
import { StepChoose, StepDeleteConfirm, StepPin, StepDeleteFinal } from './ManageEventSteps';

interface ManageEventModalProps {
  isOpen: boolean;
  event: WineEvent | null;
  onClose: () => void;
  onDelete: (eventId: number) => void;
  onProtect: (eventId: number, protect: boolean) => void;
  isProtected?: boolean;
}

type ModalStep = 'choose' | 'delete-confirm' | 'delete-pin' | 'delete-final' | 'protect-pin';
type ActionType = 'delete' | 'protect' | null;

export default function ManageEventModal({
  isOpen, event, onClose, onDelete, onProtect, isProtected = false
}: ManageEventModalProps) {
  const [step, setStep] = useState<ModalStep>('choose');
  const [selectedAction, setSelectedAction] = useState<ActionType>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(5);
  const ADMIN_PIN = localStorage.getItem('diagonale_admin_pin') || '000';

  useEffect(() => {
    if (isOpen) {
      setStep('choose');
      setSelectedAction(null);
      setPin('');
      setError('');
      setCountdown(5);
    }
  }, [isOpen]);

  useEffect(() => {
    if (step === 'delete-final' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [step, countdown]);

  if (!isOpen || !event) return null;

  const handleClose = () => {
    setStep('choose');
    setSelectedAction(null);
    setPin('');
    setError('');
    setCountdown(5);
    onClose();
  };

  const handleActionSelect = (action: ActionType) => {
    setSelectedAction(action);
    if (action === 'delete') {
      if (isProtected) { setError('Questo evento è protetto e non può essere eliminato'); return; }
      setStep('delete-confirm');
    } else if (action === 'protect') {
      setStep('protect-pin');
    }
  };

  const handleDeleteConfirm = () => {
    if (isProtected) { setError('Questo evento è protetto e non può essere eliminato'); return; }
    setStep('delete-pin');
  };

  const handleNumberClick = (number: string) => {
    if (pin.length < 3) { setPin(prev => prev + number); setError(''); }
  };

  const handleDeleteDigit = () => { setPin(prev => prev.slice(0, -1)); setError(''); };

  const handlePinConfirm = () => {
    if (pin === ADMIN_PIN) {
      if (selectedAction === 'delete') { setStep('delete-final'); setError(''); }
      else if (selectedAction === 'protect') { onProtect(event.id, !isProtected); handleClose(); }
    } else {
      setError('PIN Admin non valido');
      setPin('');
    }
  };

  const handleFinalDeleteConfirm = () => {
    if (countdown === 0) { onDelete(event.id); handleClose(); }
  };

  const commonProps = { event, isProtected, selectedAction, pin, error, countdown, adminPin: ADMIN_PIN, onClose: handleClose };

  const renderStep = () => {
    switch (step) {
      case 'choose': return <StepChoose {...commonProps} onActionSelect={handleActionSelect} />;
      case 'delete-confirm': return <StepDeleteConfirm {...commonProps} onDeleteConfirm={handleDeleteConfirm} />;
      case 'delete-pin':
      case 'protect-pin': return <StepPin {...commonProps} onNumberClick={handleNumberClick} onDeleteDigit={handleDeleteDigit} onPinConfirm={handlePinConfirm} />;
      case 'delete-final': return <StepDeleteFinal {...commonProps} onFinalDeleteConfirm={handleFinalDeleteConfirm} />;
      default: return <StepChoose {...commonProps} onActionSelect={handleActionSelect} />;
    }
  };

  return (
    <BaseModal
      open={isOpen}
      onOpenChange={handleClose}
      title={<div className="flex items-center space-x-2"><Settings className="w-5 h-5" /><span>Gestisci Evento</span></div>}
      size="sm"
      headerClassName="bg-white/5 text-white"
      className=""
    >
      {renderStep()}
    </BaseModal>
  );
}
