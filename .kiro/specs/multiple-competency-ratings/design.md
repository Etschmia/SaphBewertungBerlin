# Design Document

## Overview

Das Design transformiert das bestehende Einzelbewertungssystem in ein umfassendes Mehrfachbewertungssystem mit Zeitstempel-Tracking. Die Lösung erweitert die bestehende Datenstruktur, um Arrays von Zeitstempeln zu speichern, implementiert eine neue visuelle Darstellung mit unterschiedlichen Kreisdicken und fügt eine interaktive Detailansicht für die Bewertungshistorie hinzu.

## Architecture

### Data Model Changes

**Current Structure:**
```typescript
interface Student {
  id: string;
  name: string;
  assessments: Record<string, Rating>; // competencyId -> single Rating
}
```

**New Structure:**
```typescript
interface Student {
  id: string;
  name: string;
  assessments: Record<string, RatingEntry[]>; // competencyId -> array of RatingEntry
}

interface RatingEntry {
  rating: Rating;
  timestamp: number; // Unix timestamp in milliseconds
}
```

### Migration Strategy

Das System unterstützt sowohl das alte als auch das neue Datenformat:
- Beim Laden werden alte Daten (einzelne Rating-Werte) automatisch in das neue Format konvertiert
- Neue Bewertungen werden immer im neuen Array-Format gespeichert
- Rückwärtskompatibilität wird durch Typ-Guards und Konvertierungsfunktionen gewährleistet

## Components and Interfaces

### 1. Enhanced RatingControl Component

**Current Behavior:** Zeigt ausgewählte Option mit Ring-Indikator
**New Behavior:** 
- Zeigt mehrere Kreise mit unterschiedlichen Dicken basierend auf Häufigkeit
- Zeigt Anzahl-Badge neben jeder geklickten Option
- Öffnet Detailansicht beim Klick auf Anzahl-Badge

**Visual Indicators:**
- 1x geklickt: Dünner Kreis (border-width: 2px)
- 2x geklickt: Mittlerer Kreis (border-width: 4px) 
- 3x+ geklickt: Dicker Kreis (border-width: 6px)
- Anzahl-Badge: Kleine Zahl rechts neben dem Kreis

### 2. New RatingHistoryModal Component

**Purpose:** Zeigt detaillierte Bewertungshistorie für eine spezifische Option
**Features:**
- Tabelle mit Zeitstempeln im deutschen Format (DD.MM.YYYY HH:MM)
- Delete-Button für jeden Eintrag
- Close-Button zum Schließen
- Auto-Close bei Klick außerhalb der Modal

**Interface:**
```typescript
interface RatingHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: RatingEntry[];
  onDeleteEntry: (timestamp: number) => void;
  ratingOption: Rating;
}
```

### 3. Updated Assessment Data Flow

**New Event Handlers:**
```typescript
// Ersetzt handleAssessmentChange
const handleAssessmentAdd = (competencyId: string, rating: Rating) => void;
const handleAssessmentDelete = (competencyId: string, rating: Rating, timestamp: number) => void;
```

## Data Models

### Type Definitions

```typescript
// Erweiterte Typen
interface RatingEntry {
  rating: Rating;
  timestamp: number;
}

// Hilfsfunktionen für Datenkonvertierung
type LegacyAssessments = Record<string, Rating>;
type ModernAssessments = Record<string, RatingEntry[]>;

// Union Type für Kompatibilität während Migration
type AssessmentData = LegacyAssessments | ModernAssessments;
```

### Data Conversion Utilities

```typescript
// Konvertiert alte Daten in neues Format
function migrateLegacyAssessments(legacy: LegacyAssessments): ModernAssessments;

// Prüft ob Daten im alten Format vorliegen
function isLegacyFormat(data: AssessmentData): data is LegacyAssessments;

// Berechnet häufigste Bewertung für PDF Export
function getMostFrequentRating(entries: RatingEntry[]): Rating | null;
```

### Visual State Calculation

```typescript
// Berechnet visuelle Darstellung basierend auf Häufigkeit
interface RatingDisplayState {
  count: number;
  thickness: 'thin' | 'medium' | 'thick';
  showBadge: boolean;
}

function calculateDisplayState(entries: RatingEntry[], targetRating: Rating): RatingDisplayState;
```

## Error Handling

### Data Migration Errors
- **Problem:** Korrupte oder unvollständige Legacy-Daten
- **Solution:** Fallback auf leeres Array, Logging des Fehlers
- **User Experience:** Warnung anzeigen, aber App funktionsfähig halten

### Timestamp Validation
- **Problem:** Ungültige oder fehlende Zeitstempel
- **Solution:** Verwendung von `Date.now()` als Fallback
- **Validation:** Prüfung auf positive Zahlen und realistische Datumsbereiche

### Modal State Management
- **Problem:** Mehrere Modals gleichzeitig geöffnet
- **Solution:** Globaler Modal-State mit Stack-Management
- **Auto-Close:** Event-Listener für Klicks außerhalb der Modal

## Testing Strategy

### Unit Tests

**Data Migration:**
- Test für Konvertierung von Legacy-Format zu neuem Format
- Test für Behandlung von korrupten Daten
- Test für Rückwärtskompatibilität

**Rating Calculation:**
- Test für Häufigkeitsberechnung
- Test für visuelle Darstellungslogik
- Test für PDF-Export mit häufigster Bewertung

**Component Behavior:**
- Test für RatingControl mit mehrfachen Klicks
- Test für Modal-Öffnung und -Schließung
- Test für Delete-Funktionalität

### Integration Tests

**Data Persistence:**
- Test für Speichern und Laden von Mehrfachbewertungen
- Test für JSON Export/Import mit neuem Format
- Test für LocalStorage-Kompatibilität

**User Interactions:**
- Test für kompletten Bewertungsworkflow
- Test für Modal-Interaktionen
- Test für Auto-Close-Verhalten

### Visual Regression Tests

**UI Components:**
- Screenshots für verschiedene Bewertungshäufigkeiten
- Test für Kreis-Dicken-Darstellung
- Test für Badge-Positionierung

## Implementation Considerations

### Performance Optimizations
- **Memoization:** React.memo für RatingControl bei häufigen Updates
- **Lazy Loading:** Modal-Komponente nur bei Bedarf rendern
- **Efficient Updates:** Verwendung von useCallback für Event-Handler

### Accessibility
- **Keyboard Navigation:** Tab-Reihenfolge für neue interaktive Elemente
- **Screen Reader:** ARIA-Labels für Anzahl-Badges und Modal-Inhalte
- **Focus Management:** Fokus-Rückgabe nach Modal-Schließung

### Browser Compatibility
- **LocalStorage:** Graceful Degradation bei Storage-Limits
- **Date Formatting:** Verwendung von Intl.DateTimeFormat für deutsche Lokalisierung
- **Event Handling:** Polyfills für ältere Browser falls nötig

### Responsive Design
- **Modal Sizing:** Anpassung an verschiedene Bildschirmgrößen
- **Touch Targets:** Ausreichende Größe für mobile Geräte
- **Overflow Handling:** Scrollbare Tabelle bei vielen Einträgen