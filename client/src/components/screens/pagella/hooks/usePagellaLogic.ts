import { useState, useEffect, useRef, useCallback } from 'react';
import { WineEvent, User } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { getDraft, setDraft } from '../utils/pagellaStorage';

interface UsePagellaLogicProps {
  event: WineEvent;
  currentUser: User | null;
  canEdit: boolean;
}

export const usePagellaLogic = ({ event, currentUser, canEdit }: UsePagellaLogicProps) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [serverUpdatedAt, setServerUpdatedAt] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const autosaveTimeoutRef = useRef<NodeJS.Timeout>();
  const pollingIntervalRef = useRef<NodeJS.Timeout>();
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const draftKey = `pagella_${event.id}`;

  // Funzione per caricare dati dal server
  const loadFromServer = useCallback(async (updateContent = true) => {
    try {
      const res = await apiRequest('GET', `/api/events/${event.id}/pagella`);
      const json = await res.json();
      const serverText = json?.data?.content ?? "";
      const serverUpdated = json?.data?.updatedAt;
      
      setServerUpdatedAt(serverUpdated);
      
      if (updateContent) {
        if (serverText && serverText.length > 0) {
          setContent(serverText);
          if (import.meta.env.DEV) {
            console.log('Pagella caricata dal server');
          }
        } else {
          // Fallback su bozza locale solo se server è vuoto
          const draft = getDraft(draftKey);
          if (draft) setContent(draft);
        }
      }
      
      return { content: serverText, updatedAt: serverUpdated };
    } catch (error) {
      if (import.meta.env.DEV) {
        console.log('Errore caricamento pagella:', error);
      }
      // Fallback su bozza locale in caso di errore
      const draft = getDraft(draftKey);
      if (draft && updateContent) setContent(draft);
      return null;
    }
  }, [event.id, draftKey]);

  // Autosave con debounce di 600ms (solo per editor)
  const performAutosave = useCallback(async (contentToSave: string) => {
    if (!canEdit || !currentUser) return;
    
    setSaveStatus('saving');
    try {
      const res = await apiRequest('PUT', `/api/events/${event.id}/pagella`, { 
        content: contentToSave, 
        userId: currentUser.id 
      });
      
      if (res.ok) {
        const json = await res.json();
        setServerUpdatedAt(json?.data?.updatedAt);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
        
        if (import.meta.env.DEV) {
          console.log('Autosave completato');
        }
      } else {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
      if (import.meta.env.DEV) {
        console.log('Errore autosave:', error);
      }
    }
  }, [canEdit, currentUser, event.id]);

  // Gestione cambio contenuto con autosave
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    
    // Salva sempre bozza locale
    setDraft(draftKey, newContent);
    
    // Marca come "sta digitando"
    setIsTyping(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
    
    // Autosave con debounce (solo per editor)
    if (canEdit) {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
      autosaveTimeoutRef.current = setTimeout(() => {
        performAutosave(newContent);
      }, 600);
    }
  }, [canEdit, draftKey, performAutosave]);

  // Caricamento iniziale
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await loadFromServer(true);
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [loadFromServer]);

  // Soft polling ogni 10s per sincronizzazione (lettori)
  useEffect(() => {
    if (loading) return;
    
    pollingIntervalRef.current = setInterval(async () => {
      const serverData = await loadFromServer(false);
      if (serverData && serverData.updatedAt && serverUpdatedAt) {
        // Se il server ha un update più recente e l'utente non sta digitando
        if (new Date(serverData.updatedAt) > new Date(serverUpdatedAt) && !isTyping) {
          setContent(serverData.content);
          setServerUpdatedAt(serverData.updatedAt);
          if (import.meta.env.DEV) {
            console.log('Contenuto aggiornato dal polling');
          }
        }
      }
    }, 10000);
    
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [loading, loadFromServer, serverUpdatedAt, isTyping]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current);
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  return {
    content,
    loading,
    saveStatus,
    handleContentChange
  };
};
