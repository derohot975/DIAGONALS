# DIAGONALE - Wine Tasting App

## Overview
A full-stack wine tasting event management application built with React + TypeScript (frontend) and Express + Node.js (backend), using PostgreSQL via Drizzle ORM.

## Architecture
- **Frontend**: React 18 + Vite + TailwindCSS + Radix UI components
- **Backend**: Express.js serving both API and Vite (middleware mode) from a single server
- **Database**: PostgreSQL (Replit-managed) via Drizzle ORM
- **Auth**: PIN-based user authentication (4-digit PIN)
- **Routing**: Wouter (client-side), Express (server-side API)

## Project Structure
```
client/          - React frontend source
  src/
    components/  - UI and feature components
    contexts/    - React contexts (auth, etc.)
    hooks/       - Custom React hooks
    pages/       - Route page components
    lib/         - Utilities
server/          - Express backend
  routes/        - API route handlers (auth, events, wines, votes, reports, pagella)
  db/            - Database helpers (pagella table)
  index.ts       - Main server entry point
  vite.ts        - Vite middleware setup
  db.ts          - Drizzle DB connection
shared/          - Shared TypeScript types and schema
  schema.ts      - Drizzle ORM schema definitions
```

## Key Features
- Wine tasting event management (create, manage events)
- Wine registration per event (type, producer, grape, year, origin, price)
- Voting system with decimal scores (supports 0.5 increments)
- Event reports and pagella (report card) per event
- PIN-based authentication with admin roles
- PWA support (manifest, service worker)

## Database Tables
- `users` - App users with PIN authentication
- `wine_events` - Wine tasting events with status/voting_status
- `wines` - Wines registered per event
- `votes` - User votes per wine per event
- `event_reports` - Generated event reports
- `event_pagella` - Event report cards (created via ensurePagellaTable on startup)

## Development
- **Run command**: `npm run dev` (starts Express + Vite on port 5000)
- **Database push**: `npm run db:push`
- **Build**: `npm run build`

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (managed by Replit)
- `PORT` - Server port (set to 5000 in development)
- `NODE_ENV` - development/production

## Deployment
- Target: Autoscale
- Build: `npm run build`
- Run: `node dist/index.js`
