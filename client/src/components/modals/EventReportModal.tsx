import { Trophy, Users, WineIcon as Wine, BarChart3, Star } from '@/components/icons';
import BaseModal from '../ui/BaseModal';
import { EventReportData } from '@shared/schema';
import { formatEventDate, formatEventName } from '@/lib/utils';

interface EventReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: EventReportData | null;
}

export default function EventReportModal({ isOpen, onClose, reportData }: EventReportModalProps) {
  if (!reportData) return null;

  const { eventInfo, userRankings, wineResults, summary } = reportData;

  const title = (
    <div className="flex items-center space-x-3">
      <Trophy className="w-8 h-8" />
      <div>
        <div className="event-name-standard text-xl font-bold whitespace-nowrap overflow-hidden text-ellipsis max-w-sm">{formatEventName(eventInfo.name)}</div>
        <div className="text-amber-100">{formatEventDate(eventInfo.date)} • Report Finale</div>
      </div>
    </div>
  );

  const footer = (
    <div className="flex justify-between items-center">
      <div className="text-sm text-white/45">
        Report generato il {new Date().toLocaleDateString('it-IT')}
      </div>
      <button
        onClick={onClose}
        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
      >
        Chiudi
      </button>
    </div>
  );

  return (
    <BaseModal
      open={isOpen}
      onOpenChange={onClose}
      title={title}
      size="xl"
      footer={footer}
      headerClassName="bg-gradient-to-r from-amber-500 to-yellow-600 text-white"
    >

      <div className="overflow-y-auto">
          {/* Wine Rankings Only */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Wine className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-semibold">Classifica Vini</h3>
            </div>
            
            <div className="space-y-3">
              {wineResults.map((wine, index) => (
                <div key={wine.id} className={`p-4 rounded-lg border ${
                  index === 0 ? 'bg-red-500/10 border-red-500/20' :
                  index === 1 ? 'bg-white/6 border-white/10' :
                  index === 2 ? 'bg-amber-500/10 border-amber-500/20' :
                  'bg-white/5 border-white/8'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0 ? 'bg-red-500 text-white' :
                        index === 1 ? 'bg-white/25 text-white' :
                        index === 2 ? 'bg-orange-500 text-white' :
                        'bg-white/10 text-white/60'
                      }`}>
                        {wine.position}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium break-words text-white">{wine.name}</div>
                        <div className="text-sm text-white/55">{wine.producer}</div>
                        <div className="text-xs text-white/40">da {wine.contributor}</div>
                      </div>
                    </div>
                    <div className="text-right ml-2">
                      <div className="font-bold text-lg text-white">{wine.averageScore.toFixed(1)}</div>
                      <div className="text-sm text-white/45">{wine.totalVotes} voti</div>
                    </div>
                  </div>
                  
                  {/* Individual votes */}
                  <div className="mt-3 pt-3 border-t border-white/8">
                    <div className="flex flex-wrap gap-2">
                      {wine.votes.map((vote, voteIndex) => (
                        <div key={voteIndex} className="bg-white/8 text-white/65 px-2 py-1 rounded text-xs">
                          {vote.userName}: {vote.score}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
      </div>
    </BaseModal>
  );
}