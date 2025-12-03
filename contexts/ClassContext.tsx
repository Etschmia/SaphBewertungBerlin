/**
 * ClassContext - React Context for Class Management
 * 
 * Provides class management functionality throughout the application.
 * Wraps the ClassManager service with React state management.
 * 
 * Requirements: 2.1, 2.5, 3.1
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import type { ClassData, Student, Subject } from '../types';
import { ClassManager, getClassManager } from '../services/classManager';

/**
 * Interface for the ClassContext value.
 * Provides access to class state and management actions.
 */
export interface ClassContextValue {
  // State
  currentClassId: string | null;
  currentClassName: string;
  classes: ClassData[];
  hasClasses: boolean;
  
  // Current class data
  students: Student[];
  subjects: Subject[];
  
  // Actions
  createClass: (name: string, copyCurrentStudents: boolean) => ClassData | null;
  switchToClass: (classId: string | null) => void;
  deleteClass: (classId: string) => void;
  
  // Data updates
  updateStudents: (students: Student[]) => void;
  updateSubjects: (subjects: Subject[]) => void;
  
  // Unassigned management
  hasUnassignedStudents: boolean;
  
  // ClassManager instance for advanced operations
  classManager: ClassManager;
}

// Create the context with null as default
const ClassContext = createContext<ClassContextValue | null>(null);

/**
 * Props for the ClassProvider component.
 */
interface ClassProviderProps {
  children: ReactNode;
}

/**
 * ClassProvider - Provides class management context to the application.
 * 
 * Manages class state using the ClassManager service and provides
 * reactive updates through React state.
 * 
 * Requirements: 2.1, 2.5, 3.1
 */
export const ClassProvider: React.FC<ClassProviderProps> = ({ children }) => {
  // Get the ClassManager singleton
  const classManager = useMemo(() => getClassManager(), []);
  
  // State for current class
  const [currentClassId, setCurrentClassId] = useState<string | null>(() => 
    classManager.getCurrentClassId()
  );
  
  // State for all classes
  const [classes, setClasses] = useState<ClassData[]>(() => 
    classManager.getAllClasses()
  );
  
  // State for current students and subjects
  const [students, setStudents] = useState<Student[]>(() => 
    classManager.getCurrentStudents()
  );
  
  const [subjects, setSubjects] = useState<Subject[]>(() => 
    classManager.getCurrentSubjects()
  );

  // Derived state
  const hasClasses = classes.length > 0;
  const hasUnassignedStudents = classManager.hasUnassignedStudents();
  
  // Get current class name
  const currentClassName = useMemo(() => {
    if (currentClassId === null) {
      return 'Ohne Zuordnung';
    }
    const currentClass = classes.find(c => c.id === currentClassId);
    return currentClass?.name || 'Ohne Zuordnung';
  }, [currentClassId, classes]);

  /**
   * Refreshes state from ClassManager.
   * Called after any operation that modifies the storage.
   */
  const refreshState = useCallback(() => {
    setClasses(classManager.getAllClasses());
    setCurrentClassId(classManager.getCurrentClassId());
    setStudents(classManager.getCurrentStudents());
    setSubjects(classManager.getCurrentSubjects());
  }, [classManager]);

  /**
   * Creates a new class.
   * Requirements: 2.1, 3.1
   * 
   * @param name - The name for the new class
   * @param copyCurrentStudents - If true, copies current students to the new class
   * @returns The created ClassData or null if creation failed
   */
  const createClass = useCallback((name: string, copyCurrentStudents: boolean): ClassData | null => {
    try {
      const studentsToUse = copyCurrentStudents ? students : [];
      const subjectsToUse = copyCurrentStudents ? subjects : classManager.getUnassignedSubjects();
      
      const newClass = classManager.createClass(name, studentsToUse, subjectsToUse);
      
      // If copying current students, clear unassigned if we were in unassigned mode
      if (copyCurrentStudents && currentClassId === null && students.length > 0) {
        classManager.updateUnassignedStudents([], classManager.getUnassignedSubjects());
      }
      
      // Switch to the new class
      classManager.switchToClass(newClass.id);
      
      refreshState();
      return newClass;
    } catch (error) {
      console.error('Error creating class:', error);
      return null;
    }
  }, [classManager, students, subjects, currentClassId, refreshState]);

  /**
   * Switches to a different class or to unassigned mode.
   * Requirements: 2.5
   * 
   * @param classId - The class ID to switch to, or null for unassigned
   */
  const switchToClass = useCallback((classId: string | null) => {
    try {
      if (classId === null) {
        classManager.switchToUnassigned();
      } else {
        classManager.switchToClass(classId);
      }
      refreshState();
    } catch (error) {
      console.error('Error switching class:', error);
    }
  }, [classManager, refreshState]);

  /**
   * Deletes a class.
   * 
   * @param classId - The ID of the class to delete
   */
  const deleteClass = useCallback((classId: string) => {
    try {
      classManager.deleteClass(classId);
      refreshState();
    } catch (error) {
      console.error('Error deleting class:', error);
    }
  }, [classManager, refreshState]);

  /**
   * Updates students in the current class.
   * Requirements: 3.1
   * 
   * @param newStudents - The updated students array
   */
  const updateStudents = useCallback((newStudents: Student[]) => {
    try {
      classManager.updateCurrentClass(newStudents, subjects);
      setStudents(newStudents);
    } catch (error) {
      console.error('Error updating students:', error);
    }
  }, [classManager, subjects]);

  /**
   * Updates subjects in the current class.
   * 
   * @param newSubjects - The updated subjects array
   */
  const updateSubjects = useCallback((newSubjects: Subject[]) => {
    try {
      classManager.updateCurrentClass(students, newSubjects);
      setSubjects(newSubjects);
    } catch (error) {
      console.error('Error updating subjects:', error);
    }
  }, [classManager, students]);

  // Initialize state on mount
  useEffect(() => {
    refreshState();
  }, [refreshState]);

  // Context value
  const contextValue: ClassContextValue = useMemo(() => ({
    currentClassId,
    currentClassName,
    classes,
    hasClasses,
    students,
    subjects,
    createClass,
    switchToClass,
    deleteClass,
    updateStudents,
    updateSubjects,
    hasUnassignedStudents,
    classManager,
  }), [
    currentClassId,
    currentClassName,
    classes,
    hasClasses,
    students,
    subjects,
    createClass,
    switchToClass,
    deleteClass,
    updateStudents,
    updateSubjects,
    hasUnassignedStudents,
    classManager,
  ]);

  return (
    <ClassContext.Provider value={contextValue}>
      {children}
    </ClassContext.Provider>
  );
};

/**
 * useClass - Hook to access the ClassContext.
 * 
 * Must be used within a ClassProvider.
 * 
 * @returns The ClassContextValue
 * @throws Error if used outside of ClassProvider
 */
export function useClass(): ClassContextValue {
  const context = useContext(ClassContext);
  
  if (context === null) {
    throw new Error('useClass must be used within a ClassProvider');
  }
  
  return context;
}

// Export the context for testing purposes
export { ClassContext };
