# DIAGONALE Wine Tasting App

## Overview
DIAGONALE is a mobile-only web application designed for blind wine tasting events, exclusively optimized for smartphones. It supports "CIECA" (blind) and "CIECONA" (blind with enhanced features) tasting modes. Users can create events, register wines, vote, and view comprehensive results. The application aims to provide a streamlined, engaging experience for wine enthusiasts, with a focus on simplicity and ease of use in a social tasting context.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with a custom wine-themed color scheme. Uses Radix UI primitives with shadcn/ui.
- **State Management**: React Query (TanStack Query) for server state and local React state for UI state.
- **Routing**: Single-page application with programmatic navigation.

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **API Design**: RESTful API with JSON responses.

### Database Schema
- **Tables**: Users, Events, Wines, Votes.
- **Key Fields**: Includes `sessionId` and `lastActivity` for session control, `votingStatus` for event state.

### UI/UX Decisions
- **Mobile-First Design**: Optimized exclusively for smartphone screens.
- **Consistent Navigation**: Standardized back arrow and home buttons (circular blue style) fixed at the bottom.
- **Event Display**: Redesigned event cards with centered content, clear display of name, date, mode, and status.
- **Dual Action Buttons**: Separate buttons for "REGISTRA IL TUO VINO" and "PARTECIPA ALLA DIAGONALE".
- **Color Palette**: Dark bordeaux/red theme.
- **Animations**: Subtle logo glow, smooth transitions, and hover effects.
- **Reporting**: Focus on wine rankings and individual votes, simplifying results display.
- **Session Management UI**: Clear error messages for concurrent login attempts, "ATTENDI ATTIVAZIONE VOTAZIONI" button state.
- **Voting Interface**: Horizontal cards with "Vino di [User]", touch-friendly chevron arrows for decimal votes (0.5 steps), and persistent vote badges.

### Core Features
- **Event Management**: Creation, activation, and completion of wine tasting events, with clear separation of active and historic events.
- **Wine Registration**: Modal system for 7 wine fields (type, name, producer, grape, year, origin, price) with auto-formatting and smart capitalization.
- **Voting System**: Simultaneous voting with numerical scores (1.0-10.0 in 0.5 steps). Admin controls "AVVIA VOTAZIONI" and "FERMA VOTAZIONI".
- **Results Display**: Comprehensive results with wine rankings, scores, and individual votes.
- **User Management**: Simplified user management without traditional admin roles; all users are participants. Open access to the admin panel.
- **Session Control**: Prevents simultaneous access from multiple devices, tracks `sessionId` and `lastActivity`, with 5-minute inactivity auto-expiry.

## External Dependencies

### Frontend Dependencies
- **React Ecosystem**: React, React DOM, React Query.
- **UI Framework**: Radix UI components, Tailwind CSS.
- **Form Handling**: React Hook Form with Zod validation.
- **Date Utilities**: `date-fns`.
- **Icons**: Lucide React.

### Backend Dependencies
- **Database**: Supabase PostgreSQL (EU Central).
- **ORM**: Drizzle ORM with PostgreSQL dialect.
- **Validation**: Zod.

### Development Tools
- **Build System**: Vite.
- **TypeScript**: Full support.
- **Linting**: ESLint.
- **Runtime Execution**: `tsx`.