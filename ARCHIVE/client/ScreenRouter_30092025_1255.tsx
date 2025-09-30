import { User, WineEvent, Wine, Vote, WineResultDetailed, EventReportData } from '@shared/schema';

// Components
import AuthScreen from './screens/AuthScreen';
import AdminScreen from './screens/AdminScreen';
import EventListScreen from './screens/EventListScreen';
import AdminEventManagementScreen from './screens/AdminEventManagementScreen';
import EventDetailsScreen from './screens/EventDetailsScreen';
import EventResultsScreen from './screens/EventResultsScreen';
import HistoricEventsScreen from './screens/HistoricEventsScreen';
import PagellaScreen from './screens/PagellaScreen';
import SimpleVotingScreen from './screens/SimpleVotingScreen';

type Screen = 'auth' | 'home' | 'admin' | 'events' | 'adminEvents' | 'eventDetails' | 'eventResults' | 'voting' | 'historicEvents' | 'pagella';

interface ScreenRouterProps {
  currentScreen: Screen;
  currentUser: User | null;
  currentEvent: WineEvent | null;
  users: User[];
  events: WineEvent[];
  wines: Wine[];
  votes: Vote[];
  results: WineResultDetailed[];
  authLoading: boolean;
  authError: string | null;
  
  // Auth handlers
  onLogin: (name: string, pin: string) => Promise<void>;
  onRegister: (name: string, pin: string) => Promise<void>;
  
  // Navigation handlers
  setCurrentScreen: (screen: Screen) => void;
  handleShowAdmin: () => void;
  handleShowHistoricEvents: () => void;
  handleShowEventDetails: (eventId: number) => void;
  handleShowEventResults: (eventId: number) => void;
  handleShowWineRegistration: (eventId: number) => void;
  handleShowResults: (eventId: number) => void;
  handleShowPagella: (eventId: number) => void;
  handleShowAddUserModal: () => void;
  handleShowCreateEventModal: () => void;
  handleShowAdminEvents: () => void;
  handleShowChangeAdminPin: () => void;
  handleShowEditUserModal: (user: User) => void;
  
  // Event handlers
  handleParticipateEvent: (eventId: number) => void;
  handleVoteForWine: (wineId: number, score: number, hasLode?: boolean) => void;
  handleEditWine: (eventId: number) => void;
  handleEditEvent: (event: WineEvent) => void;
  handleDeleteEvent: (eventId: number) => void;
  handleActivateVoting: (eventId: number) => Promise<void>;
  handleDeactivateVoting: (eventId: number) => Promise<void>;
  handleCompleteEvent: (eventId: number) => void;
  handleViewReport: (eventId: number) => void;
  handleUpdateUser: (id: number, name: string, isAdmin: boolean) => void;
  handleDeleteUser: (userId: number) => void;
  
  // Modal handlers
  setShowWineRegistrationModal: (show: boolean) => void;
}

const ScreenRouter: React.FC<ScreenRouterProps> = ({
  currentScreen,
  currentUser,
  currentEvent,
  users,
  events,
  wines,
  votes,
  results,
  authLoading,
  authError,
  onLogin,
  onRegister,
  setCurrentScreen,
  handleShowAdmin,
  handleShowHistoricEvents,
  handleShowEventDetails,
  handleShowEventResults,
  handleShowWineRegistration,
  handleShowResults,
  handleShowPagella,
  handleShowAddUserModal,
  handleShowCreateEventModal,
  handleShowAdminEvents,
  handleShowChangeAdminPin,
  handleShowEditUserModal,
  handleParticipateEvent,
  handleVoteForWine,
  handleEditWine,
  handleEditEvent,
  handleDeleteEvent,
  handleActivateVoting,
  handleDeactivateVoting,
  handleCompleteEvent,
  handleViewReport,
  handleUpdateUser,
  handleDeleteUser,
  setShowWineRegistrationModal,
}) => {
  switch (currentScreen) {
    case 'auth':
      return (
        <AuthScreen
          onLogin={onLogin}
          onRegister={onRegister}
          onGoBack={() => setCurrentScreen('auth')}
          onShowAdmin={handleShowAdmin}
          isLoading={authLoading}
          error={authError}
        />
      );

    case 'admin':
      return (
        <AdminScreen
          users={users}
          onShowAddUserModal={handleShowAddUserModal}
          onShowCreateEventModal={handleShowCreateEventModal}
          onShowEventList={handleShowAdminEvents}
          onShowEditUserModal={handleShowEditUserModal}
          onDeleteUser={handleDeleteUser}
          onGoBack={() => setCurrentScreen('events')}
          onGoHome={() => setCurrentScreen('events')}
          onChangeAdminPin={handleShowChangeAdminPin}
        />
      );
    case 'events':
      return (
        <EventListScreen
          events={events as WineEvent[]}
          users={users}
          currentUser={currentUser}
          wines={wines}
          votes={votes}
          onShowEventDetails={handleShowEventDetails}
          onShowEventResults={handleShowEventResults}
          onShowAdmin={handleShowAdmin}
          onRegisterWine={handleShowWineRegistration}
          onParticipateEvent={handleParticipateEvent}
          onVoteForWine={handleVoteForWine}
          onEditWine={handleEditWine}
          onShowHistoricEvents={handleShowHistoricEvents}
        />
      );
    case 'adminEvents':
      return (
        <AdminEventManagementScreen
          events={events as WineEvent[]}
          users={users}
          wines={wines}
          onGoBack={() => setCurrentScreen('admin')}
          onEditEvent={handleEditEvent}
          onDeleteEvent={handleDeleteEvent}
          onActivateVoting={handleActivateVoting}
          onDeactivateVoting={handleDeactivateVoting}
          onCompleteEvent={handleCompleteEvent}
          onViewReport={handleViewReport}
          onGoHome={() => setCurrentScreen('events')}
          onGoBackToAdmin={() => setCurrentScreen('admin')}
        />
      );
    case 'voting':
      return currentEvent && currentUser ? (
        <SimpleVotingScreen
          event={currentEvent}
          currentUser={currentUser}
          onBack={() => setCurrentScreen('events')}
          onHome={() => setCurrentScreen('events')}
          onShowAdmin={() => setCurrentScreen('admin')}
        />
      ) : null;
    case 'eventDetails':
      return (
        <EventDetailsScreen
          event={currentEvent}
          wines={wines}
          votes={votes}
          users={users}
          currentUser={currentUser}
          onShowWineRegistrationModal={() => setShowWineRegistrationModal(true)}
          onVoteForWine={handleVoteForWine}
          onCompleteEvent={handleCompleteEvent}
          onShowResults={handleShowResults}
          onParticipateEvent={handleParticipateEvent}
          onGoBack={() => setCurrentScreen('events')}
          onGoHome={() => setCurrentScreen('events')}
        />
      );
    case 'eventResults':
      return (
        <EventResultsScreen
          event={currentEvent}
          results={results}
          onGoBack={() => setCurrentScreen('events')}
          onGoHome={() => setCurrentScreen('events')}
        />
      );
    case 'historicEvents':
      return (
        <HistoricEventsScreen
          events={events as WineEvent[]}
          users={users}
          onShowEventResults={handleShowEventResults}
          onShowPagella={handleShowPagella}
          onGoBack={() => setCurrentScreen('events')}
          onGoHome={() => setCurrentScreen('events')}
        />
      );
    case 'pagella':
      return (
        <PagellaScreen
          event={currentEvent}
          currentUser={currentUser}
          onGoBack={() => setCurrentScreen('historicEvents')}
          onGoHome={() => setCurrentScreen('events')}
        />
      );

    default:
      return null;
  }
};

export default ScreenRouter;
