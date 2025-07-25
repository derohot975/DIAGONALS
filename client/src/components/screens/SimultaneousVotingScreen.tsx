import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Home } from "lucide-react";
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
    queryKey: ["/api/events", event.id, "wines"]
  });

  // Fetch existing votes
  const { data: existingVotes = [] } = useQuery<Vote[]>({
    queryKey: ["/api/votes"]
  });

  // Fetch users to get wine owners
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"]
  });

  // Initialize votes from existing data
  useEffect(() => {
    const userVotes: Record<number, number> = {};
    existingVotes
      .filter((vote: Vote) => vote.userId === currentUser.id)
      .forEach((vote: Vote) => {
        userVotes[vote.wineId] = parseFloat(vote.score.toString());
      });
    setVotes(userVotes);
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
      queryClient.invalidateQueries({ queryKey: ["/api/votes"] });
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
      <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 mx-auto max-w-md">
        <h3 className="text-center text-lg font-semibold mb-4">
          Seleziona Vino per Votazione
        </h3>
        
        <div className="text-center mb-6">
          <p className="text-sm text-white/80">
            Partecipanti Registrati: <span className="text-purple-300 font-bold">{eventWines.length}</span>
          </p>
          <p className="text-xs text-white/70 mt-1">
            {eventWines.map((wine: Wine) => getWineOwner(wine.userId)).join(", ")}
          </p>
        </div>

        {/* Wine Voting Boxes */}
        <div className="space-y-4">
          {eventWines.map((wine: Wine) => (
            <div
              key={wine.id}
              className={`
                bg-white/20 rounded-2xl p-4 transition-all duration-200 cursor-pointer
                ${selectedWineId === wine.id ? 'ring-2 ring-purple-300 bg-white/30' : 'hover:bg-white/25'}
              `}
              onClick={() => setSelectedWineId(wine.id)}
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">
                    Vino di {getWineOwner(wine.userId)}
                  </h4>
                  <p className="text-xs text-white/80">
                    {wine.type} • {wine.year.toString()}
                  </p>
                </div>
                
                {/* Vote Score Box */}
                <div
                  className="bg-purple-500 rounded-full px-4 py-2 min-w-[80px] text-center cursor-pointer select-none"
                  onWheel={(e) => handleWheelChange(wine.id, e)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedWineId(wine.id);
                  }}
                >
                  <span className="text-lg font-bold">
                    {(votes[wine.id] || 1.0).toFixed(1)}
                  </span>
                </div>
              </div>
              
              {/* Touch controls for selected wine */}
              {selectedWineId === wine.id && (
                <div className="flex justify-center mt-3 space-x-4">
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleScoreChange(wine.id, -0.5);
                    }}
                  >
                    -0.5
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleScoreChange(wine.id, +0.5);
                    }}
                  >
                    +0.5
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {eventWines.length === 0 && (
          <div className="text-center py-8">
            <p className="text-white/70">Nessun vino registrato per questo evento</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="fixed bottom-6 left-6 right-6 flex justify-between">
        <Button
          onClick={onBack}
          size="lg"
          className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
        >
          <ArrowLeft size={24} />
        </Button>
        
        <Button
          onClick={onHome}
          size="lg"
          className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
        >
          <Home size={24} />
        </Button>
      </div>
    </div>
  );
}