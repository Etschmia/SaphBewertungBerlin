
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { initialSubjects } from './data/initialData';
import type { Student, Subject, AppState, Rating, Category, Competency } from './types';
import StudentList from './components/StudentList';
import AssessmentForm from './components/AssessmentForm';
import ExtrasDropdown from './components/ExtrasDropdown';
import ThemeSelector from './components/ThemeSelector';
import AboutModal from './components/AboutModal';
import UpdateInfoModal from './components/UpdateInfoModal';
import { generatePdf } from './services/pdfGenerator';
import { useUpdateService, installPWA } from './services/updateService';
import { PlusIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, DocumentArrowDownIcon } from './components/Icons';

const App: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [updateInfoStatus, setUpdateInfoStatus] = useState<'success' | 'fail' | 'unchanged'>('unchanged');
  const [updateBuildInfo, setUpdateBuildInfo] = useState<any>(null);
  const [isUpdateInfoModalOpen, setIsUpdateInfoModalOpen] = useState(false);


  useEffect(() => {
    try {
      const savedState = localStorage.getItem('zeugnis-assistent-state');
      if (savedState) {
        const parsedState: AppState = JSON.parse(savedState);
        setStudents(parsedState.students);
        setSubjects(parsedState.subjects);
        if (parsedState.students.length > 0) {
          setSelectedStudentId(parsedState.students[0].id);
        }
      }
    } catch (error) {
      console.error("Fehler beim Laden der Daten aus dem LocalStorage:", error);
    }
    setIsDataLoaded(true);
  }, []);

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

  const handleAssessmentChange = useCallback((competencyId: string, rating: Rating) => {
    if (!selectedStudentId) return;

    setStudents(prevStudents =>
      prevStudents.map(student =>
        student.id === selectedStudentId
          ? {
              ...student,
              assessments: {
                ...student.assessments,
                [competencyId]: rating,
              },
            }
          : student
      )
    );
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
    const state: AppState = { students, subjects };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "zeugnis_daten.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (event.target.files && event.target.files[0]) {
      fileReader.readAsText(event.target.files[0], "UTF-8");
      fileReader.onload = e => {
        if (e.target?.result) {
          try {
            const newState: AppState = JSON.parse(e.target.result as string);
            if(newState.students && newState.subjects) {
              setStudents(newState.students);
              setSubjects(newState.subjects);
              setSelectedStudentId(newState.students[0]?.id || null);
              alert("Daten erfolgreich importiert!");
            } else {
              throw new Error("Ungültige Datenstruktur.");
            }
          } catch(err) {
            alert("Fehler beim Importieren der Datei. Stellen Sie sicher, dass es eine gültige JSON-Datei ist.");
            console.error(err);
          }
        }
      };
    }
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

  const selectedStudent = useMemo(() => students.find(s => s.id === selectedStudentId), [students, selectedStudentId]);

  return (
    <div className="flex h-screen font-sans text-slate-800 dark:text-gray-100">
      <aside className="w-1/4 max-w-sm bg-white dark:bg-gray-800 border-r border-slate-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-slate-700 dark:text-gray-100">Zeugnis Assistent</h1>
        </div>
        <div className="p-4 flex-grow overflow-y-auto">
          <StudentList
            students={students}
            selectedStudentId={selectedStudentId}
            onSelectStudent={setSelectedStudentId}
            onDeleteStudent={deleteStudent}
          />
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
          <div className="flex gap-2">
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
              className="flex items-center gap-2 bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed dark:disabled:bg-gray-600" title="Bewertung als PDF exportieren">
                <DocumentArrowDownIcon /> PDF Export
            </button>
            <ThemeSelector />
            <ExtrasDropdown 
              onUpdate={handleUpdate}
              onInstallApp={handleInstallApp}
              onAbout={handleAbout}
            />
          </div>
        </header>
        <div className="flex-grow p-6 overflow-y-auto bg-slate-50 dark:bg-gray-900">
          {selectedStudent ? (
            <AssessmentForm
              student={selectedStudent}
              subjects={subjects}
              onAssessmentChange={handleAssessmentChange}
              onCompetencyTextChange={handleCompetencyTextChange}
              onCategoryNameChange={handleCategoryNameChange}
              onAddCompetency={addCompetency}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
                <div className="text-center text-slate-500 dark:text-gray-400">
                    <h3 className="text-2xl font-semibold">Willkommen!</h3>
                    <p>Bitte fügen Sie einen Schüler hinzu oder wählen Sie einen aus der Liste aus, um mit der Bewertung zu beginnen.</p>
                </div>
            </div>
          )}
        </div>
      </main>
      
      <AboutModal 
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
        version="0.0.1"
      />
      
      <UpdateInfoModal
        isOpen={isUpdateInfoModalOpen}
        onClose={() => setIsUpdateInfoModalOpen(false)}
        status={updateInfoStatus}
        buildInfo={updateBuildInfo}
      />
    </div>
  );
};

export default App;
