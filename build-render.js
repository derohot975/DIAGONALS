#!/usr/bin/env node

// RENDER PRODUCTION BUILD - SIMPLIFIED VERSION
import { execSync } from 'child_process';
import { mkdirSync, writeFileSync, copyFileSync, existsSync } from 'fs';

console.log('🚀 Starting Render production build...');

try {
  // Install dependencies first (crucial for Render)
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  // Create output directories
  mkdirSync('dist', { recursive: true });
  mkdirSync('dist/public', { recursive: true });

  console.log('🎨 Building frontend...');
  
  // Install client dependencies specifically
  execSync('cd client && npm install', { stdio: 'inherit' });
  
  // Build frontend from client directory
  execSync('cd client && npx vite build --outDir ../dist/public', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
  
  console.log('✅ Frontend built successfully');

  console.log('⚡ Building backend...');
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js', { 
    stdio: 'inherit' 
  });
  
  console.log('✅ Backend built successfully');

  // Create production package.json
  const prodPackage = {
    "name": "diagonale-production",
    "version": "1.0.0",
    "type": "module",
    "main": "index.js",
    "scripts": {
      "start": "node index.js"
    },
    "dependencies": {
      "express": "^4.18.2",
      "@neondatabase/serverless": "^0.9.0",
      "drizzle-orm": "^0.33.0"
    }
  };
  
  writeFileSync('dist/package.json', JSON.stringify(prodPackage, null, 2));

  console.log('🎉 Build completed successfully for Render!');

} catch (error) {
  console.error('❌ Build failed:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
}