import { useState } from 'react';
import { Download, Crown, Star, Users, ArrowLeft, Home, ChevronDown, ChevronUp } from 'lucide-react';
import { WineEvent, WineResultDetailed } from '@shared/schema';
import { formatPrice } from '../../lib/utils';
import diagoLogo from '@assets/diagologo.png';

interface EventResultsScreenProps {
  event: WineEvent | null;
  results: WineResultDetailed[];
  onGoBack?: () => void;
  onGoHome?: () => void;
}

export default function EventResultsScreen({ event, results, onGoBack, onGoHome }: EventResultsScreenProps) {
  if (!event) return null;
  
  // State per gestire l'espansione dei voti individuali
  const [expandedWines, setExpandedWines] = useState<Set<number>>(new Set());

  // Calcola le statistiche generali
  const totalParticipants = results.length > 0 ? Math.max(...results.map(r => r?.totalVotes || 0)) : 0;
  const totalWines = results.length;
  const totalVotes = results.reduce((sum, result) => sum + (result?.totalVotes || 0), 0);
  const averageScore = results.length > 0 
    ? results.reduce((sum, result) => sum + (result?.averageScore || 0), 0) / results.length 
    : 0;
    
  // Funzione per toggle dell'espansione
  const toggleExpandWine = (wineId: number) => {
    const newExpanded = new Set(expandedWines);
    if (newExpanded.has(wineId)) {
      newExpanded.delete(wineId);
    } else {
      newExpanded.add(wineId);
    }
    setExpandedWines(newExpanded);
  };

  const handleExport = async () => {
    // Formatta i risultati per la condivisione
    const formatResults = () => {
      let text = `🏆 CLASSIFICA FINALE\n`;
      text += `🍷 ${event.name}\n`;
      text += `📅 ${event.date}\n\n`;
      
      results.forEach((result, index) => {
        const position = index + 1;
        const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : `${position}.`;
        text += `${medal} ${result?.name || 'Vino senza nome'}\n`;
        text += `   ⭐ ${(result?.averageScore || 0).toFixed(1)} punti\n`;
        text += `   💰 ${result?.price || '0'}€\n`;
        text += `   👤 Portato da: ${result?.contributor || 'Sconosciuto'}\n`;
        text += `   🗳️ ${result?.totalVotes || 0} voti\n\n`;
      });
      
      text += `📱 Generato dall'app DIAGONALE`;
      return text;
    };

    const shareData = {
      title: `Classifica ${event.name}`,
      text: formatResults(),
    };

    try {
      // Prova la Web Share API nativa (mobile)
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: copia negli appunti
        await navigator.clipboard.writeText(shareData.text);
        alert('Risultati copiati negli appunti! Puoi incollarli dove preferisci.');
      }
    } catch (error) {
      // Fallback finale: mostra i risultati in un alert
      console.error('Errore durante la condivisione:', error);
      alert('Impossibile condividere. I risultati:\n\n' + shareData.text);
    }
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

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="max-w-4xl mx-auto space-y-4">
        <div className="glass-effect rounded-2xl shadow-2xl p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-[hsl(270,50%,65%)] mb-2">Classifica Finale</h2>
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
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-[hsl(43,96%,56%)]" />
                          <span className="font-bold text-lg">{(result?.averageScore || 0).toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-gray-600 text-sm">
                            Portato da: <span className="font-medium">{result?.contributor || 'Sconosciuto'}</span>
                          </p>
                          
                          {/* Pulsante per espandere/collassare voti individuali */}
                          {result?.votes && result.votes.length > 0 && (
                            <button
                              onClick={() => toggleExpandWine(result.id)}
                              className="flex items-center space-x-1 text-xs text-[hsl(43,96%,56%)] hover:text-[hsl(43,96%,46%)] transition-colors py-1 px-2 rounded"
                            >
                              <span>Voti individuali</span>
                              {expandedWines.has(result.id) ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>
                        
                        {/* Dettagli voti individuali - Collassabile */}
                        {result?.votes && result.votes.length > 0 && expandedWines.has(result.id) && (
                          <div className="bg-gray-50 rounded-lg p-3 animate-in slide-in-from-top-2 duration-200">
                            <div className="flex flex-wrap gap-2">
                              {result.votes.map(vote => {
                                // Mostra il nome solo se è il proprietario del vino
                                const isOwner = vote.userId === result.userId;
                                return (
                                  <span 
                                    key={vote.userId} 
                                    className="inline-flex items-center bg-white px-2 py-1 rounded text-xs border shadow-sm"
                                  >
                                    {isOwner ? (
                                      <>
                                        <span className="font-medium">{vote.userName}:</span>
                                        <span className="ml-1 text-[hsl(43,96%,56%)] font-semibold">{vote.score}</span>
                                      </>
                                    ) : (
                                      <span className="text-[hsl(43,96%,56%)] font-semibold">{vote.score}</span>
                                    )}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pulsante Esporta alla fine */}
              <div className="flex justify-center mt-6">
                <button 
                  onClick={handleExport}
                  className="bg-[hsl(229,73%,69%)] hover:bg-[hsl(270,50%,65%)] text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Condividi</span>
                </button>
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
