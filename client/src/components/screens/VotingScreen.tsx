import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
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
                <div className="space-y-8">
                  
                  {/* iPhone-style Picker */}
                  <div className="relative bg-white rounded-3xl shadow-2xl p-8">
                    
                    {/* Title */}
                    <div className="text-center mb-8">
                      <h4 className="text-xl font-semibold text-gray-700 mb-6">Seleziona il tuo voto</h4>
                    </div>

                    {/* Scrollable Purple Box */}
                    <div className="relative mx-auto" style={{ width: '300px', height: '120px' }}>
                      
                      {/* Invisible scroll area covering the purple box */}
                      <div 
                        className="absolute inset-0 overflow-y-auto scrollbar-hide z-30"
                        onScroll={(e) => {
                          const scrollTop = e.currentTarget.scrollTop;
                          const itemHeight = 40; // Height of each virtual item
                          const maxIndex = 18; // 19 items total (0-18)
                          const index = Math.round(scrollTop / itemHeight);
                          const clampedIndex = Math.max(0, Math.min(maxIndex, index));
                          const newScore = 1 + (clampedIndex * 0.5);
                          setSelectedScore(newScore);
                        }}
                      >
                        {/* Virtual scroll content - invisible but provides scroll height */}
                        <div style={{ height: '760px' }}></div> {/* 19 items * 40px = 760px */}
                      </div>
                      
                      {/* Purple Box - displays selected value */}
                      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-16 py-6 rounded-2xl shadow-lg">
                          <span className="text-5xl font-bold">{selectedScore.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>


                  </div>

                  {/* Confirm Vote Button */}
                  <button
                    onClick={handleVoteSubmit}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-4 px-8 rounded-2xl text-xl transition-all duration-200 active:scale-95 shadow-xl"
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