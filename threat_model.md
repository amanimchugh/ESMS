# Threat Model

## Project Overview

This repository is a pnpm TypeScript monorepo. The production application currently consists of an Express 5 API server, shared generated API clients and Zod schemas, a Drizzle/PostgreSQL database package, and a React/Vite ESMS Builder frontend artifact. The ESMS Builder is a browser-based Environmental & Social Management System authoring tool for off-grid solar companies; it stores user-entered project data in browser localStorage and supports JSON backup/restore plus PDF/Word/CSV-style exports. The API surface is minimal today and exposes only a health check.

Production assumptions for scans: `NODE_ENV` is set to `production`, platform TLS protects traffic between clients and deployed services, and the mockup sandbox is a development-only experimental environment that is not deployed to production.

## Assets

- **ESMS user data** -- company details, risk assessments, compliance registers, stakeholder/grievance information, incident data, supplier information, and generated ESMS documents. The current frontend stores this data locally in the user's browser rather than on the server.
- **Application availability and integrity** -- users rely on generated ESMS documents and backups; malicious imports or export rendering issues could corrupt or misrepresent business records.
- **Application secrets** -- `DATABASE_URL` and any future API keys or session secrets are supplied through environment variables and must not be exposed to browser bundles or logs.
- **Database contents** -- the database package is configured for PostgreSQL through Drizzle. The current schema is placeholder-only, but future tables may contain user or business data.
- **Generated API/client contract** -- OpenAPI, generated Zod schemas, and React client code define how browser/mobile clients call the API.

## Trust Boundaries

- **Browser to frontend runtime** -- all form fields, imported JSON backup files, localStorage contents, and browser state are user-controlled. React rendering and document export code must treat this data as untrusted.
- **Browser to API server** -- `/api/*` requests cross from an untrusted client to Express. The API currently exposes only `GET /api/healthz`; future non-public endpoints must authenticate and authorize server-side.
- **API server to PostgreSQL** -- `lib/db/src/index.ts` connects to PostgreSQL using `DATABASE_URL`. SQL access must remain parameterized through Drizzle or equivalent safe APIs.
- **Server to environment/secrets** -- server packages can read environment variables. Browser packages must not embed secrets.
- **Public internet to external links** -- the frontend displays curated external guideline links and opens them in new tabs with `rel="noopener noreferrer"` where applicable.
- **Production vs development-only code** -- `artifacts/mockup-sandbox/`, dev scripts, Vite development plugins, and runtime error overlays are out of production vulnerability scope unless a production deployment path is demonstrated.

## Scan Anchors

- Production API entry points: `artifacts/api-server/src/index.ts`, `artifacts/api-server/src/app.ts`, `artifacts/api-server/src/routes/`, and `lib/api-spec/openapi.yaml`.
- Production frontend entry points: `artifacts/esms-builder/src/main.tsx`, `artifacts/esms-builder/src/App.tsx`, and `artifacts/esms-builder/vite.config.ts`.
- Shared data/API packages: `lib/api-client-react/src/custom-fetch.ts`, `lib/api-zod/src/generated/`, `lib/db/src/index.ts`, and `lib/db/src/schema/`.
- High-risk frontend areas: JSON backup restore (`restoreData`), localStorage persistence (`useLS`), generated HTML/RTF/CSV exports (`buildPrintHTML`, `exportPDF`, `buildRTF`, export helpers), and any `dangerouslySetInnerHTML` usage.
- Current public surface: `GET /api/healthz` and the static ESMS Builder UI. There is no implemented server-side authentication, user data API, admin route, upload endpoint, webhook, or payment flow in production code at this snapshot.
- Dev-only areas usually ignored by production scans: `artifacts/mockup-sandbox/`, `scripts/`, `.local/skills/`, and Vite plugins gated to non-production.

## Threat Categories

### Spoofing

The current API has no authenticated user boundary because it only exposes a public health check. If future endpoints access user, business, or administrative data, they must require verified server-side authentication on every protected route; generated client support for bearer tokens is not sufficient by itself.

### Tampering

Imported backup files, localStorage contents, and all form fields are user-controlled and can affect generated ESMS outputs. The frontend must validate backup structure before replacing application state, must ensure exported HTML/RTF documents cannot execute attacker-controlled script or markup, and must neutralize spreadsheet formula prefixes in CSV exports. Server-side data writes added later must validate request bodies with generated Zod schemas or equivalent checks.

### Information Disclosure

The ESMS Builder stores potentially sensitive business and stakeholder data in browser localStorage, so confidentiality depends on the user's browser/device security and same-origin isolation. The application must not send that data to the API unless explicitly designed to do so with authentication and authorization. Server logging must continue to redact credentials and cookies, and browser bundles must not contain server secrets.

### Denial of Service

The public API is minimal, but future routes should keep body-size limits, timeouts, and rate limits proportional to exposure. The frontend backup restore path should avoid unbounded processing of very large JSON files that can freeze the browser and should bound restored collection sizes before rendering or persisting them.

### Elevation of Privilege

There are currently no admin or role-based server features. If database-backed features are added, authorization checks must be enforced on the API server, not only in generated clients or React UI. Database access should stay parameterized through Drizzle to avoid SQL injection.

### Security Misconfiguration

Production deployments must not expose dev-only mockup sandbox code, runtime error overlays, or Vite development plugins. CORS, host allowances, and preview/dev server settings should be reviewed whenever production API routes begin handling credentials or sensitive data.
