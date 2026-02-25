import React from 'react';

interface LoadingSkeletonProps {
  showLogo?: boolean;
  showNavigation?: boolean;
}

function LoadingSkeleton({ showLogo = true }: LoadingSkeletonProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#300505] to-[#1a0303]">
      {showLogo && (
        <img
          src="/diagologo.png"
          alt="DIAGONALE"
          className="w-24 h-auto mb-8 opacity-60"
        />
      )}
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white/40" />
    </div>
  );
}

export default LoadingSkeleton;
