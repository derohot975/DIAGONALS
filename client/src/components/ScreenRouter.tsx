import { Suspense, memo, useEffect } from 'react';
import { User, WineEvent, Wine, Vote, WineResultDetailed, EventReportData } from '@shared/schema';
import LoadingSkeleton from './LoadingSkeleton';
import {
  AuthScreen, AdminScreen, EventListScreen, AdminEventManagementScreen,
  EventDetailsScreen, EventResultsScreen, EventReportScreen,
  HistoricEventsScreen, PagellaScreen, SimpleVotingScreen,
} from './screens.lazy';

export type Screen = 'auth' | 'home' | 'admin' | 'events' | 'adminEvents' | 'eventDetails' | 'eventResults' | 'eventReport' | 'voting' | 'historicEvents' | 'pagella';

const PROTECTED_SCREENS: Screen[] = ['events', 'voting', 'eventDetails', 'eventResults', 'historicEvents', 'pagella'];

export interface ScreenRouterProps {
  currentScreen: Screen;
  currentUser: User | null;
  currentEvent: WineEvent | null;
  users: User[];
  events: WineEvent[];
  wines: Wine[];
  votes: Vote[];
  results: WineResultDetailed[];
  reportData: EventReportData | null;
  authLoading: boolean;
  authError: string | null;
  userSession: { user: User | null; isAuthenticated: boolean; };
  onLogin: (name: string, pin: string) => Promise<void>;
  onRegister: (name: string, pin: string) => Promise<void>;
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
  setShowWineRegistrationModal: (show: boolean) => void;
}

const ScreenRouter: React.FC<ScreenRouterProps> = (props) => {
  const { currentScreen, userSession, setCurrentScreen } = props;

  // Fix: use useEffect for auth guards instead of calling setState during render
  const needsAuth = PROTECTED_SCREENS.includes(currentScreen) && !userSession.isAuthenticated;
  useEffect(() => {
    if (needsAuth) {
      setCurrentScreen('auth');
    }
  }, [needsAuth, setCurrentScreen]);

  const renderScreen = () => {
    if (needsAuth) return null;

    switch (currentScreen) {
      case 'auth':
        return <AuthScreen onLogin={props.onLogin} onRegister={props.onRegister} onGoBack={() => setCurrentScreen('auth')} onShowAdmin={props.handleShowAdmin} isLoading={props.authLoading} error={props.authError} />;

      case 'admin':
        return <AdminScreen users={props.users} onShowAddUserModal={props.handleShowAddUserModal} onShowCreateEventModal={props.handleShowCreateEventModal} onShowEventList={props.handleShowAdminEvents} onShowEditUserModal={props.handleShowEditUserModal} onDeleteUser={props.handleDeleteUser} onGoBack={() => setCurrentScreen('auth')} onGoHome={() => setCurrentScreen('auth')} onChangeAdminPin={props.handleShowChangeAdminPin} />;

      case 'events':
        return <EventListScreen events={props.events} users={props.users} currentUser={props.currentUser} wines={props.wines} votes={props.votes} onShowEventDetails={props.handleShowEventDetails} onShowEventResults={props.handleShowEventResults} onShowAdmin={props.handleShowAdmin} onRegisterWine={props.handleShowWineRegistration} onParticipateEvent={props.handleParticipateEvent} onVoteForWine={props.handleVoteForWine} onEditWine={props.handleEditWine} onShowHistoricEvents={props.handleShowHistoricEvents} />;

      case 'adminEvents':
        return <AdminEventManagementScreen events={props.events} users={props.users} wines={props.wines} onGoBack={() => setCurrentScreen('admin')} onEditEvent={props.handleEditEvent} onDeleteEvent={props.handleDeleteEvent} onActivateVoting={props.handleActivateVoting} onDeactivateVoting={props.handleDeactivateVoting} onCompleteEvent={props.handleCompleteEvent} onViewReport={props.handleViewReport} onGoHome={() => setCurrentScreen('events')} onGoBackToAdmin={() => setCurrentScreen('admin')} />;

      case 'voting':
        return props.currentEvent && props.currentUser ? <SimpleVotingScreen event={props.currentEvent} currentUser={props.currentUser} onBack={() => setCurrentScreen('events')} onHome={() => setCurrentScreen('events')} onShowAdmin={() => setCurrentScreen('admin')} /> : null;

      case 'eventDetails':
        return props.currentEvent ? <EventDetailsScreen event={props.currentEvent} wines={props.wines} votes={props.votes} users={props.users} currentUser={props.currentUser} onShowWineRegistrationModal={() => props.setShowWineRegistrationModal(true)} onVoteForWine={props.handleVoteForWine} onCompleteEvent={props.handleCompleteEvent} onShowResults={props.handleShowResults} onParticipateEvent={props.handleParticipateEvent} onGoBack={() => setCurrentScreen('events')} onGoHome={() => setCurrentScreen('events')} /> : null;

      case 'eventResults':
        return props.currentEvent ? <EventResultsScreen event={props.currentEvent} results={props.results} onGoBack={() => setCurrentScreen('events')} onGoHome={() => setCurrentScreen('events')} /> : null;

      case 'eventReport':
        return <EventReportScreen reportData={props.reportData} onGoBack={() => setCurrentScreen('adminEvents')} onGoHome={() => setCurrentScreen('events')} />;

      case 'historicEvents':
        return <HistoricEventsScreen events={props.events} users={props.users} onShowEventResults={props.handleShowEventResults} onShowPagella={props.handleShowPagella} onDeleteEvent={props.handleDeleteEvent} onProtectEvent={props.handleProtectEvent} onGoBack={() => setCurrentScreen('events')} onGoHome={() => setCurrentScreen('events')} />;

      case 'pagella':
        return props.currentEvent ? <PagellaScreen event={props.currentEvent} currentUser={props.currentUser} onGoBack={() => setCurrentScreen('historicEvents')} onGoHome={() => setCurrentScreen('events')} /> : null;

      default: return null;
    }
  };

  return (
    <Suspense fallback={<LoadingSkeleton showLogo={true} showNavigation={true} />}>
      {renderScreen()}
    </Suspense>
  );
};

export default memo(ScreenRouter);
