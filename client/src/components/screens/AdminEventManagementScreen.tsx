import { useState, useEffect } from 'react';
import { WineEvent, User, Wine } from '@shared/schema';
import { Edit, Trash2, Square, Play, Calendar, Star, BarChart3 } from '@/components/icons';
import { formatEventDate, formatEventName } from '@/lib/utils';
import diagoLogo from '@assets/diagologo.png';
import BottomNavBar from '../navigation/BottomNavBar';
import ParticipantsManager from './admin/components/ParticipantsManager';
import VotingCompletionChecker from './admin/components/VotingCompletionChecker';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface AdminEventManagementScreenProps {
  events: WineEvent[];
  wines: Wine[];
  users: User[];
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
  const [showParticipants, setShowParticipants] = useState<{[key: number]: boolean}>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const activeEvents = events.filter(event => event.status === 'registration' || event.status === 'active');
  const completedEvents = events.filter(event => event.status === 'completed');
  
  const getParticipantsCount = (eventId: number) => {
    return wines.filter(wine => wine.eventId === eventId).length;
  };

  // Fetch participants per evento specifico
  const getParticipants = (eventId: number) => {
    const eventWines = wines.filter(wine => wine.eventId === eventId);
    return eventWines.map(wine => {
      const user = users.find(u => u.id === wine.userId);
      return {
        userId: wine.userId,
        userName: user?.name || 'Sconosciuto',
        registeredAt: wine.createdAt || new Date().toISOString()
      };
    });
  };

  // Remove participant mutation
  const removeParticipantMutation = useMutation({
    mutationFn: async ({ eventId, userId }: { eventId: number; userId: number }) => {
      const response = await apiRequest('DELETE', `/api/events/${eventId}/participants/${userId}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wines'] });
      toast({ title: 'Partecipante rimosso con successo!' });
    },
    onError: () => {
      toast({ 
        title: 'Errore', 
        description: 'Impossibile rimuovere il partecipante', 
        variant: 'destructive' 
      });
    },
  });

  const handleRemoveParticipant = (eventId: number, userId: number, userName: string) => {
    const confirmMessage = `⚠️ ATTENZIONE ⚠️\n\nSei sicuro di voler rimuovere ${userName} dall'evento?\n\n• Il suo vino verrà eliminato definitivamente\n• Non potrà più partecipare alle votazioni\n• Questa azione non può essere annullata\n\nConfermi l'eliminazione?`;
    
    if (confirm(confirmMessage)) {
      removeParticipantMutation.mutate({ eventId, userId });
    }
  };

  const toggleParticipants = (eventId: number) => {
    setShowParticipants(prev => ({
      ...prev,
      [eventId]: !prev[eventId]
    }));
  };

  const handleDeleteEventWithConfirm = (event: WineEvent) => {
    const participantsCount = getParticipantsCount(event.id);
    const winesText = participantsCount === 1 ? 'vino' : 'vini';
    
    const confirmMessage = `⚠️ ATTENZIONE ⚠️\n\nSei sicuro di voler eliminare l'evento "${formatEventName(event.name)}"?\n\n• Verranno eliminati ${participantsCount} ${winesText} dal database\n• Tutti i voti associati andranno persi\n• Questa azione non può essere annullata\n\nConfermi l'eliminazione definitiva?`;
    
    if (confirm(confirmMessage)) {
      onDeleteEvent(event.id);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Fixed Header Section */}
      <div className="flex-shrink-0">
        {/* Logo Header */}
        <div className="flex justify-center pt-8 pb-6">
          <img 
            src={diagoLogo} 
            alt="DIAGO Logo" 
            className="w-20 h-auto logo-filter drop-shadow-lg" 
          />
        </div>


        {/* Fixed Active Events */}
        {activeEvents.length > 0 && (
          <div className="px-4 pb-4">
            <div className="space-y-6 max-w-4xl mx-auto">
              {activeEvents.map(event => (
                <div key={event.id} className="relative overflow-hidden">
                  {/* Main Event Card */}
                  <div className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-4 animate-fade-in relative">
                    
                    {/* Nome evento centrato */}
                    <div className="text-center mb-4">
                      <h3 className="event-name-standard text-lg font-bold text-gray-800 leading-tight">{formatEventName(event.name)}</h3>
                    </div>

                    {/* Primary Action - Voting Control */}
                    <div className="mb-4">
                      {event.votingStatus === 'active' ? (
                        <button
                          onClick={() => onDeactivateVoting(event.id)}
                          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold text-base rounded-xl transition-all duration-200 shadow-lg whitespace-nowrap"
                        >
                          <Square className="w-4 h-4" />
                          <span>SOSPENDI VOTAZIONI</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onActivateVoting(event.id)}
                          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-base rounded-xl transition-all duration-200 shadow-lg whitespace-nowrap"
                        >
                          <Play className="w-4 h-4" />
                          <span>AVVIA VOTAZIONI</span>
                        </button>
                      )}
                    </div>

                    {/* Action Buttons - Sotto il pulsante votazioni */}
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => onEditEvent(event)}
                        className="p-2 text-gray-700 hover:text-gray-900 transition-all duration-200"
                        title="Modifica evento"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEventWithConfirm(event)}
                        className="p-2 text-red-600 hover:text-red-800 transition-all duration-200"
                        title="Elimina evento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {/* Participants Manager - Icona stellina */}
                      <button
                        onClick={() => toggleParticipants(event.id)}
                        className="p-2 text-yellow-600 hover:text-yellow-800 transition-all duration-200"
                        title="Gestisci partecipanti"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Dropdown partecipanti nel container */}
                    {showParticipants[event.id] && (
                      <div className="mt-4 bg-gray-50 rounded-lg p-3 border">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2 text-center">⭐ PARTECIPANTI ⭐</h4>
                        {getParticipants(event.id).length === 0 ? (
                          <p className="text-sm text-gray-500">Nessun partecipante</p>
                        ) : (
                          <div className="space-y-2">
                            {getParticipants(event.id).map((participant) => (
                              <div key={participant.userId} className="flex items-center justify-between text-sm">
                                <span className="font-medium text-gray-800">{participant.userName}</span>
                                <button
                                  onClick={() => handleRemoveParticipant(event.id, participant.userId, participant.userName)}
                                  className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-medium"
                                  disabled={removeParticipantMutation.isPending}
                                >
                                  Elimina
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Voting Completion Status - Show only when voting is active or completed */}
                    {event.votingStatus === 'completed' && (
                      <VotingCompletionChecker eventId={event.id} onCompleteEvent={onCompleteEvent} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fixed Historic Events Title */}
        {completedEvents.length > 0 && (
          <div className="px-4 pb-2">
            <h3 className="text-base font-semibold text-white text-center">
              STORICO EVENTI
            </h3>
          </div>
        )}
      </div>

      {/* Scrollable Historic Events Only */}
      {completedEvents.length > 0 ? (
        <div 
          className="overflow-y-auto px-4 pb-4" 
          style={{
            height: 'calc(100dvh - 460px - var(--bottom-nav-total, 88px) - env(safe-area-inset-top, 0px))'
          }}
        >
          <div className="space-y-1 max-w-4xl mx-auto">
            {completedEvents.map(event => (
              <div key={event.id} className="bg-[#300505] rounded-2xl shadow-xl p-4 border border-[#8d0303]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-white break-words leading-tight">{formatEventName(event.name)}</h4>
                    <p className="text-sm text-gray-300">{formatEventDate(event.date)}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onViewReport(event.id)}
                      className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                      title="Visualizza Report"
                    >
                      <BarChart3 className="w-4 h-4" />
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
        </div>
      ) : events.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Nessun evento creato</p>
            <p className="text-sm text-gray-400">Usa "Nuovo Evento" per crearne uno</p>
          </div>
        </div>
      ) : (
        <div className="flex-1"></div>
      )}

      <BottomNavBar 
        onGoHome={onGoHome}
        onShowAdmin={onGoBackToAdmin}
        layout="center"
      />
    </div>
  );
}