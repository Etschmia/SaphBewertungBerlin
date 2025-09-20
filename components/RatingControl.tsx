
import React from 'react';
import { Rating } from '../types';

interface RatingControlProps {
  value: Rating;
  onChange: (rating: Rating) => void;
}

const ratingOptions = [
  { value: Rating.Low, label: 'Kompetenz gering ausgeprägt' },
  { value: Rating.Partial, label: 'Kompetenz teilweise ausgeprägt' },
  { value: Rating.Proficient, label: 'Kompetenz ausgeprägt' },
  { value: Rating.Excellent, label: 'Kompetenz sehr ausgeprägt' },
  { value: Rating.NotTaught, label: 'n.v. (nicht vermittelt)' },
];

const RatingIcon: React.FC<{ rating: Rating, isSelected: boolean }> = ({ rating, isSelected }) => {
  const baseClasses = "w-6 h-6 rounded-full border-2 border-slate-400 transition-all cursor-pointer";
  const selectedClasses = "ring-2 ring-blue-500 ring-offset-1";

  const getStyle = () => {
    switch (rating) {
      case Rating.Low: return `bg-white`;
      case Rating.Partial: return `bg-gradient-to-r from-slate-600 from-50% to-white to-50%`;
      case Rating.Proficient: return `bg-white`;
      case Rating.Excellent: return `bg-slate-600 relative after:content-[''] after:absolute after:-top-1 after:-left-1 after:w-7 after:h-7 after:border-2 after:border-slate-600 after:rounded-full`;
      case Rating.NotTaught: return `bg-slate-200 border-dashed`;
      default: return `bg-white`;
    }
  }

  const getCustomStyle = () => {
    switch (rating) {
      case Rating.Low:
        return {
          background: `conic-gradient(from 0deg, #475569 0deg 90deg, white 90deg 360deg)`
        };
      case Rating.Proficient:
        return {
          background: `conic-gradient(from 0deg, #475569 0deg 270deg, white 270deg 360deg)`
        };
      default:
        return {};
    }
  }

  return <div
    className={`${baseClasses} ${getStyle()} ${isSelected ? selectedClasses : ''}`}
    style={getCustomStyle()}
  ></div>;
}

const RatingControl: React.FC<RatingControlProps> = ({ value, onChange }) => {
  return (
    <div className="flex items-center justify-end space-x-4">
      {ratingOptions.map(option => (
        <div
          key={option.value}
          onClick={() => onChange(option.value)}
          title={option.label}
        >
          <RatingIcon rating={option.value} isSelected={value === option.value} />
        </div>
      ))}
    </div>
  );
};

export default RatingControl;
