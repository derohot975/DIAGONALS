import { ArrowLeft, Home } from '@/components/icons';
import { EventReportData } from '@shared/schema';
import { formatEventDate, formatEventName } from '@/lib/utils';
import BottomNavBar from '../navigation/BottomNavBar';
import diagoLogo from '@assets/diagologo.png';

interface EventReportScreenProps {
  reportData: EventReportData | null;
  onGoBack: () => void;
  onGoHome: () => void;
}

const RANK_COLORS = [
  { bg: 'bg-yellow-400', text: 'text-yellow-950' },
  { bg: 'bg-gray-300', text: 'text-gray-800' },
  { bg: 'bg-orange-400', text: 'text-orange-950' },
];

export default function EventReportScreen({ reportData, onGoBack, onGoHome }: EventReportScreenProps) {
  if (!reportData) return null;
  const { eventInfo, wineResults } = reportData;

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b px-6 pt-10 pb-6 flex flex-col items-center">
        <img src={diagoLogo} alt="Logo" className="w-16 h-auto mb-5 grayscale opacity-40" />
        <h1 className="text-xl font-black text-gray-900 tracking-tight">{formatEventName(eventInfo.name)}</h1>
        <p className="text-sm text-gray-400 mt-1">{formatEventDate(eventInfo.date)} · Report Finale</p>
      </div>

      {/* Scrollable content */}
      <div
        className="overflow-y-auto px-6 scrollbar-hide"
        style={{
          height: 'calc(100dvh - 200px - var(--bottom-nav-total, 88px) - env(safe-area-inset-top, 0px))'
        }}
      >
        <div className="max-w-md mx-auto py-6 space-y-4">
          {wineResults.map((wine, index) => (
            <div key={wine.id} className={`bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden`}>
              <div className="p-5">
                <div className="flex items-start space-x-4">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm flex-shrink-0 ${
                    index < 3 ? `${RANK_COLORS[index].bg} ${RANK_COLORS[index].text}` : 'bg-gray-100 text-gray-500'
                  }`}>
                    {wine.position}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1 mr-4">
                        <p className="font-bold text-gray-900 leading-tight">{wine.name}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{wine.producer}</p>
                        <p className="text-xs text-gray-400 mt-0.5">da {wine.contributor}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-2xl font-black text-gray-900">{wine.averageScore.toFixed(1)}</p>
                        <p className="text-xs text-gray-400">{wine.totalVotes} voti</p>
                      </div>
                    </div>
                    {/* Individual votes */}
                    <div className="mt-3 pt-3 border-t border-gray-50 flex flex-wrap gap-2">
                      {wine.votes.map((vote, voteIndex) => (
                        <span key={voteIndex} className="bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1 rounded-full">
                          {vote.userName}: {vote.score}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <p className="text-center text-gray-300 text-xs pb-4">
            Report generato il {new Date().toLocaleDateString('it-IT')}
          </p>
        </div>
      </div>

      <BottomNavBar
        layout="center"
        centerButtons={[
          { id: 'back', icon: <ArrowLeft className="w-6 h-6" />, onClick: onGoBack, title: 'Indietro', variant: 'glass' as const },
          { id: 'home', icon: <Home className="w-6 h-6" />, onClick: onGoHome, title: 'Home', variant: 'glass' as const }
        ]}
      />
    </div>
  );
}
