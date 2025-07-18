import { useState, useEffect } from 'react';
import { X, User, Shield } from 'lucide-react';
import { User as UserType } from '@shared/schema';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType | null;
  onUpdateUser: (id: number, name: string, isAdmin: boolean) => void;
}

export default function EditUserModal({ isOpen, onClose, user, onUpdateUser }: EditUserModalProps) {
  const [name, setName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setIsAdmin(user.isAdmin);
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && user) {
      onUpdateUser(user.id, name.trim(), isAdmin);
      onClose();
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Modifica Utente</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome Utente
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(270,50%,65%)] focus:border-transparent"
              placeholder="Inserisci il nome"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo Utente
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="userType"
                  value="user"
                  checked={!isAdmin}
                  onChange={() => setIsAdmin(false)}
                  className="text-[hsl(270,50%,65%)]"
                />
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Utente Normale</span>
                </div>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="userType"
                  value="admin"
                  checked={isAdmin}
                  onChange={() => setIsAdmin(true)}
                  className="text-[hsl(270,50%,65%)]"
                />
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-[hsl(270,50%,65%)]" />
                  <span className="text-sm text-gray-700">Amministratore</span>
                </div>
              </label>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="flex-1 bg-[hsl(270,50%,65%)] hover:bg-[hsl(229,73%,69%)] text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Salva Modifiche
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}