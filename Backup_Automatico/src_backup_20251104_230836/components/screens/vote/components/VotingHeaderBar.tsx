import { Home, Shield } from "@/components/icons";
import diagoLogo from "@assets/diagologo.png";

interface VotingHeaderBarProps {
  onHome: () => void;
  onShowAdmin?: () => void;
  onAdminClick: () => void;
}

export default function VotingHeaderBar({ onHome, onShowAdmin, onAdminClick }: VotingHeaderBarProps) {
  return (
    <div className="flex justify-between items-center px-4 pb-6">
      {/* Home Button */}
      <button
        onClick={onHome}
        className="flex items-center justify-center w-10 h-10 rounded-full text-white hover:bg-white hover:bg-opacity-10 transition-all"
        style={{background: 'rgba(255, 255, 255, 0.1)'}}
      >
        <Home size={20} />
      </button>

      {/* Logo */}
      <img 
        src={diagoLogo} 
        alt="DIAGO Logo" 
        className="w-20 h-auto logo-filter drop-shadow-lg" 
      />

      {/* Admin Button */}
      {onShowAdmin && (
        <button
          onClick={onAdminClick}
          className="flex items-center justify-center w-10 h-10 rounded-full text-white hover:bg-white hover:bg-opacity-10 transition-all"
          style={{background: 'rgba(255, 255, 255, 0.1)'}}
        >
          <Shield size={20} />
        </button>
      )}
    </div>
  );
}
