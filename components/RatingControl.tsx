
import React, { useMemo, useState } from 'react';
import { Rating } from '../types';

interface RatingControlProps {
  logs?: Record<Rating, string[]>;
  onClickOption: (rating: Rating) => void;
  onDeleteClickTime: (rating: Rating, index: number) => void;
}

const ratingOptions = [
  { value: Rating.Low, label: 'Kompetenz gering ausgeprägt' },
  { value: Rating.Partial, label: 'Kompetenz teilweise ausgeprägt' },
  { value: Rating.Proficient, label: 'Kompetenz ausgeprägt' },
  { value: Rating.Excellent, label: 'Kompetenz sehr ausgeprägt' },
  { value: Rating.NotTaught, label: 'n.v. (nicht vermittelt)' },
];

const RatingIcon: React.FC<{ rating: Rating, count: number }> = ({ rating, count }) => {
  const thickness = count >= 3 ? 'border-[5px]' : count === 2 ? 'border-[4px]' : count === 1 ? 'border-[3px]' : 'border-2';
  const baseClasses = `w-6 h-6 rounded-full ${thickness} border-slate-400 dark:border-gray-500 transition-all`;

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
    className={`${baseClasses} ${getStyle()}`}
    style={getCustomStyle()}
  ></div>;
}

const RatingControl: React.FC<RatingControlProps> = ({ logs, onClickOption, onDeleteClickTime }) => {
  const counts = useMemo(() => {
    const base: Record<Rating, number> = { [0]: 0, [1]: 0, [2]: 0, [3]: 0, [4]: 0 } as Record<Rating, number>;
    if (!logs) return base;
    return {
      [Rating.NotTaught]: logs[Rating.NotTaught]?.length || 0,
      [Rating.Low]: logs[Rating.Low]?.length || 0,
      [Rating.Partial]: logs[Rating.Partial]?.length || 0,
      [Rating.Proficient]: logs[Rating.Proficient]?.length || 0,
      [Rating.Excellent]: logs[Rating.Excellent]?.length || 0,
    } as Record<Rating, number>;
  }, [logs]);

  const [openFor, setOpenFor] = useState<Rating | null>(null);

  const formatDateTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return new Intl.DateTimeFormat('de-DE', { dateStyle: 'short', timeStyle: 'short' }).format(d);
    } catch {
      return iso;
    }
  };

  return (
    <div className="flex items-center justify-end space-x-4">
      {ratingOptions.map(option => {
        const count = counts[option.value] || 0;
        const times = logs?.[option.value] || [];
        return (
          <div key={option.value} className="relative flex items-center gap-1">
            <button onClick={() => onClickOption(option.value)} title={option.label} className="cursor-pointer">
              <RatingIcon rating={option.value} count={count} />
            </button>
            {count > 0 && (
              <button
                className="text-xs px-1 rounded bg-slate-200 dark:bg-gray-600 text-slate-700 dark:text-gray-100 hover:bg-slate-300 dark:hover:bg-gray-500"
                onClick={() => setOpenFor(openFor === option.value ? null : option.value)}
              >
                {count}
              </button>
            )}
            {openFor === option.value && times.length > 0 && (
              <div className="absolute z-10 right-0 top-7 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded shadow-md p-2 w-64">
                <div className="max-h-60 overflow-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-500 dark:text-gray-400">
                        <th>Zeit</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {times.map((t, idx) => (
                        <tr key={idx} className="border-t border-slate-200 dark:border-gray-700">
                          <td className="py-1 pr-2 text-slate-700 dark:text-gray-200">{formatDateTime(t)}</td>
                          <td className="py-1 text-right">
                            <button
                              className="text-red-600 hover:text-red-700 text-xs font-semibold"
                              onClick={() => onDeleteClickTime(option.value, idx)}
                            >
                              löschen
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default RatingControl;
