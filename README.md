# Speak To Reach — School Management System

A school management platform for English language courses with three roles: **Admin**, **Teacher**, and **Student**.

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 8, TanStack Router, TanStack Query, react-icons |
| **Backend** | Hono, Drizzle ORM, PostgreSQL (Neon), Zod, JWT, OpenAPI |
| **Database** | PostgreSQL via Neon (serverless) |
| **Language** | TypeScript 6 (strict mode) |
| **Package Manager** | pnpm 10 (workspace monorepo) |
| **Infrastructure** | Vercel (deployment) |

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
│   │   ├── notion/               # Notion CLI and workspace integration
│   │   ├── repositories/
│   │   │   ├── drizzle.ts        # PostgreSQL repository
│   │   │   └── memory.ts         # In-memory fallback repository
│   │   ├── index.ts              # API routes (OpenAPIHono)
│   │   ├── load-env.ts           # Custom .env loader
│   │   └── server.ts             # Dev server entry (port 3000)
│   ├── drizzle.config.ts         # Drizzle ORM configuration
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── dist/                     # Production build output
│   ├── public/                   # Public static assets (favicon, icons)
│   ├── src/
│   │   ├── assets/               # Images and SVGs
│   │   ├── components/           # Reusable React components
│   │   │   ├── forms/            # Form components (e.g., ChangePassword)
│   │   │   ├── layout/           # Layout wrappers (RootLayout, ProtectedLayout)
│   │   │   ├── lists/            # Data views (Dashboards, Courses, Students)
│   │   │   └── ui/               # Generic UI elements (Badges, Tables, Panels)
│   │   ├── lib/                  # Utilities, router config, query-client, constants
│   │   ├── pages/                # Route-level components (Dashboards, Login, Reports)
│   │   ├── api.ts                # Typed API client
│   │   ├── App.css               # Application styles
│   │   ├── App.tsx               # Main application routing and providers
│   │   ├── auth.tsx              # Authentication context (JWT)
│   │   ├── index.css             # CSS variables & resets
│   │   └── main.tsx              # React entry point
│   ├── index.html                # Vite HTML entry point
│   ├── package.json
│   ├── tsconfig.*.json           # TypeScript configurations (app, node, base)
│   └── vite.config.ts            # Vite bundler configuration
│
├── package.json                  # Root workspace config
├── pnpm-lock.yaml                # pnpm dependency lockfile
├── pnpm-workspace.yaml           # pnpm workspace definition
├── README.md                     # Project documentation
└── vercel.json                   # Vercel deployment config
```

## Installation

### Prerequisites

- **Node.js** >= 20
- **pnpm** >= 10 (install: `npm i -g pnpm`)

### 1. Clone & Install Dependencies

```bash
git clone <repo-url> reporting
cd reporting
pnpm install
```

### 2. Configure Environment Variables

```bash
# Backend — create backend/.env with your PostgreSQL connection string:
echo 'DATABASE_URL="postgresql://user:password@host:5432/db?sslmode=require"' > backend/.env
```

The backend automatically falls back to an **in-memory repository** (no database needed) if `DATABASE_URL` is not set.

Optional environment variables:

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Backend server port |
| `JWT_SECRET` | `speak-to-reach-dev-secret` | Secret for JWT signing |
| `NOTION_TOKEN` | — | Notion API token (workspace generator) |
| `NOTION_PARENT_PAGE_ID` | — | Notion parent page ID |

### 3. Database Setup (optional)

Skip this step if you want to use the in-memory fallback.

```bash
# Generate migrations (if schema changes)
pnpm db:generate

# Apply migrations
pnpm db:migrate

# Seed with sample data
pnpm db:seed
```

### 4. Run in Development

```bash
# Start both backend and frontend concurrently
pnpm dev
```

Or start them separately:

```bash
# Backend only (http://localhost:3000)
pnpm --filter @speak-to-reach/backend dev

# Frontend only (http://localhost:5173, proxies /api -> :3000)
pnpm --filter @speak-to-reach/frontend dev
```

## Available Scripts

| Script | Description |
|---|---|
| `pnpm dev` | Start backend + frontend in parallel |
| `pnpm build` | Compile backend (tsc) + build frontend (vite) |
| `pnpm check` | Type-check backend + build frontend |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:migrate` | Apply pending migrations |
| `pnpm db:seed` | Seed database with sample data |

## API

The API is automatically documented via OpenAPI. With the server running, visit:

| Resource | URL |
|---|---|
| **Swagger UI** | `http://localhost:3000/api/docs` |
| **OpenAPI JSON** | `http://localhost:3000/openapi.json` |

The Swagger UI provides an interactive interface to explore and test all API endpoints directly from your browser.

All API routes are prefixed with `/api/` and include endpoints for auth, teachers, students, courses, assignments, sessions, homework, progress, performance, and reports.
