import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Home, ChevronUp, ChevronDown } from "lucide-react";
import { User, Wine, WineEvent, Vote } from "@shared/schema";

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
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartScore, setDragStartScore] = useState(1);
  const [tempScore, setTempScore] = useState<number | null>(null);


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
      // Vote data submission
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
        // Vote error handled
        throw new Error(errorData.message || 'Failed to vote');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/votes', event.id] });
    },
    onError: (error) => {
      // Vote mutation error handled
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
            <h2 className="text-2xl font-bold text-yellow-400 mb-2">{event.name}</h2>
            <p className="text-sm text-white/80 font-bold">{event.date}</p>
          </div>

          {/* Wine List */}
          <div className="space-y-3">
            {wines
              .sort((a, b) => {
                // Ordine: Bollicina < Bianco < Rosso
                const typeOrder = { 'Bollicina': 1, 'Bianco': 2, 'Rosso': 3 };
                const aOrder = typeOrder[a.type as keyof typeof typeOrder] || 4;
                const bOrder = typeOrder[b.type as keyof typeof typeOrder] || 4;
                
                if (aOrder !== bOrder) {
                  return aOrder - bOrder;
                }
                
                // Stesso tipo: ordina per gradazione crescente
                const aAlcohol = parseFloat(a.alcohol?.toString() || '0');
                const bAlcohol = parseFloat(b.alcohol?.toString() || '0');
                return aAlcohol - bAlcohol;
              })
              .map((wine, index) => {
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
                  onTouchStart={(e) => {
                    if (activeVoteWineId === wine.id && e.touches.length === 1) {
                      e.preventDefault();
                      const currentScore = userVote ? parseFloat(userVote.score.toString()) : 1;
                      setIsDragging(true);
                      setDragStartY(e.touches[0].clientY);
                      setDragStartScore(currentScore);
                      setTempScore(currentScore);
                    }
                  }}
                  onTouchMove={(e) => {
                    if (activeVoteWineId === wine.id && isDragging && e.touches.length === 1) {
                      e.preventDefault();
                      e.stopPropagation();
                      
                      const currentY = e.touches[0].clientY;
                      const deltaY = dragStartY - currentY;
                      
                      // iPhone-style: 20px movement = 0.5 score change
                      const scoreChange = Math.round((deltaY / 20) * 2) / 2; // Round to nearest 0.5
                      const newScore = Math.max(1, Math.min(10, dragStartScore + scoreChange));
                      
                      setTempScore(newScore);
                    }
                  }}
                  onTouchEnd={() => {
                    if (activeVoteWineId === wine.id && isDragging && tempScore !== null) {
                      voteMutation.mutate({ wineId: wine.id, score: tempScore });
                      setIsDragging(false);
                      setTempScore(null);
                    }
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
                        <span>{wine.type || 'Vino'} • {wine.alcohol ? `${wine.alcohol}°` : 'N/A'}</span>
                      </div>
                    </div>

                    {/* Right Side - Vote Controls */}
                    <div className="flex items-center space-x-3">
                      {/* Vote Badge - Moved Left */}
                      <div 
                        className={`px-5 py-2 rounded-full font-bold text-lg text-center min-w-[70px] cursor-pointer select-none transition-all ${
                          activeVoteWineId === wine.id
                            ? 'bg-gradient-to-r from-[#300505] to-[#8d0303] text-white ring-2 ring-[#8d0303] ring-opacity-50' 
                            : userVote 
                            ? 'bg-gradient-to-r from-[#8d0303] to-[#300505] text-white' 
                            : 'bg-gray-400 text-white'
                        } ${isDragging && activeVoteWineId === wine.id ? 'scale-110' : ''}`}
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
                        title={activeVoteWineId === wine.id ? "Attivo - trascina per modificare" : "Clicca per attivare"}
                      >
                        {activeVoteWineId === wine.id && tempScore !== null ? tempScore.toFixed(1) : (userVote ? userVote.score : '1.0')}
                      </div>
                      
                      {/* Drag Indicator - Only show when active */}
                      {activeVoteWineId === wine.id && (
                        <div className="flex flex-col items-center justify-center px-3">
                          <div className="text-[#8d0303] text-xs opacity-60">
                            ⇅
                          </div>
                          <div className="text-[#8d0303] text-xs font-medium">
                            DRAG
                          </div>
                        </div>
                      )}
                    </div>

                  </div>



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