
import React from 'react';
import type { Student, Subject } from '../types';
import { Rating } from '../types';
import { TrashIcon } from './Icons';

interface StudentListProps {
  students: Student[];
  subjects: Subject[];
  selectedStudentId: string | null;
  onSelectStudent: (id: string) => void;
  onDeleteStudent: (id: string) => void;
}

// Hilfsfunktion um den Bewertungsstand eines Fachs zu ermitteln
const getSubjectStatus = (student: Student, subject: Subject): 'none' | 'partial' | 'complete' => {
  const allCompetencies = subject.categories.flatMap(cat => cat.competencies);
  const assessedCompetencies = allCompetencies.filter(comp => {
    const entries = student.assessments[comp.id];
    // Prüfe ob es Bewertungseinträge gibt, die nicht "NotTaught" sind
    return entries && Array.isArray(entries) && entries.length > 0 &&
      entries.some(entry => entry.rating !== Rating.NotTaught);
  });

  if (assessedCompetencies.length === 0) return 'none';
  if (assessedCompetencies.length === allCompetencies.length) return 'complete';
  return 'partial';
};

// Komponente für die Bewertungsbalken
const AssessmentProgressBars: React.FC<{ student: Student; subjects: Subject[] }> = ({ student, subjects }) => {
  return (
    <div className="flex gap-1 mx-2">
      {subjects.map(subject => {
        const status = getSubjectStatus(student, subject);
        let barColor = 'bg-slate-300 dark:bg-gray-600'; // Standard (keine Bewertung)

        if (status === 'partial') {
          barColor = 'bg-yellow-400 dark:bg-yellow-500'; // Teilweise bewertet
        } else if (status === 'complete') {
          barColor = 'bg-green-400 dark:bg-green-500'; // Vollständig bewertet
        }

        return (
          <div
            key={subject.id}
            className={`w-1.5 h-4 rounded-full ${barColor}`}
            title={`${subject.name}: ${status === 'none' ? 'Keine Bewertung' : status === 'partial' ? 'Teilweise bewertet' : 'Vollständig bewertet'}`}
          />
        );
      })}
    </div>
  );
};

const StudentList: React.FC<StudentListProps> = ({ students, subjects, selectedStudentId, onSelectStudent, onDeleteStudent }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 text-slate-600 dark:text-gray-300">Schülerliste</h3>
      {students.length === 0 ? (
        <p className="text-slate-500 dark:text-gray-400">Noch keine Schüler hinzugefügt.</p>
      ) : (
        <ul className="space-y-2">
          {students.map(student => (
            <li key={student.id} >
              <div
                onClick={() => onSelectStudent(student.id)}
                className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${selectedStudentId === student.id
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-semibold shadow-sm'
                    : 'bg-slate-50 dark:bg-gray-700 hover:bg-slate-200 dark:hover:bg-gray-600 text-slate-700 dark:text-gray-200'
                  }`}
              >
                <span className="flex-1">{student.name}</span>
                <AssessmentProgressBars student={student} subjects={subjects} />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteStudent(student.id);
                  }}
                  className="p-1 ml-2 rounded-full text-slate-400 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-600 dark:hover:text-red-400"
                  title="Schüler löschen"
                >
                  <TrashIcon />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StudentList;
