# Klassen-Feature (Technik)

## Datenmodell (Version 3.0)
- LocalStorage-Key bleibt `zeugnis-assistent-state`.
- Persistierte Felder:  
  - `classes`: Array `{ id, name, students: Student[] }`  
  - `unassignedStudents`: Schueler ohne Klassenzuordnung  
  - `activeClassId`: aktuell angezeigte Klasse oder `null` (Ohne Zuordnung)  
  - `subjects`: wie bisher  
  - `version`: `"3.0"` fuer das Klassenformat
- Ableitung im UI: `activeStudents` = Schueler der aktiven Klasse oder `unassignedStudents`.

## Migration & Kompatibilitaet
- Laden aus LocalStorage:
  - Wenn `classes`/`unassignedStudents`/`activeClassId` oder `version === "3.0"` vorhanden: in Klassenstruktur laden, aktive Klasse setzen, Schuelerauswahl auf ersten Eintrag.
  - Wenn nur `students` (altes Format): nach `unassignedStudents` uebernehmen, `activeClassId = null`.
  - Subjekte werden validiert wie zuvor (Fallback: `initialSubjects`).
- Legacy-Assessment-Formate bleiben durch `sanitizeStudentList`/`migrateStudentData` unterstuetzt.

## Export-Formate
- **Einzel-Klasse / Ohne Klasse**: unveraendertes JSON mit `students` + `subjects`, `version: "2.0"`; Dateiname `BewertungSaph_<Klassenname_oder_Ohne_Klasse>_<Datum>_<Zeit>.json` (Leerzeichen -> Unterstriche).
- **Alle Klassen**: Sammel-JSON mit `version: "3.0"`, `classes`, `unassignedStudents`, `subjects`, `activeClassId`, `exportDate`; Dateiname enthaelt `Alle_Klassen`.

## Import-Logik
- Dropdown fragt vor dem Upload nach Ziel: Klasse X, "Ohne Klasse" oder "Alle Klassen".
- Wenn Datei Klassen-Struktur enthaelt (Sammel-JSON):
  - Ziel "Alle Klassen": kompletter LocalStorage wird ersetzt.
  - Ziel Klasse/Ohne Klasse: Warn-/Bestaetigungsdialog, bei Zustimmung ebenfalls kompletter Replace.
- Wenn Datei Einzel-Format (students + subjects):
  - Ziel Klasse: Schuelerliste ersetzt die gewaehlt Klasse (Klasse wird angelegt, falls nicht vorhanden).
  - Ziel "Ohne Klasse": Schuelerliste landet in `unassignedStudents`, andere Klassen bleiben unberuehrt.
  - Ziel "Alle Klassen": Klassen werden geleert, Daten landen in `unassignedStudents`.
- Subjects sind Pflicht; bei fehlender/ungueltiger Struktur bricht der Import mit Fehlermeldung ab.

## UI-Flow
- Sidebar: Button "Klasse" (halb so breit wie "Schueler hinzufuegen") zeigt Klassenname oder "Ohne Zuordnung" daneben und oeffnet das Klassen-Modal.
- Klassen-Modal: aktuelle Liste als Klasse speichern, leere Klasse anlegen, zu bestehender Klasse oder "Ohne Zuordnung" wechseln.
- Header:
  - Speichern-Dropdown: Klassen, "Ohne Klasse", "Alle Klassen" (nur sichtbar, wenn Klassen existieren).
  - Laden: Dropdown vor dem Upload mit denselben Zielen; bei Sammel-Upload nach Bestaetigung kompletter Replace.

## Tests / Manuelle Checks
- Import einer Alt-JSON ohne Klassen -> landet in "Ohne Zuordnung".
- Export/Import einzelner Klassen -> Format bleibt kompatibel, Dateiname enthaelt Klassensegment.
- Sammel-Export/Import -> Klassen, unassigned und activeClassId werden korrekt gesetzt; Warnung bei Mismatch (Ziel != Alle Klassen, Datei mit allen Klassen).
- Wechsel der aktiven Klasse setzt Schuelerauswahl korrekt.
