/**
 * Input validation utilities
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate a question input
 */
export function validateQuestion(question: string): ValidationResult {
  if (!question || !question.trim()) {
    return {
      isValid: false,
      error: 'Question cannot be empty',
    };
  }

  if (question.length > 1000) {
    return {
      isValid: false,
      error: 'Question is too long (max 1000 characters)',
    };
  }

  // Check for potentially harmful content
  const harmfulPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
  ];

  for (const pattern of harmfulPatterns) {
    if (pattern.test(question)) {
      return {
        isValid: false,
        error: 'Invalid characters detected',
      };
    }
  }

  return { isValid: true };
}

/**
 * Validate email address
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || !email.trim()) {
    return {
      isValid: false,
      error: 'Email cannot be empty',
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'Invalid email format',
    };
  }

  return { isValid: true };
}

/**
 * Validate text length
 */
export function validateTextLength(
  text: string,
  minLength: number,
  maxLength: number
): ValidationResult {
  if (text.length < minLength) {
    return {
      isValid: false,
      error: `Text must be at least ${minLength} characters`,
    };
  }

  if (text.length > maxLength) {
    return {
      isValid: false,
      error: `Text must be no more than ${maxLength} characters`,
    };
  }

  return { isValid: true };
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/<[^>]*>/g, ''); // Remove HTML tags
}
