// Removed decorative icons for cleaner UI
import { EventReportData } from '@shared/schema';
import { formatEventDate, formatEventName } from '@/lib/utils';
import BottomNavBar from '../navigation/BottomNavBar';
import diagoLogo from '@assets/diagologo.png';

interface EventReportScreenProps {
  reportData: EventReportData | null;
  onGoBack: () => void;
  onGoHome: () => void;
}

export default function EventReportScreen({ reportData, onGoBack, onGoHome }: EventReportScreenProps) {
  if (!reportData) return null;

  const { eventInfo, wineResults } = reportData;

  return (
    <div className="flex-1 flex flex-col">
      {/* Logo Header */}
      <div className="flex-shrink-0 flex justify-center pt-8 pb-6">
        <img 
          src={diagoLogo} 
          alt="DIAGO Logo" 
          className="w-20 h-auto logo-filter drop-shadow-lg" 
        />
      </div>

      {/* Event Info Header */}
      <div className="flex-shrink-0 text-center mb-6">
        <div className="mb-2">
          <h1 className="event-name-standard text-2xl font-bold text-white">
            {formatEventName(eventInfo.name)}
          </h1>
        </div>
        <p className="text-yellow-200">
          {formatEventDate(eventInfo.date)} • Report Finale
        </p>
      </div>

      {/* Scrollable Content */}
      <div 
        className="overflow-y-auto px-4 pb-4" 
        style={{
          height: 'calc(100dvh - 200px - var(--bottom-nav-total, 88px) - env(safe-area-inset-top, 0px))'
        }}
      >
        <div className="max-w-4xl mx-auto">
          {/* Wine Rankings */}
          <div className="mb-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-white">Classifica Vini</h2>
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

          {/* Report Info */}
          <div className="text-center text-white/70 text-sm mb-4">
            Report generato il {new Date().toLocaleDateString('it-IT')}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavBar 
        onGoBack={onGoBack}
        onGoHome={onGoHome}
        layout="sides"
      />
    </div>
  );
}
