import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './hooks/useAuth';
import { useSession } from './hooks/useSession';
import { useUserMutations } from './hooks/useUserMutations';
import { useEventMutations } from './hooks/useEventMutations';
import { useWineMutations } from './hooks/useWineMutations';
import { useAppRouter } from './hooks/useAppRouter';
import { useAppState } from './hooks/useAppState';
import { useAppNavigation } from './hooks/useAppNavigation';
import { useAppHandlers } from './hooks/useAppHandlers';
import * as userHandlers from './handlers/userHandlers';
import { isLoadingState } from './lib/utils';
import { performanceTelemetry } from './lib/performanceTelemetry';
import AppShell from './components/AppShell';
import AppModals from './components/AppModals';
import ScreenRouter from './components/ScreenRouter';
import LoadingSkeleton from './components/LoadingSkeleton';
import SplashScreen from './components/screens/SplashScreen';
import { SearchOverlayProvider } from './contexts/SearchOverlayContext';

import { User, WineEvent, Wine, Vote, WineResultDetailed } from '@shared/schema';
import { Screen } from './hooks/useAppRouter';

const safeMode = (window as any).__DIAGONALE_SAFE_MODE__ || {};
const ENABLE_APP_SHELL = safeMode.SHELL_ENABLED ?? (import.meta.env.VITE_ENABLE_APP_SHELL !== 'false');
const ENABLE_APP_SHELL_ON_INTRO = safeMode.INTRO_ENABLED ?? (import.meta.env.VITE_ENABLE_APP_SHELL_ON_INTRO === 'true');
const DATA_HEAVY_SCREENS: Screen[] = ['events', 'adminEvents', 'eventDetails', 'eventResults', 'voting', 'historicEvents', 'pagella', 'admin'];

const shouldShowSkeleton = (screen: Screen): boolean =>
  ENABLE_APP_SHELL_ON_INTRO || screen !== 'auth' ? DATA_HEAVY_SCREENS.includes(screen) : false;

interface UserSession { user: User | null; isAuthenticated: boolean; }
interface AdminSession { isAdmin: boolean; }

function App() {
  const [userSession, setUserSession] = useState<UserSession>(() => {
    const saved = sessionStorage.getItem('dg_user_session');
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (p.userId && p.ts && Date.now() - p.ts < 86400000) return { user: null, isAuthenticated: true };
        sessionStorage.removeItem('dg_user_session');
      } catch { sessionStorage.removeItem('dg_user_session'); }
    }
    return { user: null, isAuthenticated: false };
  });

  const [adminSession, setAdminSession] = useState<AdminSession>(() => ({
    isAdmin: sessionStorage.getItem('dg_admin_session') === 'true'
  }));

  const currentUser = userSession.user;
  const setCurrentUser = (user: User | null) => {
    setUserSession({ user, isAuthenticated: !!user });
    if (user) sessionStorage.setItem('dg_user_session', JSON.stringify({ userId: user.id, ts: Date.now() }));
    else sessionStorage.removeItem('dg_user_session');
  };

  const router = useAppRouter(userSession.isAuthenticated);
  const appState = useAppState();
  const navigation = useAppNavigation(router.setCurrentScreen, appState);
  const queryClient = useQueryClient();

  const { sessionError, loginMutation, logoutMutation, handleUserSelect, handleLogout: sessionHandleLogout } =
    useSession(currentUser, setCurrentUser, router.setCurrentScreen);

  const { authLoading, authError, setAuthError, handleLogin, handleRegister } = useAuth();
  const { createUserMutation, updateUserMutation, deleteUserMutation } = useUserMutations();
  const { createWineMutation, updateWineMutation, voteMutation } = useWineMutations();
  const {
    createEventMutation, updateEventMutation, deleteEventMutation, updateEventStatusMutation,
    setCurrentWineMutation, nextWineMutation, stopVotingMutation, completeEventMutation, viewReportMutation,
  } = useEventMutations({
    currentUser,
    selectedEventId: appState.selectedEventId,
    setReportData: appState.setReportData,
    setShowReportModal: appState.setShowReportModal
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({ queryKey: ['/api/users'] });
  const { data: events = [], isLoading: eventsLoading } = useQuery<WineEvent[]>({
    queryKey: ['/api/events'], staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false,
  });
  const { data: wines = [] } = useQuery<Wine[]>({
    queryKey: ['/api/wines'], staleTime: 2 * 60 * 1000, refetchOnWindowFocus: false,
  });
  const { data: votes = [] } = useQuery<Vote[]>({
    queryKey: ['/api/votes?eventId=' + appState.selectedEventId], enabled: !!appState.selectedEventId,
  });
  const { data: results = [] } = useQuery<WineResultDetailed[]>({
    queryKey: ['/api/events/' + appState.selectedEventId + '/results'],
    enabled: !!appState.selectedEventId && router.currentScreen === 'eventResults',
  });

  const handlers = useAppHandlers({
    currentUser, appState, wines, events,
    setCurrentScreen: router.setCurrentScreen,
    setAdminSession: (isAdmin) => {
      setAdminSession({ isAdmin });
      if (!isAdmin) sessionStorage.removeItem('dg_admin_session');
    },
    mutations: {
      createUserMutation, updateUserMutation, deleteUserMutation,
      createWineMutation, updateWineMutation, voteMutation,
      createEventMutation, updateEventMutation, deleteEventMutation,
      updateEventStatusMutation, setCurrentWineMutation, nextWineMutation,
      stopVotingMutation, completeEventMutation, viewReportMutation,
    }
  });

  if (process.env.NODE_ENV === 'development') {
    (window as any).resetProtection = () => {
      localStorage.removeItem('diagonale_protected_events');
      localStorage.removeItem('diagonale_protection_initialized');
      window.location.reload();
    };
  }

  const handleLogout = () => { sessionHandleLogout(); setAuthError(null); };

  const onLogin = async (name: string, pin: string) => {
    const user = await handleLogin(name, pin);
    if (user) { setCurrentUser(user); router.setCurrentScreen('events'); queryClient.invalidateQueries({ queryKey: ['/api/users'] }); }
  };

  const onRegister = async (name: string, pin: string) => {
    const user = await handleRegister(name, pin);
    if (user) { setCurrentUser(user); router.setCurrentScreen('events'); queryClient.invalidateQueries({ queryKey: ['/api/users'] }); }
  };

  const handleAddUser = (name: string, isAdmin: boolean) => {
    userHandlers.addUser({ createUserMutation }, name, isAdmin);
  };

  // La Splash Screen ha la precedenza assoluta per coprire il caricamento iniziale dei dati
  if (router.showSplash) return <SplashScreen onFinish={() => router.setShowSplash(false)} />;

  if (isLoadingState(usersLoading, eventsLoading)) {
    if (ENABLE_APP_SHELL && shouldShowSkeleton(router.currentScreen)) {
      performanceTelemetry.markAppShellReady();
      return <LoadingSkeleton showLogo={true} showNavigation={true} />;
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#300505] to-[#1a0303]">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white/40" />
      </div>
    );
  }

  const currentEvent = appState.selectedEventId
    ? events.find((e: WineEvent) => e.id === appState.selectedEventId) ?? null
    : null;

  return (
    <SearchOverlayProvider>
      <AppShell>
        <ScreenRouter
          currentScreen={router.currentScreen}
          currentUser={currentUser}
          currentEvent={currentEvent}
          users={users}
          events={events}
          wines={wines}
          votes={votes}
          results={results}
          reportData={appState.reportData}
          authLoading={authLoading}
          authError={authError}
          userSession={userSession}
          onLogin={onLogin}
          onRegister={onRegister}
          setCurrentScreen={router.setCurrentScreen}
          handleShowAdmin={navigation.handleShowAdmin}
          handleShowHistoricEvents={navigation.handleShowHistoricEvents}
          handleShowEventDetails={navigation.handleShowEventDetails}
          handleShowEventResults={navigation.handleShowEventResults}
          handleShowWineRegistration={navigation.handleShowWineRegistration}
          handleShowResults={navigation.handleShowResults}
          handleShowPagella={navigation.handleShowPagella}
          handleShowAddUserModal={navigation.handleShowAddUserModal}
          handleShowCreateEventModal={navigation.handleShowCreateEventModal}
          handleShowAdminEvents={navigation.handleShowAdminEvents}
          handleShowChangeAdminPin={navigation.handleShowChangeAdminPin}
          handleShowEditUserModal={navigation.handleShowEditUserModal}
          handleParticipateEvent={handlers.handleParticipateEvent}
          handleVoteForWine={handlers.handleVoteForWine}
          handleEditWine={handlers.handleEditWine}
          handleEditEvent={navigation.handleEditEvent}
          handleDeleteEvent={handlers.handleDeleteEvent}
          handleProtectEvent={handlers.handleProtectEvent}
          handleActivateVoting={handlers.handleActivateVoting}
          handleDeactivateVoting={handlers.handleDeactivateVoting}
          handleCompleteEvent={handlers.handleCompleteEvent}
          handleViewReport={handlers.handleViewReport}
          handleUpdateUser={handlers.handleUpdateUser}
          handleDeleteUser={handlers.handleDeleteUser}
          setShowWineRegistrationModal={appState.setShowWineRegistrationModal}
        />

        <AppModals
          appState={appState}
          currentUser={currentUser}
          currentScreen={router.currentScreen}
          enableAppShell={ENABLE_APP_SHELL}
          onAddUser={handleAddUser}
          onUpdateUser={handlers.handleUpdateUser}
          onCreateEvent={handlers.handleCreateEvent}
          onUpdateEvent={handlers.handleUpdateEvent}
          onRegisterWine={handlers.handleRegisterWine}
          onAdminPinSuccess={handlers.handleAdminPinSuccess}
          onAdminPinClose={handlers.handleAdminPinClose}
          onChangeAdminPin={handlers.handleChangeAdminPin}
        />
      </AppShell>
    </SearchOverlayProvider>
  );
}

export default App;
