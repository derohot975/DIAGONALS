// Removed unused decorative icon imports
import { formatEventDate, getCreatorName } from '@/lib/utils';
import diagoLogo from '@assets/diagologo.png';
import BottomNavBar from '../navigation/BottomNavBar';

import { User, WineEvent } from '@shared/schema';

interface HistoricEventsScreenProps {
  events: WineEvent[];
  users: User[];
  onShowEventResults: (eventId: number) => void;
  onShowPagella: (eventId: number) => void;
  onGoBack: () => void;
  onGoHome: () => void;
}

export default function HistoricEventsScreen({ 
  events, 
  users, 
  onShowEventResults,
  onShowPagella,
  onGoBack,
  onGoHome
}: HistoricEventsScreenProps) {
  // Filtra solo gli eventi completati
  const completedEvents = events.filter(event => event.status === 'completed');



  return (
    <div className="flex-1 flex flex-col">
      {/* Logo Header */}
      <div className="flex-shrink-0 flex justify-center pt-8 pb-4">
        <img 
          src={diagoLogo} 
          alt="DIAGO Logo" 
          className="mx-auto mb-2 w-24 h-auto logo-filter drop-shadow-lg" 
        />
      </div>

      {/* Title */}
      <div className="flex-shrink-0 text-center pb-6">
        <h2 className="text-2xl font-bold text-yellow-200">
          Storico Eventi
        </h2>
      </div>

      {/* Scrollable Content */}
      <div 
        className="overflow-y-auto px-4 pb-4" 
        style={{
          height: 'calc(100dvh - 120px - var(--bottom-nav-total, 88px) - env(safe-area-inset-top, 0px))'
        }}
      >
        <div className="max-w-2xl mx-auto space-y-4">
          
          {/* Completed Events */}
          {completedEvents.length > 0 ? (
            completedEvents.map(event => (
              <div key={event.id} className="bg-[#300505] rounded-xl p-4 border border-[#8d0303] shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-white break-words leading-tight">{event.name}</h3>
                    <p className="text-sm text-gray-300">{formatEventDate(event.date)}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onShowEventResults(event.id)}
                      className="p-2 bg-blue-200 hover:bg-blue-300 text-blue-800 rounded-lg transition-colors"
                      title="Visualizza Report"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onShowPagella(event.id)}
                      className="p-2 bg-yellow-200 hover:bg-yellow-300 text-yellow-800 rounded-lg transition-colors"
                      title="Visualizza Pagella"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            /* Empty State */
            <div className="glass-effect rounded-2xl shadow-2xl p-12 text-center">
              <h2 className="text-2xl font-bold text-gray-600 mb-4">Nessun Evento Completato</h2>
              <p className="text-gray-500 text-lg">Gli eventi completati appariranno qui per consultare i report</p>
            </div>
          )}
          
        </div>
      </div>
      
      <BottomNavBar onGoBack={onGoBack} onGoHome={onGoHome} layout="sides" />
    </div>
  );
}