import { useState, useEffect, useRef, useCallback } from 'react';
import { Home, ArrowLeft } from '@/components/icons';
import diagoLogo from '@assets/diagologo.png';
import { WineEvent, User } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

interface PagellaScreenProps {
  event: WineEvent | null;
  currentUser: User | null;
  onGoBack: () => void;
  onGoHome: () => void;
}

export default function PagellaScreen({ event, currentUser, onGoBack, onGoHome }: PagellaScreenProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [serverUpdatedAt, setServerUpdatedAt] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const autosaveTimeoutRef = useRef<NodeJS.Timeout>();
  const pollingIntervalRef = useRef<NodeJS.Timeout>();
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  if (!event) return null;

  const draftKey = `pagella_${event.id}`;
  
  // Determina se l'utente può editare (solo DERO e TOMMY)
  const canEdit = currentUser && ['DERO', 'TOMMY'].includes(currentUser.name.toUpperCase());

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
          const draft = localStorage.getItem(draftKey);
          if (draft) setContent(draft);
        }
      }
      
      return { content: serverText, updatedAt: serverUpdated };
    } catch (error) {
      if (import.meta.env.DEV) {
        console.log('Errore caricamento pagella:', error);
      }
      // Fallback su bozza locale in caso di errore
      const draft = localStorage.getItem(draftKey);
      if (draft && updateContent) setContent(draft);
      return null;
    }
  }, [event.id, draftKey]);

  // Caricamento iniziale
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await loadFromServer(true);
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [loadFromServer]);

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
    try {
      localStorage.setItem(draftKey, newContent);
    } catch {}
    
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

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-white/70">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/50 mx-auto mb-2"></div>
          <p>Caricamento pagella…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Fixed Header - Logo and Title */}
      <div className="sticky top-0 z-10 text-center py-4">
        <img 
          src={diagoLogo} 
          alt="DIAGO Logo" 
          className="mx-auto mb-2 w-16 h-auto logo-filter drop-shadow-lg" 
        />
        <h2 className="pagellone-tommy-font text-xl font-bold text-yellow-200">
          Pagellone di Tommy
        </h2>
        
        {/* Status di salvataggio non invasivo */}
        {canEdit && saveStatus !== 'idle' && (
          <div className="mt-2">
            <span className={`text-xs px-2 py-1 rounded ${
              saveStatus === 'saving' ? 'bg-yellow-500/20 text-yellow-200' :
              saveStatus === 'saved' ? 'bg-green-500/20 text-green-200' :
              'bg-red-500/20 text-red-200'
            }`}>
              {saveStatus === 'saving' ? 'Salvataggio...' :
               saveStatus === 'saved' ? 'Salvato' :
               'Errore salvataggio'}
            </span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden px-4 pb-20 pt-4">
        <div className="max-w-4xl mx-auto h-full">
          <div className="h-full flex flex-col">
            {/* Messaggio informativo per utenti non editor */}
            {!canEdit && (
              <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                <p className="text-blue-200 text-sm text-center">
                  📖 Stai visualizzando la Pagella in sola lettura. Solo DERO e TOMMY possono modificarla.
                </p>
              </div>
            )}
            
            {/* Text Area Container */}
            <div className="relative flex-1">
              <textarea
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                readOnly={!canEdit}
                placeholder={canEdit ? 
                  "Scrivi qui le tue note sull'evento... Il contenuto viene salvato automaticamente." :
                  "Contenuto della Pagella..."
                }
                className={`w-full h-full p-4 rounded-lg text-base leading-relaxed resize-none focus:outline-none ${
                  canEdit 
                    ? 'bg-white border border-gray-300 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    : 'bg-gray-100 border border-gray-200 text-gray-700 cursor-default'
                }`}
                style={{ minHeight: '500px' }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation Buttons - Bottom Center */}
      <div className="fixed left-0 right-0 z-50 flex justify-center" style={{bottom: 'var(--bottom-nav-offset)'}}>
        <div className="flex items-center space-x-4">
          <button
            onClick={onGoBack}
            className="text-white p-3 rounded-full shadow-lg transition-all hover:bg-white hover:bg-opacity-10"
            style={{background: 'rgba(255, 255, 255, 0.1)'}}
            title="Indietro"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={onGoHome}
            className="text-white p-3 rounded-full shadow-lg transition-all hover:bg-white hover:bg-opacity-10"
            style={{background: 'rgba(255, 255, 255, 0.1)'}}
            title="Home"
          >
            <Home className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}