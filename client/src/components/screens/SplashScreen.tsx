import { useEffect } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#300505] to-[#1a0303]">
      {/* Logo centrato */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative">
          <div className="animate-fade-in">
            <img 
              src="/diagologo.png" 
              alt="DIAGONALE" 
              className="w-48 h-auto mx-auto drop-shadow-2xl logo-bounce" 
            />
          </div>
          {/* Spinner discreto per indicare caricamento dati in background */}
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white/20" />
          </div>
        </div>
      </div>
      
      {/* Firma in fondo */}
      <div className="pb-24 text-center">
        <p className="text-white text-base font-medium drop-shadow-lg">By DERO</p>
      </div>
    </div>
  );
}