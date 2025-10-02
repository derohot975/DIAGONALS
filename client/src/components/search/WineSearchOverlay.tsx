import { useState, useEffect, useCallback } from 'react';
import { Search, Wine } from '@/components/icons';
import BaseModal from '@/components/ui/BaseModal';
import WineSearchCard, { WineSearchResult } from './WineSearchCard';

interface WineSearchOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function WineSearchOverlay({ open, onOpenChange }: WineSearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<WineSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced search function
  const searchWines = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/wines/search?q=${encodeURIComponent(searchQuery)}&limit=20`);
      
      if (!response.ok) {
        throw new Error('Errore nella ricerca');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nella ricerca');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

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
  };

  const renderContent = () => {
    // Initial state
    if (query.length === 0) {
      return (
        <div className="text-center py-12">
          <Wine className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Cerca per nome o produttore</p>
          <p className="text-gray-400 text-sm mt-1">Minimo 2 caratteri</p>
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

    // Error state
    if (error) {
      return (
        <div className="text-center py-8">
          <p className="text-red-600 mb-2">{error}</p>
          <button 
            onClick={() => searchWines(query)}
            className="text-[#300505] hover:text-[#8d0303] font-medium"
          >
            Riprova
          </button>
        </div>
      );
    }

    // Empty results
    if (results.length === 0) {
      return (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Nessun vino trovato</p>
          <p className="text-gray-400 text-sm mt-1">negli eventi conclusi</p>
        </div>
      );
    }

    // Results
    return (
      <div className="space-y-3">
        {results.map((wine) => (
          <WineSearchCard 
            key={wine.id} 
            wine={wine}
            onClick={() => {
              // TODO: Future navigation
              console.log('Wine selected:', wine);
            }}
          />
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
            placeholder="Nome vino o produttore..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#300505] focus:border-transparent"
            autoFocus
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
