import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from './hooks/useLocalStorage';
import { User, WineEvent, Wine, Vote, WineResult } from '@shared/schema';
import { apiRequest } from './lib/queryClient';

// Components
import HomeScreen from './components/screens/HomeScreen';
import AdminScreen from './components/screens/AdminScreen';
import EventListScreen from './components/screens/EventListScreen';
import AdminEventManagementScreen from './components/screens/AdminEventManagementScreen';
import EventDetailsScreen from './components/screens/EventDetailsScreen';
import EventResultsScreen from './components/screens/EventResultsScreen';
import AdminVotingScreen from './components/screens/AdminVotingScreen';
import AddUserModal from './components/modals/AddUserModal';
import EditUserModal from './components/modals/EditUserModal';
import CreateEventModal from './components/modals/CreateEventModal';
import EditEventModal from './components/modals/EditEventModal';
import WineRegistrationModal from './components/modals/WineRegistrationModal';
import InstallPrompt from './components/InstallPrompt';
import FloatingNavigation from './components/FloatingNavigation';

type Screen = 'home' | 'admin' | 'events' | 'adminEvents' | 'eventDetails' | 'eventResults' | 'adminVoting';

function App() {
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

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  const { data: events = [], isLoading: eventsLoading } = useQuery<WineEvent[]>({
    queryKey: ['/api/events'],
  });

  const { data: wines = [] } = useQuery<Wine[]>({
    queryKey: ['/api/wines?eventId=' + selectedEventId],
    enabled: !!selectedEventId,
  });

  const { data: votes = [] } = useQuery<Vote[]>({
    queryKey: ['/api/votes?eventId=' + selectedEventId],
    enabled: !!selectedEventId,
  });

  const { data: results = [] } = useQuery<WineResult[]>({
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
    onSuccess: (data) => {
      console.log('Event created successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      toast({ title: 'Evento creato con successo!' });
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
      queryClient.invalidateQueries({ queryKey: ['/api/wines?eventId=' + selectedEventId] });
      toast({ title: 'Vino registrato con successo!' });
    },
    onError: () => {
      toast({ title: 'Errore nella registrazione del vino', variant: 'destructive' });
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

  // Session management mutations
  const loginMutation = useMutation({
    mutationFn: async (userId: number) => {
      // Get unique session setting from localStorage
      const uniqueSessionEnabled = localStorage.getItem('diagonale_unique_session_enabled') !== 'false';
      
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
    console.log('Current user:', currentUser);
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
  }) => {
    if (!currentUser || !selectedEventId) return;
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
  };

  const handleVoteForWine = (wineId: number, score: number, hasLode: boolean) => {
    if (!currentUser || !selectedEventId) return;
    voteMutation.mutate({
      eventId: selectedEventId,
      wineId,
      userId: currentUser.id,
      score,
      hasLode,
    });
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
    setSelectedEventId(eventId);
    setShowWineRegistrationModal(true);
  };

  const handleParticipateEvent = (eventId: number) => {
    setSelectedEventId(eventId);
    setCurrentScreen('eventDetails');
  };

  const handleCompleteEvent = (eventId: number) => {
    updateEventStatusMutation.mutate({ eventId, status: 'completed' });
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
  const currentEvent = selectedEventId ? events.find(e => e.id === selectedEventId) || null : null;

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
            onShowVotingManager={() => setCurrentScreen('adminVoting')}
            onShowEditUserModal={handleShowEditUserModal}
            onDeleteUser={handleDeleteUser}
            onGoBack={() => setCurrentScreen('home')}
          />
        );
      case 'events':
        return (
          <EventListScreen
            events={events}
            users={users}
            currentUser={currentUser}
            onShowEventDetails={handleShowEventDetails}
            onShowEventResults={handleShowEventResults}
            onGoBack={() => setCurrentScreen('home')}
            onRegisterWine={handleShowWineRegistration}
            onParticipateEvent={handleParticipateEvent}
          />
        );
      case 'adminEvents':
        return (
          <AdminEventManagementScreen
            events={events}
            users={users}
            onGoBack={() => setCurrentScreen('admin')}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteEvent}
          />
        );
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
          />
        );
      case 'eventResults':
        return (
          <EventResultsScreen
            event={currentEvent}
            results={results}
          />
        );
      case 'adminVoting':
        return (
          <AdminVotingScreen
            onBack={() => setCurrentScreen('admin')}
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
        onClose={() => setShowWineRegistrationModal(false)}
        onRegisterWine={handleRegisterWine}
      />

      {/* Install Prompt - Only show on home screen when not logged in */}
      {currentScreen === 'home' && !currentUser && <InstallPrompt />}

      {/* Floating Navigation - Hide HOME button when on home screen */}
      {currentScreen !== 'home' && currentScreen !== 'admin' && (
        <FloatingNavigation
          onShowHome={() => setCurrentScreen('home')}
        />
      )}
    </div>
  );
}

export default App;
