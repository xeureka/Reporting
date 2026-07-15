# Speak To Reach

## Tech Stack

| Layer               | Technology                                                        |
| ------------------- | ----------------------------------------------------------------- |
| **Frontend**        | React 19, Vite 8, TanStack Router, TanStack Query, Tailwind CSS 4 |
| **Backend**         | Hono, Drizzle ORM, PostgreSQL (Neon), Zod, JWT, OpenAPI           |
| **Language**        | TypeScript (strict mode)                                          |
| **Package Manager** | pnpm 10 (workspace monorepo)                                      |
| **Deployment**      | Vercel (frontend), Render (backend)                               |

## Folder Structure

```
├── backend/
│   ├── drizzle/                  # SQL migrations and snapshots
│   ├── src/
│   │   ├── api/
│   │   │   └── index.ts          # Vercel serverless entry
│   │   ├── db/
│   │   │   ├── connection.ts     # PostgreSQL + Drizzle connection
│   │   │   ├── schema.ts         # Drizzle ORM schema
│   │   │   └── seed.ts           # Database seed script
│   │   ├── domain/
│   │   │   └── contracts.ts      # Zod schemas & types
│   │   ├── notion/               # Notion workspace integration
│   │   ├── repositories/
│   │   │   ├── drizzle.ts        # PostgreSQL repository
│   │   │   └── memory.ts         # In-memory fallback
│   │   ├── index.ts              # API routes (OpenAPIHono)
│   │   ├── load-env.ts           # Custom .env loader
│   │   └── server.ts             # Dev server entry (port 3000)
│   ├── drizzle.config.ts
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── public/                   # Static assets
│   ├── src/
│   │   ├── assets/               # Images and SVGs
│   │   ├── components/
│   │   │   ├── layout/           # RootLayout, ProtectedLayout
│   │   │   └── ui/               # Button, Input, Dialog, Table, etc.
│   │   ├── lib/                  # Router, query client, constants, utils
│   │   ├── pages/                # Route pages (Dashboards, Login, Courses, etc.)
│   │   ├── api.ts                # Typed API client (uses VITE_API_URL)
│   │   ├── App.tsx               # Root providers and router
│   │   ├── auth.tsx              # Auth context (JWT)
│   │   ├── index.css
│   │   └── main.tsx              # React entry point
│   ├── index.html
│   ├── nginx.conf                # Production reverse proxy config
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.*.json
│   └── vite.config.ts
│
├── docker-compose.yml            # Full-stack Docker setup
├── render.yaml                   # Render deployment blueprint
├── vercel.json                   # Vercel deployment config
├── package.json                  # Root workspace scripts
├── pnpm-lock.yaml
└── pnpm-workspace.yaml
```

## Getting Started

### Prerequisites

- **Node.js** >= 20
- **pnpm** >= 10 (`npm i -g pnpm`)

### 1. Clone & Install

```bash
git clone <repo-url> speak-to-reach
cd speak-to-reach
pnpm install
```

### 2. Configure Environment

```bash
echo 'DATABASE_URL="postgresql://user:password@host:5432/db?sslmode=require"' > backend/.env
```

The backend falls back to an **in-memory repository** if `DATABASE_URL` is not set — no database needed to explore the app.

Optional env vars:

| Variable     | Default                     | Description            |
| ------------ | --------------------------- | ---------------------- |
| `PORT`       | `3000`                      | Backend server port    |
| `JWT_SECRET` | `speak-to-reach-dev-secret` | Secret for JWT signing |

### 3. Database Setup (optional)

```bash
pnpm db:generate   # Generate migrations
pnpm db:migrate    # Apply migrations
pnpm db:seed       # Seed with sample data
```

### 4. Run

```bash
pnpm dev            # Start backend + frontend in parallel
```

Or separately:

```bash
pnpm --filter @speak-to-reach/backend dev    # http://localhost:3000
pnpm --filter @speak-to-reach/frontend dev   # http://localhost:5173 (proxies /api -> :3000)
```

## Scripts

| Script             | Description                          |
| ------------------ | ------------------------------------ |
| `pnpm dev`         | Start backend + frontend in parallel |
| `pnpm build`       | Build backend + frontend             |
| `pnpm check`       | Type-check backend + build frontend  |
| `pnpm db:generate` | Generate Drizzle migrations          |
| `pnpm db:migrate`  | Apply pending migrations             |
| `pnpm db:seed`     | Seed database with sample data       |

## Docker

```bash
docker compose up --build
```

Spins up the full stack — backend on port 3000, frontend via nginx on port 80.

## API

The backend exposes an OpenAPI spec. With the server running:

| Resource         | URL                                  |
| ---------------- | ------------------------------------ |
| **Swagger UI**   | `http://localhost:3000/api/docs`     |
| **OpenAPI JSON** | `http://localhost:3000/openapi.json` |

## Deployment

| Service      | Platform | Config                                                   |
| ------------ | -------- | -------------------------------------------------------- |
| **Frontend** | Vercel   | `vercel.json` — set `VITE_API_URL` to backend URL        |
| **Backend**  | Render   | `render.yaml` — Docker-based, auto-provisions JWT_SECRET |

## License

UNLICENSED
