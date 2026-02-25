import { ArrowLeft, Home } from '@/components/icons';
import { WineEvent, Wine, Vote, User } from '@shared/schema';
import { useEventLogic } from '@/hooks/useEventLogic';
import EventContainer from './event-details/components/EventContainer';
import WinesGrid from './event-details/components/WinesGrid';
import ProgressBar from './event-details/components/ProgressBar';
import BottomNavBar from '../navigation/BottomNavBar';

interface EventDetailsScreenProps {
  event: WineEvent | null;
  wines: Wine[];
  votes: Vote[];
  users: User[];
  currentUser: User | null;
  onShowWineRegistrationModal: () => void;
  onVoteForWine: (wineId: number, score: number, hasLode: boolean) => void;
  onCompleteEvent: (eventId: number) => void;
  onShowResults: (eventId: number) => void;
  onParticipateEvent: (eventId: number) => void;
  onGoBack?: () => void;
  onGoHome?: () => void;
}

export default function EventDetailsScreen({ event, wines, votes, users, currentUser, onShowWineRegistrationModal, onVoteForWine, onCompleteEvent, onShowResults, onParticipateEvent, onGoBack, onGoHome }: EventDetailsScreenProps) {
  if (!event || !currentUser) return null;

  const { eventWines, userHasRegisteredWine, votingIsActive, getUserVoteForWine, getWineContributor, getEventProgress } = useEventLogic({ event, wines, votes, users, currentUser });
  const progress = getEventProgress();

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-[#300505] to-[#1a0303]">
      <EventContainer
        event={event}
        userHasRegisteredWine={userHasRegisteredWine}
        votingIsActive={votingIsActive}
        onShowWineRegistrationModal={onShowWineRegistrationModal}
        onParticipateEvent={onParticipateEvent}
      />

      <div
        className="overflow-y-auto px-6 scrollbar-hide"
        style={{ height: 'calc(100dvh - 260px - var(--bottom-nav-total, 56px) - env(safe-area-inset-top, 0px))' }}
      >
        <div className="max-w-md mx-auto space-y-4">
          <WinesGrid
            eventWines={eventWines}
            getUserVoteForWine={getUserVoteForWine}
            getWineContributor={getWineContributor}
            onVoteForWine={onVoteForWine}
          />
          {eventWines.length > 0 && (
            <ProgressBar
              event={event}
              progress={progress}
              onShowResults={onShowResults}
              onCompleteEvent={onCompleteEvent}
            />
          )}
        </div>
      </div>

      <BottomNavBar
        layout="center"
        centerButtons={[
          ...(onGoBack ? [{ id: 'back', icon: <ArrowLeft className="w-6 h-6" />, onClick: onGoBack, title: 'Indietro', variant: 'glass' as const }] : []),
          ...(onGoHome ? [{ id: 'home', icon: <Home className="w-6 h-6" />, onClick: onGoHome, title: 'Home', variant: 'glass' as const }] : []),
        ]}
      />
    </div>
  );
}
