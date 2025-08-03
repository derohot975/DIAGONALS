import { useState } from 'react';
import { Home, ArrowLeft, Save } from 'lucide-react';
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





  // Carica il contenuto salvato al mount
  useState(() => {
    const saved = localStorage.getItem(`pagella_${event.id}`);
    if (saved) {
      setContent(saved);
    }
  });

  return (
    <div className="flex-1 flex flex-col">
      {/* Fixed Header - Logo and Title */}
      <div className="sticky top-0 z-10 text-center py-4" style={{background: 'linear-gradient(to bottom, #8d0303 0%, #300505 100%)'}}>
        <img 
          src={diagoLogo} 
          alt="DIAGO Logo" 
          className="mx-auto mb-2 w-16 h-auto logo-filter drop-shadow-lg" 
        />
        <h2 className="pagellone-tommy-font text-xl font-bold text-yellow-200">
          Pagellone di Tommy
        </h2>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden px-4 pb-20 pt-4">
        <div className="max-w-4xl mx-auto h-full">
          <div className="h-full flex flex-col">
            {/* Text Area Container */}
            <div className="relative flex-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Scrivi qui le tue note sull'evento o incolla un testo copiato in precedenza..."
                className="w-full h-full p-4 bg-white border border-gray-300 rounded-lg text-gray-800 text-base leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ minHeight: '500px' }}
              />
              
              {/* Action Button - Inside textarea, bottom right */}
              <div className="absolute bottom-4 right-4">
                <button
                  onClick={handleSave}
                  className={`p-2 rounded-full shadow-lg transition-colors ${
                    isSaved 
                      ? 'bg-green-500 text-white' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                  title={isSaved ? 'Salvato!' : 'Salva'}
                >
                  <Save className="w-4 h-4" />
                </button>
              </div>
            </div>
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