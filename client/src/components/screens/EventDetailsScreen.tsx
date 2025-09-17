import { Plus, EyeOff, Star, Award, Eye, ArrowLeft, Home, Trash2, Save } from '@/components/icons';
import { WineEvent, Wine, Vote, User } from '@shared/schema';
import { formatPrice } from '../../lib/utils';
import { VotingGrid } from '../optimized/VotingGrid';
import { useEventLogic } from '../../hooks/useEventLogic';
import diagoLogo from '@assets/diagologo.png';

interface EventDetailsScreenProps {
  event: WineEvent | null;
  wines: Wine[];
  votes: Vote[];
  users: User[];
  currentUser: User | null;
  onShowWineRegistrationModal: () => void;
  onVoteForWine: (wineId: number, score: number, hasLode: boolean) => void;
  onCompleteEvent: (eventId: number) => void;
  onShowResults: (eventId: number) => void;
  onParticipateEvent: (eventId: number) => void;
  onGoBack?: () => void;
  onGoHome?: () => void;
}

export default function EventDetailsScreen({
  event,
  wines,
  votes,
  users,
  currentUser,
  onShowWineRegistrationModal,
  onVoteForWine,
  onCompleteEvent,
  onShowResults,
  onParticipateEvent,
  onGoBack,
  onGoHome
}: EventDetailsScreenProps) {
  if (!event || !currentUser) return null;

  // Use optimized event logic hook
  const { 
    eventWines, 
    userHasRegisteredWine, 
    votingIsActive, 
    getUserVoteForWine, 
    getWineContributor,
    getEventProgress 
  } = useEventLogic({ event, wines, votes, users, currentUser });

  const progress = getEventProgress();

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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="event-name-script text-xl font-bold text-[#300505] whitespace-nowrap overflow-hidden text-ellipsis max-w-sm">{event.name}</h2>
              <p className="text-gray-600">{event.date} - Modalità {event.mode}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">ATTIVO</span>
            </div>
          </div>

          {/* PULSANTE UNICO CONDIZIONALE */}
          <div className="mt-6">
            {!userHasRegisteredWine ? (
              <button
                onClick={onShowWineRegistrationModal}
                className="w-full bg-[#8d0303] hover:bg-[#300505] text-white px-6 py-4 rounded-xl flex items-center justify-center space-x-2 transition-colors text-lg font-semibold"
              >
                <Plus className="w-5 h-5" />
                <span>REGISTRA IL TUO VINO</span>
              </button>
            ) : (
              <button
                onClick={() => votingIsActive ? onParticipateEvent(event.id) : null}
                disabled={!votingIsActive}
                className={`w-full px-6 py-4 rounded-xl flex items-center justify-center space-x-2 transition-all text-lg font-semibold ${
                  votingIsActive 
                    ? 'bg-gradient-to-r from-[#300505] to-[#8d0303] hover:from-[#240404] hover:to-[#a00404] text-white shadow-lg hover:scale-105' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                }`}
              >
                <Eye className="w-5 h-5" />
                <span>{votingIsActive ? 'PARTECIPA ALLA DIAGONALE' : 'ATTENDI ATTIVAZIONE VOTAZIONI'}</span>
              </button>
            )}
          </div>
          
          {eventWines.length === 0 ? (
            <div className="text-center py-12">
              <Plus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Nessun vino registrato</p>
              <p className="text-gray-400 text-sm">Aggiungi il primo vino per iniziare la degustazione</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {eventWines.map(wine => {
                  const userVote = getUserVoteForWine(wine.id);
                  const contributor = getWineContributor(wine.userId);
                  
                  return (
                    <div key={wine.id} className="bg-white rounded-xl p-4 border-2 border-[hsl(229,73%,69%)]/20 wine-card-hover">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-lg text-gray-800">
                          {wine.name}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className="bg-[hsl(43,96%,56%)] text-white px-2 py-1 rounded-full text-xs">
                            {formatPrice(parseFloat(wine.price))}
                          </span>
                          <Eye className="w-4 h-4 text-gray-600" />
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">
                        Portato da: <span className="font-medium">{contributor}</span>
                      </p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Il tuo voto:</span>
                          {userVote ? (
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-[hsl(43,96%,56%)]" />
                              <span className="text-sm font-medium">{parseFloat(userVote.score.toString()).toFixed(1)}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">Non votato</span>
                          )}
                        </div>
                        
                        <VotingGrid
                          currentScore={parseFloat(userVote?.score?.toString() || '0')}
                          onScore={(score) => onVoteForWine(wine.id, score, false)}
                        />
                        
                        <div className="text-center text-xs text-gray-500 mt-2">
                          Voti da 1 a 10 con step 0.5
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">Progresso:</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-[hsl(229,73%,69%)] h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{progress}%</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onShowResults(event.id)}
                    className="bg-[hsl(43,96%,56%)] hover:bg-yellow-600 text-white px-4 py-2 rounded-xl transition-colors"
                  >
                    Mostra Risultati
                  </button>
                  <button
                    onClick={() => onCompleteEvent(event.id)}
                    className="bg-[hsl(0,84.2%,60.2%)] hover:bg-red-700 text-white px-4 py-2 rounded-xl transition-colors"
                  >
                    Termina Evento
                  </button>
                </div>
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
