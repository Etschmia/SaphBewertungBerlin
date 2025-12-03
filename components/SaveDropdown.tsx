/**
 * SaveDropdown Component
 * 
 * Provides a dropdown menu for saving class data when classes exist,
 * or a simple button when no classes exist.
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7
 */

import React, { useState, useRef, useEffect } from 'react';
import { ArrowDownTrayIcon, ChevronDownIcon } from './Icons';
import type { ClassData } from '../types';

export interface SaveDropdownProps {
  classes: ClassData[];
  hasUnassigned: boolean;
  onSaveClass: (classId: string | 'unassigned' | 'all') => void;
}

/**
 * SaveDropdown - Dropdown menu for saving class data.
 * 
 * When classes exist (Requirements 4.1):
 * - Shows dropdown with options for each class (Requirements 4.2)
 * - Shows "Ohne Klasse" option if unassigned students exist (Requirements 4.3)
 * - Shows "Alle Klassen" as last entry (Requirements 4.4)
 * 
 * When no classes exist:
 * - Shows a simple save button
 */
const SaveDropdown: React.FC<SaveDropdownProps> = ({
  classes,
  hasUnassigned,
  onSaveClass,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMenuClick = (classId: string | 'unassigned' | 'all') => {
    onSaveClass(classId);
    setIsOpen(false);
  };

  const hasClasses = classes.length > 0;

  // If no classes exist, show simple button (Requirements 4.1)
  if (!hasClasses) {
    return (
      <button
        onClick={() => onSaveClass('unassigned')}
        className="flex items-center gap-2 bg-slate-200 text-slate-700 font-medium py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        title="Daten als JSON speichern"
      >
        <ArrowDownTrayIcon />
        Speichern
      </button>
    );
  }

  // Show dropdown when classes exist (Requirements 4.1)
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-slate-200 text-slate-700 font-medium py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        title="Daten als JSON speichern"
      >
        <ArrowDownTrayIcon />
        Speichern
        <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 dark:bg-gray-800 dark:border-gray-700">
          {/* Option for each class (Requirements 4.2) */}
          {classes.map((classData) => (
            <button
              key={classData.id}
              onClick={() => handleMenuClick(classData.id)}
              className="w-full flex items-center gap-3 px-4 py-2 text-left text-slate-700 hover:bg-slate-50 transition-colors dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <span className="truncate">{classData.name}</span>
            </button>
          ))}

          {/* "Ohne Klasse" option if unassigned students exist (Requirements 4.3) */}
          {hasUnassigned && (
            <button
              onClick={() => handleMenuClick('unassigned')}
              className="w-full flex items-center gap-3 px-4 py-2 text-left text-slate-700 hover:bg-slate-50 transition-colors dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Ohne Klasse
            </button>
          )}

          {/* Separator before "Alle Klassen" */}
          <hr className="my-1 border-slate-200 dark:border-gray-600" />

          {/* "Alle Klassen" as last entry (Requirements 4.4) */}
          <button
            onClick={() => handleMenuClick('all')}
            className="w-full flex items-center gap-3 px-4 py-2 text-left text-slate-700 hover:bg-slate-50 transition-colors font-medium dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Alle Klassen
          </button>
        </div>
      )}
    </div>
  );
};

export default SaveDropdown;
