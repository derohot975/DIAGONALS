import { useQuery } from '@tanstack/react-query';
import { CheckCircle, BarChart3 } from '@/components/icons';

interface VotingCompletionCheckerProps {
  eventId: number;
  onCompleteEvent: (eventId: number) => void;
}

export default function VotingCompletionChecker({ eventId, onCompleteEvent }: VotingCompletionCheckerProps) {
  const { data: completionStatus } = useQuery<{
    isComplete: boolean;
    totalParticipants: number;
    totalWines: number;
    votesReceived: number;
  }>({
    queryKey: ['/api/events', eventId, 'voting-complete'],
    enabled: true,
    refetchInterval: 5000, // Check every 5 seconds
  });

  if (!completionStatus) return null;

  return completionStatus.isComplete ? (
    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-green-700">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Tutti hanno votato! Pronto per conclusione</span>
        </div>
        <button
          onClick={() => onCompleteEvent(eventId)}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Concludi Evento
        </button>
      </div>
      <div className="mt-2 text-xs text-green-600">
        {completionStatus.votesReceived} voti su {completionStatus.totalParticipants} partecipanti × {completionStatus.totalWines} vini
      </div>
    </div>
  ) : (
    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-center space-x-2 text-yellow-700">
        <BarChart3 className="w-5 h-5" />
        <span className="text-sm font-medium">Votazioni in corso...</span>
      </div>
      <div className="mt-1 text-xs text-yellow-600">
        {completionStatus.votesReceived} voti ricevuti - Mancano {(completionStatus.totalParticipants * completionStatus.totalWines) - completionStatus.votesReceived} voti
      </div>
    </div>
  );
}
