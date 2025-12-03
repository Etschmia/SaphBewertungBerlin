import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RatingHistoryModal from '../../components/RatingHistoryModal'
import { Rating, RatingEntry } from '../../types'

// Mock the Icons component
vi.mock('../../components/Icons', () => ({
  XIcon: ({ className }: { className?: string }) => <div className={className} data-testid="x-icon">X</div>,
  TrashIcon: ({ className }: { className?: string }) => <div className={className} data-testid="trash-icon">🗑</div>
}))

describe('RatingHistoryModal Component', () => {
  const mockOnClose = vi.fn()
  const mockOnDeleteEntry = vi.fn()

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    entries: [] as RatingEntry[],
    onDeleteEntry: mockOnDeleteEntry,
    ratingOption: Rating.Excellent
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    
    // Mock document.addEventListener and removeEventListener
    vi.spyOn(document, 'addEventListener')
    vi.spyOn(document, 'removeEventListener')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Modal Visibility', () => {
    it('should render when isOpen is true', () => {
      render(<RatingHistoryModal {...defaultProps} />)
      
      expect(screen.getByText('Bewertungshistorie: Exzellent')).toBeInTheDocument()
    })

    it('should not render when isOpen is false', () => {
      render(<RatingHistoryModal {...defaultProps} isOpen={false} />)
      
      expect(screen.queryByText('Bewertungshistorie: Exzellent')).not.toBeInTheDocument()
    })

    it('should display correct rating label in header', () => {
      const testCases = [
        { rating: Rating.NotTaught, label: 'Nicht unterrichtet' },
        { rating: Rating.Low, label: 'Niedrig' },
        { rating: Rating.Partial, label: 'Teilweise' },
        { rating: Rating.Proficient, label: 'Kompetent' },
        { rating: Rating.Excellent, label: 'Exzellent' }
      ]

      testCases.forEach(({ rating, label }) => {
        const { unmount } = render(
          <RatingHistoryModal {...defaultProps} ratingOption={rating} />
        )
        
        expect(screen.getByText(`Bewertungshistorie: ${label}`)).toBeInTheDocument()
        unmount()
      })
    })
  })

  describe('Close Button (Requirement 3.5)', () => {
    it('should have close button in header', () => {
      render(<RatingHistoryModal {...defaultProps} />)
      
      const closeButton = screen.getByLabelText('Schließen')
      expect(closeButton).toBeInTheDocument()
      expect(closeButton).toHaveAttribute('aria-label', 'Schließen')
    })

    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup()
      render(<RatingHistoryModal {...defaultProps} />)
      
      const closeButton = screen.getByLabelText('Schließen')
      await user.click(closeButton)
      
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Auto-close on Outside Click (Requirement 3.6)', () => {
    it('should set up click outside listener when modal opens', () => {
      render(<RatingHistoryModal {...defaultProps} />)
      
      expect(document.addEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function))
    })

    it('should remove click outside listener when modal closes', () => {
      const { unmount } = render(<RatingHistoryModal {...defaultProps} />)
      
      // Unmount the component to trigger cleanup
      unmount()
      
      expect(document.removeEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function))
    })

    it('should call onClose when clicking outside modal', () => {
      render(<RatingHistoryModal {...defaultProps} />)
      
      // Simulate click outside modal
      const outsideElement = document.createElement('div')
      document.body.appendChild(outsideElement)
      
      fireEvent.mouseDown(outsideElement)
      
      expect(mockOnClose).toHaveBeenCalledTimes(1)
      
      document.body.removeChild(outsideElement)
    })

    it('should not call onClose when clicking inside modal', () => {
      render(<RatingHistoryModal {...defaultProps} />)
      
      const modalContent = screen.getByText('Bewertungshistorie: Exzellent')
      fireEvent.mouseDown(modalContent)
      
      expect(mockOnClose).not.toHaveBeenCalled()
    })
  })

  describe('Escape Key Handling', () => {
    it('should set up escape key listener when modal opens', () => {
      render(<RatingHistoryModal {...defaultProps} />)
      
      expect(document.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function))
    })

    it('should call onClose when escape key is pressed', () => {
      render(<RatingHistoryModal {...defaultProps} />)
      
      fireEvent.keyDown(document, { key: 'Escape' })
      
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should not call onClose for other keys', () => {
      render(<RatingHistoryModal {...defaultProps} />)
      
      fireEvent.keyDown(document, { key: 'Enter' })
      fireEvent.keyDown(document, { key: 'Space' })
      
      expect(mockOnClose).not.toHaveBeenCalled()
    })
  })

  describe('German Date/Time Formatting (Requirement 3.2)', () => {
    it('should format timestamps in German format', () => {
      const testTimestamp = new Date('2023-12-25T14:30:00Z').getTime()
      const entries: RatingEntry[] = [
        { rating: Rating.Excellent, timestamp: testTimestamp }
      ]
      
      render(<RatingHistoryModal {...defaultProps} entries={entries} />)
      
      // Should display German formatted date/time (allowing for timezone differences)
      expect(screen.getByText(/25\.12\.2023, \d{2}:\d{2}/)).toBeInTheDocument()
    })

    it('should handle multiple entries with different timestamps', () => {
      const entries: RatingEntry[] = [
        { rating: Rating.Excellent, timestamp: new Date('2023-12-25T14:30:00Z').getTime() },
        { rating: Rating.Excellent, timestamp: new Date('2023-11-15T09:15:00Z').getTime() },
        { rating: Rating.Excellent, timestamp: new Date('2023-10-05T16:45:00Z').getTime() }
      ]
      
      render(<RatingHistoryModal {...defaultProps} entries={entries} />)
      
      expect(screen.getByText(/25\.12\.2023, \d{2}:\d{2}/)).toBeInTheDocument()
      expect(screen.getByText(/15\.11\.2023, \d{2}:\d{2}/)).toBeInTheDocument()
      expect(screen.getByText(/05\.10\.2023, \d{2}:\d{2}/)).toBeInTheDocument()
    })

    it('should handle invalid timestamps gracefully', () => {
      const entries: RatingEntry[] = [
        { rating: Rating.Excellent, timestamp: -1 },
        { rating: Rating.Excellent, timestamp: NaN },
        { rating: Rating.Excellent, timestamp: Date.now() }
      ]
      
      render(<RatingHistoryModal {...defaultProps} entries={entries} />)
      
      expect(screen.getByText('Ungültiges Datum')).toBeInTheDocument()
      // Note: NaN timestamp might not trigger formatierungsfehler, just check for valid timestamp display
      expect(screen.getByText(/\d{2}\.\d{2}\.\d{4}, \d{2}:\d{2}/)).toBeInTheDocument()
    })
  })

  describe('Delete Functionality (Requirements 3.3, 3.4)', () => {
    it('should show delete button next to each timestamp (Requirement 3.3)', () => {
      const entries: RatingEntry[] = [
        { rating: Rating.Excellent, timestamp: Date.now() - 2000 },
        { rating: Rating.Excellent, timestamp: Date.now() - 1000 }
      ]
      
      render(<RatingHistoryModal {...defaultProps} entries={entries} />)
      
      const deleteButtons = screen.getAllByTestId('trash-icon')
      expect(deleteButtons).toHaveLength(2)
    })

    it('should call onDeleteEntry when delete button is clicked (Requirement 3.4)', async () => {
      const user = userEvent.setup()
      const testTimestamp = Date.now()
      const entries: RatingEntry[] = [
        { rating: Rating.Excellent, timestamp: testTimestamp }
      ]
      
      render(<RatingHistoryModal {...defaultProps} entries={entries} />)
      
      const deleteButton = screen.getByTestId('trash-icon').parentElement!
      await user.click(deleteButton)
      
      expect(mockOnDeleteEntry).toHaveBeenCalledWith(testTimestamp)
      expect(mockOnDeleteEntry).toHaveBeenCalledTimes(1)
    })

    it('should have proper aria-label for delete buttons', () => {
      const testTimestamp = new Date('2023-12-25T14:30:00Z').getTime()
      const entries: RatingEntry[] = [
        { rating: Rating.Excellent, timestamp: testTimestamp }
      ]
      
      render(<RatingHistoryModal {...defaultProps} entries={entries} />)
      
      const deleteButton = screen.getByLabelText(/Bewertung vom 25\.12\.2023, \d{2}:\d{2} löschen/)
      expect(deleteButton).toBeInTheDocument()
    })

    it('should handle delete errors gracefully', async () => {
      const user = userEvent.setup()
      const errorCallback = vi.fn().mockImplementation(() => {
        throw new Error('Delete error')
      })
      const entries: RatingEntry[] = [
        { rating: Rating.Excellent, timestamp: Date.now() }
      ]
      
      render(<RatingHistoryModal {...defaultProps} entries={entries} onDeleteEntry={errorCallback} />)
      
      const deleteButton = screen.getByTestId('trash-icon').parentElement!
      await user.click(deleteButton)
      
      expect(errorCallback).toHaveBeenCalled()
      expect(console.error).toHaveBeenCalledWith('Error deleting entry:', expect.any(Error))
    })

    it('should not call onDeleteEntry for invalid timestamps', async () => {
      const user = userEvent.setup()
      const entries = [
        { rating: Rating.Excellent, timestamp: -1 }
      ] as RatingEntry[]
      
      render(<RatingHistoryModal {...defaultProps} entries={entries} />)
      
      // Invalid entries should be filtered out, so no delete button should exist
      const deleteButtons = screen.queryAllByTestId('trash-icon')
      expect(deleteButtons).toHaveLength(0)
      
      expect(mockOnDeleteEntry).not.toHaveBeenCalled()
    })
  })

  describe('Entry Sorting and Display', () => {
    it('should sort entries by timestamp (newest first)', () => {
      const entries: RatingEntry[] = [
        { rating: Rating.Excellent, timestamp: new Date('2023-10-05T16:45:00Z').getTime() },
        { rating: Rating.Excellent, timestamp: new Date('2023-12-25T14:30:00Z').getTime() },
        { rating: Rating.Excellent, timestamp: new Date('2023-11-15T09:15:00Z').getTime() }
      ]
      
      render(<RatingHistoryModal {...defaultProps} entries={entries} />)
      
      const timestamps = screen.getAllByText(/\d{2}\.\d{2}\.\d{4}, \d{2}:\d{2}/)
      expect(timestamps[0]).toHaveTextContent(/25\.12\.2023, \d{2}:\d{2}/) // Newest first
      expect(timestamps[1]).toHaveTextContent(/15\.11\.2023, \d{2}:\d{2}/)
      expect(timestamps[2]).toHaveTextContent(/05\.10\.2023, \d{2}:\d{2}/) // Oldest last
    })

    it('should display entry count', () => {
      const entries: RatingEntry[] = [
        { rating: Rating.Excellent, timestamp: Date.now() - 2000 },
        { rating: Rating.Excellent, timestamp: Date.now() - 1000 },
        { rating: Rating.Excellent, timestamp: Date.now() }
      ]
      
      render(<RatingHistoryModal {...defaultProps} entries={entries} />)
      
      expect(screen.getByText('Insgesamt 3 Bewertungen')).toBeInTheDocument()
    })

    it('should handle singular vs plural in entry count', () => {
      const singleEntry: RatingEntry[] = [
        { rating: Rating.Excellent, timestamp: Date.now() }
      ]
      
      render(<RatingHistoryModal {...defaultProps} entries={singleEntry} />)
      
      expect(screen.getByText('Insgesamt 1 Bewertung')).toBeInTheDocument()
    })

    it('should show message when no entries exist', () => {
      render(<RatingHistoryModal {...defaultProps} entries={[]} />)
      
      expect(screen.getByText('Keine Bewertungen für diese Option vorhanden.')).toBeInTheDocument()
    })

    it('should filter out invalid entries', () => {
      const entries = [
        { rating: Rating.Excellent, timestamp: Date.now() },
        null,
        { rating: 'invalid', timestamp: 'invalid' },
        { rating: Rating.Excellent, timestamp: -1 },
        { rating: Rating.Excellent, timestamp: Date.now() - 1000 }
      ] as any
      
      render(<RatingHistoryModal {...defaultProps} entries={entries} />)
      
      // Should only show valid entries
      expect(screen.getByText('Insgesamt 2 Bewertungen')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid entries array gracefully', () => {
      render(<RatingHistoryModal {...defaultProps} entries={null as any} />)
      
      expect(screen.getByText('Keine Bewertungen für diese Option vorhanden.')).toBeInTheDocument()
    })

    it('should handle entries with malformed structure', () => {
      const malformedEntries = [
        'invalid',
        { rating: Rating.Excellent }, // Missing timestamp
        { timestamp: Date.now() }, // Missing rating
        { rating: Rating.Excellent, timestamp: Date.now() } // Valid
      ] as any
      
      render(<RatingHistoryModal {...defaultProps} entries={malformedEntries} />)
      
      // Should only count the valid entry
      expect(screen.getByText('Insgesamt 1 Bewertung')).toBeInTheDocument()
    })

    it('should handle sorting errors gracefully', () => {
      // Mock console.error to capture the error
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      // Create entries that might cause sorting issues
      const problematicEntries = [
        { rating: Rating.Excellent, timestamp: Date.now() },
        { 
          rating: Rating.Excellent, 
          timestamp: Date.now(),
          get extraProp() { throw new Error('Getter error') }
        }
      ] as any
      
      render(<RatingHistoryModal {...defaultProps} entries={problematicEntries} />)
      
      // Should still render without crashing
      expect(screen.getByText('Bewertungshistorie: Exzellent')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper modal structure', () => {
      render(<RatingHistoryModal {...defaultProps} />)
      
      // Modal header should be present
      const header = screen.getByText('Bewertungshistorie: Exzellent')
      expect(header).toBeInTheDocument()
      
      // Modal content should be properly structured - check for the modal container
      const modalContainer = header.closest('div')
      expect(modalContainer).toBeInTheDocument()
    })

    it('should have proper button roles and labels', () => {
      const entries: RatingEntry[] = [
        { rating: Rating.Excellent, timestamp: Date.now() }
      ]
      
      render(<RatingHistoryModal {...defaultProps} entries={entries} />)
      
      // Close button should have proper label
      const closeButton = screen.getByLabelText('Schließen')
      expect(closeButton).toHaveAttribute('aria-label', 'Schließen')
      
      // Delete button should have proper label
      const deleteButton = screen.getByLabelText(/Bewertung vom .* löschen/)
      expect(deleteButton).toBeInTheDocument()
    })
  })
})