import { useState } from "react";
import { X } from "lucide-react";
import type { Wine, User, Vote } from "@shared/schema";

interface VotingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWine: Wine | null;
  wineContributor: User | null;
  userVote: Vote | undefined;
  onVote: (score: number) => void;
  wineLabel: string; // "Vino A", "Vino B", etc.
}

export function VotingModal({ 
  isOpen, 
  onClose, 
  currentWine, 
  wineContributor, 
  userVote, 
  onVote, 
  wineLabel 
}: VotingModalProps) {
  const [selectedScore, setSelectedScore] = useState<number | null>(
    userVote ? parseFloat(userVote.score) : null
  );

  if (!isOpen || !currentWine || !wineContributor) return null;

  // Generate score options from 1 to 10 with 0.5 steps
  const scoreOptions: number[] = [];
  for (let i = 1; i <= 10; i += 0.5) {
    scoreOptions.push(i);
  }

  const handleScoreSelect = (score: number) => {
    setSelectedScore(score);
  };

  const handleConfirmVote = () => {
    if (selectedScore !== null) {
      onVote(selectedScore);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Votazione in Corso</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Wine Card */}
        <div className="p-6">
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            {/* Wine Label */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-800">{wineLabel}</h3>
              <div className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-medium">
                €{currentWine.price}
              </div>
            </div>

            {/* Contributor */}
            <p className="text-gray-600 mb-4">
              Portato da: <span className="font-medium">{wineContributor.name}</span>
            </p>

            {/* Current Vote Status */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-700 font-medium">Il tuo voto:</span>
              <span className="text-gray-600">
                {userVote ? `${userVote.score}` : 'Non votato'}
              </span>
            </div>

            {/* Voting Grid */}
            <div className="grid grid-cols-5 gap-2 mb-4">
              {scoreOptions.map((score) => (
                <button
                  key={score}
                  onClick={() => handleScoreSelect(score)}
                  className={`
                    py-2 px-3 rounded-lg text-sm font-medium transition-all
                    ${selectedScore === score 
                      ? 'bg-[hsl(270,50%,65%)] text-white shadow-lg transform scale-105' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }
                  `}
                >
                  {score % 1 === 0 ? score.toString() : score.toFixed(1)}
                </button>
              ))}
            </div>

            {/* Instructions */}
            <p className="text-center text-sm text-gray-500 mb-4">
              Voti da 1 a 10 con step 0.5
            </p>

            {/* Confirm Button */}
            <button
              onClick={handleConfirmVote}
              disabled={selectedScore === null}
              className={`
                w-full py-3 rounded-xl font-bold transition-all
                ${selectedScore !== null
                  ? 'bg-gradient-to-r from-[hsl(270,50%,65%)] to-[hsl(280,45%,70%)] text-white hover:shadow-lg transform hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              CONFERMA VOTAZIONE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}