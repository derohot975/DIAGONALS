import { useState } from 'react';
import { WineEvent, User, Wine } from '@shared/schema';
import { Edit, Trash2, Square, Play, Calendar, Star } from '@/components/icons';
import { formatEventName } from '@/lib/utils';
import diagoLogo from '@assets/diagologo.png';
import BottomNavBar from '../navigation/BottomNavBar';
import VotingCompletionChecker from './admin/components/VotingCompletionChecker';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
  events, users, wines, onEditEvent, onDeleteEvent, onActivateVoting,
  onDeactivateVoting, onCompleteEvent, onGoHome, onGoBackToAdmin
}: AdminEventManagementScreenProps) {
  const [showParticipants, setShowParticipants] = useState<{[key: number]: boolean}>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const activeEvents = events.filter(e => e.status !== 'completed');

  const removeParticipantMutation = useMutation({
    mutationFn: async ({ eventId, userId }: { eventId: number; userId: number }) => {
      await apiRequest('DELETE', `/api/events/${eventId}/participants/${userId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wines'] });
      toast({ title: 'Partecipante rimosso!' });
    },
  });

  const handleDeleteConfirm = (event: WineEvent) => {
    if (confirm(`Eliminare definitivamente "${formatEventName(event.name)}"?`)) {
      onDeleteEvent(event.id);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-[#300505] to-[#1a0303]">
      {/* Header */}
      <div className="flex-shrink-0 px-6 pt-10 pb-6 flex flex-col items-center">
        <img src={diagoLogo} alt="Logo" className="w-16 h-auto mb-4 logo-filter drop-shadow-lg opacity-90" />
        <h2 className="text-lg font-black tracking-widest text-white/80 uppercase">Gestione Eventi</h2>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 space-y-4 scrollbar-hide pb-32">

        {activeEvents.map(event => (
          <div key={event.id} className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
            <div className="p-5">
              <h3 className="text-base font-bold text-white mb-4 tracking-wide">{formatEventName(event.name)}</h3>

              <div className="space-y-3">
                {event.votingStatus === 'active' ? (
                  <button
                    onClick={() => onDeactivateVoting(event.id)}
                    className="w-full bg-red-500/20 text-red-300 font-bold py-4 rounded-2xl flex items-center justify-center space-x-2 border border-red-500/30 active:scale-95 transition-all"
                  >
                    <Square className="w-4 h-4" /><span>Sospendi Voti</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onActivateVoting(event.id)}
                    className="w-full bg-white/92 text-red-950 font-bold py-4 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-black/20 active:scale-95 transition-all"
                  >
                    <Play className="w-4 h-4 fill-current" /><span>Avvia Votazioni</span>
                  </button>
                )}

                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => onEditEvent(event)} className="p-4 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 active:scale-95 transition-all">
                    <Edit className="w-5 h-5 text-white/60" />
                  </button>
                  <button onClick={() => handleDeleteConfirm(event)} className="p-4 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20 active:scale-95 transition-all">
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </button>
                  <button onClick={() => setShowParticipants(p => ({...p, [event.id]: !p[event.id]}))} className="p-4 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20 active:scale-95 transition-all">
                    <Star className="w-5 h-5 text-amber-400" />
                  </button>
                </div>
              </div>

              {showParticipants[event.id] && (
                <div className="mt-5 pt-5 border-t border-white/10 space-y-2">
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-widest text-center mb-3">Partecipanti</p>
                  {wines.filter(w => w.eventId === event.id).map(wine => (
                    <div key={wine.userId} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10">
                      <span className="font-bold text-white/80 text-sm">{users.find(u => u.id === wine.userId)?.name || '...'}</span>
                      <button onClick={() => removeParticipantMutation.mutate({eventId: event.id, userId: wine.userId})} className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {event.votingStatus === 'completed' && (
                <div className="mt-5 pt-5 border-t border-white/10">
                  <VotingCompletionChecker eventId={event.id} onCompleteEvent={onCompleteEvent} />
                </div>
              )}
            </div>
          </div>
        ))}

        {activeEvents.length === 0 && (
          <div className="text-center py-20">
            <Calendar className="w-12 h-12 text-white/15 mx-auto mb-4" />
            <p className="text-white/30 font-medium">Nessun evento attivo</p>
          </div>
        )}
      </div>

      <BottomNavBar onGoHome={onGoHome} onShowAdmin={onGoBackToAdmin} layout="center" />
    </div>
  );
}
