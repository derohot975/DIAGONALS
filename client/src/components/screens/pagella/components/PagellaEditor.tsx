interface PagellaEditorProps {
  content: string;
  canEdit: boolean;
  onContentChange: (content: string) => void;
}

export default function PagellaEditor({ content, canEdit, onContentChange }: PagellaEditorProps) {
  return (
    <div
      className="overflow-y-auto px-4 pt-2 pb-4"
      style={{
        height: 'calc(100dvh - 180px - var(--bottom-nav-total, 56px) - env(safe-area-inset-top, 0px))'
      }}
    >
      <div className="max-w-4xl mx-auto h-full">
        <div className="h-full flex flex-col">
          <div className="relative flex-1">
            <textarea
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              readOnly={!canEdit}
              placeholder={canEdit
                ? 'Scrivi qui le tue note... Il contenuto viene salvato automaticamente.'
                : 'Contenuto della Pagella...'}
              className={`w-full h-full p-4 rounded-2xl text-base leading-relaxed resize-none focus:outline-none transition-all ${
                canEdit
                  ? 'bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/30 focus:ring-2 focus:ring-white/20 focus:border-white/30'
                  : 'bg-white/5 border border-white/10 text-white/70 cursor-default placeholder-white/20'
              }`}
              style={{ minHeight: '420px' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
