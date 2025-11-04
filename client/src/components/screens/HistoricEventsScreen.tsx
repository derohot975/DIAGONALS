import { useState, useEffect } from 'react';
import { BarChart3, StickyNote, ArrowLeft, Home, Lock } from '@/components/icons';
import { formatEventDate, getCreatorName, formatEventName } from '@/lib/utils';
import diagoLogo from '@assets/diagologo.png';
import BottomNavBar from '../navigation/BottomNavBar';
import ManageEventModal from '../modals/ManageEventModal';
import { useLongPress } from '@/hooks/useLongPress';

import { User, WineEvent } from '@shared/schema';

interface HistoricEventsScreenProps {
  events: WineEvent[];
  users: User[];
  onShowEventResults: (eventId: number) => void;
  onShowPagella: (eventId: number) => void;
  onDeleteEvent?: (eventId: number) => void;
  onProtectEvent?: (eventId: number, protect: boolean) => void;
  onGoBack: () => void;
  onGoHome: () => void;
}

export default function HistoricEventsScreen({ 
  events, 
  users, 
  onShowEventResults,
  onShowPagella,
  onDeleteEvent,
  onProtectEvent,
  onGoBack,
  onGoHome
}: HistoricEventsScreenProps) {
  // Filtra solo gli eventi completati
  const completedEvents = events.filter(event => event.status === 'completed');
  
  // State per il modal di eliminazione
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<WineEvent | null>(null);
  
  // State per forzare re-render quando localStorage cambia
  const [forceUpdate, setForceUpdate] = useState(0);

  // Listener per aggiornamenti localStorage (per reattività immediata)
  useEffect(() => {
    const handleStorageChange = () => {
      setForceUpdate(prev => prev + 1);
    };

    // Ascolta eventi storage personalizzati (da handleProtectEvent)
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Funzione per determinare se un evento è protetto
  const isProtectedEvent = (event: WineEvent): boolean => {
    const protectedEventsKey = 'diagonale_protected_events';
    const initKey = 'diagonale_protection_initialized';
    
    // Inizializzazione automatica primi 3 eventi (solo al primo avvio)
    if (!localStorage.getItem(initKey)) {
      const sortedEvents = completedEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const first3EventIds = sortedEvents.slice(0, 3).map(e => e.id);
      
      localStorage.setItem(protectedEventsKey, JSON.stringify(first3EventIds));
      localStorage.setItem(initKey, 'true');
    }
    
    // Controllo protezione SOLO da localStorage (completamente gestibile)
    const protectedEvents = JSON.parse(localStorage.getItem(protectedEventsKey) || '[]') as number[];
    return protectedEvents.includes(event.id);
  };

  // Handler per long press
  const handleLongPress = (event: WineEvent) => {
    if (onDeleteEvent) {
      setEventToDelete(event);
      setDeleteModalOpen(true);
    }
  };

  // Handler per conferma eliminazione
  const handleDeleteConfirm = (eventId: number) => {
    if (onDeleteEvent) {
      onDeleteEvent(eventId);
    }
    setDeleteModalOpen(false);
    setEventToDelete(null);
  };

  // Handler per chiusura modal
  const handleDeleteClose = () => {
    setDeleteModalOpen(false);
    setEventToDelete(null);
  };

  // Handler per protezione evento
  const handleProtectEvent = (eventId: number, protect: boolean) => {
    if (onProtectEvent) {
      onProtectEvent(eventId, protect);
    }
    setDeleteModalOpen(false);
    setEventToDelete(null);
  };

  // Componente per singolo evento per evitare hooks condizionali
  const EventItem = ({ event }: { event: WineEvent }) => {
    const { handlers, isLongPressing } = useLongPress({
      onLongPress: () => handleLongPress(event),
      delay: 800
    });

    return (
      <div 
        className={`bg-[#300505] rounded-xl p-4 border border-[#8d0303] shadow-lg transition-all duration-200 ${
          isLongPressing ? 'scale-95 bg-red-700' : 'hover:shadow-xl'
        } ${isProtectedEvent(event) ? 'border-yellow-500' : ''}`}
        {...handlers}
        style={{ userSelect: 'none' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-white break-words leading-tight">{formatEventName(event.name)}</h3>
              {isProtectedEvent(event) && (
                <Lock className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              )}
            </div>
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
    );
  };



  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
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
        className="flex-1 overflow-y-auto px-4 min-h-0" 
        style={{
          paddingBottom: 'calc(var(--bottom-nav-total, 120px) + 2rem)'
        }}
      >
        <div className="max-w-2xl mx-auto space-y-4">
          
          {/* Completed Events */}
          {completedEvents.length > 0 ? (
            completedEvents.map(event => (
              <EventItem key={event.id} event={event} />
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

      {/* Manage Event Modal */}
      <ManageEventModal
        isOpen={deleteModalOpen}
        event={eventToDelete}
        onClose={handleDeleteClose}
        onDelete={handleDeleteConfirm}
        onProtect={handleProtectEvent}
        isProtected={eventToDelete ? isProtectedEvent(eventToDelete) : false}
      />
    </div>
  );
}