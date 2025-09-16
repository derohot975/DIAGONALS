#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const backupDir = path.join(projectRoot, 'Backup_Automatico');

// File e cartelle essenziali da includere nel backup (personalizzati per DIAGONALE)
const filesToBackup = [
  'client/',
  'server/',
  'shared/',
  'scripts/',
  'DOCS/',
  'public/',
  '.github/',
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'vite.config.ts',
  'tailwind.config.ts',
  'postcss.config.js',
  'drizzle.config.ts',
  'components.json',
  '.gitignore',
  '.replit',
  'replit.md',
  'README.md',
  '.env.development'
];

// File e cartelle da escludere automaticamente
const excludePatterns = [
  'node_modules',
  '.git',
  'dist',
  '.cache',
  '.parcel-cache',
  '.vite',
  '.next',
  '.nuxt',
  'coverage',
  '.nyc_output',
  'tmp',
  'temp',
  '*.log',
  '.DS_Store',
  'Thumbs.db',
  '.env.local',
  '.env.production.local',
  'Backup_Automatico'
];

// Utility per logging con timestamp italiano
function log(message, type = 'INFO') {
  const now = new Date();
  const timestamp = now.toLocaleString('it-IT', {
    timeZone: 'Europe/Rome',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  
  const prefix = {
    'INFO': '✅',
    'WARN': '⚠️',
    'ERROR': '❌',
    'SUCCESS': '🎉'
  }[type] || 'ℹ️';
  
  console.log(`${prefix} [${timestamp}] ${message}`);
}

// Crea la cartella di backup se non esiste
function ensureBackupDir() {
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
    log(`Cartella backup creata: ${backupDir}`);
  }
}

// Genera nome backup con formato ddMMyyyy_HHmm
function generateBackupName() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  let baseName = `BACKUP_${day}${month}${year}_${hours}${minutes}`;
  let counter = 0;
  let finalName = baseName;
  
  // Aggiungi suffisso numerico se il file esiste già
  while (fs.existsSync(path.join(backupDir, `${finalName}.tar.gz`))) {
    counter++;
    finalName = `${baseName}_${counter}`;
  }
  
  return `${finalName}.tar.gz`;
}

// Ottieni lista backup ordinata per data (più recente prima)
function getBackupList() {
  if (!fs.existsSync(backupDir)) {
    return [];
  }
  
  return fs.readdirSync(backupDir)
    .filter(file => file.endsWith('.tar.gz') && file.startsWith('BACKUP_'))
    .map(file => {
      const filePath = path.join(backupDir, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        path: filePath,
        size: stats.size,
        created: stats.birthtime
      };
    })
    .sort((a, b) => b.created - a.created);
}

// Formatta dimensione file
function formatFileSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

// Rotazione backup (mantieni solo gli ultimi 3)
function rotateBackups() {
  const backups = getBackupList();
  
  if (backups.length > 3) {
    const toDelete = backups.slice(3);
    
    toDelete.forEach(backup => {
      try {
        fs.unlinkSync(backup.path);
        log(`Backup obsoleto eliminato: ${backup.name}`, 'WARN');
      } catch (error) {
        log(`Errore eliminazione backup ${backup.name}: ${error.message}`, 'ERROR');
      }
    });
  }
}

// Crea backup
function createBackup() {
  try {
    log('🚀 Avvio creazione backup...');
    ensureBackupDir();
    
    const backupName = generateBackupName();
    const tempFile = path.join(backupDir, `temp_${Date.now()}.tar.gz`);
    const finalFile = path.join(backupDir, backupName);
    
    // Costruisci comando tar con esclusioni
    const excludeArgs = excludePatterns.map(pattern => `--exclude='${pattern}'`).join(' ');
    const includeArgs = filesToBackup.join(' ');
    
    log(`Compressione file in corso...`);
    
    // Crea archivio temporaneo
    const tarCommand = `cd "${projectRoot}" && tar -czf "${tempFile}" ${excludeArgs} ${includeArgs}`;
    execSync(tarCommand, { stdio: 'pipe' });
    
    // Verifica integrità archivio
    log('Verifica integrità archivio...');
    execSync(`tar -tzf "${tempFile}" > /dev/null`, { stdio: 'pipe' });
    
    // Sposta file temporaneo alla destinazione finale (operazione atomica)
    fs.renameSync(tempFile, finalFile);
    
    const stats = fs.statSync(finalFile);
    const fileSize = formatFileSize(stats.size);
    
    log(`Backup creato con successo: ${backupName}`, 'SUCCESS');
    log(`Dimensione: ${fileSize}`);
    
    // Rotazione backup
    rotateBackups();
    
    return backupName;
    
  } catch (error) {
    log(`Errore durante creazione backup: ${error.message}`, 'ERROR');
    
    // Cleanup file temporaneo in caso di errore
    const tempFiles = fs.readdirSync(backupDir).filter(f => f.startsWith('temp_'));
    tempFiles.forEach(tempFile => {
      try {
        fs.unlinkSync(path.join(backupDir, tempFile));
      } catch (e) {
        // Ignora errori di cleanup
      }
    });
    
    process.exit(1);
  }
}

// Lista backup disponibili
function listBackups() {
  const backups = getBackupList();
  
  if (backups.length === 0) {
    log('Nessun backup trovato.', 'WARN');
    return;
  }
  
  console.log('\n📦 BACKUP DISPONIBILI:\n');
  console.log('Nome'.padEnd(30) + 'Dimensione'.padEnd(12) + 'Data Creazione');
  console.log('-'.repeat(60));
  
  backups.forEach(backup => {
    const size = formatFileSize(backup.size);
    const date = backup.created.toLocaleString('it-IT', {
      timeZone: 'Europe/Rome',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    console.log(backup.name.padEnd(30) + size.padEnd(12) + date);
  });
  
  console.log('');
}

// Anteprima ripristino
function previewRestore(backupName) {
  const backupPath = path.join(backupDir, backupName);
  
  if (!fs.existsSync(backupPath)) {
    log(`Backup non trovato: ${backupName}`, 'ERROR');
    process.exit(1);
  }
  
  try {
    log(`📋 ANTEPRIMA RIPRISTINO: ${backupName}`);
    
    // Lista contenuto archivio
    const content = execSync(`tar -tzf "${backupPath}"`, { encoding: 'utf8' });
    const files = content.trim().split('\n').slice(0, 20); // Mostra primi 20 file
    
    console.log('\n🗂️  CONTENUTO BACKUP (primi 20 file):');
    console.log('-'.repeat(50));
    files.forEach(file => console.log(`  ${file}`));
    
    if (content.split('\n').length > 20) {
      console.log(`  ... e altri ${content.split('\n').length - 20} file`);
    }
    
    const stats = fs.statSync(backupPath);
    console.log(`\n📊 Dimensione: ${formatFileSize(stats.size)}`);
    console.log(`📅 Creato: ${stats.birthtime.toLocaleString('it-IT', { timeZone: 'Europe/Rome' })}`);
    
    console.log('\n⚠️  ATTENZIONE: Il ripristino sovrascriverà i file esistenti!');
    console.log('\n🔧 Per confermare il ripristino, esegui:');
    console.log(`   node scripts/backup-system.js restore-confirm ${backupName}`);
    
  } catch (error) {
    log(`Errore lettura backup: ${error.message}`, 'ERROR');
    process.exit(1);
  }
}

// Conferma ripristino
function confirmRestore(backupName) {
  const backupPath = path.join(backupDir, backupName);
  
  if (!fs.existsSync(backupPath)) {
    log(`Backup non trovato: ${backupName}`, 'ERROR');
    process.exit(1);
  }
  
  try {
    log(`🔄 Avvio ripristino da: ${backupName}`);
    
    // Estrai archivio
    execSync(`cd "${projectRoot}" && tar -xzf "${backupPath}"`, { stdio: 'inherit' });
    
    log(`Ripristino completato con successo!`, 'SUCCESS');
    log(`⚠️  Ricorda di eseguire 'npm install' se necessario.`);
    
  } catch (error) {
    log(`Errore durante ripristino: ${error.message}`, 'ERROR');
    process.exit(1);
  }
}

// Main
function main() {
  const command = process.argv[2];
  const backupName = process.argv[3];
  
  switch (command) {
    case 'create':
      createBackup();
      break;
      
    case 'list':
      listBackups();
      break;
      
    case 'restore':
      if (!backupName) {
        log('Specificare il nome del backup da ripristinare', 'ERROR');
        process.exit(1);
      }
      previewRestore(backupName);
      break;
      
    case 'restore-confirm':
      if (!backupName) {
        log('Specificare il nome del backup da ripristinare', 'ERROR');
        process.exit(1);
      }
      confirmRestore(backupName);
      break;
      
    default:
      console.log(`
🔧 SISTEMA BACKUP DIAGONALE

Utilizzo:
  node scripts/backup-system.js <comando> [opzioni]

Comandi:
  create                    Crea nuovo backup
  list                      Lista backup disponibili
  restore <nome>            Anteprima ripristino
  restore-confirm <nome>    Conferma ripristino

Comandi NPM:
  npm run backup           Crea backup
  npm run backup:list      Lista backup
  npm run backup:restore   Anteprima ripristino

Esempi:
  npm run backup
  npm run backup:list
  npm run backup:restore BACKUP_16092025_1420.tar.gz
      `);
      break;
  }
}

main();
