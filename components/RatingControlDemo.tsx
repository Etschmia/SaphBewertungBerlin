import React from 'react';
import { Rating, RatingEntry } from '../types';
import RatingControl from './RatingControl';

// Simple test component to verify RatingControl functionality
const TestRatingControl: React.FC = () => {
  const [entries, setEntries] = React.useState<RatingEntry[]>([
    { rating: Rating.Excellent, timestamp: Date.now() - 86400000 }, // 1 day ago
    { rating: Rating.Excellent, timestamp: Date.now() - 3600000 },  // 1 hour ago
    { rating: Rating.Proficient, timestamp: Date.now() - 300000 },   // 5 minutes ago
    { rating: Rating.Low, timestamp: Date.now() - 120000 },         // 2 minutes ago
  ]);

  const handleAddRating = (rating: Rating) => {
    const newEntry: RatingEntry = {
      rating,
      timestamp: Date.now()
    };
    setEntries(prev => [...prev, newEntry]);
    console.log('Added rating:', rating, 'at', new Date().toLocaleString('de-DE'));
  };

  const handleShowHistory = (rating: Rating, ratingEntries: RatingEntry[]) => {
    console.log('Show history for rating:', rating, 'entries:', ratingEntries);
    alert(`History for rating ${rating}: ${ratingEntries.length} entries`);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">RatingControl Test</h1>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-lg font-semibold mb-4">Test Competency: "Kann einfache Sätze lesen"</h2>
        
        <RatingControl
          entries={entries}
          onAddRating={handleAddRating}
          onShowHistory={handleShowHistory}
        />
      </div>

      <div className="mt-6 space-y-2">
        <h2 className="text-lg font-semibold">Test Requirements:</h2>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>✅ Multiple circles with different thicknesses based on frequency (Req 2.1, 2.2, 2.3)</li>
          <li>✅ Count badges next to rating options when clicked (Req 2.4)</li>
          <li>✅ No badge shown when count is zero (Req 2.5)</li>
          <li>✅ Click on circle adds new rating (Req 1.1, 1.2)</li>
          <li>✅ Click on badge shows history modal (Req 3.1)</li>
        </ul>
      </div>

      <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded">
        <h3 className="font-semibold mb-2">Current Entries:</h3>
        <pre className="text-xs overflow-auto">
          {JSON.stringify(entries, null, 2)}
        </pre>
      </div>

      <div className="mt-4 space-x-2">
        <button
          onClick={() => setEntries([])}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Clear All Ratings
        </button>
        <button
          onClick={() => {
            const testData: RatingEntry[] = [
              { rating: Rating.Excellent, timestamp: Date.now() - 86400000 },
              { rating: Rating.Excellent, timestamp: Date.now() - 3600000 },
              { rating: Rating.Excellent, timestamp: Date.now() - 300000 },
              { rating: Rating.Proficient, timestamp: Date.now() - 240000 },
              { rating: Rating.Proficient, timestamp: Date.now() - 180000 },
              { rating: Rating.Low, timestamp: Date.now() - 120000 },
            ];
            setEntries(testData);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Load Test Data
        </button>
      </div>
    </div>
  );
};

export default TestRatingControl;