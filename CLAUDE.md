# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Aether SOS is a peer-to-peer mesh networking application for disaster relief. It enables emergency SOS alerts via Bluetooth Low Energy (BLE) mesh networking when internet infrastructure fails, allowing phones to relay critical messages across affected areas.

## Commands

### Frontend (Next.js)
```bash
npm run dev      # Start dev server on :3000
npm run build    # Production build
npm start        # Run production server
npm run lint     # Run ESLint
```

### Backend (Express.js)
```bash
cd backend
npm run dev      # Start with nodemon (auto-reload)
npm start        # Production server
npm test         # Run Jest test suite
```

### Running Both
The frontend and backend run on separate processes. Start the backend first (requires MongoDB), then the frontend.

## Architecture

### Tech Stack
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Framer Motion
- **Backend**: Express.js, MongoDB/Mongoose, JWT auth, WebSocket (ws)

### Directory Structure
```
app/                    # Next.js frontend (App Router)
├── admin/              # Admin dashboard and login
├── page.tsx            # Landing page
└── globals.css         # Global styles and animations

backend/                # Express.js REST + WebSocket API
├── config/db.js        # MongoDB connection
├── controllers/        # Request handlers (device, sos)
├── middleware/         # Auth, validation, error handling
├── models/             # Mongoose schemas (Device, SOSAlert)
├── routes/             # API route definitions
├── services/           # WebSocket server, verification
└── server.js           # Entry point
```

### Data Flow
1. BLE mesh messages originate from mobile devices
2. Devices relay messages to each other via BLE
3. When internet-connected, devices upload to server
4. Server validates, deduplicates, and persists to MongoDB
5. WebSocket broadcasts updates to admin dashboard

### Key Models

**Device**: Tracks registered devices with BLE capabilities, location, and online status. Supports geolocation queries for finding nearby devices.

**SOSAlert**: Emergency alerts with priority levels (low/medium/high/critical), emergency types (medical, fire, security, disaster, accident), and status workflow (active → acknowledged → responding → resolved/cancelled). Includes relay chain tracking for mesh routing.

### API Structure
All API routes are versioned under `/api/v1/`:
- `/device/*` - Device registration, heartbeat, location updates
- `/sos/*` - Alert creation, relay, acknowledgment, resolution

Authentication uses JWT tokens in Authorization header + device verification via X-Device-ID header.

## Environment Variables (Backend)

Copy `backend/.env.example` to `backend/.env`. Required:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT signing
- `APP_SIGNATURE_SECRET` - App signature verification

## Frontend Patterns

- "use client" directive required for components using React hooks or Framer Motion
- Path alias `@/*` maps to project root
- Dark theme with color system: critical (#ef4444), warning (#eab308), safe (#22c55e), accent (#3b82f6)
- Admin auth currently uses localStorage (demo only) - credentials: `admin@aethersos.com` / `admin123`

## Backend Patterns

- MVC architecture: routes → controllers → models
- All input validation via express-validator in middleware
- Rate limiting: 100 requests per 15 minutes
- Custom ApiError class for consistent error responses
- TTL indexes on alerts for automatic expiration
