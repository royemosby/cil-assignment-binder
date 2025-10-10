/**
 * Cohort utility functions for parsing, cleaning, and managing cohort data
 * Handles cohort names embedded in student names and provides failsafe defaults
 */

/**
 * Extract cohort name from student name with failsafe default
 * @param {string} fullName - Student name potentially with cohort suffix
 * @param {string} defaultCohortName - Fallback cohort name
 * @returns {string} Extracted cohort name or default
 *
 * @example
 * extractCohortFromName("John Doe (Kiwi)") → "Kiwi"
 * extractCohortFromName("John Doe") → "Current Cohort"
 */
export function extractCohortFromName(
  fullName,
  defaultCohortName = 'Current Cohort'
) {
  if (!fullName || typeof fullName !== 'string') {
    return defaultCohortName;
  }

  const match = fullName.match(/\(([^)]+)\)$/);
  return match ? match[1].trim() : defaultCohortName;
}

/**
 * Clean student name by removing cohort suffix
 * @param {string} fullName - Student name with potential cohort suffix
 * @returns {string} Clean student name without cohort identifier
 *
 * @example
 * cleanStudentName("John Doe (Kiwi)") → "John Doe"
 * cleanStudentName("John Doe") → "John Doe"
 */
export function cleanStudentName(fullName) {
  if (!fullName || typeof fullName !== 'string') {
    return '';
  }

  return fullName.replace(/\s*\([^)]+\)$/, '').trim();
}

/**
 * Generate display name for cohort (for UI purposes)
 * @param {string} cohortName - Base cohort name
 * @returns {string} Display-friendly cohort name
 *
 * @example
 * generateCohortDisplayName("Kiwi") → "Kiwi Cohort"
 * generateCohortDisplayName("Current Cohort") → "Current Cohort"
 */
export function generateCohortDisplayName(cohortName) {
  if (!cohortName || typeof cohortName !== 'string') {
    return 'Unknown Cohort';
  }

  return cohortName.includes('Cohort') ? cohortName : `${cohortName} Cohort`;
}

/**
 * Check if student name contains cohort identifier
 * @param {string} fullName - Student name to check
 * @returns {boolean} True if cohort identifier is present
 *
 * @example
 * hasEmbeddedCohort("John Doe (Kiwi)") → true
 * hasEmbeddedCohort("John Doe") → false
 */
export function hasEmbeddedCohort(fullName) {
  if (!fullName || typeof fullName !== 'string') {
    return false;
  }

  return /\([^)]+\)$/.test(fullName);
}

/**
 * Create a unique student key for upsert matching within cohort context
 * @param {string} studentName - Clean student name (without cohort suffix)
 * @param {number} cohortId - Cohort ID for scoping
 * @returns {string} Unique key for student matching
 *
 * @example
 * generateStudentKey("John Doe", 1) → "john-doe_1"
 */
export function generateStudentKey(studentName, cohortId) {
  if (!studentName || !cohortId) {
    throw new Error(
      'Student name and cohort ID are required for generating student key'
    );
  }

  const normalizedName = studentName.toLowerCase().replace(/\s+/g, '-');
  return `${normalizedName}_${cohortId}`;
}

/**
 * Validate cohort name for creation/updates
 * @param {string} cohortName - Cohort name to validate
 * @returns {object} Validation result with success flag and error message
 */
export function validateCohortName(cohortName) {
  if (!cohortName || typeof cohortName !== 'string') {
    return {
      valid: false,
      error: 'Cohort name is required',
    };
  }

  const trimmed = cohortName.trim();

  if (trimmed.length < 2) {
    return {
      valid: false,
      error: 'Cohort name must be at least 2 characters long',
    };
  }

  if (trimmed.length > 50) {
    return {
      valid: false,
      error: 'Cohort name must be less than 50 characters',
    };
  }

  // Check for invalid characters
  if (!/^[a-zA-Z0-9\s\-_]+$/.test(trimmed)) {
    return {
      valid: false,
      error:
        'Cohort name can only contain letters, numbers, spaces, hyphens, and underscores',
    };
  }

  return {
    valid: true,
    name: trimmed,
  };
}

/**
 * Calculate current week based on cohort start date and lesson start day
 * @param {string} cohortStartDate - ISO date string of cohort start
 * @param {string} lessonWeekStartDay - Day of week lessons start (default: Wednesday)
 * @returns {number} Current week number (0-based)
 */
export function calculateCurrentWeek(
  cohortStartDate,
  lessonWeekStartDay = 'Wednesday'
) {
  if (!cohortStartDate) {
    return 0;
  }

  try {
    const startDate = new Date(cohortStartDate);
    const now = new Date();
    const dayOfWeek = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const lessonStartDayIndex = dayOfWeek.indexOf(lessonWeekStartDay);

    if (lessonStartDayIndex === -1) {
      throw new Error(`Invalid lesson start day: ${lessonWeekStartDay}`);
    }

    // Calculate the first lesson day (adjust start date to the specified day of week)
    const daysUntilFirstLesson =
      (lessonStartDayIndex - startDate.getDay() + 7) % 7;
    const firstLessonDate = new Date(startDate);
    firstLessonDate.setDate(startDate.getDate() + daysUntilFirstLesson);

    // Calculate weeks elapsed since first lesson
    const timeDiff = now.getTime() - firstLessonDate.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const weeksDiff = Math.floor(daysDiff / 7);

    return Math.max(0, weeksDiff);
  } catch (error) {
    console.error('Error calculating current week:', error);
    return 0;
  }
}

/**
 * Default cohort configuration object
 */
export const DEFAULT_COHORT_CONFIG = {
  noPRforWeeks: [0], // Week 0 typically doesn't require pull requests
  allowLateSubmissions: true,
  automaticWeekCalculation: true,
  lessonWeekStartDay: 'Wednesday',
};

/**
 * Create a new cohort object with default values
 * @param {object} cohortData - Initial cohort data
 * @returns {object} Complete cohort object with defaults applied
 */
export function createCohortWithDefaults(cohortData = {}) {
  const now = new Date().toISOString();

  return {
    name: cohortData.name || '',
    startDate: cohortData.startDate || now,
    endDate: cohortData.endDate || null,
    status: cohortData.status || 'active',
    cilNotes: cohortData.cilNotes || '',
    config: {
      ...DEFAULT_COHORT_CONFIG,
      ...cohortData.config,
    },
    createdAt: cohortData.createdAt || now,
    updatedAt: now,
    lessonWeekStartDay: cohortData.lessonWeekStartDay || 'Wednesday',
  };
}
