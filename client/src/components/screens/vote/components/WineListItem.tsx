import { Wine, Vote } from "@shared/schema";

interface WineListItemProps {
  wine: Wine;
  contributor: string;
  userVote: Vote | undefined;
  onWineClick: (wineId: number) => void;
}

export default function WineListItem({ wine, contributor, userVote, onWineClick }: WineListItemProps) {
  const voted = !!userVote;

  return (
    <div
      className={`flex items-center justify-between bg-white/5 backdrop-blur-xl border rounded-3xl px-5 py-4 transition-all duration-200 active:scale-[0.98] cursor-pointer ${
        voted ? 'border-white/20 bg-white/10' : 'border-white/5 hover:bg-white/10'
      }`}
      onClick={() => onWineClick(wine.id)}
    >
      {/* Info */}
      <div className="flex-1 min-w-0 mr-4">
        <h3 className="font-bold text-white text-[1.25rem] truncate">{contributor.toUpperCase()}</h3>
        <p className="text-[0.9375rem] text-amber-200/90 mt-1">{wine.type || 'Vino'}{wine.alcohol ? ` · ${wine.alcohol}°` : ''}</p>
      </div>

      {/* Vote indicator */}
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg flex-shrink-0 transition-all duration-300 ${
        voted ? 'bg-white text-red-950 shadow-lg' : 'bg-white/5 border border-white/10 text-white/20'
      }`}>
        {voted ? userVote.score : '?'}
      </div>
    </div>
  );
}
