import { Calendar, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { WineEvent, User } from '@shared/schema';
import { formatDate } from '../../utils/helpers';

interface AdminEventManagementScreenProps {
  events: WineEvent[];
  users: User[];
  onGoBack: () => void;
  onEditEvent: (event: WineEvent) => void;
  onDeleteEvent: (eventId: number) => void;
}

export default function AdminEventManagementScreen({ 
  events, 
  users,
  onGoBack,
  onEditEvent,
  onDeleteEvent
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
        <div className="flex items-center mb-6">
          <button
            onClick={onGoBack}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors mr-3"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="text-center flex-1">
            <h1 className="text-2xl font-bold text-[hsl(270,50%,65%)] mb-1">📋 Gestione Eventi</h1>
            <p className="text-gray-600 text-sm">Amministrazione Eventi</p>
          </div>
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
                      <p className="text-sm text-gray-600">{formatDate(event.date)} • DIAGONALE</p>
                      <p className="text-xs text-gray-500">Creato da: {getCreatorName(event.createdBy)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        ATTIVO
                      </span>
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
                      <p className="text-sm text-gray-600">{formatDate(event.date)} • DIAGONALE</p>
                      <p className="text-xs text-gray-500">Creato da: {getCreatorName(event.createdBy)}</p>
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
    </div>
  );
}