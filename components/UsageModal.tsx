import React from 'react';
import { XMarkIcon } from './Icons';

interface UsageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UsageModal: React.FC<UsageModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-slate-700 dark:text-gray-100">
            Benutzungshinweise
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <h3 className="text-xl font-semibold text-slate-700 dark:text-gray-100 mb-4">
              So verwenden Sie den Bewertungs-Assistenten
            </h3>

            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-medium text-slate-700 dark:text-gray-100 mb-2">
                  1. Schüler anlegen
                </h4>
                <p className="text-slate-600 dark:text-gray-300">
                  Klicken Sie auf den blauen "Schüler hinzufügen" Button in der linken Seitenleiste.
                  Geben Sie den Vornamen des Schülers ein (z.B. "Max M."). Der Schüler wird sofort
                  zur Liste hinzugefügt und automatisch ausgewählt.
                </p>
              </div>

              <div>
                <h4 className="text-lg font-medium text-slate-700 dark:text-gray-100 mb-2">
                  2. Bewertungen durchführen
                </h4>
                <p className="text-slate-600 dark:text-gray-300">
                  Wählen Sie einen Schüler aus der Liste aus. Sie sehen alle Fächer und deren
                  Kompetenzen. Klicken Sie auf die gewünschte Bewertung (0-4) für jede Kompetenz.
                  Sie können jederzeit neue Bewertungen hinzufügen - das System speichert alle
                  Bewertungen mit Zeitstempel.
                </p>
              </div>

              <div>
                <h4 className="text-lg font-medium text-slate-700 dark:text-gray-100 mb-2">
                  3. Bewertungshistorie einsehen
                </h4>
                <p className="text-slate-600 dark:text-gray-300">
                  Klicken Sie auf die Zahl einer Bewertung, um die komplette Historie dieser
                  Kompetenz zu sehen. Sie können sehen, wann Sie welche Bewertung vergeben haben.
                  Dies hilft Ihnen, die Entwicklung des Schülers über das Schuljahr zu verfolgen.
                </p>
              </div>

              <div>
                <h4 className="text-lg font-medium text-slate-700 dark:text-gray-100 mb-2">
                  4. Einzelne Bewertungen löschen
                </h4>
                <p className="text-slate-600 dark:text-gray-300">
                  In der Bewertungshistorie können Sie einzelne Bewertungen wieder löschen.
                  Klicken Sie auf das X-Symbol neben der gewünschten Bewertung. Dies ist nützlich,
                  wenn Sie versehentlich eine falsche Bewertung eingegeben haben.
                </p>
              </div>

              <div>
                <h4 className="text-lg font-medium text-slate-700 dark:text-gray-100 mb-2">
                  5. PDF-Export am Schuljahresende
                </h4>
                <p className="text-slate-600 dark:text-gray-300">
                  Am Ende des Schuljahres können Sie für jeden Schüler ein PDF-Zeugnis erstellen.
                  Das System wählt automatisch die am häufigsten vergebene Bewertung für jede
                  Kompetenz aus. Klicken Sie auf "PDF Export" in der oberen Leiste, um das
                  Zeugnis zu generieren.
                </p>
              </div>

              <div>
                <h4 className="text-lg font-medium text-slate-700 dark:text-gray-100 mb-2">
                  6. Daten sichern und laden
                </h4>
                <p className="text-slate-600 dark:text-gray-300">
                  Ihre Daten werden automatisch im Browser gespeichert. Zusätzlich können Sie
                  mit "Speichern" eine JSON-Datei erstellen und mit "Laden" wieder einlesen.
                  Dies ist besonders wichtig für Backups oder den Wechsel zwischen verschiedenen
                  Geräten.
                </p>
              </div>

              <div>
                <h4 className="text-lg font-medium text-slate-700 dark:text-gray-100 mb-2">
                  7. Kompetenzen anpassen
                </h4>
                <p className="text-slate-600 dark:text-gray-300">
                  Sie können Kompetenztexte bearbeiten, indem Sie darauf klicken. Neue Kompetenzen
                  können über das Plus-Symbol in jeder Kategorie hinzugefügt werden. Kategorienamen
                  können ebenfalls angepasst werden.
                </p>
              </div>

              <div>
                <h4 className="text-lg font-medium text-slate-700 dark:text-gray-100 mb-2">
                  8. Klassen verwalten
                </h4>
                <p className="text-slate-600 dark:text-gray-300">
                  Sie können Schüler in Klassen organisieren. Klicken Sie auf den "Klasse" Button, um
                  eine neue Klasse zu erstellen oder zwischen Klassen zu wechseln. Beim Speichern und
                  Laden können Sie wählen, ob Sie nur die aktuelle Klasse oder alle Klassen (als Backup)
                  bearbeiten möchten.
                </p>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="text-lg font-medium text-blue-800 dark:text-blue-200 mb-2">
                Wichtiger Hinweis
              </h4>
              <p className="text-blue-700 dark:text-blue-300">
                Alle Ihre Daten bleiben lokal auf Ihrem Gerät gespeichert. Nichts verlässt
                Ihren Computer - keine Registrierung, keine Anmeldung, keine Datenübertragung
                erforderlich.
              </p>
            </div>

            <div className="mt-6 text-sm text-slate-500 dark:text-gray-400">
              <p>
                <strong>Design-Features:</strong> Die App unterstützt sowohl helles als auch
                dunkles Design. Sie können zwischen den Modi über das Theme-Menü in der oberen
                Leiste wechseln. Die App kann auch als PWA (Progressive Web App) installiert
                werden, um sie offline zu nutzen.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end p-6 border-t border-slate-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
          >
            Verstanden
          </button>
        </div>
      </div>
    </div>
  );
};

export default UsageModal;
