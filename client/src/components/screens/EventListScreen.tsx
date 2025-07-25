import { Calendar, ArrowLeft } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import diagoLogo from '@assets/diagologo.png';

interface EventListScreenProps {
  events: any[];
  users: any[];
  currentUser: any;
  wines: any[];
  votes: any[];
  onShowEventDetails: (eventId: number) => void;
  onShowEventResults: (eventId: number) => void;
  onGoBack: () => void;
  onRegisterWine: (eventId: number) => void;
  onParticipateEvent: (eventId: number) => void;
  onVoteForWine: (voteData: any) => void;
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
  onGoBack,
  onRegisterWine,
  onParticipateEvent,
  onVoteForWine,
  onEditWine
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
                <div key={event.id} className="space-y-3">
                  {/* MESSAGGIO SUCCESSO - SOPRA IL CONTAINER BIANCO */}
                  {userHasRegisteredWineForEvent(event.id) && (
                    <div className="text-center py-2">
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-xl animate-bounce">⭐</span>
                        <span className="text-yellow-400 font-bold text-base">REGISTRATO CON SUCCESSO!</span>
                        <span className="text-xl animate-bounce" style={{ animationDelay: '0.5s' }}>⭐</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="glass-effect rounded-3xl shadow-2xl p-6 animate-fade-in">
                    {/* Date e Event Name - Data sopra, nome sotto */}
                    <div className="text-center mb-4">
                      <p className="text-lg font-bold text-[#300505] mb-2">
                        {formatDate(event.date)}
                      </p>
                      <h3 className="font-bold text-[#300505] leading-tight whitespace-nowrap overflow-hidden text-ellipsis text-xl">
                        {event.name}
                      </h3>
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
                    
                    {/* PULSANTE MODIFICA VINO - Sotto il modal */}
                    {userHasRegisteredWineForEvent(event.id) && (
                      <div className="mt-3 flex justify-start">
                        <button
                          onClick={() => onEditWine(event.id)}
                          className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center space-x-1"
                        >
                          <span>✏️</span>
                          <span>Modifica il tuo vino</span>
                        </button>
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
                <div key={event.id} className="bg-gradient-to-r from-[#8d0303] to-[#300505] rounded-xl p-4 border-2 border-[#300505] opacity-90">
                  {/* Data e Nome evento centrati */}
                  <div className="text-center mb-3">
                    <p className="text-white text-sm font-medium mb-1">
                      {formatDate(event.date)}
                    </p>
                    <h3 className="font-semibold text-lg text-white whitespace-nowrap overflow-hidden text-ellipsis">
                      {event.name}
                    </h3>
                  </div>
                  
                  {/* Pulsante Risultati centrato */}
                  <div className="flex justify-center">
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
        </div>
        
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
  );
}