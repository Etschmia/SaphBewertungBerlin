# Implementation Plan

- [x] 1. Update type definitions and create data migration utilities
  - Extend types.ts with new RatingEntry interface and updated Student interface
  - Create utility functions for data migration and format detection
  - Add helper functions for rating frequency calculations
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 2. Implement data migration logic in App.tsx
  - Add migration function to convert legacy assessments to new format
  - Update data loading logic to handle both old and new formats
  - Ensure backward compatibility when loading from localStorage
  - _Requirements: 4.2, 4.3_

- [x] 3. Create RatingHistoryModal component
  - Build modal component to display rating history table
  - Implement German date/time formatting for timestamps
  - Add delete functionality for individual rating entries
  - Include close button and auto-close on outside click
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 4. Update RatingControl component for multiple ratings display
  - Modify component to show multiple circles with different thicknesses
  - Add count badges next to rating options
  - Implement click handlers for both rating addition and badge clicks
  - Calculate and display visual indicators based on rating frequency
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 5. Update assessment change handlers in App.tsx
  - Replace single rating handler with add rating handler
  - Implement delete rating handler for removing specific entries
  - Update state management to work with rating arrays
  - Ensure proper timestamp generation for new ratings
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 6. Update AssessmentForm and SubjectAccordion components
  - Pass new handlers to child components
  - Update prop interfaces to support new rating system
  - Ensure proper data flow from form to rating controls
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 7. Update PDF export functionality
  - Modify generatePdf to use most frequent rating for each competency
  - Implement logic to handle ties in rating frequency
  - Ensure PDF format remains unchanged from user perspective
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 8. Update JSON export/import functionality
  - Ensure new data format is properly exported to JSON
  - Update import logic to handle both old and new JSON formats
  - Test data persistence across save/load cycles
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 9. Add comprehensive error handling and validation
  - Implement error boundaries for new components
  - Add validation for timestamp data integrity
  - Handle edge cases in data migration
  - _Requirements: 4.2, 4.3_

- [x] 10. Write unit tests for new functionality
  - Test data migration utilities with various input scenarios
  - Test RatingHistoryModal component behavior
  - Test updated RatingControl component with multiple ratings
  - Test PDF export with frequency-based rating selection
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 5.4_