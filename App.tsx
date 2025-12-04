
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { initialSubjects } from './data/initialData';
import type { Student, Subject, AppState, Rating, Category, Competency, RatingEntry, LegacyAssessments, ModernAssessments, AssessmentData, Class } from './types';
import { isLegacyFormat, migrateLegacyAssessments } from './types';
import { sanitizeStudent, validateAssessmentData, ValidationError, DataMigrationError } from './utils/validation';
import StudentList from './components/StudentList';
import AssessmentForm from './components/AssessmentForm';
import ExtrasDropdown from './components/ExtrasDropdown';
import ThemeSelector from './components/ThemeSelector';
import AboutModal from './components/AboutModal';
import UpdateInfoModal from './components/UpdateInfoModal';
import UsageModal from './components/UsageModal';
import ClassSelectionModal from './components/ClassSelectionModal';
import { SaveOptionsModal, LoadOptionsModal } from './components/FileOperationsModals';
import ErrorBoundary from './components/ErrorBoundary';
import { generatePdf } from './services/pdfGenerator';
import { useUpdateService, installPWA } from './services/updateService';
import { PlusIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, DocumentArrowDownIcon } from './components/Icons';
import { Analytics } from "@vercel/analytics/react";
import packageJson from './package.json';

const App: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [updateInfoStatus, setUpdateInfoStatus] = useState<'success' | 'fail' | 'unchanged'>('unchanged');
  const [updateBuildInfo, setUpdateBuildInfo] = useState<any>(null);
  const [isUpdateInfoModalOpen, setIsUpdateInfoModalOpen] = useState(false);

  // Class management state
  const [classes, setClasses] = useState<Class[]>([]);
  const [activeClassId, setActiveClassId] = useState<string | null>(null);
  const [showClassModal, setShowClassModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [loadTarget, setLoadTarget] = useState<'all' | 'none' | string>('all');

  // Enhanced migration function with comprehensive error handling
  const migrateStudentData = useCallback((student: any, index?: number): Student => {
    try {
      // Use the sanitization utility which handles all edge cases
      const sanitized = sanitizeStudent(student, index);
      if (!sanitized) {
        throw new DataMigrationError('Failed to sanitize student data', student);
      }

      // Additional validation for assessments if they exist
      if (sanitized.assessments && typeof sanitized.assessments === 'object') {
        const validation = validateAssessmentData(sanitized.assessments);
        if (!validation.isValid) {
          console.warn(`Assessment validation warnings for student ${sanitized.name}:`, validation.errors);
          // Continue with sanitized data even if there are warnings
        }
      }

      return sanitized;
    } catch (error) {
      console.error('Error migrating student data:', error, student);

      // Create a fallback student with safe defaults
      return {
        id: `student-fallback-${Date.now()}-${index || 0}`,
        name: `Schüler ${(index || 0) + 1} (Wiederhergestellt)`,
        assessments: {}
      };
    }
  }, []);


  useEffect(() => {
    try {
      const savedState = localStorage.getItem('zeugnis-assistent-state');
      if (savedState) {
        let parsedState: any;

        try {
          parsedState = JSON.parse(savedState);
        } catch (parseError) {
          console.error("JSON parsing error for saved state:", parseError);
          throw new ValidationError('Invalid JSON in localStorage');
        }

        // Validate basic structure
        if (!parsedState || typeof parsedState !== 'object') {
          throw new ValidationError('Invalid state structure in localStorage');
        }

        // Migrate students data with enhanced error handling
        let migratedStudents: Student[] = [];
        if (parsedState.students && Array.isArray(parsedState.students)) {
          const migrationErrors: string[] = [];

          migratedStudents = parsedState.students
            .map((student: any, index: number) => {
              try {
                return migrateStudentData(student, index);
              } catch (error) {
                const errorMsg = `Student ${index}: ${error instanceof Error ? error.message : 'Unknown error'}`;
                migrationErrors.push(errorMsg);
                console.error('Student migration error:', errorMsg, student);
                return null;
              }
            })
            .filter((student: Student | null): student is Student => student !== null);

          if (migrationErrors.length > 0) {
            console.warn('Student migration completed with errors:', migrationErrors);
            // Could show a user notification here if needed
          }

          console.log(`Successfully migrated ${migratedStudents.length} students`);
        }

        setStudents(migratedStudents);

        // Validate and set subjects
        if (parsedState.subjects && Array.isArray(parsedState.subjects)) {
          // Basic validation for subjects structure
          const validSubjects = parsedState.subjects.filter((subject: any) => {
            return subject &&
              typeof subject === 'object' &&
              subject.id &&
              typeof subject.id === 'string' &&
              subject.name &&
              typeof subject.name === 'string' &&
              Array.isArray(subject.categories);
          });

          if (validSubjects.length > 0) {
            setSubjects(validSubjects);
          } else {
            console.warn('No valid subjects found, using initial subjects');
            setSubjects(initialSubjects);
          }
        } else {
          setSubjects(initialSubjects);
        }

        // Load classes if available
        if (parsedState.classes && Array.isArray(parsedState.classes)) {
          setClasses(parsedState.classes);
          // If classes exist, try to restore active class or default to null (Ohne Zuordnung)
          // We could store activeClassId in localStorage too, but for now let's start with "Ohne Zuordnung" or the first class?
          // Requirement says: "Gibt es keine, so ändert sich für diesen Buttons nichts."
          // Let's default to null (Ohne Zuordnung) initially.
        }

        // Set selected student safely
        if (migratedStudents.length > 0) {
          setSelectedStudentId(migratedStudents[0].id);
        }
      }
    } catch (error) {
      console.error("Fehler beim Laden der Daten aus dem LocalStorage:", error);

      // Show user-friendly error message
      const errorMessage = error instanceof ValidationError
        ? `Datenvalidierungsfehler: ${error.message}`
        : 'Unbekannter Fehler beim Laden der Daten';

      // Could show a toast notification here
      console.warn('Resetting to initial state due to error:', errorMessage);

      // Reset to safe initial state
      setStudents([]);
      setSubjects(initialSubjects);
      setSelectedStudentId(null);

      // Clear corrupted localStorage data
      try {
        localStorage.removeItem('zeugnis-assistent-state');
      } catch (clearError) {
        console.error('Failed to clear corrupted localStorage:', clearError);
      }
    }
    setIsDataLoaded(true);
  }, [migrateStudentData]);

  useEffect(() => {
    if (isDataLoaded) {
      try {
        const stateToSave: AppState = { students, subjects, classes };
        localStorage.setItem('zeugnis-assistent-state', JSON.stringify(stateToSave));
      } catch (error) {
        console.error("Fehler beim Speichern der Daten im LocalStorage:", error);
      }
    }
  }, [students, subjects, isDataLoaded]);



  const addStudent = () => {
    const name = prompt("Bitte geben Sie den Vornamen des Schülers ein (z.B. Max M.):");
    if (name) {
      const newStudent: Student = {
        id: `student-${Date.now()}`,
        name,
        classId: activeClassId || undefined,
        assessments: {},
      };
      const newStudents = [...students, newStudent];
      setStudents(newStudents);
      setSelectedStudentId(newStudent.id);
    }
  };

  const deleteStudent = (studentId: string) => {
    if (window.confirm("Möchten Sie diesen Schüler wirklich löschen? Alle Bewertungen gehen verloren.")) {
      const updatedStudents = students.filter(s => s.id !== studentId);
      setStudents(updatedStudents);
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
      // Validate inputs
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

      setStudents(prevStudents =>
        prevStudents.map(student => {
          if (student.id !== selectedStudentId) return student;

          try {
            const existingEntries = student.assessments[competencyId] || [];

            // Validate existing entries before adding new one
            const validExistingEntries = existingEntries.filter(entry => {
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
            return student; // Return unchanged student on error
          }
        })
      );
    } catch (error) {
      console.error('Error in handleAssessmentAdd:', error);
      // Could show user notification here
    }
  }, [selectedStudentId]);

  const handleAssessmentDelete = useCallback((competencyId: string, rating: Rating, timestamp: number) => {
    if (!selectedStudentId) {
      console.warn('No student selected for assessment delete');
      return;
    }

    try {
      // Validate inputs
      if (!competencyId || typeof competencyId !== 'string' || competencyId.trim() === '') {
        throw new ValidationError('Invalid competency ID');
      }

      if (typeof rating !== 'number' || !Number.isInteger(rating) || rating < 0 || rating > 4) {
        throw new ValidationError('Invalid rating value');
      }

      if (typeof timestamp !== 'number' || timestamp <= 0) {
        throw new ValidationError('Invalid timestamp');
      }

      setStudents(prevStudents =>
        prevStudents.map(student => {
          if (student.id !== selectedStudentId) return student;

          try {
            const existingEntries = student.assessments[competencyId] || [];

            // Filter out the specific entry and validate remaining entries
            const filteredEntries = existingEntries.filter(entry => {
              // Validate entry structure
              if (!entry || typeof entry !== 'object') return false;
              if (typeof entry.rating !== 'number' || typeof entry.timestamp !== 'number') return false;

              // Keep entries that don't match the deletion criteria
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
            return student; // Return unchanged student on error
          }
        })
      );
    } catch (error) {
      console.error('Error in handleAssessmentDelete:', error);
      // Could show user notification here
    }
  }, [selectedStudentId]);

  const handleCompetencyTextChange = (subjectId: string, categoryId: string, competencyId: string, newText: string) => {
    setSubjects(prevSubjects => prevSubjects.map(subject => {
      if (subject.id !== subjectId) return subject;
      return {
        ...subject,
        categories: subject.categories.map(category => {
          if (category.id !== categoryId) return category;
          return {
            ...category,
            competencies: category.competencies.map(comp =>
              comp.id === competencyId ? { ...comp, text: newText } : comp
            )
          }
        })
      }
    }));
  };

  const handleCategoryNameChange = (subjectId: string, categoryId: string, newName: string) => {
    setSubjects(prevSubjects => prevSubjects.map(subject => {
      if (subject.id !== subjectId) return subject;
      return {
        ...subject,
        categories: subject.categories.map(category =>
          category.id === categoryId ? { ...category, name: newName } : category
        )
      }
    }));
  };

  const addCompetency = (subjectId: string, categoryId: string) => {
    const text = prompt("Text für die neue Kompetenz:");
    if (text) {
      const newCompetency: Competency = { id: `comp-${Date.now()}`, text };
      setSubjects(prevSubjects => prevSubjects.map(subject => {
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
      }));
    }
  };

  const handleSaveRequest = () => {
    if (classes.length === 0) {
      // No classes, use legacy save (all students, no class structure in JSON)
      // Effectively saving "none" (students without class, which is all of them)
      performSave('none');
    } else {
      setShowSaveModal(true);
    }
  };

  const performSave = (target: 'all' | 'none' | string) => {
    try {
      let exportData: any;
      let filenamePart = "";

      if (target === 'all') {
        // Save everything (New Format)
        exportData = {
          version: "2.0",
          exportDate: new Date().toISOString(),
          students,
          subjects,
          classes
        };
        filenamePart = "Alle_Klassen";
      } else {
        // Save specific class or "Ohne Klasse" (Legacy-compatible Format)
        // We filter students but keep subjects
        let studentsToSave: Student[] = [];

        if (target === 'none') {
          studentsToSave = students.filter(s => !s.classId);
          filenamePart = "Ohne_Klasse";
        } else {
          studentsToSave = students.filter(s => s.classId === target);
          const cls = classes.find(c => c.id === target);
          filenamePart = cls ? cls.name.replace(/\s+/g, '_') : "Klasse";
        }

        // For backward compatibility, we don't include 'classes' array if saving a single class/subset
        // The loaded file will be treated as a list of students to be imported
        exportData = {
          version: "2.0", // Still mark as 2.0 to indicate it comes from new system
          exportDate: new Date().toISOString(),
          students: studentsToSave,
          subjects
        };
      }

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);

      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
      downloadAnchorNode.setAttribute("download", `BewertungSaph_${filenamePart}_${dateStr}_${timeStr}.json`);

      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();

      setShowSaveModal(false);
    } catch (error) {
      console.error("Fehler beim JSON-Export:", error);
      alert("Fehler beim Exportieren der Daten.");
    }
  };

  const handleLoadRequest = () => {
    if (classes.length === 0) {
      setLoadTarget('all');
      document.getElementById('file-upload')?.click();
    } else {
      setShowLoadModal(true);
    }
  };

  const handleLoadConfirm = (target: 'all' | 'none' | string) => {
    setLoadTarget(target);
    setShowLoadModal(false);
    // Trigger file input
    setTimeout(() => {
      document.getElementById('file-upload')?.click();
    }, 100);
  };

  const handleImportJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      // Validate file type
      if (!file.name.toLowerCase().endsWith('.json')) {
        alert("Bitte wählen Sie eine gültige JSON-Datei aus.");
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("Die Datei ist zu groß. Maximale Dateigröße: 10MB.");
        return;
      }

      fileReader.readAsText(file, "UTF-8");
      fileReader.onload = e => {
        if (e.target?.result) {
          try {
            const importedData: any = JSON.parse(e.target.result as string);

            // Handle both new format (with version) and legacy format
            let newState: any;
            if (importedData.version) {
              // New format with metadata
              console.log(`Importing data version: ${importedData.version}`);
              newState = {
                students: importedData.students,
                subjects: importedData.subjects,
                classes: importedData.classes
              };
            } else {
              // Legacy format or direct AppState
              newState = importedData;
            }

            // Check if file contains classes
            const fileHasClasses = newState.classes && Array.isArray(newState.classes) && newState.classes.length > 0;

            if (loadTarget !== 'all' && fileHasClasses) {
              // User selected specific target but file has all classes
              const confirm = window.confirm(
                "Sie haben gewählt, in eine bestimmte Klasse (oder 'Ohne Klasse') zu laden, aber die Datei enthält eine komplette Sicherung mit mehreren Klassen.\n\n" +
                "Möchten Sie den Import fortsetzen? Ihr aktueller Speicherstand wird komplett überschrieben."
              );
              if (!confirm) {
                event.target.value = '';
                return;
              }
              // If confirmed, switch to 'all' behavior (overwrite everything)
            }

            // Logic for 'all' (Overwrite everything)
            const shouldOverwriteAll = loadTarget === 'all' || fileHasClasses;

            if (shouldOverwriteAll) {
              // Validate required fields
              if (!newState.students || !Array.isArray(newState.students)) {
                throw new Error("Ungültige Datenstruktur: 'students' Array fehlt oder ist ungültig.");
              }

              if (!newState.subjects || !Array.isArray(newState.subjects)) {
                throw new Error("Ungültige Datenstruktur: 'subjects' Array fehlt oder ist ungültig.");
              }

              // Migrate students
              const migratedStudents = newState.students.map((student: any, index: number) => {
                try {
                  return migrateStudentData(student, index);
                } catch (e) { return null; }
              }).filter((student: Student | null): student is Student => student !== null);

              setStudents(migratedStudents);
              setSubjects(newState.subjects); // Should validate subjects too
              if (newState.classes) {
                setClasses(newState.classes);
              } else {
                setClasses([]); // Clear classes if loading a file without them in 'all' mode
              }

              // Reset selection
              setSelectedStudentId(migratedStudents[0]?.id || null);
              setActiveClassId(null); // Or first class?

              alert(`Daten erfolgreich geladen! ${migratedStudents.length} Schüler.`);
            }
            else {
              // Logic for loading into specific target (Merge/Append)
              // File does NOT have classes (or user didn't confirm overwrite, but we handled that).
              // So we treat file as a list of students to add to 'loadTarget'.

              if (!newState.students || !Array.isArray(newState.students)) {
                throw new Error("Ungültige Datenstruktur: 'students' Array fehlt.");
              }

              const newStudents = newState.students.map((student: any, index: number) => {
                const migrated = migrateStudentData(student, index);
                // Assign to target class
                if (loadTarget === 'none') {
                  migrated.classId = undefined;
                } else {
                  migrated.classId = loadTarget;
                }
                // Ensure unique ID to avoid collision
                if (students.some(s => s.id === migrated.id)) {
                  migrated.id = `${migrated.id}-imported-${Date.now()}`;
                }
                return migrated;
              });

              setStudents(prev => [...prev, ...newStudents]);
              alert(`${newStudents.length} Schüler wurden in die gewählte Klasse importiert.`);
            }

            console.log("Import successful:", {
              students: newState.students?.length,
              subjects: newState.subjects?.length,
              version: importedData.version || "legacy"
            });

          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Unbekannter Fehler";
            alert(`Fehler beim Importieren der Datei: ${errorMessage}\n\nStellen Sie sicher, dass es eine gültige JSON-Datei mit Zeugnis-Daten ist.`);
            console.error("Import error:", err);
          }
        }
      };

      fileReader.onerror = () => {
        alert("Fehler beim Lesen der Datei. Bitte versuchen Sie es erneut.");
        console.error("FileReader error");
      };
    }

    // Reset file input to allow importing the same file again
    event.target.value = '';
  };

  const handleExportPdf = () => {
    const student = students.find(s => s.id === selectedStudentId);
    if (student) {
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

  const handleInstallApp = async () => {
    const result = await installPWA();
    alert(result);
  };

  const handleAbout = () => {
    setShowAboutModal(true);
  };

  const handleUsage = () => {
    setShowUsageModal(true);
  };

  const selectedStudent = useMemo(() => students.find(s => s.id === selectedStudentId), [students, selectedStudentId]);

  // Filter students based on active class
  const filteredStudents = useMemo(() => {
    if (activeClassId === null) {
      // Show students with no class assignment
      return students.filter(s => !s.classId);
    } else {
      // Show students in the active class
      return students.filter(s => s.classId === activeClassId);
    }
  }, [students, activeClassId]);

  const activeClassName = useMemo(() => {
    if (activeClassId === null) return "Ohne Zuordnung";
    return classes.find(c => c.id === activeClassId)?.name || "Unbekannte Klasse";
  }, [classes, activeClassId]);

  const handleCreateClass = (name: string, withCurrentStudents: boolean) => {
    const newClass: Class = {
      id: `class-${Date.now()}`,
      name
    };

    setClasses(prev => [...prev, newClass]);
    setActiveClassId(newClass.id);

    if (withCurrentStudents) {
      // Assign currently visible students (which are "Ohne Zuordnung" if we are here, or from another class)
      // Actually, if we are in "Ohne Zuordnung" mode, filteredStudents are the ones to move.
      // If we are in another class, filteredStudents are those.
      // The requirement says: "Aktuelle Schülerliste als neue Klasse erfassen"

      const studentIdsToMove = filteredStudents.map(s => s.id);
      setStudents(prev => prev.map(s => {
        if (studentIdsToMove.includes(s.id)) {
          return { ...s, classId: newClass.id };
        }
        return s;
      }));
    }
  };

  const handleSwitchClass = (classId: string | null) => {
    setActiveClassId(classId);
    // Reset selection when switching class
    setSelectedStudentId(null);
  };


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
                students={filteredStudents}
                subjects={subjects}
                selectedStudentId={selectedStudentId}
                onSelectStudent={setSelectedStudentId}
                onDeleteStudent={deleteStudent}
              />
            </ErrorBoundary>
          </div>
          <div className="p-4 border-t border-slate-200 dark:border-gray-700">
            <button
              onClick={addStudent}
              className="w-full flex items-center justify-center gap-2 bg-blue-500 dark:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
            >
              <PlusIcon />
              Schüler hinzufügen
            </button>
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() => setShowClassModal(true)}
                className="flex-1 bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg hover:bg-slate-200 dark:hover:bg-gray-600 transition-colors text-sm"
              >
                Klasse
              </button>
              <span className="text-sm text-slate-600 dark:text-gray-400 truncate flex-1" title={activeClassName}>
                {activeClassName}
              </span>
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
              <button onClick={handleSaveRequest} className="flex items-center gap-2 bg-slate-200 text-slate-700 font-medium py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600" title="Daten als JSON speichern">
                <ArrowDownTrayIcon /> Speichern
              </button>
              <label className="flex items-center gap-2 bg-slate-200 text-slate-700 font-medium py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors cursor-pointer dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600" title="Daten aus JSON laden">
                <ArrowUpTrayIcon /> Laden
                <button onClick={handleLoadRequest} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"></button>
                <input id="file-upload" type="file" accept=".json" onChange={handleImportJson} className="hidden" />
              </label>
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

        <ErrorBoundary>
          <ClassSelectionModal
            isOpen={showClassModal}
            onClose={() => setShowClassModal(false)}
            classes={classes}
            currentClassId={activeClassId}
            onSwitchClass={handleSwitchClass}
            onCreateClass={handleCreateClass}
          />
        </ErrorBoundary>

        <ErrorBoundary>
          <SaveOptionsModal
            isOpen={showSaveModal}
            onClose={() => setShowSaveModal(false)}
            classes={classes}
            onSave={performSave}
          />
        </ErrorBoundary>

        <ErrorBoundary>
          <LoadOptionsModal
            isOpen={showLoadModal}
            onClose={() => setShowLoadModal(false)}
            classes={classes}
            onLoad={handleLoadConfirm}
          />
        </ErrorBoundary>
        <Analytics />
      </div>
    </ErrorBoundary>
  );
};

export default App;
