# DIAGONALE Wine Tasting App

## Overview

DIAGONALE is a mobile-only web application for blind wine tasting events, optimized exclusively for smartphones. The app supports two tasting modes: "CIECA" (blind) and "CIECONA" (blind with enhanced features). Users can create tasting events, register wines, vote on wines, and view comprehensive results. The application follows a modern full-stack architecture with React frontend and Express backend.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (July 27, 2025 - Updated 12:46)

### Database & Core System
- **Supabase Migration Completed**: Successfully migrated from in-memory to Supabase PostgreSQL 
- **Data Persistence**: All data now persists across code changes and deployments
- **Database Schema**: Full schema deployed with users, events, wines, votes tables
- **Connection Verified**: PostgreSQL 17.4 on EU Central region for optimal performance
- **Data Transfer**: 2 users and 1 event successfully migrated to Supabase
- **DatabaseStorage**: Complete implementation replacing MemStorage with Supabase queries
- **Auto-initialization**: Database creates Admin user automatically on first run
- **Scalable Architecture**: Production-ready with connection pooling and shared data access
- **Render Integration**: Environment variables configured with npx build commands

### Session Management & Security
- **Single Device Access**: Implemented session control to prevent simultaneous access from multiple devices
- **Session Tracking**: Added sessionId and lastActivity fields to user table
- **Force Logout**: Users already logged in from another device are blocked with clear error message
- **Session Heartbeat**: Automatic session validation every minute to maintain active sessions
- **Auto-Expiry**: Sessions expire after 5 minutes of inactivity to prevent resource locks
- **Security Enhancement**: Prevents accidental double access and voting conflicts

### UI/UX Improvements
- **Event Layout Optimization**: Completely redesigned event cards for better visual hierarchy
- **Centered Content**: All event information properly centered in container
- **Event Display**: Name (first row), Date (second row), Mode description (third row), Status centered
- **Dual Action Buttons**: Separated into "REGISTRA IL TUO VINO" and "PARTECIPA ALLA DIAGONALE"
- **Enhanced Styling**: Magical gradient effects on participation button with smooth transitions
- **Navigation Standardization**: All back arrow and home buttons use consistent circular blue style
- **Fixed Bottom Positioning**: All navigation buttons positioned at bottom of pages for better UX
- **Clean Interface**: Removed redundant elements like home button from event pages
- **Splash Screen Enhancement**: Logo glow animation with subtle pulsing effect (26 Luglio 2025)
- **Report Optimization**: Removed participant rankings and summary stats, showing only wine rankings (26 Luglio 2025)
- **Historic Events Styling**: "STORICO EVENTI" centered in white, bordeaux background boxes with clean layout
- **Event Deletion Enhancement (27 Luglio 2025)**: Aggiunto pulsante ELIMINA (cestino) negli eventi completati con eliminazione cascata completa di tutti i dati collegati (vini, voti, report)
- **Database Connection Fix (27 Luglio 2025 - 12:05)**: Risolto problema connessione database passando da Neon WebSocket a driver PostgreSQL standard 
- **Alcohol Field Validation Fix (27 Luglio 2025 - 12:46)**: Risolto errore validazione campo gradazione alcolica accettando sia numeri che stringhe
- **User Name Removal (27 Luglio 2025 - 15:02)**: Rimossa visualizzazione nome utente dalla schermata eventi per interfaccia più pulita
- **Button Centering (27 Luglio 2025 - 15:04)**: Centrato pulsante "Modifica il tuo vino" e aggiornata icona a 🔧
- **Button Color Update (27 Luglio 2025 - 15:05)**: Aggiornato colore pulsante "Modifica il tuo vino" a bordeaux scuro per coerenza tema
- **Date Format Fix (27 Luglio 2025 - 15:08)**: Assicurata iniziale maiuscola per i nomi dei mesi nelle date (es. "4 Agosto 2025")

### Home Page Optimization (18 Luglio 2025 - 14:55)
- **Icona Admin**: Cambiata da Settings a Shield (scudo) senza container
- **Dimensioni Ridotte**: Logo e pulsanti utenti ridotti del 25-30%
- **Ombreggiature**: Aggiunte drop-shadow-lg al logo e shadow-lg ai pulsanti
- **Layout Fisso**: Logo fisso in alto, pulsanti admin fissi in basso
- **Scroll Verticale**: Solo lista utenti fa scroll, header/footer statici
- **Pulsanti Compatti**: Rimossa icona Users, nome centrato, larghezza 50%
- **Spazio Ottimizzato**: Margini ridotti da 24px a 8px per massimizzare area utenti
- **Ordinamento Alfabetico**: Lista utenti sempre ordinata alfabeticamente

### Wine Registration System
- **Complete Modal**: All 7 fields (type, name, producer, grape, year, origin, price)
- **Auto-formatting**: Wine name automatically converts to uppercase
- **Smart Capitalization**: Producer, grape, and origin fields auto-capitalize first letters
- **Direct Flow**: "REGISTRA IL TUO VINO" button opens wine registration modal directly
- **Enhanced Button**: Changed from "Registra" to "Registrati" for better UX

### User Management
- **Full CRUD Operations**: Complete user management in admin panel
- **No Admin User**: Removed admin user concept - all users are participants
- **Open Admin Access**: Everyone can access admin page via home button
- **User Flow**: Simplified navigation from home to events via user selection
- **All Participants**: All users are regular participants with equal access
- **Simplified Architecture**: No role-based restrictions or admin-only features

### Event Management  
- **Vista Separata Admin/Utenti**: Implementata AdminEventManagementScreen per gestione vs EventListScreen per partecipazione
- **Modalità Unica**: Rimossa selezione CIECA/CIECONA, ora solo modalità DIAGONALE unica
- **Active/Historic Separation**: Events clearly separated between active and completed
- **Event Status**: Visual indicators for active events with animated pulse effect
- **Layout Optimization**: Almost full-page design for single event display
- **Partecipanti Solo Utenti**: Tutti i partecipanti sono sempre utenti normali, mai admin
- **Aggiornamento Eventi**: Database constraint rimosso, modifica eventi funzionante
- **Creazione Eventi**: Sistema riparato, funziona con messaggio di conferma migliorato
- **Flusso Registrazione-Votazione**: Implementato con logica pulsanti condizionali esclusivi
- **Messaggio Successo**: Aggiunto "REGISTRATO CON SUCCESSO!" con stelline animate gialle
- **Layout Eventi**: Rimosso "Degustazione alla Cieca" e status "ATTIVO" per design più pulito
- **Conteggio Partecipanti**: Numero dinamico basato su utenti che hanno registrato vini per evento specifico
- **VotingScreen Separata**: Pagina votazione dedicata per utenti, separata da sezione admin

### Technical Improvements
- **Component Architecture**: Modular React components with proper prop passing
- **State Management**: Clean separation of concerns between UI and data operations
- **Error Handling**: Robust error handling and user feedback
- **Type Safety**: Full TypeScript implementation with proper interfaces
- **Code Optimization**: Eliminated duplicate types, removed unused UI components
- **Performance**: Optimized imports and cleaned localStorage error handling
- **Maintainability**: Centralized type definitions in shared schema
- **Cache Resolution**: Fixed React Query cache issues preventing new events from displaying
- **LSP Compliance**: Resolved all TypeScript errors with proper type casting and v5 syntax
- **Performance Optimization (26 Luglio 2025 - 23:45)**: Removed 25+ console.log statements, optimized React Query cache with staleTime, removed unused heavy UI components (sidebar.tsx 771 lines, chart.tsx 365 lines), improved query performance with proper cache invalidation

## 🔄 PUNTO DI RIPRISTINO (25 Luglio 2025 - 15:35)

### Stato Attuale del Sistema
**Database**: PostgreSQL funzionante con schema completo
**Backend**: Express.js su porta 5000 con API RESTful
**Frontend**: React con Vite in modalità sviluppo
**Utenti**: Sistema semplificato - DERO convertito a utente normale, solo Admin rimane amministratore
**Eventi**: Gestione centralizzata nella pagina admin (futuro: codice accesso)
**Votazioni**: Sistema simultaneo ottimizzato e semplificato per mobile
**Logo**: Logo PNG originale integrato con filtri CSS

### Funzionalità Completate ✅
1. **Gestione Utenti Semplificata**: DERO convertito a utente normale, gestione centralizzata
2. **Gestione Eventi Centralizzata**: Controllo completo dalla pagina admin
3. **Registrazione Vini**: Modal completo con 7 campi formattati
4. **Sistema Voti Simultaneo**: Interfaccia ottimizzata per touchscreen mobile
5. **Interfaccia Mobile**: Layout ottimizzato con prevenzione scroll indesiderato
6. **Logo Integrato**: Logo PNG originale con colorazione app
7. **Creazione Eventi Riparata**: Fix completo cache React Query con reload automatico

### Sistema Controllo Votazioni - COMPLETATO ✅
**Controllo Admin Implementato (25 Luglio 2025 - 17:45)**:
- **Database Schema**: Campo votingStatus (not_started/active/completed) aggiunto
- **API Backend**: Route /api/events/:id/voting-status per controllo stato
- **Pulsanti Admin**: "AVVIA VOTAZIONI" e "FERMA VOTAZIONI" funzionanti
- **Controllo Accesso**: Pulsante "PARTECIPA ALLA DIAGONALE" attivo solo quando admin avvia votazioni
- **Logica Condizionale**: Utenti vedono votazione (active) o risultati (completed)
- **Interfaccia Disabilitata**: Pulsante grigio "ATTENDI ATTIVAZIONE VOTAZIONI" quando non attive
- **Auto-redirect**: Sistema automatico pagina corretta basato su stato votazioni
- **Toast Feedback**: Messaggi conferma per admin quando attiva/disattiva votazioni
- **Debug Logging**: Sistema debug per verificare stati votazione
- **Errori LSP Risolti**: Rimossi campi obsoleti (isRevealed, hasLode) dal codice

### Sistema Card Orizzontali Votazione - COMPLETATO ✅ (25 Luglio 2025 - 18:35)
**Interfaccia Votazione Finale Implementata**:
- **Layout Orizzontale**: Card con "Vino di [User]" a sinistra, controlli voto a destra
- **Badge Voto Sempre Visibile**: Tutti i vini mostrano badge con voto (grigio "1.0" se non votato, bordeaux se votato)
- **Controlli Separati**: Frecce touch-friendly (ChevronUp/Down) separate dal badge per controllo preciso
- **Ottimizzazione Mobile**: Touch-manipulation e padding generoso per interfaccia smartphone
- **Voti Decimali**: Sistema 1.0-10.0 con step 0.5, modificabili con frecce dedicate
- **Visibilità Perfetta**: Utente vede chiaramente il voto durante modifiche senza interferenze
- **Colori App**: Mantenuta palette bordeaux/rosso invece dei colori di riferimento

### Report Risultati Completo - COMPLETATO ✅ (26 Luglio 2025 - 12:15)
**Sistema Report Utenti Allineato con Admin**:
- **Backend Aggiornato**: Route /api/events/:id/results ora include dettagli voti individuali
- **Tipo WineResultDetailed**: Frontend usa tipo completo con array votes per ogni vino
- **Interfaccia Unificata**: Report utenti identico al report admin per completezza
- **Layout Semplificato**: Rimosso box statistiche giallo e elementi ridondanti
- **Informazioni Essenziali**: Solo classifica, punteggi e voti individuali visualizzati
- **Design Pulito**: Nascosti prezzo e contatore voti per focus su classifica pura

### Controllo Accesso Unico - IMPLEMENTATO ✅
1. **Database Schema**: Campi sessionId e lastActivity aggiunti
2. **Backend API**: Route login, logout e heartbeat implementate
3. **Frontend Logic**: Controllo sessioni e gestione errori
4. **Sistema Voti Decimali**: Step 0.5 per voti funzionante
5. **Rivelazione Info**: Bottone proprietario vino attivo
6. **Calcolo Totale**: Somma punti invece di media
7. **Session Security**: Prevenzione accesso multiplo dispositivi

### Configurazione Database
- **Host**: Supabase PostgreSQL (EU Central) - Migrazione completata
- **Schema**: Users, Events, Wines, Votes tables completamente operative
- **Migrazioni**: Drizzle ORM con push automatico
- **Inizializzazione**: Solo test connessione database (nessun utente auto-creato)
- **Database Pulito**: Rimosso utente Admin - accesso libero alla pagina admin (25 Luglio 17:47)
- **Performance**: Connection pooling attivo per ottimizzazione
- **Persistenza**: Dati condivisi tra sessioni e deploy

### Architettura Componenti
- **HomeScreen**: Layout ottimizzato con scroll fisso, icona Shield admin
- **EventListScreen**: Lista eventi con doppi pulsanti azione
- **EventDetailsScreen**: Dettagli evento e gestione vini
- **AdminScreen**: Pannello amministrazione completo
- **Modals**: AddUser, EditUser, CreateEvent, WineRegistration

### Stile e Design
- **Colori**: Palette bordeaux scuro/rosso (#300505 - #8d0303) - aggiornata 25 Luglio 17:57
- **Tipografia**: Font system con dimensioni responsive
- **Animazioni**: Transizioni fluide e hover effects con ombre bordeaux
- **Layout**: Design mobile-only ottimizzato per smartphone

### Deployment Configuration
- **Piattaforma**: Replit Deployment (gratuito)
- **Build**: Automatico con Replit
- **PWA**: Configurazione completa con icone appdiago.png
- **Ambiente**: NODE_ENV=production
- **Status**: ✅ DEPLOY COMPLETATO - PWA con icone DIAGONALE professionali funzionanti
- **Preview Risolto**: Cache Replit Preview pulita, ora funziona correttamente
- **URL**: TBD (.replit.app domain)
- **Sistema**: Supabase PostgreSQL (dati persistenti condivisi)
- **Icone PWA**: 96x96, 144x144, 192x192, 512x512 px configurate

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS with custom wine-themed color scheme
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **State Management**: React Query (TanStack Query) for server state management and local React state for UI state
- **Routing**: Single-page application with programmatic navigation between screens

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Design**: RESTful API with JSON responses
- **Development**: Hot reload with Vite middleware in development
- **Production**: Bundled with esbuild for optimal performance

### Database Schema
- **Users**: Basic user management with admin roles
- **Wine Events**: Tasting events with different modes and status tracking
- **Wines**: Wine entries linked to events and users
- **Votes**: Scoring system with numerical scores and "lode" (praise) flags

## Key Components

### Data Storage
- **Current**: Supabase PostgreSQL for production data persistence
- **Implementation**: DatabaseStorage class with full CRUD operations
- **Connection**: PostgreSQL 17.4 with connection pooling (EU Central)
- **ORM**: Drizzle ORM with TypeScript schema definitions
- **Migrations**: Schema management through Drizzle Kit
- **Performance**: Optimized queries with indexed relations

### Authentication & Authorization
- **User Management**: Simple user selection system without passwords
- **Admin Features**: Admin users can create events and manage system
- **Session Management**: Local storage for user persistence

### UI Components
- **Screen-based Navigation**: Home, Event List, Event Details, and Results screens
- **Modal System**: Overlays for user creation, event creation, and wine registration
- **Responsive Design**: Mobile-first approach with glass-morphism effects
- **Floating Navigation**: Quick access to main features

### Core Features
- **Event Management**: Create and manage wine tasting events
- **Wine Registration**: Users can register wines with names and prices
- **Voting System**: Numerical scoring (1-10) with optional "lode" recognition
- **Results Display**: Comprehensive results with rankings and statistics
- **Progress Tracking**: Real-time voting progress indicators

## Data Flow

1. **User Selection**: Users select their profile from registered users
2. **Event Creation**: Admin users create new tasting events with specific modes
3. **Wine Registration**: Participants register wines for the event
4. **Voting Phase**: Users vote on wines with numerical scores
5. **Results Generation**: System calculates averages, rankings, and statistics
6. **Export Functionality**: Results can be exported for sharing

## External Dependencies

### Frontend Dependencies
- **React Ecosystem**: React, React DOM, React Query
- **UI Framework**: Radix UI components, Tailwind CSS
- **Form Handling**: React Hook Form with Zod validation
- **Date Utilities**: date-fns for date formatting
- **Icons**: Lucide React for consistent iconography

### Backend Dependencies
- **Database**: Neon Database serverless PostgreSQL
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Validation**: Zod for runtime type checking
- **Session Storage**: PostgreSQL session store
- **Development Tools**: tsx for TypeScript execution

### Development Tools
- **Build System**: Vite with React plugin
- **TypeScript**: Full TypeScript support across stack
- **Linting**: ESLint configuration
- **Hot Reload**: Vite HMR for fast development
- **Error Handling**: Runtime error overlay for development

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite builds React app to static files
2. **Backend Build**: esbuild bundles Express server
3. **Database Setup**: Drizzle pushes schema to PostgreSQL
4. **Asset Optimization**: Automatic minification and tree-shaking

### Production Configuration
- **Server**: Node.js server serving both API and static files
- **Database**: Supabase PostgreSQL with connection pooling
- **Environment Variables**: DATABASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY
- **Static Files**: Express serves built React application
- **Security**: Secure connection with SSL/TLS encryption

### Render Deployment
- **Platform**: Render.com with GitHub integration
- **Auto-Deploy**: Automatic deployment on push to main branch
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Environment**: NODE_ENV=production, PORT=10000
- **Region**: Frankfurt (EU Central) for Italian users

### Development Workflow
- **Local Development**: Hot reload with Vite middleware
- **Database**: Supabase PostgreSQL with shared persistent storage
- **API Testing**: RESTful endpoints with comprehensive error handling
- **Real-time Updates**: React Query provides optimistic updates
- **GitHub Actions**: Automated testing and deployment pipeline
- **Data Consistency**: Shared database ensures consistent state across environments

The application is designed for easy deployment on Render with GitHub integration. The monorepo structure keeps frontend and backend code organized while sharing common types and schemas. Complete Italian documentation provided for deployment process.