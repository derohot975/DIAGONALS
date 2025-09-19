import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './hooks/useAuth';
import { useSession } from './hooks/useSession';
import { useUserMutations } from './hooks/useUserMutations';
import { useEventMutations } from './hooks/useEventMutations';
import { useWineMutations } from './hooks/useWineMutations';
import * as uiHandlers from './handlers/uiHandlers';
import * as userHandlers from './handlers/userHandlers';
import * as eventHandlers from './handlers/eventHandlers';
import { apiRequest } from './lib/queryClient';
import { isLoadingState } from './lib/utils';
import AppShell from './components/AppShell';
import ScreenRouter from './components/ScreenRouter';
// BEGIN DIAGONALE APP SHELL - Import LoadingSkeleton
import LoadingSkeleton from './components/LoadingSkeleton';
import { performanceTelemetry } from './lib/performanceTelemetry';
// END DIAGONALE APP SHELL

import { User, WineEvent, Wine, Vote, WineResultDetailed, EventReportData } from '@shared/schema';

// Components
import SplashScreen from './components/screens/SplashScreen';

import AddUserModal from './components/modals/AddUserModal';
import EditUserModal from './components/modals/EditUserModal';
import CreateEventModal from './components/modals/CreateEventModal';
import EditEventModal from './components/modals/EditEventModal';
import WineRegistrationModal from './components/modals/WineRegistrationModal';
import EventReportModal from './components/modals/EventReportModal';
import AdminPinModal from './components/AdminPinModal';
import ChangeAdminPinModal from './components/modals/ChangeAdminPinModal';
import InstallPrompt from './components/InstallPrompt';


type Screen = 'auth' | 'home' | 'admin' | 'events' | 'adminEvents' | 'eventDetails' | 'eventResults' | 'voting' | 'historicEvents' | 'pagella';

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
  const [showSplash, setShowSplash] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>('auth');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Forza sempre il reset all'autenticazione quando l'app si ricarica
  useEffect(() => {
    setCurrentUser(null);
    setCurrentScreen('auth');
  }, []);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  
  // Modal states
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [showEditEventModal, setShowEditEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<WineEvent | null>(null);
  const [showWineRegistrationModal, setShowWineRegistrationModal] = useState(false);
  const [editingWine, setEditingWine] = useState<Wine | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState<EventReportData | null>(null);
  
  // Admin PIN protection
  const [showAdminPinModal, setShowAdminPinModal] = useState(false);
  const [pendingAdminAction, setPendingAdminAction] = useState<string | null>(null);
  const [showChangeAdminPinModal, setShowChangeAdminPinModal] = useState(false);

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
  } = useSession(currentUser, setCurrentUser, setCurrentScreen);
  
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
    selectedEventId,
    setReportData,
    setShowReportModal
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
      setCurrentScreen('events');
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    }
  };

  const onRegister = async (name: string, pin: string) => {
    const user = await handleRegister(name, pin);
    if (user) {
      setCurrentUser(user);
      setCurrentScreen('events');
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    }
  };

  // Auto-login if user exists in localStorage
  useEffect(() => {
    if (currentUser && currentScreen === 'auth') {
      setCurrentScreen('events');
    }
  }, [currentUser, currentScreen]);

  // Queries
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  // Validate currentUser still exists in database
  useEffect(() => {
    if (currentUser && users.length > 0) {
      const userExists = users.find(u => u.id === currentUser.id);
      if (!userExists) {
        // User validation: clearing localStorage for non-existent user
        setCurrentUser(null);
        setCurrentScreen('auth');
        toast({ 
          title: 'Utente non trovato', 
          description: 'Riseleziona il tuo utente dalla lista.',
          variant: 'destructive' 
        });
      }
    }
  }, [users, currentUser, setCurrentUser, toast]);

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
    queryKey: ['/api/votes?eventId=' + selectedEventId],
    enabled: !!selectedEventId,
  });

  const { data: results = [] } = useQuery<WineResultDetailed[]>({
    queryKey: ['/api/events/' + selectedEventId + '/results'],
    enabled: !!selectedEventId && currentScreen === 'eventResults',
  });

  // BEGIN DIAGONALE APP SHELL - Performance telemetry for data loading
  useEffect(() => {
    if (!usersLoading && !eventsLoading && users.length > 0) {
      performanceTelemetry.markFirstDataReceived();
    }
  }, [usersLoading, eventsLoading, users.length]);

  useEffect(() => {
    if (!usersLoading && !eventsLoading && !showSplash && currentScreen !== 'auth') {
      performanceTelemetry.markAppReady();
    }
  }, [usersLoading, eventsLoading, showSplash, currentScreen]);
  // END DIAGONALE APP SHELL

  // All mutations now provided by domain-specific hooks


  // Event handlers - handleUserSelect now provided by useSession hook

  const handleAddUser = (name: string, isAdmin: boolean) => {
    userHandlers.addUser({ createUserMutation }, name, isAdmin);
  };

  // Admin PIN protection functions
  const requireAdminPin = (action: string, callback: () => void) => {
    setPendingAdminAction(action);
    setShowAdminPinModal(true);
    // Store the callback temporarily for execution after PIN validation
    (window as any).pendingAdminCallback = callback;
  };

  const handleAdminPinSuccess = () => {
    setShowAdminPinModal(false);
    setPendingAdminAction(null);
    // Execute the pending admin action
    if ((window as any).pendingAdminCallback) {
      (window as any).pendingAdminCallback();
      (window as any).pendingAdminCallback = null;
    }
  };

  const handleAdminPinClose = () => {
    setShowAdminPinModal(false);
    setPendingAdminAction(null);
    (window as any).pendingAdminCallback = null;
  };

  // Protected admin actions
  const handleShowAdmin = () => {
    requireAdminPin('admin-access', () => setCurrentScreen('admin'));
  };

  const handleShowHistoricEvents = () => {
    uiHandlers.showHistoricEvents({
      setCurrentScreen,
      setShowAddUserModal,
      setShowCreateEventModal,
      setShowChangeAdminPinModal,
      setEditingUser,
      setShowEditUserModal
    });
  };

  const handleShowPagella = (eventId: number) => {
    eventHandlers.showPagella({
      setSelectedEventId,
      setCurrentScreen,
      setEditingWine,
      setShowWineRegistrationModal
    }, eventId);
  };

  const handleShowAddUserModal = () => {
    uiHandlers.showAddUserModal({
      setCurrentScreen,
      setShowAddUserModal,
      setShowCreateEventModal,
      setShowChangeAdminPinModal,
      setEditingUser,
      setShowEditUserModal
    });
  };

  const handleShowCreateEventModal = () => {
    uiHandlers.showCreateEventModal({
      setCurrentScreen,
      setShowAddUserModal,
      setShowCreateEventModal,
      setShowChangeAdminPinModal,
      setEditingUser,
      setShowEditUserModal
    });
  };

  const handleShowAdminEvents = () => {
    uiHandlers.showAdminEvents({
      setCurrentScreen,
      setShowAddUserModal,
      setShowCreateEventModal,
      setShowChangeAdminPinModal,
      setEditingUser,
      setShowEditUserModal
    });
  };

  const handleShowChangeAdminPin = () => {
    uiHandlers.showChangeAdminPin({
      setCurrentScreen,
      setShowAddUserModal,
      setShowCreateEventModal,
      setShowChangeAdminPinModal,
      setEditingUser,
      setShowEditUserModal
    });
  };

  const handleChangeAdminPin = (newPin: string) => {
    // Salvataggio del nuovo PIN admin in localStorage
    localStorage.setItem('diagonale_admin_pin', newPin);
    toast({ 
      title: 'PIN Admin Modificato', 
      description: 'Il PIN admin è stato aggiornato con successo.' 
    });
    setShowChangeAdminPinModal(false);
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

  const handleEditEvent = (event: WineEvent) => {
    setEditingEvent(event);
    setShowEditEventModal(true);
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
    if (!currentUser || !selectedEventId) return;
    
    if (editingWine) {
      // Update existing wine
      updateWineMutation.mutate({
        id: editingWine.id,
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
        eventId: selectedEventId,
        userId: currentUser.id,
      });
    }
    
    setEditingWine(null); // Reset editing state
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

  const handleShowEventDetails = (eventId: number) => {
    eventHandlers.showEventDetails({
      setSelectedEventId,
      setCurrentScreen,
      setEditingWine,
      setShowWineRegistrationModal
    }, eventId);
  };

  const handleShowEventResults = (eventId: number) => {
    eventHandlers.showEventResults({
      setSelectedEventId,
      setCurrentScreen,
      setEditingWine,
      setShowWineRegistrationModal
    }, eventId);
  };

  const handleShowWineRegistration = (eventId: number) => {
    eventHandlers.showWineRegistration({
      setSelectedEventId,
      setCurrentScreen,
      setEditingWine,
      setShowWineRegistrationModal
    }, eventId);
  };

  const handleEditWine = (eventId: number) => {
    // Trova il vino dell'utente corrente per questo evento
    const userWine = wines.find(w => w.eventId === eventId && w.userId === currentUser?.id);
    if (userWine) {
      setEditingWine(userWine);
    }
    setSelectedEventId(eventId);
    setShowWineRegistrationModal(true);
  };

  const handleParticipateEvent = (eventId: number) => {
    const event = events.find((e: WineEvent) => e.id === eventId);
    if (!event) return;
    
    setSelectedEventId(eventId);
    
    // Reindirizza alla pagina corretta basata sullo stato delle votazioni
    if (event.votingStatus === 'active') {
      setCurrentScreen('voting');
    } else if (event.votingStatus === 'completed') {
      setCurrentScreen('eventResults');
    } else {
      // votingStatus === 'not_started' - mostra dettagli evento
      setCurrentScreen('eventDetails');
    }
  };

  const handleCompleteEventOld = (eventId: number) => {
    updateEventStatusMutation.mutate({ eventId, status: 'completed' });
  };

  const handleCompleteEvent = (eventId: number) => {
    completeEventMutation.mutate(eventId);
  };

  const handleViewReport = (eventId: number) => {
    viewReportMutation.mutate(eventId);
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

  const handleShowResults = (eventId: number) => {
    eventHandlers.showResults({
      setSelectedEventId,
      setCurrentScreen,
      setEditingWine,
      setShowWineRegistrationModal
    }, eventId);
  };

  const handleShowEditUserModal = (user: User) => {
    uiHandlers.showEditUserModal({
      setCurrentScreen,
      setShowAddUserModal,
      setShowCreateEventModal,
      setShowChangeAdminPinModal,
      setEditingUser,
      setShowEditUserModal
    }, user);
  };

  const handleUpdateUser = (id: number, name: string, isAdmin: boolean) => {
    updateUserMutation.mutate({ id, userData: { name, isAdmin } });
    setShowEditUserModal(false);
    setEditingUser(null);
  };

  const handleDeleteUser = (userId: number) => {
    if (window.confirm('Sei sicuro di voler eliminare questo utente?')) {
      deleteUserMutation.mutate(userId);
    }
  };

  // Get current event
  const currentEvent = selectedEventId ? events.find((e: WineEvent) => e.id === selectedEventId) || null : null;


  // BEGIN DIAGONALE APP SHELL - Scoped loading logic
  if (isLoadingState(usersLoading, eventsLoading)) {
    if (ENABLE_APP_SHELL && shouldShowSkeleton(currentScreen)) {
      // App Shell: Mostra skeleton solo per route data-heavy
      performanceTelemetry.markAppShellReady();
      return <LoadingSkeleton showLogo={true} showNavigation={true} />;
    } else {
      // Fallback per route intro/auth: loading minimale o null
      if (currentScreen === 'auth') {
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
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <AppShell>
      <ScreenRouter
        currentScreen={currentScreen}
        currentUser={currentUser}
        currentEvent={currentEvent}
        users={users}
        events={events}
        wines={wines}
        votes={votes}
        results={results}
        authLoading={authLoading}
        authError={authError}
        onLogin={onLogin}
        onRegister={onRegister}
        setCurrentScreen={setCurrentScreen}
        handleShowAdmin={handleShowAdmin}
        handleShowHistoricEvents={handleShowHistoricEvents}
        handleShowEventDetails={handleShowEventDetails}
        handleShowEventResults={handleShowEventResults}
        handleShowWineRegistration={handleShowWineRegistration}
        handleShowResults={handleShowResults}
        handleShowPagella={handleShowPagella}
        handleShowAddUserModal={handleShowAddUserModal}
        handleShowCreateEventModal={handleShowCreateEventModal}
        handleShowAdminEvents={handleShowAdminEvents}
        handleShowChangeAdminPin={handleShowChangeAdminPin}
        handleShowEditUserModal={handleShowEditUserModal}
        handleParticipateEvent={handleParticipateEvent}
        handleVoteForWine={handleVoteForWine}
        handleEditWine={handleEditWine}
        handleEditEvent={handleEditEvent}
        handleDeleteEvent={handleDeleteEvent}
        handleActivateVoting={handleActivateVoting}
        handleDeactivateVoting={handleDeactivateVoting}
        handleCompleteEvent={handleCompleteEvent}
        handleViewReport={handleViewReport}
        handleUpdateUser={handleUpdateUser}
        handleDeleteUser={handleDeleteUser}
        setShowWineRegistrationModal={setShowWineRegistrationModal}
      />
      
      {/* Modals */}
      <AddUserModal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        onAddUser={handleAddUser}
      />
      
      <EditUserModal
        isOpen={showEditUserModal}
        onClose={() => {
          setShowEditUserModal(false);
          setEditingUser(null);
        }}
        user={editingUser}
        onUpdateUser={handleUpdateUser}
      />
      
      <CreateEventModal
        isOpen={showCreateEventModal}
        onClose={() => setShowCreateEventModal(false)}
        onCreateEvent={handleCreateEvent}
      />
      
      <EditEventModal
        isOpen={showEditEventModal}
        onClose={() => {
          setShowEditEventModal(false);
          setEditingEvent(null);
        }}
        onUpdateEvent={handleUpdateEvent}
        event={editingEvent}
      />

      <WineRegistrationModal
        isOpen={showWineRegistrationModal}
        onClose={() => {
          setShowWineRegistrationModal(false);
          setEditingWine(null);
        }}
        currentUser={currentUser}
        onRegisterWine={handleRegisterWine}
        wine={editingWine}
      />

      <EventReportModal
        isOpen={showReportModal}
        onClose={() => {
          setShowReportModal(false);
          setReportData(null);
        }}
        reportData={reportData}
      />

      <AdminPinModal
        isOpen={showAdminPinModal}
        onClose={handleAdminPinClose}
        onSuccess={handleAdminPinSuccess}
      />

      <ChangeAdminPinModal
        isOpen={showChangeAdminPinModal}
        onClose={() => setShowChangeAdminPinModal(false)}
        onSuccess={handleChangeAdminPin}
      />

      {/* Install Prompt - Only show on home screen when not logged in */}
      {currentScreen === 'home' && !currentUser && <InstallPrompt />}


    </AppShell>
  );
}

export default App;
