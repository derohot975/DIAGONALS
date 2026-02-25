import { Plus, Eye } from '@/components/icons';
import { WineEvent } from '@shared/schema';
import { formatEventName } from '@/lib/utils';
import diagoLogo from '@assets/diagologo.png';

interface EventContainerProps {
  event: WineEvent;
  userHasRegisteredWine: boolean;
  votingIsActive: boolean;
  onShowWineRegistrationModal: () => void;
  onParticipateEvent: (eventId: number) => void;
}

export default function EventContainer({ event, userHasRegisteredWine, votingIsActive, onShowWineRegistrationModal, onParticipateEvent }: EventContainerProps) {
  return (
    <div className="flex-shrink-0 bg-gradient-to-b from-[#300505] to-transparent px-6 pt-10 pb-6">
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full"></div>
          <img src={diagoLogo} alt="DIAGO Logo" className="relative w-20 h-auto logo-filter drop-shadow-2xl mx-auto" />
        </div>
      </div>

      <div className="max-w-md mx-auto">
        <div className="bg-white/5 backdrop-blur-2xl rounded-[2rem] border border-white/10 p-6">
          <div className="text-center mb-6">
            <span className="inline-block text-[10px] font-black text-green-400 bg-green-400/10 border border-green-400/20 px-3 py-1 rounded-full uppercase tracking-widest mb-3">Attivo</span>
            <h2 className="text-xl font-bold text-white tracking-tight">{formatEventName(event.name)}</h2>
          </div>

          {!userHasRegisteredWine ? (
            <button
              onClick={onShowWineRegistrationModal}
              className="w-full bg-white text-red-950 font-bold py-4 rounded-2xl flex items-center justify-center space-x-2 active:scale-95 transition-all shadow-xl"
            >
              <Plus className="w-5 h-5" />
              <span>Registra il tuo vino</span>
            </button>
          ) : (
            <button
              onClick={() => votingIsActive ? onParticipateEvent(event.id) : undefined}
              disabled={!votingIsActive}
              className={`w-full font-bold py-4 rounded-2xl flex items-center justify-center space-x-2 transition-all ${
                votingIsActive
                  ? 'bg-red-600 text-white active:scale-95 shadow-xl shadow-red-600/20'
                  : 'bg-white/5 border border-white/5 text-white/20 cursor-not-allowed'
              }`}
            >
              <Eye className="w-5 h-5" />
              <span>{votingIsActive ? 'Entra nella Diagonale' : 'In attesa di attivazione...'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
