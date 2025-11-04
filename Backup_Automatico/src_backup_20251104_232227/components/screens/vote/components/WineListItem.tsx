import { Wine, Vote } from "@shared/schema";

interface WineListItemProps {
  wine: Wine;
  contributor: string;
  userVote: Vote | undefined;
  onWineClick: (wineId: number) => void;
}

export default function WineListItem({ wine, contributor, userVote, onWineClick }: WineListItemProps) {
  return (
    <div 
      key={wine.id} 
      className="bg-white rounded-2xl shadow-lg p-3 animate-fade-in"
    >
      {/* Horizontal Layout */}
      <div className="flex items-center justify-between">
        
        {/* Left Side - Wine Info */}
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800 mb-1">
            <span className="text-[#300505]">{contributor.toUpperCase()}</span>
          </h3>
          <div className="flex items-center text-gray-600 text-sm">
            <span>{wine.type || 'Vino'} • {wine.alcohol ? `${wine.alcohol}°` : 'N/A'}</span>
          </div>
        </div>

        {/* Right Side - Vote Display */}
        <div className="flex items-center space-x-3">
          {/* Vote Badge */}
          <div 
            className={`px-5 py-2 rounded-full font-bold text-lg text-center min-w-[70px] cursor-pointer transition-all ${
              userVote 
                ? 'bg-gradient-to-r from-[#8d0303] to-[#300505] text-white' 
                : 'bg-gray-400 text-white hover:bg-gray-500'
            }`}
            onClick={() => onWineClick(wine.id)}
            title="Clicca per votare"
          >
            {userVote ? userVote.score : '1.0'}
          </div>
        </div>

      </div>
    </div>
  );
}
