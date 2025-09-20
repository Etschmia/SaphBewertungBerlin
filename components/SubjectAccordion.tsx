
import React, { useState } from 'react';
import type { Student, Subject, Rating } from '../types';
import CategorySection from './CategorySection';
import { ChevronDownIcon } from './Icons';

interface SubjectAccordionProps {
  subject: Subject;
  student: Student;
  onAssessmentChange: (competencyId: string, rating: Rating) => void;
  onCompetencyTextChange: (subjectId: string, categoryId: string, competencyId: string, newText: string) => void;
  onCategoryNameChange: (subjectId: string, categoryId: string, newName: string) => void;
  onAddCompetency: (subjectId: string, categoryId: string) => void;
  defaultOpen?: boolean;
}

const SubjectAccordion: React.FC<SubjectAccordionProps> = ({ 
    subject, 
    student, 
    onAssessmentChange, 
    onCompetencyTextChange,
    onCategoryNameChange,
    onAddCompetency,
    defaultOpen = false 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-slate-200 dark:border-gray-600">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 text-left"
      >
        <h3 className="text-xl font-bold text-slate-700 dark:text-gray-100">{subject.name}</h3>
        <ChevronDownIcon className={`w-6 h-6 text-slate-600 dark:text-gray-300 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="p-4 border-t border-slate-200 dark:border-gray-600 space-y-6">
          {subject.categories.map(category => (
            <CategorySection
              key={category.id}
              subjectId={subject.id}
              category={category}
              student={student}
              onAssessmentChange={onAssessmentChange}
              onCompetencyTextChange={onCompetencyTextChange}
              onCategoryNameChange={onCategoryNameChange}
              onAddCompetency={onAddCompetency}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SubjectAccordion;
