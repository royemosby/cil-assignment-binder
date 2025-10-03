/**
 * Safely parse date strings from various formats (especially Airtable data)
 * @param {string} dateString - The date string to parse
 * @returns {string|null} ISO date string or null if invalid
 */
export const parseDate = (dateString) => {
  if (!dateString || dateString.trim() === '') return null;

  try {
    // Log the original date string for debugging
    console.log('Parsing date:', dateString);

    // Handle common CSV date formats
    let dateStr = dateString.trim();

    // Convert formats like "7/6/2025 4:27pm" to something more standard
    // Replace "pm" and "am" with proper format
    if (dateStr.includes('pm') || dateStr.includes('am')) {
      // Convert "7/6/2025 4:27pm" to "7/6/2025 4:27 PM"
      dateStr = dateStr.replace(/(\d+:\d+)(pm|am)/i, '$1 $2').toUpperCase();
    }

    const date = new Date(dateStr);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date format: "${dateString}" -> "${dateStr}"`);
      return null;
    }

    console.log('Parsed date:', date.toISOString());
    return date.toISOString();
  } catch (error) {
    console.warn(`Error parsing date: "${dateString}"`, error);
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
