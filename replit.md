# DIAGONALE Wine Tasting App

## Overview

DIAGONALE is a mobile-first web application for blind wine tasting events. The app supports two tasting modes: "CIECA" (blind) and "CIECONA" (blind with enhanced features). Users can create tasting events, register wines, vote on wines, and view comprehensive results. The application follows a modern full-stack architecture with React frontend and Express backend.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (July 18, 2025 - Updated 15:55)

### Database & Core System
- **Database Migration Completed**: Migrated from in-memory storage to PostgreSQL database
- **Data Persistence**: Fixed issue where data was lost on code changes
- **Database Schema**: Implemented full schema with users, events, wines, and votes tables
- **Auto-initialization**: Database automatically creates Admin user on startup
- **Scalable Architecture**: RESTful API with PostgreSQL backend ready for production
- **Deployment Ready**: Configured for Render deployment with GitHub integration

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
- **Navigation**: Added back arrow button for intuitive navigation between screens
- **Clean Interface**: Removed redundant elements like home button from event pages

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
- **Security Enhancement**: Removed admin checkbox from new user creation for security
- **Admin Interface**: Clean separation between admin functions and participant views
- **User Flow**: Simplified navigation from home to events via user selection

### Event Management
- **Active/Historic Separation**: Events clearly separated between active and completed
- **Event Status**: Visual indicators for active events with animated pulse effect
- **Event Modes**: Clear display of CIECA vs CIECONA with proper Italian terminology
- **Layout Optimization**: Almost full-page design for single event display

### Technical Improvements
- **Component Architecture**: Modular React components with proper prop passing
- **State Management**: Clean separation of concerns between UI and data operations
- **Error Handling**: Robust error handling and user feedback
- **Type Safety**: Full TypeScript implementation with proper interfaces
- **Code Optimization**: Eliminated duplicate types, removed unused UI components
- **Performance**: Optimized imports and cleaned localStorage error handling
- **Maintainability**: Centralized type definitions in shared schema

## 🔄 PUNTO DI RIPRISTINO (18 Luglio 2025 - 14:55)

### Stato Attuale del Sistema
**Database**: PostgreSQL funzionante con schema completo
**Backend**: Express.js su porta 5000 con API RESTful
**Frontend**: React con Vite in modalità sviluppo
**Utenti**: Sistema completo con Admin predefinito
**Eventi**: Sistema di gestione eventi attivi/completati
**Logo**: Logo PNG originale integrato con filtri CSS

### Funzionalità Completate ✅
1. **Gestione Utenti**: Creazione, modifica, eliminazione utenti
2. **Gestione Eventi**: Creazione eventi base (modalità unica)
3. **Registrazione Vini**: Modal completo con 7 campi formattati
4. **Sistema Voti**: Votazione vini base (da aggiornare)
5. **Interfaccia Ottimizzata**: Layout centrato e responsivo
6. **Logo Integrato**: Logo PNG originale con colorazione app

### Sistema Votazioni - COMPLETATO ✅
**Nuovo Flusso Implementato**:
- Fase 1: Registrazione vini (invisibili post-registrazione)
- Fase 2: Admin gestisce votazioni per vino selezionato
- Fase 3: Voti 1-10 con step 0.5, proprietario può rivelare info
- Fase 4: Calcolo somma totale (non media)
- Fase 5: Chiusura quando tutti hanno votato
- Fase 6: Report finale con classifica totale

### Controllo Accesso Unico - IMPLEMENTATO ✅
1. **Database Schema**: Campi sessionId e lastActivity aggiunti
2. **Backend API**: Route login, logout e heartbeat implementate
3. **Frontend Logic**: Controllo sessioni e gestione errori
4. **Sistema Voti Decimali**: Step 0.5 per voti funzionante
5. **Rivelazione Info**: Bottone proprietario vino attivo
6. **Calcolo Totale**: Somma punti invece di media
7. **Session Security**: Prevenzione accesso multiplo dispositivi

### Configurazione Database
- **Host**: Neon Database PostgreSQL serverless
- **Schema**: Users, Events, Wines, Votes tables
- **Migrazioni**: Drizzle ORM con push automatico
- **Inizializzazione**: Auto-creazione utente Admin

### Architettura Componenti
- **HomeScreen**: Layout ottimizzato con scroll fisso, icona Shield admin
- **EventListScreen**: Lista eventi con doppi pulsanti azione
- **EventDetailsScreen**: Dettagli evento e gestione vini
- **AdminScreen**: Pannello amministrazione completo
- **Modals**: AddUser, EditUser, CreateEvent, WineRegistration

### Stile e Design
- **Colori**: Palette HSL con sfumature viola/blu professionale
- **Tipografia**: Font system con dimensioni responsive
- **Animazioni**: Transizioni fluide e hover effects
- **Layout**: Design mobile-first con adattamento desktop

### Deployment Configuration
- **Piattaforma**: Render.com con GitHub integration
- **Build**: npm run build (frontend + backend)
- **Start**: npm start (server production)
- **Ambiente**: NODE_ENV=production, PORT=10000
- **Regione**: Oregon (US West)
- **Status**: ✅ DEPLOYED SUCCESSFULLY
- **URL**: https://diagonale.onrender.com
- **Sistema**: In-memory storage (dati separati da Replit)

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
- **Current**: In-memory storage for testing and development
- **Future**: Supabase integration planned for production data persistence
- **Development**: In-memory storage implementation for quick testing
- **ORM**: Drizzle ORM with TypeScript schema definitions
- **Migrations**: Schema management through Drizzle Kit

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
- **Database**: Neon Database with connection pooling or in-memory storage
- **Environment Variables**: DATABASE_URL for database connection (optional)
- **Static Files**: Express serves built React application

### Render Deployment
- **Platform**: Render.com with GitHub integration
- **Auto-Deploy**: Automatic deployment on push to main branch
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Environment**: NODE_ENV=production, PORT=10000
- **Region**: Frankfurt (EU Central) for Italian users

### Development Workflow
- **Local Development**: Hot reload with Vite middleware
- **Database**: Can use either PostgreSQL or in-memory storage
- **API Testing**: RESTful endpoints with comprehensive error handling
- **Real-time Updates**: React Query provides optimistic updates
- **GitHub Actions**: Automated testing and deployment pipeline

The application is designed for easy deployment on Render with GitHub integration. The monorepo structure keeps frontend and backend code organized while sharing common types and schemas. Complete Italian documentation provided for deployment process.