import React, { useEffect, useRef, useMemo } from 'react';
import { Rating, RatingEntry } from '../types';
import { XIcon, TrashIcon } from './Icons';

interface RatingHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: RatingEntry[];
  onDeleteEntry: (timestamp: number) => void;
  ratingOption: Rating;
}

const RatingHistoryModal: React.FC<RatingHistoryModalProps> = ({
  isOpen,
  onClose,
  entries,
  onDeleteEntry,
  ratingOption
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close modal (Requirement 3.6)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Format timestamp to German date/time format with error handling (Requirement 3.2)
  const formatTimestamp = (timestamp: number): string => {
    try {
      // Validate timestamp
      if (typeof timestamp !== 'number' || timestamp <= 0) {
        console.warn('Invalid timestamp in formatTimestamp:', timestamp);
        return 'Ungültiges Datum';
      }

      const date = new Date(timestamp);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date created from timestamp:', timestamp);
        return 'Ungültiges Datum';
      }

      return new Intl.DateTimeFormat('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(date);
    } catch (error) {
      console.error('Error formatting timestamp:', error, timestamp);
      return 'Formatierungsfehler';
    }
  };

  // Get rating label for display
  const getRatingLabel = (rating: Rating): string => {
    switch (rating) {
      case Rating.NotTaught:
        return 'Nicht unterrichtet';
      case Rating.Low:
        return 'Niedrig';
      case Rating.Partial:
        return 'Teilweise';
      case Rating.Proficient:
        return 'Kompetent';
      case Rating.Excellent:
        return 'Exzellent';
      default:
        return 'Unbekannt';
    }
  };

  // Sort entries by timestamp (newest first) with error handling
  const sortedEntries = useMemo(() => {
    try {
      if (!Array.isArray(entries)) {
        console.warn('Invalid entries array in RatingHistoryModal:', entries);
        return [];
      }

      // Filter and validate entries before sorting
      const validEntries = entries.filter(entry => {
        if (!entry || typeof entry !== 'object') {
          console.warn('Invalid entry structure:', entry);
          return false;
        }

        if (typeof entry.timestamp !== 'number' || entry.timestamp <= 0) {
          console.warn('Invalid timestamp in entry:', entry);
          return false;
        }

        if (typeof entry.rating !== 'number' || entry.rating < 0 || entry.rating > 4) {
          console.warn('Invalid rating in entry:', entry);
          return false;
        }

        return true;
      });

      return [...validEntries].sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error sorting entries:', error);
      return [];
    }
  }, [entries]);

  return (
    <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-2xl border border-gray-200 max-w-md w-full mx-4 max-h-[80vh] flex flex-col"
      >
        {/* Header with close button (Requirement 3.5) */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">
            Bewertungshistorie: {getRatingLabel(ratingOption)}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            aria-label="Schließen"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content area with table (Requirement 3.1, 3.2, 3.3, 3.4) */}
        <div className="p-6 flex-1 overflow-auto">
          {sortedEntries.length === 0 ? (
            <p className="text-slate-500 text-center py-4">
              Keine Bewertungen für diese Option vorhanden.
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-slate-600 mb-4">
                Insgesamt {sortedEntries.length} Bewertung{sortedEntries.length !== 1 ? 'en' : ''}
              </p>

              {/* Table with timestamps and delete buttons */}
              <div className="space-y-2">
                {sortedEntries.map((entry, index) => (
                  <div
                    key={`${entry.timestamp}-${index}`}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    {/* German formatted timestamp (Requirement 3.2) */}
                    <span className="text-slate-700 font-mono text-sm">
                      {formatTimestamp(entry.timestamp)}
                    </span>

                    {/* Delete button with error handling (Requirement 3.3, 3.4) */}
                    <button
                      onClick={() => {
                        try {
                          if (typeof entry.timestamp !== 'number' || entry.timestamp <= 0) {
                            console.error('Invalid timestamp for deletion:', entry.timestamp);
                            return;
                          }
                          onDeleteEntry(entry.timestamp);
                        } catch (error) {
                          console.error('Error deleting entry:', error);
                        }
                      }}
                      className="p-1 rounded-full text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      aria-label={`Bewertung vom ${formatTimestamp(entry.timestamp)} löschen`}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RatingHistoryModal;