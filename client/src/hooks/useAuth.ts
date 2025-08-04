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
      toast({ title: 'Login effettuato', description: `Benvenuto ${data.user.name}!` });
      return data.user;
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Extract message from error thrown by apiRequest
      if (error.message && error.message.includes('401:')) {
        try {
          const errorText = error.message.split('401: ')[1];
          const errorData = JSON.parse(errorText);
          setAuthError(errorData.message || 'Errore durante il login');
        } catch (parseError) {
          setAuthError('Errore durante il login');
        }
      } else {
        setAuthError('Errore di connessione');
      }
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
      toast({ title: 'Registrazione completata', description: `Benvenuto ${data.user.name}!` });
      return data.user;
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Extract message from error thrown by apiRequest
      if (error.message && error.message.includes('409:')) {
        try {
          const errorText = error.message.split('409: ')[1];
          const errorData = JSON.parse(errorText);
          setAuthError(errorData.message || 'Errore durante la registrazione');
        } catch (parseError) {
          setAuthError('Errore durante la registrazione');
        }
      } else {
        setAuthError('Errore di connessione');
      }
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