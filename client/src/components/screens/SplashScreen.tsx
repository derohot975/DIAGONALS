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
        <div className="animate-fade-in">
          <img 
            src="/diagologo.png" 
            alt="DIAGONALE" 
            className="w-48 h-auto mx-auto drop-shadow-2xl logo-bounce" 
          />
        </div>
      </div>
      
      {/* Firma in fondo */}
      <div className="pb-24 text-center">
        <p className="text-white text-base font-medium drop-shadow-lg">By DERO</p>
      </div>
    </div>
  );
}