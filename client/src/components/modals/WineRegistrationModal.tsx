import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Wine } from '@shared/schema';

interface WineRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: { name: string } | null;
  wine?: Wine | null;
  onRegisterWine: (wineData: {
    type: string;
    name: string;
    producer: string;
    grape: string;
    year: number;
    origin: string;
    price: number;
    alcohol?: number;
  }) => void;
}

export default function WineRegistrationModal({ isOpen, onClose, currentUser, wine, onRegisterWine }: WineRegistrationModalProps) {
  const [type, setType] = useState('');
  const [name, setName] = useState('');
  const [producer, setProducer] = useState('');
  const [grape, setGrape] = useState('');
  const [year, setYear] = useState('');
  const [origin, setOrigin] = useState('');
  const [price, setPrice] = useState('');
  const [alcohol, setAlcohol] = useState('');

  // Pre-compile fields when editing existing wine
  useEffect(() => {
    if (wine && isOpen) {
      setType(wine.type || '');
      setName(wine.name || '');
      setProducer(wine.producer || '');
      setGrape(wine.grape || '');
      setYear(wine.year?.toString() || '');
      setOrigin(wine.origin || '');
      setPrice(wine.price?.toString() || '');
      setAlcohol(wine.alcohol?.toString() || '');
    } else if (isOpen && !wine) {
      // Reset all fields when opening for new registration
      setType('');
      setName('');
      setProducer('');
      setGrape('');
      setYear('');
      setOrigin('');
      setPrice('');
      setAlcohol('');
    }
  }, [wine, isOpen]);

  // Function to capitalize first letter of each word
  const capitalizeFirstLetter = (str: string) => {
    return str.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type && name.trim() && producer.trim() && grape.trim() && year && origin.trim() && price && alcohol) {
      onRegisterWine({
        type,
        name: name.trim(), // Nome vino già maiuscolo dal campo
        producer: producer.trim(),
        grape: grape.trim(),
        year: parseInt(year),
        origin: origin.trim(),
        price: parseFloat(price),
        alcohol: parseFloat(alcohol)
      });
      setType('');
      setName('');
      setProducer('');
      setGrape('');
      setYear('');
      setOrigin('');
      setPrice('');
      setAlcohol('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* Nome utente sopra il modale */}
      {currentUser && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-60">
          <div className="glass-effect rounded-xl px-6 py-2 shadow-lg">
            <span className="text-white font-bold text-lg">{currentUser.name}</span>
          </div>
        </div>
      )}

      {/* Messaggio successo per modifica vino */}
      {wine && currentUser && (
        <div className="absolute top-32 left-1/2 transform -translate-x-1/2 z-60">
          <div className="text-center py-2">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-xl animate-bounce">⭐</span>
              <span className="text-white font-bold text-base">REGISTRATO CON SUCCESSO!</span>
              <span className="text-xl animate-bounce" style={{ animationDelay: '0.5s' }}>⭐</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="glass-effect rounded-2xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-[hsl(270,50%,65%)]">
            🍷 {wine ? 'Modifica Vino' : 'Registra Vino'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipologia</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(229,73%,69%)]"
              required
            >
              <option value="">Seleziona tipologia</option>
              <option value="Bianco">Bianco</option>
              <option value="Rosso">Rosso</option>
              <option value="Bollicina">Bollicina</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Vino</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.toUpperCase())}
              placeholder="es. BAROLO RISERVA"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(229,73%,69%)] uppercase"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Produttore</label>
            <input
              type="text"
              value={producer}
              onChange={(e) => setProducer(capitalizeFirstLetter(e.target.value))}
              placeholder="es. Antinori"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(229,73%,69%)]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vitigno</label>
            <input
              type="text"
              value={grape}
              onChange={(e) => setGrape(capitalizeFirstLetter(e.target.value))}
              placeholder="es. Sangiovese, Chardonnay"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(229,73%,69%)]"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Anno</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                min="1900"
                max="2025"
                placeholder="2020"
                className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(229,73%,69%)] text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Prezzo (€)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
                step="0.01"
                placeholder="25.00"
                className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(229,73%,69%)] text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Grad. %</label>
              <input
                type="number"
                value={alcohol}
                onChange={(e) => setAlcohol(e.target.value)}
                min="0"
                max="50"
                step="0.1"
                placeholder="13.5"
                className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(229,73%,69%)] text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Provenienza</label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(capitalizeFirstLetter(e.target.value))}
              placeholder="es. Piemonte, Italia"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(229,73%,69%)]"
              required
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="flex-1 bg-[#8d0303] hover:bg-[#300505] text-white px-4 py-3 rounded-lg transition-colors font-medium"
            >
              Registrati
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
