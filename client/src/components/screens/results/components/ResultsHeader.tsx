import diagoLogo from '@assets/diagologo.png';

export default function ResultsHeader() {
  return (
    <div className="flex-shrink-0 pt-[env(safe-area-inset-top)] bg-gradient-to-b from-[#300505] to-transparent">
      <div className="flex justify-center pt-10 pb-4">
        <div className="relative">
          <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full"></div>
          <img
            src={diagoLogo}
            alt="DIAGO Logo"
            className="relative mx-auto w-24 h-auto logo-filter drop-shadow-2xl"
          />
        </div>
      </div>
      <div className="text-center pb-6">
        <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-1">Risultati</p>
        <h2 className="text-3xl font-bold text-white tracking-tight">Classifica</h2>
      </div>
    </div>
  );
}
