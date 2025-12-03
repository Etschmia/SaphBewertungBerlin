/**
 * App.tsx - Main Application Component
 * 
 * Integrated with ClassManager for multi-class support.
 * Requirements: 1.1, 3.2, 3.3, 4.1, 5.1
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { initialSubjects } from './data/initialData';
import type { Student, Subject, Rating, Competency, RatingEntry, AllClassesExport, AppState } from './types';
import { sanitizeStudent, validateAssessmentData, ValidationError, DataMigrationError } from './utils/validation';
import StudentList from './components/StudentList';
import AssessmentForm from './components/AssessmentForm';
import ExtrasDropdown from './components/ExtrasDropdown';
import ThemeSelector from './components/ThemeSelector';
import AboutModal from './components/AboutModal';
import UpdateInfoModal from './components/UpdateInfoModal';
import UsageModal from './components/UsageModal';
import ErrorBoundary from './components/ErrorBoundary';
import ClassButton from './components/ClassButton';
import ClassModal from './components/ClassModal';
import SaveDropdown from './components/SaveDropdown';
import LoadDropdown from './components/LoadDropdown';
import { ClassProvider, useClass } from './contexts/ClassContext';
import { generateFileName, detectFormat } from './services/classManager';
import { generatePdf } from './services/pdfGenerator';
import { useUpdateService, installPWA } from './services/updateService';
import { PlusIcon, DocumentArrowDownIcon } from './components/Icons';
import { Analytics } from "@vercel/analytics/react";
import packageJson from './package.json';

/**
 * Inner App component that uses the ClassContext.
 * Separated to allow useClass hook usage within ClassProvider.
 */
const AppContent: React.FC = () => {
  // Class context for multi-class management
  const {
    currentClassId,
    currentClassName,
    classes,
    hasClasses,
    students,
    subjects,
    createClass,
    switchToClass,
    updateStudents,
    updateSubjects,
    hasUnassignedStudents,
    classManager,
  } = useClass();

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [updateInfoStatus, setUpdateInfoStatus] = useState<'success' | 'fail' | 'unchanged'>('unchanged');
  const [updateBuildInfo, setUpdateBuildInfo] = useState<any>(null);
  const [isUpdateInfoModalOpen, setIsUpdateInfoModalOpen] = useState(false);

  // Set initial selected student when students change
  useEffect(() => {
    if (students.length > 0 && !students.find(s => s.id === selectedStudentId)) {
      setSelectedStudentId(students[0].id);
    } else if (students.length === 0) {
      setSelectedStudentId(null);
    }
  }, [students, selectedStudentId]);

  // Enhanced migration function with comprehensive error handling
  const migrateStudentData = useCallback((student: any, index?: number): Student => {
    try {
      const sanitized = sanitizeStudent(student, index);
      if (!sanitized) {
        throw new DataMigrationError('Failed to sanitize student data', student);
      }
      
      if (sanitized.assessments && typeof sanitized.assessments === 'object') {
        const validation = validateAssessmentData(sanitized.assessments);
        if (!validation.isValid) {
          console.warn(`Assessment validation warnings for student ${sanitized.name}:`, validation.errors);
        }
      }
      
      return sanitized;
    } catch (error) {
      console.error('Error migrating student data:', error, student);
      
      return {
        id: `student-fallback-${Date.now()}-${index || 0}`,
        name: `Schüler ${(index || 0) + 1} (Wiederhergestellt)`,
        assessments: {}
      };
    }
  }, []);

  const addStudent = () => {
    const name = prompt("Bitte geben Sie den Vornamen des Schülers ein (z.B. Max M.):");
    if (name) {
      const newStudent: Student = {
        id: `student-${Date.now()}`,
        name,
        assessments: {},
      };
      const newStudents = [...students, newStudent];
      updateStudents(newStudents);
      setSelectedStudentId(newStudent.id);
    }
  };

  const deleteStudent = (studentId: string) => {
    if (window.confirm("Möchten Sie diesen Schüler wirklich löschen? Alle Bewertungen gehen verloren.")) {
      const updatedStudents = students.filter(s => s.id !== studentId);
      updateStudents(updatedStudents);
      if (selectedStudentId === studentId) {
        setSelectedStudentId(updatedStudents.length > 0 ? updatedStudents[0].id : null);
      }
    }
  };

  const handleAssessmentAdd = useCallback((competencyId: string, rating: Rating) => {
    if (!selectedStudentId) {
      console.warn('No student selected for assessment add');
      return;
    }

    try {
      if (!competencyId || typeof competencyId !== 'string' || competencyId.trim() === '') {
        throw new ValidationError('Invalid competency ID');
      }
      
      if (typeof rating !== 'number' || !Number.isInteger(rating) || rating < 0 || rating > 4) {
        throw new ValidationError('Invalid rating value');
      }

      const newEntry: RatingEntry = {
        rating,
        timestamp: Date.now()
      };

      const updatedStudents = students.map(student => {
        if (student.id !== selectedStudentId) return student;
        
        try {
          const existingEntries = student.assessments[competencyId] || [];
          
          const validExistingEntries = existingEntries.filter((entry: RatingEntry) => {
            return entry && 
                   typeof entry === 'object' && 
                   typeof entry.rating === 'number' && 
                   typeof entry.timestamp === 'number' &&
                   entry.timestamp > 0;
          });
          
          return {
            ...student,
            assessments: {
              ...student.assessments,
              [competencyId]: [...validExistingEntries, newEntry],
            },
          };
        } catch (error) {
          console.error('Error updating student assessments:', error);
          return student;
        }
      });

      updateStudents(updatedStudents);
    } catch (error) {
      console.error('Error in handleAssessmentAdd:', error);
    }
  }, [selectedStudentId, students, updateStudents]);

  const handleAssessmentDelete = useCallback((competencyId: string, rating: Rating, timestamp: number) => {
    if (!selectedStudentId) {
      console.warn('No student selected for assessment delete');
      return;
    }

    try {
      if (!competencyId || typeof competencyId !== 'string' || competencyId.trim() === '') {
        throw new ValidationError('Invalid competency ID');
      }
      
      if (typeof rating !== 'number' || !Number.isInteger(rating) || rating < 0 || rating > 4) {
        throw new ValidationError('Invalid rating value');
      }
      
      if (typeof timestamp !== 'number' || timestamp <= 0) {
        throw new ValidationError('Invalid timestamp');
      }

      const updatedStudents = students.map(student => {
        if (student.id !== selectedStudentId) return student;
        
        try {
          const existingEntries = student.assessments[competencyId] || [];
          
          const filteredEntries = existingEntries.filter((entry: RatingEntry) => {
            if (!entry || typeof entry !== 'object') return false;
            if (typeof entry.rating !== 'number' || typeof entry.timestamp !== 'number') return false;
            
            return !(entry.rating === rating && entry.timestamp === timestamp);
          });
          
          return {
            ...student,
            assessments: {
              ...student.assessments,
              [competencyId]: filteredEntries,
            },
          };
        } catch (error) {
          console.error('Error filtering student assessments:', error);
          return student;
        }
      });

      updateStudents(updatedStudents);
    } catch (error) {
      console.error('Error in handleAssessmentDelete:', error);
    }
  }, [selectedStudentId, students, updateStudents]);
  
  const handleCompetencyTextChange = (subjectId: string, categoryId: string, competencyId: string, newText: string) => {
    const updatedSubjects = subjects.map(subject => {
      if(subject.id !== subjectId) return subject;
      return {
        ...subject,
        categories: subject.categories.map(category => {
          if(category.id !== categoryId) return category;
          return {
            ...category,
            competencies: category.competencies.map(comp => 
              comp.id === competencyId ? {...comp, text: newText} : comp
            )
          }
        })
      }
    });
    updateSubjects(updatedSubjects);
  };
  
  const handleCategoryNameChange = (subjectId: string, categoryId: string, newName: string) => {
    const updatedSubjects = subjects.map(subject => {
      if(subject.id !== subjectId) return subject;
      return {
        ...subject,
        categories: subject.categories.map(category => 
          category.id === categoryId ? {...category, name: newName} : category
        )
      }
    });
    updateSubjects(updatedSubjects);
  };

  const addCompetency = (subjectId: string, categoryId: string) => {
    const text = prompt("Text für die neue Kompetenz:");
    if (text) {
      const newCompetency: Competency = { id: `comp-${Date.now()}`, text };
      const updatedSubjects = subjects.map(subject => {
        if (subject.id !== subjectId) return subject;
        return {
          ...subject,
          categories: subject.categories.map(category => {
            if (category.id !== categoryId) return category;
            return {
              ...category,
              competencies: [...category.competencies, newCompetency]
            }
          })
        }
      });
      updateSubjects(updatedSubjects);
    }
  };

  /**
   * Handles saving class data via SaveDropdown.
   * Requirements: 4.1, 4.5, 4.6, 4.7
   */
  const handleSaveClass = useCallback((classId: string | 'unassigned' | 'all') => {
    try {
      let exportData: any;
      let fileName: string;

      if (classId === 'all') {
        // Export all classes (Requirements 4.7)
        exportData = classManager.exportAllClasses();
        fileName = generateFileName('all');
      } else {
        // Export single class or unassigned (Requirements 4.5, 4.6)
        const appState = classManager.exportClass(classId);
        exportData = {
          version: "2.0",
          exportDate: new Date().toISOString(),
          ...appState
        };
        
        if (classId === 'unassigned') {
          fileName = generateFileName('unassigned');
        } else {
          const classData = classManager.getClass(classId);
          fileName = generateFileName(classId, classData?.name);
        }
      }

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", fileName);
      
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      
      console.log("JSON export successful:", { classId, fileName });
    } catch (error) {
      console.error("Fehler beim JSON-Export:", error);
      alert("Fehler beim Exportieren der Daten. Bitte versuchen Sie es erneut.");
    }
  }, [classManager]);

  /**
   * Handles loading class data via LoadDropdown.
   * Requirements: 5.1, 5.6, 5.7, 6.1, 6.4
   */
  const handleLoadToClass = useCallback((
    classId: string | 'unassigned' | 'all',
    fileData: unknown,
    format: 'legacy' | 'multi-class'
  ) => {
    try {
      if (format === 'multi-class') {
        // Import all classes (Requirements 6.4)
        classManager.importAllClasses(fileData as AllClassesExport);
        
        // Refresh the context state
        const allClasses = classManager.getAllClasses();
        const studentCount = allClasses.reduce((sum, c) => sum + c.students.length, 0);
        alert(`Alle Klassen erfolgreich importiert!\n${allClasses.length} Klassen mit insgesamt ${studentCount} Schülern wurden geladen.`);
      } else {
        // Import legacy format to specific class (Requirements 5.6, 5.7, 7.2)
        const appState = fileData as AppState;
        
        // Migrate students if needed
        const migratedStudents = appState.students.map((student: any, index: number) => {
          try {
            return migrateStudentData(student, index);
          } catch (migrationError) {
            console.warn(`Migration warning for student ${index}:`, migrationError);
            return {
              id: student.id || `student-${Date.now()}-${index}`,
              name: student.name || `Schüler ${index + 1}`,
              assessments: {}
            };
          }
        });

        const migratedData: AppState = {
          students: migratedStudents,
          subjects: appState.subjects || initialSubjects
        };

        classManager.importToClass(migratedData, classId === 'all' ? 'unassigned' : classId);
        
        const studentCount = migratedStudents.length;
        const targetName = classId === 'unassigned' ? 'Ohne Klasse' : 
          classManager.getClass(classId as string)?.name || 'Klasse';
        alert(`Daten erfolgreich in "${targetName}" importiert!\n${studentCount} Schüler wurden geladen.`);
      }

      // Force refresh by reloading from ClassManager
      classManager.load();
      
      // Trigger a re-render by updating the window
      window.location.reload();
    } catch (error) {
      console.error("Fehler beim Import:", error);
      alert("Fehler beim Importieren der Daten. Bitte überprüfen Sie das Dateiformat.");
    }
  }, [classManager, migrateStudentData]);

  /**
   * Handles creating a new class from ClassModal.
   */
  const handleCreateClass = useCallback((name: string, copyCurrentStudents: boolean) => {
    createClass(name, copyCurrentStudents);
  }, [createClass]);

  /**
   * Handles switching to a class from ClassModal.
   */
  const handleSwitchToClass = useCallback((classId: string | null) => {
    switchToClass(classId);
  }, [switchToClass]);

  const handleExportPdf = () => {
    const student = students.find(s => s.id === selectedStudentId);
    if(student) {
      generatePdf(student, subjects);
    } else {
      alert("Bitte wählen Sie einen Schüler für den PDF-Export aus.");
    }
  };

  const { handleUpdate } = useUpdateService({
    setUpdateInfoStatus,
    setUpdateBuildInfo,
    setIsUpdateInfoModalOpen,
  });

  const handleAbout = () => {
    setShowAboutModal(true);
  };

  const handleUsage = () => {
    setShowUsageModal(true);
  };

  const selectedStudent = useMemo(() => students.find(s => s.id === selectedStudentId), [students, selectedStudentId]);

  return (
    <ErrorBoundary>
      <div className="flex h-screen font-sans text-slate-800 dark:text-gray-100">
        <aside className="w-9/40 max-w-sm bg-white dark:bg-gray-800 border-r border-slate-200 dark:border-gray-700 flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-slate-700 dark:text-gray-100">Bewertungs-Assistent</h1>
          </div>
          <div className="p-4 flex-grow overflow-y-auto">
            <ErrorBoundary>
              <StudentList
                students={students}
                subjects={subjects}
                selectedStudentId={selectedStudentId}
                onSelectStudent={setSelectedStudentId}
                onDeleteStudent={deleteStudent}
              />
            </ErrorBoundary>
          </div>
          <div className="p-4 border-t border-slate-200 dark:border-gray-700 space-y-2">
            {/* ClassButton and "Schüler hinzufügen" in same row - Requirement 1.1, 1.4 */}
            <div className="flex gap-2">
              <ClassButton
                currentClassName={currentClassName}
                onClick={() => setShowClassModal(true)}
              />
              <button
                onClick={addStudent}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-500 dark:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
              >
                <PlusIcon />
                Schüler hinzufügen
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col">
          <header className="bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 p-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold dark:text-gray-100">
              Bewertung für: <span className="text-blue-600 dark:text-blue-400">{selectedStudent?.name || "Kein Schüler ausgewählt"}</span>
            </h2>
            <div className="flex items-center gap-2">
              <ThemeSelector />
              <div className="h-8 w-px bg-slate-300 dark:bg-gray-600"></div>
              {/* SaveDropdown replaces handleExportJson - Requirements 4.1 */}
              <SaveDropdown
                classes={classes}
                hasUnassigned={hasUnassignedStudents}
                onSaveClass={handleSaveClass}
              />
              {/* LoadDropdown replaces handleImportJson - Requirements 5.1 */}
              <LoadDropdown
                classes={classes}
                onLoadToClass={handleLoadToClass}
              />
              <button 
                onClick={handleExportPdf} 
                disabled={!selectedStudent}
                className="flex items-center gap-2 bg-green-400 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed dark:disabled:bg-gray-600" title="Bewertung als PDF exportieren">
                  <DocumentArrowDownIcon /> PDF Export
              </button>
              <ExtrasDropdown 
                onUpdate={handleUpdate}
                onAbout={handleAbout}
                onUsage={handleUsage}
              />
            </div>
          </header>
          <div className="flex-grow p-6 overflow-y-auto bg-slate-50 dark:bg-gray-900">
            <ErrorBoundary>
              {selectedStudent ? (
                <AssessmentForm
                  student={selectedStudent}
                  subjects={subjects}
                  onAssessmentAdd={handleAssessmentAdd}
                  onAssessmentDelete={handleAssessmentDelete}
                  onCompetencyTextChange={handleCompetencyTextChange}
                  onCategoryNameChange={handleCategoryNameChange}
                  onAddCompetency={addCompetency}
                />
              ) : (
                <div className="relative flex items-center justify-center h-full p-6">
                    <div className="text-center text-slate-500 dark:text-gray-400">
                        <h3 className="text-2xl font-semibold">Willkommen!</h3>
                        <p className="mt-2">
                          Dieses Tool unterstützt die Bewertung in der Schulanfangsphase (Saph) im Land Berlin, 
                          entsprechend den Vorgaben des Dokuments </p>
                          <p className="font-semibold">Schul Z 101 Zeugnis der Schulanfangsphase indikatorenorientiert (Version 01.25)</p>
                        
                        <p className="mt-2">Fügen Sie einen Schüler hinzu, um mit der Bewertung zu beginnen.</p>                        
                        <p className="mt-2">Bewerten Sie Ihre Schüler das ganze Schuljahr hindurch und betrachten Sie vor dem Zeugnis die Entwicklung Ihrer Schüler.</p>
                        <p className="font-bold text-green-700 mt-2">
                          Alle eingegebenen Daten bleiben lokal! Nichts verlässt Ihren Rechner.
                        </p>
                        <p className="mt-2">Keine Registrierung, keine Anmeldung, keine Datenübertragung. 
                        </p>
                        <p className="mt-2">&nbsp;</p>
                        
                        <p className="mt-2">Besuchen Sie das nächste Mal diese Seite, sind Ihre Daten weiterhin verfügbar. Ihr Browser speichert sie bei sich.</p>
                        <p className="mt-2">Mit der Option "Speichern" können (und sollten) Sie trotzdem Ihre Daten als JSON-Datei sichern und später wieder einlesen.</p>
                    </div>
                    <div className="absolute bottom-4 right-4 text-right text-xs text-slate-400 dark:text-gray-500">
                      <span>© 2025 Tobias Brendler · </span>
                      <a href="https://github.com/Etschmia/SaphBewertungBerlin" className="underline hover:no-underline" target="_blank" rel="noopener noreferrer">
                        Projekthomepage
                      </a>
                    </div>
                </div>
              )}
            </ErrorBoundary>
          </div>
        </main>
        
        <ErrorBoundary>
          <AboutModal 
            isOpen={showAboutModal}
            onClose={() => setShowAboutModal(false)}
            version={packageJson.version}
          />
        </ErrorBoundary>
        
        <ErrorBoundary>
          <UpdateInfoModal
            isOpen={isUpdateInfoModalOpen}
            onClose={() => setIsUpdateInfoModalOpen(false)}
            status={updateInfoStatus}
            buildInfo={updateBuildInfo}
          />
        </ErrorBoundary>
        
        <ErrorBoundary>
          <UsageModal
            isOpen={showUsageModal}
            onClose={() => setShowUsageModal(false)}
          />
        </ErrorBoundary>

        {/* ClassModal for class management - Requirement 2.1 */}
        <ErrorBoundary>
          <ClassModal
            isOpen={showClassModal}
            onClose={() => setShowClassModal(false)}
            classes={classes}
            currentClassId={currentClassId}
            onCreateClass={handleCreateClass}
            onSwitchToClass={handleSwitchToClass}
          />
        </ErrorBoundary>

        <Analytics />
      </div>
    </ErrorBoundary>
  );
};

/**
 * Main App component wrapped with ClassProvider.
 * Requirements: 1.1, 3.2, 3.3, 4.1, 5.1
 */
const App: React.FC = () => {
  return (
    <ClassProvider>
      <AppContent />
    </ClassProvider>
  );
};

export default App;
