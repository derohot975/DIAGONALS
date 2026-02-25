import { Calendar, BarChart3, Shield, Edit3 } from '@/components/icons';
import { formatEventDate, getCreatorName, formatEventName } from '@/lib/utils';
import diagoLogo from '@assets/diagologo.png';
import BottomNavBar from '../navigation/BottomNavBar';

import { User, WineEvent, Wine, Vote } from '@shared/schema';

interface EventListScreenProps {
  events: WineEvent[];
  users: User[];
  currentUser: User | null;
  wines: Wine[];
  votes: Vote[];
  onShowEventDetails: (eventId: number) => void;
  onShowEventResults: (eventId: number) => void;
  onShowAdmin?: () => void;
  onShowHistoricEvents?: () => void;

  onRegisterWine: (eventId: number) => void;
  onParticipateEvent: (eventId: number) => void;
  onVoteForWine: (wineId: number, score: number, hasLode: boolean) => void;
  onEditWine: (eventId: number) => void;
}

export default function EventListScreen({ 
  events, 
  users, 
  currentUser,
  wines,
  votes,
  onShowEventDetails, 
  onShowEventResults,
  onShowAdmin,
  onShowHistoricEvents,

  onRegisterWine,
  onParticipateEvent,
  onVoteForWine,
  onEditWine
}: EventListScreenProps) {


  // Verifica se l'utente ha già registrato un vino per un evento specifico
  const userHasRegisteredWineForEvent = (eventId: number) => {
    if (!currentUser || !wines || !Array.isArray(wines)) return false;
    return wines.some(wine => wine.eventId === eventId && wine.userId === currentUser.id);
  };

  const activeEvents = events.filter(event => event.status === 'registration' || event.status === 'active');
  const completedEvents = events.filter(event => event.status === 'completed');

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-[#300505] to-[#1a0303]">
      {/* Logo Header */}
      <div className="flex-shrink-0 flex justify-center pt-10 pb-6">
        <div className="relative">
          <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full"></div>
          <img 
            src={diagoLogo} 
            alt="DIAGO Logo" 
            className="relative mx-auto w-28 h-auto logo-filter drop-shadow-2xl" 
          />
        </div>
      </div>

      {/* Welcome Message */}
      {currentUser && (
        <div className="flex-shrink-0 text-center pb-8">
          <p className="text-xs font-semibold text-white/30 uppercase tracking-[0.2em] mb-1">Benvenuto</p>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            {currentUser.name}
          </h2>
        </div>
      )}

      {/* Scrollable Content */}
      <div 
        className="overflow-y-auto px-6 pb-20 scrollbar-hide" 
        style={{
          height: 'calc(100dvh - 180px - var(--bottom-nav-total, 88px) - env(safe-area-inset-top, 0px))'
        }}
      >
        <div className="max-w-md mx-auto space-y-8">
        
          {/* Active Events */}
          {activeEvents.length > 0 && (
            <div className="space-y-6">
              {activeEvents.map(event => (
                <div key={event.id} className="group">
                  <div className="relative bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 p-8 shadow-2xl transition-all duration-500 hover:bg-white/10 active:scale-[0.98]">
                    {/* Event Info */}
                    <div className="text-center mb-8">
                      <p className="text-xs font-bold text-red-500/60 uppercase tracking-widest mb-3">
                        {formatEventDate(event.date)}
                      </p>
                      <h3 className="text-2xl font-bold text-white leading-tight tracking-tight">
                        {formatEventName(event.name)}
                      </h3>
                      
                      {userHasRegisteredWineForEvent(event.id) && (
                        <div className="mt-4 inline-flex items-center px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                          <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Vino Registrato</span>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="relative z-10">
                      {!userHasRegisteredWineForEvent(event.id) ? (
                        <button
                          onClick={() => onRegisterWine(event.id)}
                          className="w-full bg-white text-red-950 font-bold py-5 px-8 rounded-2xl text-lg shadow-xl shadow-white/5 active:scale-95 transition-all duration-300"
                        >
                          Registra il tuo vino
                        </button>
                      ) : (
                        <div className="space-y-4">
                          {event.votingStatus === 'active' ? (
                            <button
                              onClick={() => onParticipateEvent(event.id)}
                              className="w-full bg-red-600 text-white font-bold py-5 px-8 rounded-2xl text-lg shadow-xl shadow-red-600/20 active:scale-95 transition-all duration-300"
                            >
                              Entra nella Diagonale
                            </button>
                          ) : (
                            <div className="w-full py-5 px-8 rounded-2xl bg-white/5 border border-white/5 text-center">
                              <span className="text-sm font-bold text-white/20 uppercase tracking-widest">In attesa dei voti...</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Edit Wine Link */}
                    {userHasRegisteredWineForEvent(event.id) && (
                      <button
                        onClick={() => onEditWine(event.id)}
                        className="absolute top-6 right-8 text-white/20 hover:text-white transition-colors p-2"
                      >
                        <Edit3 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Active Events State */}
          {events.length > 0 && activeEvents.length === 0 && (
            <div className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 p-12 text-center animate-fade-in">
              <div className="text-6xl mb-6">🍷</div>
              <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Prossima ciucciata?</h2>
              <p className="text-white/40 font-medium">In attesa di un nuovo evento...</p>
            </div>
          )}

          {/* Empty State */}
          {events.length === 0 && (
            <div className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 p-12 text-center animate-fade-in">
              <Calendar className="w-16 h-16 text-white/10 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Nessun evento</h2>
              <p className="text-white/40 font-medium">Crea il primo evento per iniziare.</p>
            </div>
          )}
        </div>
      </div>
      
      <BottomNavBar 
        onShowAdmin={onShowAdmin}
        centerButtons={completedEvents.length > 0 && onShowHistoricEvents ? [{
          id: 'historic',
          icon: <Calendar className="w-6 h-6" />,
          onClick: onShowHistoricEvents,
          title: 'Storico Eventi',
          variant: 'glass'
        }] : []}
        layout="center"
      />
    </div>
  );
}
