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
    <div className="flex-1 flex flex-col">
      {/* Logo Header */}
      <div className="flex-shrink-0 flex justify-center pt-8 pb-4">
        <img 
          src={diagoLogo} 
          alt="DIAGO Logo" 
          className="mx-auto mb-2 w-24 h-auto logo-filter drop-shadow-lg" 
        />
      </div>

      {/* Welcome Message */}
      {currentUser && (
        <div className="flex-shrink-0 text-center pb-6">
          <h2 className="text-2xl font-bold text-yellow-200">
            Ciao {currentUser.name}!
          </h2>
        </div>
      )}

      {/* Scrollable Content */}
      <div 
        className="overflow-y-auto px-4 pb-4" 
        style={{
          height: 'calc(100dvh - 140px - var(--bottom-nav-total, 88px) - env(safe-area-inset-top, 0px))'
        }}
      >
        <div className="max-w-2xl mx-auto space-y-6">
        
          {/* Active Events */}
          {activeEvents.length > 0 && (
            <div className="space-y-4">

              
              {activeEvents.map(event => (
                <div key={event.id} className="space-y-3">
                  <div className="relative glass-effect rounded-3xl shadow-2xl p-6 animate-fade-in">
                    {/* Date e Event Name - Data sopra, nome sotto */}
                    <div className="text-center mb-4">
                      <p className="text-lg text-[#300505] mb-2">
                        {formatEventDate(event.date)}
                      </p>
                      <h3 className="event-name-standard font-bold text-[#300505] leading-tight break-words text-center text-sm">
                        {formatEventName(event.name)}
                      </h3>
                      
                      {/* MESSAGGIO SUCCESSO - DENTRO IL MODAL SOTTO IL NOME */}
                      {userHasRegisteredWineForEvent(event.id) && (
                        <div className="mt-3">
                          <div className="flex items-center justify-center space-x-2">
                            <span className="text-lg animate-bounce">⭐</span>
                            <span className="text-green-600 font-bold text-sm">REGISTRATO CON SUCCESSO!</span>
                            <span className="text-lg animate-bounce" style={{ animationDelay: '0.5s' }}>⭐</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* PULSANTE UNICO CONDIZIONALE */}
                    <div>
                      {!userHasRegisteredWineForEvent(event.id) ? (
                        <button
                          onClick={() => onRegisterWine(event.id)}
                          className="w-full bg-gradient-to-r from-[#8d0303] to-[#300505] hover:from-[#300505] hover:to-[#8d0303] text-white font-bold py-4 px-8 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                        >
                          REGISTRA IL TUO VINO
                        </button>
                      ) : (
                        <div className="space-y-3">
                          {event.votingStatus === 'active' ? (
                            <button
                              onClick={() => onParticipateEvent(event.id)}
                              className="w-full font-bold py-3 px-6 rounded-2xl text-lg transition-all duration-500 transform hover:scale-105 shadow-lg hover:shadow-2xl bg-gradient-to-r from-[#300505] to-[#8d0303] hover:from-[#240404] hover:to-[#a00404] text-white"
                            >
                              PARTECIPA ALLA DIAGONALE
                            </button>
                          ) : (
                            <button
                              disabled
                              className="w-full font-bold py-3 px-6 rounded-2xl text-lg bg-gray-400 text-gray-600 cursor-not-allowed"
                            >
                              <div className="flex items-center justify-center space-x-2">
                                <span>👁️</span>
                                <span>ATTENDI ATTIVAZIONE VOTAZIONI</span>
                              </div>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* PULSANTE MODIFICA VINO - Posizionato in alto a destra */}
                    {userHasRegisteredWineForEvent(event.id) && (
                      <div className="absolute top-4 right-4">
                        <button
                          onClick={() => onEditWine(event.id)}
                          className="text-[#300505] hover:text-[#8d0303] transition-colors"
                        >
                          <Edit3 className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}





          {/* No Active Events State */}
          {events.length > 0 && activeEvents.length === 0 && (
            <div className="glass-effect rounded-2xl shadow-2xl p-12 text-center">
              <div className="text-6xl mb-6">🍷</div>
              <h2 className="text-2xl font-bold text-[#300505] mb-4">...in attesa della prossima ciucciata!</h2>
              <p className="text-[#8d0303] text-lg font-semibold">organizziamo?!</p>
            </div>
          )}

          {/* Empty State */}
          {events.length === 0 && (
            <div className="glass-effect rounded-2xl shadow-2xl p-12 text-center">
              <Calendar className="w-20 h-20 text-gray-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-600 mb-4">Nessun Evento Creato</h2>
              <p className="text-gray-500 text-lg">Crea il primo evento per iniziare le degustazioni</p>
            </div>
          )}
        </div>
      </div>
      
      <BottomNavBar 
        onShowAdmin={onShowAdmin}
        centerButtons={completedEvents.length > 0 && onShowHistoricEvents ? [{
          id: 'historic',
          icon: <Calendar className="w-5 h-5" />,
          onClick: onShowHistoricEvents,
          title: 'Storico Eventi',
          variant: 'glass'
        }] : []}
        layout="center"
      />
    </div>
  );
}