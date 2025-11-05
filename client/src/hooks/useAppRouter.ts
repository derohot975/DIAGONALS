import { useState, useEffect } from 'react';
import { User } from '@shared/schema';

export type Screen = 'auth' | 'home' | 'admin' | 'events' | 'adminEvents' | 'eventDetails' | 'eventResults' | 'eventReport' | 'voting' | 'historicEvents' | 'pagella';

interface UserSession {
  user: User | null;
  isAuthenticated: boolean;
}

export interface AppRouter {
  currentScreen: Screen;
  setCurrentScreen: (screen: Screen) => void;
  showSplash: boolean;
  setShowSplash: (show: boolean) => void;
}

export function useAppRouter(isUserAuthenticated: boolean): AppRouter {
  const [showSplash, setShowSplash] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>('auth');

  // Force reset to auth when app reloads
  useEffect(() => {
    setCurrentScreen('auth');
  }, []);

  // Auto-navigate to events if user is authenticated and we're on auth
  useEffect(() => {
    if (isUserAuthenticated && currentScreen === 'auth') {
      setCurrentScreen('events');
    }
  }, [isUserAuthenticated, currentScreen]);

  return {
    currentScreen,
    setCurrentScreen,
    showSplash,
    setShowSplash,
  };
}
