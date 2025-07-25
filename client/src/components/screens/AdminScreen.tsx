import { UserPlus, Users, Shield, Calendar, ArrowLeft, Plus, Edit, Trash2, Settings, Home, ToggleLeft, ToggleRight } from 'lucide-react';
// CACHE BREAKER v2.1
import { User } from '@shared/schema';
import { useState, useEffect } from 'react';
import diagoLogo from '@assets/diagologo.png';

interface AdminScreenProps {
  users: User[];
  onShowAddUserModal: () => void;
  onShowCreateEventModal: () => void;
  onShowEventList: () => void;
  onShowEditUserModal: (user: User) => void;
  onDeleteUser: (userId: number) => void;
  onGoBack: () => void;
}

export default function AdminScreen({ users, onShowAddUserModal, onShowCreateEventModal, onShowEventList, onShowEditUserModal, onDeleteUser, onGoBack }: AdminScreenProps) {
  const [uniqueSessionEnabled, setUniqueSessionEnabled] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('diagonale_unique_session_enabled');
    if (saved !== null) {
      setUniqueSessionEnabled(saved === 'true');
    }
  }, []);

  const toggleUniqueSession = () => {
    const newValue = !uniqueSessionEnabled;
    setUniqueSessionEnabled(newValue);
    localStorage.setItem('diagonale_unique_session_enabled', newValue.toString());
    localStorage.setItem('diagonale_unique_session_changed', Date.now().toString());
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Logo Header */}
      <div className="flex-shrink-0 flex justify-center pt-8 pb-6">
        <img 
          src={diagoLogo} 
          alt="DIAGO Logo" 
          className="mx-auto mb-2 w-24 h-auto logo-filter drop-shadow-lg" 
        />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="w-full max-w-md mx-auto">
          {/* ADMIN HEADER - FINAL VERSION */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-1">ADMIN</h1>
          </div>



        <div className="space-y-4">
          {/* 1. GESTISCI EVENTI */}
          <button
            onClick={onShowEventList}
            className="w-full bg-white hover:bg-gray-50 text-black font-medium py-3 px-4 rounded-xl border-2 border-[hsl(229,73%,69%)]/20 transition-colors flex items-center justify-center space-x-2"
          >
            <Calendar className="w-4 h-4" />
            <span>Gestisci Eventi</span>
          </button>

          {/* 2. NUOVO EVENTO */}
          <button
            onClick={onShowCreateEventModal}
            className="w-full bg-white hover:bg-gray-50 text-black font-medium py-3 px-4 rounded-xl border-2 border-[hsl(229,73%,69%)]/20 transition-colors flex items-center justify-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nuovo Evento</span>
          </button>

          {/* 3. ACCESSO UNICO */}
          <button
            onClick={toggleUniqueSession}
            className={`w-full font-medium py-3 px-4 rounded-xl border-2 transition-all relative flex items-center justify-center ${
              uniqueSessionEnabled
                ? 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200'
                : 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200'
            }`}
          >
            <span>Accesso Unico</span>
            <span className={`absolute right-4 text-xs font-bold px-2 py-1 rounded-full ${
              uniqueSessionEnabled
                ? 'bg-green-200 text-green-800'
                : 'bg-red-200 text-red-800'
            }`}>
              {uniqueSessionEnabled ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* 4. AGGIUNGI UTENTE */}
          <button
            onClick={onShowAddUserModal}
            className="w-full bg-white hover:bg-gray-50 text-[hsl(270,50%,65%)] font-medium py-3 px-4 rounded-xl border-2 border-[hsl(229,73%,69%)]/20 transition-colors flex items-center justify-center space-x-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Aggiungi Utente</span>
          </button>

          {/* 5. LISTA UTENTI (senza scritta "Utenti Registrati") */}
          <div className="bg-white/50 rounded-xl p-4 border border-gray-200">
            {users.filter(user => !user.isAdmin).length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Nessun utente registrato
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {users.filter(user => !user.isAdmin).map(user => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100"
                  >
                    <div className="flex items-center space-x-3">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-800">{user.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onShowEditUserModal(user)}
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                        title="Modifica utente"
                      >
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => onDeleteUser(user.id)}
                        className="p-1 hover:bg-red-100 rounded-full transition-colors"
                        title="Elimina utente"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

      {/* Pulsanti fissi in fondo alla pagina */}
      <div className="fixed bottom-4 left-4 z-50">
        <button
          onClick={onGoBack}
          className="bg-[hsl(229,73%,69%)] hover:bg-[hsl(270,50%,65%)] text-white p-3 rounded-full shadow-lg transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>
      
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={onGoBack}
          className="bg-[hsl(229,73%,69%)] hover:bg-[hsl(270,50%,65%)] text-white p-3 rounded-full shadow-lg transition-all"
          title="Torna alla Home"
        >
          <Home className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}