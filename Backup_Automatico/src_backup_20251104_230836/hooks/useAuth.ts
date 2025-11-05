import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '../lib/queryClient';
import { User } from '@shared/schema';

export const useAuth = () => {
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleLogin = async (name: string, pin: string) => {
    setAuthLoading(true);
    setAuthError(null);
    
    try {
      // Use API authentication (only PIN required)
      const response = await apiRequest('POST', '/api/auth/login', { pin });
      const data = await response.json();
      
      if (data.user) {
        toast({ title: 'Login effettuato', description: `Benvenuto ${data.user.name}!` });
        return data.user;
      } else {
        setAuthError(data.message || 'PIN non valido');
        return null;
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.message?.includes('401') ? 'PIN non valido' : 'Errore di connessione';
      setAuthError(errorMessage);
      return null;
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (name: string, pin: string): Promise<User | null> => {
    setAuthLoading(true);
    setAuthError(null);
    
    try {
      // Use API registration
      const response = await apiRequest('POST', '/api/auth/register', { name, pin });
      const data = await response.json();
      
      if (data.user) {
        toast({ title: 'Registrazione completata', description: `Benvenuto ${data.user.name}!` });
        return data.user;
      } else {
        setAuthError(data.message || 'Errore durante la registrazione');
        return null;
      }
    } catch (error: any) {
      console.error('Register error:', error);
      const errorMessage = error.message?.includes('409') ? 'Nome utente o PIN già esistente' : 'Errore di connessione';
      setAuthError(errorMessage);
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