
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { initialSubjects } from './data/initialData';
import type { Student, Subject, AppState, Rating, Category, Competency, RatingEntry, LegacyAssessments, ModernAssessments, AssessmentData } from './types';
import { isLegacyFormat, migrateLegacyAssessments } from './types';
import { sanitizeStudent, validateAssessmentData, ValidationError, DataMigrationError } from './utils/validation';
import StudentList from './components/StudentList';
import AssessmentForm from './components/AssessmentForm';
import ExtrasDropdown from './components/ExtrasDropdown';
import ThemeSelector from './components/ThemeSelector';
import AboutModal from './components/AboutModal';
import UpdateInfoModal from './components/UpdateInfoModal';
import UsageModal from './components/UsageModal';
import ErrorBoundary from './components/ErrorBoundary';
import { generatePdf } from './services/pdfGenerator';
import { useUpdateService, installPWA } from './services/updateService';
import { PlusIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, DocumentArrowDownIcon } from './components/Icons';
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
        const stateToSave: AppState = { students, subjects };
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

  const handleExportJson = () => {
    try {
      const state: AppState = { students, subjects };
      
      // Validate that we have data to export
      if (!students || students.length === 0) {
        alert("Keine Schülerdaten zum Exportieren vorhanden.");
        return;
      }
      
      // Create JSON with metadata for version tracking
      const exportData = {
        version: "2.0", // Version to track data format
        exportDate: new Date().toISOString(),
        ...state
      };
      
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      
      // Erstelle Dateiname mit "BewertungSaph" und aktuellem Datum/Uhrzeit
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
      downloadAnchorNode.setAttribute("download", `BewertungSaph_${dateStr}_${timeStr}.json`);
      
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      
      console.log("JSON export successful:", exportData);
    } catch (error) {
      console.error("Fehler beim JSON-Export:", error);
      alert("Fehler beim Exportieren der Daten. Bitte versuchen Sie es erneut.");
    }
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
                subjects: importedData.subjects
              };
            } else {
              // Legacy format or direct AppState
              newState = importedData;
            }
            
            // Validate required fields
            if (!newState.students || !Array.isArray(newState.students)) {
              throw new Error("Ungültige Datenstruktur: 'students' Array fehlt oder ist ungültig.");
            }
            
            if (!newState.subjects || !Array.isArray(newState.subjects)) {
              throw new Error("Ungültige Datenstruktur: 'subjects' Array fehlt oder ist ungültig.");
            }
            
            // Migrate imported students data if necessary
            const migratedStudents = newState.students.map((student: any, index: number) => {
              try {
                return migrateStudentData(student);
              } catch (migrationError) {
                console.warn(`Migration warning for student ${index}:`, migrationError);
                // Return a fallback student if migration fails
                return {
                  id: student.id || `student-${Date.now()}-${index}`,
                  name: student.name || `Schüler ${index + 1}`,
                  assessments: {}
                };
              }
            });
            
            // Validate subjects structure
            const validatedSubjects = newState.subjects.filter((subject: any) => {
              return subject && subject.id && subject.name && Array.isArray(subject.categories);
            });
            
            if (validatedSubjects.length === 0) {
              throw new Error("Keine gültigen Fächer in den importierten Daten gefunden.");
            }
            
            // Apply imported data
            setStudents(migratedStudents);
            setSubjects(validatedSubjects);
            setSelectedStudentId(migratedStudents[0]?.id || null);
            
            // Show success message with details
            const studentCount = migratedStudents.length;
            const subjectCount = validatedSubjects.length;
            alert(`Daten erfolgreich importiert!\n${studentCount} Schüler und ${subjectCount} Fächer wurden geladen.`);
            
            console.log("Import successful:", {
              students: migratedStudents.length,
              subjects: validatedSubjects.length,
              version: importedData.version || "legacy"
            });
            
          } catch(err) {
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
          <div className="p-4 border-t border-slate-200 dark:border-gray-700">
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
            <div className="flex items-center gap-2">
              <ThemeSelector />
              <div className="h-8 w-px bg-slate-300 dark:bg-gray-600"></div>
              <button onClick={handleExportJson} className="flex items-center gap-2 bg-slate-200 text-slate-700 font-medium py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600" title="Daten als JSON speichern">
                  <ArrowDownTrayIcon /> Speichern
              </button>
              <label className="flex items-center gap-2 bg-slate-200 text-slate-700 font-medium py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors cursor-pointer dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600" title="Daten aus JSON laden">
                  <ArrowUpTrayIcon /> Laden
                  <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
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
      </div>
    </ErrorBoundary>
  );
};

export default App;
