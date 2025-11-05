import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '../lib/queryClient';

export const useUserMutations = () => {
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

  return {
    createUserMutation,
    updateUserMutation,
    deleteUserMutation,
  };
};
