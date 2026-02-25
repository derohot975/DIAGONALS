import { WineEvent } from '@shared/schema';

interface ProgressBarProps {
  event: WineEvent;
  progress: number;
  onShowResults: (eventId: number) => void;
  onCompleteEvent: (eventId: number) => void;
}

export default function ProgressBar({ event, progress, onShowResults, onCompleteEvent }: ProgressBarProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-white/30 uppercase tracking-widest">Progresso voti</span>
        <span className="text-sm font-black text-white">{progress}%</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-white/5 rounded-full h-2 mb-5">
        <div
          className="bg-white h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onShowResults(event.id)}
          className="bg-white/10 border border-white/10 text-white font-bold py-3 rounded-2xl text-sm active:scale-95 transition-all"
        >
          Risultati
        </button>
        <button
          onClick={() => onCompleteEvent(event.id)}
          className="bg-white text-red-950 font-bold py-3 rounded-2xl text-sm active:scale-95 transition-all shadow-lg"
        >
          Termina Evento
        </button>
      </div>
    </div>
  );
}
