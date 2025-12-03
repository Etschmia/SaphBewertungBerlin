/**
 * Class Validation Utilities
 * 
 * Provides validation functions for class management operations.
 * Requirements: 6.1, 6.2, 6.3
 */

import type { ClassData, AllClassesExport } from '../types';

/**
 * Maximum allowed length for class names.
 */
const MAX_CLASS_NAME_LENGTH = 50;

/**
 * Result of class name validation.
 */
export interface ClassNameValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates a class name for creation or update.
 * Checks for empty names, length limits, and duplicates.
 * 
 * Requirements: 6.3
 * 
 * @param name - The class name to validate
 * @param existingClasses - Array of existing classes to check for duplicates
 * @param excludeClassId - Optional class ID to exclude from duplicate check (for updates)
 * @returns Validation result with valid flag and optional error message
 */
export function validateClassName(
  name: string,
  existingClasses: ClassData[],
  excludeClassId?: string
): ClassNameValidationResult {
  // Check for empty or whitespace-only name
  if (!name || name.trim() === '') {
    return { valid: false, error: 'Klassenname darf nicht leer sein' };
  }

  const trimmedName = name.trim();

  // Check length limit
  if (trimmedName.length > MAX_CLASS_NAME_LENGTH) {
    return { valid: false, error: `Klassenname zu lang (max. ${MAX_CLASS_NAME_LENGTH} Zeichen)` };
  }

  // Check for duplicates (case-sensitive)
  const isDuplicate = existingClasses.some(c => {
    // Skip the class being updated
    if (excludeClassId && c.id === excludeClassId) {
      return false;
    }
    return c.name === trimmedName;
  });

  if (isDuplicate) {
    return { valid: false, error: 'Eine Klasse mit diesem Namen existiert bereits' };
  }

  return { valid: true };
}

/**
 * Options for format mismatch warning.
 */
export interface FormatMismatchWarningOptions {
  selectedTarget: string | 'unassigned';
  targetClassName?: string;
  fileData: AllClassesExport;
}

/**
 * Generates the warning message for format mismatch scenarios.
 * Used when a multi-class file is being loaded into a single class.
 * 
 * Requirements: 6.1, 6.2
 * 
 * @param options - Warning options including target and file data
 * @returns The warning message string
 */
export function getFormatMismatchWarningMessage(options: FormatMismatchWarningOptions): string {
  const { selectedTarget, targetClassName, fileData } = options;

  // Determine the target name for display
  const targetName = selectedTarget === 'unassigned'
    ? 'Ohne Klasse'
    : targetClassName || 'unbekannte Klasse';

  // Count classes in the file for informative message
  const classCount = fileData.classes?.length || 0;
  const hasUnassigned = (fileData.unassignedStudents?.length || 0) > 0;

  let fileDescription = '';
  if (classCount > 0 && hasUnassigned) {
    fileDescription = `${classCount} Klasse${classCount !== 1 ? 'n' : ''} und Schüler ohne Zuordnung`;
  } else if (classCount > 0) {
    fileDescription = `${classCount} Klasse${classCount !== 1 ? 'n' : ''}`;
  } else if (hasUnassigned) {
    fileDescription = 'Schüler ohne Zuordnung';
  } else {
    fileDescription = 'alle Klassen';
  }

  return `Sie haben "${targetName}" zum Laden ausgewählt, aber die Datei enthält Daten für ${fileDescription}.\n\n` +
    `Wenn Sie fortfahren, wird Ihr gesamter LocalStorage überschrieben.\n\n` +
    `Möchten Sie fortfahren?`;
}

/**
 * Shows a format mismatch warning dialog using window.confirm.
 * Returns a promise that resolves to true if user confirms, false otherwise.
 * 
 * Requirements: 6.1, 6.2, 6.3
 * 
 * @param options - Warning options including target and file data
 * @returns Promise resolving to user's choice (true = confirm, false = cancel)
 */
export function showFormatMismatchWarning(options: FormatMismatchWarningOptions): Promise<boolean> {
  const message = getFormatMismatchWarningMessage(options);
  return Promise.resolve(window.confirm(message));
}

/**
 * Synchronous version of showFormatMismatchWarning for simpler use cases.
 * 
 * Requirements: 6.1, 6.2, 6.3
 * 
 * @param options - Warning options including target and file data
 * @returns User's choice (true = confirm, false = cancel)
 */
export function showFormatMismatchWarningSync(options: FormatMismatchWarningOptions): boolean {
  const message = getFormatMismatchWarningMessage(options);
  return window.confirm(message);
}

/**
 * Validation error class for class-related validation failures.
 */
export class ClassValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ClassValidationError';
  }
}
