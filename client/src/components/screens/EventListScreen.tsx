import { Wine, Users, Calendar, Clock, ArrowLeft } from 'lucide-react';
import { WineEvent, User, Wine as WineType, Vote } from '@shared/schema';
import { formatDate } from '../../utils/helpers';
import diagoLogo from '@assets/diagologo.png';

interface EventListScreenProps {
  events: WineEvent[];
  users: User[];
  currentUser: User | null;
  wines: WineType[];
  votes: Vote[];
  onShowEventDetails: (eventId: number) => void;
  onShowEventResults: (eventId: number) => void;
  onGoBack: () => void;
  onRegisterWine: (eventId: number) => void;
  onParticipateEvent: (eventId: number) => void;
  onVoteForWine: (wineId: number, score: number) => void;
}

export default function EventListScreen({ 
  events, 
  users, 
  currentUser,
  wines,
  votes,
  onShowEventDetails, 
  onShowEventResults,
  onGoBack,
  onRegisterWine,
  onParticipateEvent,
  onVoteForWine
}: EventListScreenProps) {
  const getCreatorName = (createdBy: number) => {
    const user = users.find(u => u.id === createdBy);
    return user?.name || 'Unknown';
  };

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
      <div className="flex-shrink-0 flex justify-center pt-8 pb-6">
        <img 
          src={diagoLogo} 
          alt="DIAGO Logo" 
          className="mx-auto mb-2 w-24 h-auto logo-filter drop-shadow-lg" 
        />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Active Events */}
        {activeEvents.length > 0 && (
          <div className="space-y-4">
            {/* User Name Display */}
            {currentUser && (
              <div className="text-center mb-6">
                <h3 className="text-4xl font-bold text-yellow-400">
                  {currentUser.name}
                </h3>
              </div>
            )}
            
            {activeEvents.map(event => (
              <div key={event.id} className="glass-effect rounded-3xl shadow-2xl p-8 animate-fade-in">


                {/* Event Name e Date - Una riga sola */}
                <div className="text-center mb-6">
                  <h3 className={`font-bold text-[#300505] mb-2 leading-tight break-words ${
                    event.name.length > 20 ? 'text-lg' : 'text-xl'
                  }`}>
                    {event.name}
                  </h3>
                  <p className="text-lg font-bold text-[#300505]">
                    {formatDate(event.date)}
                  </p>
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
                    <div className="space-y-4">
                      {/* MESSAGGIO SUCCESSO SENZA CONTAINER */}
                      <div className="text-center py-3">
                        <div className="flex items-center justify-center space-x-2">
                          <span className="text-2xl animate-bounce">⭐</span>
                          <span className="text-gray-800 font-bold text-lg">REGISTRATO CON SUCCESSO!</span>
                          <span className="text-2xl animate-bounce" style={{ animationDelay: '0.5s' }}>⭐</span>
                        </div>
                      </div>
                      
                      {event.votingStatus === 'active' ? (
                        <button
                          onClick={() => onParticipateEvent(event.id)}
                          className="w-full font-bold py-4 px-8 rounded-2xl text-lg transition-all duration-500 transform hover:scale-105 shadow-lg hover:shadow-2xl bg-gradient-to-r from-[#300505] to-[#8d0303] hover:from-[#240404] hover:to-[#a00404] text-white"
                        >
                          PARTECIPA ALLA DIAGONALE
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full font-bold py-4 px-8 rounded-2xl text-lg bg-gray-400 text-gray-600 cursor-not-allowed"
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
              </div>
            ))}
          </div>
        )}

        {/* Completed Events (Storico) */}
        {completedEvents.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-600 text-center mb-4">
              📚 Storico Eventi
            </h2>
            
            {completedEvents.map(event => (
              <div key={event.id} className="bg-white rounded-xl p-4 border-2 border-gray-200 opacity-80">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg text-gray-700">{event.name}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-gray-300 text-gray-700 rounded-full text-sm font-medium">
                      DIAGONALE
                    </span>

                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-500 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <button
                    onClick={() => onShowEventResults(event.id)}
                    className="bg-[hsl(43,96%,56%)] hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    Risultati
                  </button>
                </div>
              </div>
            ))}
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
        
        {/* Pulsante freccia indietro in fondo alla pagina */}
        <div className="fixed bottom-4 left-4 z-50">
          <button
            onClick={onGoBack}
            className="bg-[hsl(229,73%,69%)] hover:bg-[hsl(270,50%,65%)] text-white p-3 rounded-full shadow-lg transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
        
      </div>
    </div>
    </div>
  );
}