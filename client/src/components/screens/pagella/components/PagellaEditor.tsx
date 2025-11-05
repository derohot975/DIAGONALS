interface PagellaEditorProps {
  content: string;
  canEdit: boolean;
  onContentChange: (content: string) => void;
}

export default function PagellaEditor({ content, canEdit, onContentChange }: PagellaEditorProps) {
  return (
    <div 
      className="overflow-y-auto px-4 pt-4" 
      style={{
        height: 'calc(100dvh - 180px - var(--bottom-nav-total, 88px) - env(safe-area-inset-top, 0px))'
      }}
    >
      <div className="max-w-4xl mx-auto h-full">
        <div className="h-full flex flex-col">
          {/* Messaggio informativo per utenti non editor */}
          
          {/* Text Area Container */}
          <div className="relative flex-1">
            <textarea
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              readOnly={!canEdit}
              placeholder={canEdit ? 
                "Scrivi qui le tue note sull'evento... Il contenuto viene salvato automaticamente." :
                "Contenuto della Pagella..."
              }
              className={`w-full h-full p-4 rounded-lg text-base leading-relaxed resize-none focus:outline-none ${
                canEdit 
                  ? 'bg-white border border-gray-300 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  : 'bg-gray-100 border border-gray-200 text-gray-700 cursor-default'
              }`}
              style={{ minHeight: '500px' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
