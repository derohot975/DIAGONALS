import { Calendar, ArrowLeft, Edit, Trash2, Play, Square, Users, Wine as WineIcon, BarChart3, Settings, CheckCircle, Home, Shield } from 'lucide-react';
import { WineEvent, User, Wine } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import { formatEventDate, getCreatorName } from '../../lib/utils';
import diagoLogo from '@assets/diagologo.png';

interface AdminEventManagementScreenProps {
  events: WineEvent[];
  users: User[];
  wines: Wine[];
  onGoBack: () => void;
  onEditEvent: (event: WineEvent) => void;
  onDeleteEvent: (eventId: number) => void;
  onActivateVoting: (eventId: number) => void;
  onDeactivateVoting: (eventId: number) => void;
  onCompleteEvent: (eventId: number) => void;
  onViewReport: (eventId: number) => void;
  onGoHome?: () => void;
  onGoBackToAdmin?: () => void;
}

export default function AdminEventManagementScreen({ 
  events, 
  users,
  wines,
  onGoBack,
  onEditEvent,
  onDeleteEvent,
  onActivateVoting,
  onDeactivateVoting,
  onCompleteEvent,
  onViewReport,
  onGoHome,
  onGoBackToAdmin
}: AdminEventManagementScreenProps) {


  // Component to check voting completion status
  const VotingCompletionChecker = ({ eventId }: { eventId: number }) => {
    const { data: completionStatus } = useQuery<{
      isComplete: boolean;
      totalParticipants: number;
      totalWines: number;
      votesReceived: number;
    }>({
      queryKey: ['/api/events', eventId, 'voting-complete'],
      enabled: true,
      refetchInterval: 5000, // Check every 5 seconds
    });

    if (!completionStatus) return null;

    return completionStatus.isComplete ? (
      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-green-700">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Tutti hanno votato! Pronto per conclusione</span>
          </div>
          <button
            onClick={() => onCompleteEvent(eventId)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Concludi Evento
          </button>
        </div>
        <div className="mt-2 text-xs text-green-600">
          {completionStatus.votesReceived} voti su {completionStatus.totalParticipants} partecipanti × {completionStatus.totalWines} vini
        </div>
      </div>
    ) : (
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center space-x-2 text-yellow-700">
          <BarChart3 className="w-5 h-5" />
          <span className="text-sm font-medium">Votazioni in corso...</span>
        </div>
        <div className="mt-1 text-xs text-yellow-600">
          {completionStatus.votesReceived} voti ricevuti - Mancano {(completionStatus.totalParticipants * completionStatus.totalWines) - completionStatus.votesReceived} voti
        </div>
      </div>
    );
  };

  // Calcola il numero di partecipanti per evento (utenti che hanno registrato vini)
  const getParticipantsCount = (eventId: number) => {
    if (!wines || !Array.isArray(wines)) return 0;
    const eventWines = wines.filter(wine => wine.eventId === eventId);
    const uniqueUsers = new Set(eventWines.map(wine => wine.userId));
    return uniqueUsers.size;
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
          className="w-20 h-auto logo-filter drop-shadow-lg" 
        />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-20">
        <div className="space-y-6 max-w-4xl mx-auto">
          
          {/* Active Events - New Modern Layout */}
          {activeEvents.length > 0 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-lg text-yellow-200 mb-2">Gestione Eventi</h2>
              </div>
              
              {activeEvents.map(event => (
                <div key={event.id} className="relative overflow-hidden">
                  {/* Main Event Card */}
                  <div className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 animate-fade-in relative">
                    
                    {/* Action Buttons - Top Right */}
                    <button
                      onClick={() => onEditEvent(event)}
                      className="absolute top-4 right-12 p-2 text-gray-700 hover:text-gray-900 transition-all duration-200"
                      title="Modifica evento"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteEvent(event.id)}
                      className="absolute top-4 right-4 p-2 text-red-600 hover:text-red-800 transition-all duration-200"
                      title="Elimina evento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Event Header */}
                    <div className="text-center mb-4">
                      <p className="text-base text-gray-600 mb-2">
                        {formatEventDate(event.date)}
                      </p>
                      <h3 className="event-name-script text-sm font-bold text-gray-800 mb-1 leading-tight break-words">{event.name}</h3>
                    </div>

                    {/* Primary Action - Voting Control */}
                    <div className="mt-6">
                      {event.votingStatus === 'active' ? (
                        <button
                          onClick={() => onDeactivateVoting(event.id)}
                          className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold text-lg rounded-xl transition-all duration-200 shadow-lg"
                        >
                          <Square className="w-5 h-5" />
                          <span>SOSPENDI VOTAZIONI</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onActivateVoting(event.id)}
                          className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-lg rounded-xl transition-all duration-200 shadow-lg"
                        >
                          <Play className="w-5 h-5" />
                          <span>AVVIA VOTAZIONI</span>
                        </button>
                      )}
                    </div>

                    {/* Voting Completion Status - Show only when voting is active or completed */}
                    {event.votingStatus === 'completed' && (
                      <VotingCompletionChecker eventId={event.id} />
                    )}

                    {/* Participants Count - Below Voting Button */}
                    <div className="text-center mt-4">
                      <p className="text-base text-gray-600">⭐ <span className="font-bold">{getParticipantsCount(event.id)} partecipanti</span> ⭐</p>
                    </div>
                  </div>


                </div>
              ))}
            </div>
          )}

          {/* Completed Events */}
          {completedEvents.length > 0 && (
            <div className="space-y-4 mt-8">
              <h3 className="text-lg font-semibold text-white flex items-center justify-center">
                <Calendar className="w-5 h-5 mr-2" />
                STORICO EVENTI
              </h3>
              
              {completedEvents.map(event => (
                <div key={event.id} className="bg-[#300505] rounded-2xl shadow-xl p-6 border border-[#8d0303]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-white break-words leading-tight">{event.name}</h4>
                      <p className="text-sm text-gray-300">{formatEventDate(event.date)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onViewReport(event.id)}
                        className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-colors"
                        title="Visualizza Report"
                      >
                        <BarChart3 className="w-4 h-4 inline mr-1" />
                        Report
                      </button>
                      <button
                        onClick={() => onDeleteEvent(event.id)}
                        className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                        title="Elimina evento"
                      >
                        <Trash2 className="w-4 h-4" />
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

      {/* Fixed Buttons - Center Bottom */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex space-x-4">
        {onGoHome && (
          <button
            onClick={onGoHome}
            className="flex items-center justify-center w-12 h-12 rounded-full text-white hover:bg-white hover:bg-opacity-10 transition-all shadow-lg"
            style={{background: 'rgba(255, 255, 255, 0.1)'}}
            title="Torna alla Home"
          >
            <Home size={24} />
          </button>
        )}
        {onGoBackToAdmin && (
          <button
            onClick={onGoBackToAdmin}
            className="flex items-center justify-center w-12 h-12 rounded-full text-white hover:bg-white hover:bg-opacity-10 transition-all shadow-lg"
            style={{background: 'rgba(255, 255, 255, 0.1)'}}
            title="Torna all'Admin"
          >
            <Shield size={24} />
          </button>
        )}
      </div>
    </div>
  );
}