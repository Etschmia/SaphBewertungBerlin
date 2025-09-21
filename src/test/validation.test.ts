import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  isValidTimestamp,
  isValidRating,
  isValidRatingEntry,
  sanitizeRatingEntry,
  sanitizeRatingEntries,
  isValidStudent,
  sanitizeStudent,
  validateAssessmentData,
  ValidationError,
  DataMigrationError,
  TimestampValidationError
} from '../../utils/validation'
import { Rating, RatingEntry, Student } from '../../types'

describe('Validation Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('isValidTimestamp', () => {
    it('should validate correct timestamps', () => {
      expect(isValidTimestamp(Date.now())).toBe(true)
      expect(isValidTimestamp(new Date('2023-01-01').getTime())).toBe(true)
      expect(isValidTimestamp(new Date('2025-12-31').getTime())).toBe(true)
    })

    it('should reject invalid timestamps', () => {
      expect(isValidTimestamp(-1)).toBe(false)
      expect(isValidTimestamp(0)).toBe(false)
      expect(isValidTimestamp(1.5)).toBe(false)
      expect(isValidTimestamp('123' as any)).toBe(false)
      expect(isValidTimestamp(null as any)).toBe(false)
      expect(isValidTimestamp(undefined as any)).toBe(false)
    })

    it('should reject timestamps outside reasonable bounds', () => {
      expect(isValidTimestamp(new Date('1999-01-01').getTime())).toBe(false)
      expect(isValidTimestamp(new Date('2031-01-01').getTime())).toBe(false)
    })
  })

  describe('isValidRating', () => {
    it('should validate correct ratings', () => {
      expect(isValidRating(Rating.NotTaught)).toBe(true)
      expect(isValidRating(Rating.Low)).toBe(true)
      expect(isValidRating(Rating.Partial)).toBe(true)
      expect(isValidRating(Rating.Proficient)).toBe(true)
      expect(isValidRating(Rating.Excellent)).toBe(true)
    })

    it('should reject invalid ratings', () => {
      expect(isValidRating(-1)).toBe(false)
      expect(isValidRating(5)).toBe(false)
      expect(isValidRating(1.5)).toBe(false)
      expect(isValidRating('1' as any)).toBe(false)
      expect(isValidRating(null)).toBe(false)
      expect(isValidRating(undefined)).toBe(false)
    })
  })

  describe('isValidRatingEntry', () => {
    it('should validate correct rating entries', () => {
      const validEntry: RatingEntry = {
        rating: Rating.Excellent,
        timestamp: Date.now()
      }
      expect(isValidRatingEntry(validEntry)).toBe(true)
    })

    it('should reject invalid rating entries', () => {
      expect(isValidRatingEntry(null)).toBe(false)
      expect(isValidRatingEntry(undefined)).toBe(false)
      expect(isValidRatingEntry('invalid')).toBe(false)
      expect(isValidRatingEntry({})).toBe(false)
      
      expect(isValidRatingEntry({
        rating: -1,
        timestamp: Date.now()
      })).toBe(false)
      
      expect(isValidRatingEntry({
        rating: Rating.Excellent,
        timestamp: -1
      })).toBe(false)
    })
  })

  describe('sanitizeRatingEntry', () => {
    it('should return valid entries unchanged', () => {
      const validEntry: RatingEntry = {
        rating: Rating.Excellent,
        timestamp: Date.now()
      }
      const result = sanitizeRatingEntry(validEntry)
      expect(result).toEqual(validEntry)
    })

    it('should fix string ratings', () => {
      const entry = {
        rating: '3',
        timestamp: Date.now()
      }
      const result = sanitizeRatingEntry(entry)
      expect(result?.rating).toBe(3)
    })

    it('should fix string timestamps', () => {
      const timestamp = Date.now()
      const entry = {
        rating: Rating.Excellent,
        timestamp: timestamp.toString()
      }
      const result = sanitizeRatingEntry(entry)
      expect(result?.timestamp).toBe(timestamp)
    })

    it('should fix ISO date string timestamps', () => {
      const date = new Date('2023-01-01T12:00:00Z')
      const entry = {
        rating: Rating.Excellent,
        timestamp: date.toISOString()
      }
      const result = sanitizeRatingEntry(entry)
      expect(result?.timestamp).toBe(date.getTime())
    })

    it('should use current timestamp as fallback for invalid timestamps', () => {
      const beforeTime = Date.now()
      const entry = {
        rating: Rating.Excellent,
        timestamp: 'invalid'
      }
      const result = sanitizeRatingEntry(entry)
      const afterTime = Date.now()
      
      expect(result?.timestamp).toBeGreaterThanOrEqual(beforeTime)
      expect(result?.timestamp).toBeLessThanOrEqual(afterTime)
    })

    it('should return null for invalid entries', () => {
      expect(sanitizeRatingEntry(null)).toBe(null)
      expect(sanitizeRatingEntry('invalid')).toBe(null)
      expect(sanitizeRatingEntry({ rating: 'invalid' })).toBe(null)
    })
  })

  describe('sanitizeRatingEntries', () => {
    it('should sanitize array of entries', () => {
      const entries = [
        { rating: Rating.Excellent, timestamp: Date.now() },
        { rating: '2', timestamp: Date.now() - 1000 },
        null,
        { rating: Rating.Low, timestamp: 'invalid' }
      ]
      
      const result = sanitizeRatingEntries(entries)
      expect(result).toHaveLength(3) // null entry should be filtered out
      
      // Check that all expected ratings are present (order may vary due to sorting)
      const ratings = result.map(r => r.rating)
      expect(ratings).toContain(Rating.Excellent)
      expect(ratings).toContain(2)
      expect(ratings).toContain(Rating.Low)
    })

    it('should return empty array for non-array input', () => {
      expect(sanitizeRatingEntries('invalid' as any)).toEqual([])
      expect(sanitizeRatingEntries(null as any)).toEqual([])
    })

    it('should limit entries to prevent memory issues', () => {
      const manyEntries = Array(2000).fill(null).map((_, i) => ({
        rating: Rating.Excellent,
        timestamp: Date.now() + i
      }))
      
      const result = sanitizeRatingEntries(manyEntries)
      expect(result.length).toBeLessThanOrEqual(1000)
    })

    it('should sort entries by timestamp', () => {
      const baseTime = new Date('2023-01-01').getTime()
      const entries = [
        { rating: Rating.Excellent, timestamp: baseTime + 3000 },
        { rating: Rating.Proficient, timestamp: baseTime + 1000 },
        { rating: Rating.Low, timestamp: baseTime + 2000 }
      ]
      
      const result = sanitizeRatingEntries(entries)
      expect(result[0].timestamp).toBe(baseTime + 1000)
      expect(result[1].timestamp).toBe(baseTime + 2000)
      expect(result[2].timestamp).toBe(baseTime + 3000)
    })
  })

  describe('isValidStudent', () => {
    it('should validate correct student', () => {
      const student: Student = {
        id: 'student1',
        name: 'Max Mustermann',
        assessments: {}
      }
      expect(isValidStudent(student)).toBe(true)
    })

    it('should reject invalid students', () => {
      expect(isValidStudent(null)).toBe(false)
      expect(isValidStudent({})).toBe(false)
      expect(isValidStudent({ id: '', name: 'Test' })).toBe(false)
      expect(isValidStudent({ id: 'test', name: '' })).toBe(false)
      expect(isValidStudent({ id: 'test', name: 'Test', assessments: 'invalid' })).toBe(false)
    })

    it('should allow missing assessments', () => {
      const student = {
        id: 'student1',
        name: 'Max Mustermann'
      }
      expect(isValidStudent(student)).toBe(true)
    })
  })

  describe('sanitizeStudent', () => {
    it('should return valid student unchanged', () => {
      const student: Student = {
        id: 'student1',
        name: 'Max Mustermann',
        assessments: {
          'comp1': [{ rating: Rating.Excellent, timestamp: Date.now() }]
        }
      }
      const result = sanitizeStudent(student)
      expect(result).toEqual(student)
    })

    it('should generate fallback ID and name', () => {
      const student = {
        id: '',
        name: '   '
      }
      const result = sanitizeStudent(student, 5)
      expect(result?.id).toMatch(/^student-\d+-5$/)
      expect(result?.name).toBe('Schüler 6')
    })

    it('should sanitize assessments', () => {
      const student = {
        id: 'student1',
        name: 'Test',
        assessments: {
          'comp1': [{ rating: Rating.Excellent, timestamp: Date.now() }],
          'comp2': Rating.Proficient, // Legacy format
          'comp3': 'invalid',
          '': Rating.Low // Invalid competency ID
        }
      }
      
      const result = sanitizeStudent(student)
      expect(result?.assessments.comp1).toHaveLength(1)
      expect(result?.assessments.comp2).toHaveLength(1)
      expect(result?.assessments.comp2[0].rating).toBe(Rating.Proficient)
      expect(result?.assessments.comp3).toEqual([])
      expect(result?.assessments['']).toBeUndefined()
    })

    it('should return null for completely invalid input', () => {
      expect(sanitizeStudent(null)).toBe(null)
      expect(sanitizeStudent('invalid')).toBe(null)
    })
  })

  describe('validateAssessmentData', () => {
    it('should validate modern format', () => {
      const data = {
        'comp1': [{ rating: Rating.Excellent, timestamp: Date.now() }],
        'comp2': []
      }
      
      const result = validateAssessmentData(data)
      expect(result.isValid).toBe(true)
      expect(result.format).toBe('modern')
      expect(result.errors).toEqual([])
    })

    it('should validate legacy format', () => {
      const data = {
        'comp1': Rating.Excellent,
        'comp2': Rating.Proficient
      }
      
      const result = validateAssessmentData(data)
      expect(result.isValid).toBe(true)
      expect(result.format).toBe('legacy')
      expect(result.errors).toEqual([])
    })

    it('should detect mixed formats', () => {
      const data = {
        'comp1': [{ rating: Rating.Excellent, timestamp: Date.now() }],
        'comp2': Rating.Proficient
      }
      
      const result = validateAssessmentData(data)
      expect(result.isValid).toBe(false)
      expect(result.format).toBe('invalid')
      expect(result.errors).toContain('Mixed legacy and modern format detected')
    })

    it('should validate empty data as modern format', () => {
      const result = validateAssessmentData({})
      expect(result.isValid).toBe(true)
      expect(result.format).toBe('modern')
    })

    it('should detect invalid data', () => {
      const data = {
        'comp1': 'invalid',
        '': Rating.Excellent
      }
      
      const result = validateAssessmentData(data)
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })

  describe('Error Classes', () => {
    it('should create ValidationError correctly', () => {
      const error = new ValidationError('Test message', { detail: 'test' })
      expect(error.name).toBe('ValidationError')
      expect(error.message).toBe('Test message')
      expect(error.details).toEqual({ detail: 'test' })
    })

    it('should create DataMigrationError correctly', () => {
      const originalData = { test: 'data' }
      const error = new DataMigrationError('Migration failed', originalData)
      expect(error.name).toBe('DataMigrationError')
      expect(error.message).toBe('Migration failed')
      expect(error.originalData).toEqual(originalData)
    })

    it('should create TimestampValidationError correctly', () => {
      const error = new TimestampValidationError('invalid')
      expect(error.name).toBe('TimestampValidationError')
      expect(error.message).toBe('Invalid timestamp: invalid')
    })
  })
})