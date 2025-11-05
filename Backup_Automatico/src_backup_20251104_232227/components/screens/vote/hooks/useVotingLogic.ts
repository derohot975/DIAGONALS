import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useMemo } from "react";
import { User, Wine, WineEvent, Vote } from "@shared/schema";

interface UseVotingLogicProps {
  event: WineEvent;
  currentUser: User;
}

export function useVotingLogic({ event, currentUser }: UseVotingLogicProps) {
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

  const getUserVoteForWine = (wineId: number) => {
    return votes.find(vote => vote.wineId === wineId && vote.userId === currentUser.id);
  };

  const getWineContributor = (userId: number) => {
    return users.find(u => u.id === userId)?.name || 'Sconosciuto';
  };

  // Ordinamento dinamico wines: Bollicine → Bianchi → Rossi → Varie → gradazione crescente → anno crescente
  const sortedWines = useMemo(() => {
    const typeOrder = { 'Bollicina': 0, 'Bianco': 1, 'Rosso': 2, 'Altro': 3 };
    
    return [...wines].sort((a, b) => {
      // 1. Tipologia
      const typeA = typeOrder[a.type as keyof typeof typeOrder] ?? 99;
      const typeB = typeOrder[b.type as keyof typeof typeOrder] ?? 99;
      if (typeA !== typeB) return typeA - typeB;
      
      // 2. Gradazione alcolica (crescente, noti prima di ignoti)
      const alcoholA = typeof a.alcohol === 'number' ? a.alcohol : 999;
      const alcoholB = typeof b.alcohol === 'number' ? b.alcohol : 999;
      if (alcoholA !== alcoholB) return alcoholA - alcoholB;
      
      // 3. Anno (crescente, noti prima di ignoti)
      const yearA = a.year ?? 9999;
      const yearB = b.year ?? 9999;
      if (yearA !== yearB) return yearA - yearB;
      
      // 4. Fallback: ID per stabilità
      return a.id - b.id;
    });
  }, [wines]);

  return {
    wines: sortedWines,
    users,
    votes,
    voteMutation,
    getUserVoteForWine,
    getWineContributor,
  };
}
