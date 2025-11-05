import { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '../lib/queryClient';
import { User } from '@shared/schema';

interface UseSessionReturn {
  sessionId: string | null;
  sessionError: string | null;
  setSessionError: (error: string | null) => void;
  loginMutation: any;
  logoutMutation: any;
  handleUserSelect: (user: User) => void;
  handleLogout: () => void;
}

export function useSession(
  currentUser: User | null,
  setCurrentUser: (user: User | null) => void,
  setCurrentScreen: (screen: any) => void
): UseSessionReturn {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Ref to track heartbeat interval and prevent multiple instances
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isHeartbeatActiveRef = useRef<boolean>(false);

  // Login mutation - preserving exact same logic and side-effects
  const loginMutation = useMutation({
    mutationFn: async (userId: number) => {
      // Get unique session setting from localStorage (default: false)
      const uniqueSessionEnabled = localStorage.getItem('diagonale_unique_session_enabled') === 'true';
      
      const response = await fetch(`/api/users/${userId}/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Unique-Session-Enabled': uniqueSessionEnabled.toString()
        },
        body: JSON.stringify({}),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const text = await response.text();
        const error = new Error(`${response.status}: ${text}`);
        (error as any).status = response.status;
        throw error;
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentUser(data.user);
      setSessionId(data.sessionId);
      setSessionError(null);
      setCurrentScreen('events');
      
      // FORZA REFRESH CACHE WINES QUANDO CAMBIA UTENTE
      queryClient.invalidateQueries({ queryKey: ['/api/wines'] });
      
      toast({ title: 'Accesso effettuato con successo!' });
    },
    onError: (error: any) => {
      if (error.status === 409) {
        setSessionError("Utente già connesso da un altro dispositivo. Disconnetti prima di continuare.");
      } else {
        setSessionError("Errore durante l'accesso. Riprova.");
      }
      toast({ title: 'Errore accesso', variant: 'destructive' });
    },
  });

  // Logout mutation - preserving exact same logic and side-effects
  const logoutMutation = useMutation({
    mutationFn: async () => {
      if (currentUser) {
        const response = await apiRequest('POST', `/api/users/${currentUser.id}/logout`, {});
        return response.json();
      }
    },
    onSuccess: () => {
      cleanupHeartbeat();
      setCurrentUser(null);
      setSessionId(null);
      setSessionError(null);
      setCurrentScreen('auth');
      toast({ title: 'Disconnesso con successo!' });
    },
  });

  // Cleanup heartbeat function
  const cleanupHeartbeat = () => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    isHeartbeatActiveRef.current = false;
  };

  // Start heartbeat function with single instance protection
  const startHeartbeat = () => {
    // Prevent multiple heartbeat instances
    if (isHeartbeatActiveRef.current || !currentUser || !sessionId) {
      return;
    }

    cleanupHeartbeat(); // Ensure clean state
    isHeartbeatActiveRef.current = true;

    heartbeatIntervalRef.current = setInterval(async () => {
      try {
        const response = await apiRequest('POST', `/api/users/${currentUser.id}/heartbeat`, {
          sessionId: sessionId
        });
        
        if (!response.ok) {
          // Session expired or invalid - only logout if truly expired (not on route change)
          setCurrentUser(null);
          setSessionId(null);
          setCurrentScreen('auth');
          toast({ title: 'Sessione scaduta. Ricollegati.', variant: 'destructive' });
        }
      } catch (error) {
        // Heartbeat failed silently
      }
    }, 60000); // Every minute
  };

  // Heartbeat management effect - preserving exact same dependencies and behavior
  useEffect(() => {
    if (currentUser && sessionId) {
      startHeartbeat();
    } else {
      cleanupHeartbeat();
    }
    
    return () => {
      cleanupHeartbeat();
    };
  }, [currentUser, sessionId, toast]);

  // Event handlers
  const handleUserSelect = (user: User) => {
    setSessionError(null);
    loginMutation.mutate(user.id);
  };

  const handleLogout = () => {
    cleanupHeartbeat();
    setCurrentUser(null);
    setCurrentScreen('auth');
    setSessionId(null);
    // Note: setAuthError(null) is handled in the calling component
    toast({ title: 'Logout effettuato', description: 'Arrivederci!' });
  };

  return {
    sessionId,
    sessionError,
    setSessionError,
    loginMutation,
    logoutMutation,
    handleUserSelect,
    handleLogout,
  };
}
