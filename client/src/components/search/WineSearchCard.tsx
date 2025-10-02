import { Wine } from '@/components/icons';

export interface WineSearchResult {
  id: number;
  name: string;
  producer: string;
  type: string;
  year: number;
  userName: string;
  eventName: string;
  eventDate: string;
  eventCount?: number; // Se presente in più eventi
}

interface WineSearchCardProps {
  wine: WineSearchResult;
  onClick?: () => void;
}

export default function WineSearchCard({ wine, onClick }: WineSearchCardProps) {
  const handleClick = () => {
    // TODO: Future navigation to wine details
    if (onClick) onClick();
  };

  return (
    <div 
      className="bg-white/95 rounded-xl p-4 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200 cursor-pointer w-full max-w-none"
      onClick={handleClick}
    >
      {/* Header - Nome vino e tipo */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-bold text-[#300505] text-lg leading-tight">
            {wine.name}
          </h3>
          <p className="text-gray-600 text-sm font-medium">
            {wine.producer} • {wine.year}
          </p>
        </div>
        <div className="flex items-center space-x-1 ml-2">
          <Wine className="w-5 h-5 text-[#8d0303]" />
          <span className="text-xs font-medium text-[#8d0303] bg-[#8d0303]/10 px-2 py-1 rounded-full">
            {wine.type}
          </span>
        </div>
      </div>

      {/* Info evento e utente */}
      <div className="space-y-1">
        <div className="flex items-center text-sm text-gray-700">
          <span className="font-medium">Portato da:</span>
          <span className="ml-1 font-semibold text-[#300505]">{wine.userName}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <span className="font-medium">Evento:</span>
          <span className="ml-1">{wine.eventName}</span>
          <span className="mx-2">•</span>
          <span className="text-xs">{wine.eventDate}</span>
        </div>
        
        {/* Indicatore eventi multipli */}
        {wine.eventCount && wine.eventCount > 1 && (
          <div className="text-xs text-[#8d0303] font-medium mt-1">
            +{wine.eventCount - 1} altri eventi
          </div>
        )}
      </div>
    </div>
  );
}
