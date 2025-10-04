import { BarChart3, StickyNote, ArrowLeft, Home } from '@/components/icons';
import { formatEventDate, getCreatorName, formatEventName } from '@/lib/utils';
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
                    <h3 className="font-semibold text-sm text-white break-words leading-tight">{formatEventName(event.name)}</h3>
                    <p className="text-sm text-gray-300">{formatEventDate(event.date)}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onShowEventResults(event.id)}
                      className="p-2 bg-blue-200 hover:bg-blue-300 text-blue-800 rounded-lg transition-colors"
                      title="Visualizza Report"
                    >
                      <BarChart3 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onShowPagella(event.id)}
                      className="p-2 bg-yellow-200 hover:bg-yellow-300 text-yellow-800 rounded-lg transition-colors"
                      title="Visualizza Pagella"
                    >
                      <StickyNote className="w-5 h-5" />
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
      
      <BottomNavBar 
        layout="center"
        centerButtons={[
          {
            id: 'back',
            icon: <ArrowLeft className="w-6 h-6" />,
            onClick: onGoBack,
            title: 'Indietro',
            variant: 'glass'
          },
          {
            id: 'home',
            icon: <Home className="w-6 h-6" />,
            onClick: onGoHome,
            title: 'Home',
            variant: 'glass'
          }
        ]}
      />
    </div>
  );
}