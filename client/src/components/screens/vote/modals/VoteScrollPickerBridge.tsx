import { VoteScrollPicker } from "../../../VoteScrollPicker";

interface VoteScrollPickerBridgeProps {
  isOpen: boolean;
  onClose: () => void;
  onVote: (score: number) => void;
  currentVote?: number;
  wineName: string;
}

export default function VoteScrollPickerBridge({ 
  isOpen, 
  onClose, 
  onVote, 
  currentVote, 
  wineName 
}: VoteScrollPickerBridgeProps) {
  return (
    <VoteScrollPicker 
      isOpen={isOpen}
      onClose={onClose}
      onVote={onVote}
      currentVote={currentVote}
      wineName={wineName}
    />
  );
}
