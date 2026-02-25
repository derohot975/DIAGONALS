import { UserPlus, Users, Calendar, Plus, Edit, Trash2, Home, Key } from '@/components/icons';
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

  const nonAdminUsers = useMemo(() => users.filter(user => !user.isAdmin), [users]);

  useEffect(() => {
    const saved = localStorage.getItem('diagonale_unique_session_enabled');
    setUniqueSessionEnabled(saved === 'true');
    if (saved === null) localStorage.setItem('diagonale_unique_session_enabled', 'false');
  }, []);

  const toggleUniqueSession = () => {
    const newValue = !uniqueSessionEnabled;
    setUniqueSessionEnabled(newValue);
    localStorage.setItem('diagonale_unique_session_enabled', newValue.toString());
    localStorage.setItem('diagonale_unique_session_changed', Date.now().toString());
  };

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-[#300505] to-[#1a0303]">
      {/* Header */}
      <div className="flex-shrink-0 px-6 pt-10 pb-6 flex flex-col items-center">
        <img src={diagoLogo} alt="Logo" className="w-16 h-auto mb-4 logo-filter drop-shadow-lg opacity-90" />
        <h2 className="text-lg font-black tracking-widest text-white/80 uppercase">Pannello Admin</h2>
      </div>

      {/* Scrollable content */}
      <div
        className="flex-1 overflow-y-auto px-5 scrollbar-hide"
        style={{ paddingBottom: 'calc(var(--bottom-nav-total, 3.5rem) + 1.5rem)' }}
      >
        <div className="max-w-md mx-auto space-y-3">

          {/* Action buttons */}
          <div className="space-y-2">
            <button onClick={onShowEventList} className="w-full bg-white/5 backdrop-blur-xl border border-white/10 text-white font-semibold py-4 px-5 rounded-2xl flex items-center space-x-4 active:scale-95 transition-all">
              <div className="w-9 h-9 bg-blue-500/20 rounded-xl flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-blue-300" />
              </div>
              <span className="text-base">Gestisci eventi</span>
            </button>

            <button onClick={onShowCreateEventModal} className="w-full bg-white/5 backdrop-blur-xl border border-white/10 text-white font-semibold py-4 px-5 rounded-2xl flex items-center space-x-4 active:scale-95 transition-all">
              <div className="w-9 h-9 bg-green-500/20 rounded-xl flex items-center justify-center shrink-0">
                <Plus className="w-5 h-5 text-green-300" />
              </div>
              <span className="text-base">Nuovo evento</span>
            </button>

            <button onClick={onShowAddUserModal} className="w-full bg-white/5 backdrop-blur-xl border border-white/10 text-white font-semibold py-4 px-5 rounded-2xl flex items-center space-x-4 active:scale-95 transition-all">
              <div className="w-9 h-9 bg-purple-500/20 rounded-xl flex items-center justify-center shrink-0">
                <UserPlus className="w-5 h-5 text-purple-300" />
              </div>
              <span className="text-base">Aggiungi utente</span>
            </button>

            {onChangeAdminPin && (
              <button onClick={onChangeAdminPin} className="w-full bg-white/5 backdrop-blur-xl border border-white/10 text-white font-semibold py-4 px-5 rounded-2xl flex items-center space-x-4 active:scale-95 transition-all">
                <div className="w-9 h-9 bg-amber-500/20 rounded-xl flex items-center justify-center shrink-0">
                  <Key className="w-5 h-5 text-amber-300" />
                </div>
                <span className="text-base">Modifica PIN admin</span>
              </button>
            )}
          </div>

          {/* Users list */}
          <div className="mt-4 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-bold text-white">Utenti</h3>
              <span className="text-xs font-bold text-white/50 bg-white/10 px-3 py-1 rounded-full">{nonAdminUsers.length}</span>
            </div>
            {nonAdminUsers.length === 0 ? (
              <div className="px-6 py-8 text-center text-white/30 text-sm">Nessun utente registrato</div>
            ) : (
              <div className="divide-y divide-white/5">
                {nonAdminUsers.map(user => (
                  <div key={user.id} className="flex items-center justify-between px-5 py-3.5">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
                        <Users className="w-4 h-4 text-white/50" />
                      </div>
                      <span className="font-semibold text-white/90 tracking-wide">{user.name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button onClick={() => onShowEditUserModal(user)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                        <Edit className="w-4 h-4 text-white/40 hover:text-white/70" />
                      </button>
                      <button onClick={() => onDeleteUser(user.id)} className="p-2 hover:bg-red-500/20 rounded-xl transition-colors">
                        <Trash2 className="w-4 h-4 text-red-400/70 hover:text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      <BottomNavBar
        layout="center"
        centerButtons={onGoHome ? [{ id: 'home', icon: <Home className="w-6 h-6" />, onClick: onGoHome, title: 'Home', variant: 'glass' as const }] : []}
      />
    </div>
  );
}
