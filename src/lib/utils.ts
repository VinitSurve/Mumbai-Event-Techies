import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Sleep for the specified amount of milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Check if a string is a valid URL
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid URL, false otherwise
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (err) {
    return false;
  }
};

/**
 * Sanitize a string, removing unwanted characters and limiting length
 * @param {string} str - String to sanitize
 * @param {number} maxLen - Maximum length (default: 1000)
 * @returns {string} - Sanitized string
 */
export const sanitizeString = (str: string, maxLen: number = 1000): string => {
  if (!str) return '';
  
  // Convert to string if it's not already
  const strValue = String(str);
  
  // Remove extra whitespace and trim
  const sanitized = strValue
    .replace(/\s+/g, ' ')
    .trim();
  
  // Limit length
  return sanitized.length > maxLen 
    ? sanitized.substring(0, maxLen) + '...' 
    : sanitized;
};
