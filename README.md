
# Bewertungs‑Assistent

Eine webbasierte Anwendung zur Erfassung und Verwaltung von Schülerbewertungen basierend auf einem vordefinierten Kompetenzraster für die Schulanfangsphase.

## Über das Projekt

Der Bewertungs‑Assistent ist eine Single-Page-Application, die Lehrkräften hilft, Schülerbewertungen strukturiert zu erfassen und zu verwalten. Die Anwendung basiert auf einem Kompetenzraster mit 12 Indikatoren für die Schulanfangsphase und ermöglicht eine detaillierte Bewertung in verschiedenen Fächern.

### Hauptfunktionen

- **Schülerverwaltung**: Hinzufügen, Auswählen und Löschen von Schülern
- **Klassenverwaltung**: Organisieren von Schülern in Klassen
- **Kompetenzbasierte Bewertung**: Bewertung nach 5-stufiger Skala (nicht vermittelt, gering ausgeprägt, teilweise ausgeprägt, ausgeprägt, sehr ausgeprägt)
- **Fächerübergreifend**: Unterstützung für Deutsch, Mathematik, Sachunterricht, Kunst, Musik und Sport
- **Datenexport/-import**: Vollständiger Export/Import des Anwendungszustands als JSON
- **PDF-Export**: Generierung individueller Bewertungsbögen als PDF
- **Lokale Datenhaltung**: Alle Daten werden ausschließlich im Browser gespeichert (localStorage)
- **Anpassbare Struktur**: Bearbeitung von Kompetenztexten und Hinzufügen neuer Kompetenzen

### Fächer und Kompetenzbereiche

**Deutsch:**
- Sprechen und Zuhören
- Schreiben  
- Lesen
- Auseinandersetzung mit Texten und anderen Medien
- Sprache nutzen und Sprachgebrauch untersuchen

**Mathematik:**
- Zahlen und Operationen
- Größen und Messen
- Raum und Form
- Gleichungen und Funktionen
- Daten und Zufall

**Sachunterricht:**
- Erkennen
- Kommunizieren
- Urteilen
- Handeln

**Kunst:**
- Wahrnehmen
- Gestalten
- Reflektieren

**Musik:**
- Wahrnehmen und Deuten
- Gestalten und Aufführen
- Reflektieren

**Sport:**
- Bewegen und Handeln
- Interagieren

## Technische Umsetzung

### Technologie-Stack
- **Frontend**: React 19 mit TypeScript
- **Build-Tool**: Vite 6
- **Styling**: Tailwind CSS 4 (mit @tailwindcss/vite)
- **PDF-Generierung**: jsPDF mit autoTable Plugin (per CDN in `index.html` eingebunden)
- **Icons**: Eigene SVG-Komponenten
- **Tests**: Vitest, Testing Library, jsdom
- **PWA**: Manifest, Service Worker, Install‑Prompt, Update‑Check

### Architektur
- **Zustandsverwaltung**: React useState/useEffect mit localStorage-Synchronisation
- **Komponenten-Struktur**: Modulare Komponenten für bessere Wartbarkeit
- **Datenmodell**: TypeScript-Interfaces für typsichere Entwicklung

## Installation und Ausführung

### Voraussetzungen
- Node.js (Version \u2265 18, empfohlen: 20 LTS)
- npm oder yarn

### Lokale Entwicklung

1. Repository klonen und Abhängigkeiten installieren:
   ```bash
   npm install
   ```

2. Entwicklungsserver starten:
   ```bash
   npm run dev
   ```

3. Anwendung im Browser öffnen: `http://localhost:5173`

### Produktions-Build

```bash
npm run build
npm run preview
```

### Tests

```bash
npm test          # Watch-Modus
npm run test:run  # Headless/CI
npm run test:ui   # Vitest UI
```

## Implementierungsstand

### ✅ Vollständig implementiert
- Grundlegende App-Struktur und Layout
- Schülerverwaltung (Hinzufügen, Auswählen, Löschen)
- Klassenverwaltung (Erstellen, Wechseln, Speichern/Laden von Klassen)
- Kompetenzraster mit allen Fächern und Kategorien
- Bewertungssystem mit 5-stufiger Skala
- LocalStorage-Integration für Datenpersistierung
- JSON-Export und -Import (inkl. Migration/Validierung)
- PDF-Export mit strukturiertem Layout
- Bearbeitung von Kompetenztexten und Kategorienamen
- Hinzufügen neuer Kompetenzen
- Dark/Light-Theme mit Persistenz
- PWA-Funktionalität (Manifest, Service Worker, Install‑Prompt, Update‑Check)
- Fehlerbehandlung über ErrorBoundary
- Bewertungsverlauf mit mehreren Einträgen pro Kompetenz

### 🔄 In Arbeit / Verbesserungen
- Responsive Design Optimierung
- Erweiterte PDF-Layout-Anpassungen
- Benutzerfreundlichkeits-Verbesserungen

### 📋 Geplante Features
- Druckoptimierung
- Erweiterte Filteroptionen
- Bulk-Operationen für Bewertungen

### Hinweise
- PDF-Erzeugung: jsPDF und das autoTable‑Plugin werden per CDN in `index.html` geladen. Für vollständig offline nutzbare Builds können die Bibliotheken auch lokal installiert und importiert werden.

## Datenschutz und Sicherheit

- **Keine Server-Kommunikation**: Alle Daten bleiben lokal im Browser
- **Keine Benutzerregistrierung**: Direkte Nutzung ohne Anmeldung
- **Datenportabilität**: Vollständiger Export/Import über JSON-Dateien
- **Datenschutzkonform**: Keine Übertragung personenbezogener Daten

## Projektstruktur

```
├── components/            # React-Komponenten
│   ├── AboutModal.tsx
│   ├── AssessmentForm.tsx
│   ├── CategorySection.tsx
│   ├── ErrorBoundary.tsx
│   ├── ExtrasDropdown.tsx
│   ├── Icons.tsx
│   ├── RatingControl.tsx
│   ├── RatingHistoryModal.tsx
│   ├── StudentList.tsx
│   ├── SubjectAccordion.tsx
│   ├── ThemeSelector.tsx
│   └── UpdateInfoModal.tsx
├── data/
│   └── initialData.ts
├── services/
│   ├── pdfGenerator.ts
│   └── updateService.ts
├── utils/
│   ├── updateManager.ts
│   └── validation.ts
├── public/
│   ├── manifest.json
│   ├── sw.js
│   ├── icon-192.png
│   └── icon-512.png
├── src/test/
│   ├── *.test.ts(x)
│   └── setup.ts
├── App.tsx
├── index.tsx
├── tailwind.css
├── vite.config.ts
└── vitest.config.ts
```
