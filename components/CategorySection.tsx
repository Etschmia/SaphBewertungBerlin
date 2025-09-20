import React, { useState } from 'react';
// FIX: 'Rating' is used as a value, so it cannot be a type-only import.
import { Rating, type Category, type Student } from '../types';
import RatingControl from './RatingControl';
import { EditIcon, PlusCircleIcon } from './Icons';

interface CategorySectionProps {
  subjectId: string;
  category: Category;
  student: Student;
  onAssessmentChange: (competencyId: string, rating: Rating) => void;
  onCompetencyTextChange: (subjectId: string, categoryId: string, competencyId: string, newText: string) => void;
  onCategoryNameChange: (subjectId: string, categoryId: string, newName: string) => void;
  onAddCompetency: (subjectId: string, categoryId: string) => void;
}

const EditableText: React.FC<{
  initialText: string,
  onSave: (newText: string) => void,
  className?: string
}> = ({ initialText, onSave, className }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState(initialText);

    const handleSave = () => {
        onSave(text);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onBlur={handleSave}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                className={`border-b-2 border-blue-500 focus:outline-none bg-inherit ${className}`}
                autoFocus
            />
        );
    }
    return (
        <span onDoubleClick={() => setIsEditing(true)} className={className}>{initialText}</span>
    );
};


const CategorySection: React.FC<CategorySectionProps> = ({ 
    subjectId, 
    category, 
    student, 
    onAssessmentChange,
    onCompetencyTextChange,
    onCategoryNameChange,
    onAddCompetency
}) => {
  return (
    <div className="p-4 rounded-md bg-slate-50 border border-slate-200/80">
      <div className="flex items-center gap-2 mb-4">
        <h4 className="text-lg font-semibold text-slate-600">
           <EditableText 
                initialText={category.name} 
                onSave={(newName) => onCategoryNameChange(subjectId, category.id, newName)}
            />
        </h4>
         <button onClick={() => onCategoryNameChange(subjectId, category.id, prompt('Neuer Kategoriename:', category.name) || category.name)} className="text-slate-400 hover:text-blue-500">
            <EditIcon />
        </button>
      </div>
      <div className="space-y-3">
        {category.competencies.map(competency => (
          <div key={competency.id} className="grid grid-cols-[2fr_1fr] items-center gap-4 py-2 border-b border-slate-200 last:border-b-0">
            <div className="flex items-center gap-2">
                <EditableText 
                    initialText={competency.text} 
                    onSave={(newText) => onCompetencyTextChange(subjectId, category.id, competency.id, newText)}
                    className="text-slate-700"
                />
                 <button onClick={() => onCompetencyTextChange(subjectId, category.id, competency.id, prompt('Kompetenztext bearbeiten:', competency.text) || competency.text)} className="text-slate-400 hover:text-blue-500">
                    <EditIcon />
                </button>
            </div>
            <RatingControl
              value={student.assessments[competency.id] ?? Rating.NotTaught}
              onChange={(rating) => onAssessmentChange(competency.id, rating)}
            />
          </div>
        ))}
        <div className="pt-2">
            <button 
                onClick={() => onAddCompetency(subjectId, category.id)}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-semibold"
            >
                <PlusCircleIcon />
                Kompetenz hinzufügen
            </button>
        </div>
      </div>
    </div>
  );
};

export default CategorySection;