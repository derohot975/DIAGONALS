import { useState } from 'react';
import BaseModal from '../ui/BaseModal';

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

  const footer = (
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
        form="add-user-form"
        className="flex-1 bg-[#8d0303] hover:bg-[#300505] text-white px-4 py-2 rounded-lg transition-colors"
      >
        Aggiungi
      </button>
    </div>
  );

  return (
    <BaseModal
      open={isOpen}
      onOpenChange={onClose}
      title="Aggiungi Utente"
      size="md"
      footer={footer}
      headerClassName="bg-gradient-to-r from-[#8d0303] to-[#300505] text-white"
      className="glass-effect"
    >
      <form id="add-user-form" onSubmit={handleSubmit} className="space-y-4">
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
      </form>
    </BaseModal>
  );
}
