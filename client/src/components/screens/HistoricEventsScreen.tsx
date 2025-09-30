import { ArrowLeft, Home, Calendar, Trophy, Users, Wine, BarChart3, StickyNote } from '@/components/icons';
import { formatEventDate, getCreatorName } from '../../lib/utils';
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
                    <p className="text-sm text-gray-300 mb-1">{formatEventDate(event.date)}</p>
                    <h3 className="font-semibold text-sm text-white break-words leading-tight">{event.name}</h3>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <button
                      onClick={() => onShowEventResults(event.id)}
                      className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-colors"
                      title="Visualizza Report"
                    >
                      <BarChart3 className="w-4 h-4 inline mr-1" />
                      Report
                    </button>
                    <button
                      onClick={() => onShowPagella(event.id)}
                      className="px-3 py-1 bg-yellow-200 hover:bg-yellow-300 text-yellow-800 rounded-lg text-sm font-medium transition-colors"
                      title="Visualizza Pagella"
                    >
                      <StickyNote className="w-4 h-4 inline mr-1" />
                      Pagella
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            /* Empty State */
            <div className="glass-effect rounded-2xl shadow-2xl p-12 text-center">
              <BarChart3 className="w-20 h-20 text-gray-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-600 mb-4">Nessun Evento Completato</h2>
              <p className="text-gray-500 text-lg">Gli eventi completati appariranno qui per consultare i report</p>
            </div>
          )}
          
        </div>
      </div>
      
      <BottomNavBar onGoBack={onGoBack} onGoHome={onGoHome} layout="center" />
    </div>
  );
}