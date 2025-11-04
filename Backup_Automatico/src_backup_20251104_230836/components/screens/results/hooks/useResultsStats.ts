import { useMemo } from 'react';
import { WineResultDetailed } from '@shared/schema';

interface UseResultsStatsProps {
  results: WineResultDetailed[];
}

export function useResultsStats({ results }: UseResultsStatsProps) {
  const stats = useMemo(() => {
    const totalParticipants = results.length > 0 ? Math.max(...results.map(r => r?.totalVotes || 0)) : 0;
    const totalWines = results.length;
    const totalVotes = results.reduce((sum, result) => sum + (result?.totalVotes || 0), 0);
    const averageScore = results.length > 0 
      ? results.reduce((sum, result) => sum + (result?.averageScore || 0), 0) / results.length 
      : 0;

    return {
      totalParticipants,
      totalWines,
      totalVotes,
      averageScore,
    };
  }, [results]);

  return stats;
}
