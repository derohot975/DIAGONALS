#!/usr/bin/env node

// Simplified build script for Render - uses standard Vite build
import { execSync } from 'child_process';
import { copyFileSync, mkdirSync, existsSync } from 'fs';

console.log('🚀 Starting Render build process...');

try {
  // Create directories
  if (!existsSync('dist')) {
    mkdirSync('dist', { recursive: true });
  }

  // Frontend build with Vite (standard)
  console.log('📦 Building frontend with Vite...');
  execSync('npx vite build', { stdio: 'inherit' });
  console.log('✅ Frontend built successfully');

  // Backend build with esbuild  
  console.log('🔧 Building backend...');
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js', { stdio: 'inherit' });
  console.log('✅ Backend built successfully');

  // Copy assets
  console.log('📋 Copying assets...');
  if (existsSync('client/public/diagologo.png')) {
    copyFileSync('client/public/diagologo.png', 'dist/public/diagologo.png');
    console.log('✅ Logo copied');
  }

  console.log('✅ Build completed successfully!');

} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}