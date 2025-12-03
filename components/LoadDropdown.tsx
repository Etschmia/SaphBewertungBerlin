/**
 * LoadDropdown Component
 * 
 * Provides a dropdown menu for loading class data when classes exist,
 * or a simple button when no classes exist.
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 6.1, 6.4, 6.5
 */

import React, { useState, useRef, useEffect } from 'react';
import { ArrowUpTrayIcon, ChevronDownIcon } from './Icons';
import type { ClassData, AllClassesExport } from '../types';
import { detectFormat } from '../services/classManager';
import { showFormatMismatchWarning } from '../utils/classValidation';

export interface LoadDropdownProps {
  classes: ClassData[];
  onLoadToClass: (
    classId: string | 'unassigned' | 'all',
    fileData: unknown,
    format: 'legacy' | 'multi-class'
  ) => void;
}

/**
 * LoadDropdown - Dropdown menu for loading class data.
 * 
 * When classes exist (Requirements 5.1):
 * - Shows dropdown with options for each class (Requirements 5.2)
 * - Shows "Ohne Klasse" option (Requirements 5.3)
 * - Shows "Alle Klassen" as last entry (Requirements 5.4)
 * 
 * When no classes exist:
 * - Shows a simple load button
 */
const LoadDropdown: React.FC<LoadDropdownProps> = ({
  classes,
  onLoadToClass,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedTarget, setSelectedTarget] = useState<string | 'unassigned' | 'all' | null>(null);

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


  /**
   * Opens file dialog for the selected target.
   * Requirements: 5.5
   */
  const handleMenuClick = (classId: string | 'unassigned' | 'all') => {
    setSelectedTarget(classId);
    setIsOpen(false);
    // Trigger file input click
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  /**
   * Handles file selection and import.
   * Requirements: 5.5, 5.6, 5.7, 6.1, 6.4, 6.5
   */
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || selectedTarget === null) {
      return;
    }

    try {
      const text = await file.text();
      const fileData = JSON.parse(text);
      const format = detectFormat(fileData);

      if (format === 'invalid') {
        alert('Ungültiges Dateiformat. Bitte wählen Sie eine gültige JSON-Datei.');
        return;
      }

      // Check for format mismatch (Requirements 6.1, 6.2)
      // Multi-class file being loaded into single class or unassigned
      if (format === 'multi-class' && selectedTarget !== 'all') {
        const targetClassName = selectedTarget === 'unassigned'
          ? undefined
          : classes.find(c => c.id === selectedTarget)?.name;

        const confirmed = await showFormatMismatchWarning({
          selectedTarget: selectedTarget === 'unassigned' ? 'unassigned' : selectedTarget,
          targetClassName,
          fileData: fileData as AllClassesExport,
        });

        if (!confirmed) {
          // User cancelled - don't change anything (Requirements 6.5)
          return;
        }

        // User confirmed - import all classes (Requirements 6.4)
        onLoadToClass('all', fileData, 'multi-class');
      } else {
        // Normal import - legacy to class/unassigned, or multi-class to all
        onLoadToClass(selectedTarget, fileData, format);
      }
    } catch (error) {
      console.error('Error loading file:', error);
      alert('Fehler beim Laden der Datei. Bitte überprüfen Sie das Dateiformat.');
    } finally {
      // Reset file input to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setSelectedTarget(null);
    }
  };

  /**
   * Handles simple button click when no classes exist.
   */
  const handleSimpleLoad = () => {
    setSelectedTarget('unassigned');
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const hasClasses = classes.length > 0;

  // Hidden file input for file selection (Requirements 5.5)
  const fileInput = (
    <input
      ref={fileInputRef}
      type="file"
      accept=".json"
      onChange={handleFileChange}
      className="hidden"
      aria-label="JSON-Datei auswählen"
    />
  );

  // If no classes exist, show simple button (Requirements 5.1)
  if (!hasClasses) {
    return (
      <>
        {fileInput}
        <button
          onClick={handleSimpleLoad}
          className="flex items-center gap-2 bg-slate-200 text-slate-700 font-medium py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          title="Daten aus JSON laden"
        >
          <ArrowUpTrayIcon />
          Laden
        </button>
      </>
    );
  }

  // Show dropdown when classes exist (Requirements 5.1)
  return (
    <>
      {fileInput}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 bg-slate-200 text-slate-700 font-medium py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          title="Daten aus JSON laden"
        >
          <ArrowUpTrayIcon />
          Laden
          <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 dark:bg-gray-800 dark:border-gray-700">
            {/* Option for each class (Requirements 5.2) */}
            {classes.map((classData) => (
              <button
                key={classData.id}
                onClick={() => handleMenuClick(classData.id)}
                className="w-full flex items-center gap-3 px-4 py-2 text-left text-slate-700 hover:bg-slate-50 transition-colors dark:text-gray-200 dark:hover:bg-gray-700"
              >
                <span className="truncate">{classData.name}</span>
              </button>
            ))}

            {/* "Ohne Klasse" option (Requirements 5.3) */}
            <button
              onClick={() => handleMenuClick('unassigned')}
              className="w-full flex items-center gap-3 px-4 py-2 text-left text-slate-700 hover:bg-slate-50 transition-colors dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Ohne Klasse
            </button>

            {/* Separator before "Alle Klassen" */}
            <hr className="my-1 border-slate-200 dark:border-gray-600" />

            {/* "Alle Klassen" as last entry (Requirements 5.4) */}
            <button
              onClick={() => handleMenuClick('all')}
              className="w-full flex items-center gap-3 px-4 py-2 text-left text-slate-700 hover:bg-slate-50 transition-colors font-medium dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Alle Klassen
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default LoadDropdown;
