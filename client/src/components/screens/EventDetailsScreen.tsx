import { WineEvent, Wine, Vote, User } from '@shared/schema';
import { useEventLogic } from '../../hooks/useEventLogic';
import EventContainer from './event-details/components/EventContainer';
import WinesGrid from './event-details/components/WinesGrid';
import ProgressBar from './event-details/components/ProgressBar';
import NavButtons from './event-details/components/NavButtons';

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

export default function EventDetailsScreen({
  event,
  wines,
  votes,
  users,
  currentUser,
  onShowWineRegistrationModal,
  onVoteForWine,
  onCompleteEvent,
  onShowResults,
  onParticipateEvent,
  onGoBack,
  onGoHome
}: EventDetailsScreenProps) {
  if (!event || !currentUser) return null;

  // Use optimized event logic hook
  const { 
    eventWines, 
    userHasRegisteredWine, 
    votingIsActive, 
    getUserVoteForWine, 
    getWineContributor,
    getEventProgress 
  } = useEventLogic({ event, wines, votes, users, currentUser });

  const progress = getEventProgress();

  return (
    <div className="flex-1 flex flex-col">
      <EventContainer 
        event={event}
        userHasRegisteredWine={userHasRegisteredWine}
        votingIsActive={votingIsActive}
        onShowWineRegistrationModal={onShowWineRegistrationModal}
        onParticipateEvent={onParticipateEvent}
      />

      {/* Scrollable Content */}
      <div 
        className="overflow-y-auto px-4 pb-4" 
        style={{
          height: 'calc(100dvh - 120px - var(--bottom-nav-total, 88px) - env(safe-area-inset-top, 0px))'
        }}
      >
        <div className="max-w-4xl mx-auto space-y-4">
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
      
      <NavButtons onGoBack={onGoBack} onGoHome={onGoHome} />
    </div>
  );
}
