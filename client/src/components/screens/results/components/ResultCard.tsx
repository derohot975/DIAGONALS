import { Crown, ChevronDown, ChevronUp } from '@/components/icons';
import { WineResultDetailed } from '@shared/schema';

interface ResultCardProps {
  result: WineResultDetailed;
  index: number;
  isExpanded: boolean;
  onToggleExpand: (wineId: number) => void;
}

const RANK = [
  { ring: 'border-yellow-400/40', badge: 'bg-yellow-400 text-yellow-950', glow: 'shadow-yellow-400/10' },
  { ring: 'border-gray-300/20', badge: 'bg-gray-300 text-gray-800', glow: '' },
  { ring: 'border-orange-400/20', badge: 'bg-orange-400 text-orange-950', glow: '' },
];

export default function ResultCard({ result, index, isExpanded, onToggleExpand }: ResultCardProps) {
  const rank = RANK[index] ?? { ring: 'border-white/5', badge: 'bg-white/10 text-white/50', glow: '' };

  return (
    <div
      className={`bg-white/5 backdrop-blur-xl border rounded-3xl px-5 py-4 cursor-pointer transition-all duration-300 active:scale-[0.98] ${rank.ring} ${rank.glow} ${isExpanded ? 'bg-white/10' : 'hover:bg-white/10'}`}
      onClick={() => onToggleExpand(result.id)}
    >
      <div className="flex items-center space-x-4">
        {/* Rank badge */}
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm flex-shrink-0 ${rank.badge}`}>
          {index === 0 ? <Crown className="w-5 h-5" /> : index + 1}
        </div>

        {/* Wine info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-base truncate">{result?.contributor?.toUpperCase() || 'SCONOSCIUTO'}</h3>
          <p className="text-sm text-white/40 truncate">{result?.name || 'Vino senza nome'}</p>
        </div>

        {/* Score + toggle */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <span className="text-2xl font-black text-white">{(result?.averageScore || 0).toFixed(1)}</span>
          {isExpanded
            ? <ChevronUp className="w-4 h-4 text-white/30" />
            : <ChevronDown className="w-4 h-4 text-white/30" />}
        </div>
      </div>
    </div>
  );
}
