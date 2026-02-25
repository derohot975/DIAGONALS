import { Trash2, Delete, Settings } from '@/components/icons';
import { WineEvent } from '@shared/schema';
import { formatEventName, formatEventDate } from '@/lib/utils';

interface StepProps {
  event: WineEvent;
  isProtected: boolean;
  selectedAction: 'delete' | 'protect' | null;
  pin: string;
  error: string;
  countdown: number;
  adminPin: string;
  onClose: () => void;
  onActionSelect: (action: 'delete' | 'protect') => void;
  onDeleteConfirm: () => void;
  onNumberClick: (n: string) => void;
  onDeleteDigit: () => void;
  onPinConfirm: () => void;
  onFinalDeleteConfirm: () => void;
}

export function StepChoose({ event, isProtected, error, onClose, onActionSelect }: Pick<StepProps,
  'event' | 'isProtected' | 'error' | 'onClose' | 'onActionSelect'>) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-bold text-white">{formatEventName(event.name)}</h3>
        <p className="text-sm text-white/50">{formatEventDate(event.date)}</p>
      </div>
      <div className="space-y-3">
        <p className="text-center text-white/65 font-medium">Cosa vuoi fare con questo evento?</p>
        <button
          onClick={() => onActionSelect('delete')}
          disabled={isProtected}
          className={`w-full p-4 rounded-xl border transition-all duration-200 text-left ${
            isProtected
              ? 'bg-white/5 border-white/8 text-white/25 cursor-not-allowed'
              : 'bg-red-500/10 border-red-500/20 hover:bg-red-500/18 text-red-400'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isProtected ? 'bg-white/8' : 'bg-red-500/15'}`}>
              <Trash2 className={`w-5 h-5 ${isProtected ? 'text-white/25' : 'text-red-400'}`} />
            </div>
            <div>
              <p className="font-semibold">ELIMINA EVENTO</p>
              <p className="text-sm opacity-75">{isProtected ? 'Evento protetto - Non eliminabile' : 'Rimuovi definitivamente'}</p>
            </div>
          </div>
        </button>
        <button
          onClick={() => onActionSelect('protect')}
          className="w-full p-4 rounded-xl border bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/18 text-amber-300 transition-all duration-200 text-left"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-amber-500/15 rounded-full flex items-center justify-center">
              <span className="text-lg">🛡️</span>
            </div>
            <div>
              <p className="font-semibold">{isProtected ? 'RIMUOVI PROTEZIONE' : 'PROTEGGI EVENTO'}</p>
              <p className="text-sm opacity-75">{isProtected ? 'Consenti eliminazione futura' : 'Impedisci eliminazione'}</p>
            </div>
          </div>
        </button>
      </div>
      {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3"><p className="text-red-400 text-sm font-medium">{error}</p></div>}
      <button onClick={onClose} className="w-full px-4 py-3 bg-white/8 hover:bg-white/12 text-white/60 font-medium rounded-xl transition-colors border border-white/10">
        Annulla
      </button>
    </div>
  );
}

export function StepDeleteConfirm({ event, isProtected, onClose, onDeleteConfirm }: Pick<StepProps,
  'event' | 'isProtected' | 'onClose' | 'onDeleteConfirm'>) {
  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-red-500/15 rounded-full flex items-center justify-center">
          <Trash2 className="w-8 h-8 text-red-400" />
        </div>
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-lg font-bold text-white">{formatEventName(event.name)}</h3>
        <p className="text-sm text-white/50">{formatEventDate(event.date)}</p>
      </div>
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Trash2 className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-red-300">
            <p className="font-semibold mb-2">⚠️ ATTENZIONE: Eliminazione Definitiva</p>
            <ul className="space-y-1 text-xs text-red-400">
              <li>• Tutti i vini dell'evento verranno eliminati</li>
              <li>• Tutti i voti associati andranno persi</li>
              <li>• I report generati verranno cancellati</li>
              <li>• <strong>Questa azione NON può essere annullata</strong></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="flex space-x-3">
        <button onClick={onClose} className="flex-1 px-4 py-3 bg-white/8 hover:bg-white/12 text-white/60 font-medium rounded-xl transition-colors border border-white/10">Annulla</button>
        <button
          onClick={onDeleteConfirm}
          disabled={isProtected}
          className={`flex-1 px-4 py-3 font-medium rounded-xl transition-colors ${isProtected ? 'bg-white/5 text-white/25 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'}`}
        >
          Continua
        </button>
      </div>
    </div>
  );
}

export function StepPin({ selectedAction, isProtected, pin, error, adminPin, onClose, onNumberClick, onDeleteDigit, onPinConfirm }: Pick<StepProps,
  'selectedAction' | 'isProtected' | 'pin' | 'error' | 'adminPin' | 'onClose' | 'onNumberClick' | 'onDeleteDigit' | 'onPinConfirm'>) {
  const isDelete = selectedAction === 'delete';

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${isDelete ? 'bg-red-500/15' : 'bg-amber-500/15'}`}>
          {isDelete ? <Trash2 className="w-6 h-6 text-red-400" /> : <span className="text-lg">🛡️</span>}
        </div>
        <h3 className="text-lg font-bold text-white">Autenticazione Admin</h3>
        <p className="text-sm text-white/50 mt-1">
          {isDelete ? "Inserisci il PIN Admin per eliminare l'evento" : `Inserisci il PIN Admin per ${isProtected ? 'rimuovere la protezione' : "proteggere l'evento"}`}
        </p>
      </div>
      <div className="space-y-4">
        <div className="flex justify-center space-x-4">
          {[0, 1, 2].map(i => (
            <div key={i} className={`w-6 h-6 rounded-full border-2 transition-all duration-300 ${
              i < pin.length
                ? isDelete ? 'bg-red-500 border-red-500' : 'bg-amber-500 border-amber-500'
                : 'border-white/20 bg-transparent'
            }`} />
          ))}
        </div>
        {error && <p className="text-red-400 text-sm text-center font-medium">{error}</p>}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[1,2,3,4,5,6,7,8,9].map(n => (
          <button key={n} onClick={() => onNumberClick(n.toString())}
            className="h-12 bg-white/8 border border-white/12 rounded-lg text-lg font-semibold text-white transition-all duration-200 active:scale-95 hover:bg-white/15">
            {n}
          </button>
        ))}
        <div />
        <button onClick={() => onNumberClick('0')} className="h-12 bg-white/8 border border-white/12 rounded-lg text-lg font-semibold text-white transition-all duration-200 active:scale-95 hover:bg-white/15">0</button>
        <button onClick={onDeleteDigit} className="h-12 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center justify-center text-white/50 transition-all duration-200 active:scale-95">
          <Delete className="w-5 h-5" />
        </button>
      </div>
      <div className="flex space-x-3">
        <button onClick={onClose} className="flex-1 px-4 py-3 bg-white/8 hover:bg-white/12 text-white/60 font-medium rounded-xl transition-colors border border-white/10">Annulla</button>
        <button
          onClick={onPinConfirm}
          disabled={pin.length === 0}
          className={`flex-1 px-4 py-3 font-medium rounded-xl transition-colors ${
            pin === adminPin ? 'bg-green-600 hover:bg-green-700 text-white'
            : pin.length > 0 ? isDelete ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-amber-600 hover:bg-amber-700 text-white'
            : 'bg-white/5 text-white/25 cursor-not-allowed'
          }`}
        >
          Conferma PIN
        </button>
      </div>
    </div>
  );
}

export function StepDeleteFinal({ event, countdown, onClose, onFinalDeleteConfirm }: Pick<StepProps,
  'event' | 'countdown' | 'onClose' | 'onFinalDeleteConfirm'>) {
  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center animate-pulse">
          <Trash2 className="w-8 h-8 text-white" />
        </div>
      </div>
      <div className="text-center space-y-3">
        <h3 className="text-xl font-bold text-red-400">ULTIMA CONFERMA</h3>
        <div className="bg-red-500/10 border-2 border-red-500/20 rounded-lg p-4">
          <p className="text-sm font-semibold text-red-300 mb-2">Stai per eliminare definitivamente:</p>
          <p className="text-lg font-bold text-red-200">{formatEventName(event.name)}</p>
          <p className="text-sm text-red-400 mt-2">Tutti i dati associati verranno persi per sempre</p>
        </div>
      </div>
      <div className="text-center">
        <div className={`text-4xl font-bold ${countdown > 0 ? 'text-red-400' : 'text-green-400'}`}>
          {countdown > 0 ? countdown : '✓'}
        </div>
        <p className="text-sm text-white/50 mt-1">{countdown > 0 ? 'Attendi per confermare...' : 'Pronto per eliminare'}</p>
      </div>
      <div className="flex space-x-3">
        <button onClick={onClose} className="flex-1 px-4 py-3 bg-white/8 hover:bg-white/12 text-white/60 font-medium rounded-xl transition-colors border border-white/10">Annulla</button>
        <button
          onClick={onFinalDeleteConfirm}
          disabled={countdown > 0}
          className={`flex-1 px-4 py-3 font-bold rounded-xl transition-all duration-200 ${countdown === 0 ? 'bg-red-600 hover:bg-red-700 text-white active:scale-95' : 'bg-white/5 text-white/25 cursor-not-allowed'}`}
        >
          {countdown === 0 ? 'ELIMINA DEFINITIVAMENTE' : `Attendi ${countdown}s`}
        </button>
      </div>
    </div>
  );
}
