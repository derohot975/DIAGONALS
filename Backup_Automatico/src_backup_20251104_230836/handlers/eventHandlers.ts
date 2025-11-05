// Event-related handlers - functions that manage event operations
// Batch 2: Navigation handlers with eventId and wine registration

import { User } from '@shared/schema';

type Screen = 'auth' | 'home' | 'admin' | 'events' | 'adminEvents' | 'eventDetails' | 'eventResults' | 'voting' | 'historicEvents' | 'pagella';

interface EventHandlerDependencies {
  setSelectedEventId: (id: number | null) => void;
  setCurrentScreen: (screen: Screen) => void;
  setEditingWine: (wine: any) => void;
  setShowWineRegistrationModal: (show: boolean) => void;
}

export const showEventDetails = (deps: EventHandlerDependencies, eventId: number) => {
  deps.setSelectedEventId(eventId);
  deps.setCurrentScreen('eventDetails');
};

export const showEventResults = (deps: EventHandlerDependencies, eventId: number) => {
  deps.setSelectedEventId(eventId);
  deps.setCurrentScreen('eventResults');
};

export const showResults = (deps: EventHandlerDependencies, eventId: number) => {
  deps.setSelectedEventId(eventId);
  deps.setCurrentScreen('eventResults');
};

export const showPagella = (deps: EventHandlerDependencies, eventId: number) => {
  deps.setSelectedEventId(eventId);
  deps.setCurrentScreen('pagella');
};

export const showWineRegistration = (deps: EventHandlerDependencies, eventId: number) => {
  deps.setEditingWine(null); // Reset editing wine for new registration
  deps.setSelectedEventId(eventId);
  deps.setShowWineRegistrationModal(true);
};
