import { Download, ArrowLeft, Home } from '@/components/icons';
import { WineEvent, WineResultDetailed } from '@shared/schema';
import ResultsHeader from './results/components/ResultsHeader';
import ResultCard from './results/components/ResultCard';
import CollapsibleDetails from './results/components/CollapsibleDetails';
import BottomNavBar from '../navigation/BottomNavBar';
import { useResultsExpansion } from './results/hooks/useResultsExpansion';
import { handleExport } from './results/utils/shareFormatter';

interface EventResultsScreenProps {
  event: WineEvent | null;
  results: WineResultDetailed[];
  onGoBack?: () => void;
  onGoHome?: () => void;
}

export default function EventResultsScreen({ event, results, onGoBack, onGoHome }: EventResultsScreenProps) {
  if (!event) return null;

  const { expandedWines, toggleExpandWine } = useResultsExpansion();

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-[#300505] to-[#1a0303]">
      <ResultsHeader />

      <div
        className="flex-1 overflow-y-auto px-6 scrollbar-hide"
        style={{
          paddingBottom: 'calc(var(--bottom-nav-total, 3.5rem) + 1rem)'
        }}
      >
        <div className="max-w-md mx-auto space-y-2">
          {results.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-white/30 font-medium">Nessun risultato disponibile</p>
            </div>
          ) : (
            results.map((result, index) => (
              <div key={result.id}>
                <ResultCard
                  result={result}
                  index={index}
                  isExpanded={expandedWines.has(result.id)}
                  onToggleExpand={toggleExpandWine}
                />
                <CollapsibleDetails
                  result={result}
                  isExpanded={expandedWines.has(result.id)}
                />
              </div>
            ))
          )}
        </div>
      </div>

      <BottomNavBar
        layout="center"
        centerButtons={[
          ...(onGoBack ? [{ id: 'back', icon: <ArrowLeft className="w-6 h-6" />, onClick: onGoBack, title: 'Indietro', variant: 'glass' as const }] : []),
          { id: 'export', icon: <Download className="w-6 h-6" />, onClick: () => handleExport(event, results), title: 'Condividi', variant: 'glass' as const },
          ...(onGoHome ? [{ id: 'home', icon: <Home className="w-6 h-6" />, onClick: onGoHome, title: 'Home', variant: 'glass' as const }] : []),
        ]}
      />
    </div>
  );
}
