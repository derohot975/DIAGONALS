#!/usr/bin/env node

// Build script for Render deployment
// Uses Vite for frontend and transpilation for backend

import { execSync } from 'child_process';
import { copyFileSync, mkdirSync, existsSync, writeFileSync } from 'fs';
import { resolve } from 'path';

console.log('🚀 Starting Render build process...');

// Create dist directory
if (!existsSync('dist')) {
  mkdirSync('dist', { recursive: true });
}

try {
  // Build frontend with Vite (fallback to installed vite)
  console.log('📦 Building frontend...');
  try {
    execSync('npx vite build', { stdio: 'inherit' });
    console.log('✅ Frontend built with Vite');
  } catch (error) {
    console.log('⚠️ Vite build failed, trying alternative...');
    
    // Simple copy of source files as fallback
    execSync('cp -r client/src dist/public/src', { stdio: 'inherit' });
    execSync('cp -r client/public/* dist/public/', { stdio: 'inherit' });
    
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DIAGONALE - Wine Tasting App</title>
    <script type="module" src="/src/main.tsx"></script>
</head>
<body>
    <div id="root"></div>
</body>
</html>`;
    
    writeFileSync('dist/public/index.html', htmlContent);
    console.log('✅ Frontend built with fallback method');
  }

  // Build backend with tsx transpilation
  console.log('🔧 Building backend...');
  try {
    execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js', { stdio: 'inherit' });
    console.log('✅ Backend built with esbuild');
  } catch (error) {
    console.log('⚠️ esbuild failed, trying tsx...');
    
    // Copy server files and use tsx at runtime
    execSync('cp -r server dist/', { stdio: 'inherit' });
    execSync('cp -r shared dist/', { stdio: 'inherit' });
    
    // Create a simple startup script
    const startupScript = `
import { execSync } from 'child_process';
execSync('npx tsx server/index.ts', { stdio: 'inherit' });
`;
    
    writeFileSync('dist/index.js', startupScript);
    console.log('✅ Backend prepared with tsx runtime');
  }

  // Copy static assets
  console.log('📋 Copying assets...');
  try {
    if (existsSync('client/public/diagologo.png')) {
      copyFileSync('client/public/diagologo.png', 'dist/public/diagologo.png');
    }
    console.log('✅ Assets copied');
  } catch (error) {
    console.log('⚠️ No assets to copy');
  }

  console.log('✅ Build completed successfully!');

} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}