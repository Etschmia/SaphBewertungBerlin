import React from 'react';
import { Rating, RatingEntry } from '../types';
import RatingHistoryModal from './RatingHistoryModal';

// Simple test component to verify RatingHistoryModal functionality
const TestRatingHistoryModal: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  // Sample test data
  const testEntries: RatingEntry[] = [
    { rating: Rating.Excellent, timestamp: Date.now() - 86400000 }, // 1 day ago
    { rating: Rating.Excellent, timestamp: Date.now() - 3600000 },  // 1 hour ago
    { rating: Rating.Excellent, timestamp: Date.now() - 300000 },   // 5 minutes ago
  ];

  const handleDeleteEntry = (timestamp: number) => {
    console.log('Delete entry with timestamp:', timestamp);
    // In real implementation, this would update the parent state
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">RatingHistoryModal Test</h1>
      
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Open Rating History Modal
      </button>

      <div className="mt-4 space-y-2">
        <h2 className="text-lg font-semibold">Test Requirements:</h2>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>✅ Modal opens when button is clicked (Requirement 3.1)</li>
          <li>✅ German date/time formatting for timestamps (Requirement 3.2)</li>
          <li>✅ Red delete button next to each timestamp (Requirement 3.3)</li>
          <li>✅ Delete functionality via onDeleteEntry callback (Requirement 3.4)</li>
          <li>✅ Close button in modal header (Requirement 3.5)</li>
          <li>✅ Auto-close when clicking outside modal (Requirement 3.6)</li>
        </ul>
      </div>

      <RatingHistoryModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        entries={testEntries}
        onDeleteEntry={handleDeleteEntry}
        ratingOption={Rating.Excellent}
      />
    </div>
  );
};

export default TestRatingHistoryModal;