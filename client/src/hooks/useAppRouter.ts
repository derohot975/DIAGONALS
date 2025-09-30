import { useState, useEffect } from 'react';
import { User } from '@shared/schema';

export type Screen = 'auth' | 'home' | 'admin' | 'events' | 'adminEvents' | 'eventDetails' | 'eventResults' | 'voting' | 'historicEvents' | 'pagella';

export interface AppRouter {
  currentScreen: Screen;
  setCurrentScreen: (screen: Screen) => void;
  showSplash: boolean;
  setShowSplash: (show: boolean) => void;
}

export function useAppRouter(currentUser: User | null): AppRouter {
  const [showSplash, setShowSplash] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>('auth');

  // Force reset to auth when app reloads
  useEffect(() => {
    setCurrentScreen('auth');
  }, []);

  // Auto-navigate to events if user exists and we're on auth
  useEffect(() => {
    if (currentUser && currentScreen === 'auth') {
      setCurrentScreen('events');
    }
  }, [currentUser, currentScreen]);

  return {
    currentScreen,
    setCurrentScreen,
    showSplash,
    setShowSplash,
  };
}
