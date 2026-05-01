# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### WeatherScope (`artifacts/weather-scope`)
- **Kind**: React + Vite web app
- **Preview path**: `/`
- **Port**: 25668
- **Description**: Weather analytics dashboard migrated from external archive
- **Features**:
  - CSV upload with drag-and-drop (papaparse, any date format)
  - Data cleaning status report
  - Statistical analysis (min/max/avg per parameter, year-wise trends)
  - Interactive visualizations (Recharts: line, bar, area charts)
  - AI prediction (linear regression on historical monthly data)
  - Results & insights with sector-wise impact analysis (agriculture, urban, energy, disaster)
  - Live current weather widget in sidebar (mocked; real via WEATHER_API_KEY env var)
  - Admin panel (`/admin`) with login, user management, usage logs, CSV exports
  - User registration modal

### API Server (`artifacts/api-server`)
- **Kind**: Express 5 backend
- **Port**: 8080
- **Routes** (all under `/api`):
  - `GET/POST/DELETE /api/weather` — weather records CRUD
  - `GET /api/weather/stats` — aggregated statistics
  - `POST /api/weather/predict` — linear regression forecast
  - `GET /api/weather/:city` — live weather (weatherapi.com or mock)
  - `POST /api/users/register` — user registration
  - `POST /api/admin/login` — session-based admin login
  - `GET /api/admin/dashboard` — usage stats
  - `GET /api/admin/users` — user list with PATCH/DELETE
  - `GET /api/admin/usage-logs` — usage log list
  - `GET /api/admin/export/users|logs` — CSV exports
- **Session**: express-session + connect-pg-simple (PostgreSQL-backed)
- **Admin credentials**: `ADMIN_USERNAME` / `ADMIN_PASSWORD` env vars (default: `admin` / `admin123`)

## Database Schema (`lib/db`)

Tables added for WeatherScope:
- `weather_data` — id, date, temperature, rainfall, humidity
- `app_users` — id, name, email, registeredAt, firstAccessAt, status
- `usage_logs` — id, userId, accessTime, actionType, ipAddress

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string
- `SESSION_SECRET` — Express session secret
- `ADMIN_USERNAME` — Admin panel username (default: `admin`)
- `ADMIN_PASSWORD` — Admin panel password (default: `admin123`)
- `WEATHER_API_KEY` — (optional) weatherapi.com key for real live weather data

## Notes

- Live weather widget falls back to randomized mock data if `WEATHER_API_KEY` is not set
- Admin panel accessible at `/admin` — separate dark-themed layout (no sidebar)
- All weather data routes use direct fetch calls (no OpenAPI codegen — migrated app pattern)
