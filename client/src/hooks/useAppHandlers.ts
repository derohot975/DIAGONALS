import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { User, WineEvent, Wine } from '@shared/schema';
import { AppState, AppStateActions } from '@/hooks/useAppState';
import { Screen } from '@/hooks/useAppRouter';

interface HandlersInput {
  currentUser: User | null;
  appState: AppState & AppStateActions;
  wines: Wine[];
  events: WineEvent[];
  setCurrentScreen: (screen: Screen) => void;
  setAdminSession: (isAdmin: boolean) => void;
  mutations: {
    createUserMutation: any;
    updateUserMutation: any;
    deleteUserMutation: any;
    createWineMutation: any;
    updateWineMutation: any;
    voteMutation: any;
    createEventMutation: any;
    updateEventMutation: any;
    deleteEventMutation: any;
    updateEventStatusMutation: any;
    setCurrentWineMutation: any;
    nextWineMutation: any;
    stopVotingMutation: any;
    completeEventMutation: any;
    viewReportMutation: any;
  };
}

export function useAppHandlers({
  currentUser, appState, wines, events, setCurrentScreen, setAdminSession, mutations
}: HandlersInput) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleAdminPinSuccess = useCallback(() => {
    setAdminSession(true);
    sessionStorage.setItem('dg_admin_session', 'true');
    appState.setShowAdminPinModal(false);
    appState.setPendingAdminAction(null);
    if ((window as any).pendingAdminCallback) {
      (window as any).pendingAdminCallback();
      (window as any).pendingAdminCallback = null;
    }
  }, [appState, setAdminSession]);

  const handleAdminPinClose = useCallback(() => {
    appState.setShowAdminPinModal(false);
    appState.setPendingAdminAction(null);
    (window as any).pendingAdminCallback = null;
  }, [appState]);

  const handleChangeAdminPin = useCallback((newPin: string) => {
    localStorage.setItem('diagonale_admin_pin', newPin);
    toast({ title: 'PIN Admin Modificato', description: 'Il PIN admin è stato aggiornato con successo.' });
    appState.setShowChangeAdminPinModal(false);
  }, [appState, toast]);

  const handleCreateEvent = useCallback((name: string, date: string, mode: string) => {
    if (!currentUser) { toast({ title: 'Errore: nessun utente selezionato', variant: 'destructive' }); return; }
    mutations.createEventMutation.mutate({ name, date, mode, createdBy: currentUser.id });
  }, [currentUser, mutations.createEventMutation, toast]);

  const handleUpdateEvent = useCallback((id: number, name: string, date: string, mode: string) => {
    mutations.updateEventMutation.mutate({ id, eventData: { name, date, mode } });
  }, [mutations.updateEventMutation]);

  const handleDeleteEvent = useCallback((eventId: number) => {
    if (confirm('Sei sicuro di voler eliminare questo evento? Questa azione non può essere annullata.')) {
      mutations.deleteEventMutation.mutate(eventId);
    }
  }, [mutations.deleteEventMutation]);

  const handleProtectEvent = useCallback((eventId: number, protect: boolean) => {
    const key = 'diagonale_protected_events';
    const current = JSON.parse(localStorage.getItem(key) || '[]') as number[];
    const updated = protect
      ? (current.includes(eventId) ? current : [...current, eventId])
      : current.filter(id => id !== eventId);
    localStorage.setItem(key, JSON.stringify(updated));
    queryClient.invalidateQueries({ queryKey: ['/api/events'] });
    setTimeout(() => window.dispatchEvent(new Event('storage')), 100);
    alert(protect ? 'Evento protetto con successo!' : 'Protezione rimossa con successo!');
  }, [queryClient]);

  const handleRegisterWine = useCallback((wineData: {
    type: string; name: string; producer: string; grape: string;
    year: number; origin: string; price: number; alcohol?: number; eventId: number;
  }) => {
    if (!currentUser || !wineData.eventId) return;
    const shared = { type: wineData.type, name: wineData.name, producer: wineData.producer,
      grape: wineData.grape, year: wineData.year, origin: wineData.origin,
      price: wineData.price.toString(), alcohol: wineData.alcohol || 0 };
    if (appState.editingWine) {
      mutations.updateWineMutation.mutate({ id: appState.editingWine.id, wineData: shared });
    } else {
      mutations.createWineMutation.mutate({ ...shared, eventId: wineData.eventId, userId: currentUser.id });
    }
    appState.setEditingWine(null);
  }, [currentUser, appState, mutations]);

  const handleVoteForWine = useCallback((wineId: number, score: number, hasLode = false) => {
    if (!currentUser) return;
    const wine = wines.find(w => w.id === wineId);
    if (!wine) return;
    mutations.voteMutation.mutate({ eventId: wine.eventId, wineId, userId: currentUser.id, score, hasLode });
  }, [currentUser, wines, mutations.voteMutation]);

  const handleEditWine = useCallback((eventId: number) => {
    const userWine = wines.find(w => w.eventId === eventId && w.userId === currentUser?.id);
    if (userWine) appState.setEditingWine(userWine);
    appState.setSelectedEventId(eventId);
    appState.setShowWineRegistrationModal(true);
  }, [currentUser, wines, appState]);

  const handleParticipateEvent = useCallback((eventId: number) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    appState.setSelectedEventId(eventId);
    if (event.votingStatus === 'active') setCurrentScreen('voting');
    else if (event.votingStatus === 'completed') setCurrentScreen('eventResults');
    else setCurrentScreen('eventDetails');
  }, [events, appState, setCurrentScreen]);

  const handleCompleteEvent = useCallback((eventId: number) => {
    mutations.completeEventMutation.mutate(eventId);
  }, [mutations.completeEventMutation]);

  const handleViewReport = useCallback((eventId: number) => {
    mutations.viewReportMutation.mutate(eventId, {
      onSuccess: () => setCurrentScreen('eventReport')
    });
  }, [mutations.viewReportMutation, setCurrentScreen]);

  const handleActivateVoting = useCallback(async (eventId: number) => {
    try {
      await apiRequest('PATCH', `/api/events/${eventId}/voting-status`, { votingStatus: 'active' });
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      toast({ title: 'Votazioni Attivate!', description: 'Gli utenti possono ora votare i vini.' });
    } catch {
      toast({ title: 'Errore', description: 'Impossibile attivare le votazioni.', variant: 'destructive' });
    }
  }, [queryClient, toast]);

  const handleDeactivateVoting = useCallback(async (eventId: number) => {
    try {
      await apiRequest('PATCH', `/api/events/${eventId}/voting-status`, { votingStatus: 'completed' });
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      toast({ title: 'Votazioni Completate!', description: 'Gli utenti vedranno ora i risultati finali.' });
    } catch {
      toast({ title: 'Errore', description: 'Impossibile completare le votazioni.', variant: 'destructive' });
    }
  }, [queryClient, toast]);

  const handleUpdateUser = useCallback((id: number, name: string, isAdmin: boolean) => {
    mutations.updateUserMutation.mutate({ id, userData: { name, isAdmin } });
    appState.setShowEditUserModal(false);
    appState.setEditingUser(null);
  }, [mutations.updateUserMutation, appState]);

  const handleDeleteUser = useCallback((userId: number) => {
    if (window.confirm('Sei sicuro di voler eliminare questo utente?')) {
      mutations.deleteUserMutation.mutate(userId);
    }
  }, [mutations.deleteUserMutation]);

  return {
    handleAdminPinSuccess, handleAdminPinClose, handleChangeAdminPin,
    handleCreateEvent, handleUpdateEvent, handleDeleteEvent, handleProtectEvent,
    handleRegisterWine, handleVoteForWine, handleEditWine, handleParticipateEvent,
    handleCompleteEvent, handleViewReport, handleActivateVoting, handleDeactivateVoting,
    handleUpdateUser, handleDeleteUser,
  };
}
