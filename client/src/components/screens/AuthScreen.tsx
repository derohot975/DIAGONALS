import { useState } from 'react';
import { LogIn, UserPlus, Settings } from '@/components/icons';
import diagoLogo from '@assets/diagologo.png';
import '@/styles/auth-keypad-mobile.css';

interface AuthScreenProps {
  onLogin: (name: string, pin: string) => void;
  onRegister: (name: string, pin: string) => void;
  onGoBack: () => void;
  onShowAdmin?: () => void;
  isLoading: boolean;
  error: string | null;
}

export default function AuthScreen({ onLogin, onRegister, onGoBack, onShowAdmin, isLoading, error }: AuthScreenProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoginMode && (name.trim().length === 0 || name.trim().length > 10)) return;
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) return;
    if (isLoginMode) {
      onLogin('', pin);
    } else {
      onRegister(name.trim(), pin);
    }
  };

  const handleNumberInput = (number: string) => {
    if (pin.length < 4) setPin(prev => prev + number);
  };

  const handleDeletePin = () => setPin(prev => prev.slice(0, -1));

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-[#300505] to-[#1a0303]">
      {/* Logo Header */}
      <div className="flex-shrink-0 flex justify-center pt-14 pb-10">
        <div className="relative">
          <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full"></div>
          <img src={diagoLogo} alt="DIAGO Logo" className="relative mx-auto w-28 h-auto logo-filter drop-shadow-2xl" />
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 flex flex-col items-center px-8">
        <div className="w-full max-w-xs">
          <div className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Nome - solo registrazione */}
              {!isLoginMode && (
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-3 text-center">
                    Il tuo nome (max 10 caratteri)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => { const v = e.target.value.toUpperCase(); if (v.length <= 10) setName(v); }}
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 px-4 py-3 rounded-2xl text-center text-lg font-bold focus:outline-none focus:border-white/30 uppercase"
                    placeholder="NOME"
                    maxLength={10}
                    required
                  />
                </div>
              )}

              {/* PIN label */}
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-5 text-center">
                  {isLoginMode ? 'Inserisci il tuo PIN' : 'Scegli un PIN (4 cifre)'}
                </label>

                {isLoginMode ? (
                  <>
                    {/* PIN dots */}
                    <div className="flex justify-center space-x-4 mb-8">
                      {[0, 1, 2, 3].map((i) => (
                        <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${pin.length > i ? 'bg-white border-white scale-110' : 'border-white/30'}`} />
                      ))}
                    </div>

                    {/* Keypad */}
                    <div className="grid grid-cols-3 gap-4 auth-keypad-container">
                      {[1,2,3,4,5,6,7,8,9].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => handleNumberInput(n.toString())}
                          className="w-full aspect-square bg-white/5 border border-white/10 text-white text-2xl font-bold rounded-2xl active:scale-90 active:bg-white/20 transition-all duration-150 auth-keypad-button number relative"
                        >
                          {n}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={handleDeletePin}
                        className="w-full aspect-square bg-white/5 border border-white/10 text-white/40 text-lg font-bold rounded-2xl active:scale-90 transition-all duration-150 auth-keypad-button delete relative"
                      >
                        C
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNumberInput('0')}
                        className="w-full aspect-square bg-white/5 border border-white/10 text-white text-2xl font-bold rounded-2xl active:scale-90 active:bg-white/20 transition-all duration-150 auth-keypad-button number relative"
                      >
                        0
                      </button>
                      {onShowAdmin && (
                        <button
                          type="button"
                          onClick={onShowAdmin}
                          className="w-full aspect-square bg-white/5 border border-white/10 text-white/30 rounded-2xl active:scale-90 transition-all duration-150 flex items-center justify-center auth-keypad-button admin relative"
                        >
                          <Settings className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <input
                      type="tel"
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 px-4 py-4 rounded-2xl text-center text-3xl font-bold tracking-[1rem] focus:outline-none focus:border-white/30"
                      placeholder="••••"
                      maxLength={4}
                      required
                    />
                    <p className="text-white/30 text-xs text-center mt-3">Usa giorno e mese di nascita — così te lo ricordi anche da ubriaco 🍷</p>
                  </>
                )}
              </div>

              {/* Errore */}
              {error && (
                <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-2xl text-center font-bold">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading || pin.length !== 4 || (!isLoginMode && name.trim().length === 0)}
                className="w-full bg-white text-red-950 font-bold py-4 rounded-2xl text-lg disabled:opacity-30 active:scale-95 transition-all duration-200 flex items-center justify-center space-x-2 shadow-xl"
              >
                {isLoading ? (
                  <span>Caricamento...</span>
                ) : (
                  <>
                    {isLoginMode ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                    <span>{isLoginMode ? 'Accedi' : 'Registrati'}</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Toggle mode */}
          <div className="text-center pt-6">
            <button
              type="button"
              onClick={() => { setIsLoginMode(!isLoginMode); setName(''); setPin(''); }}
              className="text-white/40 hover:text-white/70 font-medium text-sm transition-colors"
            >
              {isLoginMode ? 'Non hai un account? Registrati' : 'Hai già un account? Accedi'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
