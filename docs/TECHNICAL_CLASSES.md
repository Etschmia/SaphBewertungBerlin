# Technische Dokumentation: Klassen-Implementierung

## Übersicht

Mit der Einführung von Klassen können Schüler gruppiert werden. Dies ermöglicht es Lehrkräften, mehrere Klassen in einer Anwendung zu verwalten.

## Datenmodell

### Class Entity
Eine Klasse wird durch das `Class` Interface definiert:
```typescript
export interface Class {
  id: string;   // Eindeutige ID, z.B. "class-1701234567890"
  name: string; // Name der Klasse, z.B. "Klasse 1a"
}
```

### Student Entity Update
Das `Student` Interface wurde erweitert:
```typescript
export interface Student {
  // ... bestehende Felder
  classId?: string; // Optionale Referenz auf eine Class ID
}
```
Ist `classId` nicht gesetzt (`undefined`), gehört der Schüler zu "Ohne Zuordnung".

### AppState Update
Der globale State `AppState` enthält nun optional ein Array von Klassen:
```typescript
export interface AppState {
  students: Student[];
  subjects: Subject[];
  classes?: Class[]; // Neu
}
```

## UI-Komponenten

### ClassSelectionModal
Verwaltet das Erstellen und Wechseln von Klassen.
- **Erstellen**: 
  - "Aktuelle Schülerliste als neue Klasse erfassen": Weist allen aktuell sichtbaren Schülern die neue Class ID zu.
  - "Neue Klasse anlegen mit leerer Schülerliste": Erstellt eine Klasse und wechselt in diese (leere Ansicht).
- **Wechseln**: Listet alle vorhandenen Klassen sowie "Ohne Zuordnung" auf.

### SaveOptionsModal
Erscheint beim Klick auf "Speichern", wenn Klassen existieren.
- **Alle Klassen**: Speichert den kompletten State (`classes`, `students`, `subjects`) im neuen Format (Version 2.0).
- **Einzelne Klasse / Ohne Klasse**: Filtert die Schülerliste und speichert eine Datei im Legacy-kompatiblen Format (ohne `classes` Array auf Top-Level, bzw. wird beim Laden als Schülerliste interpretiert).

### LoadOptionsModal
Erscheint beim Klick auf "Laden", wenn Klassen existieren.
- **Alle Klassen**: Erwartet eine Datei mit `classes` (oder überschreibt alles).
- **In Klasse laden**: Lädt die Schüler aus der Datei und weist ihnen die gewählte Class ID zu (Import/Merge).

## Speicherformat & Kompatibilität

### Version 2.0 (Alle Klassen)
```json
{
  "version": "2.0",
  "exportDate": "...",
  "classes": [...],
  "students": [...], // Alle Schüler aller Klassen
  "subjects": [...]
}
```

### Legacy / Einzel-Export
```json
{
  "version": "2.0",
  "exportDate": "...",
  "students": [...], // Nur Schüler der gewählten Klasse
  "subjects": [...]
}
```
Alte Dateien (ohne `version` oder `classes`) werden weiterhin unterstützt und können entweder als "Alle Klassen" (wenn keine Klassenstruktur existiert) oder in eine spezifische Klasse importiert werden.

## Migration
Beim Laden von Daten prüft die App:
1. Hat die Datei `classes`? -> Backup-Wiederherstellung (überschreibt alles, wenn bestätigt).
2. Hat die Datei keine `classes`? -> Import von Schülern in das gewählte Ziel (Merge).
