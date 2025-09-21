import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RatingControl from '../../components/RatingControl'
import { Rating, RatingEntry } from '../../types'

describe('RatingControl Component', () => {
  const mockOnAddRating = vi.fn()
  const mockOnShowHistory = vi.fn()

  const defaultProps = {
    entries: [] as RatingEntry[],
    onAddRating: mockOnAddRating,
    onShowHistory: mockOnShowHistory
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('Basic Rendering', () => {
    it('should render all rating options', () => {
      render(<RatingControl {...defaultProps} />)
      
      // Should render 5 rating options (Low, Partial, Proficient, Excellent, NotTaught)
      const ratingElements = screen.getAllByRole('generic').filter(el => 
        el.className.includes('w-6 h-6 rounded-full')
      )
      expect(ratingElements).toHaveLength(5)
    })

    it('should render with empty entries', () => {
      render(<RatingControl {...defaultProps} />)
      
      // No badges should be visible when no entries exist
      const badges = screen.queryAllByRole('button').filter(btn => 
        btn.className.includes('bg-blue-500')
      )
      expect(badges).toHaveLength(0)
    })

    it('should handle invalid entries prop gracefully', () => {
      render(<RatingControl {...defaultProps} entries={null as any} />)
      
      expect(screen.getByText('Fehler beim Laden der Bewertungen')).toBeInTheDocument()
    })

    it('should handle invalid callback props gracefully', () => {
      render(<RatingControl {...defaultProps} onAddRating={null as any} />)
      
      expect(screen.getByText('Bewertungsfunktionen nicht verfügbar')).toBeInTheDocument()
    })
  })

  describe('Visual Indicators (Requirements 2.1, 2.2, 2.3, 2.4, 2.5)', () => {
    it('should show thin circle for single rating (Requirement 2.1)', () => {
      const entries: RatingEntry[] = [
        { rating: Rating.Excellent, timestamp: Date.now() }
      ]
      
      render(<RatingControl {...defaultProps} entries={entries} />)
      
      // Find the excellent rating circle
      const excellentContainer = screen.getByTitle('Kompetenz sehr ausgeprägt').parentElement
      const circle = excellentContainer?.querySelector('.w-6.h-6.rounded-full.border-2')
      expect(circle).toBeInTheDocument()
      
      // Should show badge with count 1
      const badge = screen.getByText('1')
      expect(badge).toBeInTheDocument()
    })

    it('should show medium circle for two ratings (Requirement 2.2)', () => {
      const entries: RatingEntry[] = [
        { rating: Rating.Excellent, timestamp: Date.now() - 1000 },
        { rating: Rating.Excellent, timestamp: Date.now() }
      ]
      
      render(<RatingControl {...defaultProps} entries={entries} />)
      
      // Find the excellent rating circle with medium thickness
      const excellentContainer = screen.getByTitle('Kompetenz sehr ausgeprägt').parentElement
      const circle = excellentContainer?.querySelector('.w-6.h-6.rounded-full.border-4')
      expect(circle).toBeInTheDocument()
      
      // Should show badge with count 2
      const badge = screen.getByText('2')
      expect(badge).toBeInTheDocument()
    })

    it('should show thick circle for three or more ratings (Requirement 2.3)', () => {
      const entries: RatingEntry[] = [
        { rating: Rating.Excellent, timestamp: Date.now() - 2000 },
        { rating: Rating.Excellent, timestamp: Date.now() - 1000 },
        { rating: Rating.Excellent, timestamp: Date.now() }
      ]
      
      render(<RatingControl {...defaultProps} entries={entries} />)
      
      // Find the excellent rating circle with thick thickness
      const excellentContainer = screen.getByTitle('Kompetenz sehr ausgeprägt').parentElement
      const circle = excellentContainer?.querySelector('.w-6.h-6.rounded-full.border-6')
      expect(circle).toBeInTheDocument()
      
      // Should show badge with count 3
      const badge = screen.getByText('3')
      expect(badge).toBeInTheDocument()
    })

    it('should show count badges next to clicked options (Requirement 2.4)', () => {
      const entries: RatingEntry[] = [
        { rating: Rating.Excellent, timestamp: Date.now() - 2000 },
        { rating: Rating.Proficient, timestamp: Date.now() - 1000 },
        { rating: Rating.Excellent, timestamp: Date.now() }
      ]
      
      render(<RatingControl {...defaultProps} entries={entries} />)
      
      // Should show badge "2" for Excellent
      expect(screen.getByText('2')).toBeInTheDocument()
      // Should show badge "1" for Proficient
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('should not show badge when count is zero (Requirement 2.5)', () => {
      const entries: RatingEntry[] = [
        { rating: Rating.Excellent, timestamp: Date.now() }
      ]
      
      render(<RatingControl {...defaultProps} entries={entries} />)
      
      // Should show badge for Excellent (count 1)
      expect(screen.getByText('1')).toBeInTheDocument()
      
      // Should not show badges for other ratings (count 0)
      expect(screen.queryByText('0')).not.toBeInTheDocument()
      
      // Count all badges - should only be 1
      const badges = screen.getAllByRole('button').filter(btn => 
        btn.className.includes('bg-blue-500')
      )
      expect(badges).toHaveLength(1)
    })
  })

  describe('User Interactions (Requirements 1.1, 1.2, 1.3)', () => {
    it('should add new rating when circle is clicked (Requirements 1.1, 1.2)', async () => {
      const user = userEvent.setup()
      render(<RatingControl {...defaultProps} />)
      
      // Click on the Excellent rating circle
      const excellentCircle = screen.getByTitle('Kompetenz sehr ausgeprägt')
      await user.click(excellentCircle)
      
      expect(mockOnAddRating).toHaveBeenCalledWith(Rating.Excellent)
      expect(mockOnAddRating).toHaveBeenCalledTimes(1)
    })

    it('should allow multiple clicks on same rating (Requirement 1.2)', async () => {
      const user = userEvent.setup()
      render(<RatingControl {...defaultProps} />)
      
      const excellentCircle = screen.getByTitle('Kompetenz sehr ausgeprägt')
      
      // Click multiple times
      await user.click(excellentCircle)
      await user.click(excellentCircle)
      await user.click(excellentCircle)
      
      expect(mockOnAddRating).toHaveBeenCalledTimes(3)
      expect(mockOnAddRating).toHaveBeenNthCalledWith(1, Rating.Excellent)
      expect(mockOnAddRating).toHaveBeenNthCalledWith(2, Rating.Excellent)
      expect(mockOnAddRating).toHaveBeenNthCalledWith(3, Rating.Excellent)
    })

    it('should preserve existing ratings when adding new ones (Requirement 1.3)', async () => {
      const user = userEvent.setup()
      const existingEntries: RatingEntry[] = [
        { rating: Rating.Excellent, timestamp: Date.now() - 1000 }
      ]
      
      render(<RatingControl {...defaultProps} entries={existingEntries} />)
      
      // Should show existing rating
      expect(screen.getByText('1')).toBeInTheDocument()
      
      // Add another rating
      const excellentCircle = screen.getByTitle('Kompetenz sehr ausgeprägt')
      await user.click(excellentCircle)
      
      expect(mockOnAddRating).toHaveBeenCalledWith(Rating.Excellent)
    })

    it('should handle errors in onAddRating gracefully', async () => {
      const user = userEvent.setup()
      const errorCallback = vi.fn().mockImplementation(() => {
        throw new Error('Test error')
      })
      
      render(<RatingControl {...defaultProps} onAddRating={errorCallback} />)
      
      const excellentCircle = screen.getByTitle('Kompetenz sehr ausgeprägt')
      await user.click(excellentCircle)
      
      expect(errorCallback).toHaveBeenCalled()
      expect(console.error).toHaveBeenCalledWith('Error adding rating:', expect.any(Error))
    })
  })

  describe('History Modal Interaction (Requirement 3.1)', () => {
    it('should show history when badge is clicked (Requirement 3.1)', async () => {
      const user = userEvent.setup()
      const entries: RatingEntry[] = [
        { rating: Rating.Excellent, timestamp: Date.now() - 2000 },
        { rating: Rating.Excellent, timestamp: Date.now() - 1000 }
      ]
      
      render(<RatingControl {...defaultProps} entries={entries} />)
      
      // Click on the badge
      const badge = screen.getByText('2')
      await user.click(badge)
      
      expect(mockOnShowHistory).toHaveBeenCalledWith(
        Rating.Excellent,
        expect.arrayContaining([
          expect.objectContaining({ rating: Rating.Excellent }),
          expect.objectContaining({ rating: Rating.Excellent })
        ])
      )
    })

    it('should stop event propagation when badge is clicked', async () => {
      const user = userEvent.setup()
      const entries: RatingEntry[] = [
        { rating: Rating.Excellent, timestamp: Date.now() }
      ]
      
      render(<RatingControl {...defaultProps} entries={entries} />)
      
      const badge = screen.getByText('1')
      await user.click(badge)
      
      // Should call onShowHistory but not onAddRating
      expect(mockOnShowHistory).toHaveBeenCalled()
      expect(mockOnAddRating).not.toHaveBeenCalled()
    })

    it('should handle errors in onShowHistory gracefully', async () => {
      const user = userEvent.setup()
      const errorCallback = vi.fn().mockImplementation(() => {
        throw new Error('Test error')
      })
      const entries: RatingEntry[] = [
        { rating: Rating.Excellent, timestamp: Date.now() }
      ]
      
      render(<RatingControl {...defaultProps} entries={entries} onShowHistory={errorCallback} />)
      
      const badge = screen.getByText('1')
      await user.click(badge)
      
      expect(errorCallback).toHaveBeenCalled()
      expect(console.error).toHaveBeenCalledWith('Error showing history:', expect.any(Error))
    })
  })

  describe('Error Handling', () => {
    it('should render error indicator for invalid rating options', () => {
      // Mock calculateDisplayState to throw an error
      vi.doMock('../../types', async () => {
        const actual = await vi.importActual('../../types')
        return {
          ...actual,
          calculateDisplayState: vi.fn().mockImplementation(() => {
            throw new Error('Test error')
          })
        }
      })
      
      render(<RatingControl {...defaultProps} />)
      
      // Should render error indicators
      const errorIndicators = screen.getAllByText('!')
      expect(errorIndicators.length).toBeGreaterThan(0)
    })

    it('should handle malformed entries gracefully', () => {
      const malformedEntries = [
        { rating: Rating.Excellent, timestamp: Date.now() },
        null,
        { rating: 'invalid', timestamp: 'invalid' },
        { rating: Rating.Proficient, timestamp: Date.now() }
      ] as any
      
      render(<RatingControl {...defaultProps} entries={malformedEntries} />)
      
      // Should still render without crashing
      expect(screen.getByTitle('Kompetenz sehr ausgeprägt')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper titles for rating options', () => {
      render(<RatingControl {...defaultProps} />)
      
      expect(screen.getByTitle('Kompetenz gering ausgeprägt')).toBeInTheDocument()
      expect(screen.getByTitle('Kompetenz teilweise ausgeprägt')).toBeInTheDocument()
      expect(screen.getByTitle('Kompetenz ausgeprägt')).toBeInTheDocument()
      expect(screen.getByTitle('Kompetenz sehr ausgeprägt')).toBeInTheDocument()
      expect(screen.getByTitle('n.v. (nicht vermittelt)')).toBeInTheDocument()
    })

    it('should have proper titles for badges', () => {
      const entries: RatingEntry[] = [
        { rating: Rating.Excellent, timestamp: Date.now() - 1000 },
        { rating: Rating.Excellent, timestamp: Date.now() }
      ]
      
      render(<RatingControl {...defaultProps} entries={entries} />)
      
      const badge = screen.getByTitle('2 Bewertungen - Klicken für Details')
      expect(badge).toBeInTheDocument()
    })

    it('should handle singular vs plural in badge titles', () => {
      const entries: RatingEntry[] = [
        { rating: Rating.Excellent, timestamp: Date.now() }
      ]
      
      render(<RatingControl {...defaultProps} entries={entries} />)
      
      const badge = screen.getByTitle('1 Bewertung - Klicken für Details')
      expect(badge).toBeInTheDocument()
    })
  })
})