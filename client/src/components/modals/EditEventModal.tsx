import { useState, useEffect } from 'react';
import BaseModal from '../ui/BaseModal';
import { WineEvent } from '@shared/schema';

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateEvent: (id: number, name: string, date: string, mode: string) => void;
  event: WineEvent | null;
}

export default function EditEventModal({ isOpen, onClose, onUpdateEvent, event }: EditEventModalProps) {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    if (event) {
      setName(event.name);
      setDate(event.date);
    }
  }, [event]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (event && name.trim() && date) {
      onUpdateEvent(event.id, name.trim(), date, 'DIAGONALE');
      onClose();
    }
  };

  if (!event) return null;

  const footer = (
    <div className="flex space-x-2">
      <button
        type="button"
        onClick={onClose}
        className="flex-1 px-4 py-2 border border-white/12 rounded-lg text-white/60 hover:bg-white/8 transition-colors"
      >
        Annulla
      </button>
      <button
        type="submit"
        form="edit-event-form"
        className="flex-1 bg-[#8d0303] hover:bg-[#300505] text-white px-4 py-2 rounded-lg transition-colors"
      >
        Salva Modifiche
      </button>
    </div>
  );

  return (
    <BaseModal
      open={isOpen}
      onOpenChange={onClose}
      title="Modifica Evento"
      size="md"
      footer={footer}
      headerClassName="bg-gradient-to-r from-[#8d0303] to-[#300505] text-white text-center"
      className="glass-effect"
      showCloseButton={false}
    >
        
      <form id="edit-event-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1">Nome Evento</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="es. Degustazione di Brunello..."
              className="w-full px-3 py-2 bg-white/8 border border-white/12 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 text-white placeholder-white/30"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1">Data Evento</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-white/8 border border-white/12 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 text-white"
              required
            />
          </div>
      </form>
    </BaseModal>
  );
}