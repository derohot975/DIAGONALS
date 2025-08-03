import { useState } from 'react';
import { Home, ArrowLeft, Save, Copy, Trash2 } from 'lucide-react';
import diagoLogo from '@assets/diagologo.png';
import { WineEvent } from '@shared/schema';

interface PagellaScreenProps {
  event: WineEvent | null;
  onGoBack: () => void;
  onGoHome: () => void;
}

export default function PagellaScreen({ event, onGoBack, onGoHome }: PagellaScreenProps) {
  const [content, setContent] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  if (!event) return null;

  const handleSave = () => {
    // Salva nel localStorage per ora
    localStorage.setItem(`pagella_${event.id}`, content);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      alert('Testo copiato negli appunti!');
    } catch (error) {
      console.error('Errore durante la copia:', error);
    }
  };

  const handleClear = () => {
    if (confirm('Sei sicuro di voler cancellare tutto il contenuto?')) {
      setContent('');
    }
  };

  // Carica il contenuto salvato al mount
  useState(() => {
    const saved = localStorage.getItem(`pagella_${event.id}`);
    if (saved) {
      setContent(saved);
    }
  });

  return (
    <div className="flex-1 flex flex-col">
      {/* Logo Header */}
      <div className="flex-shrink-0 flex justify-center pt-8 pb-4">
        <img 
          src={diagoLogo} 
          alt="DIAGO Logo" 
          className="mx-auto mb-2 w-24 h-auto logo-filter drop-shadow-lg" 
        />
      </div>

      {/* Title */}
      <div className="flex-shrink-0 text-center pb-6">
        <h2 className="text-2xl font-bold text-yellow-200 mb-2">
          Pagella Evento
        </h2>
        <p className="text-yellow-100 text-sm">{event.name}</p>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden px-4 pb-20">
        <div className="max-w-4xl mx-auto h-full">
          <div className="h-full flex flex-col">
            {/* Toolbar */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 ${
                    isSaved 
                      ? 'bg-green-200 text-green-800' 
                      : 'bg-blue-200 hover:bg-blue-300 text-blue-800'
                  }`}
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaved ? 'Salvato!' : 'Salva'}</span>
                </button>
                
                <button
                  onClick={handleCopy}
                  className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                  disabled={!content.trim()}
                >
                  <Copy className="w-4 h-4" />
                  <span>Copia</span>
                </button>
                
                <button
                  onClick={handleClear}
                  className="px-3 py-2 bg-red-200 hover:bg-red-300 text-red-800 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                  disabled={!content.trim()}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Cancella</span>
                </button>
              </div>
              
              <div className="text-sm text-gray-300">
                {content.length} caratteri
              </div>
            </div>

            {/* Text Area */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Scrivi qui le tue note sull'evento o incolla un testo copiato in precedenza..."
              className="flex-1 w-full p-4 bg-white border border-gray-300 rounded-lg text-gray-800 text-base leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ minHeight: '400px' }}
            />
          </div>
        </div>
      </div>
      
      {/* Navigation Buttons - Bottom Center */}
      <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={onGoBack}
            className="text-white p-3 rounded-full shadow-lg transition-all hover:bg-white hover:bg-opacity-10"
            style={{background: 'rgba(255, 255, 255, 0.1)'}}
            title="Indietro"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={onGoHome}
            className="text-white p-3 rounded-full shadow-lg transition-all hover:bg-white hover:bg-opacity-10"
            style={{background: 'rgba(255, 255, 255, 0.1)'}}
            title="Home"
          >
            <Home className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}