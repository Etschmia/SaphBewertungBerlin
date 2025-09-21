
import React, { useState } from 'react';
import { Rating, RatingEntry, calculateDisplayState, getRatingEntriesForRating } from '../types';

interface RatingControlProps {
  entries: RatingEntry[];
  onAddRating: (rating: Rating) => void;
  onShowHistory: (rating: Rating, entries: RatingEntry[]) => void;
}

const ratingOptions = [
  { value: Rating.Low, label: 'Kompetenz gering ausgeprägt' },
  { value: Rating.Partial, label: 'Kompetenz teilweise ausgeprägt' },
  { value: Rating.Proficient, label: 'Kompetenz ausgeprägt' },
  { value: Rating.Excellent, label: 'Kompetenz sehr ausgeprägt' },
  { value: Rating.NotTaught, label: 'n.v. (nicht vermittelt)' },
];

const RatingIcon: React.FC<{ 
  rating: Rating, 
  count: number,
  thickness: 'thin' | 'medium' | 'thick'
}> = ({ rating, count, thickness }) => {
  const getBorderWidth = () => {
    switch (thickness) {
      case 'thin': return 'border-2';
      case 'medium': return 'border-4';
      case 'thick': return 'border-6';
      default: return 'border-2';
    }
  };

  const baseClasses = `w-6 h-6 rounded-full ${getBorderWidth()} border-slate-400 dark:border-gray-500 transition-all cursor-pointer`;
  const hasRatings = count > 0;
  const selectedClasses = hasRatings ? "ring-2 ring-blue-500 dark:ring-blue-400 ring-offset-1 dark:ring-offset-gray-800" : "";

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
    className={`${baseClasses} ${getStyle()} ${selectedClasses}`}
    style={getCustomStyle()}
  ></div>;
}

const RatingControl: React.FC<RatingControlProps> = ({ entries, onAddRating, onShowHistory }) => {
  // Validate props
  if (!Array.isArray(entries)) {
    console.warn('Invalid entries prop in RatingControl:', entries);
    return (
      <div className="flex items-center justify-end space-x-4 text-red-500">
        <span className="text-sm">Fehler beim Laden der Bewertungen</span>
      </div>
    );
  }

  if (typeof onAddRating !== 'function' || typeof onShowHistory !== 'function') {
    console.error('Invalid callback props in RatingControl');
    return (
      <div className="flex items-center justify-end space-x-4 text-red-500">
        <span className="text-sm">Bewertungsfunktionen nicht verfügbar</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end space-x-4">
      {ratingOptions.map(option => {
        try {
          const displayState = calculateDisplayState(entries, option.value);
          const ratingEntries = getRatingEntriesForRating(entries, option.value);
          
          return (
            <div
              key={option.value}
              className="flex items-center space-x-1"
              title={option.label}
            >
              <div
                onClick={() => {
                  try {
                    onAddRating(option.value);
                  } catch (error) {
                    console.error('Error adding rating:', error);
                  }
                }}
                className="cursor-pointer"
              >
                <RatingIcon 
                  rating={option.value} 
                  count={displayState.count}
                  thickness={displayState.thickness}
                />
              </div>
              {displayState.showBadge && (
                <button
                  onClick={(e) => {
                    try {
                      e.stopPropagation();
                      onShowHistory(option.value, ratingEntries);
                    } catch (error) {
                      console.error('Error showing history:', error);
                    }
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center cursor-pointer transition-colors"
                  title={`${displayState.count} Bewertung${displayState.count > 1 ? 'en' : ''} - Klicken für Details`}
                >
                  {displayState.count}
                </button>
              )}
            </div>
          );
        } catch (error) {
          console.error('Error rendering rating option:', option.value, error);
          return (
            <div key={option.value} className="w-6 h-6 bg-red-100 border border-red-300 rounded-full flex items-center justify-center">
              <span className="text-red-500 text-xs">!</span>
            </div>
          );
        }
      })}
    </div>
  );
};

export default RatingControl;
