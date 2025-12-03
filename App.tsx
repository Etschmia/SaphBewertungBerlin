
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { initialSubjects } from './data/initialData';
import type { Student, Subject, AppState, Rating, Category, Competency, RatingEntry, ClassGroup } from './types';
import { sanitizeStudent, validateAssessmentData, ValidationError, DataMigrationError } from './utils/validation';
import StudentList from './components/StudentList';
import AssessmentForm from './components/AssessmentForm';
import ExtrasDropdown from './components/ExtrasDropdown';
import ThemeSelector from './components/ThemeSelector';
import AboutModal from './components/AboutModal';
import UpdateInfoModal from './components/UpdateInfoModal';
import UsageModal from './components/UsageModal';
import ClassModal from './components/ClassModal';
import ErrorBoundary from './components/ErrorBoundary';
import { generatePdf } from './services/pdfGenerator';
import { useUpdateService } from './services/updateService';
import { PlusIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, DocumentArrowDownIcon } from './components/Icons';
import { Analytics } from "@vercel/analytics/react";
import packageJson from './package.json';

const App: React.FC = () => {
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [unassignedStudents, setUnassignedStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [activeClassId, setActiveClassId] = useState<string | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [saveTarget, setSaveTarget] = useState<string>('');
  const [importTarget, setImportTarget] = useState<string>('unassigned');
  const [showClassModal, setShowClassModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [updateInfoStatus, setUpdateInfoStatus] = useState<'success' | 'fail' | 'unchanged'>('unchanged');
  const [updateBuildInfo, setUpdateBuildInfo] = useState<any>(null);
  const [isUpdateInfoModalOpen, setIsUpdateInfoModalOpen] = useState(false);

  const STORAGE_KEY = 'zeugnis-assistent-state';
  const DATA_VERSION = '3.0';

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

  const sanitizeStudentList = useCallback((rawStudents: any[]): Student[] => {
    if (!Array.isArray(rawStudents)) return [];
    const migrationErrors: string[] = [];

    const migratedStudents = rawStudents
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
    }

    return migratedStudents;
  }, [migrateStudentData]);


  useEffect(() => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        let parsedState: any;

        try {
          parsedState = JSON.parse(savedState);
        } catch (parseError) {
          console.error("JSON parsing error for saved state:", parseError);
          throw new ValidationError('Invalid JSON in localStorage');
        }

        if (!parsedState || typeof parsedState !== 'object') {
          throw new ValidationError('Invalid state structure in localStorage');
        }

        // Subjects
        if (parsedState.subjects && Array.isArray(parsedState.subjects)) {
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

        const hasClassShape = parsedState.classes || parsedState.unassignedStudents || parsedState.activeClassId || parsedState.version === DATA_VERSION;

        if (hasClassShape) {
          const loadedClasses: ClassGroup[] = Array.isArray(parsedState.classes)
            ? parsedState.classes.map((cls: any, index: number) => {
                if (!cls || typeof cls !== 'object') return null;
                const id = typeof cls.id === 'string' && cls.id.trim() ? cls.id.trim() : `class-${Date.now()}-${index}`;
                const name = typeof cls.name === 'string' && cls.name.trim() ? cls.name.trim() : `Klasse ${index + 1}`;
                const students = sanitizeStudentList(Array.isArray(cls.students) ? cls.students : []);
                return { id, name, students };
              }).filter((cls: ClassGroup | null): cls is ClassGroup => cls !== null)
            : [];

          const loadedUnassigned = sanitizeStudentList(Array.isArray(parsedState.unassignedStudents) ? parsedState.unassignedStudents : []);
          const nextActiveClassId = loadedClasses.find(c => c.id === parsedState.activeClassId)?.id || loadedClasses[0]?.id || null;

          setClasses(loadedClasses);
          setUnassignedStudents(loadedUnassigned);
          setActiveClassId(nextActiveClassId);

          const initialStudents = nextActiveClassId
            ? (loadedClasses.find(c => c.id === nextActiveClassId)?.students || [])
            : loadedUnassigned;

          if (initialStudents.length > 0) {
            setSelectedStudentId(initialStudents[0].id);
          }

          setImportTarget(nextActiveClassId ? `class:${nextActiveClassId}` : 'unassigned');
        } else if (parsedState.students && Array.isArray(parsedState.students)) {
          const migratedStudents = sanitizeStudentList(parsedState.students);
          setClasses([]);
          setUnassignedStudents(migratedStudents);
          setActiveClassId(null);
          setSelectedStudentId(migratedStudents[0]?.id || null);
          setImportTarget('unassigned');
        }
      }
    } catch (error) {
      console.error("Fehler beim Laden der Daten aus dem LocalStorage:", error);

      const errorMessage = error instanceof ValidationError 
        ? `Datenvalidierungsfehler: ${error.message}`
        : 'Unbekannter Fehler beim Laden der Daten';

      console.warn('Resetting to initial state due to error:', errorMessage);

      setClasses([]);
      setUnassignedStudents([]);
      setSubjects(initialSubjects);
      setSelectedStudentId(null);

      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (clearError) {
        console.error('Failed to clear corrupted localStorage:', clearError);
      }
    }
    setIsDataLoaded(true);
  }, [migrateStudentData, sanitizeStudentList]);

  useEffect(() => {
    if (isDataLoaded) {
      try {
        const stateToSave: AppState = { 
          version: DATA_VERSION,
          subjects, 
          classes, 
          unassignedStudents,
          activeClassId
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      } catch (error) {
        console.error("Fehler beim Speichern der Daten im LocalStorage:", error);
      }
    }
  }, [classes, unassignedStudents, subjects, activeClassId, isDataLoaded]);

  const hasClasses = classes.length > 0;

  const getActiveClass = useCallback(() => {
    return classes.find(c => c.id === activeClassId) || null;
  }, [classes, activeClassId]);

  const activeStudents = useMemo(() => {
    const activeClass = getActiveClass();
    if (activeClass) {
      return activeClass.students || [];
    }
    return unassignedStudents;
  }, [getActiveClass, unassignedStudents]);

  const setActiveStudents = useCallback((updater: (students: Student[]) => Student[]) => {
    if (activeClassId) {
      const classExists = classes.some(c => c.id === activeClassId);
      if (classExists) {
        setClasses(prev => prev.map(cls => cls.id === activeClassId ? { ...cls, students: updater(cls.students || []) } : cls));
        return;
      }
      // Fallback: class missing, write to unassigned
      setActiveClassId(null);
    }
    setUnassignedStudents(prev => updater(prev));
  }, [activeClassId, classes]);

  useEffect(() => {
    if (selectedStudentId && activeStudents.some(s => s.id === selectedStudentId)) {
      return;
    }
    setSelectedStudentId(activeStudents[0]?.id || null);
  }, [activeStudents, selectedStudentId]);

  useEffect(() => {
    setImportTarget(activeClassId ? `class:${activeClassId}` : 'unassigned');
  }, [activeClassId]);

  const getClassLabel = () => {
    if (activeClassId) {
      const cls = getActiveClass();
      return cls?.name || 'Klasse';
    }
    return 'Ohne Zuordnung';
  };

  const isDuplicateClassName = useCallback((name: string) => {
    const trimmed = name.trim().toLowerCase();
    return classes.some(cls => cls.name.trim().toLowerCase() === trimmed);
  }, [classes]);

  const handleSwitchClass = (classId: string | null) => {
    const targetId = classId && classes.some(c => c.id === classId) ? classId : null;
    setActiveClassId(targetId);
    const nextStudents = targetId ? (classes.find(c => c.id === targetId)?.students || []) : unassignedStudents;
    setSelectedStudentId(nextStudents[0]?.id || null);
  };

  const handleCreateClassFromCurrent = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      alert("Bitte geben Sie einen Klassennamen ein.");
      return false;
    }
    if (isDuplicateClassName(trimmed)) {
      alert("Dieser Klassenname existiert bereits.");
      return false;
    }

    const newClass: ClassGroup = {
      id: `class-${Date.now()}`,
      name: trimmed,
      students: activeStudents,
    };

    setClasses(prev => {
      const cleared = activeClassId ? prev.map(c => c.id === activeClassId ? { ...c, students: [] } : c) : prev;
      return [...cleared, newClass];
    });

    if (!activeClassId) {
      setUnassignedStudents([]);
    }

    setActiveClassId(newClass.id);
    setSelectedStudentId(newClass.students[0]?.id || null);
    return true;
  };

  const handleCreateEmptyClass = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      alert("Bitte geben Sie einen Klassennamen ein.");
      return false;
    }
    if (isDuplicateClassName(trimmed)) {
      alert("Dieser Klassenname existiert bereits.");
      return false;
    }

    const newClass: ClassGroup = {
      id: `class-${Date.now()}`,
      name: trimmed,
      students: [],
    };

    setClasses(prev => [...prev, newClass]);
    setActiveClassId(newClass.id);
    setSelectedStudentId(null);
    return true;
  };



  const addStudent = () => {
    const name = prompt("Bitte geben Sie den Vornamen des Schülers ein (z.B. Max M.):");
    if (name) {
      const newStudent: Student = {
        id: `student-${Date.now()}`,
        name,
        assessments: {},
      };
      setActiveStudents(prev => [...prev, newStudent]);
      setSelectedStudentId(newStudent.id);
    }
  };

  const deleteStudent = (studentId: string) => {
    if (window.confirm("Möchten Sie diesen Schüler wirklich löschen? Alle Bewertungen gehen verloren.")) {
      setActiveStudents(prev => prev.filter(s => s.id !== studentId));
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

      setActiveStudents(prevStudents =>
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

      setActiveStudents(prevStudents =>
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
    }));
  };
  
  const handleCategoryNameChange = (subjectId: string, categoryId: string, newName: string) => {
    setSubjects(prevSubjects => prevSubjects.map(subject => {
        if(subject.id !== subjectId) return subject;
        return {
            ...subject,
            categories: subject.categories.map(category => 
                category.id === categoryId ? {...category, name: newName} : category
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

  const sanitizeFilenameSegment = (input: string) => {
    const safe = input.trim().replace(/\s+/g, '_').replace(/[^A-Za-z0-9_-]/g, '_');
    return safe || 'Ohne_Klasse';
  };

  const buildFilename = (suffix: string) => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    return `BewertungSaph_${suffix}_${dateStr}_${timeStr}.json`;
  };

  const downloadJson = (data: any, filename: string) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", filename);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const exportStudentsList = (studentsToExport: Student[], label: string) => {
    if (!studentsToExport || studentsToExport.length === 0) {
      alert("Keine Schülerdaten zum Exportieren vorhanden.");
      return;
    }

    const exportData = {
      version: "2.0",
      exportDate: new Date().toISOString(),
      students: studentsToExport,
      subjects
    };

    downloadJson(exportData, buildFilename(sanitizeFilenameSegment(label)));
    console.log("JSON export successful:", exportData);
  };

  const exportAllClasses = () => {
    const exportData = {
      version: DATA_VERSION,
      exportDate: new Date().toISOString(),
      subjects,
      classes,
      unassignedStudents,
      activeClassId
    };

    downloadJson(exportData, buildFilename("Alle_Klassen"));
    console.log("JSON export (all classes) successful:", exportData);
  };

  const handleExportCurrentJson = () => {
    const label = hasClasses ? getClassLabel() : 'Ohne Klasse';
    exportStudentsList(activeStudents, label);
  };

  const handleExportSelection = (target: string) => {
    setSaveTarget(target);
    if (!target) return;

    if (target === 'all') {
      exportAllClasses();
      setSaveTarget('');
      return;
    }

    if (target === 'unassigned') {
      exportStudentsList(unassignedStudents, 'Ohne Klasse');
      setSaveTarget('');
      return;
    }

    if (target.startsWith('class:')) {
      const classId = target.split(':')[1];
      const targetClass = classes.find(c => c.id === classId);
      if (!targetClass) {
        alert("Klasse nicht gefunden.");
      } else {
        exportStudentsList(targetClass.students, targetClass.name);
      }
      setSaveTarget('');
      return;
    }
    setSaveTarget('');
  };

  const applyImportedSubjects = (incomingSubjects: any) => {
    if (incomingSubjects && Array.isArray(incomingSubjects)) {
      const validSubjects = incomingSubjects.filter((subject: any) => {
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
        return validSubjects;
      }
    }

    throw new Error("Ungültige Datenstruktur: 'subjects' Array fehlt oder ist ungültig.");
  };

  const applyMultiClassImport = (data: any) => {
    const loadedClasses: ClassGroup[] = Array.isArray(data.classes)
      ? data.classes.map((cls: any, index: number) => {
          if (!cls || typeof cls !== 'object') return null;
          const id = typeof cls.id === 'string' && cls.id.trim() ? cls.id.trim() : `class-${Date.now()}-${index}`;
          const name = typeof cls.name === 'string' && cls.name.trim() ? cls.name.trim() : `Klasse ${index + 1}`;
          const students = sanitizeStudentList(Array.isArray(cls.students) ? cls.students : []);
          return { id, name, students };
        }).filter((cls: ClassGroup | null): cls is ClassGroup => cls !== null)
      : [];

    const loadedUnassigned = sanitizeStudentList(Array.isArray(data.unassignedStudents) ? data.unassignedStudents : []);
    const nextActive = loadedClasses.find(c => c.id === data.activeClassId)?.id || loadedClasses[0]?.id || null;

    setClasses(loadedClasses);
    setUnassignedStudents(loadedUnassigned);
    setActiveClassId(nextActive);

    const nextStudents = nextActive
      ? (loadedClasses.find(c => c.id === nextActive)?.students || [])
      : loadedUnassigned;

    setSelectedStudentId(nextStudents[0]?.id || null);
    setImportTarget(nextActive ? `class:${nextActive}` : 'unassigned');
  };

  const applySingleImport = (studentsData: any[], target: string) => {
    const migratedStudents = sanitizeStudentList(studentsData);

    if (target === 'unassigned') {
      setUnassignedStudents(migratedStudents);
      setActiveClassId(null);
    } else if (target.startsWith('class:')) {
      const classId = target.split(':')[1];
      const targetClass = classes.find(c => c.id === classId);
      const className = targetClass?.name || 'Klasse';

      setClasses(prev => {
        const found = prev.some(c => c.id === classId);
        if (found) {
          return prev.map(c => c.id === classId ? { ...c, students: migratedStudents } : c);
        }
        return [...prev, { id: classId, name: className, students: migratedStudents }];
      });
      setActiveClassId(classId);
    } else {
      setUnassignedStudents(migratedStudents);
      setActiveClassId(null);
    }

    setSelectedStudentId(migratedStudents[0]?.id || null);
    setImportTarget(target);
  };

  const handleImportJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const targetSelection = hasClasses ? importTarget : 'unassigned';
    const fileReader = new FileReader();
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      if (!file.name.toLowerCase().endsWith('.json')) {
        alert("Bitte waehlen Sie eine gueltige JSON-Datei aus.");
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        alert("Die Datei ist zu gross. Maximale Dateigroesse: 10MB.");
        return;
      }
      
      fileReader.readAsText(file, "UTF-8");
      fileReader.onload = e => {
        if (e.target?.result) {
          try {
            const importedData: any = JSON.parse(e.target.result as string);
            const fileHasClassStructure = Array.isArray(importedData.classes) || Array.isArray(importedData.unassignedStudents);
            const targetIsAll = targetSelection === 'all';
            const targetIsClass = targetSelection.startsWith('class:');

            applyImportedSubjects(importedData.subjects);

            if (fileHasClassStructure) {
              if (!targetIsAll) {
                const confirmAll = window.confirm(`Sie haben '${targetIsClass ? 'eine Klasse' : 'Ohne Klasse'}' als Ziel gewählt, die Datei enthält jedoch alle Klassen. Soll der komplette LocalStorage überschrieben werden?`);
                if (!confirmAll) {
                  return;
                }
              }

              applyMultiClassImport(importedData);
              alert("Daten aller Klassen erfolgreich importiert.");
              return;
            }

            const newState = importedData;

            if (!newState.students || !Array.isArray(newState.students)) {
              throw new Error("Ungültige Datenstruktur: 'students' Array fehlt oder ist ungültig.");
            }
            
            if (targetIsAll) {
              setClasses([]);
              setActiveClassId(null);
            }

            const finalTarget = targetIsAll ? 'unassigned' : (targetSelection || 'unassigned');
            applySingleImport(newState.students, finalTarget);
            
            const studentCount = newState.students.length;
            alert(`Daten erfolgreich importiert!
${studentCount} Schüler wurden geladen.`);
            
            console.log("Import successful:", {
              students: newState.students.length,
              version: importedData.version || "legacy"
            });
            
          } catch(err) {
            const errorMessage = err instanceof Error ? err.message : "Unbekannter Fehler";
            alert(`Fehler beim Importieren der Datei: ${errorMessage}

Stellen Sie sicher, dass es eine gültige JSON-Datei mit Zeugnis-Daten ist.`);
            console.error("Import error:", err);
          }
        }
      };
      
      fileReader.onerror = () => {
        alert("Fehler beim Lesen der Datei. Bitte versuchen Sie es erneut.");
        console.error("FileReader error");
      };
    }
    
    event.target.value = '';
  };

  const handleExportPdf = () => {
    const student = activeStudents.find(s => s.id === selectedStudentId);
    if(student) {
        generatePdf(student, subjects);
    } else {
        alert("Bitte waehlen Sie einen Schueler fuer den PDF-Export aus.");
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

  const selectedStudent = useMemo(() => activeStudents.find(s => s.id === selectedStudentId), [activeStudents, selectedStudentId]);

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
                students={activeStudents}
                subjects={subjects}
                selectedStudentId={selectedStudentId}
                onSelectStudent={setSelectedStudentId}
                onDeleteStudent={deleteStudent}
              />
            </ErrorBoundary>
          </div>
          <div className="p-4 border-t border-slate-200 dark:border-gray-700 space-y-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowClassModal(true)}
                className="w-1/2 flex items-center justify-center gap-2 bg-slate-200 text-slate-700 font-semibold py-2 px-3 rounded-lg hover:bg-slate-300 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Klasse
              </button>
              <span className="text-sm text-slate-600 dark:text-gray-300 font-medium" title="Aktive Klasse">
                {getClassLabel()}
              </span>
            </div>
            <button
              onClick={addStudent}
              className="w-full flex items-center justify-center gap-2 bg-blue-500 dark:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
            >
              <PlusIcon />
              Schüler hinzufügen
            </button>
          </div>
        </aside>

        <main className="flex-1 flex flex-col">
          <header className="bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 p-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold dark:text-gray-100">
              Bewertung für: <span className="text-blue-600 dark:text-blue-400">{selectedStudent?.name || "Kein Schüler ausgewählt"}</span>
            </h2>
            <div className="flex items-center flex-wrap gap-2">
              <ThemeSelector />
              <div className="h-8 w-px bg-slate-300 dark:bg-gray-600"></div>
              {hasClasses ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600 dark:text-gray-300">Speichern:</span>
                  <select
                    value={saveTarget}
                    onChange={(e) => handleExportSelection(e.target.value)}
                    className="bg-slate-200 dark:bg-gray-700 text-slate-700 dark:text-gray-200 text-sm font-medium py-2 px-3 rounded-lg hover:bg-slate-300 dark:hover:bg-gray-600"
                  >
                    <option value="">Ziel waehlen</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={`class:${cls.id}`}>Klasse {cls.name}</option>
                    ))}
                    <option value="unassigned">Ohne Klasse</option>
                    <option value="all">Alle Klassen</option>
                  </select>
                </div>
              ) : (
                <button onClick={handleExportCurrentJson} className="flex items-center gap-2 bg-slate-200 text-slate-700 font-medium py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600" title="Daten als JSON speichern">
                  <ArrowDownTrayIcon /> Speichern
                </button>
              )}
              {hasClasses ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600 dark:text-gray-300">Laden nach:</span>
                  <select
                    value={importTarget}
                    onChange={(e) => setImportTarget(e.target.value)}
                    className="bg-slate-200 dark:bg-gray-700 text-slate-700 dark:text-gray-200 text-sm font-medium py-2 px-3 rounded-lg hover:bg-slate-300 dark:hover:bg-gray-600"
                  >
                    <option value="unassigned">Ohne Klasse</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={`class:${cls.id}`}>Klasse {cls.name}</option>
                    ))}
                    <option value="all">Alle Klassen</option>
                  </select>
                  <label className="flex items-center gap-2 bg-slate-200 text-slate-700 font-medium py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors cursor-pointer dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600" title="Daten aus JSON laden">
                    <ArrowUpTrayIcon /> Laden
                    <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
                  </label>
                </div>
              ) : (
                <label className="flex items-center gap-2 bg-slate-200 text-slate-700 font-medium py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors cursor-pointer dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600" title="Daten aus JSON laden">
                  <ArrowUpTrayIcon /> Laden
                  <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
                </label>
              )}
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
          <ClassModal
            isOpen={showClassModal}
            onClose={() => setShowClassModal(false)}
            classes={classes}
            activeClassId={activeClassId}
            onCreateFromCurrent={handleCreateClassFromCurrent}
            onCreateEmpty={handleCreateEmptyClass}
            onSwitchClass={handleSwitchClass}
          />
        </ErrorBoundary>

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
        <Analytics />
      </div>
    </ErrorBoundary>
  );
};

export default App;
