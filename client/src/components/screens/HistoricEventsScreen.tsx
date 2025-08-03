import { BarChart3, Home, ArrowLeft } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import diagoLogo from '@assets/diagologo.png';

import { User, WineEvent } from '@shared/schema';

interface HistoricEventsScreenProps {
  events: WineEvent[];
  users: User[];
  onShowEventResults: (eventId: number) => void;
  onGoBack: () => void;
  onGoHome: () => void;
}

export default function HistoricEventsScreen({ 
  events, 
  users, 
  onShowEventResults,
  onGoBack,
  onGoHome
}: HistoricEventsScreenProps) {
  // Filtra solo gli eventi completati
  const completedEvents = events.filter(event => event.status === 'completed');

  const getCreatorName = (createdBy: number) => {
    const user = users.find(u => u.id === createdBy);
    return user?.name || 'Unknown';
  };

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
          📚 Storico Eventi
        </h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="max-w-2xl mx-auto space-y-4">
          
          {/* Completed Events */}
          {completedEvents.length > 0 ? (
            completedEvents.map(event => (
              <div key={event.id} className="bg-[#300505] rounded-xl p-4 border border-[#8d0303] shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-300 mb-1">{formatDate(event.date)}</p>
                    <h3 className="font-semibold text-sm text-white break-words leading-tight">{event.name}</h3>
                    <p className="text-xs text-gray-400 mt-1">Creato da: {getCreatorName(event.createdBy)}</p>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() => onShowEventResults(event.id)}
                      className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-colors"
                      title="Visualizza Report"
                    >
                      <BarChart3 className="w-4 h-4 inline mr-1" />
                      Report
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
      
      {/* Navigation Buttons - Bottom Center */}
      <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={onGoBack}
            className="text-white p-3 rounded-full shadow-lg transition-all hover:bg-white hover:bg-opacity-10"
            style={{background: 'rgba(255, 255, 255, 0.1)'}}
            title="Indietro"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={onGoHome}
            className="text-white p-3 rounded-full shadow-lg transition-all hover:bg-white hover:bg-opacity-10"
            style={{background: 'rgba(255, 255, 255, 0.1)'}}
            title="Home"
          >
            <Home className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}