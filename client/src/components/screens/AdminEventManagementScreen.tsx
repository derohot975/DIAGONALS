import { Calendar, Edit, Trash2, Play, Square, BarChart3, CheckCircle, Home, Shield } from '@/components/icons';
import { WineEvent, User, Wine } from '@shared/schema';
import { formatEventDate } from '../../lib/utils';
import diagoLogo from '@assets/diagologo.png';
import ParticipantsManager from './admin/components/ParticipantsManager';
import VotingCompletionChecker from './admin/components/VotingCompletionChecker';
import { useAdminEventManagement } from './admin/hooks/useAdminEventManagement';
import BottomNavBar from '../navigation/BottomNavBar';

interface AdminEventManagementScreenProps {
  events: WineEvent[];
  users: User[];
  wines: Wine[];
  onGoBack: () => void;
  onEditEvent: (event: WineEvent) => void;
  onDeleteEvent: (eventId: number) => void;
  onActivateVoting: (eventId: number) => void;
  onDeactivateVoting: (eventId: number) => void;
  onCompleteEvent: (eventId: number) => void;
  onViewReport: (eventId: number) => void;
  onGoHome?: () => void;
  onGoBackToAdmin?: () => void;
}

export default function AdminEventManagementScreen({ 
  events, 
  users,
  wines,
  onGoBack,
  onEditEvent,
  onDeleteEvent,
  onActivateVoting,
  onDeactivateVoting,
  onCompleteEvent,
  onViewReport,
  onGoHome,
  onGoBackToAdmin
}: AdminEventManagementScreenProps) {
  // Use custom hook for business logic
  const { getParticipantsCount, activeEvents, completedEvents } = useAdminEventManagement({
    events,
    wines,
  });

  return (
    <div className="flex-1 flex flex-col">
      {/* Fixed Header Section */}
      <div className="flex-shrink-0">
        {/* Logo Header */}
        <div className="flex justify-center pt-8 pb-6">
          <img 
            src={diagoLogo} 
            alt="DIAGO Logo" 
            className="w-20 h-auto logo-filter drop-shadow-lg" 
          />
        </div>

        {/* Title */}
        <div className="text-center pb-6">
          <h2 className="text-lg text-yellow-200">Gestione Eventi</h2>
        </div>

        {/* Fixed Active Events */}
        {activeEvents.length > 0 && (
          <div className="px-4 pb-4">
            <div className="space-y-6 max-w-4xl mx-auto">
              {activeEvents.map(event => (
                <div key={event.id} className="relative overflow-hidden">
                  {/* Main Event Card */}
                  <div className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 animate-fade-in relative">
                    
                    {/* Action Buttons - Top Right */}
                    <button
                      onClick={() => onEditEvent(event)}
                      className="absolute top-4 right-12 p-2 text-gray-700 hover:text-gray-900 transition-all duration-200"
                      title="Modifica evento"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteEvent(event.id)}
                      className="absolute top-4 right-4 p-2 text-red-600 hover:text-red-800 transition-all duration-200"
                      title="Elimina evento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Event Header */}
                    <div className="text-center mb-4">
                      <p className="text-base text-gray-600 mb-2">
                        {formatEventDate(event.date)}
                      </p>
                      <h3 className="event-name-script text-sm font-bold text-gray-800 mb-1 leading-tight break-words">{event.name}</h3>
                    </div>

                    {/* Primary Action - Voting Control */}
                    <div className="mt-6">
                      {event.votingStatus === 'active' ? (
                        <button
                          onClick={() => onDeactivateVoting(event.id)}
                          className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold text-lg rounded-xl transition-all duration-200 shadow-lg"
                        >
                          <Square className="w-5 h-5" />
                          <span>SOSPENDI VOTAZIONI</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onActivateVoting(event.id)}
                          className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-lg rounded-xl transition-all duration-200 shadow-lg"
                        >
                          <Play className="w-5 h-5" />
                          <span>AVVIA VOTAZIONI</span>
                        </button>
                      )}
                    </div>

                    {/* Voting Completion Status - Show only when voting is active or completed */}
                    {event.votingStatus === 'completed' && (
                      <VotingCompletionChecker eventId={event.id} onCompleteEvent={onCompleteEvent} />
                    )}

                    {/* Participants Count - Below Voting Button */}
                    <div className="text-center mt-4">
                      <p className="text-base text-gray-600">⭐ <span className="font-bold">{getParticipantsCount(event.id)} partecipanti</span> ⭐</p>
                      
                      {/* Participants Management - Only for non-completed events */}
                      {event.status !== 'completed' && getParticipantsCount(event.id) > 0 && (
                        <ParticipantsManager eventId={event.id} />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fixed Historic Events Title */}
        {completedEvents.length > 0 && (
          <div className="px-4 pb-2">
            <h3 className="text-lg font-semibold text-white flex items-center justify-center">
              <Calendar className="w-5 h-5 mr-2" />
              STORICO EVENTI
            </h3>
          </div>
        )}
      </div>

      {/* Scrollable Historic Events Only */}
      {completedEvents.length > 0 ? (
        <div 
          className="overflow-y-auto px-4" 
          style={{
            height: 'calc(100dvh - 440px - var(--bottom-nav-total, 88px) - env(safe-area-inset-top, 0px))',
            paddingBottom: 'var(--bottom-nav-total, 88px)'
          }}
        >
          <div className="space-y-4 max-w-4xl mx-auto">
            {completedEvents.map(event => (
              <div key={event.id} className="bg-[#300505] rounded-2xl shadow-xl p-6 border border-[#8d0303]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-white break-words leading-tight">{event.name}</h4>
                    <p className="text-sm text-gray-300">{formatEventDate(event.date)}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onViewReport(event.id)}
                      className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                      title="Visualizza Report"
                    >
                      <BarChart3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteEvent(event.id)}
                      className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                      title="Elimina evento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : events.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Nessun evento creato</p>
            <p className="text-sm text-gray-400">Usa "Nuovo Evento" per crearne uno</p>
          </div>
        </div>
      ) : (
        <div className="flex-1"></div>
      )}

      <BottomNavBar 
        onGoHome={onGoHome}
        onShowAdmin={onGoBackToAdmin}
        layout="center"
      />
    </div>
  );
}