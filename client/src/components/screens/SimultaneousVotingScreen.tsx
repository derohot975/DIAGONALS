import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Home, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { User, Wine, WineEvent, Vote } from "@shared/schema";
import diagoLogo from "@assets/diagologo.png";

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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch wines for this event
  const { data: wines = [] } = useQuery<Wine[]>({
    queryKey: ["/api/events", event.id, "wines"],
    queryFn: async () => {
      const response = await fetch(`/api/events/${event.id}/wines`);
      return response.json();
    }
  });

  // Fetch existing votes
  const { data: existingVotes = [] } = useQuery<Vote[]>({
    queryKey: ["/api/votes", event.id],
    queryFn: async () => {
      const response = await fetch(`/api/votes?eventId=${event.id}`);
      return response.json();
    }
  });

  // Fetch users to get wine owners
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const response = await fetch("/api/users");
      return response.json();
    }
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
      setVotes(prevVotes => {
        // Only update if votes have actually changed
        const hasChanged = Object.keys(userVotes).some(
          wineId => prevVotes[parseInt(wineId)] !== userVotes[parseInt(wineId)]
        ) || Object.keys(prevVotes).length !== Object.keys(userVotes).length;
        
        return hasChanged ? userVotes : prevVotes;
      });
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
    onSuccess: () => {
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

  const handleScoreChange = (wineId: number, delta: number) => {
    const currentScore = votes[wineId] || 1.0;
    const newScore = Math.max(1.0, Math.min(10.0, currentScore + delta));
    
    setVotes(prev => ({ ...prev, [wineId]: newScore }));
    
    // Auto-save vote
    submitVoteMutation.mutate({
      wineId,
      score: newScore,
    });
  };

  const handleWheelChange = (wineId: number, event: React.WheelEvent) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.5 : 0.5;
    handleScoreChange(wineId, delta);
  };

  const getWineOwner = (userId: number) => {
    return users.find((user: User) => user.id === userId)?.name || "Sconosciuto";
  };

  // Filter wines for this event
  const eventWines = wines.filter((wine: Wine) => wine.eventId === event.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-blue-800 text-white p-4">
      {/* Header */}
      <div className="flex flex-col items-center mb-6">
        <img src={diagoLogo} alt="DIAGONALE" className="w-16 h-16 mb-2 filter brightness-0 invert" />
        <h1 className="text-xl font-bold">DIAGONALE</h1>
        <h2 className="text-lg font-semibold mt-4">{event.name}</h2>
        <div className="bg-white/20 rounded-full px-4 py-2 mt-2">
          <span className="text-sm">{event.date}</span>
        </div>
      </div>

      {/* Voting Section */}
      <div className="bg-white rounded-3xl p-6 mx-auto max-w-md">
        <h3 className="text-center text-lg font-semibold mb-4 text-gray-800">
          Seleziona Vino per Votazione
        </h3>
        
        {selectedWineId && (
          <div className="text-center mb-4 p-2 bg-purple-100 rounded-lg">
            <p className="text-sm text-purple-700 font-medium">
              🔄 Scorri verticalmente sul punteggio per votare
            </p>
          </div>
        )}

        {/* Wine Voting Boxes */}
        <div className="space-y-4">
          {eventWines.map((wine: Wine) => (
            <div
              key={wine.id}
              className={`
                bg-white border-2 rounded-2xl p-4 transition-all duration-200 cursor-pointer
                ${selectedWineId === wine.id ? 'border-purple-400 shadow-lg' : 'border-gray-200 shadow-sm hover:border-gray-300'}
              `}
              onClick={() => setSelectedWineId(wine.id)}
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-gray-800">
                    Vino di {getWineOwner(wine.userId)}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {wine.type} • {wine.year.toString()}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Vote Score Box */}
                  <div
                    className={`
                      bg-purple-500 rounded-full text-center cursor-pointer select-none touch-pan-y transition-all duration-200
                      ${selectedWineId === wine.id 
                        ? 'px-6 py-3 min-w-[100px] scale-110 shadow-xl ring-4 ring-purple-300' 
                        : 'px-4 py-2 min-w-[80px] shadow-lg'
                      }
                    `}
                    onWheel={(e) => handleWheelChange(wine.id, e)}
                    onTouchStart={(e) => {
                      e.stopPropagation();
                      setSelectedWineId(wine.id);
                      const touch = e.touches[0];
                      e.currentTarget.dataset.startY = touch.clientY.toString();
                    }}
                    onTouchMove={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const touch = e.touches[0];
                      const startY = parseFloat(e.currentTarget.dataset.startY || '0');
                      const deltaY = startY - touch.clientY;
                      
                      if (Math.abs(deltaY) > 10) {
                        const delta = deltaY > 0 ? 0.5 : -0.5;
                        handleScoreChange(wine.id, delta);
                        e.currentTarget.dataset.startY = touch.clientY.toString();
                      }
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedWineId(wine.id);
                    }}
                  >
                    <span className={`font-bold text-white ${selectedWineId === wine.id ? 'text-xl' : 'text-lg'}`}>
                      {(votes[wine.id] || 1.0).toFixed(1)}
                    </span>
                  </div>

                  {/* Scroll Icon */}
                  <div
                    className={`
                      flex flex-col items-center justify-center cursor-pointer select-none touch-pan-y transition-all duration-200
                      ${selectedWineId === wine.id 
                        ? 'opacity-100 scale-110' 
                        : 'opacity-60 scale-95'
                      }
                    `}
                    onWheel={(e) => handleWheelChange(wine.id, e)}
                    onTouchStart={(e) => {
                      e.stopPropagation();
                      setSelectedWineId(wine.id);
                      const touch = e.touches[0];
                      e.currentTarget.dataset.startY = touch.clientY.toString();
                    }}
                    onTouchMove={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const touch = e.touches[0];
                      const startY = parseFloat(e.currentTarget.dataset.startY || '0');
                      const deltaY = startY - touch.clientY;
                      
                      if (Math.abs(deltaY) > 10) {
                        const delta = deltaY > 0 ? 0.5 : -0.5;
                        handleScoreChange(wine.id, delta);
                        e.currentTarget.dataset.startY = touch.clientY.toString();
                      }
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedWineId(wine.id);
                    }}
                  >
                    <ChevronUp 
                      size={16} 
                      className="text-purple-500 -mb-1" 
                    />
                    <ChevronDown 
                      size={16} 
                      className="text-purple-500 -mt-1" 
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {eventWines.length === 0 && (
          <div className="text-center py-8">
            <p className="text-white/70">Nessun vino registrato per questo evento</p>
          </div>
        )}
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
    </div>
  );
}