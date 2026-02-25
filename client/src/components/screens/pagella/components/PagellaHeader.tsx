import diagoLogo from '@assets/diagologo.png';

interface PagellaHeaderProps {
  canEdit: boolean;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
}

export default function PagellaHeader({ canEdit, saveStatus }: PagellaHeaderProps) {
  return (
    <div className="sticky top-0 z-10 text-center py-4 bg-gradient-to-b from-[#300505]/95 to-transparent backdrop-blur-sm">
      <img
        src={diagoLogo}
        alt="DIAGO Logo"
        className="mx-auto mb-2 w-14 h-auto logo-filter drop-shadow-lg"
      />
      <h2 className="pagellone-tommy-font text-xl font-bold text-amber-200 tracking-wide">
        Pagellone di Tommy
      </h2>

      {canEdit && saveStatus !== 'idle' && (
        <div className="mt-2">
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${
            saveStatus === 'saving'
              ? 'bg-amber-500/20 text-amber-200 border border-amber-500/30'
              : saveStatus === 'saved'
              ? 'bg-green-500/20 text-green-300 border border-green-500/30'
              : 'bg-red-500/20 text-red-300 border border-red-500/30'
          }`}>
            {saveStatus === 'saving' ? '· Salvataggio...' :
             saveStatus === 'saved' ? '· Salvato' :
             '· Errore salvataggio'}
          </span>
        </div>
      )}
    </div>
  );
}
