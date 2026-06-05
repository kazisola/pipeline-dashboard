# Pipeline Monitor — Dashboard (Frontend)

A real-time operations dashboard for monitoring Oil & Gas pipeline sensor data. Built with React, secured with Keycloak OIDC, and connected to a live NestJS backend.

## Tech Stack

| Technology | Role |
|---|---|
| **React 19 + TypeScript** | UI framework |
| **Vite** | Build tool — fast dev server and bundling |
| **Keycloak-js** | OIDC authentication — enterprise SSO login flow |
| **React Query** | Server state management — fetching, caching, auto-refetch |
| **Leaflet + React-Leaflet** | Interactive GPS map with sensor markers |
| **Recharts** | Line charts for historical sensor readings |
| **Axios** | HTTP client with automatic JWT token injection |
| **Lucide React** | Icon library |

## Features

- 🔐 **OIDC Login** — Redirects to Keycloak before rendering anything
- 🗺️ **Live Pipeline Map** — Sensors plotted by GPS coordinates, color-coded by alert level
- 📊 **Historical Chart** — Line chart per sensor type with threshold reference line
- 🚨 **Alert Feed** — Real-time feed of WARNING and CRITICAL sensors
- 📈 **Stat Cards** — Total, Normal, Warning, Critical counts at a glance
- ⚡ **Simulate Event** — Fire live critical sensor events for demo purposes
- 🔄 **Auto-refresh** — Dashboard polls the API every 15 seconds

## Project Structure

```
src/
├── api/
│   └── sensors.api.ts        Axios instance + auto JWT injection + API calls
├── components/
│   ├── AlertBadge.tsx         Color-coded NORMAL / WARNING / CRITICAL pill
│   ├── PipelineMap.tsx        Leaflet map with CircleMarkers and Polyline route
│   ├── SensorChart.tsx        Recharts line chart with type filter buttons
│   ├── SensorTable.tsx        Sortable table of all sensor readings
│   ├── SimulateAlert.tsx      Demo panel — fires live events to the API
│   └── StatCard.tsx           Metric card with icon and glow effect
├── pages/
│   └── Dashboard.tsx          Main page — composes all components
├── keycloak.ts                Keycloak SDK initialization
├── App.tsx                    Router setup
└── main.tsx                   Keycloak init → render app
```

## Authentication Flow

```
User visits http://localhost:5173
        │
        ▼
keycloak.init({ onLoad: 'login-required' })
        │
        ▼ (if not logged in)
Redirect to Keycloak login page
        │
        ▼ (after login)
Keycloak returns JWT token
        │
        ▼
React app renders
        │
        ▼
Every API request via Axios interceptor:
  → checks if token expires within 30s → auto-refreshes if needed
  → injects Authorization: Bearer <token> header automatically
```

## Getting Started

### Prerequisites
- Node.js 20+
- Backend running on `http://localhost:3000`
- Keycloak running on `http://localhost:8080`

### 1. Install dependencies
```bash
cd pipeline-dashboard
npm install
```

### 2. Run the dev server
```bash
npm run dev
```

Dashboard available at `http://localhost:5173`

You will be redirected to Keycloak login automatically.
Login with: `engineer1 / Test1234!`

## Key Design Decisions

**Why initialize Keycloak before rendering?**
We use `keycloak.init()` in `main.tsx` before calling `createRoot()`. This ensures no component ever renders without a valid token — there's no "flash of unauthenticated content" and no need for protected route wrappers on every page.

**Why React Query instead of useState + useEffect?**
React Query handles loading states, error states, caching, deduplication, and background refetching out of the box. `invalidateQueries` after a simulation triggers an instant refetch — no manual state management needed.

**Why Leaflet for the map?**
Leaflet is open source, requires no API key, and is widely used in enterprise GIS applications including industrial monitoring systems. React-Leaflet provides clean React bindings.

**Why a Simulate Event panel?**
In a demo context, being able to trigger a live critical event shows the full end-to-end flow — from sensor reading to alert processing to UI update — in real time without needing physical hardware.
