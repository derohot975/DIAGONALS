import { WineEvent } from "@shared/schema";
import diagoLogo from '../../../../assets/diagologo.png';

interface EventInfoProps {
  event: WineEvent;
}

export default function EventInfo({ event }: EventInfoProps) {
  return (
    <div className="text-center">
      <img 
        src={diagoLogo} 
        alt="DIAGO Logo" 
        className="w-20 h-auto logo-filter drop-shadow-lg mx-auto" 
      />
    </div>
  );
}
