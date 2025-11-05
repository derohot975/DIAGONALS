import { Crown, ChevronDown, ChevronUp } from '@/components/icons';
import { WineResultDetailed } from '@shared/schema';

interface ResultCardProps {
  result: WineResultDetailed;
  index: number;
  isExpanded: boolean;
  onToggleExpand: (wineId: number) => void;
}

export default function ResultCard({ result, index, isExpanded, onToggleExpand }: ResultCardProps) {
  return (
    <div 
      className={`bg-white rounded-xl p-2 border-2 wine-card-hover relative cursor-pointer transition-all duration-200 ${
        index === 0 ? 'border-[hsl(43,96%,56%)]/30' : 'border-gray-300'
      } ${isExpanded ? 'shadow-lg' : 'hover:shadow-md'}`}
      onClick={() => onToggleExpand(result.id)}
    >
      <div className={`absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
        index === 0 ? 'bg-[hsl(43,96%,56%)] text-white' : 'bg-gray-400 text-white'
      }`}>
        {index + 1}
      </div>
      <div className="ml-12">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-lg text-gray-800 uppercase">{result?.contributor || 'SCONOSCIUTO'}</h3>
                {index === 0 && <Crown className="w-5 h-5 text-[hsl(43,96%,56%)]" />}
              </div>
              <p className="text-sm text-gray-600">{result?.name || 'Vino senza nome'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-lg">{(result?.averageScore || 0).toFixed(2)}</span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
