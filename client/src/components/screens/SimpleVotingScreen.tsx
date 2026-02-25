import { useState } from "react";
import { ArrowLeft, Home, Shield } from '@/components/icons';
import { User, WineEvent } from "@shared/schema";
import EventInfo from "./vote/components/EventInfo";
import WineList from "./vote/components/WineList";
import AdminPinModal from "../AdminPinModal";
import { VoteScrollPicker } from "../VoteScrollPicker";
import BottomNavBar from "../navigation/BottomNavBar";
import { useVotingLogic } from "./vote/hooks/useVotingLogic";

interface SimpleVotingScreenProps {
  event: WineEvent;
  currentUser: User;
  onBack: () => void;
  onHome: () => void;
  onShowAdmin?: () => void;
}

export default function SimpleVotingScreen({ event, currentUser, onBack, onHome, onShowAdmin }: SimpleVotingScreenProps) {
  const [selectedWineId, setSelectedWineId] = useState<number | null>(null);
  const [showAdminPinModal, setShowAdminPinModal] = useState(false);

  const { wines, users, votes, voteMutation, getUserVoteForWine, getWineContributor } = useVotingLogic({ event, currentUser });

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-[#300505] to-[#1a0303]">
      {/* Event Header */}
      <div className="flex-shrink-0 sticky top-0 z-10">
        <EventInfo event={event} />
      </div>

      {/* Wine List */}
      <WineList
        wines={wines}
        users={users}
        votes={votes}
        currentUser={currentUser}
        onWineClick={setSelectedWineId}
      />

      {/* Vote Picker */}
      <VoteScrollPicker
        isOpen={!!selectedWineId}
        onClose={() => setSelectedWineId(null)}
        onVote={(score) => {
          if (selectedWineId) {
            voteMutation.mutate({ wineId: selectedWineId, score });
            setSelectedWineId(null);
          }
        }}
        currentVote={selectedWineId ? Number(getUserVoteForWine(selectedWineId)?.score) : undefined}
        wineName={selectedWineId ? (() => {
          const wine = wines.find(w => w.id === selectedWineId);
          return wine ? `Vino di ${getWineContributor(wine.userId).toUpperCase()}` : '';
        })() : ''}
      />

      {/* Admin PIN Modal */}
      <AdminPinModal
        isOpen={showAdminPinModal}
        onClose={() => setShowAdminPinModal(false)}
        onSuccess={() => { setShowAdminPinModal(false); if (onShowAdmin) onShowAdmin(); }}
      />

      <BottomNavBar
        layout="center"
        centerButtons={[
          ...(onBack ? [{ id: 'back', icon: <ArrowLeft className="w-6 h-6" />, onClick: onBack, title: 'Indietro', variant: 'glass' as const }] : []),
          ...(onHome ? [{ id: 'home', icon: <Home className="w-6 h-6" />, onClick: onHome, title: 'Home', variant: 'glass' as const }] : []),
          ...(onShowAdmin ? [{ id: 'admin', icon: <Shield className="w-6 h-6" />, onClick: onShowAdmin, title: 'Admin', variant: 'admin' as const }] : []),
        ]}
      />
    </div>
  );
}
