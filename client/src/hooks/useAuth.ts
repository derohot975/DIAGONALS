import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '../lib/queryClient';
import { User } from '@shared/schema';
import { loginWithPin, AuthUser } from '../lib/authClient';

export const useAuth = () => {
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleLogin = async (name: string, pin: string) => {
    setAuthLoading(true);
    setAuthError(null);
    
    // Feature flag: use Supabase auth or fallback to API
    const AUTH_MODE = (import.meta.env.VITE_AUTH_MODE ?? 'supabase').toLowerCase();
    
    try {
      if (AUTH_MODE === 'supabase') {
        // Use Supabase PIN authentication
        const result = await loginWithPin(pin);
        
        if (result.ok && result.user) {
          // Convert AuthUser to User format for compatibility
          const user: User = {
            id: result.user.id,
            name: result.user.name,
            pin: pin, // Keep PIN for compatibility
            isAdmin: result.user.role === 'admin',
            createdAt: new Date(), // Placeholder
          };
          
          toast({ title: 'Login effettuato', description: `Benvenuto ${result.user.name}!` });
          return user;
        } else {
          setAuthError(result.error || 'PIN non valido');
          return null;
        }
      } else {
        // Fallback to original API (not used in production)
        const response = await apiRequest('POST', '/api/auth/login', { pin });
        const data = await response.json();
        toast({ title: 'Login effettuato', description: `Benvenuto ${data.user.name}!` });
        return data.user;
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setAuthError('Errore di connessione');
      return null;
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (name: string, pin: string): Promise<User | null> => {
    setAuthLoading(true);
    setAuthError(null);
    
    try {
      // Block registration in read-only mode
      setAuthError('Funzione non disponibile in questa modalità');
      return null;
    } finally {
      setAuthLoading(false);
    }
  };

  return {
    authLoading,
    authError,
    setAuthError,
    handleLogin,
    handleRegister
  };
};