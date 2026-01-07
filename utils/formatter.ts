
import { FormatType } from '../types';

/**
 * Formats a string into PascalCase or camelCase.
 * Input is expected to be a space-separated string of words.
 */
export const formatString = (text: string, type: FormatType): string => {
  // Split by non-alphanumeric characters or camelCase boundaries
  const words = text
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean);

  if (words.length === 0) return '';

  const processedWords = words.map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  );

  if (type === FormatType.PASCAL_CASE) {
    return processedWords.join('');
  } else {
    // camelCase
    return processedWords[0].toLowerCase() + processedWords.slice(1).join('');
  }
};
