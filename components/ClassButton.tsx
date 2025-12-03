/**
 * ClassButton Component
 * 
 * Displays the current class name or "Ohne Zuordnung" if no class is selected.
 * Clicking the button opens the ClassModal for class management.
 * 
 * Requirements: 1.1, 1.2, 1.3
 */

import React from 'react';

/**
 * Props for the ClassButton component.
 */
export interface ClassButtonProps {
  /** The name of the currently selected class, or "Ohne Zuordnung" if none */
  currentClassName: string;
  /** Callback when the button is clicked to open the class modal */
  onClick: () => void;
}

/**
 * ClassButton - Button that displays the current class and opens the class modal.
 * 
 * - Shows "Ohne Zuordnung" when no class is selected (Requirement 1.2)
 * - Shows the class name when a class is selected (Requirement 1.3)
 * - Positioned above "Schüler hinzufügen" button (Requirement 1.1 - handled in App.tsx)
 * 
 * @param props - ClassButtonProps
 */
const ClassButton: React.FC<ClassButtonProps> = ({ currentClassName, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-1/2 flex items-center justify-center gap-2 bg-slate-200 dark:bg-gray-700 text-slate-700 dark:text-gray-200 font-medium py-2 px-3 rounded-lg hover:bg-slate-300 dark:hover:bg-gray-600 transition-colors text-sm"
      title="Klasse verwalten"
      aria-label={`Aktuelle Klasse: ${currentClassName}. Klicken um Klassenverwaltung zu öffnen.`}
    >
      <span className="font-semibold">Klasse:</span>
      <span className="truncate">{currentClassName}</span>
    </button>
  );
};

export default ClassButton;
