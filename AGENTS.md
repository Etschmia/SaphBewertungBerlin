# AGENTS

Project: Bewertungs-Assistent, a SPA to capture/manage primary school assessments via a 12-indicator competency grid; data stays in-browser (localStorage).

Tech stack: React 19 + TypeScript; Vite 6; Tailwind CSS 4 (@tailwindcss/vite); jsPDF + autoTable via CDN in index.html; custom SVG icons; PWA (manifest, service worker, install prompt/update check); tests with Vitest + Testing Library + jsdom.

Key features: student add/select/delete; 5-level competency ratings across Deutsch/Mathematik/Sachunterricht/Kunst/Musik/Sport; JSON export/import with validation/migration; PDF export of per-student sheets; editable competency texts/categories and adding new ones; rating history; dark/light theme persistence; local error boundary; responsive/PDF layout/UX still improving; planned print optimization, filters, bulk ops.

Commands:
- npm install
- npm run dev (http://localhost:5173)
- npm run build && npm run preview
- npm test | npm run test:run | npm run test:ui

Notable files/dirs: components/* (UI), data/initialData.ts, services/pdfGenerator.ts and services/updateService.ts, utils/updateManager.ts and utils/validation.ts, public/manifest.json + sw.js + icons, src/test (tests + setup), App.tsx, index.tsx, tailwind.css, vite.config.ts, vitest.config.ts.

Notes: No server communication or auth; full data portability via JSON; PDF libs currently pulled from CDN—install locally if offline build is needed.
