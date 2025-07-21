import { UserPlus, Users, Shield, Calendar, ArrowLeft, Plus, Edit, Trash2, Settings, Home, ToggleLeft, ToggleRight } from 'lucide-react';
import { User } from '@shared/schema';
import { useState, useEffect } from 'react';

interface AdminScreenProps {
  users: User[];
  onShowAddUserModal: () => void;
  onShowCreateEventModal: () => void;
  onShowEventList: () => void;
  onShowVotingManager: () => void;
  onShowEditUserModal: (user: User) => void;
  onDeleteUser: (userId: number) => void;
  onGoBack: () => void;
}

export default function AdminScreen({ users, onShowAddUserModal, onShowCreateEventModal, onShowEventList, onShowVotingManager, onShowEditUserModal, onDeleteUser, onGoBack }: AdminScreenProps) {
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
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md glass-effect rounded-2xl shadow-2xl p-6 animate-fade-in">
        {/* Header Admin */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[hsl(270,50%,65%)] mb-1">admin</h1>
        </div>



        <div className="space-y-4">
          <div className="bg-white/50 rounded-xl p-4 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Utenti Registrati ({users.filter(user => !user.isAdmin).length})
            </h3>
            
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

          <div className="space-y-3">
            <button
              onClick={onShowAddUserModal}
              className="w-full bg-[hsl(229,73%,69%)] hover:bg-[hsl(270,50%,65%)] text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Aggiungi Utente</span>
            </button>
            
            <button
              onClick={onShowCreateEventModal}
              className="w-full bg-[hsl(270,50%,65%)] hover:bg-[hsl(229,73%,69%)] text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nuovo Evento</span>
            </button>
            
            <button
              onClick={onShowEventList}
              className="w-full bg-white hover:bg-gray-50 text-[hsl(270,50%,65%)] font-medium py-3 px-4 rounded-xl border-2 border-[hsl(229,73%,69%)]/20 transition-colors flex items-center justify-center space-x-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Gestisci Eventi</span>
            </button>
            
            <button
              onClick={onShowVotingManager}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2"
            >
              <Settings className="w-4 h-4" />
              <span>Gestisci Votazioni</span>
            </button>
          </div>
        </div>
        
        {/* Toggle Controllo Accesso Unico - In fondo */}
        <div className="mt-4 bg-orange-50 rounded-xl p-4 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-orange-800 mb-1">Accesso Unico</h3>
              <p className="text-xs text-orange-600">Un utente per dispositivo</p>
            </div>
            <button
              onClick={toggleUniqueSession}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                uniqueSessionEnabled 
                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {uniqueSessionEnabled ? (
                <>
                  <ToggleRight className="w-5 h-5" />
                  <span className="text-sm font-medium">ON</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-5 h-5" />
                  <span className="text-sm font-medium">OFF</span>
                </>
              )}
            </button>
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