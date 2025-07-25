import { useState } from 'react';
import { ArrowLeft, Play, Square, SkipForward } from 'lucide-react';
import { WineEvent, User, Wine as WineType } from '@shared/schema';
import { formatDate } from '../../utils/helpers';
import diagoLogo from '@assets/diagologo.png';

interface AdminWineManagementScreenProps {
  event: WineEvent | null;
  wines: WineType[];
  users: User[];
  onGoBack: () => void;
  onSelectCurrentWine: (eventId: number, wineId: number) => void;
  onNextWine: (eventId: number) => void;
  onStopVoting: (eventId: number) => void;
}

export default function AdminWineManagementScreen({
  event,
  wines,
  users,
  onGoBack,
  onSelectCurrentWine,
  onNextWine,
  onStopVoting
}: AdminWineManagementScreenProps) {
  
  if (!event) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <p className="text-gray-500">Evento non trovato</p>
      </div>
    );
  }

  // Get wines for this event
  const eventWines = wines.filter(w => w.eventId === event.id);
  
  // Get wine contributor
  const getWineContributor = (wine: WineType) => {
    return users.find(u => u.id === wine.userId);
  };

  // Get wine label (A, B, C, etc.)
  const getWineLabel = (wine: WineType) => {
    const index = eventWines.findIndex(w => w.id === wine.id);
    return `Vino ${String.fromCharCode(65 + index)}`;
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Logo Header */}
      <div className="flex-shrink-0 flex justify-center pt-8 pb-6">
        <img 
          src={diagoLogo} 
          alt="DIAGO Logo" 
          className="mx-auto mb-2 w-24 h-auto logo-filter drop-shadow-lg" 
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Event Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Gestione Votazioni Sequenziali</h2>
            <h3 className="text-xl font-bold text-white mb-2">{event.name}</h3>
            <div className="inline-block bg-gradient-to-r from-[hsl(270,50%,75%)] to-[hsl(280,45%,70%)] px-6 py-3 rounded-2xl shadow-lg">
              <span className="text-xl font-bold text-white">{formatDate(event.date)}</span>
            </div>
          </div>

          {/* Wine List */}
          <div className="glass-effect rounded-3xl shadow-2xl p-8 animate-fade-in">
            <h4 className="text-xl font-bold text-gray-800 mb-6 text-center">
              Gestione Votazioni Sequenziali
            </h4>

            <div className="space-y-4">
              {eventWines.map(wine => {
                const contributor = getWineContributor(wine);
                const isCurrentVoting = event.currentVotingWineId === wine.id;
                
                return (
                  <div 
                    key={wine.id}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                      isCurrentVoting 
                        ? 'border-purple-500 bg-purple-50 shadow-lg' 
                        : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex-1">
                      <h5 className="font-bold text-lg text-gray-800">
                        {getWineLabel(wine)}
                      </h5>
                      <p className="text-gray-600">
                        Portato da: <span className="font-semibold">{contributor?.name || 'Sconosciuto'}</span>
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {isCurrentVoting && (
                        <span className="px-3 py-1 bg-purple-500 text-white rounded-full text-sm font-bold animate-pulse">
                          IN VOTAZIONE
                        </span>
                      )}
                      
                      <button
                        onClick={() => onSelectCurrentWine(event.id, wine.id)}
                        disabled={isCurrentVoting}
                        className={`p-2 rounded-full transition-all ${
                          isCurrentVoting
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-[hsl(340,70%,35%)] hover:bg-[hsl(340,80%,30%)] text-white shadow-lg hover:scale-105'
                        }`}
                        title={isCurrentVoting ? 'Già in votazione' : 'Seleziona per votazione'}
                      >
                        <Play className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {eventWines.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">Nessun vino registrato per questo evento</p>
              </div>
            )}

            {/* Control Buttons */}
            {event.currentVotingWineId && (
              <div className="mt-8 space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    Vino corrente in votazione: <span className="font-bold">
                      {getWineLabel(eventWines.find(w => w.id === event.currentVotingWineId)!)}
                    </span>
                  </p>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => onNextWine(event.id)}
                    className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-all hover:scale-105 shadow-lg"
                  >
                    <SkipForward className="w-5 h-5" />
                    <span>VINO SUCCESSIVO</span>
                  </button>
                  
                  <button
                    onClick={() => onStopVoting(event.id)}
                    className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all hover:scale-105 shadow-lg"
                  >
                    <Square className="w-5 h-5" />
                    <span>FERMA VOTAZIONI</span>
                  </button>
                </div>
              </div>
            )}

            {!event.currentVotingWineId && eventWines.length > 0 && (
              <div className="mt-8 text-center">
                <p className="text-gray-600 text-lg">
                  Seleziona un vino per iniziare le votazioni
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="fixed bottom-4 left-4 z-50">
        <button
          onClick={onGoBack}
          className="bg-[hsl(229,73%,69%)] hover:bg-[hsl(270,50%,65%)] text-white p-3 rounded-full shadow-lg transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}