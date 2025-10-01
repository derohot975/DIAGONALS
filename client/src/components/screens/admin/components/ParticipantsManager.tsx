import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '../../../../lib/queryClient';
import { Star } from '@/components/icons';

interface ParticipantsManagerProps {
  eventId: number;
  iconOnly?: boolean;
}

export default function ParticipantsManager({ eventId, iconOnly = false }: ParticipantsManagerProps) {
  const [showParticipants, setShowParticipants] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch participants
  const { data: participants = [], isLoading } = useQuery<Array<{
    userId: number;
    userName: string;
    registeredAt: string;
  }>>({
    queryKey: ['/api/events', eventId, 'participants'],
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}/participants`);
      if (!response.ok) {
        throw new Error('Failed to fetch participants');
      }
      return response.json();
    },
    enabled: showParticipants,
  });

  // Remove participant mutation
  const removeParticipantMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest('DELETE', `/api/events/${eventId}/participants/${userId}`);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/events', eventId, 'participants'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wines'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      toast({ 
        title: '✅ Partecipante rimosso', 
        description: data.message 
      });
    },
    onError: () => {
      toast({ 
        title: '❌ Errore', 
        description: 'Impossibile rimuovere il partecipante', 
        variant: 'destructive' 
      });
    },
  });

  const handleRemoveParticipant = (userId: number, userName: string) => {
    const confirmMessage = `⚠️ ATTENZIONE ⚠️\n\nSei sicuro di voler rimuovere ${userName} dall'evento?\n\n• Il suo vino verrà eliminato definitivamente\n• Non potrà più partecipare alle votazioni\n• Questa azione non può essere annullata\n\nConfermi l'eliminazione?`;
    
    if (confirm(confirmMessage)) {
      removeParticipantMutation.mutate(userId);
    }
  };

  // Render iconOnly per modale
  if (iconOnly) {
    return (
      <>
        <button
          onClick={() => setShowParticipants(!showParticipants)}
          className="p-2 text-yellow-600 hover:text-yellow-800 transition-all duration-200"
          title="Gestisci partecipanti"
        >
          <Star className="w-4 h-4" />
        </button>
        
        {/* Tabella partecipanti a comparsa */}
        {showParticipants && (
          <div className="absolute top-12 right-0 mt-1 bg-white rounded-lg shadow-xl border p-3 max-h-40 overflow-y-auto z-50 min-w-48">
            {isLoading ? (
              <p className="text-sm text-gray-500">Caricamento...</p>
            ) : participants.length === 0 ? (
              <p className="text-sm text-gray-500">Nessun partecipante</p>
            ) : (
              <div className="space-y-2">
                {participants.map((participant) => (
                  <div key={participant.userId} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-800">{participant.userName}</span>
                    <button
                      onClick={() => handleRemoveParticipant(participant.userId, participant.userName)}
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
      </>
    );
  }

  return (
    <div className="mt-3">
      <button
        onClick={() => setShowParticipants(!showParticipants)}
        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
      >
        {showParticipants ? '▼ Nascondi partecipanti' : '▶ Gestisci partecipanti'}
      </button>

      {showParticipants && (
        <div className="mt-2 bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto">
          {isLoading ? (
            <p className="text-sm text-gray-500">Caricamento...</p>
          ) : participants.length === 0 ? (
            <p className="text-sm text-gray-500">Nessun partecipante</p>
          ) : (
            <div className="space-y-2">
              {participants.map((participant) => (
                <div key={participant.userId} className="flex items-center justify-between bg-white rounded px-3 py-2">
                  <span className="text-sm font-medium text-gray-800">{participant.userName}</span>
                  <button
                    onClick={() => handleRemoveParticipant(participant.userId, participant.userName)}
                    disabled={removeParticipantMutation.isPending}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {removeParticipantMutation.isPending ? 'Rimozione...' : 'Elimina'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
