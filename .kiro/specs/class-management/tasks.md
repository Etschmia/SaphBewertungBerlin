# Implementation Plan: Klassenmanagement

- [x] 1. Datenstrukturen und Typen definieren
  - Erstelle neue TypeScript-Interfaces für ClassData, MultiClassStorage und AllClassesExport
  - Erweitere types.ts mit den neuen Datenstrukturen
  - Definiere STORAGE_KEYS Konstanten
  - _Requirements: 3.1, 4.7, 7.4_

- [x] 2. ClassManager Service implementieren
  - Erstelle services/classManager.ts mit ClassManager-Klasse
  - Implementiere Format-Erkennung (detectFormat)
  - Implementiere Migration von Legacy zu Multi-Class (migrateFromLegacy)
  - Implementiere Initialisierung und LocalStorage-Laden
  - _Requirements: 3.4, 7.1, 7.4_

- [ ]* 2.1 Write property test for Format-Erkennung
  - **Property 11: Format-Erkennung und Legacy-Kompatibilität**
  - **Validates: Requirements 7.1, 7.4**

- [x] 2.2 Implementiere Klassenverwaltungs-Methoden
  - Implementiere createClass, getClass, getAllClasses
  - Implementiere switchToClass, deleteClass
  - Implementiere getCurrentClass, getCurrentStudents
  - _Requirements: 2.1, 2.5, 3.1_

- [ ]* 2.3 Write property test for Klassenwechsel
  - **Property 10: Klassenwechsel lädt korrekte Daten**
  - **Validates: Requirements 2.5**

- [x] 2.4 Implementiere Unassigned-Verwaltung
  - Implementiere getUnassignedStudents, updateUnassignedStudents
  - Implementiere switchToUnassigned
  - _Requirements: 1.2, 4.3, 5.7_

- [x] 2.5 Implementiere Persistierung
  - Implementiere save() mit Fehlerbehandlung (QuotaExceededError)
  - Implementiere load() mit Validierung
  - Implementiere updateCurrentClass für automatisches Speichern
  - _Requirements: 3.1, 3.2, 3.3_

- [ ]* 2.6 Write property test for LocalStorage-Persistierung
  - **Property 3: LocalStorage-Persistierung**
  - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**

- [x] 3. Import/Export-Logik implementieren
  - Implementiere exportClass für einzelne Klassen (Legacy-Format)
  - Implementiere exportAllClasses (Klassen-Format)
  - Implementiere Dateinamen-Generierung mit Leerzeichen-Ersetzung
  - _Requirements: 4.5, 4.6, 4.7, 4.8_

- [ ]* 3.1 Write property test for Leerzeichen-Ersetzung
  - **Property 9: Leerzeichen-Ersetzung in Dateinamen**
  - **Validates: Requirements 4.8**

- [ ]* 3.2 Write property test for Legacy-Format-Export
  - **Property 17: Legacy-Format-Export für einzelne Klassen**
  - **Validates: Requirements 4.5**

- [x] 3.3 Implementiere Import-Logik
  - Implementiere importToClass für Legacy-Dateien
  - Implementiere importAllClasses für Klassen-Format
  - Implementiere handleImport mit Format-Erkennung
  - _Requirements: 5.6, 5.7, 6.1, 7.2, 7.3_

- [ ]* 3.4 Write property test for Legacy-Import
  - **Property 12: Legacy-Import in Klasse**
  - **Validates: Requirements 5.6, 7.2**

- [x] 4. Validierung implementieren
  - Erstelle utils/classValidation.ts
  - Implementiere validateClassName mit Duplikat-Prüfung
  - Implementiere showFormatMismatchWarning
  - _Requirements: 6.1, 6.2, 6.3_

- [ ]* 4.1 Write property test for Format-Mismatch-Warnung
  - **Property 13: Format-Mismatch-Warnung**
  - **Validates: Requirements 6.1, 6.2**

- [ ]* 4.2 Write property test for Abbruch-Invariante
  - **Property 15: Abbruch erhält Zustand**
  - **Validates: Requirements 6.5**

- [x] 5. React Context für Klassenverwaltung erstellen
  - Erstelle contexts/ClassContext.tsx
  - Definiere ClassContextValue Interface
  - Implementiere ClassProvider mit useState und useEffect
  - Implementiere useClass Hook
  - _Requirements: 2.1, 2.5, 3.1_

- [x] 6. ClassButton Komponente erstellen
  - Erstelle components/ClassButton.tsx
  - Zeige "Ohne Zuordnung" wenn keine Klasse ausgewählt
  - Zeige Klassennamen wenn Klasse ausgewählt
  - Implementiere onClick Handler für Modal
  - _Requirements: 1.1, 1.2, 1.3_

- [ ]* 6.1 Write property test for Klassenname-Anzeige
  - **Property 1: Klassenname-Anzeige ohne Auswahl**
  - **Property 2: Klassenname-Anzeige mit Auswahl**
  - **Validates: Requirements 1.2, 1.3**

- [x] 7. ClassModal Komponente erstellen
  - Erstelle components/ClassModal.tsx
  - Implementiere Modal-Dialog mit Overlay
  - Implementiere "Aktuelle Schülerliste als neue Klasse erfassen" Option
  - Implementiere "Neue Klasse anlegen mit leerer Schülerliste" Option
  - Zeige Liste aller Klassen mit "Zur Klasse wechseln" Buttons
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ]* 7.1 Write property test for Modal-Öffnung
  - **Property 4: Klassenmodal öffnet**
  - **Validates: Requirements 2.1**

- [ ]* 7.2 Write property test for Klassen-Liste im Modal
  - **Property 6: Dropdown zeigt alle Klassen**
  - **Validates: Requirements 2.4**

- [x] 8. SaveDropdown Komponente erstellen
  - Erstelle components/SaveDropdown.tsx
  - Zeige Dropdown nur wenn Klassen existieren, sonst normaler Button
  - Zeige Option für jede Klasse
  - Zeige "Ohne Klasse" Option wenn unassigned students existieren
  - Zeige "Alle Klassen" als letzten Eintrag
  - Implementiere Export-Handler für jede Option
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

- [ ]* 8.1 Write property test for Dropdown-Umwandlung
  - **Property 5: Dropdown-Umwandlung bei Klassen**
  - **Validates: Requirements 4.1**

- [ ]* 8.2 Write property test for Unassigned-Option
  - **Property 7: Unassigned-Option bei vorhandenen Schülern**
  - **Validates: Requirements 4.3**

- [ ]* 8.3 Write property test for Dropdown-Reihenfolge
  - **Property 8: Dropdown-Reihenfolge**
  - **Validates: Requirements 4.4**

- [x] 9. LoadDropdown Komponente erstellen
  - Erstelle components/LoadDropdown.tsx
  - Zeige Dropdown nur wenn Klassen existieren, sonst normaler Button
  - Zeige Option für jede Klasse
  - Zeige "Ohne Klasse" Option
  - Zeige "Alle Klassen" als letzten Eintrag
  - Implementiere Datei-Upload-Dialog für jede Option
  - Implementiere Import-Handler mit Format-Erkennung und Warnung
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 6.1, 6.4, 6.5_

- [ ]* 9.1 Write property test for Upload-Dialog
  - **Property 16: Datei-Upload-Dialog öffnet**
  - **Validates: Requirements 5.5**

- [ ]* 9.2 Write property test for Bestätigung überschreibt
  - **Property 14: Bestätigung überschreibt LocalStorage**
  - **Validates: Requirements 6.4**

- [x] 10. App.tsx Integration
  - Wrape App mit ClassProvider
  - Ersetze direkten LocalStorage-Zugriff durch ClassManager
  - Füge ClassButton über "Schüler hinzufügen" Button hinzu
  - Ersetze handleExportJson durch SaveDropdown
  - Ersetze handleImportJson durch LoadDropdown
  - Aktualisiere useEffect für Laden/Speichern mit ClassManager
  - _Requirements: 1.1, 3.2, 3.3, 4.1, 5.1_

- [x] 11. Checkpoint - Funktionalität testen
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. README.md aktualisieren
  - Füge Abschnitt "Klassenverwaltung" hinzu
  - Erkläre wie man Klassen anlegt und wechselt
  - Erkläre Unterschied zwischen klassenweisem und vollständigem Export
  - Betone Abwärtskompatibilität mit alten JSON-Dateien
  - _Requirements: 8.1, 8.4_

- [x] 13. UsageModal.tsx aktualisieren
  - Füge neue Sektion "Klassenverwaltung" hinzu
  - Erkläre Klassenmanagement-Features für Endbenutzer
  - Füge Schritt-für-Schritt-Anleitung hinzu
  - _Requirements: 8.2_

- [x] 14. Technische Dokumentation erstellen
  - Erstelle docs/class-management-technical.md
  - Dokumentiere Datenstrukturen im Detail
  - Dokumentiere LocalStorage-Schema
  - Dokumentiere Migration-Strategie
  - Dokumentiere ClassManager API
  - Füge Beispiele für Import/Export hinzu
  - _Requirements: 8.3, 8.4_

- [x] 15. Final Checkpoint - Alle Tests und Dokumentation prüfen
  - Ensure all tests pass, ask the user if questions arise.
