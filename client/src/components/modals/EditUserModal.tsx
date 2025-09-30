import { useState, useEffect } from 'react';
import BaseModal from '../ui/BaseModal';
import { User as UserType } from '@shared/schema';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType | null;
  onUpdateUser: (id: number, name: string, isAdmin: boolean) => void;
}

export default function EditUserModal({ isOpen, onClose, user, onUpdateUser }: EditUserModalProps) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && user) {
      onUpdateUser(user.id, name.trim(), false); // Always false - only regular users
      onClose();
    }
  };

  if (!user) return null;

  const footer = (
    <div className="flex space-x-3">
      <button
        type="button"
        onClick={onClose}
        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
      >
        Annulla
      </button>
      <button
        type="submit"
        form="edit-user-form"
        className="flex-1 bg-[hsl(270,50%,65%)] hover:bg-[hsl(229,73%,69%)] text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        Salva Modifiche
      </button>
    </div>
  );

  return (
    <BaseModal
      open={isOpen}
      onOpenChange={onClose}
      title="Modifica Utente"
      size="md"
      footer={footer}
      className="animate-fade-in"
    >
      <form id="edit-user-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome Utente
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value.toUpperCase())}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(270,50%,65%)] focus:border-transparent uppercase"
            placeholder="Inserisci il nome"
            required
          />
        </div>
      </form>
    </BaseModal>
  );
}