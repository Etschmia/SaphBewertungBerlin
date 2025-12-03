Wir müssen künftig die Schüler **Klassen** zuordnen können. Noch gibt es keine Entität Klasse.  Unsere JSON dürfen aber deswegen ihren Aufbau nicht verändern, **alte JSON Dateien müssen auch künftig geladen werden können**. 

Deine Aufgabe ist, Folgendes zu planen:

# Einführung von Klassen:

## Button Klasse
Über dem Button "Schüler hinzufügen" kommt ein halb so breiter Button "Klasse". Daneben steht der Name der Klasse. Wenn die aktuell angezeigten Schüler keiner Klasse zugeordnet sind steht rechts neben dem Button der Text: "Ohne Zuordnung".

Klickt man auf den Button "Klasse" öffnet sich ein **Modal** mit folgenden Optionen:
* "Aktuelle Schülerliste als neue Klasse erfassen", wobei hinter Klasse der Name der Klasse eingegeben werden kann.
* "Neue Klasse anlegen mit leerer Schülerliste", wobei hinter Klasse der Name der Klasse eingegeben werden kann.
* Desweiteren gibt es für jede Klasse, die bereits angelegt wurde, die Option "Zur Klasse wechseln" wobei hinter Klasse der Name der Klasse angezeigt wird. Bei Auswahl wird die entsprechende Schülerliste aus dem LocalStorage geladen.

## LocalStorage

Im LocalStorage muss künftig die Zuordnung der Schüler zu einer benannten Klasse nachgehalten werden.

## Speichern und Laden

Für die "Speichern" und "Laden" Buttons ist nun zu unterscheiden: Gibt es im LocalStorage bereits Klassen oder werden keine benutzt? Gibt es keine, so ändert sich für diesen Buttons nichts. 

### Der Speichern- Button
Gibt es Klassen so muss aus dem Speichern - Button ein Speichern- Dropdown werden für jede Klasse die es gibt sowie, falls vorhanden, für die nicht einer Klasse zugeordnete Schülerliste, welche dann gelistet wird als "Ohne Klasse". Als letzten Eintrag gibt es dann die Auswahl "Alle Klassen". Beim Speichern ist der Name der Klasse (bzw. "Alle_Klassen" oder "Ohne_Klasse") in den Dateinamen mit aufzunehmen wobei Leerzeichen durch Unterstriche zu ersetzen sind. Nur für die Auswahl "Alle Klassen" darf ein neues JSON- Format verwendet werden, das dann die Klassenzuordnung als Knoten über der Schülerliste enthält.

### Der Laden- Button
Hier ist dem Upload ein Dropdown vorgeschaltet, welches erfragt in welche Klasse geladen werden soll oder ob "Ohne Klasse" zu laden ist. Daraufhin wird die Schülerliste in die entsprechende Klasse geladen. Als letzten Eintrag gibt es hier die Möglichkeit "Alle Klassen" auszuwählen, was dann das neue Format wäre. 

Wenn ein JSON hochgeladen wird das alle Klassen enthält, aber zuvor eine bestimmte Klasse oder der Eintrag "Ohne Klasse" ausgewählt war, so ist der Nutzer darauf hin zu weisen dass er die Auswahl soundso traf, nun aber ein Dokument mit Allen Klassen hochlud - er kann dann den Upload bestätigen, womit sein LocalStorage komplett überschrieben wird, oder abbrechen.

## Dokumentation

Das neue Feature ist für die Benutzer in die README aufzunehmen sowie in das Modal mit den Benutzerhinweisen. Für die Weiterentwicklung ist das Feature technisch zu dokumentieren in einem Markdown unterhalb docs/
