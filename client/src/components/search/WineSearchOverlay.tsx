import { useState, useEffect, useCallback } from 'react';
import { Search, Wine } from '@/components/icons';
import BaseModal from '@/components/ui/BaseModal';
import WineSearchCard, { WineSearchResult } from './WineSearchCard';
import { validateZIndexOrder } from '@/styles/tokens/zIndex';

interface WineSearchOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function WineSearchOverlay({ open, onOpenChange }: WineSearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<WineSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🛡️ Guardrail Dev - Verifica z-index order al mount
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      validateZIndexOrder('MODAL_OVERLAY', 'BOTTOM_NAV');
    }
  }, []);

  // 🎯 Focus management e scroll lock
  useEffect(() => {
    if (open) {
      // Blocca scroll del body
      document.body.style.overflow = 'hidden';
      
      // Focus immediato sull'input con fallback
      const focusInput = () => {
        const input = document.querySelector('input[placeholder*="Nome vino"]') as HTMLInputElement;
        if (input) {
          input.focus();
        }
      };
      
      // Prova focus immediato e fallback con requestAnimationFrame
      focusInput();
      requestAnimationFrame(focusInput);
    } else {
      // Ripristina scroll del body
      document.body.style.overflow = '';
    }

    return () => {
      // Cleanup: ripristina sempre scroll
      document.body.style.overflow = '';
    };
  }, [open]);

  // ⌨️ Keyboard shortcuts globali
  useEffect(() => {
    const handleGlobalKeydown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K per aprire overlay
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onOpenChange(true);
      }
    };

    document.addEventListener('keydown', handleGlobalKeydown);
    return () => document.removeEventListener('keydown', handleGlobalKeydown);
  }, [onOpenChange]);

  // Debounced search function con retry e timeout
  const searchWines = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const response = await fetch(`/api/wines/search?q=${encodeURIComponent(searchQuery)}&limit=20`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Ricerca fallita (${response.status})`);
      }

      const data = await response.json();
      
      // Performance monitoring
      const duration = Date.now() - startTime;
      if (process.env.NODE_ENV === 'development' && duration > 700) {
        console.warn(`🔍 Ricerca più lunga del previsto: ${duration}ms per "${searchQuery}"`);
      }

      setResults(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setError('Ricerca interrotta per timeout');
        } else {
          setError(err.message);
        }
      } else {
        setError('Errore di connessione');
      }
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔄 Retry function
  const retrySearch = useCallback(() => {
    if (query.length >= 2) {
      searchWines(query);
    }
  }, [query, searchWines]);
  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      searchWines(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, searchWines]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
      setError(null);
    }
  }, [open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    // Reset error quando utente digita
    if (error) setError(null);
  };

  // ⌨️ Handle Enter key per ricerca
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.length >= 2) {
      e.preventDefault();
      searchWines(query);
    }
  };

  const renderContent = () => {
    // Initial state
    if (query.length === 0) {
      return (
        <div className="text-center py-12">
          <Wine className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Cerca per nome o produttore</p>
          <p className="text-gray-400 text-sm mt-1">Minimo 2 caratteri</p>
          <div className="mt-4 text-xs text-gray-400">
            <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-600">Ctrl</kbd> + 
            <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-600 ml-1">K</kbd>
            <span className="ml-2">per aprire rapidamente</span>
          </div>
        </div>
      );
    }

    // Too short state
    if (query.length === 1) {
      return (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aggiungi almeno un altro carattere</p>
          <p className="text-gray-400 text-sm mt-1">Prova con il nome del vino o del produttore</p>
        </div>
      );
    }

    // Too short query
    if (query.length < 2) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">Inserisci almeno 2 caratteri</p>
        </div>
      );
    }

    // Loading state
    if (loading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 rounded-xl h-24 animate-pulse" />
          ))}
        </div>
      );
    }

    // Error state con retry
    if (error) {
      return (
        <div className="text-center py-8">
          <div className="text-red-600 mb-4 flex items-center justify-center">
            <Search className="w-5 h-5 mr-2" />
            {error}
          </div>
          <button
            onClick={retrySearch}
            className="px-4 py-2 bg-[#8d0303] text-white rounded-lg hover:bg-[#300505] transition-colors font-medium"
          >
            Riprova ricerca
          </button>
        </div>
      );
    }

    // Empty state migliorato
    if (results.length === 0) {
      return (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Nessun vino trovato</p>
          <p className="text-gray-400 text-sm mt-1">negli eventi conclusi</p>
        </div>
      );
    }

    // Results con highlight
    return (
      <div className="space-y-3">
        {results.map((wine) => (
          <WineSearchCard key={wine.id} wine={wine} query={query} onClick={() => {
            // TODO: Future navigation
            console.log('Wine selected:', wine);
          }} />
        ))}
      </div>
    );
  };

  return (
    <BaseModal
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      title="Cerca Vini"
      className="max-h-[80vh] w-full max-w-3xl"
    >
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Cerca per nome o produttore · min 2 caratteri"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#300505] focus:border-transparent"
            inputMode="search"
            enterKeyHint="search"
            aria-label="Cerca vini negli eventi conclusi"
            autoFocus
            autoComplete="off"
          />
        </div>

        {/* Results Container */}
        <div 
          className="max-h-96 overflow-y-auto scrollable-area"
          style={{ minHeight: '200px' }}
        >
          {renderContent()}
        </div>
      </div>
    </BaseModal>
  );
}
