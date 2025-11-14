/**
 * Format a date to a readable string
 * @param {Date|string} date - Date object or ISO string
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };
  
  return new Date(date).toLocaleDateString(undefined, defaultOptions);
};

/**
 * Format a time to a readable string
 * @param {Date|string} date - Date object or ISO string
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted time string
 */
export const formatTime = (date, options = {}) => {
  if (!date) return '';
  
  const defaultOptions = {
    hour: '2-digit',
    minute: '2-digit',
    ...options
  };
  
  return new Date(date).toLocaleTimeString(undefined, defaultOptions);
};

/**
 * Format a duration in milliseconds to a readable string
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration (e.g., "2h 30m")
 */
export const formatDuration = (ms) => {
  if (!ms && ms !== 0) return '--';
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return `${hours}h${remainingMinutes ? ` ${remainingMinutes}m` : ''}`;
  }
  
  if (minutes > 0) {
    const remainingSeconds = seconds % 60;
    return `${minutes}m${remainingSeconds ? ` ${remainingSeconds}s` : ''}`;
  }
  
  return `${seconds}s`;
};

/**
 * Truncate text to a specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @param {string} ellipsis - Ellipsis character(s) to append
 * @returns {string} Truncated text
 */
export const truncate = (text, maxLength = 100, ellipsis = '...') => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + (text.length > maxLength ? ellipsis : '');
};

/**
 * Generate a unique ID
 * @returns {string} A unique ID
 */
export const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

/**
 * Debounce a function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Format a number with commas
 * @param {number|string} num - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '--';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Calculate the average of an array of numbers
 * @param {number[]} arr - Array of numbers
 * @param {number} decimals - Number of decimal places
 * @returns {number} Average value
 */
export const calculateAverage = (arr, decimals = 2) => {
  if (!arr || !arr.length) return 0;
  const sum = arr.reduce((a, b) => a + b, 0);
  const avg = sum / arr.length;
  return parseFloat(avg.toFixed(decimals));
};

/**
 * Convert a string to title case
 * @param {string} str - String to convert
 * @returns {string} Title-cased string
 */
export const toTitleCase = (str) => {
  if (!str) return '';
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  );
};

/**
 * Get the initial letters of a name
 * @param {string} name - Full name
 * @returns {string} Initials (e.g., "JD" for "John Doe")
 */
export const getInitials = (name) => {
  if (!name) return '';
  
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

/**
 * Convert a string to a URL-friendly slug
 * @param {string} str - String to convert
 * @returns {string} URL-friendly slug
 */
export const slugify = (str) => {
  if (!str) return '';
  
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-')  // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '');   // Remove leading/trailing hyphens
};

/**
 * Parse a query string into an object
 * @param {string} queryString - Query string (e.g., "?key=value&name=John")
 * @returns {Object} Parsed query parameters
 */
export const parseQueryString = (queryString) => {
  const params = new URLSearchParams(queryString);
  const result = {};
  
  for (const [key, value] of params.entries()) {
    // Try to parse JSON values
    try {
      result[key] = JSON.parse(value);
    } catch (e) {
      result[key] = value;
    }
  }
  
  return result;
};

/**
 * Convert an object to a query string
 * @param {Object} obj - Object to convert
 * @returns {string} Query string (without leading "?")
 */
export const toQueryString = (obj) => {
  if (!obj) return '';
  
  return Object.entries(obj)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => {
      // Stringify objects and arrays
      const strValue = typeof value === 'object' 
        ? JSON.stringify(value) 
        : String(value);
      return `${encodeURIComponent(key)}=${encodeURIComponent(strValue)}`;
    })
    .join('&');
};

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} Deep cloned object
 */
export const deepClone = (obj) => {
  if (!obj) return obj;
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if two objects are deeply equal
 * @param {Object} obj1 - First object
 * @param {Object} obj2 - Second object
 * @returns {boolean} True if objects are deeply equal
 */
export const deepEqual = (obj1, obj2) => {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
};

export default {
  formatDate,
  formatTime,
  formatDuration,
  truncate,
  generateId,
  debounce,
  formatNumber,
  calculateAverage,
  toTitleCase,
  getInitials,
  slugify,
  parseQueryString,
  toQueryString,
  deepClone,
  deepEqual
};
