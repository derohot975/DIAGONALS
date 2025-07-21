import { Calendar, ArrowLeft, Edit, Trash2, Play, Square, Users, Wine, BarChart3, Settings } from 'lucide-react';
import { WineEvent, User } from '@shared/schema';
import { formatDate } from '../../utils/helpers';
import diagoLogo from '@assets/diagologo.png';

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
        <div className="space-y-8 max-w-4xl mx-auto">
          
          {/* Active Events - New Modern Layout */}
          {activeEvents.length > 0 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Gestione Eventi</h2>
              </div>
              
              {activeEvents.map(event => (
                <div key={event.id} className="relative overflow-hidden">
                  {/* Main Event Card */}
                  <div className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 animate-fade-in">
                    
                    {/* Event Header */}
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-gray-800 mb-2 break-words">{event.name}</h3>
                      <p className="text-lg text-gray-600 flex items-center justify-center">
                        <Calendar className="w-5 h-5 mr-2" />
                        {formatDate(event.date)}
                      </p>
                    </div>

                    {/* Participants Count */}
                    <div className="text-center mb-8">
                      <p className="text-lg text-gray-600">⭐ <span className="font-bold">12 partecipanti</span> ⭐</p>
                    </div>

                    {/* Primary Action - Voting Control */}
                    <div className="mt-8">
                      {event.votingStatus === 'voting' ? (
                        <button
                          onClick={() => onDeactivateVoting(event.id)}
                          className="w-full flex items-center justify-center space-x-3 px-8 py-6 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold text-xl rounded-2xl transition-all duration-200 hover:scale-105 shadow-xl"
                        >
                          <Square className="w-6 h-6" />
                          <span>SOSPENDI VOTAZIONI</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onActivateVoting(event.id)}
                          className="w-full flex items-center justify-center space-x-3 px-8 py-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-xl rounded-2xl transition-all duration-200 hover:scale-105 shadow-xl"
                        >
                          <Play className="w-6 h-6" />
                          <span>AVVIA VOTAZIONI</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Action Menu - Below Modal */}
                  <div className="flex justify-start space-x-3 mt-4">
                    <button
                      onClick={() => onEditEvent(event)}
                      className="p-3 bg-white hover:bg-gray-50 text-gray-700 rounded-lg transition-all duration-200 border border-gray-300 shadow-sm"
                      title="Modifica evento"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onDeleteEvent(event.id)}
                      className="p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all duration-200 border border-red-200 shadow-sm"
                      title="Elimina evento"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Completed Events */}
          {completedEvents.length > 0 && (
            <div className="space-y-4 mt-8">
              <h3 className="text-lg font-semibold text-gray-600 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Eventi Completati ({completedEvents.length})
              </h3>
              
              {completedEvents.map(event => (
                <div key={event.id} className="glass-effect rounded-2xl shadow-xl p-6 border border-gray-200 opacity-80">
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

      {/* Fixed Back Button */}
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