import { describe, it, expect, beforeEach, vi } from 'vitest'
import { generatePdf } from '../../services/pdfGenerator'
import { Rating, Student, Subject, RatingEntry } from '../../types'

// Mock jsPDF and autoTable
const mockSave = vi.fn()
const mockText = vi.fn()
const mockSetFontSize = vi.fn()
const mockAddPage = vi.fn()
const mockAutoTable = vi.fn()

const mockJsPDF = {
  text: mockText,
  setFontSize: mockSetFontSize,
  addPage: mockAddPage,
  autoTable: mockAutoTable,
  save: mockSave
}

// Mock the global jspdf object
global.jspdf = {
  jsPDF: vi.fn(() => mockJsPDF)
}

// Helper function to find competency rows in table body
const findCompetencyRow = (tableBody: any[], competencyText: string) => {
  const competencyRows = tableBody.filter((row: any[]) => 
    Array.isArray(row) && row.length === 2 && typeof row[0] === 'string' && row[0].includes('  - ')
  )
  return competencyRows.find((row: any[]) => row[0].includes(competencyText))
}

// Helper function to find competency rows that handles both string and object row formats
const findCompetencyRowSafe = (tableBody: any[], competencyText: string) => {
  return tableBody.find((row: any) => {
    if (!Array.isArray(row)) return false
    const firstCell = row[0]
    if (typeof firstCell === 'string') {
      return firstCell.includes(competencyText)
    }
    return false
  })
}

describe('PDF Generator with Frequency-based Rating Selection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createTestStudent = (assessments: Record<string, RatingEntry[]>): Student => ({
    id: 'student1',
    name: 'Max Mustermann',
    assessments
  })

  const createTestSubjects = (): Subject[] => [
    {
      id: 'subject1',
      name: 'Deutsch',
      categories: [
        {
          id: 'cat1',
          name: 'Lesen',
          competencies: [
            { id: 'comp1', text: 'Kann einfache Wörter lesen' },
            { id: 'comp2', text: 'Kann einfache Sätze lesen' }
          ]
        },
        {
          id: 'cat2',
          name: 'Schreiben',
          competencies: [
            { id: 'comp3', text: 'Kann einfache Wörter schreiben' }
          ]
        }
      ]
    }
  ]

  describe('Most Frequent Rating Selection (Requirements 5.1, 5.2)', () => {
    it('should use most frequent rating for PDF export (Requirement 5.1)', () => {
      const assessments = {
        'comp1': [
          { rating: Rating.Excellent, timestamp: Date.now() - 3000 },
          { rating: Rating.Proficient, timestamp: Date.now() - 2000 },
          { rating: Rating.Excellent, timestamp: Date.now() - 1000 } // Excellent appears twice
        ],
        'comp2': [
          { rating: Rating.Low, timestamp: Date.now() - 2000 },
          { rating: Rating.Low, timestamp: Date.now() - 1000 },
          { rating: Rating.Partial, timestamp: Date.now() } // Low appears twice
        ]
      }

      const student = createTestStudent(assessments)
      const subjects = createTestSubjects()

      generatePdf(student, subjects)

      expect(mockAutoTable).toHaveBeenCalled()
      const autoTableCall = mockAutoTable.mock.calls[0][0]
      const tableBody = autoTableCall.body

      // Find the rows for our competencies
      const comp1Row = findCompetencyRow(tableBody, 'Kann einfache Wörter lesen')
      const comp2Row = findCompetencyRow(tableBody, 'Kann einfache Sätze lesen')

      expect(comp1Row).toBeDefined()
      expect(comp2Row).toBeDefined()
      expect(comp1Row[1]).toBe('sehr ausgeprägt') // Most frequent: Excellent
      expect(comp2Row[1]).toBe('gering ausgeprägt') // Most frequent: Low
    })

    it('should handle ties by using latest timestamp (Requirement 5.2)', () => {
      const assessments = {
        'comp1': [
          { rating: Rating.Excellent, timestamp: Date.now() - 2000 }, // Older
          { rating: Rating.Proficient, timestamp: Date.now() - 1000 } // Newer - should win tie
        ]
      }

      const student = createTestStudent(assessments)
      const subjects = createTestSubjects()

      generatePdf(student, subjects)

      const autoTableCall = mockAutoTable.mock.calls[0][0]
      const tableBody = autoTableCall.body

      const comp1Row = findCompetencyRowSafe(tableBody, 'Kann einfache Wörter lesen')

      expect(comp1Row[1]).toBe('ausgeprägt') // Proficient (newer timestamp)
    })

    it('should handle complex tie scenarios correctly', () => {
      const baseTime = Date.now()
      const assessments = {
        'comp1': [
          { rating: Rating.Excellent, timestamp: baseTime - 5000 }, // Count: 1, Latest: baseTime - 5000
          { rating: Rating.Proficient, timestamp: baseTime - 4000 }, // Count: 2, Latest: baseTime - 1000
          { rating: Rating.Low, timestamp: baseTime - 3000 },       // Count: 2, Latest: baseTime - 2000
          { rating: Rating.Proficient, timestamp: baseTime - 1000 }, // Proficient wins (same count, later timestamp)
          { rating: Rating.Low, timestamp: baseTime - 2000 }
        ]
      }

      const student = createTestStudent(assessments)
      const subjects = createTestSubjects()

      generatePdf(student, subjects)

      const autoTableCall = mockAutoTable.mock.calls[0][0]
      const tableBody = autoTableCall.body

      const comp1Row = findCompetencyRowSafe(tableBody, 'Kann einfache Wörter lesen')

      expect(comp1Row[1]).toBe('ausgeprägt') // Proficient (tie-breaker by timestamp)
    })
  })

  describe('No Ratings Handling (Requirement 5.3)', () => {
    it('should show "nicht vermittelt" when no ratings exist (Requirement 5.3)', () => {
      const assessments = {
        'comp1': [], // No ratings
        'comp2': [] // No ratings
      }

      const student = createTestStudent(assessments)
      const subjects = createTestSubjects()

      generatePdf(student, subjects)

      const autoTableCall = mockAutoTable.mock.calls[0][0]
      const tableBody = autoTableCall.body

      const comp1Row = findCompetencyRowSafe(tableBody, 'Kann einfache Wörter lesen')
      const comp2Row = findCompetencyRowSafe(tableBody, 'Kann einfache Sätze lesen')

      expect(comp1Row[1]).toBe('nicht vermittelt')
      expect(comp2Row[1]).toBe('nicht vermittelt')
    })

    it('should handle missing competency assessments', () => {
      const assessments = {
        // comp1 and comp2 are missing entirely
        'comp3': [{ rating: Rating.Excellent, timestamp: Date.now() }]
      }

      const student = createTestStudent(assessments)
      const subjects = createTestSubjects()

      generatePdf(student, subjects)

      const autoTableCall = mockAutoTable.mock.calls[0][0]
      const tableBody = autoTableCall.body

      const comp1Row = findCompetencyRowSafe(tableBody, 'Kann einfache Wörter lesen')
      const comp2Row = findCompetencyRowSafe(tableBody, 'Kann einfache Sätze lesen')
      const comp3Row = findCompetencyRowSafe(tableBody, 'Kann einfache Wörter schreiben')

      expect(comp1Row[1]).toBe('nicht vermittelt')
      expect(comp2Row[1]).toBe('nicht vermittelt')
      expect(comp3Row[1]).toBe('sehr ausgeprägt')
    })
  })

  describe('PDF Layout Preservation (Requirement 5.4)', () => {
    it('should maintain existing PDF layout and format (Requirement 5.4)', () => {
      const assessments = {
        'comp1': [{ rating: Rating.Excellent, timestamp: Date.now() }],
        'comp2': [{ rating: Rating.Proficient, timestamp: Date.now() }],
        'comp3': [{ rating: Rating.Low, timestamp: Date.now() }]
      }

      const student = createTestStudent(assessments)
      const subjects = createTestSubjects()

      generatePdf(student, subjects)

      // Verify PDF structure remains the same
      expect(mockSetFontSize).toHaveBeenCalledWith(18) // Title font size
      expect(mockText).toHaveBeenCalledWith('Bewertungsübersicht für Max Mustermann', 14, 22)
      
      expect(mockSetFontSize).toHaveBeenCalledWith(14) // Subject font size
      expect(mockText).toHaveBeenCalledWith('Deutsch', 14, expect.any(Number))

      expect(mockAutoTable).toHaveBeenCalledWith({
        startY: expect.any(Number),
        head: [['Kompetenz', 'Bewertung']],
        body: expect.any(Array),
        theme: 'grid',
        headStyles: { fillColor: '#475569' },
        didDrawPage: expect.any(Function)
      })

      expect(mockSave).toHaveBeenCalledWith('bewertung_Max_Mustermann.pdf')
    })

    it('should handle page breaks correctly', () => {
      const assessments = {
        'comp1': [{ rating: Rating.Excellent, timestamp: Date.now() }]
      }

      const student = createTestStudent(assessments)
      
      // Create many subjects to trigger page break
      const manySubjects: Subject[] = Array(10).fill(null).map((_, i) => ({
        id: `subject${i}`,
        name: `Subject ${i}`,
        categories: [{
          id: `cat${i}`,
          name: `Category ${i}`,
          competencies: Array(20).fill(null).map((_, j) => ({
            id: `comp${i}_${j}`,
            text: `Competency ${i}_${j}`
          }))
        }]
      }))

      // Mock the didDrawPage callback to simulate page overflow
      mockAutoTable.mockImplementation((options: any) => {
        if (options.didDrawPage) {
          options.didDrawPage({ cursor: { y: 280 } }) // Simulate page overflow
        }
      })

      generatePdf(student, manySubjects)

      // Should call addPage when content exceeds page height
      expect(mockAddPage).toHaveBeenCalled()
    })

    it('should format student name correctly in filename', () => {
      const assessments = {}
      const student = createTestStudent(assessments)
      student.name = 'Anna Maria Müller-Schmidt'
      const subjects = createTestSubjects()

      generatePdf(student, subjects)

      expect(mockSave).toHaveBeenCalledWith('bewertung_Anna_Maria_Müller-Schmidt.pdf')
    })
  })

  describe('Rating Text Conversion', () => {
    it('should convert all rating values to correct German text', () => {
      const assessments = {
        'comp1': [{ rating: Rating.NotTaught, timestamp: Date.now() }],
        'comp2': [{ rating: Rating.Low, timestamp: Date.now() }],
        'comp3': [{ rating: Rating.Partial, timestamp: Date.now() }]
      }

      // Add more competencies to test all ratings
      const subjects = createTestSubjects()
      subjects[0].categories[0].competencies.push(
        { id: 'comp4', text: 'Test Proficient' },
        { id: 'comp5', text: 'Test Excellent' }
      )

      assessments['comp4'] = [{ rating: Rating.Proficient, timestamp: Date.now() }]
      assessments['comp5'] = [{ rating: Rating.Excellent, timestamp: Date.now() }]

      const student = createTestStudent(assessments)

      generatePdf(student, subjects)

      const autoTableCall = mockAutoTable.mock.calls[0][0]
      const tableBody = autoTableCall.body

      const findRowByText = (text: string) => 
        tableBody.find((row: any[]) => Array.isArray(row) && row[0] && typeof row[0] === 'string' && row[0].includes(text))

      expect(findRowByText('Kann einfache Wörter lesen')[1]).toBe('nicht vermittelt')
      expect(findRowByText('Kann einfache Sätze lesen')[1]).toBe('gering ausgeprägt')
      expect(findRowByText('Kann einfache Wörter schreiben')[1]).toBe('teilweise ausgeprägt')
      expect(findRowByText('Test Proficient')[1]).toBe('ausgeprägt')
      expect(findRowByText('Test Excellent')[1]).toBe('sehr ausgeprägt')
    })

    it('should handle invalid rating values gracefully', () => {
      const assessments = {
        'comp1': [{ rating: 999 as Rating, timestamp: Date.now() }] // Invalid rating
      }

      const student = createTestStudent(assessments)
      const subjects = createTestSubjects()

      // Should not throw error
      expect(() => generatePdf(student, subjects)).not.toThrow()

      const autoTableCall = mockAutoTable.mock.calls[0][0]
      const tableBody = autoTableCall.body

      const comp1Row = findCompetencyRowSafe(tableBody, 'Kann einfache Wörter lesen')

      // Invalid ratings are filtered out by getMostFrequentRating, which returns null
      // pdfGenerator then falls back to Rating.NotTaught
      expect(comp1Row[1]).toBe('nicht vermittelt')
    })
  })

  describe('Error Handling', () => {
    it('should handle corrupted assessment data', () => {
      const assessments = {
        'comp1': null as any, // Corrupted data
        'comp2': 'invalid' as any, // Invalid format
        'comp3': [{ rating: Rating.Excellent, timestamp: Date.now() }] // Valid data
      }

      const student = createTestStudent(assessments)
      const subjects = createTestSubjects()

      expect(() => generatePdf(student, subjects)).not.toThrow()

      const autoTableCall = mockAutoTable.mock.calls[0][0]
      const tableBody = autoTableCall.body

      const comp3Row = findCompetencyRowSafe(tableBody, 'Kann einfache Wörter schreiben')

      expect(comp3Row[1]).toBe('sehr ausgeprägt')
    })

    it('should handle empty subjects array', () => {
      const student = createTestStudent({})
      const subjects: Subject[] = []

      expect(() => generatePdf(student, subjects)).not.toThrow()

      // Should still create PDF with header
      expect(mockText).toHaveBeenCalledWith('Bewertungsübersicht für Max Mustermann', 14, 22)
      expect(mockSave).toHaveBeenCalledWith('bewertung_Max_Mustermann.pdf')
    })

    it('should handle subjects with no categories', () => {
      const student = createTestStudent({})
      const subjects: Subject[] = [{
        id: 'subject1',
        name: 'Empty Subject',
        categories: []
      }]

      expect(() => generatePdf(student, subjects)).not.toThrow()

      expect(mockText).toHaveBeenCalledWith('Empty Subject', 14, expect.any(Number))
    })
  })
})