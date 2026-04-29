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

### ESMS Builder (`artifacts/esms-builder`)
- **Kind**: react-vite web app
- **Preview path**: `/`
- **Description**: ROGEAP Off-Grid Solar ESMS Builder — a comprehensive tool for building and implementing an Environmental & Social Management System, aligned with ROGEAP Guidelines and IFC Performance Standards.
- **Architecture**: Single-file React app (`src/App.tsx`, ported from App.jsx). Uses `// @ts-nocheck` to allow plain JSX. No backend needed — all data persisted in localStorage via `useLS` hook.
- **Key files**:
  - `src/App.tsx` — main app (2835 lines, all components, tools, export engine)
  - `src/i18n/translations.js` — UI strings in English, Français, Português
  - `src/index.css` — minimal reset styles (no Tailwind)
- **Features**: E&S Screening, Policies, Risk Assessment, Compliance, Management Plans, Implementation Tools, ESAP, multilingual (EN/FR/PT), PDF/Word/CSV export
- **Bug fixed**: `Welcome` component needed `nav` prop (NAV was defined inside App function but referenced in module-level Welcome component)
