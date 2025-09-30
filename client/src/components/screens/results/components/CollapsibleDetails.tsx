import { WineResultDetailed } from '@shared/schema';

interface CollapsibleDetailsProps {
  result: WineResultDetailed;
  isExpanded: boolean;
}

export default function CollapsibleDetails({ result, isExpanded }: CollapsibleDetailsProps) {
  if (!isExpanded) return null;

  return (
    <div className="bg-gray-50 rounded-lg p-2.5 mt-2 animate-in slide-in-from-top-2 duration-200 space-y-2.5">
      {/* Dettagli del vino - Layout ultra-compatto */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tipo</span>
          <span className="text-sm font-medium text-gray-800">{result.type || 'N/A'}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Produttore</span>
          <span className="text-sm font-medium text-gray-800">{result.producer || 'N/A'}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Vitigno</span>
          <span className="text-sm font-medium text-gray-800">{result.grape || 'N/A'}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Anno</span>
          <span className="text-sm font-medium text-gray-800">{result.year || 'N/A'}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Origine</span>
          <span className="text-sm font-medium text-gray-800">{result.origin || 'N/A'}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Prezzo</span>
          <span className="text-sm font-semibold text-[hsl(300,50%,40%)]">€{result.price || 'N/A'}</span>
        </div>
      </div>
      
      {/* Separatore sottile */}
      <div className="h-px bg-gray-200"></div>
      
      {/* Voti individuali - Design ultra-compatto */}
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Voti individuali</p>
        <div className="flex flex-wrap gap-1">
          {result?.votes && result.votes.map(vote => {
            // Mostra il nome solo se è il proprietario del vino
            const isOwner = vote.userId === result.userId;
            return (
              <span 
                key={vote.userId} 
                className="inline-flex items-center bg-white px-2 py-0.5 rounded-full text-xs border border-gray-200 shadow-sm"
              >
                {isOwner ? (
                  <>
                    <span className="font-medium text-gray-700">{vote.userName}:</span>
                    <span className="ml-1 text-[hsl(43,96%,56%)] font-bold">{vote.score}</span>
                  </>
                ) : (
                  <span className="text-[hsl(43,96%,56%)] font-bold">{vote.score}</span>
                )}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
