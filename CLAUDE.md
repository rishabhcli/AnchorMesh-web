# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Aether SOS is a peer-to-peer mesh networking application for disaster relief. It enables emergency SOS alerts via Bluetooth Low Energy (BLE) mesh networking when internet infrastructure fails, allowing phones to relay critical messages across affected areas.

This repository contains the **Rescue Dashboard** - a Next.js web application for rescue teams to monitor and respond to emergency alerts in real-time.

## Commands

```bash
npm run dev      # Start dev server on :3000
npm run build    # Production build
npm start        # Run production server
npm run lint     # Run ESLint
```

## Architecture

### Tech Stack
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Framer Motion
- **Backend**: Supabase (PostgreSQL + PostGIS + Realtime + Auth)
- **Maps**: Mapbox GL JS via react-map-gl

### Directory Structure
```
app/                    # Next.js App Router pages
├── admin/              # Admin dashboard (protected)
│   ├── page.tsx        # Main dashboard with alerts, map, stats
│   └── login/          # Login page
├── page.tsx            # Landing page
└── globals.css         # Global styles and animations

components/             # Reusable React components
└── AlertMap.tsx        # Live map with alert markers

hooks/                  # Custom React hooks
├── useAlerts.ts        # Alert data fetching + realtime subscriptions
└── useAuth.ts          # Supabase authentication

lib/                    # Utilities and clients
└── supabase.ts         # Supabase client + TypeScript types
```

### Data Flow
1. BLE mesh messages originate from Flutter mobile app
2. Devices relay messages to each other via BLE
3. When internet-connected, devices sync to Supabase via `sync_sos_packet` RPC
4. Supabase Realtime broadcasts updates to dashboard
5. Rescue teams acknowledge and respond via dashboard

### Supabase Database Schema

**devices**: Tracks registered devices with BLE capabilities, location, and online status.
- `device_id` (unique identifier)
- `platform` (ios/android/web)
- `last_known_location` (PostGIS geography)
- `is_active`, `last_seen`

**sos_alerts**: Emergency alerts with full tracking.
- Priority levels: low, medium, high, critical
- Emergency types: medical, fire, security, natural_disaster, accident, other
- Status workflow: active → acknowledged → responding → resolved/cancelled
- `hop_count` and `relay_chain` for mesh routing tracking
- `delivered_via`: direct or mesh_relay

**admin_users**: Dashboard user metadata linked to Supabase Auth.

### Key RPC Functions
- `sync_sos_packet()` - Called by mobile app to sync SOS packets
- `get_alert_stats()` - Returns dashboard statistics
- `get_nearby_alerts()` - Find alerts within radius (PostGIS)

## Environment Variables

Create `.env.local` with:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token  # Optional, for live map
```

## Frontend Patterns

- "use client" directive required for components using React hooks or Framer Motion
- Path alias `@/*` maps to project root
- Dark theme with color system: critical (#ef4444), warning (#eab308), safe (#22c55e), accent (#3b82f6)
- Authentication via Supabase Auth (email/password)
- Realtime subscriptions via Supabase for live alert updates

## Dashboard Features

- **Live Alerts Table**: View active SOS signals with acknowledge/resolve actions
- **Live Map**: Mapbox map showing alert locations with priority-based markers
- **View Modes**: Toggle between table, map, or split view
- **Statistics**: Active nodes, alerts by type/priority, resolved today
- **Activity Feed**: Recent alert activity from mesh network
- **Realtime Updates**: Automatic refresh when new alerts arrive

## Related Repository

**Flutter Mobile App**: `/Users/rishabhbansal/Documents/GitHub/flutter_Project_Hackathone`
- BLE mesh networking for SOS signal transmission
- Offline-first with local SQLite storage
- Syncs to Supabase when internet available
