/**
 * ClassModal Component
 * 
 * Modal dialog for class management operations:
 * - Create new class from current students
 * - Create new empty class
 * - Switch between existing classes
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */

import React, { useState, useCallback } from 'react';
import { XIcon, PlusIcon } from './Icons';
import { validateClassName } from '../utils/classValidation';
import type { ClassData } from '../types';

/**
 * Props for the ClassModal component.
 */
export interface ClassModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Array of all existing classes */
  classes: ClassData[];
  /** ID of the currently active class, or null for unassigned */
  currentClassId: string | null;
  /** Callback to create a new class */
  onCreateClass: (name: string, copyCurrentStudents: boolean) => void;
  /** Callback to switch to a different class (null for unassigned) */
  onSwitchToClass: (classId: string | null) => void;
}

/**
 * ClassModal - Modal dialog for class management.
 * 
 * Provides options to:
 * - Create a new class from current students (Requirement 2.2)
 * - Create a new empty class (Requirement 2.3)
 * - Switch to existing classes (Requirements 2.4, 2.5)
 * 
 * @param props - ClassModalProps
 */
const ClassModal: React.FC<ClassModalProps> = ({
  isOpen,
  onClose,
  classes,
  currentClassId,
  onCreateClass,
  onSwitchToClass,
}) => {
  // State for new class name inputs
  const [newClassNameFromCurrent, setNewClassNameFromCurrent] = useState('');
  const [newClassNameEmpty, setNewClassNameEmpty] = useState('');
  
  // State for validation errors
  const [errorFromCurrent, setErrorFromCurrent] = useState<string | null>(null);
  const [errorEmpty, setErrorEmpty] = useState<string | null>(null);

  /**
   * Handles creating a new class from current students.
   * Requirement 2.2
   */
  const handleCreateFromCurrent = useCallback(() => {
    const validation = validateClassName(newClassNameFromCurrent, classes);
    
    if (!validation.valid) {
      setErrorFromCurrent(validation.error || 'Ungültiger Klassenname');
      return;
    }
    
    onCreateClass(newClassNameFromCurrent.trim(), true);
    setNewClassNameFromCurrent('');
    setErrorFromCurrent(null);
    onClose();
  }, [newClassNameFromCurrent, classes, onCreateClass, onClose]);

  /**
   * Handles creating a new empty class.
   * Requirement 2.3
   */
  const handleCreateEmpty = useCallback(() => {
    const validation = validateClassName(newClassNameEmpty, classes);
    
    if (!validation.valid) {
      setErrorEmpty(validation.error || 'Ungültiger Klassenname');
      return;
    }
    
    onCreateClass(newClassNameEmpty.trim(), false);
    setNewClassNameEmpty('');
    setErrorEmpty(null);
    onClose();
  }, [newClassNameEmpty, classes, onCreateClass, onClose]);

  /**
   * Handles switching to a class.
   * Requirements 2.4, 2.5
   */
  const handleSwitchToClass = useCallback((classId: string | null) => {
    onSwitchToClass(classId);
    onClose();
  }, [onSwitchToClass, onClose]);

  /**
   * Handles key press in input fields.
   */
  const handleKeyPress = useCallback((
    e: React.KeyboardEvent<HTMLInputElement>,
    action: () => void
  ) => {
    if (e.key === 'Enter') {
      action();
    }
  }, []);

  /**
   * Clears errors when input changes.
   */
  const handleInputChangeFromCurrent = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewClassNameFromCurrent(e.target.value);
    if (errorFromCurrent) setErrorFromCurrent(null);
  }, [errorFromCurrent]);

  const handleInputChangeEmpty = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewClassNameEmpty(e.target.value);
    if (errorEmpty) setErrorEmpty(null);
  }, [errorEmpty]);

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="class-modal-title"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-gray-700">
          <h2 
            id="class-modal-title" 
            className="text-xl font-semibold text-slate-800 dark:text-gray-100"
          >
            Klassenverwaltung
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-700 hover:text-slate-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Modal schließen"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Section: Create class from current students - Requirement 2.2 */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-gray-300 uppercase tracking-wide">
              Aktuelle Schülerliste als neue Klasse erfassen
            </h3>
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="text"
                  value={newClassNameFromCurrent}
                  onChange={handleInputChangeFromCurrent}
                  onKeyPress={(e) => handleKeyPress(e, handleCreateFromCurrent)}
                  placeholder="Klassenname eingeben..."
                  className={`w-full px-3 py-2 border rounded-lg text-sm
                    ${errorFromCurrent 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-slate-300 dark:border-gray-600 focus:ring-blue-500'
                    }
                    bg-white dark:bg-gray-700 
                    text-slate-800 dark:text-gray-100
                    placeholder-slate-400 dark:placeholder-gray-500
                    focus:outline-none focus:ring-2`}
                  aria-label="Klassenname für neue Klasse aus aktueller Schülerliste"
                  aria-invalid={!!errorFromCurrent}
                  aria-describedby={errorFromCurrent ? 'error-from-current' : undefined}
                />
                {errorFromCurrent && (
                  <p id="error-from-current" className="mt-1 text-xs text-red-500">
                    {errorFromCurrent}
                  </p>
                )}
              </div>
              <button
                onClick={handleCreateFromCurrent}
                disabled={!newClassNameFromCurrent.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                  disabled:bg-slate-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed
                  transition-colors flex items-center gap-1 text-sm font-medium"
                aria-label="Klasse aus aktueller Schülerliste erstellen"
              >
                <PlusIcon className="w-4 h-4" />
                Erstellen
              </button>
            </div>
          </section>

          {/* Section: Create empty class - Requirement 2.3 */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-gray-300 uppercase tracking-wide">
              Neue Klasse anlegen mit leerer Schülerliste
            </h3>
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="text"
                  value={newClassNameEmpty}
                  onChange={handleInputChangeEmpty}
                  onKeyPress={(e) => handleKeyPress(e, handleCreateEmpty)}
                  placeholder="Klassenname eingeben..."
                  className={`w-full px-3 py-2 border rounded-lg text-sm
                    ${errorEmpty 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-slate-300 dark:border-gray-600 focus:ring-blue-500'
                    }
                    bg-white dark:bg-gray-700 
                    text-slate-800 dark:text-gray-100
                    placeholder-slate-400 dark:placeholder-gray-500
                    focus:outline-none focus:ring-2`}
                  aria-label="Klassenname für neue leere Klasse"
                  aria-invalid={!!errorEmpty}
                  aria-describedby={errorEmpty ? 'error-empty' : undefined}
                />
                {errorEmpty && (
                  <p id="error-empty" className="mt-1 text-xs text-red-500">
                    {errorEmpty}
                  </p>
                )}
              </div>
              <button
                onClick={handleCreateEmpty}
                disabled={!newClassNameEmpty.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 
                  disabled:bg-slate-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed
                  transition-colors flex items-center gap-1 text-sm font-medium"
                aria-label="Leere Klasse erstellen"
              >
                <PlusIcon className="w-4 h-4" />
                Erstellen
              </button>
            </div>
          </section>

          {/* Section: Switch to existing class - Requirements 2.4, 2.5 */}
          {classes.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-gray-300 uppercase tracking-wide">
                Zur Klasse wechseln
              </h3>
              <div className="space-y-2">
                {classes.map((classData) => (
                  <button
                    key={classData.id}
                    onClick={() => handleSwitchToClass(classData.id)}
                    disabled={classData.id === currentClassId}
                    className={`w-full px-4 py-3 rounded-lg text-left transition-colors
                      ${classData.id === currentClassId
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 cursor-default border-2 border-blue-500'
                        : 'bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-200 hover:bg-slate-200 dark:hover:bg-gray-600 border-2 border-transparent'
                      }`}
                    aria-label={`Zur Klasse ${classData.name} wechseln`}
                    aria-current={classData.id === currentClassId ? 'true' : undefined}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{classData.name}</span>
                      <span className="text-xs text-slate-500 dark:text-gray-400">
                        {classData.students.length} Schüler
                      </span>
                    </div>
                    {classData.id === currentClassId && (
                      <span className="text-xs text-blue-600 dark:text-blue-400">
                        (Aktuelle Klasse)
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Section: Switch to unassigned */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-gray-300 uppercase tracking-wide">
              Ohne Klassenzuordnung
            </h3>
            <button
              onClick={() => handleSwitchToClass(null)}
              disabled={currentClassId === null}
              className={`w-full px-4 py-3 rounded-lg text-left transition-colors
                ${currentClassId === null
                  ? 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 cursor-default border-2 border-amber-500'
                  : 'bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-200 hover:bg-slate-200 dark:hover:bg-gray-600 border-2 border-transparent'
                }`}
              aria-label="Zu Schülern ohne Klassenzuordnung wechseln"
              aria-current={currentClassId === null ? 'true' : undefined}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">Ohne Zuordnung</span>
              </div>
              {currentClassId === null && (
                <span className="text-xs text-amber-600 dark:text-amber-400">
                  (Aktuell ausgewählt)
                </span>
              )}
            </button>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-slate-200 dark:bg-gray-700 text-slate-700 dark:text-gray-200 
              rounded-lg hover:bg-slate-300 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClassModal;
