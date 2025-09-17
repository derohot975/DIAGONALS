import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '../lib/queryClient';
import { User } from '@shared/schema';

interface UseEventMutationsProps {
  currentUser: User | null;
  selectedEventId: number | null;
  setReportData: (data: any) => void;
  setShowReportModal: (show: boolean) => void;
}

export const useEventMutations = ({
  currentUser,
  selectedEventId,
  setReportData,
  setShowReportModal
}: UseEventMutationsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createEventMutation = useMutation({
    mutationFn: async (eventData: { name: string; date: string; mode: string; createdBy: number }) => {
      const response = await apiRequest('POST', '/api/events', eventData);
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData);
      }
      return response.json();
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      toast({ 
        title: '✅ Evento creato con successo!', 
        description: `"${data.name}" è stato aggiunto alla lista eventi.`
      });
    },
    onError: () => {
      toast({ title: 'Errore nella creazione dell\'evento', variant: 'destructive' });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({ id, eventData }: { id: number; eventData: { name: string; date: string; mode: string } }) => {
      const response = await apiRequest('PATCH', `/api/events/${id}`, eventData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      toast({ title: 'Evento aggiornato con successo!' });
    },
    onError: () => {
      toast({ title: 'Errore nell\'aggiornamento dell\'evento', variant: 'destructive' });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: number) => {
      const response = await apiRequest('DELETE', `/api/events/${eventId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      toast({ title: 'Evento eliminato con successo!' });
    },
    onError: () => {
      toast({ title: 'Errore nell\'eliminazione dell\'evento', variant: 'destructive' });
    },
  });

  const updateEventStatusMutation = useMutation({
    mutationFn: async ({ eventId, status }: { eventId: number; status: string }) => {
      const response = await fetch(`/api/events/${eventId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      if (selectedEventId) {
        queryClient.invalidateQueries({ queryKey: ['/api/events/' + selectedEventId + '/results'] });
      }
      toast({ title: 'Evento completato!' });
    },
    onError: () => {
      toast({ title: 'Errore nell\'aggiornamento dell\'evento', variant: 'destructive' });
    },
  });

  const activateVotingMutation = useMutation({
    mutationFn: async (eventId: number) => {
      const response = await apiRequest('PATCH', `/api/events/${eventId}`, { votingStatus: 'voting' });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      toast({ 
        title: '🗳️ Votazioni attivate!', 
        description: 'I partecipanti possono ora votare i vini registrati.'
      });
    },
    onError: () => {
      toast({ title: 'Errore nell\'attivazione delle votazioni', variant: 'destructive' });
    },
  });

  const deactivateVotingMutation = useMutation({
    mutationFn: async (eventId: number) => {
      const response = await apiRequest('PATCH', `/api/events/${eventId}`, { votingStatus: 'registration' });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      toast({ 
        title: '📋 Votazioni disattivate!', 
        description: 'Tornato alla modalità registrazione vini.'
      });
    },
    onError: () => {
      toast({ title: 'Errore nella disattivazione delle votazioni', variant: 'destructive' });
    },
  });

  const setCurrentWineMutation = useMutation({
    mutationFn: async ({ eventId, wineId }: { eventId: number; wineId: number }) => {
      const response = await apiRequest('PATCH', `/api/events/${eventId}/current-wine`, { wineId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      toast({ 
        title: '🍷 Vino selezionato per votazione!', 
        description: 'I partecipanti possono ora votare questo vino.'
      });
    },
    onError: () => {
      toast({ title: 'Errore nella selezione del vino', variant: 'destructive' });
    },
  });

  const nextWineMutation = useMutation({
    mutationFn: async (eventId: number) => {
      const response = await apiRequest('POST', `/api/events/${eventId}/next-wine`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      toast({ 
        title: '➡️ Passato al vino successivo!', 
        description: 'Votazione per il vino precedente completata.'
      });
    },
    onError: () => {
      toast({ title: 'Errore nel passaggio al vino successivo', variant: 'destructive' });
    },
  });

  const stopVotingMutation = useMutation({
    mutationFn: async (eventId: number) => {
      const response = await apiRequest('PATCH', `/api/events/${eventId}/current-wine`, { wineId: null });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      toast({ 
        title: '⏹️ Votazione interrotta!', 
        description: 'Nessun vino è attualmente in votazione.'
      });
    },
    onError: () => {
      toast({ title: 'Errore nell\'interruzione della votazione', variant: 'destructive' });
    },
  });

  const completeEventMutation = useMutation({
    mutationFn: async (eventId: number) => {
      if (!currentUser) {
        throw new Error('User not found');
      }
      const response = await apiRequest('POST', `/api/events/${eventId}/complete`, {
        userId: currentUser.id
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      toast({ 
        title: '🎉 Evento completato!', 
        description: 'Il report finale è stato generato con successo.'
      });
    },
    onError: (error: any) => {
      const message = error?.message || 'Errore nel completamento dell\'evento';
      toast({ title: message, variant: 'destructive' });
    },
  });

  const viewReportMutation = useMutation({
    mutationFn: async (eventId: number) => {
      const response = await apiRequest('GET', `/api/events/${eventId}/report`);
      return response.json();
    },
    onSuccess: (data) => {
      setReportData(data);
      setShowReportModal(true);
    },
    onError: () => {
      toast({ title: 'Errore nel recupero del report', variant: 'destructive' });
    },
  });

  return {
    createEventMutation,
    updateEventMutation,
    deleteEventMutation,
    updateEventStatusMutation,
    activateVotingMutation,
    deactivateVotingMutation,
    setCurrentWineMutation,
    nextWineMutation,
    stopVotingMutation,
    completeEventMutation,
    viewReportMutation,
  };
};
