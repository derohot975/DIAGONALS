
# 🛠️ Scripts & Utilità

## 📂 Scripts Disponibili (`/scripts`)

### `generate-icons.js`
**Scopo**: Generazione automatica icone PWA in multiple risoluzioni

```javascript
// Genera icone da file sorgente per PWA
// Formati: 96x96, 144x144, 192x192, 512x512
// Output: /public/ e /client/public/
```

**Utilizzo**:
```bash
node scripts/generate-icons.js
```

**Quando usare**: 
- Dopo aver aggiornato il logo principale
- Prima del deploy per assicurare icone aggiornate

### `update-pwa-icons.js`
**Scopo**: Aggiornamento specifico icone PWA con timestamp

```javascript
// Aggiorna icone PWA con versioning automatico
// Previene cache browser per nuove icone
```

**Utilizzo**:
```bash
node scripts/update-pwa-icons.js
```

### `post-build.js`
**Scopo**: Operazioni post-build per ottimizzazione

```javascript
// Cleanup file temporanei
// Ottimizzazione asset statici
// Verifica integrità build
```

**Utilizzo**: Automatico durante `npm run build`

## 📊 Script CLI Personalizzati

### Database Query Tool
```bash
# Crea script per consultazione rapida database
cat > scripts/db-query.js << 'EOF'
const { db } = require('../server/db');

async function queryDB(table, limit = 10) {
  const result = await db.select().from(table).limit(limit);
  console.table(result);
}

// Esempi uso:
// node scripts/db-query.js users
// node scripts/db-query.js events
EOF
```

### Project Stats Monitor
```bash
# Monitora dimensioni file e metriche progetto
cat > scripts/project-stats.js << 'EOF'
const fs = require('fs');
const path = require('path');

function getDirectorySize(dirPath) {
  let totalSize = 0;
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      totalSize += getDirectorySize(filePath);
    } else {
      totalSize += stats.size;
    }
  });
  
  return totalSize;
}

console.log('📊 Project Statistics:');
console.log(`Client Size: ${(getDirectorySize('./client')/1024/1024).toFixed(2)} MB`);
console.log(`Server Size: ${(getDirectorySize('./server')/1024/1024).toFixed(2)} MB`);
console.log(`Total Components: ${fs.readdirSync('./client/src/components').length}`);
EOF
```

### Config Inspector
```bash
# Ispeziona configurazioni progetto
cat > scripts/config-inspector.js << 'EOF'
const packageJson = require('../package.json');
const replit = fs.readFileSync('.replit', 'utf8');

console.log('🔧 Project Configuration:');
console.log(`Name: ${packageJson.name}`);
console.log(`Version: ${packageJson.version}`);
console.log(`Dependencies: ${Object.keys(packageJson.dependencies).length}`);
console.log(`Scripts: ${Object.keys(packageJson.scripts).join(', ')}`);
console.log('\n📋 Replit Config:');
console.log(replit);
EOF
```

## 🎯 Template Generators

### Component Generator
```bash
# Genera template componente screen
cat > scripts/generate-screen.js << 'EOF'
const fs = require('fs');

function generateScreen(name) {
  const template = `import { Button } from '@/components/ui/button';

interface ${name}Props {
  onGoBack: () => void;
  onGoHome: () => void;
}

export default function ${name}({ onGoBack, onGoHome }: ${name}Props) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-red-100 flex flex-col">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-red-800">${name}</h1>
      </div>
      
      <div className="flex-1 p-4">
        {/* Content here */}
      </div>
      
      <div className="p-4 flex justify-between">
        <Button onClick={onGoBack} variant="outline" className="rounded-full">
          ← Indietro
        </Button>
        <Button onClick={onGoHome} className="rounded-full bg-blue-600">
          🏠 Home
        </Button>
      </div>
    </div>
  );
}`;

  fs.writeFileSync(`./client/src/components/screens/${name}.tsx`, template);
  console.log(`✅ Generated ${name}.tsx`);
}

// Usage: node scripts/generate-screen.js NewScreenName
const screenName = process.argv[2];
if (screenName) generateScreen(screenName);
EOF
```

### Hook Generator
```bash
# Genera template custom hook
cat > scripts/generate-hook.js << 'EOF'
const fs = require('fs');

function generateHook(name) {
  const hookName = name.startsWith('use') ? name : `use${name}`;
  
  const template = `import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function ${hookName}() {
  const [state, setState] = useState(null);
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      // Implementation here
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${name.toLowerCase()}'] });
    }
  });
  
  const handleAction = useCallback(() => {
    // Handler logic here
  }, []);
  
  return {
    state,
    handleAction,
    isLoading: mutation.isPending
  };
}`;

  fs.writeFileSync(`./client/src/hooks/${hookName}.ts`, template);
  console.log(`✅ Generated ${hookName}.ts`);
}

// Usage: node scripts/generate-hook.js HookName
const hookName = process.argv[2];
if (hookName) generateHook(hookName);
EOF
```

## 📋 Comandi Rapidi

### Development
```bash
# Avvio sviluppo
npm run dev

# Build produzione
npm run build

# Controllo tipi TypeScript
npm run check

# Push schema database
npm run db:push
```

### Utilities
```bash
# Genera icone PWA
node scripts/generate-icons.js

# Aggiorna icone con timestamp
node scripts/update-pwa-icons.js

# Statistiche progetto
node scripts/project-stats.js

# Ispeziona configurazioni
node scripts/config-inspector.js
```

### Template Creation
```bash
# Nuovo screen component
node scripts/generate-screen.js NewScreenName

# Nuovo custom hook
node scripts/generate-hook.js NewHookName

# Nuovo modal component
node scripts/generate-modal.js NewModalName
```

## 🔍 Monitoraggio Performance

### Bundle Size Analyzer
```bash
# Aggiungi a package.json scripts:
"analyze": "npx vite-bundle-analyzer dist"

# Uso:
npm run build && npm run analyze
```

### Memory Usage Monitor
```bash
# Monitoraggio runtime durante sviluppo
cat > scripts/memory-monitor.js << 'EOF'
setInterval(() => {
  const usage = process.memoryUsage();
  console.log(`Memory: ${Math.round(usage.heapUsed / 1024 / 1024)} MB`);
}, 5000);
EOF
```

## 🎨 Asset Management

### Image Optimization
```bash
# Ottimizza immagini nella cartella public
cat > scripts/optimize-images.js << 'EOF'
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

function optimizeImages(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    if (file.match(/\.(jpg|jpeg|png)$/i)) {
      const inputPath = path.join(dir, file);
      const outputPath = path.join(dir, `optimized-${file}`);
      
      sharp(inputPath)
        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toFile(outputPath);
    }
  });
}

optimizeImages('./public');
EOF
```

### PWA Asset Validator
```bash
# Verifica completezza asset PWA
cat > scripts/validate-pwa.js << 'EOF'
const fs = require('fs');

const requiredAssets = [
  'manifest.json',
  'icon-96x96.png',
  'icon-144x144.png', 
  'icon-192x192.png',
  'icon-512x512.png',
  'apple-touch-icon.png'
];

console.log('🔍 PWA Asset Validation:');
requiredAssets.forEach(asset => {
  const exists = fs.existsSync(`./public/${asset}`);
  console.log(`${exists ? '✅' : '❌'} ${asset}`);
});
EOF
```
