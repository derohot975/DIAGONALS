import { useState } from 'react';
import { useToast } from './use-toast';

// Guest mode auth hook for read-only access
export const useGuestAuth = () => {
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const { toast } = useToast();

  const enableGuestMode = () => {
    setGuestLoading(true);
    
    // Simulate auth process
    setTimeout(() => {
      setIsGuestMode(true);
      setGuestLoading(false);
      toast({ 
        title: 'Modalità Guest attivata', 
        description: 'Accesso in sola lettura ai dati.' 
      });
    }, 500);
  };

  const disableGuestMode = () => {
    setIsGuestMode(false);
    toast({ 
      title: 'Modalità Guest disattivata', 
      description: 'Torna al login normale.' 
    });
  };

  const blockWriteOperation = (operation: string) => {
    toast({ 
      title: 'Funzione non disponibile', 
      description: `${operation} non disponibile in modalità Guest.`,
      variant: 'destructive'
    });
  };

  return {
    isGuestMode,
    guestLoading,
    enableGuestMode,
    disableGuestMode,
    blockWriteOperation
  };
};
