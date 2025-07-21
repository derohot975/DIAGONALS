import { useState } from "react";
import { Play, SkipForward, Square } from "lucide-react";
import type { Wine, User } from "@shared/schema";

interface AdminWineSelectorProps {
  wines: Wine[];
  users: User[];
  currentVotingWineId: number | null;
  onSelectWine: (wineId: number) => void;
  onNextWine: () => void;
  onStopVoting: () => void;
}

export function AdminWineSelector({ 
  wines, 
  users, 
  currentVotingWineId, 
  onSelectWine, 
  onNextWine, 
  onStopVoting 
}: AdminWineSelectorProps) {
  const getWineContributor = (userId: number) => {
    return users.find(u => u.id === userId)?.name || 'Unknown';
  };

  const getWineLabel = (index: number) => {
    return `Vino ${String.fromCharCode(65 + index)}`; // A, B, C, etc.
  };

  const currentWineIndex = wines.findIndex(w => w.id === currentVotingWineId);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        Gestione Votazioni Sequenziali
      </h3>

      {/* Current Status */}
      {currentVotingWineId && (
        <div className="bg-[hsl(270,50%,75%)] text-white rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Votazione Attiva:</p>
              <p className="text-sm opacity-90">
                {getWineLabel(currentWineIndex)} - {getWineContributor(wines[currentWineIndex]?.userId)}
              </p>
            </div>
            <div className="animate-pulse">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
      )}

      {/* Wine List */}
      <div className="space-y-3 mb-6">
        {wines.map((wine, index) => (
          <div
            key={wine.id}
            className={`
              flex items-center justify-between p-3 rounded-lg border transition-all
              ${wine.id === currentVotingWineId 
                ? 'border-[hsl(270,50%,65%)] bg-[hsl(270,50%,95%)]' 
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
          >
            <div>
              <div className="font-medium text-gray-800">
                {getWineLabel(index)}
              </div>
              <div className="text-sm text-gray-600">
                Portato da: {getWineContributor(wine.userId)}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {wine.id === currentVotingWineId ? (
                <div className="flex items-center text-[hsl(270,50%,65%)]">
                  <div className="w-2 h-2 bg-[hsl(270,50%,65%)] rounded-full animate-pulse mr-2"></div>
                  <span className="text-sm font-medium">In Votazione</span>
                </div>
              ) : (
                <button
                  onClick={() => onSelectWine(wine.id)}
                  disabled={!!currentVotingWineId}
                  className={`
                    px-3 py-1 rounded-lg text-sm font-medium transition-all
                    ${currentVotingWineId
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-[hsl(270,50%,65%)] text-white hover:bg-[hsl(270,50%,55%)]'
                    }
                  `}
                >
                  <Play className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Control Buttons */}
      <div className="flex space-x-3">
        {currentVotingWineId && (
          <>
            <button
              onClick={onNextWine}
              className="flex-1 bg-[hsl(280,45%,70%)] text-white py-2 px-4 rounded-lg font-medium hover:bg-[hsl(280,45%,60%)] transition-colors flex items-center justify-center space-x-2"
            >
              <SkipForward className="w-4 h-4" />
              <span>Prossimo Vino</span>
            </button>
            
            <button
              onClick={onStopVoting}
              className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
            >
              <Square className="w-4 h-4" />
              <span>Ferma Votazioni</span>
            </button>
          </>
        )}
      </div>

      {!currentVotingWineId && wines.length > 0 && (
        <p className="text-center text-gray-500 text-sm">
          Seleziona un vino per iniziare le votazioni
        </p>
      )}
    </div>
  );
}