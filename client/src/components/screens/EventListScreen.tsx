import { Wine, Users, Calendar, Clock, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { WineEvent, User } from '@shared/schema';
import { formatDate } from '../../utils/helpers';

interface EventListScreenProps {
  events: WineEvent[];
  users: User[];
  currentUser: User | null;
  onShowEventDetails: (eventId: number) => void;
  onShowEventResults: (eventId: number) => void;
  onGoBack: () => void;
  onRegisterWine: (eventId: number) => void;
  onParticipateEvent: (eventId: number) => void;
  onEditEvent?: (event: WineEvent) => void;
  onDeleteEvent?: (eventId: number) => void;
}

export default function EventListScreen({ 
  events, 
  users, 
  currentUser,
  onShowEventDetails, 
  onShowEventResults,
  onGoBack,
  onRegisterWine,
  onParticipateEvent,
  onEditEvent,
  onDeleteEvent
}: EventListScreenProps) {
  const getCreatorName = (createdBy: number) => {
    const user = users.find(u => u.id === createdBy);
    return user?.name || 'Unknown';
  };

  const activeEvents = events.filter(event => event.status === 'active');
  const completedEvents = events.filter(event => event.status === 'completed');

  return (
    <div className="flex-1 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Active Events */}
        {activeEvents.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white text-center mb-6">
              Eventi Attivi
            </h2>
            
            {activeEvents.map(event => (
              <div key={event.id} className="glass-effect rounded-3xl shadow-2xl p-8 animate-fade-in">
                {/* Admin controls - Top right */}
                {currentUser?.isAdmin && onEditEvent && onDeleteEvent && (
                  <div className="flex justify-end space-x-2 mb-4">
                    <button
                      onClick={() => onEditEvent(event)}
                      className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                      title="Modifica evento"
                    >
                      <Edit className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => onDeleteEvent(event.id)}
                      className="p-2 rounded-full hover:bg-red-100 transition-colors"
                      title="Elimina evento"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                )}

                {/* Event Name - Prima riga */}
                <div className="text-center mb-6">
                  <h3 className="text-3xl font-bold text-gray-800 mb-2">
                    {event.name}
                  </h3>
                  <div className="w-20 h-1 bg-[hsl(270,50%,65%)] rounded-full mx-auto"></div>
                </div>

                {/* Date - Seconda riga centrata */}
                <div className="text-center mb-6">
                  <span className="text-xl font-medium text-gray-600">{formatDate(event.date)}</span>
                </div>

                {/* Mode - Terza riga centrata */}
                <div className="text-center mb-8">
                  <span className="text-lg font-medium text-gray-700">
                    {event.mode === 'CIECA' ? 'Degustazione alla Cieca' : 'Degustazione alla Ciecona'}
                  </span>
                </div>

                {/* Status centrato */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-green-600 font-medium">ATTIVO</span>
                  </div>
                </div>

                {/* Due pulsanti separati */}
                <div className="space-y-4">
                  <button
                    onClick={() => onRegisterWine(event.id)}
                    className="w-full bg-gradient-to-r from-[hsl(229,73%,69%)] to-[hsl(270,50%,65%)] hover:from-[hsl(270,50%,65%)] hover:to-[hsl(229,73%,69%)] text-white font-bold py-4 px-8 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    REGISTRA IL TUO VINO
                  </button>
                  
                  <button
                    onClick={() => onParticipateEvent(event.id)}
                    className="w-full bg-gradient-to-r from-[hsl(270,60%,70%)] via-[hsl(280,55%,65%)] to-[hsl(290,50%,60%)] hover:from-[hsl(290,50%,60%)] hover:via-[hsl(280,55%,65%)] hover:to-[hsl(270,60%,70%)] text-white font-bold py-4 px-8 rounded-2xl text-lg transition-all duration-500 transform hover:scale-105 shadow-lg hover:shadow-2xl"
                  >
                    PARTECIPA ALLA DIAGONALE
                  </button>
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
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      event.mode === 'CIECA' 
                        ? 'bg-gray-300 text-gray-700' 
                        : 'bg-gray-400 text-white'
                    }`}>
                      {event.mode}
                    </span>
                    {currentUser?.isAdmin && onEditEvent && onDeleteEvent && (
                      <div className="flex space-x-1">
                        <button
                          onClick={() => onEditEvent(event)}
                          className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                          title="Modifica evento"
                        >
                          <Edit className="w-3 h-3 text-gray-600" />
                        </button>
                        <button
                          onClick={() => onDeleteEvent(event.id)}
                          className="p-1 rounded-full hover:bg-red-100 transition-colors"
                          title="Elimina evento"
                        >
                          <Trash2 className="w-3 h-3 text-red-600" />
                        </button>
                      </div>
                    )}
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
  );
}