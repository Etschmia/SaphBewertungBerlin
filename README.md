
# Bewertungs‑Assistent

Eine webbasierte Anwendung zur Erfassung und Verwaltung von Schülerbewertungen basierend auf einem vordefinierten Kompetenzraster für die Schulanfangsphase.

## Über das Projekt

Der Bewertungs‑Assistent ist eine Single-Page-Application, die Lehrkräften hilft, Schülerbewertungen strukturiert zu erfassen und zu verwalten. Die Anwendung basiert auf einem Kompetenzraster mit 12 Indikatoren für die Schulanfangsphase und ermöglicht eine detaillierte Bewertung in verschiedenen Fächern.

### Hauptfunktionen

- **Klassenverwaltung**: Organisation von Schülern in benannte Klassen mit einfachem Wechsel
- **Schülerverwaltung**: Hinzufügen, Auswählen, Umbenennen (Doppelklick auf den Namen) und Löschen von Schülern
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

## Klassenverwaltung

Die Klassenverwaltung ermöglicht es Lehrkräften, Schüler in benannte Klassen zu organisieren und zwischen verschiedenen Klassen zu wechseln.

### Klassen anlegen

1. Klicken Sie auf den Button **"Klasse"** oberhalb der Schülerliste
2. Im Klassenmodal haben Sie zwei Optionen:
   - **"Aktuelle Schülerliste als neue Klasse erfassen"**: Speichert die aktuell angezeigte Schülerliste unter einem neuen Klassennamen
   - **"Neue Klasse anlegen mit leerer Schülerliste"**: Erstellt eine neue, leere Klasse

### Zwischen Klassen wechseln

1. Klicken Sie auf den Button **"Klasse"**
2. Wählen Sie aus der Liste der vorhandenen Klassen die gewünschte Klasse aus
3. Die Schülerliste wird automatisch aktualisiert

### Speichern und Laden

Sobald Klassen angelegt wurden, werden die Buttons "Speichern" und "Laden" zu Dropdown-Menüs erweitert:

**Speichern-Optionen:**
- **Einzelne Klasse**: Exportiert nur die Schüler dieser Klasse (Legacy-Format, kompatibel mit älteren Versionen)
- **"Ohne Klasse"**: Exportiert Schüler ohne Klassenzuordnung
- **"Alle Klassen"**: Exportiert alle Klassen in einer Datei (Klassen-Format)

**Laden-Optionen:**
- **In einzelne Klasse laden**: Importiert Schüler in die ausgewählte Klasse
- **"Alle Klassen"**: Importiert eine vollständige Klassendatei

### Abwärtskompatibilität

Das System ist vollständig abwärtskompatibel mit bestehenden JSON-Dateien:

- **Alte JSON-Dateien** (ohne Klasseninformationen) können weiterhin geladen werden
- Beim Import in eine Klasse werden die Schüler automatisch der ausgewählten Klasse zugeordnet
- Beim Export einzelner Klassen wird das Legacy-Format verwendet, sodass die Dateien auch mit älteren Versionen der Anwendung kompatibel sind
- Das System erkennt automatisch, ob eine Datei im Legacy-Format oder im neuen Klassen-Format vorliegt

### Hinweis bei Format-Unterschieden

Wenn Sie versuchen, eine Datei mit allen Klassen in eine einzelne Klasse zu laden, zeigt das System eine Warnung an. Sie können dann entscheiden, ob Sie den gesamten Datenbestand überschreiben oder den Vorgang abbrechen möchten.

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
- **Klassenverwaltung** (Klassen anlegen, wechseln, klassenweiser Export/Import)
- Schülerverwaltung (Hinzufügen, Auswählen, Umbenennen per Doppelklick, Löschen)
- Kompetenzraster mit allen Fächern und Kategorien
- Bewertungssystem mit 5-stufiger Skala
- LocalStorage-Integration für Datenpersistierung
- JSON-Export und -Import (inkl. Migration/Validierung, Abwärtskompatibilität)
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
- Klassen löschen und umbenennen

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
│   ├── ClassButton.tsx        # Klassenauswahl-Button
│   ├── ClassModal.tsx         # Klassenverwaltungs-Modal
│   ├── ErrorBoundary.tsx
│   ├── ExtrasDropdown.tsx
│   ├── Icons.tsx
│   ├── LoadDropdown.tsx       # Laden-Dropdown mit Klassenoptionen
│   ├── RatingControl.tsx
│   ├── RatingHistoryModal.tsx
│   ├── SaveDropdown.tsx       # Speichern-Dropdown mit Klassenoptionen
│   ├── StudentList.tsx
│   ├── SubjectAccordion.tsx
│   ├── ThemeSelector.tsx
│   └── UpdateInfoModal.tsx
├── contexts/
│   └── ClassContext.tsx       # React Context für Klassenverwaltung
├── data/
│   └── initialData.ts
├── services/
│   ├── classManager.ts        # Klassenverwaltungs-Service
│   ├── pdfGenerator.ts
│   └── updateService.ts
├── utils/
│   ├── classValidation.ts     # Validierung für Klassennamen
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
