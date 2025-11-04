import { WineEvent } from '@shared/schema';

interface ProgressBarProps {
  event: WineEvent;
  progress: number;
  onShowResults: (eventId: number) => void;
  onCompleteEvent: (eventId: number) => void;
}

export default function ProgressBar({ event, progress, onShowResults, onCompleteEvent }: ProgressBarProps) {
  return (
    <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600">Progresso:</span>
        <div className="flex items-center space-x-2">
          <div className="w-32 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-[hsl(229,73%,69%)] h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="text-sm font-medium text-gray-700">{progress}%</span>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onShowResults(event.id)}
          className="bg-[hsl(43,96%,56%)] hover:bg-yellow-600 text-white px-4 py-2 rounded-xl transition-colors"
        >
          Mostra Risultati
        </button>
        <button
          onClick={() => onCompleteEvent(event.id)}
          className="bg-[hsl(0,84.2%,60.2%)] hover:bg-red-700 text-white px-4 py-2 rounded-xl transition-colors"
        >
          Termina Evento
        </button>
      </div>
    </div>
  );
}
