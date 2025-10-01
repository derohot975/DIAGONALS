import { Plus, Eye } from '@/components/icons';
import { WineEvent } from '@shared/schema';
import diagoLogo from '@assets/diagologo.png';

interface EventContainerProps {
  event: WineEvent;
  userHasRegisteredWine: boolean;
  votingIsActive: boolean;
  onShowWineRegistrationModal: () => void;
  onParticipateEvent: (eventId: number) => void;
}

export default function EventContainer({ 
  event, 
  userHasRegisteredWine, 
  votingIsActive, 
  onShowWineRegistrationModal, 
  onParticipateEvent 
}: EventContainerProps) {
  return (
    <>
      {/* Logo Header */}
      <div className="flex-shrink-0 flex justify-center pt-8 pb-6">
        <img 
          src={diagoLogo} 
          alt="DIAGO Logo" 
          className="mx-auto mb-2 w-24 h-auto logo-filter drop-shadow-lg" 
        />
      </div>

      {/* Event Info + CTA */}
      <div className="px-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass-effect rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="event-name-standard text-xl font-bold text-[#300505] whitespace-nowrap overflow-hidden text-ellipsis max-w-sm">{event.name}</h2>
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
          </div>
        </div>
      </div>
    </>
  );
}
