import { useState } from 'react';
import { LogIn, UserPlus, ArrowLeft } from 'lucide-react';
import diagoLogo from '@assets/diagologo.png';

interface AuthScreenProps {
  onLogin: (name: string, pin: string) => void;
  onRegister: (name: string, pin: string) => void;
  onGoBack: () => void;
  isLoading: boolean;
  error: string | null;
}

export default function AuthScreen({ 
  onLogin, 
  onRegister, 
  onGoBack, 
  isLoading, 
  error 
}: AuthScreenProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validazione nome (max 10 caratteri)
    if (name.trim().length === 0 || name.trim().length > 10) {
      return;
    }
    
    // Validazione PIN (4 cifre)
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return;
    }

    if (isLoginMode) {
      onLogin(name.trim(), pin);
    } else {
      onRegister(name.trim(), pin);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    if (value.length <= 10) {
      setName(value);
    }
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Solo numeri
    if (value.length <= 4) {
      setPin(value);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Logo Header */}
      <div className="flex-shrink-0 flex justify-center pt-8 pb-6">
        <img 
          src={diagoLogo} 
          alt="DIAGO Logo" 
          className="mx-auto mb-2 w-24 h-auto logo-filter drop-shadow-lg" 
        />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="max-w-md mx-auto">
          
          {/* Titolo */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white">
              {isLoginMode ? 'ACCEDI' : 'REGISTRATI'}
            </h1>
          </div>

          {/* Form */}
          <div className="bg-white/95 rounded-2xl p-6 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Nome Utente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Utente (max 10 caratteri)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#300505] focus:border-transparent uppercase"
                  placeholder="INSERISCI IL TUO NOME"
                  maxLength={10}
                  required
                />
                <div className="text-xs text-gray-500 mt-1">
                  {name.length}/10 caratteri
                </div>
              </div>

              {/* PIN */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PIN (4 cifre)
                </label>
                <input
                  type="password"
                  value={pin}
                  onChange={handlePinChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#300505] focus:border-transparent text-center text-2xl tracking-widest"
                  placeholder="••••"
                  maxLength={4}
                  required
                />
                <div className="text-xs text-gray-500 mt-1">
                  💡 Suggerimento: Inserisci giorno e mese di nascita così anche se sei ubriaco non te lo scordi
                </div>
              </div>

              {/* Errore */}
              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-2 rounded-lg">
                  {error}
                </div>
              )}

              {/* Pulsante Submit */}
              <button
                type="submit"
                disabled={isLoading || name.trim().length === 0 || pin.length !== 4}
                className="w-full bg-gradient-to-r from-[#300505] to-[#8d0303] hover:from-[#240404] hover:to-[#a00404] text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <span>Caricamento...</span>
                ) : (
                  <>
                    {isLoginMode ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                    <span>{isLoginMode ? 'ACCEDI' : 'REGISTRATI'}</span>
                  </>
                )}
              </button>

              {/* Toggle Mode */}
              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsLoginMode(!isLoginMode);
                    setName('');
                    setPin('');
                  }}
                  className="text-[#300505] hover:text-[#8d0303] font-medium underline"
                >
                  {isLoginMode ? 'Non hai un account? Registrati' : 'Hai già un account? Accedi'}
                </button>
              </div>

            </form>
          </div>
          
        </div>
      </div>

      {/* Pulsante freccia indietro */}
      <div className="fixed bottom-4 left-4 z-50">
        <button
          onClick={onGoBack}
          className="bg-[hsl(229,73%,69%)] hover:bg-[hsl(270,50%,65%)] text-white p-3 rounded-full shadow-lg transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}