# AnchorMesh

**Turns Every Smartphone into a Beacon**

AnchorMesh is a disaster relief mesh network application that turns smartphones into rescue beacons when traditional communication infrastructure fails. Built for the Alameda County Hackathon 2025.

## Overview

During natural disasters like earthquakes, hurricanes, and wildfires, cell towers often go down first—leaving people unable to call for help when they need it most. AnchorMesh solves this by creating a peer-to-peer mesh network using Bluetooth Low Energy (BLE), allowing SOS signals to hop from phone to phone until they reach someone with internet connectivity.

### How It Works

1. **Disaster Detected** - The app monitors official alerts and activates automatically when emergencies are detected
2. **Mesh Activates** - Your phone starts broadcasting via Bluetooth, no internet required
3. **People Relay** - Nearby phones receive and rebroadcast SOS signals, hopping from person to person
4. **Help Arrives** - When any phone in the chain finds internet, all SOS alerts upload to rescue teams

## Features

- **Real-time SOS Dashboard** - Monitor incoming emergency signals with priority-based triage
- **Live Map Visualization** - See alert locations on an interactive Mapbox map
- **Mesh Network Relay Tracking** - View hop counts and relay chains showing how signals propagated
- **Analytics Dashboard** - Analyze alert patterns and network statistics
- **Disaster Feed** - Real-time disaster event monitoring
- **Demo Mode** - Simulated disaster scenarios for testing and demonstrations
- **Alert Sound Notifications** - Audio alerts for critical incoming signals

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org) 16 with App Router
- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **Maps**: Mapbox GL / react-map-gl
- **Backend**: Supabase (Auth, Database, Realtime)
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun
- Supabase account (for backend)
- Mapbox account (for maps)

### Environment Variables

Create a `.env.local` file with:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
```

### Installation

```bash
# Install dependencies
npm install
# or
yarn install
# or
pnpm install
```

### Development

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page.

Access the rescue dashboard at [http://localhost:3000/admin](http://localhost:3000/admin).

### Build

```bash
npm run build
npm start
```

## Project Structure

```
app/
  page.tsx          # Landing page
  layout.tsx        # Root layout with metadata
  admin/
    page.tsx        # Rescue command center dashboard
    login/
      page.tsx      # Admin authentication

components/
  AlertMap.tsx      # Mapbox-powered alert visualization
  AnalyticsDashboard.tsx  # Statistics and charts
  DisasterFeed.tsx  # Real-time disaster events
  MatrixRain.tsx    # Background visual effect
  Providers.tsx     # Context providers wrapper

hooks/
  useAlerts.ts      # SOS alert data management
  useAuth.ts        # Authentication state
  useDemoData.ts    # Demo mode data generation
  useDisasterFeed.ts    # Disaster event feed
  useLiveSimulation.ts  # Live demo simulation
  useAlertSound.ts  # Audio notifications

lib/
  supabase.ts       # Supabase client and types
  demoData.ts       # Demo scenario definitions
  DemoContext.tsx   # Demo mode state management
```

## Alert Priority System

- **Critical** - Life-threatening emergency requiring immediate response
- **High** - Serious injury or danger, urgent attention needed
- **Medium** - Non-life-threatening emergency
- **Low** - Status update or relay node

## License

This project was created for the Alameda County Hackathon 2025.
