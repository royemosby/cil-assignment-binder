/**
 * Safely parse date strings from various formats (especially Airtable data)
 * Handles comma-separated timestamps by selecting the most recent one
 * @param {string} dateString - The date string to parse (may contain comma-separated values)
 * @returns {string|null} ISO date string or null if invalid
 */
export const parseDate = (dateString) => {
  if (!dateString || dateString.trim() === '') return null;

  try {
    // Handle comma-separated dates by splitting and finding the most recent
    const dateStrings = dateString
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (dateStrings.length === 0) return null;

    // If multiple dates, parse all and find the most recent
    if (dateStrings.length > 1) {
      console.log(
        `Found ${dateStrings.length} comma-separated timestamps, selecting most recent:`,
        dateString
      );

      const validDates = [];

      for (const dateStr of dateStrings) {
        const parsedDate = parseSingleDate(dateStr);
        if (parsedDate) {
          validDates.push(parsedDate);
        }
      }

      if (validDates.length === 0) {
        console.warn(
          `No valid dates found in comma-separated string: "${dateString}"`
        );
        return null;
      }

      // Sort dates and return the most recent (latest timestamp)
      validDates.sort((a, b) => new Date(b) - new Date(a));
      const mostRecentDate = validDates[0];
      console.log(`→ Selected most recent: ${mostRecentDate}`);
      return mostRecentDate;
    }

    // Single date - use existing logic
    return parseSingleDate(dateStrings[0]);
  } catch (error) {
    console.warn(`Error parsing date: "${dateString}"`, error);
    return null;
  }
};

/**
 * Parse a single date string (internal helper function)
 * @param {string} dateStr - Single date string to parse
 * @returns {string|null} ISO date string or null if invalid
 */
const parseSingleDate = (dateStr) => {
  if (!dateStr || dateStr.trim() === '') return null;

  try {
    // Handle common CSV date formats
    let formattedDateStr = dateStr.trim();

    // Convert formats like "7/6/2025 4:27pm" to something more standard
    // Replace "pm" and "am" with proper format
    if (formattedDateStr.includes('pm') || formattedDateStr.includes('am')) {
      // Convert "7/6/2025 4:27pm" to "7/6/2025 4:27 PM"
      formattedDateStr = formattedDateStr
        .replace(/(\d+:\d+)(pm|am)/i, '$1 $2')
        .toUpperCase();
    }

    const date = new Date(formattedDateStr);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn(
        `Invalid date format: "${dateStr}" -> "${formattedDateStr}"`
      );
      return null;
    }

    return date.toISOString();
  } catch (error) {
    console.warn(`Error parsing single date: "${dateStr}"`, error);
    return null;
  }
};

/**
 * Format ISO date string for display
 * @param {string} isoString - ISO date string
 * @returns {string} Formatted date string or '-' if invalid
 */
export const formatDisplayDate = (isoString) => {
  if (!isoString) return '-';
  try {
    return new Date(isoString).toLocaleDateString();
  } catch {
    return '-';
  }
};
