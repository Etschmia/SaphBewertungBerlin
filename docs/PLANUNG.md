# **Plan für die Schülerbewertungs-App**

Dieses Dokument beschreibt den Plan und die Architektur für die Erstellung der Schülerbewertungs-App gemäß den Anforderungen.

## **1\. Grundlegende Anforderungen**

* **Zweck:** Erfassung von Schülerbewertungen basierend auf einem vordefinierten Kompetenzraster (aus PDF).  
* **Zielgruppe:** Lehrer.  
* **Technologie-Stack:** Next.js (React), TypeScript, Tailwind CSS.  
* **Datenhaltung:** Ausschließlich lokal im Browser (localStorage). Kein Backend, keine Datenbank, keine Benutzerregistrierung.  
* **Daten-I/O:**  
  * Import/Export des gesamten App-Zustands als JSON-Datei.  
  * Export einer einzelnen Schülerbewertung als PDF-Datei, die dem bereitgestellten Muster ähnelt.

## **2\. Datenstruktur (Data Model)**

Die gesamte Anwendung wird von einer zentralen Datenstruktur gesteuert. Diese wird in TypeScript-Interfaces definiert.

// Enum für die 4 Bewertungsstufen \+ "nicht vermittelt"  
enum CompetencyLevel {  
  NotTaught \= 0,  
  Low \= 1,  
  Partial \= 2,  
  Proficient \= 3,  
  Excellent \= 4,  
}

// Eine einzelne Kompetenz  
interface Competency {  
  id: string; // Eindeutige ID, z.B. UUID  
  text: string; // Der Kompetenztext, z.B. "liest flüssig"  
}

// Eine Kategorie innerhalb eines Faches  
interface Category {  
  id: string;  
  name: string; // z.B. "Lesen", "Schreiben"  
  competencies: Competency\[\];  
}

// Ein Schulfach  
interface Subject {  
  id: string;  
  name: string; // z.B. "Deutsch", "Mathematik"  
  categories: Category\[\];  
}

// Die Bewertung eines Schülers  
// Key: competency.id, Value: CompetencyLevel  
interface Evaluation {  
  \[competencyId: string\]: CompetencyLevel;  
}

// Ein Schüler  
interface Student {  
  id: string;  
  name: string; // Vorname \+ ggf. Kürzel  
  evaluations: Evaluation;  
}

// Der gesamte Zustand der Anwendung  
interface AppState {  
  students: Student\[\];  
  evaluationStructure: Subject\[\]; // Die anpassbare Struktur der Fächer/Kompetenzen  
}

## **3\. Anwendungsarchitektur & Komponenten**

Die App wird als Single-Page-Application (SPA) innerhalb von Next.js umgesetzt. Die Hauptlogik befindet sich in app/page.tsx und wird durch kleinere, wiederverwendbare Komponenten unterstützt.

* **app/page.tsx (Hauptkomponente):**  
  * Hält den gesamten AppState (Schüler, Bewertungsstruktur).  
  * Verwaltet die Auswahl des aktiven Schülers.  
  * Implementiert die Logik zur Synchronisierung des Zustands mit localStorage mittels useEffect.  
  * Enthält die Handler-Funktionen für alle Aktionen (Schüler hinzufügen, Bewertung ändern, Daten importieren/exportieren).  
  * Rendert die Haupt-Layout-Struktur.  
* **components/StudentManager.tsx:**  
  * Zeigt die Liste der Schüler an.  
  * Erlaubt das Hinzufügen, Auswählen und Löschen von Schülern.  
  * Hebt den aktuell ausgewählten Schüler hervor.  
* **components/EvaluationSheet.tsx:**  
  * Zeigt den Bewertungsbogen für den ausgewählten Schüler an.  
  * Iteriert durch die evaluationStructure (Fächer, Kategorien, Kompetenzen).  
  * Ermöglicht das Bearbeiten der Namen von Kategorien und Kompetenzen.  
  * Ermöglicht das Hinzufügen neuer Kompetenzen zu einer Kategorie.  
* **components/CompetencyRow.tsx:**  
  * Stellt eine einzelne Kompetenzzeile dar.  
  * Enthält den (bearbeitbaren) Kompetenztext.  
  * Zeigt die 5 Checkboxen für die Bewertungsstufen an.  
  * Ruft bei einer Änderung die entsprechende Handler-Funktion in der Hauptkomponente auf.  
* **components/DataManager.tsx:**  
  * Enthält die Buttons für "Als JSON speichern", "JSON laden" und "Als PDF exportieren".  
  * Kapselt die Logik für den Datei-Download und \-Upload.  
* **lib/initialData.ts:**  
  * Enthält die aus dem PDF extrahierte Kompetenzstruktur als Konstante. Diese wird als initialer Zustand verwendet, falls noch keine Daten im localStorage vorhanden sind.  
* **lib/pdfGenerator.ts:**  
  * Eine Hilfsfunktion, die die jspdf-Bibliothek verwendet.  
  * Nimmt die Daten eines Schülers und die Kompetenzstruktur entgegen.  
  * Erzeugt programmatisch ein PDF, das dem Layout des Muster-PDFs folgt (Titel, Fächer, Kompetenzen, gesetzte Kreuze).

## **4\. Funktionsweise im Detail**

1. **Initialisierung:** Beim ersten Start lädt die App die initialData. Dieser Zustand wird sofort im localStorage gespeichert. Bei nachfolgenden Besuchen wird der Zustand aus dem localStorage geladen.  
2. **Schüler anlegen:** Der Nutzer gibt einen Namen in ein Eingabefeld ein und klickt auf "Schüler hinzufügen". Ein neues Student-Objekt wird erstellt und zum AppState hinzugefügt.  
3. **Bewertung:** Der Nutzer wählt einen Schüler aus der Liste aus. Der Bewertungsbogen wird mit den Daten dieses Schülers angezeigt. Klickt der Nutzer eine Checkbox an, wird das evaluations-Objekt des Schülers aktualisiert. Jede Änderung am Zustand wird automatisch im localStorage persistiert.  
4. **Struktur anpassen:** Der Nutzer kann direkt auf die Titel von Kategorien oder die Texte von Kompetenzen klicken. Diese verwandeln sich in ein Eingabefeld. Nach der Bearbeitung wird der evaluationStructure-Teil des AppState aktualisiert. Ein "Kompetenz hinzufügen"-Button pro Kategorie ermöglicht die Erweiterung.  
5. **JSON-Export:** Der aktuelle AppState wird mittels JSON.stringify() in einen String umgewandelt und als bewertungen.json-Datei zum Download angeboten.  
6. **JSON-Import:** Der Nutzer wählt eine bewertungen.json-Datei aus. Der Inhalt wird gelesen, mit JSON.parse() verarbeitet und überschreibt den aktuellen AppState.  
7. **PDF-Export:** Der Nutzer wählt einen Schüler aus und klickt auf "Als PDF exportieren". Die pdfGenerator-Funktion wird mit den Daten des Schülers aufgerufen und generiert eine bewertung\_\[schülername\].pdf-Datei.

## **5\. Wichtige Umsetzungsdetails**

* **Styling:** Tailwind CSS wird für ein sauberes, responsives Design verwendet.  
* **Icons:** lucide-react wird für Symbole (z.B. Plus, Löschen, Speichern) genutzt.  
* **PDF-Generierung:** Die Bibliothek jspdf wird verwendet, um volle Kontrolle über das Layout des exportierten PDFs zu haben und die Ähnlichkeit zum Original sicherzustellen. html2canvas wird bewusst *nicht* verwendet, da es zu unsauberen Ergebnissen führen kann.  
* **IDs:** Alle Schüler, Fächer, Kategorien und Kompetenzen erhalten beim Erstellen eine eindeutige ID (z.B. mittels crypto.randomUUID()), um Referenzen stabil zu halten, auch wenn Namen geändert werden.