
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
  const baseClasses = "w-6 h-6 rounded-full border-2 border-slate-400 dark:border-gray-500 transition-all cursor-pointer";
  const selectedClasses = "ring-2 ring-blue-500 dark:ring-blue-400 ring-offset-1 dark:ring-offset-gray-800";

  const getStyle = () => {
    switch (rating) {
      case Rating.Low: return `bg-white dark:bg-gray-700`;
      case Rating.Partial: return `bg-gradient-to-r from-slate-600 dark:from-gray-400 from-50% to-white dark:to-gray-700 to-50%`;
      case Rating.Proficient: return `bg-white dark:bg-gray-700`;
      case Rating.Excellent: return `bg-slate-600 dark:bg-gray-400 relative after:content-[''] after:absolute after:-top-1 after:-left-1 after:w-7 after:h-7 after:border-2 after:border-slate-600 dark:after:border-gray-400 after:rounded-full`;
      case Rating.NotTaught: return `bg-slate-200 dark:bg-gray-600 border-dashed`;
      default: return `bg-white dark:bg-gray-700`;
    }
  }

  const getCustomStyle = () => {
    const isDark = document.documentElement.classList.contains('dark');
    const darkColor = '#9ca3af'; // gray-400
    const lightColor = '#475569'; // slate-600
    const darkBg = '#374151'; // gray-700
    const lightBg = 'white';
    
    const fillColor = isDark ? darkColor : lightColor;
    const bgColor = isDark ? darkBg : lightBg;
    
    switch (rating) {
      case Rating.Low:
        return {
          background: `conic-gradient(from 0deg, ${fillColor} 0deg 90deg, ${bgColor} 90deg 360deg)`
        };
      case Rating.Proficient:
        return {
          background: `conic-gradient(from 0deg, ${fillColor} 0deg 270deg, ${bgColor} 270deg 360deg)`
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
