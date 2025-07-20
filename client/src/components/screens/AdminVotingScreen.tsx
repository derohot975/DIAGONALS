import { useState, useEffect } from 'react';
import { ArrowLeft, Play, Square, Eye, Users, CheckCircle, Calendar } from 'lucide-react';
import { WineEvent, Wine, User } from '@shared/schema';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../lib/queryClient';

interface AdminVotingScreenProps {
  onBack: () => void;
}

export default function AdminVotingScreen({ onBack }: AdminVotingScreenProps) {
  const queryClient = useQueryClient();
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [selectedWineId, setSelectedWineId] = useState<number | null>(null);

  // Fetch all events
  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['/api/events'],
    queryFn: () => apiRequest('/api/events'),
  });

  // Fetch wines for selected event
  const { data: wines = [], isLoading: winesLoading } = useQuery({
    queryKey: ['/api/wines', selectedEventId],
    queryFn: () => apiRequest(`/api/wines?eventId=${selectedEventId}`),
    enabled: !!selectedEventId,
  });

  // Fetch users
  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
    queryFn: () => apiRequest('/api/users'),
  });

  // Start voting for event
  const startVotingMutation = useMutation({
    mutationFn: () => apiRequest(`/api/events/${selectedEventId}/start-voting`, {
      method: 'PUT',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
    },
  });

  // Start voting for wine
  const startWineVotingMutation = useMutation({
    mutationFn: (wineId: number) => apiRequest(`/api/wines/${wineId}/start-voting`, {
      method: 'PUT',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wines'] });
    },
  });

  // Close voting for wine
  const closeWineVotingMutation = useMutation({
    mutationFn: (wineId: number) => apiRequest(`/api/wines/${wineId}/close-voting`, {
      method: 'PUT',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wines'] });
    },
  });

  // Check if voting is complete for a wine
  const { data: votingComplete } = useQuery({
    queryKey: ['/api/wines', selectedWineId, 'voting-complete'],
    queryFn: () => apiRequest(`/api/wines/${selectedWineId}/voting-complete`),
    enabled: selectedWineId !== null,
  });

  const handleStartVoting = () => {
    startVotingMutation.mutate();
  };

  const handleSelectWine = (wineId: number) => {
    setSelectedWineId(wineId);
    startWineVotingMutation.mutate(wineId);
  };

  const handleCloseWineVoting = (wineId: number) => {
    closeWineVotingMutation.mutate(wineId);
    setSelectedWineId(null);
  };

  const getUserName = (userId: number) => {
    const user = users.find((u: User) => u.id === userId);
    return user?.name || 'Unknown';
  };

  if (eventsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

  const selectedEvent = events.find((e: WineEvent) => e.id === selectedEventId);
  const activeEvents = events.filter((e: WineEvent) => e.status === 'active');

  // Show event selection if no event is selected
  if (!selectedEventId) {
    return (
      <div className="flex-1 p-4 max-w-2xl mx-auto">
        <div className="mb-6">
          <button
            onClick={onBack}
            className="bg-[hsl(229,73%,69%)] hover:bg-[hsl(270,50%,65%)] text-white p-3 rounded-full shadow-lg transition-all mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <h1 className="text-2xl font-bold mb-2">Seleziona Evento</h1>
          <p className="text-muted-foreground">Scegli l'evento per cui gestire le votazioni</p>
        </div>

        <div className="space-y-4">
          {activeEvents.length === 0 ? (
            <div className="glass-effect rounded-xl p-6 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nessun evento attivo trovato</p>
            </div>
          ) : (
            activeEvents.map((event: WineEvent) => (
              <div
                key={event.id}
                className="glass-effect rounded-xl p-6 cursor-pointer hover:bg-gray-50 transition-all"
                onClick={() => setSelectedEventId(event.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{event.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{event.date}</p>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        event.votingStatus === 'registration' ? 'bg-blue-100 text-blue-800' :
                        event.votingStatus === 'voting' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {event.votingStatus === 'registration' ? 'Registrazione' :
                         event.votingStatus === 'voting' ? 'Votazioni' : 'Completato'}
                      </span>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800">
                    Gestisci →
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 max-w-2xl mx-auto">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="bg-[hsl(229,73%,69%)] hover:bg-[hsl(270,50%,65%)] text-white p-3 rounded-full shadow-lg transition-all mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <h1 className="text-2xl font-bold mb-2">Gestione Votazioni</h1>
        <p className="text-muted-foreground">{selectedEvent?.name}</p>
      </div>

      {/* Phase Control */}
      <div className="glass-effect rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Controllo Fasi</h2>
        
        {selectedEvent?.votingStatus === 'registration' && (
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Fase registrazione vini attiva. Avvia le votazioni quando pronti.
            </p>
            <button
              onClick={handleStartVoting}
              disabled={startVotingMutation.isPending}
              className="wine-gradient text-white px-4 py-2 rounded-lg hover:wine-gradient-hover transition-all"
            >
              {startVotingMutation.isPending ? 'Avvio...' : 'Avvia Votazioni'}
            </button>
          </div>
        )}

        {selectedEvent?.votingStatus === 'voting' && (
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Fase votazioni attiva. Seleziona un vino per la degustazione.
            </p>
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Votazioni in corso</span>
            </div>
          </div>
        )}
      </div>

      {/* Wine Selection */}
      {selectedEvent?.votingStatus === 'voting' && (
        <div className="glass-effect rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Selezione Vino</h2>
          
          <div className="space-y-3">
            {wines.map((wine: Wine) => (
              <div
                key={wine.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  wine.votingStatus === 'voting'
                    ? 'border-green-500 bg-green-50'
                    : wine.votingStatus === 'closed'
                    ? 'border-gray-300 bg-gray-50'
                    : 'border-gray-200 hover:border-primary'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">Vino di {getUserName(wine.userId)}</h3>
                    <p className="text-sm text-muted-foreground">
                      {wine.type} • {wine.name}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {wine.votingStatus === 'pending' && (
                      <button
                        onClick={() => handleSelectWine(wine.id)}
                        disabled={selectedWineId !== null}
                        className="flex items-center gap-1 text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 disabled:opacity-50"
                      >
                        <Play className="w-3 h-3" />
                        Seleziona
                      </button>
                    )}
                    
                    {wine.votingStatus === 'voting' && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-green-600 font-medium">In Votazione</span>
                        {votingComplete?.isComplete && (
                          <button
                            onClick={() => handleCloseWineVoting(wine.id)}
                            className="flex items-center gap-1 text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                          >
                            <Square className="w-3 h-3" />
                            Chiudi
                          </button>
                        )}
                      </div>
                    )}
                    
                    {wine.votingStatus === 'closed' && (
                      <span className="text-xs text-gray-500">Completato</span>
                    )}
                  </div>
                </div>
                
                {wine.votingStatus === 'voting' && votingComplete && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Voti: {votingComplete.totalVotes}/{votingComplete.requiredVotes}
                    {votingComplete.isComplete && (
                      <span className="text-green-600 ml-2">✓ Tutti hanno votato</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}