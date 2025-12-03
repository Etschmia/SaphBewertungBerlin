# Design Document: Klassenmanagement

## Overview

Das Klassenmanagement-Feature erweitert den Bewertungs-Assistenten um die Möglichkeit, Schüler in benannte Klassen zu organisieren. Das Design priorisiert Abwärtskompatibilität mit bestehenden JSON-Dateien und minimiert Änderungen an der bestehenden Datenstruktur. Die Implementierung nutzt eine Wrapper-Struktur im LocalStorage, die mehrere Schülerlisten (Klassen) verwaltet, während das bestehende AppState-Format für einzelne Klassen unverändert bleibt.

## Architecture

### Schichtenmodell

```
┌─────────────────────────────────────────┐
│         UI Layer (React)                │
│  - ClassButton & ClassModal             │
│  - SaveDropdown & LoadDropdown          │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│      State Management Layer             │
│  - ClassContext (React Context)         │
│  - Current Class State                  │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│      Business Logic Layer               │
│  - ClassManager Service                 │
│  - Format Detection & Migration         │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│      Storage Layer                      │
│  - LocalStorage Wrapper                 │
│  - Multi-Class Storage Structure        │
└─────────────────────────────────────────┘
```

### Datenfluss

1. **Initialisierung**: App lädt Multi-Class-Struktur aus LocalStorage
2. **Klassenwechsel**: ClassManager lädt Schülerliste der gewählten Klasse
3. **Datenpersistierung**: Änderungen werden automatisch in aktuelle Klasse gespeichert
4. **Export/Import**: Format-Erkennung bestimmt Verarbeitungsweg

## Components and Interfaces

### 1. Datenstrukturen

#### Multi-Class Storage Format (neu)

```typescript
interface ClassData {
  id: string;                    // Eindeutige Klassen-ID
  name: string;                  // Anzeigename der Klasse
  students: Student[];           // Schülerliste dieser Klasse
  subjects: Subject[];           // Fächer-Konfiguration
  lastModified: number;          // Timestamp der letzten Änderung
}

interface MultiClassStorage {
  version: string;               // Format-Version (z.B. "3.0")
  classes: ClassData[];          // Array aller Klassen
  unassignedStudents: Student[]; // Schüler ohne Klassenzuordnung
  unassignedSubjects: Subject[]; // Fächer für unassigned
  currentClassId: string | null; // ID der aktuell aktiven Klasse
  lastModified: number;          // Timestamp der letzten Änderung
}
```

#### Legacy Format (bestehend, unverändert)

```typescript
interface AppState {
  students: Student[];
  subjects: Subject[];
}
```

#### Export Format für "Alle Klassen"

```typescript
interface AllClassesExport {
  version: string;               // "3.0"
  exportDate: string;            // ISO timestamp
  classes: ClassData[];
  unassignedStudents: Student[];
  unassignedSubjects: Subject[];
}
```

### 2. ClassManager Service

```typescript
class ClassManager {
  // Initialisierung und Migration
  initialize(): MultiClassStorage;
  migrateFromLegacy(appState: AppState): MultiClassStorage;
  
  // Klassenverwaltung
  createClass(name: string, students: Student[], subjects: Subject[]): ClassData;
  getClass(classId: string): ClassData | null;
  getAllClasses(): ClassData[];
  switchToClass(classId: string): void;
  deleteClass(classId: string): void;
  
  // Aktuelle Klasse
  getCurrentClass(): ClassData | null;
  getCurrentStudents(): Student[];
  updateCurrentClass(students: Student[], subjects: Subject[]): void;
  
  // Unassigned-Verwaltung
  getUnassignedStudents(): Student[];
  updateUnassignedStudents(students: Student[], subjects: Subject[]): void;
  switchToUnassigned(): void;
  
  // Persistierung
  save(): void;
  load(): MultiClassStorage;
  
  // Format-Erkennung
  detectFormat(data: any): 'legacy' | 'multi-class' | 'invalid';
  
  // Import/Export
  exportClass(classId: string | 'unassigned'): AppState;
  exportAllClasses(): AllClassesExport;
  importToClass(data: AppState, classId: string | 'unassigned'): void;
  importAllClasses(data: AllClassesExport): void;
}
```

### 3. React Context für Klassenverwaltung

```typescript
interface ClassContextValue {
  currentClassId: string | null;
  currentClassName: string;
  classes: ClassData[];
  hasClasses: boolean;
  
  // Actions
  createClass: (name: string, copyCurrentStudents: boolean) => void;
  switchToClass: (classId: string | null) => void;
  deleteClass: (classId: string) => void;
}

const ClassContext = React.createContext<ClassContextValue | null>(null);
```

### 4. UI-Komponenten

#### ClassButton Component

```typescript
interface ClassButtonProps {
  currentClassName: string;
  onClick: () => void;
}

// Zeigt Button mit aktuellem Klassennamen oder "Ohne Zuordnung"
```

#### ClassModal Component

```typescript
interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassData[];
  currentClassId: string | null;
  onCreateClass: (name: string, copyCurrentStudents: boolean) => void;
  onSwitchToClass: (classId: string | null) => void;
}

// Modal mit Optionen:
// - "Aktuelle Schülerliste als neue Klasse erfassen" + Eingabefeld
// - "Neue Klasse anlegen mit leerer Schülerliste" + Eingabefeld
// - Liste aller Klassen mit "Zur Klasse wechseln" Button
```

#### SaveDropdown Component

```typescript
interface SaveDropdownProps {
  classes: ClassData[];
  hasUnassigned: boolean;
  onSaveClass: (classId: string | 'unassigned' | 'all') => void;
}

// Dropdown-Menü mit Optionen:
// - Jede Klasse einzeln
// - "Ohne Klasse" (falls vorhanden)
// - "Alle Klassen"
```

#### LoadDropdown Component

```typescript
interface LoadDropdownProps {
  classes: ClassData[];
  onLoadToClass: (classId: string | 'unassigned' | 'all') => void;
}

// Dropdown-Menü mit Optionen:
// - Jede Klasse einzeln
// - "Ohne Klasse"
// - "Alle Klassen"
```

## Data Models

### Dateinamen-Konvention

```typescript
function generateFileName(
  classId: string | 'unassigned' | 'all',
  className?: string
): string {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
  
  let prefix: string;
  if (classId === 'all') {
    prefix = 'Alle_Klassen';
  } else if (classId === 'unassigned') {
    prefix = 'Ohne_Klasse';
  } else {
    // Ersetze Leerzeichen durch Unterstriche
    prefix = className?.replace(/\s+/g, '_') || 'Klasse';
  }
  
  return `BewertungSaph_${prefix}_${dateStr}_${timeStr}.json`;
}
```

### LocalStorage-Schlüssel

```typescript
const STORAGE_KEYS = {
  MULTI_CLASS: 'zeugnis-assistent-multi-class',  // Neue Multi-Class-Struktur
  LEGACY: 'zeugnis-assistent-state'              // Alter Schlüssel (für Migration)
};
```

### Format-Erkennung

```typescript
function detectFormat(data: any): 'legacy' | 'multi-class' | 'invalid' {
  if (!data || typeof data !== 'object') {
    return 'invalid';
  }
  
  // Multi-Class-Format hat 'classes' Array
  if (data.version && data.classes && Array.isArray(data.classes)) {
    return 'multi-class';
  }
  
  // Legacy-Format hat direkt 'students' und 'subjects'
  if (data.students && Array.isArray(data.students) &&
      data.subjects && Array.isArray(data.subjects)) {
    return 'legacy';
  }
  
  return 'invalid';
}
```

## Data Migration Strategy

### Migration von Legacy zu Multi-Class

```typescript
function migrateFromLegacy(legacyState: AppState): MultiClassStorage {
  return {
    version: '3.0',
    classes: [],
    unassignedStudents: legacyState.students,
    unassignedSubjects: legacyState.subjects,
    currentClassId: null,
    lastModified: Date.now()
  };
}
```

### Erste Initialisierung

1. Prüfe ob `STORAGE_KEYS.MULTI_CLASS` existiert
2. Falls ja: Lade Multi-Class-Struktur
3. Falls nein: Prüfe ob `STORAGE_KEYS.LEGACY` existiert
4. Falls Legacy existiert: Migriere zu Multi-Class und speichere
5. Falls nichts existiert: Erstelle leere Multi-Class-Struktur

### Import-Logik

```typescript
function handleImport(
  fileData: any,
  targetClassId: string | 'unassigned' | 'all'
): void {
  const format = detectFormat(fileData);
  
  if (format === 'invalid') {
    throw new Error('Ungültiges Dateiformat');
  }
  
  if (format === 'multi-class' && targetClassId !== 'all') {
    // Warnung anzeigen
    showFormatMismatchWarning(targetClassId, fileData);
  } else if (format === 'multi-class' && targetClassId === 'all') {
    // Alle Klassen importieren
    importAllClasses(fileData);
  } else if (format === 'legacy') {
    // Legacy-Daten in Zielklasse importieren
    importToClass(fileData, targetClassId);
  }
}
```

## Error Handling

### Validierung beim Klassenanlegen

```typescript
function validateClassName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim() === '') {
    return { valid: false, error: 'Klassenname darf nicht leer sein' };
  }
  
  if (name.length > 50) {
    return { valid: false, error: 'Klassenname zu lang (max. 50 Zeichen)' };
  }
  
  // Prüfe auf Duplikate
  const existingClasses = classManager.getAllClasses();
  if (existingClasses.some(c => c.name === name.trim())) {
    return { valid: false, error: 'Eine Klasse mit diesem Namen existiert bereits' };
  }
  
  return { valid: true };
}
```

### Format-Mismatch-Warnung

```typescript
function showFormatMismatchWarning(
  selectedTarget: string,
  fileData: AllClassesExport
): Promise<boolean> {
  const targetName = selectedTarget === 'unassigned' 
    ? 'Ohne Klasse' 
    : classManager.getClass(selectedTarget)?.name || 'unbekannte Klasse';
  
  const message = `Sie haben "${targetName}" zum Laden ausgewählt, aber die Datei enthält Daten für alle Klassen.\n\n` +
    `Wenn Sie fortfahren, wird Ihr gesamter LocalStorage überschrieben.\n\n` +
    `Möchten Sie fortfahren?`;
  
  return window.confirm(message);
}
```

### LocalStorage-Fehlerbehandlung

```typescript
function safeLocalStorageSave(data: MultiClassStorage): void {
  try {
    const jsonString = JSON.stringify(data);
    
    // Prüfe Größe (LocalStorage-Limit ist typischerweise 5-10MB)
    if (jsonString.length > 5 * 1024 * 1024) {
      throw new Error('Daten zu groß für LocalStorage (max. 5MB)');
    }
    
    localStorage.setItem(STORAGE_KEYS.MULTI_CLASS, jsonString);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      alert('LocalStorage-Speicher voll. Bitte exportieren Sie Ihre Daten und löschen Sie alte Klassen.');
    } else {
      console.error('Fehler beim Speichern:', error);
      alert('Fehler beim Speichern der Daten. Bitte exportieren Sie Ihre Daten als Backup.');
    }
  }
}
```

## Testing Strategy

### Unit Tests

Die folgenden Komponenten benötigen Unit-Tests:

1. **ClassManager Service**
   - Format-Erkennung (legacy vs. multi-class)
   - Migration von Legacy zu Multi-Class
   - Klassenerstellung und -verwaltung
   - Import/Export-Logik

2. **Dateinamen-Generierung**
   - Leerzeichen-Ersetzung
   - Korrekte Präfixe für verschiedene Szenarien

3. **Validierung**
   - Klassenname-Validierung
   - Duplikat-Erkennung

4. **UI-Komponenten**
   - ClassButton zeigt korrekten Namen
   - ClassModal zeigt alle Optionen
   - Dropdowns zeigen korrekte Einträge

### Integration Tests

1. **Vollständiger Workflow**
   - Klasse anlegen → Schüler hinzufügen → Speichern → Laden
   - Zwischen Klassen wechseln
   - Legacy-Datei importieren

2. **Migration-Szenarien**
   - Erste Nutzung mit bestehenden Legacy-Daten
   - Import von Legacy-Datei in neue Klasse

3. **Edge Cases**
   - Leere Klassen
   - Sehr viele Klassen (Performance)
   - LocalStorage-Limit erreicht

### Manuelle Tests

1. **Abwärtskompatibilität**
   - Alte JSON-Dateien laden
   - Zwischen alten und neuen Formaten wechseln

2. **Benutzerfreundlichkeit**
   - Intuitive Navigation
   - Verständliche Fehlermeldungen
   - Warnung bei Format-Mismatch

## Implementation Notes

### App.tsx Änderungen

1. Wrap App mit ClassContext.Provider
2. Ersetze direkten LocalStorage-Zugriff durch ClassManager
3. Füge ClassButton über "Schüler hinzufügen" hinzu
4. Ersetze Speichern/Laden-Buttons durch Dropdowns (wenn Klassen existieren)

### Schrittweise Migration

1. **Phase 1**: ClassManager Service implementieren
2. **Phase 2**: UI-Komponenten erstellen
3. **Phase 3**: App.tsx integrieren
4. **Phase 4**: Export/Import-Logik erweitern
5. **Phase 5**: Dokumentation aktualisieren

### Performance-Überlegungen

- Lazy Loading: Nur aktuelle Klasse im State halten
- Debouncing: LocalStorage-Speicherung verzögern
- Memoization: Klassenlist-Rendering optimieren

### Accessibility

- Keyboard-Navigation für Dropdowns
- ARIA-Labels für Buttons und Modals
- Screen-Reader-freundliche Beschreibungen

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

Nach der Prework-Analyse wurden folgende Redundanzen identifiziert und eliminiert:

- **Dropdown-Anzeige-Properties (4.1, 5.1)**: Beide testen dasselbe Verhalten (Button wird zu Dropdown wenn Klassen existieren). Kombiniert in Property 5.
- **Dropdown-Einträge-Properties (4.2, 5.2)**: Beide testen dass alle Klassen im Dropdown erscheinen. Kombiniert in Property 6.
- **LocalStorage-Persistierung (3.1, 3.2, 3.3)**: Alle drei testen Persistierung bei verschiedenen Operationen. Kombiniert in Property 3 als umfassende Persistierungs-Eigenschaft.
- **Format-Erkennung und Legacy-Laden (7.1, 7.4)**: Format-Erkennung ist Voraussetzung für erfolgreiches Laden. Kombiniert in Property 11.

### Properties

**Property 1: Klassenname-Anzeige ohne Auswahl**
*For any* App-Zustand ohne ausgewählte Klasse, der Button "Klasse" sollte den Text "Ohne Zuordnung" rechts daneben anzeigen
**Validates: Requirements 1.2**

**Property 2: Klassenname-Anzeige mit Auswahl**
*For any* ausgewählte Klasse mit einem Namen, der Button "Klasse" sollte den Namen der Klasse rechts daneben anzeigen
**Validates: Requirements 1.3**

**Property 3: LocalStorage-Persistierung**
*For any* Operation (Klasse anlegen, Klassenwechsel, Schüler hinzufügen/löschen), die Änderungen sollten im LocalStorage persistiert werden und nach einem Neustart verfügbar sein
**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

**Property 4: Klassenmodal öffnet**
*For any* App-Zustand, wenn der Benutzer auf den Button "Klasse" klickt, sollte das Klassenmodal geöffnet werden
**Validates: Requirements 2.1**

**Property 5: Dropdown-Umwandlung bei Klassen**
*For any* App-Zustand mit mindestens einer Klasse im LocalStorage, die Buttons "Speichern" und "Laden" sollten als Dropdown-Menüs dargestellt werden
**Validates: Requirements 4.1, 5.1**

**Property 6: Dropdown zeigt alle Klassen**
*For any* Menge von Klassen im LocalStorage, das Speichern-Dropdown und das Laden-Dropdown sollten für jede Klasse eine Option mit dem Klassennamen anzeigen
**Validates: Requirements 2.4, 4.2, 5.2**

**Property 7: Unassigned-Option bei vorhandenen Schülern**
*For any* App-Zustand mit Schülern ohne Klassenzuordnung, das Speichern-Dropdown sollte die Option "Ohne Klasse" anzeigen
**Validates: Requirements 4.3**

**Property 8: Dropdown-Reihenfolge**
*For any* geöffnetes Speichern-Dropdown oder Laden-Dropdown, die Option "Alle Klassen" sollte als letzter Eintrag erscheinen
**Validates: Requirements 4.4, 5.4**

**Property 9: Leerzeichen-Ersetzung in Dateinamen**
*For any* Klassenname mit Leerzeichen, beim Speichern sollten die Leerzeichen im Dateinamen durch Unterstriche ersetzt werden
**Validates: Requirements 4.8**

**Property 10: Klassenwechsel lädt korrekte Daten**
*For any* Klasse mit gespeicherter Schülerliste, wenn der Benutzer zu dieser Klasse wechselt, sollte die entsprechende Schülerliste aus dem LocalStorage geladen und angezeigt werden
**Validates: Requirements 2.5**

**Property 11: Format-Erkennung und Legacy-Kompatibilität**
*For any* JSON-Datei im Legacy-Format, das System sollte das Format automatisch erkennen und die Datei erfolgreich laden können
**Validates: Requirements 7.1, 7.4**

**Property 12: Legacy-Import in Klasse**
*For any* JSON-Datei im Legacy-Format und ausgewählte Zielklasse, die Schüler sollten der ausgewählten Klasse zugeordnet werden
**Validates: Requirements 5.6, 7.2**

**Property 13: Format-Mismatch-Warnung**
*For any* JSON-Datei im Klassen-Format, wenn eine einzelne Klasse oder "Ohne Klasse" als Ladeziel ausgewählt war, sollte ein Warnhinweis mit der ursprünglichen Auswahl und dem Dateityp angezeigt werden
**Validates: Requirements 6.1, 6.2**

**Property 14: Bestätigung überschreibt LocalStorage**
*For any* Format-Mismatch-Warnung, wenn der Benutzer "Bestätigen" wählt, sollte der gesamte LocalStorage mit den Daten aus der Datei überschrieben werden
**Validates: Requirements 6.4**

**Property 15: Abbruch erhält Zustand (Invariante)**
*For any* Format-Mismatch-Warnung, wenn der Benutzer "Abbrechen" wählt, sollte der LocalStorage-Zustand unverändert bleiben (keine Daten sollten geändert werden)
**Validates: Requirements 6.5**

**Property 16: Datei-Upload-Dialog öffnet**
*For any* ausgewählte Ladeoption im Laden-Dropdown, ein Datei-Upload-Dialog sollte geöffnet werden
**Validates: Requirements 5.5**

**Property 17: Legacy-Format-Export für einzelne Klassen**
*For any* einzelne Klasse, die zum Speichern ausgewählt wird, die exportierte JSON-Datei sollte im Legacy-Format (AppState-Struktur) vorliegen und den Klassennamen im Dateinamen enthalten
**Validates: Requirements 4.5**

## Documentation Updates

### README.md

Neuer Abschnitt "Klassenverwaltung":
- Erklärung des Features
- Schritt-für-Schritt-Anleitung
- Hinweis auf Abwärtskompatibilität

### UsageModal.tsx

Neue Sektion im Benutzerhinweise-Modal:
- Wie man Klassen anlegt
- Wie man zwischen Klassen wechselt
- Unterschied zwischen klassenweisem und vollständigem Export

### docs/class-management-technical.md

Technische Dokumentation:
- Datenstrukturen im Detail
- LocalStorage-Schema
- Migration-Strategie
- API-Referenz für ClassManager
