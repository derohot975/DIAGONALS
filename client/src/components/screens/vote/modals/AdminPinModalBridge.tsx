import AdminPinModal from "../../../AdminPinModal";

interface AdminPinModalBridgeProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminPinModalBridge({ isOpen, onClose, onSuccess }: AdminPinModalBridgeProps) {
  return (
    <AdminPinModal 
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}
