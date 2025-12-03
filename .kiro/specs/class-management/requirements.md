# Requirements Document

## Introduction

Dieses Feature erweitert den Bewertungs-Assistenten um ein Klassenverwaltungssystem. Lehrkräfte können Schüler in benannte Klassen organisieren, zwischen Klassen wechseln und Daten klassenweise oder klassenübergreifend speichern und laden. Das System muss vollständig abwärtskompatibel mit bestehenden JSON-Dateien bleiben, die keine Klasseninformationen enthalten.

## Glossary

- **System**: Der Bewertungs-Assistent (die gesamte Webanwendung)
- **Klasse**: Eine benannte Gruppe von Schülern
- **Schülerliste**: Die Liste aller Schüler, die aktuell angezeigt wird
- **LocalStorage**: Der Browser-Speicher, in dem Daten lokal gespeichert werden
- **Klassenmodal**: Das Dialogfenster zur Klassenverwaltung
- **Ohne Zuordnung**: Schüler, die keiner Klasse zugeordnet sind
- **Legacy-Format**: Das bisherige JSON-Format ohne Klasseninformationen
- **Klassen-Format**: Das neue JSON-Format mit Klassenknoten über der Schülerliste
- **Speichern-Dropdown**: Das erweiterte Speichern-Menü mit Klassenoptionen
- **Laden-Dropdown**: Das erweiterte Laden-Menü mit Klassenoptionen

## Requirements

### Requirement 1

**User Story:** Als Lehrkraft möchte ich Schüler in benannte Klassen organisieren, so dass ich verschiedene Klassen getrennt verwalten kann.

#### Acceptance Criteria

1. WHEN das System startet THEN das System SHALL einen Button "Klasse" über dem Button "Schüler hinzufügen" anzeigen
2. WHEN keine Klasse ausgewählt ist THEN das System SHALL rechts neben dem Button "Klasse" den Text "Ohne Zuordnung" anzeigen
3. WHEN eine Klasse ausgewählt ist THEN das System SHALL rechts neben dem Button "Klasse" den Namen der Klasse anzeigen
4. WHEN der Button "Klasse" halb so breit ist wie der Button "Schüler hinzufügen" THEN das System SHALL beide Buttons nebeneinander in einer Zeile anzeigen

### Requirement 2

**User Story:** Als Lehrkraft möchte ich über ein Modal neue Klassen anlegen oder zu bestehenden Klassen wechseln, so dass ich flexibel zwischen verschiedenen Schülerlisten navigieren kann.

#### Acceptance Criteria

1. WHEN der Benutzer auf den Button "Klasse" klickt THEN das System SHALL das Klassenmodal öffnen
2. WHEN das Klassenmodal geöffnet ist THEN das System SHALL die Option "Aktuelle Schülerliste als neue Klasse erfassen" mit einem Eingabefeld für den Klassennamen anzeigen
3. WHEN das Klassenmodal geöffnet ist THEN das System SHALL die Option "Neue Klasse anlegen mit leerer Schülerliste" mit einem Eingabefeld für den Klassennamen anzeigen
4. WHEN bereits Klassen angelegt wurden THEN das System SHALL für jede Klasse die Option "Zur Klasse wechseln" mit dem Klassennamen anzeigen
5. WHEN der Benutzer "Zur Klasse wechseln" für eine Klasse auswählt THEN das System SHALL die entsprechende Schülerliste aus dem LocalStorage laden und anzeigen

### Requirement 3

**User Story:** Als Lehrkraft möchte ich dass meine Klassenzuordnungen im LocalStorage gespeichert werden, so dass sie beim nächsten Besuch der Anwendung verfügbar sind.

#### Acceptance Criteria

1. WHEN eine neue Klasse angelegt wird THEN das System SHALL die Klasse mit ihrem Namen und der zugeordneten Schülerliste im LocalStorage speichern
2. WHEN zwischen Klassen gewechselt wird THEN das System SHALL die aktuelle Schülerliste der vorherigen Klasse im LocalStorage aktualisieren
3. WHEN Schüler zur aktuellen Klasse hinzugefügt oder gelöscht werden THEN das System SHALL die Änderungen im LocalStorage persistieren
4. WHEN das System startet THEN das System SHALL alle gespeicherten Klassen aus dem LocalStorage laden

### Requirement 4

**User Story:** Als Lehrkraft möchte ich Daten klassenweise speichern können, so dass ich separate Backup-Dateien für jede Klasse habe.

#### Acceptance Criteria

1. WHEN im LocalStorage Klassen existieren THEN das System SHALL den Button "Speichern" in ein Dropdown-Menü umwandeln
2. WHEN das Speichern-Dropdown geöffnet ist THEN das System SHALL für jede existierende Klasse eine Speicheroption mit dem Klassennamen anzeigen
3. WHEN im LocalStorage Schüler ohne Klassenzuordnung existieren THEN das System SHALL die Option "Ohne Klasse" im Speichern-Dropdown anzeigen
4. WHEN das Speichern-Dropdown geöffnet ist THEN das System SHALL als letzten Eintrag die Option "Alle Klassen" anzeigen
5. WHEN eine einzelne Klasse zum Speichern ausgewählt wird THEN das System SHALL eine JSON-Datei im Legacy-Format mit dem Klassennamen im Dateinamen erstellen
6. WHEN "Ohne Klasse" zum Speichern ausgewählt wird THEN das System SHALL eine JSON-Datei im Legacy-Format mit "Ohne_Klasse" im Dateinamen erstellen
7. WHEN "Alle Klassen" zum Speichern ausgewählt wird THEN das System SHALL eine JSON-Datei im Klassen-Format mit "Alle_Klassen" im Dateinamen erstellen
8. WHEN ein Klassenname Leerzeichen enthält THEN das System SHALL die Leerzeichen im Dateinamen durch Unterstriche ersetzen

### Requirement 5

**User Story:** Als Lehrkraft möchte ich JSON-Dateien in bestimmte Klassen laden können, so dass ich Backups gezielt wiederherstellen kann.

#### Acceptance Criteria

1. WHEN im LocalStorage Klassen existieren THEN das System SHALL dem Laden-Button ein Dropdown-Menü vorschalten
2. WHEN das Laden-Dropdown geöffnet ist THEN das System SHALL für jede existierende Klasse eine Ladeoption mit dem Klassennamen anzeigen
3. WHEN das Laden-Dropdown geöffnet ist THEN das System SHALL die Option "Ohne Klasse" anzeigen
4. WHEN das Laden-Dropdown geöffnet ist THEN das System SHALL als letzten Eintrag die Option "Alle Klassen" anzeigen
5. WHEN eine Ladeoption ausgewählt wird THEN das System SHALL einen Datei-Upload-Dialog öffnen
6. WHEN eine JSON-Datei hochgeladen wird und eine einzelne Klasse ausgewählt war THEN das System SHALL die Schülerliste in die ausgewählte Klasse laden
7. WHEN eine JSON-Datei hochgeladen wird und "Ohne Klasse" ausgewählt war THEN das System SHALL die Schülerliste ohne Klassenzuordnung laden

### Requirement 6

**User Story:** Als Lehrkraft möchte ich gewarnt werden wenn ich versehentlich eine Datei mit allen Klassen in eine einzelne Klasse lade, so dass ich Datenverlust vermeiden kann.

#### Acceptance Criteria

1. WHEN eine JSON-Datei im Klassen-Format hochgeladen wird und zuvor eine einzelne Klasse oder "Ohne Klasse" ausgewählt war THEN das System SHALL einen Warnhinweis anzeigen
2. WHEN der Warnhinweis angezeigt wird THEN das System SHALL die ursprüngliche Auswahl des Benutzers und den Dateityp beschreiben
3. WHEN der Warnhinweis angezeigt wird THEN das System SHALL die Optionen "Bestätigen" und "Abbrechen" anbieten
4. WHEN der Benutzer "Bestätigen" wählt THEN das System SHALL den gesamten LocalStorage mit den Daten aus der Datei überschreiben
5. WHEN der Benutzer "Abbrechen" wählt THEN das System SHALL den Upload-Vorgang abbrechen und keine Daten ändern

### Requirement 7

**User Story:** Als Lehrkraft möchte ich dass alte JSON-Dateien ohne Klasseninformationen weiterhin geladen werden können, so dass meine bestehenden Backups nicht unbrauchbar werden.

#### Acceptance Criteria

1. WHEN eine JSON-Datei im Legacy-Format hochgeladen wird THEN das System SHALL die Datei erfolgreich laden
2. WHEN eine JSON-Datei im Legacy-Format in eine Klasse geladen wird THEN das System SHALL die Schüler der ausgewählten Klasse zuordnen
3. WHEN eine JSON-Datei im Legacy-Format ohne Klassenauswahl geladen wird THEN das System SHALL die Schüler ohne Klassenzuordnung laden
4. WHEN das System eine JSON-Datei lädt THEN das System SHALL automatisch erkennen ob es sich um Legacy-Format oder Klassen-Format handelt

### Requirement 8

**User Story:** Als Lehrkraft möchte ich in der Dokumentation über das Klassenmanagement-Feature informiert werden, so dass ich alle Funktionen verstehe und nutzen kann.

#### Acceptance Criteria

1. WHEN die README-Datei geöffnet wird THEN das System SHALL eine Beschreibung des Klassenmanagement-Features enthalten
2. WHEN das Benutzerhinweise-Modal geöffnet wird THEN das System SHALL Informationen zur Nutzung des Klassenmanagement-Features anzeigen
3. WHEN die technische Dokumentation unter docs/ geöffnet wird THEN das System SHALL eine detaillierte technische Beschreibung des Features enthalten
4. WHEN die Dokumentation das Feature beschreibt THEN das System SHALL die Abwärtskompatibilität mit Legacy-Dateien erklären
