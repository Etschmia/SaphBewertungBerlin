
import React from 'react';
import type { Student } from '../types';
import { TrashIcon } from './Icons';

interface StudentListProps {
  students: Student[];
  selectedStudentId: string | null;
  onSelectStudent: (id: string) => void;
  onDeleteStudent: (id: string) => void;
}

const StudentList: React.FC<StudentListProps> = ({ students, selectedStudentId, onSelectStudent, onDeleteStudent }) => {
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
                className={`flex justify-between items-center p-3 rounded-lg cursor-pointer transition-all ${
                  selectedStudentId === student.id
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-semibold shadow-sm'
                    : 'bg-slate-50 dark:bg-gray-700 hover:bg-slate-200 dark:hover:bg-gray-600 text-slate-700 dark:text-gray-200'
                }`}
              >
                <span>{student.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteStudent(student.id);
                  }}
                  className="p-1 rounded-full text-slate-400 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-600 dark:hover:text-red-400"
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
