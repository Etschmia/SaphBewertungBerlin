import React, { useState } from 'react';
// FIX: 'Rating' is used as a value, so it cannot be a type-only import.
import { Rating, type Category, type Student, type RatingEntry } from '../types';
import RatingControl from './RatingControl';
import RatingHistoryModal from './RatingHistoryModal';
import { EditIcon, PlusCircleIcon } from './Icons';

interface CategorySectionProps {
  subjectId: string;
  category: Category;
  student: Student;
  onAssessmentAdd: (competencyId: string, rating: Rating) => void;
  onAssessmentDelete: (competencyId: string, rating: Rating, timestamp: number) => void;
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
                className={`border-b-2 border-blue-500 dark:border-blue-400 focus:outline-none bg-inherit text-inherit ${className}`}
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
    onAssessmentAdd,
    onAssessmentDelete,
    onCompetencyTextChange,
    onCategoryNameChange,
    onAddCompetency
}) => {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    competencyId: string;
    rating: Rating;
    entries: RatingEntry[];
  } | null>(null);

  const handleShowHistory = (competencyId: string, rating: Rating, entries: RatingEntry[]) => {
    setModalState({
      isOpen: true,
      competencyId,
      rating,
      entries
    });
  };

  const handleCloseModal = () => {
    setModalState(null);
  };

  const handleDeleteEntry = (timestamp: number) => {
    if (modalState) {
      onAssessmentDelete(modalState.competencyId, modalState.rating, timestamp);
      // Update modal state to reflect the deletion
      const updatedEntries = modalState.entries.filter(entry => entry.timestamp !== timestamp);
      if (updatedEntries.length === 0) {
        handleCloseModal();
      } else {
        setModalState({
          ...modalState,
          entries: updatedEntries
        });
      }
    }
  };

  return (
    <div className="p-4 rounded-md bg-slate-50 dark:bg-gray-700 border border-slate-200/80 dark:border-gray-600">
      <div className="flex items-center gap-2 mb-4">
        <h4 className="text-lg font-semibold text-slate-600 dark:text-gray-200">
           <EditableText 
                initialText={category.name} 
                onSave={(newName) => onCategoryNameChange(subjectId, category.id, newName)}
            />
        </h4>
         <button onClick={() => onCategoryNameChange(subjectId, category.id, prompt('Neuer Kategoriename:', category.name) || category.name)} className="text-slate-400 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400">
            <EditIcon />
        </button>
      </div>
      <div className="space-y-3">
        {category.competencies.map(competency => {
          const entries = student.assessments[competency.id] || [];
          
          return (
            <div key={competency.id} className="grid grid-cols-[2fr_1fr] items-center gap-4 py-2 border-b border-slate-200 dark:border-gray-600 last:border-b-0">
              <div className="flex items-center gap-2">
                  <EditableText 
                      initialText={competency.text} 
                      onSave={(newText) => onCompetencyTextChange(subjectId, category.id, competency.id, newText)}
                      className="text-slate-700 dark:text-gray-200"
                  />
                   <button onClick={() => onCompetencyTextChange(subjectId, category.id, competency.id, prompt('Kompetenztext bearbeiten:', competency.text) || competency.text)} className="text-slate-400 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400">
                      <EditIcon />
                  </button>
              </div>
              <RatingControl
                entries={entries}
                onAddRating={(rating) => onAssessmentAdd(competency.id, rating)}
                onShowHistory={(rating, ratingEntries) => handleShowHistory(competency.id, rating, ratingEntries)}
              />
            </div>
          );
        })}
        <div className="pt-2">
            <button 
                onClick={() => onAddCompetency(subjectId, category.id)}
                className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold"
            >
                <PlusCircleIcon />
                Kompetenz hinzufügen
            </button>
        </div>
      </div>
      
      {modalState && (
        <RatingHistoryModal
          isOpen={modalState.isOpen}
          onClose={handleCloseModal}
          entries={modalState.entries}
          onDeleteEntry={handleDeleteEntry}
          ratingOption={modalState.rating}
        />
      )}
    </div>
  );
};

export default CategorySection;