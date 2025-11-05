import { useQuery } from '@tanstack/react-query';
import { User, WineEvent, Wine, Vote, WineResultDetailed } from '@shared/schema';

export const useOptimizedQueries = (selectedEventId?: number | null, currentScreen?: string) => {
  // Users query with longer cache time
  const usersQuery = useQuery<User[]>({
    queryKey: ['/api/users'],
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    refetchOnWindowFocus: false,
  });

  // Events query with optimized caching
  const eventsQuery = useQuery<WineEvent[]>({
    queryKey: ['/api/events'],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });

  // Wines query with conditional loading
  const winesQuery = useQuery<Wine[]>({
    queryKey: ['/api/wines'],
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
    refetchOnWindowFocus: false,
  });

  // Votes query - only when needed
  const votesQuery = useQuery<Vote[]>({
    queryKey: ['/api/votes?eventId=' + selectedEventId],
    enabled: !!selectedEventId,
    staleTime: 30 * 1000, // Cache for 30 seconds during voting
  });

  // Results query - only for results screen
  const resultsQuery = useQuery<WineResultDetailed[]>({
    queryKey: ['/api/events/' + selectedEventId + '/results'],
    enabled: !!selectedEventId && currentScreen === 'eventResults',
    staleTime: 60 * 1000, // Cache for 1 minute
  });

  return {
    users: usersQuery.data || [],
    events: eventsQuery.data || [],
    wines: winesQuery.data || [],
    votes: votesQuery.data || [],
    results: resultsQuery.data || [],
    isLoading: {
      users: usersQuery.isLoading,
      events: eventsQuery.isLoading,
      wines: winesQuery.isLoading,
      votes: votesQuery.isLoading,
      results: resultsQuery.isLoading,
    },
    refetch: {
      events: eventsQuery.refetch,
    }
  };
};