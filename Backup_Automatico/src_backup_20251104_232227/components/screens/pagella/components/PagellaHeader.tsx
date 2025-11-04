import diagoLogo from '@assets/diagologo.png';

interface PagellaHeaderProps {
  canEdit: boolean;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
}

export default function PagellaHeader({ canEdit, saveStatus }: PagellaHeaderProps) {
  return (
    <div className="sticky top-0 z-10 text-center py-4">
      <img 
        src={diagoLogo} 
        alt="DIAGO Logo" 
        className="mx-auto mb-2 w-16 h-auto logo-filter drop-shadow-lg" 
      />
      <h2 className="pagellone-tommy-font text-xl font-bold text-yellow-200">
        Pagellone di Tommy
      </h2>
      
      {/* Status di salvataggio non invasivo */}
      {canEdit && saveStatus !== 'idle' && (
        <div className="mt-2">
          <span className={`text-xs px-2 py-1 rounded ${
            saveStatus === 'saving' ? 'bg-yellow-500/20 text-yellow-200' :
            saveStatus === 'saved' ? 'bg-green-500/20 text-green-200' :
            'bg-red-500/20 text-red-200'
          }`}>
            {saveStatus === 'saving' ? 'Salvataggio...' :
             saveStatus === 'saved' ? 'Salvato' :
             'Errore salvataggio'}
          </span>
        </div>
      )}
    </div>
  );
}
