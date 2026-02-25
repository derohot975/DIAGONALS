import { useState, useEffect } from 'react';
import { X } from '@/components/icons';
import { getZIndexClass } from '@/styles/tokens/zIndex';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateEvent: (name: string, date: string, mode: string) => void;
}

export default function CreateEventModal({ isOpen, onClose, onCreateEvent }: CreateEventModalProps) {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && date) {
      onCreateEvent(name.trim(), date, 'DIAGONALE');
      setName('');
      setDate('');
      onClose();
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center ${getZIndexClass('MODAL_OVERLAY')} p-4`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ touchAction: 'none' }}
    >
      <div
        className="w-full max-w-md bg-[#1e0404] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ marginBottom: 'var(--bottom-nav-total, 56px)' }}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">Crea Nuovo Evento</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-colors"
            aria-label="Chiudi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form id="create-event-form" onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">
              Nome Evento
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="es. Degustazione di Brunello..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/25 focus:outline-none focus:border-white/25 focus:bg-white/8 transition-colors"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">
              Data
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white/80 focus:outline-none focus:border-white/25 transition-colors"
              style={{ colorScheme: 'dark' }}
              required
            />
          </div>
        </form>

        <div className="flex space-x-3 px-5 pb-5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/60 font-bold text-sm active:scale-95 transition-all"
          >
            Annulla
          </button>
          <button
            type="submit"
            form="create-event-form"
            className="flex-1 py-3 rounded-2xl bg-white text-red-950 font-bold text-sm shadow-lg active:scale-95 transition-all"
          >
            Crea Evento
          </button>
        </div>
      </div>
    </div>
  );
}
