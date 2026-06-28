#!/usr/bin/env node
import { copyFileSync, existsSync } from 'fs';
import { join } from 'path';

// Sorgente PWA = client/public (cartella servita da Vite, root=client). Unica fonte coerente.
const publicDir = './client/public';
const distDir = './dist/public';

// File da copiare per PWA
const pwaFiles = [
  'icon-96x96.png',
  'icon-144x144.png',
  'icon-192x192.png',
  'icon-512x512.png',
  'apple-touch-icon.png',
  'manifest.json',
  'sw.js',
];

console.log('🔧 Copiando file PWA nella build...');

pwaFiles.forEach((file) => {
  const src = join(publicDir, file);
  const dest = join(distDir, file);

  if (existsSync(src)) {
    try {
      copyFileSync(src, dest);
      console.log(`✅ Copiato: ${file}`);
    } catch (err) {
      console.log(`❌ Errore copiando ${file}:`, err.message);
    }
  } else {
    console.log(`⚠️  File non trovato: ${file}`);
  }
});

console.log('🎉 File PWA copiati nella build di produzione!');
