import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './hooks/useAuth';
import { useMutations } from './hooks/useMutations';
import { apiRequest } from './lib/queryClient';

import { User, WineEvent, Wine, Vote, WineResultDetailed, EventReportData } from '@shared/schema';

// Components
import SplashScreen from './components/screens/SplashScreen';

import AdminScreen from './components/screens/AdminScreen';
import EventListScreen from './components/screens/EventListScreen';
import AdminEventManagementScreen from './components/screens/AdminEventManagementScreen';
import EventDetailsScreen from './components/screens/EventDetailsScreen';
import EventResultsScreen from './components/screens/EventResultsScreen';
import HistoricEventsScreen from './components/screens/HistoricEventsScreen';
import PagellaScreen from './components/screens/PagellaScreen';
import SimpleVotingScreen from './components/screens/SimpleVotingScreen';
import AuthScreen from './components/screens/AuthScreen';

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

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>('auth');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Forza sempre il reset all'autenticazione quando l'app si ricarica
  useEffect(() => {
    setCurrentUser(null);
    setCurrentScreen('auth');
    setSessionId(null);
  }, []);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  
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
  
  // Custom hooks for better organization
  const { authLoading, authError, setAuthError, handleLogin, handleRegister } = useAuth();
  const { 
    createUserMutation, updateUserMutation, deleteUserMutation,
    createEventMutation, updateEventMutation, deleteEventMutation,
    createWineMutation, updateWineMutation, voteMutation
  } = useMutations();

  // Logout function
  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentScreen('auth');
    setSessionId(null);
    setAuthError(null);
    toast({ title: 'Logout effettuato', description: 'Arrivederci!' });
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
        setSessionId(null);
        setCurrentScreen('auth');
        toast({ 
          title: 'Utente non trovato', 
          description: 'Riseleziona il tuo utente dalla lista.',
          variant: 'destructive' 
        });
      }
    }
  }, [users, currentUser, setCurrentUser, setSessionId, toast]);

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




  // Import mutations from custom hook, keeping only unused specific ones
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

  // Sequential voting mutations
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

  // Event completion mutations
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

  // Session management mutations
  const loginMutation = useMutation({
    mutationFn: async (userId: number) => {
      // Get unique session setting from localStorage (default: false)
      const uniqueSessionEnabled = localStorage.getItem('diagonale_unique_session_enabled') === 'true';
      
      const response = await fetch(`/api/users/${userId}/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Unique-Session-Enabled': uniqueSessionEnabled.toString()
        },
        body: JSON.stringify({}),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const text = await response.text();
        const error = new Error(`${response.status}: ${text}`);
        (error as any).status = response.status;
        throw error;
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentUser(data.user);
      setSessionId(data.sessionId);
      setSessionError(null);
      setCurrentScreen('events');
      
      // FORZA REFRESH CACHE WINES QUANDO CAMBIA UTENTE
      queryClient.invalidateQueries({ queryKey: ['/api/wines'] });
      
      toast({ title: 'Accesso effettuato con successo!' });
    },
    onError: (error: any) => {
      if (error.status === 409) {
        setSessionError("Utente già connesso da un altro dispositivo. Disconnetti prima di continuare.");
      } else {
        setSessionError("Errore durante l'accesso. Riprova.");
      }
      toast({ title: 'Errore accesso', variant: 'destructive' });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      if (currentUser) {
        const response = await apiRequest('POST', `/api/users/${currentUser.id}/logout`, {});
        return response.json();
      }
    },
    onSuccess: () => {
      setCurrentUser(null);
      setSessionId(null);
      setSessionError(null);
      setCurrentScreen('home');
      toast({ title: 'Disconnesso con successo!' });
    },
  });

  // Heartbeat to keep session alive
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (currentUser && sessionId) {
      interval = setInterval(async () => {
        try {
          const response = await apiRequest('POST', `/api/users/${currentUser.id}/heartbeat`, {
            sessionId: sessionId
          });
          
          if (!response.ok) {
            // Session expired or invalid
            setCurrentUser(null);
            setSessionId(null);
            setCurrentScreen('home');
            toast({ title: 'Sessione scaduta. Ricollegati.', variant: 'destructive' });
          }
        } catch (error) {
          // Heartbeat failed silently
        }
      }, 60000); // Every minute
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentUser, sessionId, toast]);

  // Event handlers
  const handleUserSelect = (user: User) => {
    setSessionError(null);
    loginMutation.mutate(user.id);
  };

  const handleAddUser = (name: string, isAdmin: boolean) => {
    createUserMutation.mutate({ name, isAdmin });
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
    setCurrentScreen('historicEvents');
  };

  const handleShowPagella = (eventId: number) => {
    setSelectedEventId(eventId);
    setCurrentScreen('pagella');
  };

  const handleShowAddUserModal = () => {
    setShowAddUserModal(true);
  };

  const handleShowCreateEventModal = () => {
    setShowCreateEventModal(true);
  };

  const handleShowAdminEvents = () => {
    setCurrentScreen('adminEvents');
  };

  const handleShowChangeAdminPin = () => {
    setShowChangeAdminPinModal(true);
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
    setSelectedEventId(eventId);
    setCurrentScreen('eventDetails');
  };

  const handleShowEventResults = (eventId: number) => {
    setSelectedEventId(eventId);
    setCurrentScreen('eventResults');
  };

  const handleShowWineRegistration = (eventId: number) => {
    setEditingWine(null); // Reset editing wine for new registration
    setSelectedEventId(eventId);
    setShowWineRegistrationModal(true);
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
    setSelectedEventId(eventId);
    setCurrentScreen('eventResults');
  };

  const handleShowEditUserModal = (user: User) => {
    setEditingUser(user);
    setShowEditUserModal(true);
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

  const renderScreen = () => {
    switch (currentScreen) {
      case 'auth':
        return (
          <AuthScreen
            onLogin={onLogin}
            onRegister={onRegister}
            onGoBack={() => setCurrentScreen('auth')}
            onShowAdmin={handleShowAdmin}
            isLoading={authLoading}
            error={authError}
          />
        );

      case 'admin':
        return (
          <AdminScreen
            users={users}
            onShowAddUserModal={handleShowAddUserModal}
            onShowCreateEventModal={handleShowCreateEventModal}
            onShowEventList={handleShowAdminEvents}
            onShowEditUserModal={handleShowEditUserModal}
            onDeleteUser={handleDeleteUser}
            onGoBack={() => setCurrentScreen('events')}
            onGoHome={() => setCurrentScreen('events')}
            onChangeAdminPin={handleShowChangeAdminPin}
          />
        );
      case 'events':
        return (
          <EventListScreen
            events={events as WineEvent[]}
            users={users}
            currentUser={currentUser}
            wines={wines}
            votes={votes}
            onShowEventDetails={handleShowEventDetails}
            onShowEventResults={handleShowEventResults}
            onShowAdmin={handleShowAdmin}

            onRegisterWine={handleShowWineRegistration}
            onParticipateEvent={handleParticipateEvent}
            onVoteForWine={handleVoteForWine}
            onEditWine={handleEditWine}
            onShowHistoricEvents={handleShowHistoricEvents}
          />
        );
      case 'adminEvents':
        return (
          <AdminEventManagementScreen
            events={events as WineEvent[]}
            users={users}
            wines={wines}
            onGoBack={() => setCurrentScreen('admin')}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteEvent}
            onActivateVoting={handleActivateVoting}
            onDeactivateVoting={handleDeactivateVoting}
            onCompleteEvent={handleCompleteEvent}
            onViewReport={handleViewReport}
            onGoHome={() => setCurrentScreen('events')}
            onGoBackToAdmin={() => setCurrentScreen('admin')}
          />
        );
      case 'voting':
        return currentEvent && currentUser ? (
          <SimpleVotingScreen
            event={currentEvent}
            currentUser={currentUser}
            onBack={() => setCurrentScreen('events')}
            onHome={() => setCurrentScreen('events')}
            onShowAdmin={() => setCurrentScreen('admin')}
          />
        ) : null;
      case 'eventDetails':
        return (
          <EventDetailsScreen
            event={currentEvent}
            wines={wines}
            votes={votes}
            users={users}
            currentUser={currentUser}
            onShowWineRegistrationModal={() => setShowWineRegistrationModal(true)}
            onVoteForWine={handleVoteForWine}
            onCompleteEvent={handleCompleteEvent}
            onShowResults={handleShowResults}
            onParticipateEvent={handleParticipateEvent}
            onGoBack={() => setCurrentScreen('events')}
            onGoHome={() => setCurrentScreen('events')}
          />
        );
      case 'eventResults':
        return (
          <EventResultsScreen
            event={currentEvent}
            results={results}
            onGoBack={() => setCurrentScreen('events')}
            onGoHome={() => setCurrentScreen('events')}
          />
        );
      case 'historicEvents':
        return (
          <HistoricEventsScreen
            events={events as WineEvent[]}
            users={users}
            onShowEventResults={handleShowEventResults}
            onShowPagella={handleShowPagella}
            onGoBack={() => setCurrentScreen('events')}
            onGoHome={() => setCurrentScreen('events')}
          />
        );
      case 'pagella':
        return (
          <PagellaScreen
            event={currentEvent}
            onGoBack={() => setCurrentScreen('historicEvents')}
            onGoHome={() => setCurrentScreen('events')}
          />
        );

      default:
        return null;
    }
  };

  if (usersLoading || eventsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-effect rounded-2xl shadow-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(270,50%,65%)] mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  // Show splash screen for 3 seconds on app start
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <div className="h-screen flex flex-col">
      {renderScreen()}
      
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


    </div>
  );
}

export default App;
