/**
 * ClassManager Service
 * 
 * Manages multiple classes of students with LocalStorage persistence.
 * Provides format detection, migration from legacy format, and CRUD operations.
 * 
 * Requirements: 3.4, 7.1, 7.4, 2.1, 2.5, 3.1, 1.2, 4.3, 5.7, 3.2, 3.3
 */

import type {
  Student,
  Subject,
  AppState,
  ClassData,
  MultiClassStorage,
  AllClassesExport,
  DataFormat,
} from '../types';
import { STORAGE_KEYS } from '../types';
import { initialSubjects } from '../data/initialData';

/**
 * Detects the format of JSON data.
 * Requirements: 7.1, 7.4
 */
export function detectFormat(data: unknown): DataFormat {
  if (!data || typeof data !== 'object') {
    return 'invalid';
  }

  const obj = data as Record<string, unknown>;

  // Multi-Class-Format has 'classes' Array and version
  if (obj.version && obj.classes && Array.isArray(obj.classes)) {
    return 'multi-class';
  }

  // Legacy-Format has directly 'students' and 'subjects'
  if (obj.students && Array.isArray(obj.students) &&
      obj.subjects && Array.isArray(obj.subjects)) {
    return 'legacy';
  }

  return 'invalid';
}

/**
 * Migrates legacy AppState to MultiClassStorage.
 * Requirements: 7.1, 7.4
 */
export function migrateFromLegacy(legacyState: AppState): MultiClassStorage {
  return {
    version: '3.0',
    classes: [],
    unassignedStudents: legacyState.students || [],
    unassignedSubjects: legacyState.subjects || initialSubjects,
    currentClassId: null,
    lastModified: Date.now(),
  };
}


/**
 * Generates a unique class ID.
 */
function generateClassId(): string {
  return `class-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Creates an empty MultiClassStorage structure.
 */
function createEmptyStorage(): MultiClassStorage {
  return {
    version: '3.0',
    classes: [],
    unassignedStudents: [],
    unassignedSubjects: initialSubjects,
    currentClassId: null,
    lastModified: Date.now(),
  };
}

/**
 * ClassManager - Manages multiple classes with LocalStorage persistence.
 */
export class ClassManager {
  private storage: MultiClassStorage;

  constructor() {
    this.storage = this.initialize();
  }

  /**
   * Initializes the ClassManager by loading from LocalStorage.
   * Handles migration from legacy format.
   * Requirements: 3.4, 7.1, 7.4
   */
  initialize(): MultiClassStorage {
    // First check for multi-class storage
    const multiClassData = localStorage.getItem(STORAGE_KEYS.MULTI_CLASS);
    if (multiClassData) {
      try {
        const parsed = JSON.parse(multiClassData);
        const format = detectFormat(parsed);
        if (format === 'multi-class') {
          return this.validateAndRepairStorage(parsed as MultiClassStorage);
        }
      } catch (error) {
        console.error('Error parsing multi-class storage:', error);
      }
    }

    // Check for legacy storage and migrate
    const legacyData = localStorage.getItem(STORAGE_KEYS.LEGACY);
    if (legacyData) {
      try {
        const parsed = JSON.parse(legacyData);
        const format = detectFormat(parsed);
        if (format === 'legacy') {
          const migrated = migrateFromLegacy(parsed as AppState);
          this.storage = migrated;
          this.save();
          return migrated;
        }
      } catch (error) {
        console.error('Error parsing legacy storage:', error);
      }
    }

    // Return empty storage if nothing exists
    return createEmptyStorage();
  }

  /**
   * Validates and repairs storage structure.
   */
  private validateAndRepairStorage(storage: MultiClassStorage): MultiClassStorage {
    return {
      version: storage.version || '3.0',
      classes: Array.isArray(storage.classes) ? storage.classes : [],
      unassignedStudents: Array.isArray(storage.unassignedStudents) ? storage.unassignedStudents : [],
      unassignedSubjects: Array.isArray(storage.unassignedSubjects) ? storage.unassignedSubjects : initialSubjects,
      currentClassId: storage.currentClassId ?? null,
      lastModified: storage.lastModified || Date.now(),
    };
  }


  // ============================================
  // Class Management Methods (Requirements: 2.1, 2.5, 3.1)
  // ============================================

  /**
   * Creates a new class with the given name and students.
   * Requirements: 2.1, 3.1
   */
  createClass(name: string, students: Student[], subjects: Subject[]): ClassData {
    const newClass: ClassData = {
      id: generateClassId(),
      name: name.trim(),
      students: students || [],
      subjects: subjects || initialSubjects,
      lastModified: Date.now(),
    };

    this.storage.classes.push(newClass);
    this.storage.lastModified = Date.now();
    this.save();

    return newClass;
  }

  /**
   * Gets a class by ID.
   */
  getClass(classId: string): ClassData | null {
    return this.storage.classes.find(c => c.id === classId) || null;
  }

  /**
   * Gets all classes.
   */
  getAllClasses(): ClassData[] {
    return [...this.storage.classes];
  }

  /**
   * Switches to a specific class.
   * Requirements: 2.5
   */
  switchToClass(classId: string): void {
    const targetClass = this.getClass(classId);
    if (!targetClass) {
      throw new Error(`Class with ID ${classId} not found`);
    }

    this.storage.currentClassId = classId;
    this.storage.lastModified = Date.now();
    this.save();
  }

  /**
   * Deletes a class by ID.
   */
  deleteClass(classId: string): void {
    const index = this.storage.classes.findIndex(c => c.id === classId);
    if (index === -1) {
      throw new Error(`Class with ID ${classId} not found`);
    }

    this.storage.classes.splice(index, 1);

    // If deleted class was current, switch to unassigned
    if (this.storage.currentClassId === classId) {
      this.storage.currentClassId = null;
    }

    this.storage.lastModified = Date.now();
    this.save();
  }

  /**
   * Gets the currently selected class.
   */
  getCurrentClass(): ClassData | null {
    if (!this.storage.currentClassId) {
      return null;
    }
    return this.getClass(this.storage.currentClassId);
  }

  /**
   * Gets the current class ID.
   */
  getCurrentClassId(): string | null {
    return this.storage.currentClassId;
  }

  /**
   * Gets students from the current class or unassigned.
   */
  getCurrentStudents(): Student[] {
    const currentClass = this.getCurrentClass();
    if (currentClass) {
      return [...currentClass.students];
    }
    return [...this.storage.unassignedStudents];
  }

  /**
   * Gets subjects from the current class or unassigned.
   */
  getCurrentSubjects(): Subject[] {
    const currentClass = this.getCurrentClass();
    if (currentClass) {
      return [...currentClass.subjects];
    }
    return [...this.storage.unassignedSubjects];
  }


  // ============================================
  // Unassigned Management (Requirements: 1.2, 4.3, 5.7)
  // ============================================

  /**
   * Gets students without class assignment.
   * Requirements: 4.3
   */
  getUnassignedStudents(): Student[] {
    return [...this.storage.unassignedStudents];
  }

  /**
   * Gets subjects for unassigned students.
   */
  getUnassignedSubjects(): Subject[] {
    return [...this.storage.unassignedSubjects];
  }

  /**
   * Updates unassigned students and subjects.
   * Requirements: 5.7
   */
  updateUnassignedStudents(students: Student[], subjects: Subject[]): void {
    this.storage.unassignedStudents = students || [];
    this.storage.unassignedSubjects = subjects || initialSubjects;
    this.storage.lastModified = Date.now();
    this.save();
  }

  /**
   * Switches to unassigned mode (no class selected).
   * Requirements: 1.2
   */
  switchToUnassigned(): void {
    this.storage.currentClassId = null;
    this.storage.lastModified = Date.now();
    this.save();
  }

  /**
   * Checks if there are unassigned students.
   */
  hasUnassignedStudents(): boolean {
    return this.storage.unassignedStudents.length > 0;
  }

  // ============================================
  // Persistence (Requirements: 3.1, 3.2, 3.3)
  // ============================================

  /**
   * Saves the current storage to LocalStorage.
   * Handles QuotaExceededError.
   * Requirements: 3.1, 3.2, 3.3
   */
  save(): void {
    try {
      const jsonString = JSON.stringify(this.storage);

      // Check size (LocalStorage limit is typically 5-10MB)
      if (jsonString.length > 5 * 1024 * 1024) {
        throw new Error('Daten zu groß für LocalStorage (max. 5MB)');
      }

      localStorage.setItem(STORAGE_KEYS.MULTI_CLASS, jsonString);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.error('LocalStorage quota exceeded');
        throw new Error('LocalStorage-Speicher voll. Bitte exportieren Sie Ihre Daten und löschen Sie alte Klassen.');
      }
      console.error('Error saving to LocalStorage:', error);
      throw error;
    }
  }

  /**
   * Loads storage from LocalStorage with validation.
   * Requirements: 3.4
   */
  load(): MultiClassStorage {
    this.storage = this.initialize();
    return this.storage;
  }

  /**
   * Updates the current class with new students and subjects.
   * Automatically saves to LocalStorage.
   * Requirements: 3.2, 3.3
   */
  updateCurrentClass(students: Student[], subjects: Subject[]): void {
    const currentClass = this.getCurrentClass();

    if (currentClass) {
      // Update the class in the array
      const index = this.storage.classes.findIndex(c => c.id === currentClass.id);
      if (index !== -1) {
        this.storage.classes[index] = {
          ...currentClass,
          students: students || [],
          subjects: subjects || currentClass.subjects,
          lastModified: Date.now(),
        };
      }
    } else {
      // Update unassigned
      this.storage.unassignedStudents = students || [];
      this.storage.unassignedSubjects = subjects || this.storage.unassignedSubjects;
    }

    this.storage.lastModified = Date.now();
    this.save();
  }

  /**
   * Checks if any classes exist.
   */
  hasClasses(): boolean {
    return this.storage.classes.length > 0;
  }

  /**
   * Gets the full storage object (for debugging/export).
   */
  getStorage(): MultiClassStorage {
    return { ...this.storage };
  }


  // ============================================
  // Import/Export (Requirements: 4.5, 4.6, 4.7, 5.6, 7.2, 7.3)
  // ============================================

  /**
   * Exports a single class in Legacy format (AppState).
   * Requirements: 4.5
   */
  exportClass(classId: string | 'unassigned'): AppState {
    if (classId === 'unassigned') {
      return {
        students: this.storage.unassignedStudents,
        subjects: this.storage.unassignedSubjects,
      };
    }

    const targetClass = this.getClass(classId);
    if (!targetClass) {
      throw new Error(`Class with ID ${classId} not found`);
    }

    return {
      students: targetClass.students,
      subjects: targetClass.subjects,
    };
  }

  /**
   * Exports all classes in the new format.
   * Requirements: 4.7
   */
  exportAllClasses(): AllClassesExport {
    return {
      version: '3.0',
      exportDate: new Date().toISOString(),
      classes: this.storage.classes,
      unassignedStudents: this.storage.unassignedStudents,
      unassignedSubjects: this.storage.unassignedSubjects,
    };
  }

  /**
   * Imports data into a specific class (Legacy format).
   * Requirements: 5.6, 7.2
   */
  importToClass(data: AppState, classId: string | 'unassigned'): void {
    if (classId === 'unassigned') {
      this.storage.unassignedStudents = data.students || [];
      this.storage.unassignedSubjects = data.subjects || initialSubjects;
    } else {
      const index = this.storage.classes.findIndex(c => c.id === classId);
      if (index === -1) {
        throw new Error(`Class with ID ${classId} not found`);
      }

      this.storage.classes[index] = {
        ...this.storage.classes[index],
        students: data.students || [],
        subjects: data.subjects || this.storage.classes[index].subjects,
        lastModified: Date.now(),
      };
    }

    this.storage.lastModified = Date.now();
    this.save();
  }

  /**
   * Imports all classes from the new format.
   * Requirements: 6.4
   */
  importAllClasses(data: AllClassesExport): void {
    this.storage = {
      version: '3.0',
      classes: data.classes || [],
      unassignedStudents: data.unassignedStudents || [],
      unassignedSubjects: data.unassignedSubjects || initialSubjects,
      currentClassId: null,
      lastModified: Date.now(),
    };

    this.save();
  }

  /**
   * Handles import with format detection.
   * Returns true if format mismatch warning should be shown.
   * Requirements: 6.1, 7.1, 7.4
   */
  handleImport(
    fileData: unknown,
    targetClassId: string | 'unassigned' | 'all'
  ): { needsWarning: boolean; format: DataFormat } {
    const format = detectFormat(fileData);

    if (format === 'invalid') {
      throw new Error('Ungültiges Dateiformat');
    }

    // Check for format mismatch
    if (format === 'multi-class' && targetClassId !== 'all') {
      return { needsWarning: true, format };
    }

    // Perform the import
    if (format === 'multi-class' && targetClassId === 'all') {
      this.importAllClasses(fileData as AllClassesExport);
    } else if (format === 'legacy') {
      this.importToClass(fileData as AppState, targetClassId === 'all' ? 'unassigned' : targetClassId);
    }

    return { needsWarning: false, format };
  }

  /**
   * Forces import of multi-class data (after user confirmation).
   * Requirements: 6.4
   */
  forceImportAllClasses(data: AllClassesExport): void {
    this.importAllClasses(data);
  }
}

/**
 * Generates a filename for export with proper formatting.
 * Replaces spaces with underscores in class names.
 * Requirements: 4.5, 4.6, 4.7, 4.8
 * 
 * @param classId - The class ID, 'unassigned', or 'all'
 * @param className - Optional class name (required when classId is a specific class)
 * @returns Formatted filename string
 */
export function generateFileName(
  classId: string | 'unassigned' | 'all',
  className?: string
): string {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS

  let prefix: string;
  if (classId === 'all') {
    prefix = 'Alle_Klassen';
  } else if (classId === 'unassigned') {
    prefix = 'Ohne_Klasse';
  } else {
    // Replace spaces with underscores (Requirements 4.8)
    prefix = className?.replace(/\s+/g, '_') || 'Klasse';
  }

  return `BewertungSaph_${prefix}_${dateStr}_${timeStr}.json`;
}

// Singleton instance
let classManagerInstance: ClassManager | null = null;

/**
 * Gets the ClassManager singleton instance.
 */
export function getClassManager(): ClassManager {
  if (!classManagerInstance) {
    classManagerInstance = new ClassManager();
  }
  return classManagerInstance;
}

/**
 * Resets the ClassManager singleton (for testing).
 */
export function resetClassManager(): void {
  classManagerInstance = null;
}
