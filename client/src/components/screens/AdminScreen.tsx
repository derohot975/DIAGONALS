import { UserPlus, Users, Shield, Calendar, ArrowLeft, Plus, Edit, Trash2, Settings, Home, ToggleLeft, ToggleRight, Key } from '@/components/icons';
// CACHE BREAKER v2.1
import { User } from '@shared/schema';
import { useState, useEffect, useMemo } from 'react';
import diagoLogo from '@assets/diagologo.png';
import BottomNavBar from '../navigation/BottomNavBar';

interface AdminScreenProps {
  users: User[];
  onShowAddUserModal: () => void;
  onShowCreateEventModal: () => void;
  onShowEventList: () => void;
  onShowEditUserModal: (user: User) => void;
  onDeleteUser: (userId: number) => void;
  onGoBack: () => void;
  onGoHome?: () => void;
  onChangeAdminPin?: () => void;
}

export default function AdminScreen({ users, onShowAddUserModal, onShowCreateEventModal, onShowEventList, onShowEditUserModal, onDeleteUser, onGoBack, onGoHome, onChangeAdminPin }: AdminScreenProps) {
  const [uniqueSessionEnabled, setUniqueSessionEnabled] = useState(false);

  // Memoize non-admin users to prevent recalculating on every render
  const nonAdminUsers = useMemo(() => 
    users.filter(user => !user.isAdmin), 
    [users]
  );

  useEffect(() => {
    const saved = localStorage.getItem('diagonale_unique_session_enabled');
    if (saved !== null) {
      setUniqueSessionEnabled(saved === 'true');
    } else {
      // Se non esiste, imposta esplicitamente a false
      localStorage.setItem('diagonale_unique_session_enabled', 'false');
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
          className="w-20 h-auto logo-filter drop-shadow-lg" 
        />
      </div>

      {/* Scrollable Content */}
      <div 
        className="overflow-y-auto px-4 pb-4" 
        style={{
          height: 'calc(100dvh - 120px - var(--bottom-nav-total, 88px) - env(safe-area-inset-top, 0px))'
        }}
      >
        <div className="w-full max-w-md mx-auto">
          <div className="space-y-2">
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

            {/* 3. MODIFICA PIN ADMIN */}
            {onChangeAdminPin && (
              <button
                onClick={onChangeAdminPin}
                className="w-full bg-white hover:bg-gray-50 text-black font-medium py-3 px-4 rounded-xl border-2 border-[hsl(229,73%,69%)]/20 transition-colors flex items-center justify-center space-x-2"
              >
                <Key className="w-4 h-4" />
                <span>Modifica PIN Admin</span>
              </button>
            )}

            {/* 4. AGGIUNGI UTENTE */}
            <button
              onClick={onShowAddUserModal}
              className="w-full bg-white hover:bg-gray-50 text-black font-medium py-3 px-4 rounded-xl border-2 border-[hsl(229,73%,69%)]/20 transition-colors flex items-center justify-center space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Aggiungi Utente</span>
            </button>

            {/* User List */}
            <div className="mt-8 bg-[#955A5A] rounded-2xl p-4 border border-[#8d0303]">
              <div className="text-center mb-4">
                <h3 className="text-white font-bold text-sm uppercase tracking-wide">
                  {nonAdminUsers.length} UTENTI REGISTRATI
                </h3>
              </div>
              
              {nonAdminUsers.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Nessun utente registrato
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {nonAdminUsers.map(user => (
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

      <BottomNavBar onGoHome={onGoHome} layout="center" />
    </div>
  );
}