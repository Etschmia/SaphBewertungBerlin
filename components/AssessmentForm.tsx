
import React from 'react';
import type { Student, Subject, Rating } from '../types';
import SubjectAccordion from './SubjectAccordion';

interface AssessmentFormProps {
  student: Student;
  subjects: Subject[];
  onAssessmentChange: (competencyId: string, rating: Rating) => void;
  onCompetencyTextChange: (subjectId: string, categoryId: string, competencyId: string, newText: string) => void;
  onCategoryNameChange: (subjectId: string, categoryId: string, newName: string) => void;
  onAddCompetency: (subjectId: string, categoryId: string) => void;
}

const AssessmentForm: React.FC<AssessmentFormProps> = ({ 
    student, 
    subjects, 
    onAssessmentChange,
    onCompetencyTextChange,
    onCategoryNameChange,
    onAddCompetency
}) => {
  return (
    <div className="space-y-4">
      {subjects.map((subject, index) => (
        <SubjectAccordion
          key={subject.id}
          subject={subject}
          student={student}
          onAssessmentChange={onAssessmentChange}
          onCompetencyTextChange={onCompetencyTextChange}
          onCategoryNameChange={onCategoryNameChange}
          onAddCompetency={onAddCompetency}
          defaultOpen={index === 0}
        />
      ))}
    </div>
  );
};

export default AssessmentForm;
