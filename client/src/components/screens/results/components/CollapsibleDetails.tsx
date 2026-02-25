import { WineResultDetailed } from '@shared/schema';

interface CollapsibleDetailsProps {
  result: WineResultDetailed;
  isExpanded: boolean;
}

const Detail = ({ label, value }: { label: string; value: string | number | null | undefined }) => (
  <div className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
    <span className="text-[10px] font-bold text-white/25 uppercase tracking-widest">{label}</span>
    <span className="text-sm font-semibold text-white/70">{value || 'N/A'}</span>
  </div>
);

export default function CollapsibleDetails({ result, isExpanded }: CollapsibleDetailsProps) {
  if (!isExpanded) return null;

  return (
    <div className="bg-white/5 rounded-2xl px-5 py-4 mt-1 border border-white/5 animate-in slide-in-from-top-1 duration-200">
      <div className="space-y-0">
        <Detail label="Tipo" value={result.type} />
        <Detail label="Produttore" value={result.producer} />
        <Detail label="Vitigno" value={result.grape} />
        <Detail label="Anno" value={result.year} />
        <Detail label="Origine" value={result.origin} />
        <Detail label="Prezzo" value={result.price ? `€${result.price}` : null} />
      </div>

      {/* Voti individuali */}
      {result?.votes && result.votes.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest mb-3">Voti individuali</p>
          <div className="flex flex-wrap gap-2">
            {result.votes.map(vote => (
              <span
                key={vote.userId}
                className="inline-flex items-center bg-white/5 border border-white/10 px-3 py-1 rounded-full text-xs"
              >
                <span className="font-medium text-white/50">{vote.userName}</span>
                <span className="ml-2 font-black text-white">{vote.score}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
