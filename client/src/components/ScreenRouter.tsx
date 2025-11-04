import { Suspense, memo } from 'react';
import { User, WineEvent, Wine, Vote, WineResultDetailed, EventReportData } from '@shared/schema';
import LoadingSkeleton from './LoadingSkeleton';

// Lazy-loaded components for better performance
import {
  AuthScreen,
  AdminScreen,
  EventListScreen,
  AdminEventManagementScreen,
  EventDetailsScreen,
  EventResultsScreen,
  EventReportScreen,
  HistoricEventsScreen,
  PagellaScreen,
  SimpleVotingScreen,
} from './screens.lazy';

export type Screen = 'auth' | 'home' | 'admin' | 'events' | 'adminEvents' | 'eventDetails' | 'eventResults' | 'eventReport' | 'voting' | 'historicEvents' | 'pagella';

export interface ScreenRouterProps {
  // Current state
  currentScreen: Screen;
  currentUser: User | null;
  currentEvent: WineEvent | null;
  
  // Data arrays
  users: User[];
  events: WineEvent[];
  wines: Wine[];
  votes: Vote[];
  results: WineResultDetailed[];
  reportData: EventReportData | null;
  
  // Auth state
  authLoading: boolean;
  authError: string | null;
  userSession: {
    user: User | null;
    isAuthenticated: boolean;
  };
  
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
  handleProtectEvent: (eventId: number, protect: boolean) => void;
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
  reportData,
  authLoading,
  authError,
  userSession,
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
  handleProtectEvent,
  handleActivateVoting,
  handleDeactivateVoting,
  handleCompleteEvent,
  handleViewReport,
  handleUpdateUser,
  handleDeleteUser,
  setShowWineRegistrationModal,
}) => {
  return (
    <Suspense fallback={<LoadingSkeleton showLogo={true} showNavigation={true} />}>
      {renderScreen()}
    </Suspense>
  );

  function renderScreen() {
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
          onGoBack={() => setCurrentScreen('auth')}
          onGoHome={() => setCurrentScreen('auth')}
          onChangeAdminPin={handleShowChangeAdminPin}
        />
      );
    case 'events':
      // Guard: require user authentication for user screens
      if (!userSession.isAuthenticated) {
        setCurrentScreen('auth');
        return null;
      }
      return (
        <EventListScreen
          events={events}
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
          events={events}
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
      // Guard: require user authentication
      if (!userSession.isAuthenticated) {
        setCurrentScreen('auth');
        return null;
      }
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
      // Guard: require user authentication
      if (!userSession.isAuthenticated) {
        setCurrentScreen('auth');
        return null;
      }
      return currentEvent ? (
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
      ) : null;
    case 'eventResults':
      // Guard: require user authentication
      if (!userSession.isAuthenticated) {
        setCurrentScreen('auth');
        return null;
      }
      return currentEvent ? (
        <EventResultsScreen
          event={currentEvent}
          results={results}
          onGoBack={() => setCurrentScreen('events')}
          onGoHome={() => setCurrentScreen('events')}
        />
      ) : null;
    case 'eventReport':
      return (
        <EventReportScreen
          reportData={reportData}
          onGoBack={() => setCurrentScreen('adminEvents')}
          onGoHome={() => setCurrentScreen('events')}
        />
      );
    case 'historicEvents':
      // Guard: require user authentication
      if (!userSession.isAuthenticated) {
        setCurrentScreen('auth');
        return null;
      }
      return (
        <HistoricEventsScreen
          events={events}
          users={users}
          onShowEventResults={handleShowEventResults}
          onShowPagella={handleShowPagella}
          onDeleteEvent={handleDeleteEvent}
          onProtectEvent={handleProtectEvent}
          onGoBack={() => setCurrentScreen('events')}
          onGoHome={() => setCurrentScreen('events')}
        />
      );
    case 'pagella':
      // Guard: require user authentication
      if (!userSession.isAuthenticated) {
        setCurrentScreen('auth');
        return null;
      }
      return currentEvent ? (
        <PagellaScreen
          event={currentEvent}
          currentUser={currentUser}
          onGoBack={() => setCurrentScreen('historicEvents')}
          onGoHome={() => setCurrentScreen('events')}
        />
      ) : null;

    default:
      return null;
    }
  }
};

export default memo(ScreenRouter);
