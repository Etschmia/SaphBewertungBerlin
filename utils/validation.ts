import { Rating, RatingEntry, Student, AssessmentData, LegacyAssessments, ModernAssessments } from '../types';

/**
 * Validation utilities for data integrity
 */

// Constants for validation
const MIN_TIMESTAMP = new Date('2020-01-01').getTime(); // Reasonable minimum date
const MAX_TIMESTAMP = new Date('2030-12-31').getTime(); // Reasonable maximum date
const MAX_ENTRIES_PER_COMPETENCY = 1000; // Prevent memory issues

/**
 * Validates if a timestamp is within reasonable bounds
 */
export function isValidTimestamp(timestamp: number): boolean {
  if (typeof timestamp !== 'number') {
    return false;
  }
  
  if (!Number.isInteger(timestamp) || timestamp < 0) {
    return false;
  }
  
  // Check if timestamp is within reasonable bounds
  return timestamp >= MIN_TIMESTAMP && timestamp <= MAX_TIMESTAMP;
}

/**
 * Validates if a rating value is valid
 */
export function isValidRating(rating: any): rating is Rating {
  return typeof rating === 'number' && 
         Number.isInteger(rating) && 
         rating >= 0 && 
         rating <= 4 &&
         Object.values(Rating).includes(rating);
}

/**
 * Validates a single rating entry
 */
export function isValidRatingEntry(entry: any): entry is RatingEntry {
  if (!entry || typeof entry !== 'object') {
    return false;
  }
  
  return isValidRating(entry.rating) && isValidTimestamp(entry.timestamp);
}

/**
 * Sanitizes a rating entry, fixing common issues
 */
export function sanitizeRatingEntry(entry: any): RatingEntry | null {
  if (!entry || typeof entry !== 'object') {
    return null;
  }
  
  // Try to fix the rating
  let rating: Rating;
  if (isValidRating(entry.rating)) {
    rating = entry.rating;
  } else if (typeof entry.rating === 'string') {
    const parsed = parseInt(entry.rating, 10);
    if (isValidRating(parsed)) {
      rating = parsed;
    } else {
      return null;
    }
  } else {
    return null;
  }
  
  // Try to fix the timestamp
  let timestamp: number;
  if (isValidTimestamp(entry.timestamp)) {
    timestamp = entry.timestamp;
  } else if (typeof entry.timestamp === 'string') {
    const parsed = parseInt(entry.timestamp, 10);
    if (isValidTimestamp(parsed)) {
      timestamp = parsed;
    } else {
      // Try parsing as ISO date string
      const dateTimestamp = new Date(entry.timestamp).getTime();
      if (isValidTimestamp(dateTimestamp)) {
        timestamp = dateTimestamp;
      } else {
        // Use current timestamp as fallback
        timestamp = Date.now();
      }
    }
  } else {
    // Use current timestamp as fallback
    timestamp = Date.now();
  }
  
  return { rating, timestamp };
}

/**
 * Validates and sanitizes an array of rating entries
 */
export function sanitizeRatingEntries(entries: any[]): RatingEntry[] {
  if (!Array.isArray(entries)) {
    return [];
  }
  
  // Limit the number of entries to prevent memory issues
  const limitedEntries = entries.slice(0, MAX_ENTRIES_PER_COMPETENCY);
  
  const sanitized: RatingEntry[] = [];
  
  for (const entry of limitedEntries) {
    const sanitizedEntry = sanitizeRatingEntry(entry);
    if (sanitizedEntry) {
      sanitized.push(sanitizedEntry);
    }
  }
  
  // Sort by timestamp to ensure chronological order
  return sanitized.sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Validates student data structure
 */
export function isValidStudent(student: any): boolean {
  if (!student || typeof student !== 'object') {
    return false;
  }
  
  // Check required fields
  if (!student.id || typeof student.id !== 'string' || student.id.trim() === '') {
    return false;
  }
  
  if (!student.name || typeof student.name !== 'string' || student.name.trim() === '') {
    return false;
  }
  
  // Assessments can be missing (will be initialized as empty object)
  if (student.assessments && typeof student.assessments !== 'object') {
    return false;
  }
  
  return true;
}

/**
 * Sanitizes student data, fixing common issues
 */
export function sanitizeStudent(student: any, index?: number): Student | null {
  if (!student || typeof student !== 'object') {
    return null;
  }
  
  // Generate fallback ID if missing or invalid
  let id: string;
  if (student.id && typeof student.id === 'string' && student.id.trim() !== '') {
    id = student.id.trim();
  } else {
    id = `student-${Date.now()}-${index || 0}`;
  }
  
  // Generate fallback name if missing or invalid
  let name: string;
  if (student.name && typeof student.name === 'string' && student.name.trim() !== '') {
    name = student.name.trim();
  } else {
    name = `Schüler ${(index || 0) + 1}`;
  }
  
  // Sanitize assessments
  let assessments: Record<string, RatingEntry[]> = {};
  
  if (student.assessments && typeof student.assessments === 'object') {
    for (const [competencyId, data] of Object.entries(student.assessments)) {
      if (typeof competencyId === 'string' && competencyId.trim() !== '') {
        if (Array.isArray(data)) {
          // Modern format - sanitize entries
          assessments[competencyId] = sanitizeRatingEntries(data);
        } else if (isValidRating(data)) {
          // Legacy format - convert to modern format
          assessments[competencyId] = [{
            rating: data as Rating,
            timestamp: Date.now()
          }];
        } else {
          // Invalid data - initialize as empty
          assessments[competencyId] = [];
        }
      }
    }
  }
  
  return { id, name, assessments };
}

/**
 * Validates assessment data format (legacy vs modern)
 */
export function validateAssessmentData(data: any): { isValid: boolean; format: 'legacy' | 'modern' | 'invalid'; errors: string[] } {
  const errors: string[] = [];
  
  if (!data || typeof data !== 'object') {
    return { isValid: false, format: 'invalid', errors: ['Assessment data is not an object'] };
  }
  
  const entries = Object.entries(data);
  if (entries.length === 0) {
    return { isValid: true, format: 'modern', errors: [] };
  }
  
  let hasLegacyFormat = false;
  let hasModernFormat = false;
  
  for (const [competencyId, value] of entries) {
    if (typeof competencyId !== 'string' || competencyId.trim() === '') {
      errors.push(`Invalid competency ID: ${competencyId}`);
      continue;
    }
    
    if (Array.isArray(value)) {
      hasModernFormat = true;
      // Validate array entries
      for (let i = 0; i < value.length; i++) {
        if (!isValidRatingEntry(value[i])) {
          errors.push(`Invalid rating entry at ${competencyId}[${i}]`);
        }
      }
    } else if (isValidRating(value)) {
      hasLegacyFormat = true;
    } else {
      errors.push(`Invalid assessment value for ${competencyId}: ${value}`);
    }
  }
  
  // Determine format
  let format: 'legacy' | 'modern' | 'invalid';
  if (hasLegacyFormat && hasModernFormat) {
    errors.push('Mixed legacy and modern format detected');
    format = 'invalid';
  } else if (hasLegacyFormat) {
    format = 'legacy';
  } else if (hasModernFormat) {
    format = 'modern';
  } else {
    format = 'invalid';
  }
  
  return {
    isValid: errors.length === 0,
    format,
    errors
  };
}

/**
 * Error types for better error handling
 */
export class ValidationError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class DataMigrationError extends Error {
  constructor(message: string, public originalData?: any) {
    super(message);
    this.name = 'DataMigrationError';
  }
}

export class TimestampValidationError extends ValidationError {
  constructor(timestamp: any) {
    super(`Invalid timestamp: ${timestamp}`);
    this.name = 'TimestampValidationError';
  }
}