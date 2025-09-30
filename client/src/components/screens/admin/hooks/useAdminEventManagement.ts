import { useMemo } from 'react';
import { WineEvent, Wine } from '@shared/schema';

interface UseAdminEventManagementProps {
  events: WineEvent[];
  wines: Wine[];
}

export function useAdminEventManagement({ events, wines }: UseAdminEventManagementProps) {
  // Calcola il numero di partecipanti per evento (utenti che hanno registrato vini)
  const getParticipantsCount = (eventId: number) => {
    if (!wines || !Array.isArray(wines)) return 0;
    const eventWines = wines.filter(wine => wine.eventId === eventId);
    const uniqueUsers = new Set(eventWines.map(wine => wine.userId));
    return uniqueUsers.size;
  };

  // Memoized filtered events
  const activeEvents = useMemo(() => 
    events.filter(event => event.status === 'registration' || event.status === 'active'),
    [events]
  );

  const completedEvents = useMemo(() => 
    events.filter(event => event.status === 'completed'),
    [events]
  );

  return {
    getParticipantsCount,
    activeEvents,
    completedEvents,
  };
}
