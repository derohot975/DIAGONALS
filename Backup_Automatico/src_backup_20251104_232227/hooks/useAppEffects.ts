import { useEffect } from 'react';
import { User } from '@shared/schema';
import { Screen } from './useAppRouter';
import { performanceTelemetry } from '../lib/performanceTelemetry';
import { useToast } from './use-toast';

export interface AppEffectsConfig {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  setCurrentScreen: (screen: Screen) => void;
  users: User[];
  usersLoading: boolean;
  eventsLoading: boolean;
  showSplash: boolean;
  currentScreen: Screen;
}

export function useAppEffects(config: AppEffectsConfig): void {
  const { toast } = useToast();
  const {
    currentUser,
    setCurrentUser,
    setCurrentScreen,
    users,
    usersLoading,
    eventsLoading,
    showSplash,
    currentScreen
  } = config;

  // Force reset to auth when app reloads
  useEffect(() => {
    setCurrentUser(null);
    setCurrentScreen('auth');
  }, [setCurrentUser, setCurrentScreen]);

  // Validate currentUser still exists in database
  useEffect(() => {
    if (currentUser && users.length > 0) {
      const userExists = users.find(u => u.id === currentUser.id);
      if (!userExists) {
        // User validation: clearing localStorage for non-existent user
        setCurrentUser(null);
        setCurrentScreen('auth');
        toast({ 
          title: 'Utente non trovato', 
          description: 'Riseleziona il tuo utente dalla lista.',
          variant: 'destructive' 
        });
      }
    }
  }, [users, currentUser, setCurrentUser, setCurrentScreen, toast]);

  // Performance telemetry for data loading
  useEffect(() => {
    if (!usersLoading && !eventsLoading && users.length > 0) {
      performanceTelemetry.markFirstDataReceived();
    }
  }, [usersLoading, eventsLoading, users.length]);

  useEffect(() => {
    if (!usersLoading && !eventsLoading && !showSplash && currentScreen !== 'auth') {
      performanceTelemetry.markAppReady();
    }
  }, [usersLoading, eventsLoading, showSplash, currentScreen]);
}
