
import type { Subject } from '../types';

export const initialSubjects: Subject[] = [
  {
    id: 'subj-de',
    name: 'Deutsch',
    categories: [
      {
        id: 'cat-de-1',
        name: 'Sprechen und Zuhören',
        competencies: [
          { id: 'comp-de-1-1', text: 'nutzt einen angemessenen Wortschatz' },
          { id: 'comp-de-1-2', text: 'erzählt und informiert ziel- und zweckorientiert' },
          { id: 'comp-de-1-3', text: 'präsentiert Inhalte situations- und adressatenorientiert' },
          { id: 'comp-de-1-4', text: 'beachtet Gesprächsregeln' },
          { id: 'comp-de-1-5', text: 'nutzt Strategien des verstehenden Zuhörens' },
          { id: 'comp-de-1-6', text: 'gibt eigene Vorstellungen zum Inhalt des Gehörten wieder' },
          { id: 'comp-de-1-7', text: 'tauscht sich über Erfahrungen mit digitalen Kommunikationsmitteln aus' },
        ],
      },
      {
        id: 'cat-de-2',
        name: 'Schreiben',
        competencies: [
          { id: 'comp-de-2-1', text: 'schreibt lesbar in ...' },
          { id: 'comp-de-2-2', text: 'nutzt Rechtschreibstrategien und -hilfen' },
          { id: 'comp-de-2-3', text: 'tauscht sich über Rechtschreibstrategien aus' },
          { id: 'comp-de-2-4', text: 'schreibt Wörter und kurze Sätze zu einem vorgegebenen Inhalt auf' },
          { id: 'comp-de-2-5', text: 'schreibt und überarbeitet Texte in unterschiedlichen Textformen' },
        ],
      },
      {
        id: 'cat-de-3',
        name: 'Lesen',
        competencies: [
          { id: 'comp-de-3-1', text: 'liest' },
          { id: 'comp-de-3-2', text: 'trägt Texte gestaltend vor' },
          { id: 'comp-de-3-3', text: 'nutzt Lesestrategien' },
        ],
      },
      {
        id: 'cat-de-4',
        name: 'Auseinandersetzung mit Texten und anderen Medien',
        competencies: [
          { id: 'comp-de-4-1', text: 'beschreibt Figuren und/oder Orte in literarischen Texten' },
          { id: 'comp-de-4-2', text: 'prüft Aussagen zu einem Text' },
          { id: 'comp-de-4-3', text: 'ermittelt eindeutig auffindbare Informationen in Texten' },
          { id: 'comp-de-4-4', text: 'unterscheidet verschiedene Textsorten und beschreibt ihre Merkmale' },
          { id: 'comp-de-4-5', text: 'tauscht sich über Lese- und Medieninteressen und -erfahrungen aus' },
          { id: 'comp-de-4-6', text: 'orientiert sich im Medienangebot' },
        ],
      },
      {
        id: 'cat-de-5',
        name: 'Sprache nutzen und Sprachgebrauch untersuchen',
        competencies: [
            { id: 'comp-de-5-1', text: 'bildet und erklärt zusammengesetzte Wörter' },
            { id: 'comp-de-5-2', text: 'unterscheidet Nomen, Verben und Adjektive' },
            { id: 'comp-de-5-3', text: 'untersucht Sätze und ermittelt Zeit- und Ortsangaben' },
            { id: 'comp-de-5-4', text: 'unterscheidet Zeitformen' },
            { id: 'comp-de-5-5', text: 'verwendet Wörter des einfachen Grundwortschatzes' },
        ]
      }
    ],
  },
  {
    id: 'subj-ma',
    name: 'Mathematik',
    categories: [
        {
            id: 'cat-ma-1',
            name: 'Zahlen und Operationen',
            competencies: [
                { id: 'comp-ma-1-1', text: 'unterscheidet Zahlen bis ... und stellt sie verschieden dar' },
                { id: 'comp-ma-1-2', text: 'ordnet Zahlen bis ...' },
                { id: 'comp-ma-1-3', text: 'zerlegt Zahlen bis ...' },
                { id: 'comp-ma-1-4', text: 'beschreibt Vorstellungen zu den Grundrechenoperationen' },
                { id: 'comp-ma-1-5', text: 'addiert im Zahlenraum bis ... mit verschiedenen Strategien' },
                { id: 'comp-ma-1-6', text: 'subtrahiert im Zahlenraum bis ... mit verschiedenen Strategien' },
                { id: 'comp-ma-1-7', text: 'löst die Aufgaben des „kleinen 1+1" automatisiert' },
                { id: 'comp-ma-1-8', text: 'berechnet Produkte mit Hilfe auswendig gelernter Kernaufgaben' },
            ]
        },
        {
            id: 'cat-ma-2',
            name: 'Größen und Messen',
            competencies: [
                { id: 'comp-ma-2-1', text: 'hat Vorstellungen zu Größen und ihren Einheiten' },
                { id: 'comp-ma-2-2', text: 'misst Längen' },
                { id: 'comp-ma-2-3', text: 'liest Uhrzeiten ab' },
                { id: 'comp-ma-2-4', text: 'rechnet mit Größenangaben in Sachzusammenhängen' },
            ]
        },
        {
            id: 'cat-ma-3',
            name: 'Raum und Form',
            competencies: [
                { id: 'comp-ma-3-1', text: 'beschreibt geometrische Objekte' },
                { id: 'comp-ma-3-2', text: 'erkennt spiegelsymmetrische Figuren' },
                { id: 'comp-ma-3-3', text: 'beschreibt Lagebeziehungen geometrischer Objekte' },
                { id: 'comp-ma-3-4', text: 'stellt Modelle ausgewählter Körper her und zeichnet ebene geometrische Figuren' },
                { id: 'comp-ma-3-5', text: 'findet deckungsgleiche ebene Figuren' },
                { id: 'comp-ma-3-6', text: 'bewegt Objekte nach Anweisung' },
            ]
        },
        {
            id: 'cat-ma-4',
            name: 'Gleichungen und Funktionen',
            competencies: [
                { id: 'comp-ma-4-1', text: 'findet zu Sachsituationen Aufgaben (und umgekehrt)' },
                { id: 'comp-ma-4-2', text: 'vergleicht einfache Zahlenterme' },
                { id: 'comp-ma-4-3', text: 'löst einfache Gleichungen mit Platzhalter' },
                { id: 'comp-ma-4-4', text: 'erkennt geometrische und arithmetische Muster' },
                { id: 'comp-ma-4-5', text: 'stellt Muster und Zuordnungen her' },
            ]
        },
        {
            id: 'cat-ma-5',
            name: 'Daten und Zufall',
            competencies: [
                { id: 'comp-ma-5-1', text: 'sammelt Daten und stellt sie in vorgegebener Form dar' },
                { id: 'comp-ma-5-2', text: 'liest Informationen aus Darstellungen' },
                { id: 'comp-ma-5-3', text: 'stellt Lösungen zu kombinatorischen Fragen handelnd oder bildlich dar' },
                { id: 'comp-ma-5-4', text: 'führt einfache Zufallsexperimente durch und ermittelt Ergebnisse' },
            ]
        },
    ]
  },
  {
    id: 'subj-su',
    name: 'Sachunterricht',
    categories: [
        {
            id: 'cat-su-1',
            name: 'Erkennen',
            competencies: [
                { id: 'comp-su-1-1', text: 'bereitet Arbeits- und Lernschritte vor und führt sie aus' },
                { id: 'comp-su-1-2', text: 'wertet Beobachtungen und Versuche aus' },
                { id: 'comp-su-1-3', text: 'nutzt Medien zur Informationsentnahme' },
                { id: 'comp-su-1-4', text: 'vergleicht Unterschiede und ordnet Dinge und Informationen nach Kriterien' },
            ]
        },
        {
            id: 'cat-su-2',
            name: 'Kommunizieren',
            competencies: [
                { id: 'comp-su-2-1', text: 'äußert Vermutungen sachbezogen' },
                { id: 'comp-su-2-2', text: 'bereitet Ergebnisse auf und präsentiert sie (auch medial)' },
                { id: 'comp-su-2-3', text: 'wendet Begriffe und Bezeichnungen richtig an' },
            ]
        },
        {
            id: 'cat-su-3',
            name: 'Urteilen',
            competencies: [
                { id: 'comp-su-3-1', text: 'bewertet Aussagen sachbezogen' },
                { id: 'comp-su-3-2', text: 'unterscheidet verschiedene Standpunkte voneinander' },
            ]
        },
        {
            id: 'cat-su-4',
            name: 'Handeln',
            competencies: [
                { id: 'comp-su-4-1', text: 'handelt in Gemeinschaft verantwortungsvoll' },
                { id: 'comp-su-4-2', text: 'überarbeitet Arbeitsergebnisse kriterienorientiert' },
                { id: 'comp-su-4-3', text: 'nutzt Materialien und Medien sachgerecht' },
            ]
        }
    ]
  },
  {
    id: 'subj-ku',
    name: 'Kunst',
    categories: [
      {
        id: 'cat-ku-1',
        name: 'Wahrnehmen',
        competencies: [
          { id: 'comp-ku-1-1', text: 'erkundet und vergleicht ästhetisches Material' },
          { id: 'comp-ku-1-2', text: 'erprobt und vergleicht künstlerische Vorgehensweisen, Mittel und Materialien' },
          { id: 'comp-ku-1-3', text: 'bringt Eindrücke und Empfindungen zu Kunstwerken/ästhetischen Phänomenen zum Ausdruck' },
        ],
      },
      {
        id: 'cat-ku-2',
        name: 'Gestalten',
        competencies: [
          { id: 'comp-ku-2-1', text: 'erkundet Material sinnlich und folgt seinem Aufforderungscharakter' },
          { id: 'comp-ku-2-2', text: 'setzt ästhetische Praktiken für eigene und gemeinsame Vorhaben ein' },
          { id: 'comp-ku-2-3', text: 'nutzt Werkzeuge, Techniken und Strategien für eigene Gestaltungsideen' },
        ],
      },
      {
        id: 'cat-ku-3',
        name: 'Reflektieren',
        competencies: [
          { id: 'comp-ku-3-1', text: 'teilt ästhetische Wahrnehmungen und Handlungen mit und kommentiert sie' },
          { id: 'comp-ku-3-2', text: 'stellt Arbeitsergebnisse vor' },
          { id: 'comp-ku-3-3', text: 'assoziiert zu ästhetischen Objekten/Kunstwerken und Handlungen' },
        ],
      },
    ],
  },
  {
    id: 'subj-mu',
    name: 'Musik',
    categories: [
      {
        id: 'cat-mu-1',
        name: 'Wahrnehmen und Deuten',
        competencies: [
          { id: 'comp-mu-1-1', text: 'erkennt klangliche Gegensätze und unterscheidet Tonhöhen' },
          { id: 'comp-mu-1-2', text: 'erkennt Rhythmen und Melodien wieder' },
          { id: 'comp-mu-1-3', text: 'gibt den Stimmungsgehalt von Musik wieder' },
        ],
      },
      {
        id: 'cat-mu-2',
        name: 'Gestalten und Aufführen',
        competencies: [
          { id: 'comp-mu-2-1', text: 'singt Melodien nach' },
          { id: 'comp-mu-2-2', text: 'spielt Rhythmen' },
          { id: 'comp-mu-2-3', text: 'experimentiert mit Tönen, Klängen und Geräuschen' },
          { id: 'comp-mu-2-4', text: 'hält sich in gemeinsamen Musiziersituationen an Regeln' },
          { id: 'comp-mu-2-5', text: 'bewegt sich zur Musik' },
        ],
      },
      {
        id: 'cat-mu-3',
        name: 'Reflektieren',
        competencies: [
          { id: 'comp-mu-3-1', text: 'verständigt sich über Musik und musikalische Leistungen' },
          { id: 'comp-mu-3-2', text: 'bewertet musikalische Leistungen' },
        ],
      },
    ],
  },
  {
    id: 'subj-sp',
    name: 'Sport',
    categories: [
      {
        id: 'cat-sp-1',
        name: 'Bewegen und Handeln',
        competencies: [
          { id: 'comp-sp-1-1', text: 'zeigt koordinative Fähigkeiten in verschiedenen Bewegungsfeldern' },
          { id: 'comp-sp-1-2', text: 'zeigt Kondition und Ausdauer' },
          { id: 'comp-sp-1-3', text: 'wendet sportmotorische Fertigkeiten in verschiedenen Bewegungsfeldern an' },
          { id: 'comp-sp-1-4', text: 'kombiniert Bewegungsformen' },
          { id: 'comp-sp-1-5', text: 'setzt anleitende Informationen aus Rückmeldungen/Materialien um' },
        ],
      },
      {
        id: 'cat-sp-2',
        name: 'Interagieren',
        competencies: [
          { id: 'comp-sp-2-1', text: 'handelt regelkonform' },
          { id: 'comp-sp-2-2', text: 'verhält sich kooperativ' },
        ],
      },
    ],
  },
];
