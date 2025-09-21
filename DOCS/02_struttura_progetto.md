
# 🏗️ Struttura Progetto

**Ultimo aggiornamento:** 21 Settembre 2025  
**Versione:** v1.0.0 - Post Ottimizzazione

## 📁 Mappa Directory

```
DIAGONALE/
├── client/                     # Frontend React App
│   ├── public/                # File statici e PWA assets
│   │   ├── manifest.json      # PWA manifest
│   │   ├── diagologo.png      # Logo principale
│   │   └── icon-*.png         # Icone PWA multiple formati
│   ├── src/
│   │   ├── components/        # Componenti React organizzati
│   │   │   ├── screens/       # Schermate principali app
│   │   │   ├── modals/        # Finestre modali
│   │   │   ├── ui/            # Componenti UI base (vuota - cleanup completato)
│   │   │   └── optimized/     # Componenti ottimizzati performance
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utilities e configurazioni
│   │   ├── assets/            # Immagini e risorse statiche (cleanup completato)
│   │   ├── App.tsx            # Componente root applicazione
│   │   ├── main.tsx           # Entry point React
│   │   └── index.css          # Stili globali e variabili CSS
│   └── index.html             # Template HTML base
├── server/                     # Backend Express API
│   ├── db.ts                  # Configurazione database PostgreSQL
│   ├── index.ts               # Entry point server Express
│   ├── routes.ts              # Definizione route API RESTful
│   ├── storage.ts             # Layer storage e query database
│   ├── init-db.ts             # Inizializzazione e setup database
│   └── vite.ts                # Configurazione Vite per sviluppo
├── shared/                     # Codice condiviso tra client/server
│   └── schema.ts              # Schemi Drizzle ORM e validazioni Zod
├── scripts/                    # Utility e automazione
│   ├── generate-icons.js      # Generazione icone PWA
│   ├── post-build.js          # Script post-build
│   └── update-pwa-icons.js    # Aggiornamento icone PWA
├── DOCS/                       # Documentazione progetto
├── public/                     # File statici production build
└── attached_assets/            # Assets temporanei e screenshot
```

## 🎯 Responsabilità Componenti

### Frontend (`/client`)

#### Screens (`/components/screens`)
- **AuthScreen.tsx**: Autenticazione PIN e registrazione
- **EventListScreen.tsx**: Lista eventi con stato e azioni
- **EventDetailsScreen.tsx**: Dettagli evento e registrazione vini
- **SimpleVotingScreen.tsx**: Interfaccia votazione vini
- **EventResultsScreen.tsx**: Risultati finali e classifiche
- **AdminScreen.tsx**: Gestione utenti e configurazioni
- **AdminEventManagementScreen.tsx**: Controllo eventi per admin
- **HistoricEventsScreen.tsx**: Storico eventi completati
- **PagellaScreen.tsx**: Report dettagliato per evento
- **SplashScreen.tsx**: Schermata iniziale con logo

#### Modals (`/components/modals`)
- **AddUserModal.tsx**: Creazione nuovo utente
- **CreateEventModal.tsx**: Creazione nuovo evento
- **WineRegistrationModal.tsx**: Registrazione/modifica vino
- **EventReportModal.tsx**: Visualizzazione report finale
- **EditUserModal.tsx**: Modifica dati utente
- **EditEventModal.tsx**: Modifica evento esistente
- **ChangeAdminPinModal.tsx**: Cambio PIN amministratore

#### Hooks (`/hooks`)
- **useAuth.ts**: Gestione autenticazione e sessioni
- **useMutations.ts**: Mutazioni React Query per CRUD
- **useQueries.ts**: Query React Query per fetch dati
- **useEventLogic.ts**: Logica business eventi
- **useLocalStorage.ts**: Persistenza locale browser

### Backend (`/server`)

#### File Core
- **index.ts**: Setup Express, middleware, error handling
- **routes.ts**: Endpoint API RESTful completi
- **storage.ts**: Repository layer con Drizzle ORM
- **db.ts**: Connessione PostgreSQL configurata
- **init-db.ts**: Migrazione automatica tabelle

### Shared (`/shared`)
- **schema.ts**: Definizioni tabelle Drizzle + validazioni Zod

## 🏷️ Convenzioni Naming

### File e Directory
- **PascalCase**: Componenti React (`EventListScreen.tsx`)
- **camelCase**: Utility e hook (`useAuth.ts`, `queryClient.ts`)
- **kebab-case**: Directory e asset (`wine-glass.svg`)
- **UPPERCASE**: Costanti e config (`DATABASE_URL`)

### Variabili e Funzioni
```typescript
// React Components
const EventListScreen = () => {}

// Hooks
const useEventLogic = () => {}

// API Functions
const createWineEvent = async () => {}

// Database Models
const insertUserSchema = z.object({})

// Constants
const WINE_TYPES = ['Bianco', 'Rosso', 'Bollicina']
```

### Database
- **snake_case**: Nomi tabelle e colonne (`wine_events`, `created_at`)
- **camelCase**: Oggetti TypeScript derivati (`wineEvents`, `createdAt`)

## 📋 Guidelines Componenti

### Nuovi Screen Components
```typescript
// Template base per screen
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface ScreenNameProps {
  onGoBack: () => void;
  onGoHome: () => void;
  // Altri props specifici
}

export default function ScreenName({ onGoBack, onGoHome }: ScreenNameProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-red-100 flex flex-col">
      {/* Header con navigazione */}
      <div className="p-4">
        <h1 className="text-2xl font-bold text-red-800">Titolo Screen</h1>
      </div>
      
      {/* Content area */}
      <div className="flex-1 p-4">
        {/* Contenuto specifico */}
      </div>
      
      {/* Footer con pulsanti navigazione */}
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
}
```

### Nuovi Modal Components
```typescript
// Template base per modal
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ModalNameProps {
  isOpen: boolean;
  onClose: () => void;
  // Altri props specifici
}

export default function ModalName({ isOpen, onClose }: ModalNameProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-effect border-red-200">
        <DialogHeader>
          <DialogTitle>Titolo Modal</DialogTitle>
        </DialogHeader>
        
        {/* Form o contenuto */}
        <div className="space-y-4">
          {/* Contenuto specifico */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### Nuovi Custom Hooks
```typescript
// Template base per hook
import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useHookName() {
  const [state, setState] = useState(initialValue);
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: async (data) => {
      // Logica mutazione
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relevant-key'] });
    }
  });
  
  const handleAction = useCallback(() => {
    // Logica handler
  }, []);
  
  return {
    state,
    handleAction,
    isLoading: mutation.isPending
  };
}
```

## 🎨 Pattern UI Consistenti

### Glass Morphism
```css
.glass-effect {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

### Color Palette
- **Primary**: Red/Bordeaux theme (`red-800`, `red-600`)
- **Secondary**: Blue accents (`blue-600`)
- **Background**: Gradient red (`from-red-50 to-red-100`)
- **Glass**: Transparente con blur effect

### Mobile-First Design
- Tutti i componenti ottimizzati per smartphone
- Pulsanti circolari per navigazione
- Spacing consistente (`p-4`, `space-y-4`)
- Typography responsive (`text-2xl`, `text-lg`)
