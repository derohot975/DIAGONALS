import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from './hooks/useLocalStorage';
import { User, WineEvent, Wine, Vote, WineResultDetailed, EventReportData } from '@shared/schema';
import { apiRequest } from './lib/queryClient';

// Components
import SplashScreen from './components/screens/SplashScreen';
import HomeScreen from './components/screens/HomeScreen';
import AdminScreen from './components/screens/AdminScreen';
import EventListScreen from './components/screens/EventListScreen';
import AdminEventManagementScreen from './components/screens/AdminEventManagementScreen';
import EventDetailsScreen from './components/screens/EventDetailsScreen';
import EventResultsScreen from './components/screens/EventResultsScreen';
import SimpleVotingScreen from './components/screens/SimpleVotingScreen';

import AddUserModal from './components/modals/AddUserModal';
import EditUserModal from './components/modals/EditUserModal';
import CreateEventModal from './components/modals/CreateEventModal';
import EditEventModal from './components/modals/EditEventModal';
import WineRegistrationModal from './components/modals/WineRegistrationModal';
import EventReportModal from './components/modals/EventReportModal';
import InstallPrompt from './components/InstallPrompt';


type Screen = 'home' | 'admin' | 'events' | 'adminEvents' | 'eventDetails' | 'eventResults' | 'voting';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('diagonale_current_user', null);
  const [sessionId, setSessionId] = useLocalStorage<string | null>('diagonale_session_id', null);
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

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  // Validate currentUser still exists in database
  useEffect(() => {
    if (currentUser && users.length > 0) {
      const userExists = users.find(u => u.id === currentUser.id);
      if (!userExists) {
        console.log('Current user no longer exists in database, clearing localStorage');
        setCurrentUser(null);
        setSessionId(null);
        setCurrentScreen('home');
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
    queryFn: async () => {
      console.log('Fetching events from API...');
      const response = await fetch('/api/events');
      const data = await response.json();
      console.log('Fetched events:', data);
      return data;
    },
    staleTime: 0, // Forza sempre reload
    gcTime: 0, // Non usare cache (v5 syntax)
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const { data: wines = [] } = useQuery<Wine[]>({
    queryKey: ['/api/wines', currentUser?.id],
    queryFn: () => fetch('/api/wines').then(res => res.json()),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0, // Forza sempre reload
  });

  const { data: votes = [] } = useQuery<Vote[]>({
    queryKey: ['/api/votes?eventId=' + selectedEventId],
    enabled: !!selectedEventId,
  });

  const { data: results = [] } = useQuery<WineResultDetailed[]>({
    queryKey: ['/api/events/' + selectedEventId + '/results'],
    enabled: !!selectedEventId && currentScreen === 'eventResults',
  });

  // Mutations
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
      console.log('Creating event with:', eventData);
      const response = await apiRequest('POST', '/api/events', eventData);
      console.log('Response status:', response.status);
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error response:', errorData);
        throw new Error(errorData);
      }
      return response.json();
    },
    onSuccess: async (data) => {
      console.log('Event created successfully:', data);
      // FORZA REFRESH IMMEDIATO degli eventi
      await refetchEvents();
      console.log('Events refetched after creation');
      toast({ 
        title: '✅ Evento creato con successo!', 
        description: `"${data.name}" è stato aggiunto alla lista eventi.`
      });
    },
    onError: (error) => {
      console.error('Event creation error:', error);
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
      // INVALIDA TUTTE LE QUERY WINES PER AGGIORNARE LA CACHE
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/votes?eventId=' + selectedEventId] });
      toast({ title: 'Voto registrato!' });
    },
    onError: () => {
      toast({ title: 'Errore nel voto', variant: 'destructive' });
    },
  });

  const updateEventStatusMutation = useMutation({
    mutationFn: async ({ eventId, status }: { eventId: number; status: string }) => {
      const response = await apiRequest('PATCH', `/api/events/${eventId}/status`, { status });
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
          console.error('Heartbeat failed:', error);
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

  const handleCreateEvent = (name: string, date: string, mode: string) => {
    if (!currentUser) {
      console.error('No current user found');
      toast({ title: 'Errore: nessun utente selezionato', variant: 'destructive' });
      return;
    }
    console.log('Current user for event creation:', currentUser);
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

  const handleVoteForWine = (voteData: { wineId: number; score: number }) => {
    if (!currentUser) return;
    // Find event for this wine
    const wine = wines.find(w => w.id === voteData.wineId);
    if (!wine) return;
    
    voteMutation.mutate({
      eventId: wine.eventId,
      wineId: voteData.wineId,
      userId: currentUser.id,
      score: voteData.score,
      hasLode: false, // Remove lode system for now
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
      console.error('Failed to activate voting:', error);
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
      console.error('Failed to deactivate voting:', error);
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
      case 'home':
        return (
          <HomeScreen
            users={users}
            onUserSelect={handleUserSelect}
            onShowAdmin={() => setCurrentScreen('admin')}
            sessionError={sessionError}
            onForceLogout={() => {
              setSessionError(null);
              // Force logout logic if needed
            }}
          />
        );
      case 'admin':
        return (
          <AdminScreen
            users={users}
            onShowAddUserModal={() => setShowAddUserModal(true)}
            onShowCreateEventModal={() => setShowCreateEventModal(true)}
            onShowEventList={() => setCurrentScreen('adminEvents')}
            onShowEditUserModal={handleShowEditUserModal}
            onDeleteUser={handleDeleteUser}
            onGoBack={() => setCurrentScreen('home')}
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
            onGoBack={() => setCurrentScreen('home')}
            onRegisterWine={handleShowWineRegistration}
            onParticipateEvent={handleParticipateEvent}
            onVoteForWine={handleVoteForWine}
            onEditWine={handleEditWine}
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
            onGoHome={() => setCurrentScreen('home')}
          />
        );
      case 'voting':
        return currentEvent && currentUser ? (
          <SimpleVotingScreen
            event={currentEvent}
            currentUser={currentUser}
            onBack={() => setCurrentScreen('events')}
            onHome={() => setCurrentScreen('home')}
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
            onGoHome={() => setCurrentScreen('home')}
          />
        );
      case 'eventResults':
        return (
          <EventResultsScreen
            event={currentEvent}
            results={results}
            onGoBack={() => setCurrentScreen('events')}
            onGoHome={() => setCurrentScreen('home')}
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
    <div className="min-h-screen flex flex-col">
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

      {/* Install Prompt - Only show on home screen when not logged in */}
      {currentScreen === 'home' && !currentUser && <InstallPrompt />}


    </div>
  );
}

export default App;
