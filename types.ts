
export enum Rating {
  NotTaught = 0,
  Low = 1,
  Partial = 2,
  Proficient = 3,
  Excellent = 4,
}

export interface Competency {
  id: string;
  text: string;
}

export interface Category {
  id: string;
  name: string;
  competencies: Competency[];
}

export interface Subject {
  id: string;
  name: string;
  categories: Category[];
}

export interface RatingEntry {
  rating: Rating;
  timestamp: number; // Unix timestamp in milliseconds
}

export interface Student {
  id: string;
  name: string;
  assessments: Record<string, RatingEntry[]>; // key: competency.id -> array of RatingEntry
}

export interface AppState {
    students: Student[];
    subjects: Subject[];
}

// Legacy types for backward compatibility
export type LegacyAssessments = Record<string, Rating>;
export type ModernAssessments = Record<string, RatingEntry[]>;
export type AssessmentData = LegacyAssessments | ModernAssessments;

// Visual display state for rating controls
export interface RatingDisplayState {
  count: number;
  thickness: 'thin' | 'medium' | 'thick';
  showBadge: boolean;
}

// Data migration utilities with enhanced error handling
export function isLegacyFormat(data: AssessmentData): data is LegacyAssessments {
  if (!data || typeof data !== 'object') return false;
  
  try {
    // Check if any value is a direct Rating (number) rather than an array
    return Object.values(data).some(value => 
      typeof value === 'number' && value >= 0 && value <= 4
    );
  } catch (error) {
    console.warn('Error checking legacy format:', error);
    return false;
  }
}

export function migrateLegacyAssessments(legacy: LegacyAssessments): ModernAssessments {
  const modern: ModernAssessments = {};
  const currentTimestamp = Date.now();
  
  try {
    for (const [competencyId, rating] of Object.entries(legacy)) {
      // Validate competency ID
      if (!competencyId || typeof competencyId !== 'string' || competencyId.trim() === '') {
        console.warn(`Skipping invalid competency ID during migration: ${competencyId}`);
        continue;
      }
      
      // Validate and convert rating
      if (typeof rating === 'number' && rating >= 0 && rating <= 4 && Number.isInteger(rating)) {
        modern[competencyId] = [{
          rating: rating as Rating,
          timestamp: currentTimestamp
        }];
      } else {
        console.warn(`Invalid rating value during migration for ${competencyId}: ${rating}`);
        // Initialize empty array for invalid data
        modern[competencyId] = [];
      }
    }
  } catch (error) {
    console.error('Error during legacy assessment migration:', error);
    // Return partial results or empty object depending on severity
    throw new Error(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  return modern;
}

// Rating frequency calculation utilities with error handling
export function getMostFrequentRating(entries: RatingEntry[]): Rating | null {
  if (!entries || !Array.isArray(entries) || entries.length === 0) return null;
  
  try {
    // Filter out invalid entries and count frequency of each rating
    const ratingCounts = new Map<Rating, number>();
    const validEntries: RatingEntry[] = [];
    
    for (const entry of entries) {
      // Validate entry structure
      if (!entry || typeof entry !== 'object') {
        console.warn('Invalid entry structure in getMostFrequentRating:', entry);
        continue;
      }
      
      // Validate rating
      if (typeof entry.rating !== 'number' || !Number.isInteger(entry.rating) || 
          entry.rating < 0 || entry.rating > 4) {
        console.warn('Invalid rating in getMostFrequentRating:', entry.rating);
        continue;
      }
      
      // Validate timestamp
      if (typeof entry.timestamp !== 'number' || entry.timestamp <= 0) {
        console.warn('Invalid timestamp in getMostFrequentRating:', entry.timestamp);
        continue;
      }
      
      validEntries.push(entry);
      const count = ratingCounts.get(entry.rating) || 0;
      ratingCounts.set(entry.rating, count + 1);
    }
    
    if (validEntries.length === 0) return null;
    
    // Find the most frequent rating
    let mostFrequent: Rating | null = null;
    let maxCount = 0;
    let latestTimestamp = 0;
    
    for (const [rating, count] of Array.from(ratingCounts.entries())) {
      if (count > maxCount) {
        mostFrequent = rating;
        maxCount = count;
        // Find latest timestamp for this rating in case of ties
        const ratingsForThisValue = validEntries.filter(e => e.rating === rating);
        if (ratingsForThisValue.length > 0) {
          latestTimestamp = Math.max(...ratingsForThisValue.map(e => e.timestamp));
        }
      } else if (count === maxCount && mostFrequent !== null) {
        // In case of tie, use the one with the latest timestamp
        const ratingsForThisValue = validEntries.filter(e => e.rating === rating);
        if (ratingsForThisValue.length > 0) {
          const thisLatestTimestamp = Math.max(...ratingsForThisValue.map(e => e.timestamp));
          if (thisLatestTimestamp > latestTimestamp) {
            mostFrequent = rating;
            latestTimestamp = thisLatestTimestamp;
          }
        }
      }
    }
    
    return mostFrequent;
  } catch (error) {
    console.error('Error in getMostFrequentRating:', error);
    return null;
  }
}

export function getRatingCount(entries: RatingEntry[], targetRating: Rating): number {
  if (!entries || !Array.isArray(entries) || entries.length === 0) return 0;
  
  try {
    // Validate targetRating
    if (typeof targetRating !== 'number' || !Number.isInteger(targetRating) || 
        targetRating < 0 || targetRating > 4) {
      console.warn('Invalid targetRating in getRatingCount:', targetRating);
      return 0;
    }
    
    return entries.filter(entry => {
      // Validate entry before comparison
      return entry && 
             typeof entry === 'object' && 
             typeof entry.rating === 'number' && 
             entry.rating === targetRating;
    }).length;
  } catch (error) {
    console.error('Error in getRatingCount:', error);
    return 0;
  }
}

export function calculateDisplayState(entries: RatingEntry[], targetRating: Rating): RatingDisplayState {
  try {
    const count = getRatingCount(entries, targetRating);
    
    let thickness: 'thin' | 'medium' | 'thick';
    if (count === 0) {
      thickness = 'thin';
    } else if (count === 1) {
      thickness = 'thin';
    } else if (count === 2) {
      thickness = 'medium';
    } else {
      thickness = 'thick';
    }
    
    return {
      count,
      thickness,
      showBadge: count > 0
    };
  } catch (error) {
    console.error('Error in calculateDisplayState:', error);
    // Return safe fallback state
    return {
      count: 0,
      thickness: 'thin',
      showBadge: false
    };
  }
}

export function getRatingEntriesForRating(entries: RatingEntry[], targetRating: Rating): RatingEntry[] {
  if (!entries || !Array.isArray(entries) || entries.length === 0) return [];
  
  try {
    // Validate targetRating
    if (typeof targetRating !== 'number' || !Number.isInteger(targetRating) || 
        targetRating < 0 || targetRating > 4) {
      console.warn('Invalid targetRating in getRatingEntriesForRating:', targetRating);
      return [];
    }
    
    return entries.filter(entry => {
      // Validate entry structure and content
      return entry && 
             typeof entry === 'object' && 
             typeof entry.rating === 'number' && 
             typeof entry.timestamp === 'number' &&
             entry.rating === targetRating &&
             entry.timestamp > 0;
    });
  } catch (error) {
    console.error('Error in getRatingEntriesForRating:', error);
    return [];
  }
}
