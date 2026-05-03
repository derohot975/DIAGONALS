import { WineEvent, WineResultDetailed } from '@shared/schema';
import { formatEventName } from '@/lib/utils';

const formatResults = (event: WineEvent, results: WineResultDetailed[]) => {
  let text = `🏆 CLASSIFICA FINALE\n`;
  text += `🍷 ${formatEventName(event.name)}\n`;
  text += `📅 ${event.date}\n\n`;

  results.forEach((result, index) => {
    const position = index + 1;
    const medal =
      position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : `${position}.`;
    text += `${medal} ${result?.name || 'Vino senza nome'}\n`;
    text += `   ⭐ ${(result?.averageScore || 0).toFixed(1)} punti\n`;
    text += `   💰 ${result?.price || '0'}€\n`;
    text += `   👤 Portato da: ${result?.contributor || 'Sconosciuto'}\n`;
    text += `   🗳️ ${result?.totalVotes || 0} voti\n\n`;
  });

  text += `📱 Generato dall'app DIAGONALE`;
  return text;
};

export const handleExport = async (event: WineEvent, results: WineResultDetailed[]) => {
  const shareData = {
    title: `Classifica ${formatEventName(event.name)}`,
    text: formatResults(event, results),
  };

  try {
    // Prova la Web Share API nativa (mobile)
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      await navigator.share(shareData);
    } else {
      // Fallback: copia negli appunti
      await navigator.clipboard.writeText(shareData.text);
      alert('Risultati copiati negli appunti! Puoi incollarli dove preferisci.');
    }
  } catch (error) {
    // Fallback finale: mostra i risultati in un alert
    // Sharing error handled
    alert('Impossibile condividere. I risultati:\n\n' + shareData.text);
  }
};
