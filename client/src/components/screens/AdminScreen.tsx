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
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b px-6 py-10 flex flex-col items-center">
        <img src={diagoLogo} alt="Logo" className="w-20 h-auto mb-6 grayscale opacity-40" />
        <h2 className="text-xl font-black tracking-tight text-gray-900 uppercase">Pannello Admin</h2>
      </div>

      {/* Scrollable content */}
      <div
        className="flex-1 overflow-y-auto px-6 scrollbar-hide"
        style={{ paddingBottom: 'calc(var(--bottom-nav-height, 5.5rem) + var(--bottom-nav-offset, 1.75rem) + 2rem)' }}
      >
        <div className="max-w-md mx-auto py-8 space-y-4">

          {/* Actions */}
          <div className="space-y-3">
            <button onClick={onShowEventList} className="w-full bg-white border border-gray-200 text-gray-800 font-semibold py-4 px-5 rounded-2xl flex items-center space-x-3 shadow-sm active:scale-95 transition-all">
              <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center"><Calendar className="w-5 h-5 text-blue-500" /></div>
              <span>Gestisci eventi</span>
            </button>
            <button onClick={onShowCreateEventModal} className="w-full bg-white border border-gray-200 text-gray-800 font-semibold py-4 px-5 rounded-2xl flex items-center space-x-3 shadow-sm active:scale-95 transition-all">
              <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center"><Plus className="w-5 h-5 text-green-500" /></div>
              <span>Nuovo evento</span>
            </button>
            <button onClick={onShowAddUserModal} className="w-full bg-white border border-gray-200 text-gray-800 font-semibold py-4 px-5 rounded-2xl flex items-center space-x-3 shadow-sm active:scale-95 transition-all">
              <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center"><UserPlus className="w-5 h-5 text-purple-500" /></div>
              <span>Aggiungi utente</span>
            </button>
            {onChangeAdminPin && (
              <button onClick={onChangeAdminPin} className="w-full bg-white border border-gray-200 text-gray-800 font-semibold py-4 px-5 rounded-2xl flex items-center space-x-3 shadow-sm active:scale-95 transition-all">
                <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center"><Key className="w-5 h-5 text-orange-500" /></div>
                <span>Modifica PIN admin</span>
              </button>
            )}
          </div>

          {/* Users list */}
          <div className="mt-6 bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Utenti</h3>
              <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{nonAdminUsers.length}</span>
            </div>
            {nonAdminUsers.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-400 text-sm">Nessun utente registrato</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {nonAdminUsers.map(user => (
                  <div key={user.id} className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
                        <Users className="w-4 h-4 text-gray-500" />
                      </div>
                      <span className="font-semibold text-gray-800">{user.name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button onClick={() => onShowEditUserModal(user)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                        <Edit className="w-4 h-4 text-gray-500" />
                      </button>
                      <button onClick={() => onDeleteUser(user.id)} className="p-2 hover:bg-red-50 rounded-xl transition-colors">
                        <Trash2 className="w-4 h-4 text-red-400" />
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
