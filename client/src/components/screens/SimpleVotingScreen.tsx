import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Home } from "lucide-react";
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

  const handleVote = (wineId: number, score: number) => {
    voteMutation.mutate({ wineId, score });
  };

  // Generate score options from 1 to 10 with 0.5 steps
  const scoreOptions: number[] = [];
  for (let i = 1; i <= 10; i += 0.5) {
    scoreOptions.push(i);
  }

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
        <div className="max-w-2xl mx-auto space-y-4">
          
          {/* Event Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">{event.name}</h2>
            <div className="inline-block bg-green-500 text-white px-4 py-2 rounded-full">
              <span className="font-medium">ATTIVO</span>
            </div>
          </div>

          {/* Wine List */}
          {wines.map((wine, index) => {
            const contributor = getWineContributor(wine.userId);
            const userVote = getUserVoteForWine(wine.id);
            const wineLabel = `Vino di ${contributor}`;

            return (
              <div key={wine.id} className="glass-effect rounded-2xl shadow-xl p-6 animate-fade-in">
                
                {/* Wine Header */}
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-1">{wine.name}</h3>
                  <p className="text-gray-600 font-medium">Portato da: {contributor}</p>
                  {wine.price && (
                    <span className="inline-block bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold mt-2">
                      €{parseFloat(wine.price.toString()).toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Current Vote Status */}
                <div className="text-center mb-4">
                  <span className="text-gray-700 font-medium">Il tuo voto: </span>
                  <span className="text-gray-600">
                    {userVote ? `${userVote.score}` : 'Non votato'}
                  </span>
                </div>

                {/* Voting Grid */}
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {scoreOptions.map((score) => (
                    <button
                      key={score}
                      onClick={() => handleVote(wine.id, score)}
                      disabled={voteMutation.isPending}
                      className={`
                        py-2 px-3 rounded-lg text-sm font-medium transition-all
                        ${userVote && parseFloat(userVote.score.toString()) === score
                          ? 'bg-[#8d0303] text-white shadow-lg transform scale-105' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }
                        ${voteMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      {score % 1 === 0 ? score.toString() : score.toFixed(1)}
                    </button>
                  ))}
                </div>

                {/* Instructions */}
                <p className="text-center text-sm text-gray-500">
                  Voti da 1 a 10 con step 0.5
                </p>

              </div>
            );
          })}

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