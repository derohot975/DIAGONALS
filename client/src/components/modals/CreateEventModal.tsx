import { X } from '@/components/icons';
import { useState } from 'react';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateEvent: (name: string, date: string, mode: string) => void;
}

export default function CreateEventModal({ isOpen, onClose, onCreateEvent }: CreateEventModalProps) {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && date) {
      onCreateEvent(name.trim(), date, 'DIAGONALE');
      setName('');
      setDate('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="glass-effect rounded-2xl shadow-2xl p-6 w-full max-w-md m-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-[#8d0303]">Crea Nuovo Evento</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Evento</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="es. Degustazione di Brunello..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(229,73%,69%)]"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(229,73%,69%)]"
              required
            />
          </div>
          

          
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="flex-1 bg-[#8d0303] hover:bg-[#300505] text-white px-4 py-2 rounded-lg transition-colors"
            >
              Crea Evento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
