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
- **Architecture**: Single-file React app (`src/App.tsx`). Uses `// @ts-nocheck` to allow plain JSX. No backend — all data persisted in localStorage via `useLS` hook.
- **Key files**:
  - `src/App.tsx` — main app (~2960 lines, all components, tools, export engine)
  - `src/i18n/translations.js` — UI strings in English, Français, Português
  - `src/index.css` — responsive CSS (mobile layout, touch targets, skip link, iOS zoom fix)
  - `public/manifest.json` — PWA web app manifest
- **Features**: E&S Screening, Policies, Risk Assessment, Compliance, Management Plans, Implementation Tools, ESAP, multilingual (EN/FR/PT), PDF/Word/CSV export, JSON backup/restore
- **Responsive layout**:
  - Desktop (>768px): sticky sidebar + main content
  - Mobile (≤768px): mobile top header (hamburger + title + language), off-screen sidebar drawer, mobile bottom navigation bar (5 tabs + More)
  - GuidelinesPanel: slide-in from right on desktop, full-screen on mobile
- **Accessibility (WCAG 2.1 AA)**:
  - Skip-to-main-content link (`.skip-link`)
  - `<main id="main-content" role="main">`
  - Sidebar: `role="navigation"` + `aria-label`
  - GuidelinesPanel: `role="dialog"` + `aria-modal` + Escape key + focus trap + auto-focus close button
  - All icon-only and remove (×) buttons have `aria-label`
  - `aria-current="page"` on active nav items
  - `aria-expanded` on hamburger button
- **Touch & mobile fixes**:
  - iOS auto-zoom fix: `font-size: 16px !important` on all inputs/select/textarea on touch devices
  - All × remove buttons: `min-width: 44px; min-height: 44px` on touch devices
  - Android font fallbacks: Noto Serif/Noto Sans added to font stacks
  - `viewport-fit=cover` for iPhone safe areas
  - `env(safe-area-inset-bottom)` padding on bottom nav
