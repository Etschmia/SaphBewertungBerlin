
# Zeugnis Assistent

Eine webbasierte Anwendung zur Erfassung und Verwaltung von Schülerbewertungen basierend auf einem vordefinierten Kompetenzraster für die Schulanfangsphase.

## Über das Projekt

Der Zeugnis Assistent ist eine Single-Page-Application, die Lehrern dabei hilft, Schülerbewertungen strukturiert zu erfassen und zu verwalten. Die Anwendung basiert auf einem Kompetenzraster mit 12 Indikatoren für die Schulanfangsphase und ermöglicht eine detaillierte Bewertung in verschiedenen Fächern.

### Hauptfunktionen

- **Schülerverwaltung**: Hinzufügen, Auswählen und Löschen von Schülern
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
- **Build-Tool**: Vite
- **Styling**: Tailwind CSS (geplant, aktuell inline Styles)
- **PDF-Generierung**: jsPDF mit autoTable Plugin
- **Icons**: Eigene SVG-Komponenten

### Architektur
- **Zustandsverwaltung**: React useState/useEffect mit localStorage-Synchronisation
- **Komponenten-Struktur**: Modulare Komponenten für bessere Wartbarkeit
- **Datenmodell**: TypeScript-Interfaces für typsichere Entwicklung

## Installation und Ausführung

### Voraussetzungen
- Node.js (Version 16 oder höher)
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

## Implementierungsstand

### ✅ Vollständig implementiert
- Grundlegende App-Struktur und Layout
- Schülerverwaltung (Hinzufügen, Auswählen, Löschen)
- Kompetenzraster mit allen Fächern und Kategorien
- Bewertungssystem mit 5-stufiger Skala
- LocalStorage-Integration für Datenpersistierung
- JSON-Export und -Import
- PDF-Export mit strukturiertem Layout
- Bearbeitung von Kompetenztexten und Kategorienamen
- Hinzufügen neuer Kompetenzen

### 🔄 In Arbeit / Verbesserungen
- Tailwind CSS Integration (aktuell inline Styles)
- Responsive Design Optimierung
- Erweiterte PDF-Layout-Anpassungen
- Benutzerfreundlichkeits-Verbesserungen

### 📋 Geplante Features
- Backup/Restore-Funktionalität
- Druckoptimierung
- Erweiterte Filteroptionen
- Bulk-Operationen für Bewertungen

## Datenschutz und Sicherheit

- **Keine Server-Kommunikation**: Alle Daten bleiben lokal im Browser
- **Keine Benutzerregistrierung**: Direkte Nutzung ohne Anmeldung
- **Datenportabilität**: Vollständiger Export/Import über JSON-Dateien
- **Datenschutzkonform**: Keine Übertragung personenbezogener Daten

## Projektstruktur

```
├── components/          # React-Komponenten
│   ├── AssessmentForm.tsx
│   ├── CategorySection.tsx
│   ├── Icons.tsx
│   ├── RatingControl.tsx
│   ├── StudentList.tsx
│   └── SubjectAccordion.tsx
├── data/               # Initiale Datenstrukturen
│   └── initialData.ts
├── services/           # Hilfsfunktionen
│   └── pdfGenerator.ts
├── docs/              # Dokumentation
│   └── PLANUNG.md
├── App.tsx            # Hauptkomponente
├── types.ts           # TypeScript-Definitionen
└── index.tsx          # Einstiegspunkt
```
