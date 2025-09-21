import React, { useState } from 'react';
import { Rating, RatingEntry } from '../types';
import { 
  isValidTimestamp, 
  isValidRating, 
  sanitizeRatingEntry,
  sanitizeStudent,
  validateAssessmentData,
  ValidationError 
} from '../utils/validation';
import RatingControl from './RatingControl';
import RatingHistoryModal from './RatingHistoryModal';
import ErrorBoundary from './ErrorBoundary';

const ValidationTest: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [invalidEntries, setInvalidEntries] = useState<any[]>([]);

  const addResult = (test: string, passed: boolean, details?: string) => {
    const result = `${passed ? '✅' : '❌'} ${test}${details ? ` - ${details}` : ''}`;
    setTestResults(prev => [...prev, result]);
  };

  const runValidationTests = () => {
    setTestResults([]);
    
    // Test timestamp validation
    addResult('Valid timestamp', isValidTimestamp(Date.now()));
    addResult('Invalid timestamp (negative)', !isValidTimestamp(-1));
    addResult('Invalid timestamp (string)', !isValidTimestamp('invalid' as any));
    addResult('Invalid timestamp (too old)', !isValidTimestamp(new Date('2019-01-01').getTime()));
    
    // Test rating validation
    addResult('Valid rating', isValidRating(Rating.Proficient));
    addResult('Invalid rating (negative)', !isValidRating(-1));
    addResult('Invalid rating (too high)', !isValidRating(5));
    addResult('Invalid rating (string)', !isValidRating('2' as any));
    
    // Test entry sanitization
    const validEntry = { rating: Rating.Excellent, timestamp: Date.now() };
    const sanitizedValid = sanitizeRatingEntry(validEntry);
    addResult('Sanitize valid entry', sanitizedValid !== null && sanitizedValid.rating === Rating.Excellent);
    
    const invalidEntry = { rating: 'invalid', timestamp: 'also invalid' };
    const sanitizedInvalid = sanitizeRatingEntry(invalidEntry);
    addResult('Sanitize invalid entry', sanitizedInvalid === null);
    
    const fixableEntry = { rating: '2', timestamp: Date.now() };
    const sanitizedFixable = sanitizeRatingEntry(fixableEntry);
    addResult('Fix string rating', sanitizedFixable !== null && sanitizedFixable.rating === 2);
    
    // Test student sanitization
    const validStudent = {
      id: 'test-1',
      name: 'Test Student',
      assessments: { 'comp-1': [validEntry] }
    };
    const sanitizedStudent = sanitizeStudent(validStudent);
    addResult('Sanitize valid student', sanitizedStudent !== null && sanitizedStudent.id === 'test-1');
    
    const invalidStudent = { invalid: 'data' };
    const sanitizedInvalidStudent = sanitizeStudent(invalidStudent, 0);
    addResult('Sanitize invalid student', sanitizedInvalidStudent !== null && sanitizedInvalidStudent.name === 'Schüler 1');
    
    // Test assessment validation
    const modernAssessments = { 'comp-1': [validEntry] };
    const modernValidation = validateAssessmentData(modernAssessments);
    addResult('Validate modern format', modernValidation.isValid && modernValidation.format === 'modern');
    
    const legacyAssessments = { 'comp-1': Rating.Proficient };
    const legacyValidation = validateAssessmentData(legacyAssessments);
    addResult('Validate legacy format', legacyValidation.isValid && legacyValidation.format === 'legacy');
    
    const invalidAssessments = { 'comp-1': 'invalid' };
    const invalidValidation = validateAssessmentData(invalidAssessments);
    addResult('Detect invalid format', !invalidValidation.isValid && invalidValidation.format === 'invalid');
  };

  const testErrorBoundary = () => {
    // Create invalid entries that should trigger error handling
    const badEntries = [
      { rating: 'invalid', timestamp: 'bad' },
      { rating: -1, timestamp: -1 },
      null,
      undefined,
      'not an object',
      { rating: Rating.Excellent, timestamp: NaN }
    ];
    setInvalidEntries(badEntries);
  };

  const testModalWithInvalidData = () => {
    setShowModal(true);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Error Handling & Validation Tests</h1>
      
      <div className="space-y-6">
        {/* Validation Tests */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Validation Function Tests</h2>
          <button
            onClick={runValidationTests}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
          >
            Run Validation Tests
          </button>
          
          {testResults.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
              <h3 className="font-semibold mb-2">Test Results:</h3>
              <div className="space-y-1 text-sm font-mono">
                {testResults.map((result, index) => (
                  <div key={index}>{result}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Error Boundary Test */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Error Boundary Test</h2>
          <p className="text-sm text-gray-600 mb-4">
            This tests how components handle invalid data gracefully.
          </p>
          
          <button
            onClick={testErrorBoundary}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 mb-4"
          >
            Test with Invalid Data
          </button>
          
          <ErrorBoundary>
            <div className="border p-4 rounded">
              <h3 className="font-semibold mb-2">RatingControl with Invalid Data:</h3>
              <RatingControl
                entries={invalidEntries as any}
                onAddRating={(rating) => console.log('Add rating:', rating)}
                onShowHistory={(rating, entries) => console.log('Show history:', rating, entries)}
              />
            </div>
          </ErrorBoundary>
        </div>

        {/* Modal Error Handling Test */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Modal Error Handling Test</h2>
          <p className="text-sm text-gray-600 mb-4">
            This tests how the modal handles invalid timestamp data.
          </p>
          
          <button
            onClick={testModalWithInvalidData}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            Open Modal with Invalid Data
          </button>
          
          <ErrorBoundary>
            <RatingHistoryModal
              isOpen={showModal}
              onClose={() => setShowModal(false)}
              entries={[
                { rating: Rating.Excellent, timestamp: Date.now() },
                { rating: Rating.Excellent, timestamp: -1 } as any, // Invalid timestamp
                { rating: 'invalid' as any, timestamp: Date.now() }, // Invalid rating
                null as any, // Null entry
                { rating: Rating.Low, timestamp: 'invalid' as any } // Invalid timestamp type
              ]}
              onDeleteEntry={(timestamp) => console.log('Delete:', timestamp)}
              ratingOption={Rating.Excellent}
            />
          </ErrorBoundary>
        </div>

        {/* Data Migration Test */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Data Migration Error Handling</h2>
          <p className="text-sm text-gray-600 mb-4">
            This demonstrates how the system handles corrupted or invalid data during migration.
          </p>
          
          <div className="space-y-2 text-sm">
            <div><strong>Test Cases:</strong></div>
            <div>• Invalid student objects</div>
            <div>• Missing required fields</div>
            <div>• Corrupted assessment data</div>
            <div>• Mixed legacy/modern formats</div>
            <div>• Invalid timestamps and ratings</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidationTest;