# Requirements Document

## Introduction

This feature transforms the current single-rating system for student competencies into a comprehensive multi-rating system. Instead of allowing only one assessment per competency, teachers will be able to rate students multiple times for each competency, with full tracking of when each rating was given. The system will maintain a complete history of all ratings while providing visual indicators of rating frequency and easy management of individual rating entries.

## Requirements

### Requirement 1

**User Story:** Als Lehrer möchte ich einen Schüler mehrfach für dieselbe Kompetenz bewerten können, damit ich den Lernfortschritt über die Zeit dokumentieren kann.

#### Acceptance Criteria

1. WHEN ein Lehrer auf eine Bewertungsoption klickt THEN soll das System eine neue Bewertung mit Zeitstempel hinzufügen ANSTATT die vorherige zu überschreiben
2. WHEN ein Lehrer dieselbe Option mehrfach für einen Schüler klickt THEN soll jeder Klick als separate Bewertung mit eigenem Zeitstempel gespeichert werden
3. WHEN ein Schüler bereits Bewertungen für eine Kompetenz hat THEN soll das System alle vorherigen Bewertungen beibehalten beim Hinzufügen neuer Bewertungen

### Requirement 2

**User Story:** Als Lehrer möchte ich visuell erkennen können, wie oft ich eine bestimmte Bewertungsoption für einen Schüler gewählt habe, damit ich schnell den Bewertungsverlauf überblicken kann.

#### Acceptance Criteria

1. WHEN eine Bewertungsoption einmal geklickt wurde THEN soll ein dünner Kreis angezeigt werden
2. WHEN eine Bewertungsoption zweimal geklickt wurde THEN soll ein etwas dickerer Kreis angezeigt werden  
3. WHEN eine Bewertungsoption drei Mal oder öfter geklickt wurde THEN soll ein ganz dicker Kreis angezeigt werden
4. WHEN eine Bewertungsoption geklickt wurde THEN soll neben der Option eine kleine Zahl mit der Anzahl der Klicks angezeigt werden
5. WHEN eine Bewertungsoption null Mal geklickt wurde THEN soll keine Zahl angezeigt werden

### Requirement 3

**User Story:** Als Lehrer möchte ich die Details meiner Bewertungen einsehen und verwalten können, damit ich nachvollziehen kann wann ich welche Bewertungen gegeben habe und diese bei Bedarf korrigieren kann.

#### Acceptance Criteria

1. WHEN ein Lehrer auf die Anzahl-Zahl neben einer Bewertungsoption klickt THEN soll eine Tabelle mit allen Klickzeiten für diese Option geöffnet werden
2. WHEN die Klickzeiten-Tabelle angezeigt wird THEN sollen alle Zeitstempel im deutschen Format (Tag und Uhrzeit) dargestellt werden
3. WHEN die Klickzeiten-Tabelle angezeigt wird THEN soll neben jedem Zeitstempel ein roter Delete-Button vorhanden sein
4. WHEN ein Lehrer auf einen Delete-Button klickt THEN soll die entsprechende Bewertung mit Zeitstempel gelöscht werden
5. WHEN die Klickzeiten-Tabelle geöffnet ist THEN soll ein Close-Button zum Schließen der Tabelle verfügbar sein
6. WHEN die Klickzeiten-Tabelle geöffnet ist UND der Nutzer irgendwo anders hin klickt THEN soll die Tabelle automatisch geschlossen werden

### Requirement 4

**User Story:** Als System möchte ich die Bewertungsdaten in einem erweiterten JSON-Format speichern und laden, damit alle Mehrfachbewertungen mit Zeitstempeln persistent gespeichert werden.

#### Acceptance Criteria

1. WHEN Bewertungsdaten gespeichert werden THEN soll das JSON-Format für jede Bewertungsoption ein Array von Zeitstempeln enthalten
2. WHEN Bewertungsdaten geladen werden THEN soll das System sowohl das neue Format (Arrays) als auch das alte Format (einzelne Werte) unterstützen
3. WHEN alte Daten im bisherigen Format geladen werden THEN sollen diese automatisch in das neue Format konvertiert werden
4. WHEN keine Bewertungen für eine Option vorhanden sind THEN soll ein leeres Array gespeichert werden

### Requirement 5

**User Story:** Als Lehrer möchte ich weiterhin PDF-Exporte erstellen können, die auf der häufigsten Bewertung basieren, damit die bestehende Berichtsfunktionalität erhalten bleibt.

#### Acceptance Criteria

1. WHEN ein PDF-Export erstellt wird THEN soll für jede Kompetenz die am häufigsten geklickte Bewertungsoption verwendet werden
2. WHEN mehrere Bewertungsoptionen gleich oft geklickt wurden THEN soll eine konsistente Regel zur Auswahl angewendet werden (z.B. die zuletzt geklickte)
3. WHEN keine Bewertungen für eine Kompetenz vorhanden sind THEN soll im PDF keine Bewertung angezeigt werden
4. WHEN der PDF-Export generiert wird THEN soll das bestehende PDF-Layout und -Format beibehalten werden