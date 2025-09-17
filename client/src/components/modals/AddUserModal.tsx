import { X } from '@/components/icons';
import { useState } from 'react';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUser: (name: string, isAdmin: boolean) => void;
}

export default function AddUserModal({ isOpen, onClose, onAddUser }: AddUserModalProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAddUser(name.trim(), false); // Always create regular users, never admin
      setName('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="glass-effect rounded-2xl shadow-2xl p-6 w-full max-w-md m-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-[#8d0303]">Aggiungi Utente</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Utente</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.toUpperCase())}
              placeholder="Inserisci il nome..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(229,73%,69%)] uppercase"
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
              Aggiungi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
