import { useState, useEffect, useMemo } from 'react';
import { BarChart3, StickyNote, ArrowLeft, Home, Lock, Star, X } from '@/components/icons';
import { formatEventDate, formatEventName } from '@/lib/utils';
import diagoLogo from '@assets/diagologo.png';
import BottomNavBar from '../navigation/BottomNavBar';
import ManageEventModal from '../modals/ManageEventModal';
import { useLongPress } from '@/hooks/useLongPress';
import { User, WineEvent, Vote } from '@shared/schema';

interface HistoricEventsScreenProps {
  events: WineEvent[];
  users: User[];
  votes?: Vote[];
  onShowEventResults: (eventId: number) => void;
  onShowPagella: (eventId: number) => void;
  onDeleteEvent?: (eventId: number) => void;
  onProtectEvent?: (eventId: number, protect: boolean) => void;
  onGoBack: () => void;
  onGoHome: () => void;
}

export default function HistoricEventsScreen({ events, users, votes = [], onShowEventResults, onShowPagella, onDeleteEvent, onProtectEvent, onGoBack, onGoHome }: HistoricEventsScreenProps) {
  const completedEvents = [...events]
    .filter(event => event.status === 'completed')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<WineEvent | null>(null);
  const [showGlobalRanking, setShowGlobalRanking] = useState(false);
  const [, setForceUpdate] = useState(0);

  const globalRanking = useMemo(() => {
    const ranking: Record<number, { name: string, score: number }> = {};
    users.filter(u => !u.isAdmin).forEach(u => {
      ranking[u.id] = { name: u.name, score: 0 };
    });

    const completedEventIds = new Set(completedEvents.map(e => e.id));
    
    votes.forEach(v => {
      if (completedEventIds.has(v.eventId)) {
        if (ranking[v.userId]) {
          ranking[v.userId].score += parseFloat(String(v.score)) || 0;
        }
      }
    });

    return Object.values(ranking).sort((a, b) => b.score - a.score);
  }, [users, votes, completedEvents]);

  useEffect(() => {
    const handleStorageChange = () => setForceUpdate(prev => prev + 1);
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const isProtectedEvent = (event: WineEvent): boolean => {
    const key = 'diagonale_protected_events';
    const initKey = 'diagonale_protection_initialized';
    if (!localStorage.getItem(initKey)) {
      const sortedForProtection = [...completedEvents].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      localStorage.setItem(key, JSON.stringify(sortedForProtection.slice(0, 3).map(e => e.id)));
      localStorage.setItem(initKey, 'true');
    }
    const protected_ = JSON.parse(localStorage.getItem(key) || '[]') as number[];
    return protected_.includes(event.id);
  };

  const handleDeleteConfirm = (eventId: number) => {
    if (onDeleteEvent) onDeleteEvent(eventId);
    setDeleteModalOpen(false);
    setEventToDelete(null);
  };

  const handleProtectEvent = (eventId: number, protect: boolean) => {
    if (onProtectEvent) onProtectEvent(eventId, protect);
    setDeleteModalOpen(false);
    setEventToDelete(null);
  };

  const EventItem = ({ event }: { event: WineEvent }) => {
    const { handlers, isLongPressing } = useLongPress({
      onLongPress: () => { if (onDeleteEvent) { setEventToDelete(event); setDeleteModalOpen(true); } },
      onPress: () => onShowEventResults(event.id),
      delay: 800
    });

    return (
      <div
        {...handlers}
        style={{ userSelect: 'none' }}
        className={`bg-white/5 backdrop-blur-xl rounded-3xl border p-6 transition-all duration-300 ${
          isLongPressing ? 'scale-95 bg-red-500/10 border-red-500/20' : 'border-white/10 hover:bg-white/10'
        } ${isProtectedEvent(event) ? 'border-yellow-500/30' : ''}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0 mr-4">
            <div className="flex items-center gap-2 mb-1">
              {isProtectedEvent(event) && <Lock className="w-3.5 h-3.5 text-yellow-400/60 flex-shrink-0" />}
              <h3 className="font-bold text-white text-base leading-tight truncate">{formatEventName(event.name)}</h3>
            </div>
            <p className="text-sm font-medium text-[#fbedaa]">{formatEventDate(event.date)}</p>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); onShowPagella(event.id); }}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchEnd={(e) => { e.stopPropagation(); onShowPagella(event.id); }}
              onMouseDown={(e) => e.stopPropagation()}
              onMouseUp={(e) => { e.stopPropagation(); }}
              className="p-3 bg-white/5 hover:bg-white/15 border border-white/10 text-white/60 hover:text-white rounded-2xl transition-all"
              title="Pagella"
            >
              <StickyNote className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-[#300505] to-[#1a0303]">
      {/* Header */}
      <div className="flex-shrink-0 relative flex justify-center pt-10 pb-6">
        <div className="relative">
          <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full"></div>
          <img src={diagoLogo} alt="DIAGO Logo" className="relative mx-auto w-24 h-auto logo-filter drop-shadow-2xl" />
        </div>
        <button 
          onClick={() => setShowGlobalRanking(true)}
          className="absolute right-6 top-10 p-2 text-yellow-400 transition-opacity hover:opacity-70"
        >
          <Star className="w-7 h-7 fill-current" />
        </button>
      </div>

      <div className="flex-shrink-0 text-center pb-8">
        <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-1">Archivio</p>
        <h2 className="text-3xl font-bold text-white tracking-tight">Storico</h2>
      </div>

      {/* Global Ranking Modal/Overlay */}
      {showGlobalRanking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowGlobalRanking(false)} />
          <div className="relative w-full max-w-sm bg-[#1a0303] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
            <div className="absolute top-4 right-4">
              <button onClick={() => setShowGlobalRanking(false)} className="p-2 text-white/30 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="text-center mb-8">
              <Star className="w-12 h-12 text-yellow-400 fill-current mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-white">Classifica Generale</h3>
            </div>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 scrollbar-hide">
              {globalRanking.map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between bg-white/5 rounded-2xl p-4 border border-white/5">
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold text-white/20 w-6">{index + 1}°</span>
                    <span className="text-white font-medium">{entry.name}</span>
                  </div>
                  <div className="text-yellow-400 font-bold">
                    {Math.round(entry.score)} pts
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Scrollable content */}
      <div
        className="flex-1 px-6 min-h-0 overflow-y-auto scrollbar-hide"
        style={{ paddingBottom: 'calc(var(--bottom-nav-total, 3.5rem) + 1.5rem)' }}
      >
        <div className="max-w-md mx-auto space-y-4">
          {completedEvents.length > 0 ? (
            completedEvents.map(event => <EventItem key={event.id} event={event} />)
          ) : (
            <div className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 p-14 text-center animate-fade-in">
              <h2 className="text-xl font-bold text-white mb-2">Nessun evento completato</h2>
              <p className="text-white/30 text-sm">Gli eventi completati appariranno qui.</p>
            </div>
          )}
        </div>
      </div>

      <BottomNavBar
        layout="center"
        centerButtons={[
          { id: 'back', icon: <ArrowLeft className="w-6 h-6" />, onClick: onGoBack, title: 'Indietro', variant: 'glass' },
          { id: 'home', icon: <Home className="w-6 h-6" />, onClick: onGoHome, title: 'Home', variant: 'glass' }
        ]}
      />

      <ManageEventModal
        isOpen={deleteModalOpen}
        event={eventToDelete}
        onClose={() => { setDeleteModalOpen(false); setEventToDelete(null); }}
        onDelete={handleDeleteConfirm}
        onProtect={handleProtectEvent}
        isProtected={eventToDelete ? isProtectedEvent(eventToDelete) : false}
      />
    </div>
  );
}
