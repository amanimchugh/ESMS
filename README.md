# ROGEAP Off-Grid Solar ESMS Builder

A comprehensive, browser-based tool for building and implementing an **Environmental & Social Management System (ESMS)**, aligned with ROGEAP Guidelines and IFC Performance Standards.

All data is stored locally in the browser — nothing is sent to any server.

---

## Features

- 📋 **E&S Screening Questionnaire** — ROGEAP Table 6, automated risk classification
- 📜 **6 Policy Templates** — E&S, HR, OHS, Consumer Protection, Waste, Gender
- 🔍 **Risk Assessment Register** — impact/likelihood matrix with mitigation tracking
- ⚖️ **Compliance Tracker** — aligned with ROGEAP, IFC PS, and national law
- ⚙️ **8 Management Plans** — OHS, Consumer Protection, Waste, EPR, HR, SEP, GRM, and more
- 🛠️ **13 Implementation Tools** — PPE Matrix, Incident Log, Training Register, Grievance Log, Supplier Assessment, and more
- 📝 **ESAP** — Environmental & Social Action Plan with full tracking
- 🌍 **Trilingual** — English, Français, Português
- 📄 **Export** — PDF, Word (RTF), and CSV
- 💾 **Backup & Restore** — JSON import/export
- 📱 **Responsive** — works on mobile and desktop, PWA-ready

---

## Prerequisites

| Tool | Minimum version | Download |
|------|----------------|----------|
| Node.js | 20 | [nodejs.org](https://nodejs.org/) |
| pnpm | 9 | [pnpm.io](https://pnpm.io/) |

Install pnpm (if not already installed):

```bash
npm install -g pnpm
```

---

## Quick Start

```bash
git clone https://github.com/amanimchugh/ESMS.git
cd ESMS
pnpm install
pnpm run dev
```

Open **http://localhost:5173** in your browser.

---

## Available Scripts

Run these from the project root:

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start development server at http://localhost:5173 |
| `pnpm run build:app` | Build the app for production |
| `pnpm run preview:app` | Preview the production build locally |
| `pnpm run typecheck` | Type-check all workspace packages |

---

## Building for Production

```bash
pnpm run build:app
```

The compiled static files will be output to:

```
artifacts/esms-builder/dist/public/
```

Deploy the contents of that folder to any static hosting service.

---

## Deployment Options

### Vercel *(recommended — zero config)*

1. Go to [vercel.com](https://vercel.com) → **Add New Project** → import this repository
2. Set the following overrides:
   - **Root directory**: `artifacts/esms-builder`
   - **Build command**: `pnpm run build`
   - **Output directory**: `dist/public`
3. Click **Deploy** — no environment variables required

### Netlify

1. Go to [netlify.com](https://netlify.com) → **Add new site** → import this repository
2. Set:
   - **Base directory**: `artifacts/esms-builder`
   - **Build command**: `pnpm run build`
   - **Publish directory**: `dist/public`
3. Click **Deploy site** — no environment variables required

### GitHub Pages *(automated)*

The repository includes a GitHub Actions workflow at `.github/workflows/deploy.yml`.

To enable it:

1. Go to your repository on GitHub → **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. Push to `main` — the workflow builds and deploys automatically

The app will be live at: `https://<your-username>.github.io/ESMS/`

### Any Static Host (S3, Azure Blob, etc.)

Upload the entire contents of `artifacts/esms-builder/dist/public/` to your bucket/container and serve it as a static website.

---

## Project Structure

```
ESMS/
├── artifacts/
│   └── esms-builder/          # React + Vite single-page app
│       ├── src/
│       │   ├── App.tsx         # Main application (all components & logic)
│       │   ├── i18n/
│       │   │   ├── translations.js       # UI strings (EN / FR / PT)
│       │   │   └── guideTranslations.js  # Guidelines content (FR / PT)
│       │   └── index.css       # Responsive styles
│       ├── public/             # Static assets & PWA manifest
│       ├── index.html          # HTML entry point
│       └── vite.config.ts      # Vite build configuration
├── lib/                        # Shared workspace libraries
│   ├── api-client-react/       # Generated API hooks
│   ├── api-spec/               # OpenAPI specification
│   ├── api-zod/                # Generated Zod schemas
│   └── db/                     # Drizzle ORM + PostgreSQL (optional backend)
├── artifacts/api-server/       # Optional Express API server
├── package.json                # Root workspace config & scripts
└── pnpm-workspace.yaml         # pnpm workspace definition
```

> **Note:** The ESMS Builder is a fully client-side app. The `api-server` and `db` packages are included for future extensibility but are **not required** to run the builder.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 |
| Build tool | Vite |
| Language | TypeScript |
| Styling | Plain CSS |
| PDF export | jsPDF + html2canvas |
| Storage | Browser localStorage |
| Package manager | pnpm workspaces |

---

## License

MIT
