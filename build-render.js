#!/usr/bin/env node

// Build script for Render deployment
// Uses esbuild for both frontend and backend

import { build } from 'esbuild';
import { execSync } from 'child_process';
import { copyFileSync, mkdirSync, existsSync, writeFileSync } from 'fs';
import { resolve } from 'path';

console.log('🚀 Starting Render build process...');

// Create dist directory
if (!existsSync('dist')) {
  mkdirSync('dist', { recursive: true });
}

// Create dist/public directory
if (!existsSync('dist/public')) {
  mkdirSync('dist/public', { recursive: true });
}

try {
  // Build frontend with esbuild
  console.log('📦 Building frontend...');
  await build({
    entryPoints: ['client/src/main.tsx'],
    bundle: true,
    minify: true,
    outdir: 'dist/public',
    format: 'esm',
    platform: 'browser',
    target: ['es2020'],
    loader: {
      '.png': 'file',
      '.jpg': 'file',
      '.jpeg': 'file',
      '.svg': 'file',
      '.gif': 'file',
    },
    define: {
      'process.env.NODE_ENV': '"production"',
    },
    splitting: true,
    chunkNames: 'chunks/[name]-[hash]',
    assetNames: 'assets/[name]-[hash]',
  });

  // Create simple HTML file
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DIAGONALE - Wine Tasting App</title>
    <link rel="stylesheet" href="/main.css">
</head>
<body>
    <div id="root"></div>
    <script type="module" src="/main.js"></script>
</body>
</html>`;

  // Write HTML file
  writeFileSync('dist/public/index.html', htmlContent);

  // Build backend
  console.log('🔧 Building backend...');
  await build({
    entryPoints: ['server/index.ts'],
    bundle: true,
    minify: true,
    outfile: 'dist/index.js',
    format: 'esm',
    platform: 'node',
    target: ['node18'],
    packages: 'external',
    banner: {
      js: `
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
      `,
    },
  });

  // Copy static assets
  console.log('📋 Copying assets...');
  try {
    copyFileSync('client/public/diagologo.png', 'dist/public/diagologo.png');
    console.log('✅ Assets copied');
  } catch (error) {
    console.log('⚠️ No assets to copy');
  }

  console.log('✅ Build completed successfully!');

} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}