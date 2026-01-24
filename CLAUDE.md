# CLAUDE.md

This file provides guidance for Claude Code when working with this repository.

## Project Overview

**Zeugnis Assistent** is a German-language educational web application for teachers to manage and evaluate student assessments based on competency frameworks used in Berlin's "Schulanfangsphase" (school entry phase). It's a fully offline Progressive Web App (PWA) that stores all data locally in the browser with no backend.

## Tech Stack

- **Framework:** React 19.1.1 with TypeScript 5.8
- **Build Tool:** Vite 6.2
- **Styling:** Tailwind CSS 4.1 (via @tailwindcss/vite plugin)
- **Testing:** Vitest 3.2 with @testing-library/react
- **PDF Generation:** jsPDF (loaded via CDN in index.html)
- **Deployment:** Vercel (SPA configuration)

## Project Structure

```
├── components/         # React UI components (modals, controls, lists)
├── contexts/           # React Context (ClassContext for state management)
├── services/           # Business logic (classManager, pdfGenerator, updateService)
├── utils/              # Validation and helper utilities
├── data/               # Initial competency framework data
├── src/test/           # Vitest tests
├── public/             # PWA assets (manifest, service worker, icons)
├── App.tsx             # Root application component
├── index.tsx           # React entry point
├── types.ts            # TypeScript type definitions
└── tailwind.css        # Custom Tailwind styles
```

## Common Commands

```bash
npm run dev          # Start development server (localhost:5173)
npm run build        # Production build (outputs to dist/)
npm run preview      # Preview production build locally
npm test             # Run tests in watch mode
npm run test:run     # Run tests headless (CI)
npm run test:ui      # Open Vitest UI dashboard
```

## Key Architecture Patterns

### State Management
- `ClassContext.tsx` provides class and student data via React Context
- `useClass()` hook consumes context throughout the app
- `ClassManager` service handles all localStorage persistence

### Data Flow
```
App.tsx (ClassProvider wrapper)
  → useClass() hook
    → ClassContext (state from ClassManager)
      → Components
        → Event handlers → ClassManager methods
          → localStorage
```

### Data Storage
- **Key:** `zeugnis-assistent-multi-class` (multi-class format v3.0)
- **Legacy Key:** `zeugnis-assistent-state` (single-class, auto-migrated)
- Format auto-detection and migration on import

## Important Types (types.ts)

```typescript
Rating enum: NotTaught(0), Low(1), Partial(2), Proficient(3), Excellent(4)

Hierarchy: Subject → Category → Competency

Student: { id, name, assessments: Record<competencyId, RatingEntry[]> }

ClassData: { id, name, students, subjects, lastModified }

MultiClassStorage: { version, classes, currentClassId, lastModified }
```

## Development Guidelines

### Language
- All UI text is in German
- Code comments and variable names in English

### No Backend
- All data persists in localStorage only
- No API calls or server communication
- Privacy-focused: data never leaves the browser

### Multi-Class Support
- Recent feature supporting multiple classes of students
- Backward compatible with legacy single-class format
- Format detection and auto-migration handled by ClassManager

### PWA Features
- Service worker in `public/sw.js` (cache-first strategy)
- Manifest in `public/manifest.json`
- Install prompts via `updateService.ts`

## Testing

Tests are in `src/test/` using Vitest + Testing Library:
- `validation.test.ts` - Data validation utilities
- `dataMigration.test.ts` - Legacy format migration
- `pdfGenerator.test.ts` - PDF export
- `RatingControl.test.tsx` - Component tests
- `RatingHistoryModal.test.tsx` - Modal tests

Run `npm test` to run tests in watch mode.

## Deployment

- Hosted on Vercel with auto-deploy from main branch
- `vercel.json` configures SPA rewrites and security headers
- All routes rewrite to `/index.html` for client-side routing
