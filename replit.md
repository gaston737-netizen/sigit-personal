# SIGIT Personal

Sistema de Seguimiento de Interconsultas y Turnos para administración sanitaria penitenciaria.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/sigit run dev` — run the frontend (port 25662)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + shadcn/ui + wouter
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth)
- `lib/db/src/schema/` — Drizzle schema (interconsultas, observaciones, adjuntos, configuracion)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/sigit/src/pages/` — React pages (matutino, inicio, nueva, buscar, ficha, alertas, seguimiento, reportes, configuracion)
- `artifacts/sigit/src/components/layout.tsx` — Sidebar layout

## Architecture decisions

- Días transcurridos and alerta level are computed at query time (not stored) from fechaInterconsulta
- Date format used throughout: DD/MM/AAAA (Argentine convention)
- All fields optional except prontuario, apellidoNombre, especialidad, prioridad, fechaInterconsulta
- Configuracion table has a single row (created on first GET if missing)
- Alerta thresholds are stored in configuracion but alert computation in API routes currently uses hardcoded 30/60/90 logic (future: read from config)

## Product

SIGIT Personal es una herramienta de gestión interna para operadores sanitarios penitenciarios. Permite:
- Registrar y hacer seguimiento de interconsultas médicas a especialistas
- Alertar automáticamente cuando los casos superan umbrales de días sin resolución
- Gestionar observaciones y adjuntos por caso
- Generar reportes mensuales por especialidad y estado
- Panel matutino diario que resume la situación al abrir la app

## User preferences

- UI en español (Argentina)
- Sin emojis en la interfaz
- Formato de fecha: DD/MM/AAAA

## Gotchas

- Date parsing splits DD/MM/YYYY format — always store dates in that format
- `pnpm --filter @workspace/db run push` needs DATABASE_URL env var
- Do not run `pnpm dev` at workspace root

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
