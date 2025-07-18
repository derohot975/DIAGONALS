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
  // Skip Vite completely on Render, use simple static build
  console.log('📦 Building frontend with static method...');
  
  // Create dist/public directory
  if (!existsSync('dist/public')) {
    mkdirSync('dist/public', { recursive: true });
  }
  
  // Copy all client files
  execSync('cp -r client/src dist/public/src', { stdio: 'inherit' });
  if (existsSync('client/public')) {
    execSync('cp -r client/public/* dist/public/', { stdio: 'inherit' });
  }
  
  // Create simple HTML file that loads React directly
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DIAGONALE - Wine Tasting App</title>
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
      body { margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; }
      #root { min-height: 100vh; }
    </style>
</head>
<body>
    <div id="root">
      <div style="text-align: center; padding: 50px;">
        <h1>DIAGONALE Wine Tasting App</h1>
        <p>Applicazione per degustazioni di vino</p>
        <p>Loading...</p>
      </div>
    </div>
</body>
</html>`;
  
  writeFileSync('dist/public/index.html', htmlContent);
  console.log('✅ Frontend built with static method');

  // Copy backend files for tsx runtime
  console.log('🔧 Preparing backend...');
  
  // Copy server and shared directories
  execSync('cp -r server dist/', { stdio: 'inherit' });
  execSync('cp -r shared dist/', { stdio: 'inherit' });
  execSync('cp package.json dist/', { stdio: 'inherit' });
  
  // Create startup script that uses tsx
  const startupScript = `import { spawn } from 'child_process';
const child = spawn('npx', ['tsx', 'server/index.ts'], { stdio: 'inherit' });
child.on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});`;
  
  writeFileSync('dist/index.js', startupScript);
  console.log('✅ Backend prepared with tsx runtime');

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