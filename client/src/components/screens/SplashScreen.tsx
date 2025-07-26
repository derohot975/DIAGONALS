import { useEffect } from 'react';
import diagonaleLogo from '@assets/appdiago_1753567545836.png';

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#300505] to-[#8d0303]">
      <div className="animate-fade-in">
        <img 
          src={diagonaleLogo} 
          alt="DIAGONALE" 
          className="w-48 h-auto mx-auto drop-shadow-2xl" 
        />
      </div>
    </div>
  );
}