import { useState } from 'react';
import { LogIn, UserPlus, Shield } from 'lucide-react';
import diagoLogo from '@assets/diagologo.png';

interface AuthScreenProps {
  onLogin: (name: string, pin: string) => void;
  onRegister: (name: string, pin: string) => void;
  onGoBack: () => void;
  onShowAdmin?: () => void;
  isLoading: boolean;
  error: string | null;
}

export default function AuthScreen({ 
  onLogin, 
  onRegister, 
  onGoBack,
  onShowAdmin,
  isLoading, 
  error 
}: AuthScreenProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validazione nome solo in modalità registrazione
    if (!isLoginMode && (name.trim().length === 0 || name.trim().length > 10)) {
      return;
    }
    
    // Validazione PIN (4 cifre)
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return;
    }

    if (isLoginMode) {
      onLogin('', pin); // In modalità login non serve il nome
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

  const handleNumberInput = (number: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + number);
    }
  };

  const handleDeletePin = () => {
    setPin(prev => prev.slice(0, -1));
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
        <div className="max-w-xs mx-auto">
          


          {/* Form */}
          <div className="bg-white/95 rounded-2xl p-6 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Nome Utente - Solo in modalità registrazione */}
              {!isLoginMode && (
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
              )}

              {/* PIN */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                  PIN (4 cifre)
                </label>
                
                {/* PIN Display */}
                <div className="flex justify-center mb-4">
                  <div className="flex space-x-2">
                    {[0, 1, 2, 3].map((index) => (
                      <div
                        key={index}
                        className="w-12 h-12 border-2 border-gray-300 rounded-lg flex items-center justify-center bg-white"
                      >
                        <span className="text-2xl font-bold text-gray-800">
                          {pin[index] ? '•' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Smart Keypad */}
                <div className="flex justify-center mb-4">
                  <div className="grid grid-cols-3 gap-5 max-w-xs">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
                      <button
                        key={number}
                        type="button"
                        onClick={() => handleNumberInput(number.toString())}
                        className="w-16 h-16 bg-white border-2 border-gray-200 text-[#300505] text-2xl font-bold rounded-full hover:bg-gray-50 hover:border-[#300505] active:scale-95 transition-all duration-150 shadow-lg"
                      >
                        {number}
                      </button>
                    ))}
                    
                    {/* Empty space */}
                    <div></div>
                    
                    {/* Zero */}
                    <button
                      type="button"
                      onClick={() => handleNumberInput('0')}
                      className="w-16 h-16 bg-white border-2 border-gray-200 text-[#300505] text-2xl font-bold rounded-full hover:bg-gray-50 hover:border-[#300505] active:scale-95 transition-all duration-150 shadow-lg"
                    >
                      0
                    </button>
                    
                    {/* Delete */}
                    <button
                      type="button"
                      onClick={handleDeletePin}
                      className="w-16 h-16 bg-white border-2 border-gray-300 text-gray-600 text-xl font-bold rounded-full hover:bg-gray-50 hover:border-gray-500 active:scale-95 transition-all duration-150 shadow-lg flex items-center justify-center"
                    >
                      ⌫
                    </button>
                  </div>
                </div>

                {!isLoginMode && (
                  <div className="text-sm text-yellow-700 mt-1 text-center font-semibold">
                    🍷 Inserisci giorno e mese di nascita,<br />così te lo ricordi anche da ubriaco! 🍷
                  </div>
                )}
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
                disabled={isLoading || pin.length !== 4 || (!isLoginMode && name.trim().length === 0)}
                className={`w-full font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-white ${
                  pin.length === 4 && (isLoginMode || name.trim().length > 0)
                    ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600'
                    : 'bg-gradient-to-r from-[#300505] to-[#8d0303] hover:from-[#240404] hover:to-[#a00404]'
                }`}
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

      {/* Pulsante Admin Centralizzato */}
      {onShowAdmin && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <button
            onClick={onShowAdmin}
            className="bg-[hsl(229,73%,69%)] hover:bg-[hsl(270,50%,65%)] text-white p-3 rounded-full shadow-lg transition-all"
          >
            <Shield className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}