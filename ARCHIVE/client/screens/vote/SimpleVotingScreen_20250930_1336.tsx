import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Home, Shield } from "@/components/icons";
import { User, Wine, WineEvent, Vote } from "@shared/schema";

import diagoLogo from "@assets/diagologo.png";
import { VoteScrollPicker } from "../VoteScrollPicker";
import AdminPinModal from "../AdminPinModal";

interface SimpleVotingScreenProps {
  event: WineEvent;
  currentUser: User;
  onBack: () => void;
  onHome: () => void;
  onShowAdmin?: () => void;
}

export default function SimpleVotingScreen({
  event,
  currentUser,
  onBack,
  onHome,
  onShowAdmin
}: SimpleVotingScreenProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedWineId, setSelectedWineId] = useState<number | null>(null);
  const [showAdminPinModal, setShowAdminPinModal] = useState(false);
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
          score: Number(score)
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to vote');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/votes', event.id] });
    },
    onError: (error) => {
      toast({
        title: "Errore nel salvare il voto",
        variant: "destructive"
      });
    },
  });

  const getWineContributor = (userId: number) => {
    return users.find(u => u.id === userId)?.name || 'Sconosciuto';
  };

  const formatEventDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const formatted = date.toLocaleDateString('it-IT', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      // Capitalize first letter of month
      return formatted.replace(/(\d+ )([a-z])/, (match, day, firstLetter) => day + firstLetter.toUpperCase());
    } catch {
      return dateString; // Fallback to original string if parsing fails
    }
  };

  const getUserVoteForWine = (wineId: number) => {
    return votes.find(vote => vote.wineId === wineId && vote.userId === currentUser.id);
  };

  const handleVote = (score: number) => {
    if (selectedWineId) {
      voteMutation.mutate({ wineId: selectedWineId, score });
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Fixed Header - Combined */}
      <div className="sticky top-0 z-50 pt-2 pb-4" style={{background: '#300505'}}>
        {/* Navigation Bar */}
        <div className="flex justify-between items-center px-4 pb-6">
          {/* Home Button */}
          <button
            onClick={onHome}
            className="flex items-center justify-center w-10 h-10 rounded-full text-white hover:bg-white hover:bg-opacity-10 transition-all"
            style={{background: 'rgba(255, 255, 255, 0.1)'}}
          >
            <Home size={20} />
          </button>

          {/* Logo */}
          <img 
            src={diagoLogo} 
            alt="DIAGO Logo" 
            className="w-20 h-auto logo-filter drop-shadow-lg" 
          />

          {/* Admin Button */}
          {onShowAdmin && (
            <button
              onClick={() => setShowAdminPinModal(true)}
              className="flex items-center justify-center w-10 h-10 rounded-full text-white hover:bg-white hover:bg-opacity-10 transition-all"
              style={{background: 'rgba(255, 255, 255, 0.1)'}}
            >
              <Shield size={20} />
            </button>
          )}
        </div>
        
        {/* Event Info */}
        <div className="text-center">
          <p className="text-sm text-gray-300 mb-1">{formatEventDate(event.date)}</p>
          <h2 className="event-name-script text-xl font-bold text-yellow-400 whitespace-nowrap overflow-hidden text-ellipsis max-w-sm mx-auto">
            {event.name.charAt(0).toUpperCase() + event.name.slice(1).toLowerCase()}
          </h2>
        </div>
      </div>

      {/* Scrollable Wine List */}
      <div 
        className="overflow-y-auto px-4 py-4" 
        style={{
          height: 'calc(100dvh - 180px - var(--bottom-nav-total, 88px) - env(safe-area-inset-top, 0px))'
        }}
      >
        <div className="max-w-sm mx-auto">
          <div className="space-y-3">
            {wines
              .sort((a, b) => {
                // Ordine: Bollicina < Bianco < Rosso < Altro
                const typeOrder = { 'Bollicina': 1, 'Bianco': 2, 'Rosso': 3, 'Altro': 4 };
                const aOrder = typeOrder[a.type as keyof typeof typeOrder] || 5;
                const bOrder = typeOrder[b.type as keyof typeof typeOrder] || 5;
                
                if (aOrder !== bOrder) {
                  return aOrder - bOrder;
                }
                
                // Stesso tipo: ordina per gradazione crescente
                const aAlcohol = typeof a.alcohol === 'number' ? a.alcohol : parseFloat(a.alcohol || '0');
                const bAlcohol = typeof b.alcohol === 'number' ? b.alcohol : parseFloat(b.alcohol || '0');
                return aAlcohol - bAlcohol;
              })
              .map((wine, index) => {
              const contributor = getWineContributor(wine.userId);
              const userVote = getUserVoteForWine(wine.id);

              return (
                <div 
                  key={wine.id} 
                  className="bg-white rounded-2xl shadow-lg p-3 animate-fade-in"
                >
                  
                  {/* Horizontal Layout */}
                  <div className="flex items-center justify-between">
                    
                    {/* Left Side - Wine Info */}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800 mb-1">
                        <span className="text-[#300505]">{contributor.toUpperCase()}</span>
                      </h3>
                      <div className="flex items-center text-gray-600 text-sm">
                        <span>{wine.type || 'Vino'} • {wine.alcohol ? `${wine.alcohol}°` : 'N/A'}</span>
                      </div>
                    </div>

                    {/* Right Side - Vote Display */}
                    <div className="flex items-center space-x-3">
                      {/* Vote Badge */}
                      <div 
                        className={`px-5 py-2 rounded-full font-bold text-lg text-center min-w-[70px] cursor-pointer transition-all ${
                          userVote 
                            ? 'bg-gradient-to-r from-[#8d0303] to-[#300505] text-white' 
                            : 'bg-gray-400 text-white hover:bg-gray-500'
                        }`}
                        onClick={() => setSelectedWineId(wine.id)}
                        title="Clicca per votare"
                      >
                        {userVote ? userVote.score : '1.0'}
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

      {/* Vote Scroll Picker */}
      <VoteScrollPicker 
        isOpen={!!selectedWineId}
        onClose={() => setSelectedWineId(null)}
        onVote={(score) => {
          if (selectedWineId) {
            voteMutation.mutate({ wineId: selectedWineId, score });
          }
        }}
        currentVote={selectedWineId ? Number(getUserVoteForWine(selectedWineId)?.score) : undefined}
        wineName={selectedWineId ? (() => {
          const wine = wines.find(w => w.id === selectedWineId);
          return wine ? `Vino di ${getWineContributor(wine.userId).toUpperCase()}` : '';
        })() : ''}
      />

      {/* Admin PIN Modal */}
      <AdminPinModal 
        isOpen={showAdminPinModal}
        onClose={() => setShowAdminPinModal(false)}
        onSuccess={() => {
          setShowAdminPinModal(false);
          if (onShowAdmin) {
            onShowAdmin();
          }
        }}
      />

    </div>
  );
}
