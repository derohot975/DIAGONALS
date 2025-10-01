import { useState } from "react";
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

export default function SimpleVotingScreen({
  event,
  currentUser,
  onBack,
  onHome,
  onShowAdmin
}: SimpleVotingScreenProps) {
  const [selectedWineId, setSelectedWineId] = useState<number | null>(null);
  const [showAdminPinModal, setShowAdminPinModal] = useState(false);
  
  // Use custom hook for business logic
  const { wines, users, votes, voteMutation, getUserVoteForWine, getWineContributor } = useVotingLogic({
    event,
    currentUser,
  });

  return (
    <div className="flex-1 flex flex-col">
      {/* Fixed Header - Event Info Only */}
      <div className="sticky top-0 z-50 pt-2 pb-4" style={{background: '#300505'}}>
        <EventInfo event={event} />
      </div>

      {/* Scrollable Wine List */}
      <WineList
        wines={wines}
        users={users}
        votes={votes}
        currentUser={currentUser}
        onWineClick={setSelectedWineId}
      />

      {/* Vote Scroll Picker */}
      <VoteScrollPicker 
        isOpen={!!selectedWineId}
        onClose={() => setSelectedWineId(null)}
        onVote={(score) => {
          if (selectedWineId) {
            voteMutation.mutate({ wineId: selectedWineId, score });
            setSelectedWineId(null); // Chiudi il modale dopo il voto
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
        onSuccess={() => {
          setShowAdminPinModal(false);
          if (onShowAdmin) {
            onShowAdmin();
          }
        }}
      />

      {/* Bottom Navigation */}
      <BottomNavBar 
        onGoBack={onBack}
        onGoHome={onHome}
        onShowAdmin={onShowAdmin}
        layout="sides"
      />

    </div>
  );
}