import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, BarChart3, AlertTriangle, X } from '@/components/icons';

interface CompletionStatus {
  isComplete: boolean;
  totalParticipants: number;
  totalWines: number;
  votesReceived: number;
  missingVotes: { userName: string; missingWineNames: string[] }[];
}

interface VotingCompletionCheckerProps {
  eventId: number;
  onCompleteEvent: (eventId: number) => void;
}

export default function VotingCompletionChecker({ eventId, onCompleteEvent }: VotingCompletionCheckerProps) {
  const [showReport, setShowReport] = useState(false);

  const { data: status } = useQuery<CompletionStatus>({
    queryKey: ['/api/events', eventId, 'voting-complete'],
    enabled: true,
    refetchInterval: 5000,
  });

  if (!status) return null;

  const expectedVotes = status.totalParticipants * (status.totalWines - 1);
  const missingCount = expectedVotes - status.votesReceived;

  const handleConcludiClick = () => {
    if (status.isComplete) {
      onCompleteEvent(eventId);
    } else {
      setShowReport(true);
    }
  };

  return (
    <div className="mt-4 space-y-3">
      {status.isComplete ? (
        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-2xl">
          <div className="flex items-center space-x-2 text-green-400 mb-1">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-bold">Tutti hanno votato</span>
          </div>
          <p className="text-xs text-green-400/60">
            {status.votesReceived} voti — pronto per la conclusione
          </p>
        </div>
      ) : (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
          <div className="flex items-center space-x-2 text-amber-400 mb-1">
            <BarChart3 className="w-4 h-4" />
            <span className="text-sm font-bold">Votazioni in corso</span>
          </div>
          <p className="text-xs text-amber-400/60">
            {status.votesReceived} voti ricevuti — mancano {missingCount} voti
          </p>
        </div>
      )}

      <button
        onClick={handleConcludiClick}
        className={`w-full font-bold py-4 rounded-2xl flex items-center justify-center space-x-2 border active:scale-95 transition-all ${
          status.isComplete
            ? 'bg-white text-red-950 border-transparent shadow-lg'
            : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
        }`}
      >
        <CheckCircle className="w-4 h-4" />
        <span>Concludi Evento</span>
      </button>

      {showReport && !status.isComplete && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm px-4 pb-8">
          <div className="w-full max-w-md bg-[#1e0404] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/10">
              <div className="flex items-center space-x-2 text-amber-400">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-bold text-base">Voti incompleti</span>
              </div>
              <button
                onClick={() => setShowReport(false)}
                className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 py-4">
              <p className="text-white/50 text-sm mb-4">
                L'evento non può essere concluso. I seguenti partecipanti non hanno ancora completato tutte le votazioni:
              </p>

              <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-hide">
                {status.missingVotes.map((item, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <p className="font-bold text-white text-sm mb-2">{item.userName}</p>
                    <div className="space-y-1">
                      {item.missingWineNames.map((wine, j) => (
                        <div key={j} className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400/60 flex-shrink-0" />
                          <p className="text-white/50 text-xs">{wine}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-center">
                <p className="text-amber-400/80 text-xs font-medium">
                  {missingCount} {missingCount === 1 ? 'voto mancante' : 'voti mancanti'} su {expectedVotes} totali
                </p>
              </div>
            </div>

            <div className="px-5 pb-5">
              <button
                onClick={() => setShowReport(false)}
                className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 text-white/60 font-bold text-sm active:scale-95 transition-all"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
