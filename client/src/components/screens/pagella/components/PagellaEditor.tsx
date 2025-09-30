interface PagellaEditorProps {
  content: string;
  canEdit: boolean;
  onContentChange: (content: string) => void;
}

export default function PagellaEditor({ content, canEdit, onContentChange }: PagellaEditorProps) {
  return (
    <div className="flex-1 overflow-hidden px-4 pb-20 pt-4">
      <div className="max-w-4xl mx-auto h-full">
        <div className="h-full flex flex-col">
          {/* Messaggio informativo per utenti non editor */}
          {!canEdit && (
            <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
              <p className="text-blue-200 text-sm text-center">
                📖 Stai visualizzando la Pagella in sola lettura. Solo DERO e TOMMY possono modificarla.
              </p>
            </div>
          )}
          
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
