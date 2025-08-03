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
      const response = await apiRequest('POST', '/api/auth/login', { pin });
      const data = await response.json();
      
      if (!response.ok) {
        setAuthError(data.message || 'Errore durante il login');
        return null;
      }
      
      toast({ title: 'Login effettuato', description: `Benvenuto ${data.user.name}!` });
      return data.user;
    } catch (error) {
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
      const response = await apiRequest('POST', '/api/auth/register', { name, pin });
      const data = await response.json();
      
      if (!response.ok) {
        setAuthError(data.message || 'Errore durante la registrazione');
        return null;
      }
      
      toast({ title: 'Registrazione completata', description: `Benvenuto ${data.user.name}!` });
      return data.user;
    } catch (error) {
      setAuthError('Errore di connessione');
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