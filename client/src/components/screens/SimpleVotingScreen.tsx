import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Home, ChevronUp, ChevronDown } from "lucide-react";
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
                <div key={wine.id} className="bg-white rounded-2xl shadow-lg p-4 animate-fade-in">
                  
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

                    {/* Right Side - Vote Badge and Controls */}
                    <div className="flex items-center space-x-3">
                      {/* Vote Badge - Always Present */}
                      <div className={`px-4 py-2 rounded-full font-bold min-w-[60px] text-center ${
                        userVote 
                          ? 'bg-gradient-to-r from-[#8d0303] to-[#300505] text-white' 
                          : 'bg-gray-300 text-gray-600'
                      }`}>
                        {userVote ? userVote.score : '--'}
                      </div>
                      
                      {/* Vote Controls - Always Present */}
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() => {
                            const currentScore = userVote ? parseFloat(userVote.score.toString()) : 1;
                            const newScore = userVote ? (currentScore < 10 ? currentScore + 0.5 : currentScore) : 1;
                            voteMutation.mutate({ wineId: wine.id, score: newScore });
                          }}
                          disabled={userVote && parseFloat(userVote.score.toString()) >= 10 || voteMutation.isPending}
                          className="text-[#8d0303] hover:text-[#300505] disabled:text-gray-300 transition-colors"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            const currentScore = userVote ? parseFloat(userVote.score.toString()) : 1;
                            const newScore = userVote ? (currentScore > 1 ? currentScore - 0.5 : currentScore) : 1;
                            if (userVote) {
                              voteMutation.mutate({ wineId: wine.id, score: newScore });
                            }
                          }}
                          disabled={!userVote || parseFloat(userVote.score.toString()) <= 1 || voteMutation.isPending}
                          className="text-[#8d0303] hover:text-[#300505] disabled:text-gray-300 transition-colors"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
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