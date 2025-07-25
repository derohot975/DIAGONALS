import { Download, Crown, Star, Users, ArrowLeft, Home } from 'lucide-react';
import { WineEvent, WineResult } from '@shared/schema';
import { formatPrice } from '../../lib/utils';
import diagoLogo from '@assets/diagologo.png';

interface EventResultsScreenProps {
  event: WineEvent | null;
  results: WineResult[];
  onGoBack?: () => void;
  onGoHome?: () => void;
}

export default function EventResultsScreen({ event, results, onGoBack, onGoHome }: EventResultsScreenProps) {
  if (!event) return null;



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

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="max-w-4xl mx-auto space-y-4">
        <div className="glass-effect rounded-2xl shadow-2xl p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-[hsl(270,50%,65%)] mb-2">Risultati Finali</h2>
            <p className="text-gray-600 text-lg">{event.name}</p>
            <p className="text-gray-600">{event.date}</p>
            <div className="flex justify-center mt-4">
              <button className="bg-[hsl(229,73%,69%)] hover:bg-[hsl(270,50%,65%)] text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-colors">
                <Download className="w-4 h-4" />
                <span>Esporta</span>
              </button>
            </div>
          </div>
          
          {results.length === 0 ? (
            <div className="text-center py-12">
              <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Nessun risultato disponibile</p>
              <p className="text-gray-400 text-sm">Non ci sono ancora voti per questo evento</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div key={result.id} className={`bg-white rounded-xl p-4 border-2 wine-card-hover relative ${
                    index === 0 ? 'border-[hsl(43,96%,56%)]/30' : 'border-gray-300'
                  }`}>
                    <div className={`absolute top-4 left-4 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0 ? 'bg-[hsl(43,96%,56%)] text-white' : 'bg-gray-400 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="ml-12">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold text-lg text-gray-800">{result?.name || 'Vino senza nome'}</h3>
                          {index === 0 && <Crown className="w-5 h-5 text-[hsl(43,96%,56%)]" />}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="bg-[hsl(43,96%,56%)] text-white px-2 py-1 rounded-full text-xs">
                            {formatPrice(result?.price || '0')}
                          </span>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-[hsl(43,96%,56%)]" />
                            <span className="font-bold text-lg">{(result?.averageScore || 0).toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-gray-600 text-sm">
                          Portato da: <span className="font-medium">{result?.contributor || 'Sconosciuto'}</span>
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{result?.totalVotes || 0} voti</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              

            </>
          )}
        </div>
      </div>
      
      {/* Navigation Buttons */}
      {onGoBack && (
        <div className="fixed bottom-4 left-4 z-50">
          <button
            onClick={onGoBack}
            className="bg-[hsl(229,73%,69%)] hover:bg-[hsl(270,50%,65%)] text-white p-3 rounded-full shadow-lg transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      )}
      
      {onGoHome && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={onGoHome}
            className="bg-[hsl(229,73%,69%)] hover:bg-[hsl(270,50%,65%)] text-white p-3 rounded-full shadow-lg transition-all"
            title="Torna alla Home"
          >
            <Home className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
    </div>
  );
}
