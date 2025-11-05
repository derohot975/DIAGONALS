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
  additionalEvents?: Array<{
    name: string;
    date: string;
  }>; // Eventi aggiuntivi se presente in più eventi
}

// 🎯 Utility per highlight del testo
const highlightText = (text: string, query: string): React.ReactNode => {
  if (!query || query.length < 2) return text;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, index) => 
    regex.test(part) ? (
      <mark key={index} className="bg-yellow-100 text-yellow-800 px-1 rounded">
        {part}
      </mark>
    ) : part
  );
};

interface WineSearchCardProps {
  wine: WineSearchResult;
  query?: string; // Per highlight
  onClick?: () => void;
}

export default function WineSearchCard({ wine, query = '', onClick }: WineSearchCardProps) {
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
            {highlightText(wine.name, query)}
          </h3>
          <p className="text-gray-600 text-sm font-medium">
            {highlightText(wine.producer, query)} • {wine.year}
          </p>
        </div>
        <div className="flex items-center space-x-1 ml-2">
          <Wine className="w-5 h-5 text-[#8d0303]" />
          <span className="text-xs font-medium text-[#8d0303] bg-[#8d0303]/10 px-2 py-1 rounded-full">
            {wine.type}
          </span>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center text-sm text-gray-700">
          <span className="font-medium">Portato da:</span>
          <span className="ml-1 font-semibold text-[#300505]">{wine.userName}</span>
        </div>
        
        {/* Evento principale (più recente) */}
        <div className="flex items-center text-sm text-gray-600">
          <span className="font-medium">Ultimo evento:</span>
          <span className="ml-1">{wine.eventName}</span>
          <span className="mx-2">•</span>
          <span>{new Date(wine.eventDate).toLocaleDateString('it-IT')}</span>
        </div>
        
        {/* Eventi aggiuntivi */}
        {wine.additionalEvents && wine.additionalEvents.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="text-xs text-gray-500 mb-1">
              <span className="font-medium">Altri eventi:</span>
            </div>
            <div className="space-y-1">
              {wine.additionalEvents.slice(0, 2).map((event, index) => (
                <div key={index} className="text-xs text-gray-500 flex items-center">
                  <span>{event.name}</span>
                  <span className="mx-1">•</span>
                  <span>{new Date(event.date).toLocaleDateString('it-IT')}</span>
                </div>
              ))}
              {wine.additionalEvents.length > 2 && (
                <div className="text-xs">
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
                    +{wine.additionalEvents.length - 2} altri
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
