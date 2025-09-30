import { Star, Download } from '@/components/icons';
import { WineEvent, WineResultDetailed } from '@shared/schema';
import ResultsHeader from './results/components/ResultsHeader';
import ResultCard from './results/components/ResultCard';
import CollapsibleDetails from './results/components/CollapsibleDetails';
import BottomNavBar from '../navigation/BottomNavBar';
import { useResultsStats } from './results/hooks/useResultsStats';
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
  
  // Use custom hooks
  const stats = useResultsStats({ results });
  const { expandedWines, toggleExpandWine } = useResultsExpansion();

  const handleExportClick = () => {
    handleExport(event, results);
  };



  return (
    <div className="h-full flex flex-col">
      {/* Fixed Header - Logo + Title */}
      <ResultsHeader />

      {/* Scrollable Content */}
      <div 
        className="px-4 scrollable-area overflow-y-auto" 
        style={{
          height: 'calc(100dvh - 200px - var(--bottom-nav-total, 88px) - env(safe-area-inset-top, 0px))',
          maxHeight: 'calc(100dvh - 200px - var(--bottom-nav-total, 88px) - env(safe-area-inset-top, 0px))'
        }}
      >
        <div className="max-w-4xl mx-auto space-y-4">
          
          {results.length === 0 ? (
            <div className="text-center py-12">
              <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Nessun risultato disponibile</p>
              <p className="text-gray-400 text-sm">Non ci sono ancora voti per questo evento</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {results.map((result, index) => (
                  <div key={result.id} className="space-y-2">
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
                ))}
                
                {/* Spacer per garantire spazio alla bottom-nav */}
                <div className="h-20" style={{height: 'var(--bottom-nav-total)'}} aria-hidden="true"></div>
              </div>
              

            </>
          )}
        </div>
      </div>
      
      <BottomNavBar 
        onGoHome={onGoHome}
        centerButtons={[{
          id: 'export',
          icon: <Download className="w-5 h-5" />,
          onClick: handleExportClick,
          title: 'Condividi',
          variant: 'glass'
        }]}
        layout="center"
      />
    </div>
  );
}
