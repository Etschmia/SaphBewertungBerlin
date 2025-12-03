# Technische Dokumentation: Klassenmanagement

Diese Dokumentation beschreibt die technische Implementierung des Klassenmanagement-Features im Bewertungs-Assistenten.

## Inhaltsverzeichnis

1. [Übersicht](#übersicht)
2. [Datenstrukturen](#datenstrukturen)
3. [LocalStorage-Schema](#localstorage-schema)
4. [Migration-Strategie](#migration-strategie)
5. [ClassManager API](#classmanager-api)
6. [Import/Export-Beispiele](#importexport-beispiele)
7. [Abwärtskompatibilität](#abwärtskompatibilität)

---

## Übersicht

Das Klassenmanagement ermöglicht die Organisation von Schülern in benannte Klassen. Die Implementierung nutzt eine Wrapper-Struktur im LocalStorage, die mehrere Schülerlisten (Klassen) verwaltet, während das bestehende AppState-Format für einzelne Klassen unverändert bleibt.

### Architektur

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

---

## Datenstrukturen

### Basis-Typen

Die folgenden Basis-Typen werden für Schüler und Bewertungen verwendet:

```typescript
// Bewertungsstufen
enum Rating {
  NotTaught = 0,  // Nicht vermittelt
  Low = 1,        // Niedrig
  Partial = 2,    // Teilweise
  Proficient = 3, // Kompetent
  Excellent = 4,  // Ausgezeichnet
}

// Einzelner Bewertungseintrag mit Zeitstempel
interface RatingEntry {
  rating: Rating;
  timestamp: number; // Unix timestamp in Millisekunden
}

// Kompetenz
interface Competency {
  id: string;
  text: string;
}

// Kategorie innerhalb eines Faches
interface Category {
  id: string;
  name: string;
  competencies: Competency[];
}

// Schulfach
interface Subject {
  id: string;
  name: string;
  categories: Category[];
}

// Schüler
interface Student {
  id: string;
  name: string;
  assessments: Record<string, RatingEntry[]>; // key: competency.id
}
```

### Klassen-Datenstrukturen

#### ClassData

Repräsentiert eine einzelne Klasse mit allen zugehörigen Daten:

```typescript
interface ClassData {
  id: string;           // Eindeutige Klassen-ID (z.B. "class-1699876543210-abc123def")
  name: string;         // Anzeigename der Klasse (z.B. "Klasse 1a")
  students: Student[];  // Schülerliste dieser Klasse
  subjects: Subject[];  // Fächer-Konfiguration
  lastModified: number; // Unix timestamp der letzten Änderung
}
```

#### MultiClassStorage

Die Hauptstruktur für die Speicherung aller Klassen im LocalStorage:

```typescript
interface MultiClassStorage {
  version: string;               // Format-Version ("3.0")
  classes: ClassData[];          // Array aller Klassen
  unassignedStudents: Student[]; // Schüler ohne Klassenzuordnung
  unassignedSubjects: Subject[]; // Fächer für unassigned
  currentClassId: string | null; // ID der aktuell aktiven Klasse
  lastModified: number;          // Unix timestamp der letzten Änderung
}
```

#### AllClassesExport

Format für den Export aller Klassen:

```typescript
interface AllClassesExport {
  version: string;               // "3.0"
  exportDate: string;            // ISO timestamp (z.B. "2024-01-15T10:30:00.000Z")
  classes: ClassData[];
  unassignedStudents: Student[];
  unassignedSubjects: Subject[];
}
```

### Legacy-Format (AppState)

Das ursprüngliche Format ohne Klasseninformationen:

```typescript
interface AppState {
  students: Student[];
  subjects: Subject[];
}
```

### Format-Typen

```typescript
type DataFormat = 'legacy' | 'multi-class' | 'invalid';
```

---

## LocalStorage-Schema

### Schlüssel

```typescript
const STORAGE_KEYS = {
  MULTI_CLASS: 'zeugnis-assistent-multi-class',  // Neue Multi-Class-Struktur
  LEGACY: 'zeugnis-assistent-state'              // Alter Schlüssel (für Migration)
} as const;
```

### Speicherstruktur

Der LocalStorage enthält unter dem Schlüssel `zeugnis-assistent-multi-class` ein JSON-Objekt mit folgender Struktur:

```json
{
  "version": "3.0",
  "classes": [
    {
      "id": "class-1699876543210-abc123def",
      "name": "Klasse 1a",
      "students": [
        {
          "id": "student-1",
          "name": "Max Mustermann",
          "assessments": {
            "comp-1": [
              { "rating": 3, "timestamp": 1699876543210 }
            ]
          }
        }
      ],
      "subjects": [...],
      "lastModified": 1699876543210
    }
  ],
  "unassignedStudents": [],
  "unassignedSubjects": [...],
  "currentClassId": "class-1699876543210-abc123def",
  "lastModified": 1699876543210
}
```

### Größenbeschränkungen

- LocalStorage-Limit: typischerweise 5-10 MB
- Die Implementierung prüft vor dem Speichern, ob die Daten 5 MB überschreiten
- Bei Überschreitung wird ein Fehler ausgelöst mit der Empfehlung, Daten zu exportieren

---

## Migration-Strategie

### Automatische Migration beim Start

Der ClassManager führt beim Initialisieren automatisch eine Migration durch:

1. **Prüfe Multi-Class-Storage**: Existiert `zeugnis-assistent-multi-class`?
   - Ja → Lade und validiere die Daten
   - Nein → Weiter zu Schritt 2

2. **Prüfe Legacy-Storage**: Existiert `zeugnis-assistent-state`?
   - Ja → Migriere zu Multi-Class-Format
   - Nein → Erstelle leere Struktur

3. **Speichere migrierte Daten** unter dem neuen Schlüssel

### Migration-Funktion

```typescript
function migrateFromLegacy(legacyState: AppState): MultiClassStorage {
  return {
    version: '3.0',
    classes: [],
    unassignedStudents: legacyState.students || [],
    unassignedSubjects: legacyState.subjects || initialSubjects,
    currentClassId: null,
    lastModified: Date.now(),
  };
}
```

### Validierung und Reparatur

Nach dem Laden werden die Daten validiert und bei Bedarf repariert:

```typescript
private validateAndRepairStorage(storage: MultiClassStorage): MultiClassStorage {
  return {
    version: storage.version || '3.0',
    classes: Array.isArray(storage.classes) ? storage.classes : [],
    unassignedStudents: Array.isArray(storage.unassignedStudents) 
      ? storage.unassignedStudents : [],
    unassignedSubjects: Array.isArray(storage.unassignedSubjects) 
      ? storage.unassignedSubjects : initialSubjects,
    currentClassId: storage.currentClassId ?? null,
    lastModified: storage.lastModified || Date.now(),
  };
}
```

---

## ClassManager API

### Initialisierung

```typescript
import { getClassManager, ClassManager } from './services/classManager';

// Singleton-Instanz abrufen
const classManager = getClassManager();

// Oder neue Instanz erstellen
const manager = new ClassManager();
```

### Klassenverwaltung

#### Klasse erstellen

```typescript
createClass(name: string, students: Student[], subjects: Subject[]): ClassData
```

Erstellt eine neue Klasse mit den angegebenen Daten.

**Beispiel:**
```typescript
const newClass = classManager.createClass(
  'Klasse 2b',
  [], // leere Schülerliste
  initialSubjects
);
console.log(newClass.id); // "class-1699876543210-xyz789"
```

#### Klasse abrufen

```typescript
getClass(classId: string): ClassData | null
```

Gibt die Klasse mit der angegebenen ID zurück oder `null`.

#### Alle Klassen abrufen

```typescript
getAllClasses(): ClassData[]
```

Gibt ein Array aller Klassen zurück.

#### Zu Klasse wechseln

```typescript
switchToClass(classId: string): void
```

Wechselt zur angegebenen Klasse. Wirft einen Fehler, wenn die Klasse nicht existiert.

**Beispiel:**
```typescript
try {
  classManager.switchToClass('class-123');
} catch (error) {
  console.error('Klasse nicht gefunden');
}
```

#### Klasse löschen

```typescript
deleteClass(classId: string): void
```

Löscht die Klasse mit der angegebenen ID. Wenn die gelöschte Klasse die aktuelle war, wird zu "Ohne Zuordnung" gewechselt.

### Aktuelle Klasse

#### Aktuelle Klasse abrufen

```typescript
getCurrentClass(): ClassData | null
getCurrentClassId(): string | null
```

#### Aktuelle Schüler/Fächer abrufen

```typescript
getCurrentStudents(): Student[]
getCurrentSubjects(): Subject[]
```

Gibt die Schüler/Fächer der aktuellen Klasse zurück, oder die unzugeordneten wenn keine Klasse ausgewählt ist.

#### Aktuelle Klasse aktualisieren

```typescript
updateCurrentClass(students: Student[], subjects: Subject[]): void
```

Aktualisiert die Schüler und Fächer der aktuellen Klasse und speichert automatisch.

### Unzugeordnete Schüler

#### Unzugeordnete Schüler abrufen

```typescript
getUnassignedStudents(): Student[]
getUnassignedSubjects(): Subject[]
```

#### Unzugeordnete Schüler aktualisieren

```typescript
updateUnassignedStudents(students: Student[], subjects: Subject[]): void
```

#### Zu "Ohne Zuordnung" wechseln

```typescript
switchToUnassigned(): void
```

#### Prüfen ob unzugeordnete Schüler existieren

```typescript
hasUnassignedStudents(): boolean
```

### Persistierung

#### Speichern

```typescript
save(): void
```

Speichert den aktuellen Zustand im LocalStorage. Wirft einen Fehler bei Quota-Überschreitung.

#### Laden

```typescript
load(): MultiClassStorage
```

Lädt den Zustand aus dem LocalStorage neu.

#### Prüfen ob Klassen existieren

```typescript
hasClasses(): boolean
```

### Format-Erkennung

```typescript
import { detectFormat } from './services/classManager';

const format = detectFormat(jsonData);
// Rückgabe: 'legacy' | 'multi-class' | 'invalid'
```

---

## Import/Export-Beispiele

### Export einer einzelnen Klasse (Legacy-Format)

```typescript
// Klasse exportieren
const appState = classManager.exportClass('class-123');
// Ergebnis: { students: [...], subjects: [...] }

// Als Datei speichern
const blob = new Blob([JSON.stringify(appState, null, 2)], { 
  type: 'application/json' 
});
const filename = generateFileName('class-123', 'Klasse 1a');
// Ergebnis: "BewertungSaph_Klasse_1a_2024-01-15_10-30-00.json"
```

### Export aller Klassen

```typescript
// Alle Klassen exportieren
const allData = classManager.exportAllClasses();
// Ergebnis: { version: "3.0", exportDate: "...", classes: [...], ... }

// Als Datei speichern
const blob = new Blob([JSON.stringify(allData, null, 2)], { 
  type: 'application/json' 
});
const filename = generateFileName('all');
// Ergebnis: "BewertungSaph_Alle_Klassen_2024-01-15_10-30-00.json"
```

### Import mit Format-Erkennung

```typescript
// Datei einlesen
const fileContent = await file.text();
const jsonData = JSON.parse(fileContent);

// Import mit automatischer Format-Erkennung
const result = classManager.handleImport(jsonData, targetClassId);

if (result.needsWarning) {
  // Multi-Class-Datei wird in einzelne Klasse geladen
  const confirmed = await showFormatMismatchWarning({
    selectedTarget: targetClassId,
    targetClassName: 'Klasse 1a',
    fileData: jsonData as AllClassesExport
  });
  
  if (confirmed) {
    classManager.forceImportAllClasses(jsonData as AllClassesExport);
  }
}
```

### Dateinamen-Generierung

```typescript
import { generateFileName } from './services/classManager';

// Einzelne Klasse
generateFileName('class-123', 'Klasse 1a');
// → "BewertungSaph_Klasse_1a_2024-01-15_10-30-00.json"

// Klasse mit Leerzeichen
generateFileName('class-456', 'Klasse 2 b');
// → "BewertungSaph_Klasse_2_b_2024-01-15_10-30-00.json"

// Ohne Zuordnung
generateFileName('unassigned');
// → "BewertungSaph_Ohne_Klasse_2024-01-15_10-30-00.json"

// Alle Klassen
generateFileName('all');
// → "BewertungSaph_Alle_Klassen_2024-01-15_10-30-00.json"
```

---

## Abwärtskompatibilität

### Legacy-Dateien laden

Das System erkennt automatisch das Format einer JSON-Datei:

```typescript
const format = detectFormat(jsonData);

switch (format) {
  case 'legacy':
    // Alte Datei ohne Klasseninformationen
    // Kann in jede Klasse oder "Ohne Zuordnung" geladen werden
    classManager.importToClass(jsonData, targetClassId);
    break;
    
  case 'multi-class':
    // Neue Datei mit allen Klassen
    // Überschreibt den gesamten LocalStorage
    classManager.importAllClasses(jsonData);
    break;
    
  case 'invalid':
    throw new Error('Ungültiges Dateiformat');
}
```

### Format-Erkennung

Die Format-Erkennung basiert auf der Struktur der JSON-Daten:

| Format | Erkennungsmerkmal |
|--------|-------------------|
| `multi-class` | Hat `version` und `classes` Array |
| `legacy` | Hat direkt `students` und `subjects` Arrays |
| `invalid` | Keines der obigen Merkmale |

### Warnungen bei Format-Mismatch

Wenn eine Multi-Class-Datei in eine einzelne Klasse geladen werden soll, wird eine Warnung angezeigt:

```typescript
import { showFormatMismatchWarning } from './utils/classValidation';

const confirmed = await showFormatMismatchWarning({
  selectedTarget: 'class-123',
  targetClassName: 'Klasse 1a',
  fileData: allClassesData
});

// Warnung: "Sie haben 'Klasse 1a' zum Laden ausgewählt, 
// aber die Datei enthält Daten für 3 Klassen und Schüler ohne Zuordnung.
// Wenn Sie fortfahren, wird Ihr gesamter LocalStorage überschrieben."
```

---

## Validierung

### Klassennamen-Validierung

```typescript
import { validateClassName } from './utils/classValidation';

const result = validateClassName(
  'Neue Klasse',
  classManager.getAllClasses()
);

if (!result.valid) {
  console.error(result.error);
  // Mögliche Fehler:
  // - "Klassenname darf nicht leer sein"
  // - "Klassenname zu lang (max. 50 Zeichen)"
  // - "Eine Klasse mit diesem Namen existiert bereits"
}
```

### Fehlerbehandlung

```typescript
try {
  classManager.save();
} catch (error) {
  if (error.message.includes('LocalStorage-Speicher voll')) {
    // Benutzer auffordern, Daten zu exportieren und alte Klassen zu löschen
  }
}
```

---

## Weitere Ressourcen

- [README.md](../README.md) - Allgemeine Projektdokumentation
- [PLANUNG.md](./PLANUNG.md) - Ursprüngliche Planungsdokumentation
- [types.ts](../types.ts) - TypeScript-Typdefinitionen
- [classManager.ts](../services/classManager.ts) - ClassManager-Implementierung
