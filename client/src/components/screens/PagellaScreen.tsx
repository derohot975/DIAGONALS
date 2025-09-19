import { useState, useEffect } from 'react';
import { Home, ArrowLeft, Save } from '@/components/icons';
import diagoLogo from '@assets/diagologo.png';
import { WineEvent } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

interface PagellaScreenProps {
  event: WineEvent | null;
  onGoBack: () => void;
  onGoHome: () => void;
}

export default function PagellaScreen({ event, onGoBack, onGoHome }: PagellaScreenProps) {
  const [content, setContent] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState('');

  if (!event) return null;

  const draftKey = `pagellaDraft_${event.id}`;

  // 1) carica da server; 2) se vuoto, prova bozza locale
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiRequest('GET', `/api/events/${event.id}/pagella`);
        const json = await res.json();
        const serverText = json?.data?.content ?? "";
        if (!cancelled) {
          if (serverText && serverText.length > 0) {
            setContent(serverText);
            // Log solo in dev
            if (import.meta.env.DEV) {
              console.log('Pagella GET 200 - contenuto caricato dal server');
            }
          } else {
            const draft = localStorage.getItem(draftKey);
            if (draft) setContent(draft);
            if (import.meta.env.DEV) {
              console.log('Pagella GET 200 - nessun contenuto server, caricata bozza locale');
            }
          }
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.log('Pagella GET 401 o errore:', error);
        }
        const draft = localStorage.getItem(draftKey);
        if (!cancelled && draft) setContent(draft);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [event.id, draftKey]);

  // Salva bozza ad ogni digit (non blocca nulla)
  useEffect(() => {
    if (loading) return; // Non salvare durante il caricamento iniziale
    const t = setTimeout(() => {
      try { localStorage.setItem(draftKey, content); } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [content, draftKey, loading]);

  const handleSave = async () => {
    // Prova a salvare su server (richiede admin/owner); in ogni caso teniamo la bozza locale
    try {
      const res = await apiRequest('PUT', `/api/events/${event.id}/pagella`, { content });
      if (res.ok) {
        // sincronia bozza
        localStorage.setItem(draftKey, content);
        setIsSaved(true);
        setSaveMessage('Pagella pubblicata per tutti!');
        if (import.meta.env.DEV) {
          console.log('Pagella PUT 200 - pubblicata con successo');
        }
        setTimeout(() => {
          setIsSaved(false);
          setSaveMessage('');
        }, 3000);
      } else {
        // mostra toast: non hai permessi per pubblicare, ma la bozza è salva sul dispositivo
        localStorage.setItem(draftKey, content);
        setIsSaved(true);
        setSaveMessage('Bozza salvata localmente (solo admin può pubblicare)');
        if (import.meta.env.DEV) {
          console.log('Pagella PUT non autorizzato - salvata bozza locale');
        }
        setTimeout(() => {
          setIsSaved(false);
          setSaveMessage('');
        }, 4000);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.log('Pagella PUT errore:', error);
      }
      // offline/errore: la bozza rimane in locale
      localStorage.setItem(draftKey, content);
      setIsSaved(true);
      setSaveMessage('Bozza salvata localmente (offline)');
      setTimeout(() => {
        setIsSaved(false);
        setSaveMessage('');
      }, 3000);
    }
  };

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
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden px-4 pb-20 pt-4">
        <div className="max-w-4xl mx-auto h-full">
          <div className="h-full flex flex-col">
            {/* Text Area Container */}
            <div className="relative flex-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Scrivi qui le tue note sull'evento o incolla un testo copiato in precedenza..."
                className="w-full h-full p-4 bg-white border border-gray-300 rounded-lg text-gray-800 text-base leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ minHeight: '500px' }}
              />
              
              {/* Action Button - Inside textarea, bottom right */}
              <div className="absolute bottom-4 right-4">
                <button
                  onClick={handleSave}
                  className={`p-2 rounded-full shadow-lg transition-colors ${
                    isSaved 
                      ? 'bg-green-500 text-white' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                  title={isSaved ? 'Salvato!' : 'Salva'}
                >
                  <Save className="w-4 h-4" />
                </button>
                
                {/* Save Message */}
                {saveMessage && (
                  <div className="absolute bottom-12 right-0 bg-black/80 text-white text-xs px-3 py-2 rounded-lg max-w-xs">
                    {saveMessage}
                  </div>
                )}
              </div>
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