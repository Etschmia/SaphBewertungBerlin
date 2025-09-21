import { describe, it, expect, beforeEach, vi } from 'vitest'
import { 
  Rating, 
  RatingEntry, 
  isLegacyFormat, 
  migrateLegacyAssessments, 
  getMostFrequentRating,
  getRatingCount,
  calculateDisplayState,
  getRatingEntriesForRating,
  LegacyAssessments,
  ModernAssessments
} from '../../types'

describe('Data Migration Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock console methods to avoid noise in tests
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('isLegacyFormat', () => {
    it('should identify legacy format correctly', () => {
      const legacyData: LegacyAssessments = {
        'comp1': Rating.Excellent,
        'comp2': Rating.Proficient
      }
      expect(isLegacyFormat(legacyData)).toBe(true)
    })

    it('should identify modern format correctly', () => {
      const modernData: ModernAssessments = {
        'comp1': [{ rating: Rating.Excellent, timestamp: Date.now() }],
        'comp2': [{ rating: Rating.Proficient, timestamp: Date.now() }]
      }
      expect(isLegacyFormat(modernData)).toBe(false)
    })

    it('should handle empty objects', () => {
      expect(isLegacyFormat({})).toBe(false)
    })

    it('should handle null/undefined input', () => {
      expect(isLegacyFormat(null as any)).toBe(false)
      expect(isLegacyFormat(undefined as any)).toBe(false)
    })

    it('should handle invalid data gracefully', () => {
      expect(isLegacyFormat('invalid' as any)).toBe(false)
      expect(isLegacyFormat(123 as any)).toBe(false)
    })

    it('should handle mixed invalid values', () => {
      const invalidData = {
        'comp1': 'invalid',
        'comp2': null,
        'comp3': undefined
      }
      expect(isLegacyFormat(invalidData as any)).toBe(false)
    })
  })

  describe('migrateLegacyAssessments', () => {
    it('should migrate valid legacy data correctly', () => {
      const legacyData: LegacyAssessments = {
        'comp1': Rating.Excellent,
        'comp2': Rating.Proficient,
        'comp3': Rating.Low
      }

      const result = migrateLegacyAssessments(legacyData)

      expect(Object.keys(result)).toEqual(['comp1', 'comp2', 'comp3'])
      expect(result.comp1).toHaveLength(1)
      expect(result.comp1[0].rating).toBe(Rating.Excellent)
      expect(result.comp1[0].timestamp).toBeTypeOf('number')
      expect(result.comp1[0].timestamp).toBeGreaterThan(0)
    })

    it('should handle empty legacy data', () => {
      const result = migrateLegacyAssessments({})
      expect(result).toEqual({})
    })

    it('should skip invalid competency IDs', () => {
      const legacyData = {
        '': Rating.Excellent,
        '   ': Rating.Proficient,
        'valid': Rating.Low
      } as LegacyAssessments

      const result = migrateLegacyAssessments(legacyData)
      expect(Object.keys(result)).toEqual(['valid'])
      expect(result.valid[0].rating).toBe(Rating.Low)
    })

    it('should handle invalid rating values', () => {
      const legacyData = {
        'comp1': 999 as Rating,
        'comp2': -1 as Rating,
        'comp3': Rating.Excellent,
        'comp4': 1.5 as Rating
      }

      const result = migrateLegacyAssessments(legacyData)
      expect(Object.keys(result)).toEqual(['comp1', 'comp2', 'comp3', 'comp4'])
      expect(result.comp1).toEqual([]) // Invalid rating should result in empty array
      expect(result.comp2).toEqual([]) // Invalid rating should result in empty array
      expect(result.comp3[0].rating).toBe(Rating.Excellent)
      expect(result.comp4).toEqual([]) // Non-integer rating should result in empty array
    })

    it('should throw error for severely corrupted data', () => {
      const corruptedData = {
        get comp1() { throw new Error('Getter error') }
      } as any

      expect(() => migrateLegacyAssessments(corruptedData)).toThrow('Migration failed')
    })

    it('should use consistent timestamps for migration', () => {
      const legacyData: LegacyAssessments = {
        'comp1': Rating.Excellent,
        'comp2': Rating.Proficient
      }

      const result = migrateLegacyAssessments(legacyData)
      const timestamp1 = result.comp1[0].timestamp
      const timestamp2 = result.comp2[0].timestamp

      // Timestamps should be very close (within 10ms) since migration happens quickly
      expect(Math.abs(timestamp1 - timestamp2)).toBeLessThan(10)
    })
  })

  describe('getMostFrequentRating', () => {
    it('should return most frequent rating', () => {
      const entries: RatingEntry[] = [
        { rating: Rating.Excellent, timestamp: 1000 },
        { rating: Rating.Proficient, timestamp: 2000 },
        { rating: Rating.Excellent, timestamp: 3000 },
        { rating: Rating.Excellent, timestamp: 4000 },
        { rating: Rating.Proficient, timestamp: 5000 }
      ]

      expect(getMostFrequentRating(entries)).toBe(Rating.Excellent)
    })

    it('should handle ties by returning latest timestamp', () => {
      const entries: RatingEntry[] = [
        { rating: Rating.Excellent, timestamp: 1000 },   // Count: 1, Latest: 1000
        { rating: Rating.Proficient, timestamp: 3000 }   // Count: 1, Latest: 3000 (should win)
      ]

      // Both have count 1, Proficient has later timestamp (3000 > 1000)
      expect(getMostFrequentRating(entries)).toBe(Rating.Proficient)
    })

    it('should return null for empty array', () => {
      expect(getMostFrequentRating([])).toBe(null)
    })

    it('should return null for null/undefined input', () => {
      expect(getMostFrequentRating(null as any)).toBe(null)
      expect(getMostFrequentRating(undefined as any)).toBe(null)
    })

    it('should filter out invalid entries', () => {
      const entries = [
        { rating: Rating.Excellent, timestamp: 1000 },
        { rating: 999 as Rating, timestamp: 2000 }, // Invalid rating
        { rating: Rating.Proficient, timestamp: -1 }, // Invalid timestamp
        null as any, // Invalid entry
        { rating: Rating.Excellent, timestamp: 3000 }
      ]

      expect(getMostFrequentRating(entries)).toBe(Rating.Excellent)
    })

    it('should return null when all entries are invalid', () => {
      const entries = [
        { rating: 999 as Rating, timestamp: 1000 },
        { rating: Rating.Excellent, timestamp: -1 },
        null as any
      ]

      expect(getMostFrequentRating(entries)).toBe(null)
    })

    it('should handle single entry', () => {
      const entries: RatingEntry[] = [
        { rating: Rating.Proficient, timestamp: 1000 }
      ]

      expect(getMostFrequentRating(entries)).toBe(Rating.Proficient)
    })
  })

  describe('getRatingCount', () => {
    const entries: RatingEntry[] = [
      { rating: Rating.Excellent, timestamp: 1000 },
      { rating: Rating.Proficient, timestamp: 2000 },
      { rating: Rating.Excellent, timestamp: 3000 },
      { rating: Rating.Low, timestamp: 4000 }
    ]

    it('should count ratings correctly', () => {
      expect(getRatingCount(entries, Rating.Excellent)).toBe(2)
      expect(getRatingCount(entries, Rating.Proficient)).toBe(1)
      expect(getRatingCount(entries, Rating.Low)).toBe(1)
      expect(getRatingCount(entries, Rating.NotTaught)).toBe(0)
    })

    it('should return 0 for empty array', () => {
      expect(getRatingCount([], Rating.Excellent)).toBe(0)
    })

    it('should return 0 for null/undefined input', () => {
      expect(getRatingCount(null as any, Rating.Excellent)).toBe(0)
      expect(getRatingCount(undefined as any, Rating.Excellent)).toBe(0)
    })

    it('should handle invalid target rating', () => {
      expect(getRatingCount(entries, 999 as Rating)).toBe(0)
      expect(getRatingCount(entries, -1 as Rating)).toBe(0)
    })

    it('should filter out invalid entries', () => {
      const entriesWithInvalid = [
        { rating: Rating.Excellent, timestamp: 1000 },
        { rating: 999 as Rating, timestamp: 2000 }, // Invalid rating
        null as any, // Invalid entry
        { rating: Rating.Excellent, timestamp: 3000 }
      ]

      expect(getRatingCount(entriesWithInvalid, Rating.Excellent)).toBe(2)
    })
  })

  describe('calculateDisplayState', () => {
    it('should calculate thin thickness for single rating', () => {
      const entries: RatingEntry[] = [
        { rating: Rating.Excellent, timestamp: 1000 }
      ]

      const result = calculateDisplayState(entries, Rating.Excellent)
      expect(result).toEqual({
        count: 1,
        thickness: 'thin',
        showBadge: true
      })
    })

    it('should calculate medium thickness for two ratings', () => {
      const entries: RatingEntry[] = [
        { rating: Rating.Excellent, timestamp: 1000 },
        { rating: Rating.Excellent, timestamp: 2000 }
      ]

      const result = calculateDisplayState(entries, Rating.Excellent)
      expect(result).toEqual({
        count: 2,
        thickness: 'medium',
        showBadge: true
      })
    })

    it('should calculate thick thickness for three or more ratings', () => {
      const entries: RatingEntry[] = [
        { rating: Rating.Excellent, timestamp: 1000 },
        { rating: Rating.Excellent, timestamp: 2000 },
        { rating: Rating.Excellent, timestamp: 3000 },
        { rating: Rating.Excellent, timestamp: 4000 }
      ]

      const result = calculateDisplayState(entries, Rating.Excellent)
      expect(result).toEqual({
        count: 4,
        thickness: 'thick',
        showBadge: true
      })
    })

    it('should show no badge for zero count', () => {
      const entries: RatingEntry[] = [
        { rating: Rating.Proficient, timestamp: 1000 }
      ]

      const result = calculateDisplayState(entries, Rating.Excellent)
      expect(result).toEqual({
        count: 0,
        thickness: 'thin',
        showBadge: false
      })
    })

    it('should handle errors gracefully', () => {
      const result = calculateDisplayState(null as any, Rating.Excellent)
      expect(result).toEqual({
        count: 0,
        thickness: 'thin',
        showBadge: false
      })
    })
  })

  describe('getRatingEntriesForRating', () => {
    const entries: RatingEntry[] = [
      { rating: Rating.Excellent, timestamp: 1000 },
      { rating: Rating.Proficient, timestamp: 2000 },
      { rating: Rating.Excellent, timestamp: 3000 },
      { rating: Rating.Low, timestamp: 4000 }
    ]

    it('should filter entries by rating', () => {
      const result = getRatingEntriesForRating(entries, Rating.Excellent)
      expect(result).toHaveLength(2)
      expect(result[0].rating).toBe(Rating.Excellent)
      expect(result[1].rating).toBe(Rating.Excellent)
    })

    it('should return empty array for non-existent rating', () => {
      const result = getRatingEntriesForRating(entries, Rating.NotTaught)
      expect(result).toEqual([])
    })

    it('should return empty array for empty input', () => {
      expect(getRatingEntriesForRating([], Rating.Excellent)).toEqual([])
      expect(getRatingEntriesForRating(null as any, Rating.Excellent)).toEqual([])
    })

    it('should handle invalid target rating', () => {
      const result = getRatingEntriesForRating(entries, 999 as Rating)
      expect(result).toEqual([])
    })

    it('should filter out invalid entries', () => {
      const entriesWithInvalid = [
        { rating: Rating.Excellent, timestamp: 1000 },
        { rating: 999 as Rating, timestamp: 2000 }, // Invalid rating
        { rating: Rating.Excellent, timestamp: -1 }, // Invalid timestamp
        null as any, // Invalid entry
        { rating: Rating.Excellent, timestamp: 3000 }
      ]

      const result = getRatingEntriesForRating(entriesWithInvalid, Rating.Excellent)
      expect(result).toHaveLength(2)
      expect(result[0].timestamp).toBe(1000)
      expect(result[1].timestamp).toBe(3000)
    })
  })
})