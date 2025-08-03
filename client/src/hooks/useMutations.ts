import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '../lib/queryClient';
import { User, WineEvent, Wine } from '@shared/schema';

export const useMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createUserMutation = useMutation({
    mutationFn: async (userData: { name: string; isAdmin: boolean }) => {
      const response = await apiRequest('POST', '/api/users', userData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({ title: 'Utente creato con successo!' });
    },
    onError: () => {
      toast({ title: 'Errore nella creazione dell\'utente', variant: 'destructive' });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, userData }: { id: number; userData: { name: string; isAdmin: boolean } }) => {
      const response = await apiRequest('PUT', `/api/users/${id}`, userData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({ title: 'Utente aggiornato con successo!' });
    },
    onError: () => {
      toast({ title: 'Errore nell\'aggiornamento dell\'utente', variant: 'destructive' });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest('DELETE', `/api/users/${userId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({ title: 'Utente eliminato con successo!' });
    },
    onError: () => {
      toast({ title: 'Errore nell\'eliminazione dell\'utente', variant: 'destructive' });
    },
  });

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

  const createWineMutation = useMutation({
    mutationFn: async (wineData: { 
      type: string; 
      name: string; 
      producer: string; 
      grape: string;
      year: number; 
      origin: string; 
      price: string; 
      eventId: number; 
      userId: number 
    }) => {
      const response = await apiRequest('POST', '/api/wines', wineData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wines'] });
      toast({ 
        title: '🍷 Vino registrato con successo!', 
        description: 'Partecipazione all\'evento confermata! Ora puoi partecipare alla DIAGONALE.'
      });
    },
    onError: () => {
      toast({ title: 'Errore nella registrazione del vino', variant: 'destructive' });
    },
  });

  const updateWineMutation = useMutation({
    mutationFn: async ({ id, wineData }: { 
      id: number; 
      wineData: { 
        type: string; 
        name: string; 
        producer: string; 
        grape: string;
        year: number; 
        origin: string; 
        price: string;
        alcohol: number;
      }
    }) => {
      const response = await apiRequest('PUT', `/api/wines/${id}`, wineData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wines'] });
      toast({ 
        title: '✏️ Vino modificato con successo!', 
        description: 'Le informazioni del tuo vino sono state aggiornate.'
      });
    },
    onError: () => {
      toast({ title: 'Errore nella modifica del vino', variant: 'destructive' });
    },
  });

  const voteMutation = useMutation({
    mutationFn: async (voteData: { eventId: number; wineId: number; userId: number; score: number; hasLode: boolean }) => {
      const response = await apiRequest('POST', '/api/votes', voteData);
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/votes?eventId=' + variables.eventId] });
      toast({ title: 'Voto registrato!' });
    },
    onError: () => {
      toast({ title: 'Errore nel voto', variant: 'destructive' });
    },
  });

  return {
    createUserMutation,
    updateUserMutation,
    deleteUserMutation,
    createEventMutation,
    updateEventMutation,
    deleteEventMutation,
    createWineMutation,
    updateWineMutation,
    voteMutation
  };
};