import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './hooks/useAuth';
import { useSession } from './hooks/useSession';
import { useUserMutations } from './hooks/useUserMutations';
import { useEventMutations } from './hooks/useEventMutations';
import { useWineMutations } from './hooks/useWineMutations';
import { useAppRouter } from './hooks/useAppRouter';
import { useAppState } from './hooks/useAppState';
import { useAppNavigation } from './hooks/useAppNavigation';
import { useAppEffects } from './hooks/useAppEffects';
import * as userHandlers from './handlers/userHandlers';
import { apiRequest } from './lib/queryClient';
import { isLoadingState } from './lib/utils';
import { performanceTelemetry } from './lib/performanceTelemetry';
import AppShell from './components/AppShell';
import ScreenRouter from './components/ScreenRouter';
import LoadingSkeleton from './components/LoadingSkeleton';

import { User, WineEvent, Wine, Vote, WineResultDetailed } from '@shared/schema';

// Components
import SplashScreen from './components/screens/SplashScreen';

import AddUserModal from './components/modals/AddUserModal';
import EditUserModal from './components/modals/EditUserModal';
import CreateEventModal from './components/modals/CreateEventModal';
import EditEventModal from './components/modals/EditEventModal';
import WineRegistrationModal from './components/modals/WineRegistrationModal';
import EventReportScreen from './components/screens/EventReportScreen';
import AdminPinModal from './components/AdminPinModal';
import ChangeAdminPinModal from './components/modals/ChangeAdminPinModal';
import InstallPrompt from './components/InstallPrompt';


import { EventReportData } from '@shared/schema';
import { Screen } from './hooks/useAppRouter';

// BEGIN DIAGONALE APP SHELL - Feature Flags
const ENABLE_APP_SHELL = import.meta.env.VITE_ENABLE_APP_SHELL !== 'false'; // Default: true
const ENABLE_APP_SHELL_ON_INTRO = import.meta.env.VITE_ENABLE_APP_SHELL_ON_INTRO === 'true'; // Default: false

// Route che dovrebbero mostrare skeleton (data-heavy)
const DATA_HEAVY_SCREENS: Screen[] = ['events', 'adminEvents', 'eventDetails', 'eventResults', 'voting', 'historicEvents', 'pagella', 'admin'];

// Determina se la route corrente dovrebbe mostrare skeleton
const shouldShowSkeleton = (currentScreen: Screen): boolean => {
  // Se skeleton su intro è disabilitato e siamo su auth, non mostrare skeleton
  if (!ENABLE_APP_SHELL_ON_INTRO && currentScreen === 'auth') {
    return false;
  }
  
  // Mostra skeleton solo per route data-heavy
  return DATA_HEAVY_SCREENS.includes(currentScreen);
};
// END DIAGONALE APP SHELL

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Custom hooks for state management
  const router = useAppRouter(currentUser);
  const appState = useAppState();
  const navigation = useAppNavigation(router.setCurrentScreen, appState);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Session management hook
  const {
    sessionId,
    sessionError,
    setSessionError,
    loginMutation,
    logoutMutation,
    handleUserSelect,
    handleLogout: sessionHandleLogout
  } = useSession(currentUser, setCurrentUser, router.setCurrentScreen);
  
  // Custom hooks for better organization
  const { authLoading, authError, setAuthError, handleLogin, handleRegister } = useAuth();
  
  // Domain-specific mutation hooks
  const { createUserMutation, updateUserMutation, deleteUserMutation } = useUserMutations();
  const { createWineMutation, updateWineMutation, voteMutation } = useWineMutations();
  const {
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
  } = useEventMutations({
    currentUser,
    selectedEventId: appState.selectedEventId,
    setReportData: appState.setReportData,
    setShowReportModal: appState.setShowReportModal
  });

  // Queries
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  const { data: events = [], isLoading: eventsLoading, refetch: refetchEvents } = useQuery<WineEvent[]>({
    queryKey: ['/api/events'],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });

  const { data: wines = [] } = useQuery<Wine[]>({
    queryKey: ['/api/wines'],
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
    refetchOnWindowFocus: false,
  });

  const { data: votes = [] } = useQuery<Vote[]>({
    queryKey: ['/api/votes?eventId=' + appState.selectedEventId],
    enabled: !!appState.selectedEventId,
  });

  const { data: results = [] } = useQuery<WineResultDetailed[]>({
    queryKey: ['/api/events/' + appState.selectedEventId + '/results'],
    enabled: !!appState.selectedEventId && router.currentScreen === 'eventResults',
  });

  // App effects hook
  useAppEffects({
    currentUser,
    setCurrentUser,
    setCurrentScreen: router.setCurrentScreen,
    users,
    usersLoading,
    eventsLoading,
    showSplash: router.showSplash,
    currentScreen: router.currentScreen
  });

  // Logout function
  const handleLogout = () => {
    sessionHandleLogout();
    setAuthError(null);
  };

  // Authentication functions - using custom hook
  const onLogin = async (name: string, pin: string) => {
    const user = await handleLogin(name, pin);
    if (user) {
      setCurrentUser(user);
      router.setCurrentScreen('events');
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    }
  };

  const onRegister = async (name: string, pin: string) => {
    const user = await handleRegister(name, pin);
    if (user) {
      setCurrentUser(user);
      router.setCurrentScreen('events');
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    }
  };

  // Event handlers
  const handleAddUser = (name: string, isAdmin: boolean) => {
    userHandlers.addUser({ createUserMutation }, name, isAdmin);
  };

  // Admin PIN protection functions
  const handleAdminPinSuccess = () => {
    appState.setShowAdminPinModal(false);
    appState.setPendingAdminAction(null);
    // Execute the pending admin action
    if ((window as any).pendingAdminCallback) {
      (window as any).pendingAdminCallback();
      (window as any).pendingAdminCallback = null;
    }
  };

  const handleAdminPinClose = () => {
    appState.setShowAdminPinModal(false);
    appState.setPendingAdminAction(null);
    (window as any).pendingAdminCallback = null;
  };

  const handleChangeAdminPin = (newPin: string) => {
    // Salvataggio del nuovo PIN admin in localStorage
    localStorage.setItem('diagonale_admin_pin', newPin);
    toast({ 
      title: 'PIN Admin Modificato', 
      description: 'Il PIN admin è stato aggiornato con successo.' 
    });
    appState.setShowChangeAdminPinModal(false);
  };

  const handleCreateEvent = (name: string, date: string, mode: string) => {
    if (!currentUser) {
      toast({ title: 'Errore: nessun utente selezionato', variant: 'destructive' });
      return;
    }
    createEventMutation.mutate({ name, date, mode, createdBy: currentUser.id });
  };

  const handleUpdateEvent = (id: number, name: string, date: string, mode: string) => {
    updateEventMutation.mutate({ id, eventData: { name, date, mode } });
  };

  const handleDeleteEvent = (eventId: number) => {
    if (confirm('Sei sicuro di voler eliminare questo evento? Questa azione non può essere annullata.')) {
      deleteEventMutation.mutate(eventId);
    }
  };

  const handleRegisterWine = (wineData: {
    type: string;
    name: string;
    producer: string;
    grape: string;
    year: number;
    origin: string;
    price: number;
    alcohol?: number;
  }) => {
    if (!currentUser || !appState.selectedEventId) return;
    
    if (appState.editingWine) {
      // Update existing wine
      updateWineMutation.mutate({
        id: appState.editingWine.id,
        wineData: {
          type: wineData.type,
          name: wineData.name,
          producer: wineData.producer,
          grape: wineData.grape,
          year: wineData.year,
          origin: wineData.origin,
          price: wineData.price.toString(),
          alcohol: wineData.alcohol || 0,
        }
      });
    } else {
      // Create new wine
      createWineMutation.mutate({
        type: wineData.type,
        name: wineData.name,
        producer: wineData.producer,
        grape: wineData.grape,
        year: wineData.year,
        origin: wineData.origin,
        price: wineData.price.toString(),
        alcohol: wineData.alcohol || 0,
        eventId: appState.selectedEventId,
        userId: currentUser.id,
      });
    }
    
    appState.setEditingWine(null); // Reset editing state
  };

  const handleVoteForWine = (wineId: number, score: number, hasLode: boolean = false) => {
    if (!currentUser) return;
    // Find event for this wine
    const wine = wines.find(w => w.id === wineId);
    if (!wine) return;
    
    voteMutation.mutate({
      eventId: wine.eventId,
      wineId: wineId,
      userId: currentUser.id,
      score: score,
      hasLode: hasLode,
    });
  };

  const handleSelectCurrentWine = (eventId: number, wineId: number) => {
    setCurrentWineMutation.mutate({ eventId, wineId });
  };

  const handleNextWine = (eventId: number) => {
    nextWineMutation.mutate(eventId);
  };

  const handleStopVoting = (eventId: number) => {
    stopVotingMutation.mutate(eventId);
  };

  // Navigation functions now handled by useAppNavigation hook

  const handleEditWine = (eventId: number) => {
    // Trova il vino dell'utente corrente per questo evento
    const userWine = wines.find(w => w.eventId === eventId && w.userId === currentUser?.id);
    if (userWine) {
      appState.setEditingWine(userWine);
    }
    appState.setSelectedEventId(eventId);
    appState.setShowWineRegistrationModal(true);
  };

  const handleParticipateEvent = (eventId: number) => {
    const event = events.find((e: WineEvent) => e.id === eventId);
    if (!event) return;
    
    appState.setSelectedEventId(eventId);
    
    // Reindirizza alla pagina corretta basata sullo stato delle votazioni
    if (event.votingStatus === 'active') {
      router.setCurrentScreen('voting');
    } else if (event.votingStatus === 'completed') {
      router.setCurrentScreen('eventResults');
    } else {
      // votingStatus === 'not_started' - mostra dettagli evento
      router.setCurrentScreen('eventDetails');
    }
  };

  const handleCompleteEventOld = (eventId: number) => {
    updateEventStatusMutation.mutate({ eventId, status: 'completed' });
  };

  const handleCompleteEvent = (eventId: number) => {
    completeEventMutation.mutate(eventId);
  };

  const handleViewReport = (eventId: number) => {
    viewReportMutation.mutate(eventId, {
      onSuccess: () => {
        router.setCurrentScreen('eventReport');
      }
    });
  };

  const handleActivateVoting = async (eventId: number) => {
    try {
      await apiRequest('PATCH', `/api/events/${eventId}/voting-status`, {
        votingStatus: 'active'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      toast({ 
        title: 'Votazioni Attivate!', 
        description: 'Gli utenti possono ora votare i vini.' 
      });
    } catch (error) {
      toast({ 
        title: 'Errore', 
        description: 'Impossibile attivare le votazioni.', 
        variant: 'destructive' 
      });
    }
  };

  const handleDeactivateVoting = async (eventId: number) => {
    try {
      await apiRequest('PATCH', `/api/events/${eventId}/voting-status`, {
        votingStatus: 'completed'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      toast({ 
        title: 'Votazioni Completate!', 
        description: 'Gli utenti vedranno ora i risultati finali.' 
      });
    } catch (error) {
      toast({ 
        title: 'Errore', 
        description: 'Impossibile completare le votazioni.', 
        variant: 'destructive' 
      });
    }
  };

  const handleUpdateUser = (id: number, name: string, isAdmin: boolean) => {
    updateUserMutation.mutate({ id, userData: { name, isAdmin } });
    appState.setShowEditUserModal(false);
    appState.setEditingUser(null);
  };

  const handleDeleteUser = (userId: number) => {
    if (window.confirm('Sei sicuro di voler eliminare questo utente?')) {
      deleteUserMutation.mutate(userId);
    }
  };

  // Get current event
  const currentEvent = appState.selectedEventId ? events.find((e: WineEvent) => e.id === appState.selectedEventId) || null : null;

  // BEGIN DIAGONALE APP SHELL - Scoped loading logic
  if (isLoadingState(usersLoading, eventsLoading)) {
    if (ENABLE_APP_SHELL && shouldShowSkeleton(router.currentScreen)) {
      // App Shell: Mostra skeleton solo per route data-heavy
      performanceTelemetry.markAppShellReady();
      return <LoadingSkeleton showLogo={true} showNavigation={true} />;
    } else {
      // Fallback per route intro/auth: loading minimale o null
      if (router.currentScreen === 'auth') {
        // Per auth/intro: nessun skeleton, solo loading discreto
        return (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#300505] to-[#8d0303]">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white/50"></div>
          </div>
        );
      } else {
        // Comportamento originale per altre route
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="glass-effect rounded-2xl shadow-2xl p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(270,50%,65%)] mx-auto mb-4"></div>
              <p className="text-gray-600">Caricamento...</p>
            </div>
          </div>
        );
      }
    }
  }
  // END DIAGONALE APP SHELL

  // Show splash screen for 3 seconds on app start
  if (router.showSplash) {
    return <SplashScreen onFinish={() => router.setShowSplash(false)} />;
  }

  return (
    <AppShell>
      <ScreenRouter
        currentScreen={router.currentScreen}
        currentUser={currentUser}
        currentEvent={currentEvent}
        users={users}
        events={events}
        wines={wines}
        votes={votes}
        results={results}
        reportData={appState.reportData}
        authLoading={authLoading}
        authError={authError}
        onLogin={onLogin}
        onRegister={onRegister}
        setCurrentScreen={router.setCurrentScreen}
        handleShowAdmin={navigation.handleShowAdmin}
        handleShowHistoricEvents={navigation.handleShowHistoricEvents}
        handleShowEventDetails={navigation.handleShowEventDetails}
        handleShowEventResults={navigation.handleShowEventResults}
        handleShowWineRegistration={navigation.handleShowWineRegistration}
        handleShowResults={navigation.handleShowResults}
        handleShowPagella={navigation.handleShowPagella}
        handleShowAddUserModal={navigation.handleShowAddUserModal}
        handleShowCreateEventModal={navigation.handleShowCreateEventModal}
        handleShowAdminEvents={navigation.handleShowAdminEvents}
        handleShowChangeAdminPin={navigation.handleShowChangeAdminPin}
        handleShowEditUserModal={navigation.handleShowEditUserModal}
        handleParticipateEvent={handleParticipateEvent}
        handleVoteForWine={handleVoteForWine}
        handleEditWine={handleEditWine}
        handleEditEvent={navigation.handleEditEvent}
        handleDeleteEvent={handleDeleteEvent}
        handleActivateVoting={handleActivateVoting}
        handleDeactivateVoting={handleDeactivateVoting}
        handleCompleteEvent={handleCompleteEvent}
        handleViewReport={handleViewReport}
        handleUpdateUser={handleUpdateUser}
        handleDeleteUser={handleDeleteUser}
        setShowWineRegistrationModal={appState.setShowWineRegistrationModal}
      />
      
      {/* Modals */}
      <AddUserModal
        isOpen={appState.showAddUserModal}
        onClose={() => appState.setShowAddUserModal(false)}
        onAddUser={handleAddUser}
      />
      
      <EditUserModal
        isOpen={appState.showEditUserModal}
        onClose={() => {
          appState.setShowEditUserModal(false);
          appState.setEditingUser(null);
        }}
        user={appState.editingUser}
        onUpdateUser={handleUpdateUser}
      />
      
      <CreateEventModal
        isOpen={appState.showCreateEventModal}
        onClose={() => appState.setShowCreateEventModal(false)}
        onCreateEvent={handleCreateEvent}
      />
      
      <EditEventModal
        isOpen={appState.showEditEventModal}
        onClose={() => {
          appState.setShowEditEventModal(false);
          appState.setEditingEvent(null);
        }}
        onUpdateEvent={handleUpdateEvent}
        event={appState.editingEvent}
      />

      <WineRegistrationModal
        isOpen={appState.showWineRegistrationModal}
        onClose={() => {
          appState.setShowWineRegistrationModal(false);
          appState.setEditingWine(null);
        }}
        currentUser={currentUser}
        onRegisterWine={handleRegisterWine}
        wine={appState.editingWine}
      />


      <AdminPinModal
        isOpen={appState.showAdminPinModal}
        onClose={handleAdminPinClose}
        onSuccess={handleAdminPinSuccess}
      />

      <ChangeAdminPinModal
        isOpen={appState.showChangeAdminPinModal}
        onClose={() => appState.setShowChangeAdminPinModal(false)}
        onSuccess={handleChangeAdminPin}
      />

      {/* Install Prompt - Only show on home screen when not logged in */}
      {router.currentScreen === 'home' && !currentUser && <InstallPrompt />}


    </AppShell>
  );
}

export default App;
