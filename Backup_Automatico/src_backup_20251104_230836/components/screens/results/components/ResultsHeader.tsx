import diagoLogo from '@assets/diagologo.png';

export default function ResultsHeader() {
  return (
    <div className="sticky top-0 z-20 flex-shrink-0 pt-[env(safe-area-inset-top)]" style={{background: '#300505'}}>
      <div className="flex justify-center pt-4 pb-4">
        <img 
          src={diagoLogo} 
          alt="DIAGO Logo" 
          className="mx-auto mb-2 w-24 h-auto logo-filter drop-shadow-lg" 
        />
      </div>
      <div className="text-center pb-6">
        <h2 className="text-2xl font-bold text-yellow-200 mb-2">Classifica Finale</h2>
      </div>
    </div>
  );
}
