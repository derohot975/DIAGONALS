import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Home, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { User, Wine, WineEvent, Vote } from "@shared/schema";
import diagoLogo from "@assets/diagologo.png";
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface VotingScreenProps {
  event: WineEvent;
  currentUser: User;
  onBack: () => void;
  onHome: () => void;
}

interface VoteData {
  wineId: number;
  score: number;
}

export default function SimultaneousVotingScreen({ event, currentUser, onBack, onHome }: VotingScreenProps) {
  const [selectedWineId, setSelectedWineId] = useState<number | null>(null);
  const [votes, setVotes] = useState<Record<number, number>>({});
  const [tempScore, setTempScore] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartScore, setDragStartScore] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch wines for this event
  const { data: wines = [] } = useQuery<Wine[]>({
    queryKey: ["/api/events", event.id, "wines"],
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });

  // Fetch existing votes
  const { data: existingVotes = [] } = useQuery<Vote[]>({
    queryKey: ["/api/votes", event.id],
    staleTime: 30 * 1000, // Cache for 30 seconds during voting
  });

  // Fetch users to get wine owners
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Initialize votes from existing data
  useEffect(() => {
    if (existingVotes && existingVotes.length >= 0) {
      const userVotes: Record<number, number> = {};
      existingVotes
        .filter((vote: Vote) => vote.userId === currentUser.id)
        .forEach((vote: Vote) => {
          userVotes[vote.wineId] = parseFloat(vote.score.toString());
        });
      setVotes(userVotes);
    }
  }, [existingVotes, currentUser.id]);

  // Submit vote mutation
  const submitVoteMutation = useMutation({
    mutationFn: async (voteData: VoteData) => {
      return fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          wineId: voteData.wineId,
          userId: currentUser.id,
          score: voteData.score.toString(),
        }),
      }).then(res => res.json());
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/votes", event.id] });
      toast({
        title: "Voto salvato!",
        description: "Il tuo voto è stato registrato con successo.",
      });
    },
    onError: (error: any) => {
      console.error("Vote submission error:", error);
      toast({
        title: "Errore",
        description: "Impossibile salvare il voto. Riprova.",
        variant: "destructive",
      });
    },
  });

  const handleVote = (wineId: number, score: number) => {
    setVotes(prev => ({ ...prev, [wineId]: score }));
    submitVoteMutation.mutate({
      wineId,
      score: score,
    });
  };

  const getUserVoteForWine = (wineId: number) => {
    return existingVotes.find(vote => vote.wineId === wineId && vote.userId === currentUser.id);
  };

  const handleWheelChange = (wineId: number, event: React.WheelEvent) => {
    event.preventDefault();
    const currentScore = votes[wineId] || 1.0;
    const delta = event.deltaY > 0 ? -0.5 : 0.5;
    const newScore = Math.max(1.0, Math.min(10.0, currentScore + delta));
    handleVote(wineId, newScore);
  };

  const getWineOwner = (userId: number) => {
    return users.find((user: User) => user.id === userId)?.name || "Sconosciuto";
  };

  const formatEventDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const formatted = format(date, 'd MMMM yyyy', { locale: it });
      // Capitalize first letter of month
      return formatted.replace(/(\d+ )([a-z])/, (match, day, firstLetter) => day + firstLetter.toUpperCase());
    } catch {
      return dateString; // Fallback to original string if parsing fails
    }
  };

  // Filter and sort wines for this event
  const eventWines = wines
    .filter((wine: Wine) => wine.eventId === event.id)
    .sort((a, b) => {
      // Ordine: Bollicina < Bianco < Rosso < Altro
      const typeOrder = { 'Bollicina': 1, 'Bianco': 2, 'Rosso': 3, 'Altro': 4 };
      const aOrder = typeOrder[a.type as keyof typeof typeOrder] || 5;
      const bOrder = typeOrder[b.type as keyof typeof typeOrder] || 5;
      
      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }
      
      // Stesso tipo: ordina per gradazione crescente
      const aAlcohol = parseFloat(a.alcohol?.toString() || '0');
      const bAlcohol = parseFloat(b.alcohol?.toString() || '0');
      return aAlcohol - bAlcohol;
    });

  return (
    <>
      <div className="flex-1 flex flex-col bg-gradient-to-br from-purple-600 via-purple-700 to-blue-800 text-white">
        {/* Header */}
        <div className="flex-shrink-0 flex flex-col items-center pt-8 pb-6">
          <img src={diagoLogo} alt="DIAGONALE" className="w-16 h-16 mb-2 filter brightness-0 invert" />
          <h1 className="text-xl font-bold">DIAGONALE</h1>
          <h2 className="text-lg font-semibold mt-4 text-yellow-400">{event.name}</h2>
          <p className="text-sm text-white mt-1 font-bold">{formatEventDate(event.date)}</p>
        </div>

        {/* Content Section */}
        <div className="px-4 pb-24">
          <div className="mx-auto max-w-md">
            {/* Title Section */}
            <div className="mb-4">
              <div className="bg-white rounded-3xl p-6">
                <h3 className="text-center text-lg font-semibold text-gray-800">
                  Seleziona Vino per Votazione
                </h3>
              </div>
            </div>

            {/* Scrollable Wine List Container */}
            <div className="max-h-96 overflow-y-auto space-y-4">
              {eventWines.map((wine: Wine) => (
              <div
                key={wine.id}
                className={`
                  bg-white border-2 rounded-2xl p-4 transition-all duration-200 cursor-pointer
                  ${selectedWineId === wine.id ? 'border-[#8d0303] shadow-lg' : 'border-gray-200 shadow-sm hover:border-gray-300'}
                `}
                onClick={() => setSelectedWineId(wine.id)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-gray-800">
                      Vino di <span className="text-[#300505]">{getWineOwner(wine.userId)}</span>
                    </h4>
                    <p className="text-xs text-gray-600">
                      {wine.type} • {wine.alcohol ? `${wine.alcohol}°` : 'N/A'}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {/* Vote Score Box */}
                    <div
                      className={`
                        bg-[#8d0303] rounded-full text-center cursor-pointer select-none transition-all duration-200
                        ${selectedWineId === wine.id 
                          ? 'px-6 py-3 min-w-[100px] scale-110 shadow-xl ring-4 ring-red-300' 
                          : 'px-4 py-2 min-w-[80px] shadow-lg'
                        }
                      `}
                      onWheel={(e) => handleWheelChange(wine.id, e)}
                      onTouchStart={(e) => {
                        if (selectedWineId === wine.id && e.touches.length === 1) {
                          e.preventDefault();
                          const currentScore = votes[wine.id] || 1;
                          setIsDragging(true);
                          setDragStartY(e.touches[0].clientY);
                          setDragStartScore(currentScore);
                          setTempScore(currentScore);
                        }
                      }}
                      onTouchMove={(e) => {
                        if (selectedWineId === wine.id && isDragging && e.touches.length === 1) {
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
                        if (selectedWineId === wine.id && isDragging && tempScore !== null) {
                          handleVote(wine.id, tempScore);
                          setIsDragging(false);
                          setTempScore(null);
                        }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedWineId(wine.id);
                      }}
                    >
                      <span className={`font-bold text-white ${selectedWineId === wine.id ? 'text-xl' : 'text-lg'}`}>
                        {selectedWineId === wine.id && isDragging && tempScore !== null 
                          ? tempScore.toFixed(1) 
                          : (votes[wine.id] || 1.0).toFixed(1)}
                      </span>
                    </div>

                    {/* Scroll Icon */}
                    <div
                      className={`
                        flex flex-col items-center justify-center cursor-pointer select-none transition-all duration-200 p-2 rounded-lg min-w-[48px] min-h-[48px]
                        ${selectedWineId === wine.id 
                          ? 'opacity-100 scale-110 bg-red-100' 
                          : 'opacity-60 scale-95 bg-gray-100'
                        }
                      `}
                      onWheel={(e) => handleWheelChange(wine.id, e)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedWineId(wine.id);
                      }}
                    >
                      <ChevronUp 
                        size={16} 
                        className="text-[#300505] -mb-1" 
                      />
                      <ChevronDown 
                        size={16} 
                        className="text-[#300505] -mt-1" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {eventWines.length === 0 && (
            <div className="bg-white rounded-3xl p-6 text-center">
              <p className="text-gray-600">Nessun vino registrato per questo evento</p>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Navigation Buttons */}
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={onBack}
        className="w-12 h-12 bg-[hsl(229,73%,69%)] hover:bg-[hsl(229,73%,60%)] text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
      >
        <ArrowLeft size={20} />
      </button>
    </div>
    
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={onHome}
        className="w-12 h-12 bg-[hsl(229,73%,69%)] hover:bg-[hsl(229,73%,60%)] text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
      >
        <Home size={20} />
      </button>
    </div>
    </>
  );
}