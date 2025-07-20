#!/usr/bin/env node

// RENDER BUILD SCRIPT - GENERATES FILES IN ROOT FOR SIMPLE START
import { execSync } from 'child_process';
import { mkdirSync, writeFileSync, copyFileSync, existsSync } from 'fs';

console.log('🚀 Starting Render build...');

try {
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  console.log('🎨 Building frontend...');
  execSync('cd client && npm install', { stdio: 'inherit' });
  execSync('cd client && npx vite build --outDir ../public', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
  
  console.log('⚡ Building backend...');
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=server-prod.js', { 
    stdio: 'inherit' 
  });
  
  console.log('✅ Build completed successfully!');
  console.log('📁 Frontend files: ./public/');
  console.log('🚀 Backend file: ./server-prod.js');
  console.log('▶️ Start with: NODE_ENV=production node server-prod.js');

  console.log('🎉 Build completed - files in root directory!');

} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}