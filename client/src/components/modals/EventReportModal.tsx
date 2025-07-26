import { X, Trophy, Users, Wine, BarChart3, Star } from 'lucide-react';
import { EventReportData } from '@shared/schema';
import { formatDate } from '../../lib/utils';

interface EventReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: EventReportData | null;
}

export default function EventReportModal({ isOpen, onClose, reportData }: EventReportModalProps) {
  if (!isOpen || !reportData) return null;

  const { eventInfo, userRankings, wineResults, summary } = reportData;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-3">
            <Trophy className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">{eventInfo.name}</h2>
              <p className="text-amber-100">{formatDate(eventInfo.date)} • Report Finale</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Wine Rankings Only */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Wine className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-semibold">Classifica Vini</h3>
            </div>
            
            <div className="space-y-3">
              {wineResults.map((wine, index) => (
                <div key={wine.id} className={`p-4 rounded-lg border ${
                  index === 0 ? 'bg-red-50 border-red-200' :
                  index === 1 ? 'bg-gray-50 border-gray-200' :
                  index === 2 ? 'bg-orange-50 border-orange-200' :
                  'bg-white border-gray-100'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0 ? 'bg-red-500 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-orange-500 text-white' :
                        'bg-gray-200 text-gray-700'
                      }`}>
                        {wine.position}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium break-words">{wine.name}</div>
                        <div className="text-sm text-gray-600">{wine.producer}</div>
                        <div className="text-xs text-gray-500">da {wine.contributor}</div>
                      </div>
                    </div>
                    <div className="text-right ml-2">
                      <div className="font-bold text-lg">{wine.averageScore.toFixed(1)}</div>
                      <div className="text-sm text-gray-500">{wine.totalVotes} voti</div>
                    </div>
                  </div>
                  
                  {/* Individual votes */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex flex-wrap gap-2">
                      {wine.votes.map((vote, voteIndex) => (
                        <div key={voteIndex} className="bg-gray-100 px-2 py-1 rounded text-xs">
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

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Report generato il {new Date().toLocaleDateString('it-IT')}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}