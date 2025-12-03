import React, { useEffect, useState } from 'react';
import { XMarkIcon } from './Icons';
import type { ClassGroup } from '../types';

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassGroup[];
  activeClassId: string | null;
  onCreateFromCurrent: (name: string) => boolean;
  onCreateEmpty: (name: string) => boolean;
  onSwitchClass: (classId: string | null) => void;
}

const ClassModal: React.FC<ClassModalProps> = ({
  isOpen,
  onClose,
  classes,
  activeClassId,
  onCreateFromCurrent,
  onCreateEmpty,
  onSwitchClass,
}) => {
  const [currentName, setCurrentName] = useState('');
  const [emptyName, setEmptyName] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  useEffect(() => {
    if (isOpen) {
      setError(null);
    }
  }, [isOpen]);

  const handleCreateFromCurrent = () => {
    setError(null);
    const success = onCreateFromCurrent(currentName);
    if (success) {
      setCurrentName('');
      onClose();
    } else {
      setError('Bitte geben Sie einen eindeutigen Klassennamen an.');
    }
  };

  const handleCreateEmpty = () => {
    setError(null);
    const success = onCreateEmpty(emptyName);
    if (success) {
      setEmptyName('');
      onClose();
    } else {
      setError('Bitte geben Sie einen eindeutigen Klassennamen an.');
    }
  };

  const handleSwitch = (classId: string | null) => {
    onSwitchClass(classId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-slate-700 dark:text-gray-100">
            Klassen verwalten
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 rounded-md bg-red-100 text-red-700 text-sm dark:bg-red-900/30 dark:text-red-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-slate-200 rounded-lg dark:border-gray-700">
              <h3 className="text-lg font-semibold text-slate-700 dark:text-gray-100">
                Aktuelle Schülerliste als neue Klasse erfassen
              </h3>
              <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
                Erstellt eine Klasse aus der momentan angezeigten Schülerliste.
              </p>
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={currentName}
                  onChange={(e) => setCurrentName(e.target.value)}
                  placeholder="Klassenname"
                  className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                />
                <button
                  onClick={handleCreateFromCurrent}
                  className="px-4 py-2 rounded-md bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors"
                >
                  Speichern
                </button>
              </div>
            </div>

            <div className="p-4 border border-slate-200 rounded-lg dark:border-gray-700">
              <h3 className="text-lg font-semibold text-slate-700 dark:text-gray-100">
                Neue Klasse anlegen mit leerer Schülerliste
              </h3>
              <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
                Legt eine leere Klasse an und wechselt dorthin.
              </p>
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={emptyName}
                  onChange={(e) => setEmptyName(e.target.value)}
                  placeholder="Klassenname"
                  className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                />
                <button
                  onClick={handleCreateEmpty}
                  className="px-4 py-2 rounded-md bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors"
                >
                  Anlegen
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 border border-slate-200 rounded-lg dark:border-gray-700">
            <h3 className="text-lg font-semibold text-slate-700 dark:text-gray-100 mb-2">
              Vorhandene Klassen
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => handleSwitch(null)}
                className={`w-full text-left px-4 py-2 rounded-md border ${!activeClassId ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/30' : 'border-slate-200 dark:border-gray-700'} hover:bg-slate-100 dark:hover:bg-gray-700`}
              >
                Ohne Zuordnung
              </button>
              {classes.length === 0 && (
                <p className="text-sm text-slate-500 dark:text-gray-400">Noch keine Klassen angelegt.</p>
              )}
              {classes.map(cls => (
                <div key={cls.id} className="flex items-center justify-between px-4 py-2 rounded-md border border-slate-200 dark:border-gray-700 hover:bg-slate-100 dark:hover:bg-gray-700">
                  <div>
                    <div className="font-medium text-slate-700 dark:text-gray-100">Klasse {cls.name}</div>
                    <div className="text-xs text-slate-500 dark:text-gray-400">{cls.students.length} Schüler</div>
                  </div>
                  <button
                    onClick={() => handleSwitch(cls.id)}
                    className={`px-3 py-1 rounded-md text-sm font-semibold ${activeClassId === cls.id ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}`}
                  >
                    Zur Klasse wechseln
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end p-6 border-t border-slate-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-300 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClassModal;
