import { Users, Shield } from 'lucide-react';
import { User } from '@shared/schema';
import diagonaleLogo from '../../assets/diagologo.png';

interface HomeScreenProps {
  users: User[];
  onUserSelect: (user: User) => void;
  onShowAdmin: () => void;
  sessionError?: string | null;
  onForceLogout?: () => void;
}

export default function HomeScreen({ users, onUserSelect, onShowAdmin, sessionError, onForceLogout }: HomeScreenProps) {
  const regularUsers = users.filter(user => !user.isAdmin).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="flex-1 flex flex-col p-2 h-screen">
      <div className="w-full max-w-md mx-auto animate-fade-in flex flex-col h-full">
        {/* Header fisso con logo */}
        <div className="text-center mb-2 flex-shrink-0">
          <img 
            src={diagonaleLogo} 
            alt="DIAGONALE" 
            className="mx-auto mb-2 w-24 h-auto logo-filter drop-shadow-lg" 
          />
        </div>

        {sessionError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-2 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-red-600" />
              <span className="text-red-700 text-sm font-medium">Errore di Accesso</span>
            </div>
            <p className="text-red-600 text-sm mt-1">{sessionError}</p>
            {onForceLogout && (
              <button
                onClick={onForceLogout}
                className="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
              >
                Disconnetti Altro Dispositivo
              </button>
            )}
          </div>
        )}

        {/* Area scrollabile per i pulsanti utenti */}
        <div className="flex-1 overflow-y-auto mb-2 min-h-0">
          {regularUsers.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nessun iscritto registrato. Aggiungi il primo utente per iniziare!
            </p>
          ) : (
            <div className="space-y-2">
              {regularUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => onUserSelect(user)}
                  className="w-full block p-4 rounded-xl font-medium text-center wine-card-hover transition-all glass-effect hover:bg-white/80 text-gray-800 border border-white/30 shadow-lg hover:shadow-xl"
                >
                  <span>{user.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Admin Button fisso in basso */}
        <div className="flex justify-center flex-shrink-0">
          <button
            onClick={onShowAdmin}
            className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors text-sm font-medium"
          >
            <Shield className="w-4 h-4" />
            <span>Admin</span>
          </button>
        </div>
      </div>
    </div>
  );
}
