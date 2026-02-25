import { WineEvent } from "@shared/schema";
import { formatEventName } from "@/lib/utils";
import diagoLogo from '@assets/diagologo.png';

interface EventInfoProps {
  event: WineEvent;
}

export default function EventInfo({ event }: EventInfoProps) {
  return (
    <div className="flex flex-col items-center pt-10 pb-6 bg-gradient-to-b from-[#300505] to-transparent">
      <div className="relative mb-4">
        <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full"></div>
        <img src={diagoLogo} alt="DIAGO Logo" className="relative w-20 h-auto logo-filter drop-shadow-2xl mx-auto" />
      </div>
      <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-1">Vota</p>
      <h2 className="text-xl font-bold text-white tracking-tight text-center px-6">{formatEventName(event.name)}</h2>
    </div>
  );
}
