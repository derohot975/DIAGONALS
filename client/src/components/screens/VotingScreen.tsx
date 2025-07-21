import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Minus } from 'lucide-react';
import { WineEvent, User, Wine as WineType, Vote } from '@shared/schema';
import { formatDate } from '../../utils/helpers';
import diagoLogo from '@assets/diagologo.png';

interface VotingScreenProps {
  event: WineEvent | null;
  wines: WineType[];
  votes: Vote[];
  users: User[];
  currentUser: User | null;
  onGoBack: () => void;
  onVoteForWine: (wineId: number, score: number) => void;
}

export default function VotingScreen({
  event,
  wines,
  votes,
  users,
  currentUser,
  onGoBack,
  onVoteForWine
}: VotingScreenProps) {
  const [selectedScore, setSelectedScore] = useState<number>(5.0);
  const [currentWineIndex, setCurrentWineIndex] = useState<number>(0);

  if (!event || !currentUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <p className="text-gray-500">Evento non trovato</p>
      </div>
    );
  }

  // Get wines for this event
  const eventWines = wines.filter(w => w.eventId === event.id);
  
  // Get current wine being voted on (based on admin selection or sequence)
  const currentWine = event.currentVotingWineId 
    ? eventWines.find(w => w.id === event.currentVotingWineId)
    : eventWines[currentWineIndex];

  // Check if user has already voted for current wine
  const userVote = currentWine ? votes.find(v => 
    v.wineId === currentWine.id && v.userId === currentUser.id
  ) : null;

  // Get wine contributor
  const wineContributor = currentWine ? users.find(u => u.id === currentWine.userId) : null;

  // Get wine label (A, B, C, etc.)
  const getWineLabel = (wine: WineType) => {
    const index = eventWines.findIndex(w => w.id === wine.id);
    return `Vino ${String.fromCharCode(65 + index)}`;
  };

  const handleScoreChange = (increment: boolean) => {
    if (increment && selectedScore < 10) {
      setSelectedScore(Math.min(10, selectedScore + 0.5));
    } else if (!increment && selectedScore > 1) {
      setSelectedScore(Math.max(1, selectedScore - 0.5));
    }
  };

  const handleVoteSubmit = () => {
    if (currentWine && !userVote) {
      onVoteForWine(currentWine.id, selectedScore);
      setSelectedScore(5.0); // Reset to middle value
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Logo Header */}
      <div className="flex-shrink-0 flex justify-center pt-8 pb-6">
        <img 
          src={diagoLogo} 
          alt="DIAGO Logo" 
          className="mx-auto mb-2 w-24 h-auto logo-filter drop-shadow-lg" 
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Event Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">{event.name}</h2>
            <div className="inline-block bg-gradient-to-r from-[hsl(270,50%,75%)] to-[hsl(280,45%,70%)] px-6 py-3 rounded-2xl shadow-lg">
              <span className="text-xl font-bold text-white">{formatDate(event.date)}</span>
            </div>
          </div>

          {/* Current Wine Display */}
          {currentWine && (
            <div className="glass-effect rounded-3xl shadow-2xl p-8 animate-fade-in">
              
              {/* Wine Label */}
              <div className="text-center mb-6">
                <h3 className="text-3xl font-bold text-gray-800 mb-2">
                  {getWineLabel(currentWine)}
                </h3>
                <p className="text-lg text-gray-600">
                  Portato da: <span className="font-bold">{wineContributor?.name || 'Sconosciuto'}</span>
                </p>
              </div>

              {/* Voting Section */}
              {event.votingStatus === 'voting' && !userVote ? (
                <div className="space-y-6">
                  
                  {/* Score Display */}
                  <div className="text-center">
                    <div className="inline-block bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-4 rounded-2xl shadow-lg">
                      <span className="text-4xl font-bold">{selectedScore.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Number Grid 1-10 with 0.5 steps */}
                  <div className="grid grid-cols-5 gap-3 mb-6">
                    {Array.from({ length: 19 }, (_, i) => {
                      const score = 1 + (i * 0.5);
                      return (
                        <button
                          key={score}
                          onClick={() => setSelectedScore(score)}
                          className={`p-3 rounded-lg font-bold text-lg transition-all ${
                            selectedScore === score
                              ? 'bg-purple-600 text-white shadow-lg scale-105'
                              : 'bg-white text-gray-700 hover:bg-purple-100 shadow-md'
                          }`}
                        >
                          {score.toFixed(1)}
                        </button>
                      );
                    })}
                  </div>

                  {/* Plus/Minus Controls */}
                  <div className="flex items-center justify-center space-x-4 mb-6">
                    <button
                      onClick={() => handleScoreChange(false)}
                      disabled={selectedScore <= 1}
                      className={`p-4 rounded-full ${
                        selectedScore <= 1 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
                      } transition-all`}
                    >
                      <Minus className="w-6 h-6" />
                    </button>
                    
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Punteggio Selezionato</p>
                      <p className="text-2xl font-bold text-gray-800">{selectedScore.toFixed(1)}</p>
                    </div>
                    
                    <button
                      onClick={() => handleScoreChange(true)}
                      disabled={selectedScore >= 10}
                      className={`p-4 rounded-full ${
                        selectedScore >= 10 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-green-500 hover:bg-green-600 text-white shadow-lg'
                      } transition-all`}
                    >
                      <Plus className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Confirm Vote Button */}
                  <button
                    onClick={handleVoteSubmit}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-4 px-8 rounded-2xl text-xl transition-all duration-200 hover:scale-105 shadow-xl"
                  >
                    CONFERMA VOTAZIONE
                  </button>
                </div>
              ) : userVote ? (
                <div className="text-center py-8">
                  <div className="inline-block bg-green-100 text-green-800 px-6 py-3 rounded-xl">
                    <p className="font-bold">✓ Voto registrato: {userVote.score}</p>
                  </div>
                  <p className="text-gray-600 mt-2">Attendi il prossimo vino</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">Attendi l'attivazione delle votazioni</p>
                </div>
              )}
            </div>
          )}

          {/* No wine selected */}
          {!currentWine && (
            <div className="glass-effect rounded-2xl shadow-2xl p-12 text-center">
              <h2 className="text-2xl font-bold text-gray-600 mb-4">Nessun Vino in Votazione</h2>
              <p className="text-gray-500 text-lg">Attendi che l'admin selezioni un vino per iniziare</p>
            </div>
          )}
        </div>
      </div>

      {/* Back Button */}
      <div className="fixed bottom-4 left-4 z-50">
        <button
          onClick={onGoBack}
          className="bg-[hsl(229,73%,69%)] hover:bg-[hsl(270,50%,65%)] text-white p-3 rounded-full shadow-lg transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}