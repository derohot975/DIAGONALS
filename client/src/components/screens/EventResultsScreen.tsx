import { useState } from 'react';
import { Download, Crown, Star, Users, ArrowLeft, Home, ChevronDown, ChevronUp } from '@/components/icons';
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
      // Sharing error handled
      alert('Impossibile condividere. I risultati:\n\n' + shareData.text);
    }
  };



  return (
    <div className="h-full flex flex-col">
      {/* Fixed Header - Logo + Title */}
      <div className="sticky top-0 z-20 flex-shrink-0 pt-[env(safe-area-inset-top)]" style={{background: '#300505'}}>
        <div className="flex justify-center pt-4 pb-4">
          <img 
            src={diagoLogo} 
            alt="DIAGO Logo" 
            className="mx-auto mb-2 w-24 h-auto logo-filter drop-shadow-lg" 
          />
        </div>
        <div className="text-center pb-6">
          <h2 className="text-2xl font-bold text-yellow-200 mb-2">Classifica Finale</h2>
        </div>
      </div>

      {/* Scrollable Content */}
      <div 
        className="px-4 scrollable-area overflow-y-auto" 
        style={{
          height: 'calc(100dvh - 200px - var(--bottom-nav-total, 88px) - env(safe-area-inset-top, 0px))',
          maxHeight: 'calc(100dvh - 200px - var(--bottom-nav-total, 88px) - env(safe-area-inset-top, 0px))'
        }}
      >
        <div className="max-w-4xl mx-auto space-y-4">
          
          {results.length === 0 ? (
            <div className="text-center py-12">
              <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Nessun risultato disponibile</p>
              <p className="text-gray-400 text-sm">Non ci sono ancora voti per questo evento</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {results.map((result, index) => (
                  <div 
                    key={result.id} 
                    className={`bg-white rounded-xl p-2 border-2 wine-card-hover relative cursor-pointer transition-all duration-200 ${
                      index === 0 ? 'border-[hsl(43,96%,56%)]/30' : 'border-gray-300'
                    } ${expandedWines.has(result.id) ? 'shadow-lg' : 'hover:shadow-md'}`}
                    onClick={() => toggleExpandWine(result.id)}
                  >
                    <div className={`absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0 ? 'bg-[hsl(43,96%,56%)] text-white' : 'bg-gray-400 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="ml-12">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-bold text-lg text-gray-800 uppercase">{result?.contributor || 'SCONOSCIUTO'}</h3>
                              {index === 0 && <Crown className="w-5 h-5 text-[hsl(43,96%,56%)]" />}
                            </div>
                            <p className="text-sm text-gray-600">{result?.name || 'Vino senza nome'}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-lg">{(result?.averageScore || 0).toFixed(1)}</span>
                          {expandedWines.has(result.id) ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        
                        {/* Informazioni complete del vino - Collassabile */}
                        {expandedWines.has(result.id) && (
                          <div className="bg-gray-50 rounded-lg p-2.5 mt-2 animate-in slide-in-from-top-2 duration-200 space-y-2.5">
                            {/* Dettagli del vino - Layout ultra-compatto */}
                            <div className="space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tipo</span>
                                <span className="text-sm font-medium text-gray-800">{result.type || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Produttore</span>
                                <span className="text-sm font-medium text-gray-800">{result.producer || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Vitigno</span>
                                <span className="text-sm font-medium text-gray-800">{result.grape || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Anno</span>
                                <span className="text-sm font-medium text-gray-800">{result.year || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Origine</span>
                                <span className="text-sm font-medium text-gray-800">{result.origin || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Prezzo</span>
                                <span className="text-sm font-semibold text-[hsl(300,50%,40%)]">€{result.price || 'N/A'}</span>
                              </div>
                            </div>
                            
                            {/* Separatore sottile */}
                            <div className="h-px bg-gray-200"></div>
                            
                            {/* Voti individuali - Design ultra-compatto */}
                            <div>
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Voti individuali</p>
                              <div className="flex flex-wrap gap-1">
                                {result?.votes && result.votes.map(vote => {
                                  // Mostra il nome solo se è il proprietario del vino
                                  const isOwner = vote.userId === result.userId;
                                  return (
                                    <span 
                                      key={vote.userId} 
                                      className="inline-flex items-center bg-white px-2 py-0.5 rounded-full text-xs border border-gray-200 shadow-sm"
                                    >
                                      {isOwner ? (
                                        <>
                                          <span className="font-medium text-gray-700">{vote.userName}:</span>
                                          <span className="ml-1 text-[hsl(43,96%,56%)] font-bold">{vote.score}</span>
                                        </>
                                      ) : (
                                        <span className="text-[hsl(43,96%,56%)] font-bold">{vote.score}</span>
                                      )}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Spacer per garantire spazio alla bottom-nav */}
                <div className="h-20" style={{height: 'var(--bottom-nav-total)'}} aria-hidden="true"></div>
              </div>
              

            </>
          )}
        </div>
      </div>
      
      {/* Pulsanti Condividi e Home fissi in fondo */}
      <div className="fixed left-0 right-0 z-[9999] flex justify-center" style={{bottom: 'var(--bottom-nav-offset)'}}>
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleExport}
            className="text-white p-3 rounded-full shadow-lg transition-all hover:bg-white hover:bg-opacity-10"
            style={{background: 'rgba(255, 255, 255, 0.1)'}}
            title="Condividi"
          >
            <Download className="w-5 h-5" />
          </button>
          {onGoHome && (
            <button
              onClick={onGoHome}
              className="text-white p-3 rounded-full shadow-lg transition-all hover:bg-white hover:bg-opacity-10"
              style={{background: 'rgba(255, 255, 255, 0.1)'}}
              title="Home"
            >
            <Home className="w-5 h-5" />
          </button>
          )}
        </div>
      </div>
    </div>
  );
}
