import { useMemo, useCallback } from 'react';
import { WineEvent, Wine, Vote, User } from '@shared/schema';

interface UseEventLogicProps {
  event: WineEvent | null;
  wines: Wine[];
  votes: Vote[];
  users: User[];
  currentUser: User | null;
}

export const useEventLogic = ({ event, wines, votes, users, currentUser }: UseEventLogicProps) => {
  // Memoized calculations to prevent unnecessary re-renders
  const eventWines = useMemo(() => 
    wines.filter(wine => wine.eventId === event?.id),
    [wines, event?.id]
  );

  const userHasRegisteredWine = useMemo(() => 
    currentUser ? eventWines.some(wine => wine.userId === currentUser.id) : false,
    [eventWines, currentUser?.id]
  );

  const votingIsActive = useMemo(() => 
    event?.votingStatus === 'active',
    [event?.votingStatus]
  );

  // Memoized helper functions
  const getUserVoteForWine = useCallback((wineId: number) => {
    if (!currentUser) return undefined;
    return votes.find(vote => vote.wineId === wineId && vote.userId === currentUser.id);
  }, [votes, currentUser?.id]);

  const getWineContributor = useCallback((userId: number) => {
    return users.find(u => u.id === userId)?.name || 'Unknown';
  }, [users]);

  const getEventProgress = useCallback(() => {
    if (eventWines.length === 0) return 0;
    const totalPossibleVotes = eventWines.length * users.length;
    const actualVotes = votes.filter(vote => 
      eventWines.some(wine => wine.id === vote.wineId)
    ).length;
    return Math.round((actualVotes / totalPossibleVotes) * 100);
  }, [eventWines, users, votes]);

  return {
    eventWines,
    userHasRegisteredWine,
    votingIsActive,
    getUserVoteForWine,
    getWineContributor,
    getEventProgress
  };
};