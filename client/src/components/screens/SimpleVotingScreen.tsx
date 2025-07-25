import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Home, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [currentWineIndex, setCurrentWineIndex] = useState(0);
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
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          wineId,
          userId: currentUser.id,
          score
        })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/votes', event.id] });
      toast({
        title: "✅ Voto registrato!",
        description: "Il tuo voto è stato salvato con successo."
      });
    },
    onError: () => {
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
    const currentWine = wines[currentWineIndex];
    if (currentWine) {
      voteMutation.mutate({ wineId: currentWine.id, score });
    }
  };

  const handleNextWine = () => {
    if (currentWineIndex < wines.length - 1) {
      setCurrentWineIndex(currentWineIndex + 1);
    }
  };

  const handlePrevWine = () => {
    if (currentWineIndex > 0) {
      setCurrentWineIndex(currentWineIndex - 1);
    }
  };

  const currentWine = wines[currentWineIndex];
  const currentUser_vote = currentWine ? getUserVoteForWine(currentWine.id) : undefined;
  const wineContributor = currentWine ? users.find(u => u.id === currentWine.userId) : undefined;

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

      {/* Main Content */}
      <div className="flex-1 px-4 pb-20">
        <div className="max-w-2xl mx-auto">
          
          {/* Event Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">{event.name}</h2>
            <div className="inline-block bg-green-500 text-white px-4 py-2 rounded-full">
              <span className="font-medium">ATTIVO</span>
            </div>
          </div>

          {/* Wine Navigation */}
          {wines.length > 0 && (
            <div className="glass-effect rounded-2xl shadow-xl p-6 text-center">
              
              {/* Wine Counter */}
              <div className="mb-6">
                <p className="text-gray-600 text-sm mb-2">
                  Vino {currentWineIndex + 1} di {wines.length}
                </p>
                <h3 className="text-xl font-bold text-gray-800">{currentWine?.name}</h3>
                <p className="text-gray-600">Portato da: {getWineContributor(currentWine?.userId || 0)}</p>
              </div>

              {/* Vote Button */}
              <button
                onClick={() => setShowVotingModal(true)}
                className="w-full bg-gradient-to-r from-[#300505] to-[#8d0303] hover:from-[#240404] hover:to-[#a00404] text-white font-bold py-4 px-8 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg mb-6"
              >
                {currentUser_vote ? `VOTO: ${currentUser_vote.score}` : 'VOTA QUESTO VINO'}
              </button>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center">
                <button
                  onClick={handlePrevWine}
                  disabled={currentWineIndex === 0}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    currentWineIndex === 0 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-[#8d0303] text-white hover:bg-[#300505]'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Precedente</span>
                </button>

                <span className="text-gray-600 text-sm">
                  {wines.map((_, index) => (
                    <span
                      key={index}
                      className={`inline-block w-2 h-2 rounded-full mx-1 ${
                        index === currentWineIndex ? 'bg-[#8d0303]' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </span>

                <button
                  onClick={handleNextWine}
                  disabled={currentWineIndex === wines.length - 1}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    currentWineIndex === wines.length - 1 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-[#8d0303] text-white hover:bg-[#300505]'
                  }`}
                >
                  <span>Successivo</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

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
        onClose={() => setShowVotingModal(false)}
        currentWine={currentWine || null}
        wineContributor={wineContributor || null}
        userVote={currentUser_vote}
        onVote={handleVote}
        wineLabel={currentWine?.name || ''}
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