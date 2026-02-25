// BEGIN DIAGONALE APP SHELL - LoadingSkeleton Component
import React from 'react';

interface LoadingSkeletonProps {
  showLogo?: boolean;
  showNavigation?: boolean;
}

/**
 * LoadingSkeleton - Componente skeleton per App Shell
 * Mostra immediatamente la struttura base dell'app durante il caricamento
 * REVERSIBILE: Rimuovere questo file per tornare al loading originale
 */
function LoadingSkeleton({ showLogo = true, showNavigation = true }: LoadingSkeletonProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#300505] to-[#1a0303]">
      {/* Header con Logo - Sempre visibile */}
      {showLogo && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-fade-in">
            <img 
              src="/diagologo.png" 
              alt="DIAGONALE" 
              className="w-32 h-auto mx-auto drop-shadow-2xl" 
            />
          </div>
        </div>
      )}

      {/* Navigation Skeleton */}
      {showNavigation && (
        <div className="px-6 mb-6">
          <div className="glass-effect rounded-2xl p-4">
            <div className="flex justify-between items-center">
              <div className="h-6 bg-white/20 rounded animate-pulse w-32"></div>
              <div className="h-8 bg-white/20 rounded animate-pulse w-24"></div>
            </div>
          </div>
        </div>
      )}

      {/* Content Skeleton */}
      <div className="flex-1 px-6">
        <div className="glass-effect rounded-2xl p-6 mb-6">
          {/* Title Skeleton */}
          <div className="h-8 bg-white/20 rounded animate-pulse mb-4 w-48"></div>
          
          {/* Cards Skeleton */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-effect rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-2 flex-1">
                    <div className="h-5 bg-white/20 rounded animate-pulse w-3/4"></div>
                    <div className="h-4 bg-white/20 rounded animate-pulse w-1/2"></div>
                  </div>
                  <div className="h-10 bg-white/20 rounded animate-pulse w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Loading Indicator */}
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
          <p className="text-white/80 text-sm">Caricamento dati...</p>
        </div>
      </div>
    </div>
  );
}

export default LoadingSkeleton;
// END DIAGONALE APP SHELL - LoadingSkeleton Component
