import { memo } from 'react';
import { WineEvent } from '@shared/schema';
import { formatEventDate, formatEventName } from '@/lib/utils';

interface EventCardProps {
  event: WineEvent;
  onSelect: (eventId: number) => void;
  onRegisterWine: (eventId: number) => void;
  userHasWineInEvent: boolean;
}

export const EventCard = memo(({ event, onSelect, onRegisterWine, userHasWineInEvent }: EventCardProps) => (
  <div className="mb-6 bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden">
    <div className="p-6 text-center">
      <h3 
        className="text-xl font-bold mb-3 leading-tight"
        style={{ 
          fontFamily: '"Rock Salt", cursive',
          color: '#800020',
          fontSize: '18px',
          lineHeight: '1.2'
        }}
      >
        {formatEventName(event.name)}
      </h3>
      
      <div className="space-y-2 mb-4">
        <p className="text-gray-600 text-sm">
          📅 {formatEventDate(event.date)}
        </p>
        <p className="text-gray-600 text-sm">
          🍷 Modalità: {event.mode}
        </p>
        <p className="text-gray-600 text-sm">
          📊 Stato: <span className="font-medium">{event.status}</span>
        </p>
      </div>
      
      <div className="flex flex-col gap-3">
        <button
          onClick={() => onRegisterWine(event.id)}
          disabled={userHasWineInEvent || event.status === 'completed'}
          className={`px-6 py-3 text-white font-bold rounded-full text-sm transition-all ${
            userHasWineInEvent || event.status === 'completed'
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 active:bg-green-800 shadow-lg hover:shadow-xl'
          }`}
        >
          {userHasWineInEvent ? '✅ VINO GIÀ REGISTRATO' : '📝 REGISTRA IL TUO VINO'}
        </button>
        
        <button
          onClick={() => onSelect(event.id)}
          disabled={!userHasWineInEvent && event.status === 'active'}
          className={`px-6 py-3 text-white font-bold rounded-full text-sm transition-all ${
            !userHasWineInEvent && event.status === 'active'
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-lg hover:shadow-xl'
          }`}
        >
          🍷 PARTECIPA ALLA DIAGONALE
        </button>
      </div>
    </div>
  </div>
));