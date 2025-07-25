import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Home } from "lucide-react";
import { User, Wine, WineEvent, Vote } from "@shared/schema";
import { VotingModal } from "@/components/VotingModal";
import diagoLogo from "@assets/diagologo.png";

interface SimpleVotingScreenProps {
  event: WineEvent;
  currentUser: User;
  onBack: () => void;
  onHome: () => void;
}

export default function SimpleVotingScreen({
  event,
  currentUser,
  onBack,
  onHome
}: SimpleVotingScreenProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedWineId, setSelectedWineId] = useState<number | null>(null);
  const [activeVoteWineId, setActiveVoteWineId] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [showVotingModal, setShowVotingModal] = useState(false);

  // Fetch wines for this event
  const { data: wines = [] } = useQuery<Wine[]>({
    queryKey: ['/api/wines', event.id],
    queryFn: async () => {
      const response = await fetch(`/api/wines?eventId=${event.id}`);
      return response.json();
    },
  });

  // Fetch users to get wine contributors
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  // Fetch votes for this event
  const { data: votes = [] } = useQuery<Vote[]>({
    queryKey: ['/api/votes', event.id],
    queryFn: async () => {
      const response = await fetch(`/api/votes?eventId=${event.id}`);
      return response.json();
    },
  });

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async ({ wineId, score }: { wineId: number; score: number }) => {
      console.log('Sending vote data:', { eventId: event.id, wineId, userId: currentUser.id, score });
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          wineId,
          userId: currentUser.id,
          score: Number(score) // Ensure it's sent as number
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Vote error:', errorData);
        throw new Error(errorData.message || 'Failed to vote');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/votes', event.id] });
    },
    onError: (error) => {
      console.error('Vote mutation error:', error);
      toast({
        title: "Errore nel salvare il voto",
        variant: "destructive"
      });
    },
  });

  const getWineContributor = (userId: number) => {
    return users.find(u => u.id === userId)?.name || 'Sconosciuto';
  };

  const getUserVoteForWine = (wineId: number) => {
    return votes.find(vote => vote.wineId === wineId && vote.userId === currentUser.id);
  };

  const handleVote = (score: number) => {
    if (selectedWineId) {
      voteMutation.mutate({ wineId: selectedWineId, score });
    }
  };

  const handleOpenVotingModal = (wineId: number) => {
    setSelectedWineId(wineId);
    setShowVotingModal(true);
  };

  const selectedWine = wines.find(w => w.id === selectedWineId);
  const selectedWineVote = selectedWine ? getUserVoteForWine(selectedWine.id) : undefined;
  const selectedWineContributor = selectedWine ? users.find(u => u.id === selectedWine.userId) : undefined;

  return (
    <div className="flex-1 flex flex-col">
      {/* Logo Header */}
      <div className="flex-shrink-0 flex justify-center pt-8 pb-6">
        <img 
          src={diagoLogo} 
          alt="DIAGO Logo" 
          className="mx-auto mb-2 w-24 h-auto logo-filter drop-shadow-lg" 
        />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-20">
        <div className="max-w-2xl mx-auto">
          
          {/* Event Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">{event.name}</h2>
            <div className="inline-block bg-green-500 text-white px-4 py-2 rounded-full">
              <span className="font-medium">ATTIVO</span>
            </div>
          </div>

          {/* Wine List */}
          <div className="space-y-3">
            {wines.map((wine, index) => {
              const contributor = getWineContributor(wine.userId);
              const userVote = getUserVoteForWine(wine.id);

              return (
                <div 
                  key={wine.id} 
                  className={`bg-white rounded-2xl shadow-lg p-4 animate-fade-in ${
                    activeVoteWineId === wine.id ? 'touch-none' : ''
                  }`}
                  style={{
                    touchAction: activeVoteWineId === wine.id ? 'none' : 'auto',
                    overscrollBehavior: activeVoteWineId === wine.id ? 'none' : 'auto'
                  }}
                  onWheel={(e) => {
                    // Only handle scroll if this wine is active for voting
                    if (activeVoteWineId === wine.id) {
                      e.preventDefault();
                      e.stopPropagation();
                      const currentScore = userVote ? parseFloat(userVote.score.toString()) : 1;
                      let newScore;
                      
                      if (e.deltaY < 0) {
                        // Scroll up - increase score
                        newScore = Math.min(currentScore + 0.5, 10);
                      } else {
                        // Scroll down - decrease score  
                        newScore = Math.max(currentScore - 0.5, 1);
                      }
                      
                      if (newScore !== currentScore) {
                        voteMutation.mutate({ wineId: wine.id, score: newScore });
                      }
                    }
                  }}
                  onTouchStart={(e) => {
                    if (activeVoteWineId === wine.id && e.touches.length === 1) {
                      e.preventDefault();
                      setTouchStartY(e.touches[0].clientY);
                    }
                  }}
                  onTouchMove={(e) => {
                    if (activeVoteWineId === wine.id && e.touches.length === 1 && touchStartY !== null) {
                      e.preventDefault();
                      e.stopPropagation();
                      
                      const currentY = e.touches[0].clientY;
                      const deltaY = touchStartY - currentY;
                      const threshold = 30; // Minimum pixels to trigger vote change
                      
                      if (Math.abs(deltaY) > threshold) {
                        const currentScore = userVote ? parseFloat(userVote.score.toString()) : 1;
                        let newScore;
                        
                        if (deltaY > 0) {
                          // Swipe up - increase score
                          newScore = Math.min(currentScore + 0.5, 10);
                        } else {
                          // Swipe down - decrease score
                          newScore = Math.max(currentScore - 0.5, 1);
                        }
                        
                        if (newScore !== currentScore) {
                          voteMutation.mutate({ wineId: wine.id, score: newScore });
                          setTouchStartY(currentY); // Reset for continuous scrolling
                        }
                      }
                    }
                  }}
                  onTouchEnd={() => {
                    setTouchStartY(null);
                  }}
                >
                  
                  {/* Horizontal Layout */}
                  <div className="flex items-center justify-between">
                    
                    {/* Left Side - Wine Info */}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800 mb-1">
                        Vino di {contributor}
                      </h3>
                      <div className="flex items-center text-gray-600 text-sm">
                        <span>{wine.type || 'Vino'}</span>
                        {wine.year && (
                          <>
                            <span className="mx-2">•</span>
                            <span>{wine.year}</span>
                          </>
                        )}
                        {wine.price && (
                          <>
                            <span className="mx-2">•</span>
                            <span>€{parseFloat(wine.price.toString()).toFixed(2)}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Right Side - Vote Badge */}
                    <div className="flex items-center">
                      {/* Vote Badge - Click to Activate */}
                      <div 
                        className={`px-6 py-3 rounded-full font-bold text-lg text-center min-w-[80px] cursor-pointer select-none transition-all ${
                          activeVoteWineId === wine.id
                            ? 'bg-gradient-to-r from-[#300505] to-[#8d0303] text-white ring-2 ring-[#8d0303] ring-opacity-50' 
                            : userVote 
                            ? 'bg-gradient-to-r from-[#8d0303] to-[#300505] text-white' 
                            : 'bg-gray-400 text-white'
                        }`}
                        onClick={() => {
                          if (activeVoteWineId === wine.id) {
                            // Deactivate if already active
                            setActiveVoteWineId(null);
                          } else {
                            // Activate this wine for voting
                            setActiveVoteWineId(wine.id);
                            // Initialize vote if none exists
                            if (!userVote) {
                              voteMutation.mutate({ wineId: wine.id, score: 1 });
                            }
                          }
                        }}
                        title={activeVoteWineId === wine.id ? "Scroll per modificare il voto" : "Clicca per attivare la modifica"}
                      >
                        {userVote ? userVote.score : '1.0'}
                      </div>
                    </div>

                  </div>

                  {/* Active Vote Indicator */}
                  {activeVoteWineId === wine.id && (
                    <div className="mt-3 text-center">
                      <p className="text-[#8d0303] text-sm font-medium">
                        ⇅ Scroll per modificare il voto (1.0 - 10.0)
                      </p>
                    </div>
                  )}

                </div>
              );
            })}
          </div>

          {/* No wines message */}
          {wines.length === 0 && (
            <div className="text-center py-8">
              <p className="text-white text-lg">Nessun vino registrato per questo evento</p>
            </div>
          )}

        </div>
      </div>

      {/* Voting Modal */}
      <VotingModal
        isOpen={showVotingModal}
        onClose={() => {
          setShowVotingModal(false);
          setSelectedWineId(null);
        }}
        currentWine={selectedWine || null}
        wineContributor={selectedWineContributor || null}
        userVote={selectedWineVote}
        onVote={handleVote}
        wineLabel={selectedWine?.name || ''}
      />

      {/* Fixed Navigation Buttons */}
      <div className="fixed bottom-4 left-4 z-50">
        <button
          onClick={onBack}
          className="bg-[hsl(229,73%,69%)] hover:bg-[hsl(270,50%,65%)] text-white p-3 rounded-full shadow-lg transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>
      
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={onHome}
          className="bg-[hsl(229,73%,69%)] hover:bg-[hsl(270,50%,65%)] text-white p-3 rounded-full shadow-lg transition-all"
        >
          <Home className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}