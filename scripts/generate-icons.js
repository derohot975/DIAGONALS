import fs from 'fs';
import { createCanvas, loadImage } from 'canvas';

async function generateIcons() {
  try {
    // Carica l'immagine originale
    const originalImage = await loadImage('./attached_assets/appdiago copia_1753107226978.jpg');
    
    const sizes = [96, 144, 192, 512];
    
    for (const size of sizes) {
      // Crea canvas per ogni dimensione
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext('2d');
      
      // Disegna l'immagine ridimensionata
      ctx.drawImage(originalImage, 0, 0, size, size);
      
      // Salva come PNG
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(`./public/icon-${size}x${size}.png`, buffer);
      
      console.log(`✅ Creata icona ${size}x${size}`);
    }
    
    console.log('🎉 Tutte le icone PWA create con successo!');
  } catch (error) {
    console.error('❌ Errore nella generazione:', error);
  }
}

generateIcons();