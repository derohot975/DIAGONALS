#!/usr/bin/env node

// Universal build script - works for Render, Netlify, Vercel
import { execSync } from 'child_process';
import { copyFileSync, mkdirSync, existsSync, writeFileSync } from 'fs';

console.log('🚀 Starting production build...');

try {
  // Create directories
  mkdirSync('dist', { recursive: true });
  mkdirSync('dist/public', { recursive: true });

  console.log('📦 Building frontend...');
  
  // Set production environment
  process.env.NODE_ENV = 'production';
  
  // Build frontend with working directory and config
  execSync('npx vite build --config client/vite.config.ts', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
  
  console.log('✅ Frontend built');

  console.log('🔧 Building backend...');
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js --define:process.env.NODE_ENV="production"', { 
    stdio: 'inherit' 
  });
  
  console.log('✅ Backend built');

  // Create simple package.json for production
  const prodPackage = {
    "name": "diagonale-production",
    "version": "1.0.0",
    "type": "module",
    "scripts": {
      "start": "node index.js"
    }
  };
  
  writeFileSync('dist/package.json', JSON.stringify(prodPackage, null, 2));

  console.log('✅ Build completed successfully!');

} catch (error) {
  console.error('❌ Build failed:', error);
  console.error('Error details:', error.message);
  process.exit(1);
}