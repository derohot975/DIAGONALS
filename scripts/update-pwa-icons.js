import fs from 'fs';
import { createCanvas, loadImage } from 'canvas';

async function generatePWAIcons() {
  console.log('🔄 Aggiornamento icone PWA...');
  
  // Carica l'immagine sorgente aggiornata
  const sourceImage = await loadImage('./public/appdiago.png');
  
  // Dimensioni delle icone PWA necessarie
  const sizes = [
    { size: 96, filename: 'icon-96x96.png' },
    { size: 144, filename: 'icon-144x144.png' },
    { size: 192, filename: 'icon-192x192.png' },
    { size: 512, filename: 'icon-512x512.png' },
    { size: 180, filename: 'apple-touch-icon.png' }
  ];
  
  for (const { size, filename } of sizes) {
    console.log(`📱 Generando ${filename} (${size}x${size}px)...`);
    
    // Crea canvas della dimensione richiesta
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Disegna l'immagine ridimensionata
    ctx.drawImage(sourceImage, 0, 0, size, size);
    
    // Salva l'icona
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(`./public/${filename}`, buffer);
    
    console.log(`✅ ${filename} creata`);
  }
  
  console.log('🎉 Tutte le icone PWA sono state aggiornate!');
}

generatePWAIcons().catch(console.error);