import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '../lib/queryClient';

export const useWineMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createWineMutation = useMutation({
    mutationFn: async (wineData: { 
      type: string; 
      name: string; 
      producer: string; 
      grape: string;
      year: number; 
      origin: string; 
      price: string; 
      alcohol?: number;
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
    createWineMutation,
    updateWineMutation,
    voteMutation
  };
};
