import fs from 'fs';
import { execSync } from 'child_process';
import os from 'os';
import path from 'path';
import { createCanvas, loadImage } from 'canvas';

// Due sorgenti master (NON toccano il logo vivo dentro l'app: client/src usa diagologo.png a parte):
// - FAVICON: icona piccola per la tab del browser.
// - HOME: icona per "aggiungi a home" / PWA (apple-touch + icone grandi del manifest).
const FAVICON_SOURCE = './client/public/Icona Tab Browser (favicon).webp';
const HOME_SOURCE = './client/public/Icona Schermata Home.webp';

// Quali dimensioni derivano da quale sorgente.
const FAVICON_SIZES = [16, 32, 96]; // tab browser
const HOME_SIZES = [144, 192, 512]; // home screen / PWA

async function loadSource(src) {
  // canvas non legge webp: converto in PNG temporaneo via sips (nativo macOS).
  let png = src;
  if (src.toLowerCase().endsWith('.webp')) {
    png = path.join(os.tmpdir(), 'diago-' + path.basename(src) + '.png');
    execSync(`sips -s format png "${src}" --out "${png}"`, { stdio: 'ignore' });
  }
  return loadImage(png);
}

function writeIcon(image, size, file) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.clearRect(0, 0, size, size);
  ctx.drawImage(image, 0, 0, size, size);
  const buffer = canvas.toBuffer('image/png', { compressionLevel: 9 });
  fs.writeFileSync(file, buffer);
  // Ottimizzazione peso: pngquant mantiene qualità visiva ma riduce drasticamente i byte (icone leggere/veloci).
  try {
    execSync(`pngquant --quality=80-95 --strip --force --output "${file}" "${file}"`, { stdio: 'ignore' });
  } catch {
    // pngquant non disponibile: si tiene il PNG non quantizzato.
  }
  const finalSize = fs.statSync(file).size;
  console.log(`✅ ${path.basename(file)} (${size}x${size}, ${finalSize} bytes)`);
}

async function generateIcons() {
  try {
    const favicon = await loadSource(FAVICON_SOURCE);
    for (const size of FAVICON_SIZES) {
      writeIcon(favicon, size, `./client/public/icon-${size}x${size}.png`);
    }

    const home = await loadSource(HOME_SOURCE);
    for (const size of HOME_SIZES) {
      writeIcon(home, size, `./client/public/icon-${size}x${size}.png`);
    }
    // apple-touch-icon 180x180 (icona iOS in home screen) → sorgente HOME.
    writeIcon(home, 180, './client/public/apple-touch-icon.png');

    console.log('🎉 Icone generate: favicon (tab) + home screen (PWA), coerenti.');
  } catch (error) {
    console.error('❌ Errore nella generazione:', error);
    process.exit(1);
  }
}

generateIcons();
