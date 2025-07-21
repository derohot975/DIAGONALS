import { Calendar, ArrowLeft, Edit, Trash2, Play, Pause } from 'lucide-react';
import { WineEvent, User } from '@shared/schema';
import { formatDate } from '../../utils/helpers';

interface AdminEventManagementScreenProps {
  events: WineEvent[];
  users: User[];
  onGoBack: () => void;
  onEditEvent: (event: WineEvent) => void;
  onDeleteEvent: (eventId: number) => void;
  onActivateVoting: (eventId: number) => void;
  onDeactivateVoting: (eventId: number) => void;
}

export default function AdminEventManagementScreen({ 
  events, 
  users,
  onGoBack,
  onEditEvent,
  onDeleteEvent,
  onActivateVoting,
  onDeactivateVoting
}: AdminEventManagementScreenProps) {
  const getCreatorName = (createdBy: number) => {
    const user = users.find(u => u.id === createdBy);
    return user?.name || 'Unknown';
  };

  const activeEvents = events.filter(event => event.status === 'active');
  const completedEvents = events.filter(event => event.status === 'completed');

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl glass-effect rounded-2xl shadow-2xl p-6 animate-fade-in">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[hsl(270,50%,65%)] mb-1">📋 Gestione Eventi</h1>
          <p className="text-gray-600 text-sm">Amministrazione Eventi</p>
        </div>

        <div className="space-y-6">
          {/* Active Events */}
          {activeEvents.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Eventi Attivi ({activeEvents.length})
              </h3>
              
              {activeEvents.map(event => (
                <div key={event.id} className="bg-white/70 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg text-gray-800">{event.name}</h4>
                      <p className="text-sm text-gray-600">{formatDate(event.date)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex flex-col items-center gap-1">
                        {event.votingStatus === 'voting' ? (
                          <>
                            <button
                              onClick={() => onDeactivateVoting(event.id)}
                              className="px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-medium hover:bg-red-200 transition-colors flex items-center gap-2"
                              title="Disattiva votazioni"
                            >
                              <Pause className="w-4 h-4" />
                              DISATTIVA VOTAZIONI
                            </button>
                            <span className="text-xs text-green-600 font-medium">Attive</span>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => onActivateVoting(event.id)}
                              className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium hover:bg-green-200 transition-colors flex items-center gap-2"
                              title="Attiva votazioni"
                            >
                              <Play className="w-4 h-4" />
                              ATTIVA VOTAZIONI
                            </button>
                            <span className="text-xs text-gray-500 font-medium">Disattivate</span>
                          </>
                        )}
                      </div>
                      
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
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Completed Events */}
          {completedEvents.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Eventi Completati ({completedEvents.length})
              </h3>
              
              {completedEvents.map(event => (
                <div key={event.id} className="bg-white/50 rounded-xl p-4 border border-gray-200 opacity-80">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg text-gray-700">{event.name}</h4>
                      <p className="text-sm text-gray-600">{formatDate(event.date)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                        COMPLETATO
                      </span>
                      <button
                        onClick={() => onEditEvent(event)}
                        className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                        title="Modifica evento"
                      >
                        <Edit className="w-3 h-3 text-gray-600" />
                      </button>
                      <button
                        onClick={() => onDeleteEvent(event.id)}
                        className="p-2 rounded-full hover:bg-red-100 transition-colors"
                        title="Elimina evento"
                      >
                        <Trash2 className="w-3 h-3 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Events */}
          {events.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Nessun evento creato</p>
              <p className="text-sm text-gray-400">Usa "Nuovo Evento" per crearne uno</p>
            </div>
          )}
        </div>
      </div>

      {/* Pulsante Back fisso in fondo */}
      <div className="fixed bottom-4 left-4 z-50">
        <button
          onClick={onGoBack}
          className="bg-[hsl(229,73%,69%)] hover:bg-[hsl(270,50%,65%)] text-white p-3 rounded-full shadow-lg transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}