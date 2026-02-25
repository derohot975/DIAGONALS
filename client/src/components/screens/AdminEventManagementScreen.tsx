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
    <div className="flex-1 flex flex-col bg-gray-50">
      <div className="flex-shrink-0 bg-white border-b px-6 py-10 flex flex-col items-center">
        <img src={diagoLogo} alt="Logo" className="w-20 h-auto mb-6 grayscale opacity-50" />
        <h2 className="text-xl font-black tracking-tight text-gray-900 uppercase">Gestione Eventi</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide pb-32">
        {activeEvents.map(event => (
          <div key={event.id} className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{formatEventName(event.name)}</h3>
              
              <div className="space-y-3">
                {event.votingStatus === 'active' ? (
                  <button onClick={() => onDeactivateVoting(event.id)} className="w-full bg-red-50 text-red-600 font-bold py-4 rounded-2xl flex items-center justify-center space-x-2 border border-red-100">
                    <Square className="w-4 h-4" /> <span>Sospendi Voti</span>
                  </button>
                ) : (
                  <button onClick={() => onActivateVoting(event.id)} className="w-full bg-black text-white font-bold py-4 rounded-2xl flex items-center justify-center space-x-2 shadow-lg active:scale-95 transition-all">
                    <Play className="w-4 h-4 fill-current" /> <span>Avvia Votazioni</span>
                  </button>
                )}

                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => onEditEvent(event)} className="p-4 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-600 border border-gray-100"><Edit className="w-5 h-5" /></button>
                  <button onClick={() => handleDeleteConfirm(event)} className="p-4 bg-gray-50 rounded-2xl flex items-center justify-center text-red-400 border border-gray-100"><Trash2 className="w-5 h-5" /></button>
                  <button onClick={() => setShowParticipants(p => ({...p, [event.id]: !p[event.id]}))} className="p-4 bg-gray-50 rounded-2xl flex items-center justify-center text-yellow-600 border border-gray-100"><Star className="w-5 h-5" /></button>
                </div>
              </div>

              {showParticipants[event.id] && (
                <div className="mt-6 pt-6 border-t space-y-3">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Partecipanti</p>
                  {wines.filter(w => w.eventId === event.id).map(wine => (
                    <div key={wine.userId} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <span className="font-bold text-gray-700 text-sm">{users.find(u => u.id === wine.userId)?.name || '...'}</span>
                      <button onClick={() => removeParticipantMutation.mutate({eventId: event.id, userId: wine.userId})} className="text-red-400 p-2"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              )}

              {event.votingStatus === 'completed' && (
                <div className="mt-6 pt-6 border-t">
                  <VotingCompletionChecker eventId={event.id} onCompleteEvent={onCompleteEvent} />
                </div>
              )}
            </div>
          </div>
        ))}

        {activeEvents.length === 0 && (
          <div className="text-center py-20">
            <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">Nessun evento attivo</p>
          </div>
        )}
      </div>

      <BottomNavBar onGoHome={onGoHome} onShowAdmin={onGoBackToAdmin} layout="center" />
    </div>
  );
}
