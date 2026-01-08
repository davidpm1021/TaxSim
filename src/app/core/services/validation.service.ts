import { Injectable } from '@angular/core';

export interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

@Injectable({ providedIn: 'root' })
export class ValidationService {
  /**
   * Validates SSN format: XXX-XX-XXXX
   * Allows empty (optional) or properly formatted
   */
  validateSSN(value: string): ValidationResult {
    if (!value || value.trim() === '') {
      return { isValid: true, error: null }; // Optional field
    }

    const ssnPattern = /^\d{3}-\d{2}-\d{4}$/;
    if (ssnPattern.test(value)) {
      return { isValid: true, error: null };
    }

    return {
      isValid: false,
      error: 'SSN must be in format XXX-XX-XXXX',
    };
  }

  /**
   * Validates EIN format: XX-XXXXXXX
   * Allows empty (optional) or properly formatted
   */
  validateEIN(value: string): ValidationResult {
    if (!value || value.trim() === '') {
      return { isValid: true, error: null }; // Optional field
    }

    const einPattern = /^\d{2}-\d{7}$/;
    if (einPattern.test(value)) {
      return { isValid: true, error: null };
    }

    return {
      isValid: false,
      error: 'EIN must be in format XX-XXXXXXX',
    };
  }

  /**
   * Validates required non-empty string
   */
  validateRequired(value: string | undefined | null, fieldName: string): ValidationResult {
    if (value && value.trim().length > 0) {
      return { isValid: true, error: null };
    }

    return {
      isValid: false,
      error: `${fieldName} is required`,
    };
  }

  /**
   * Validates that a number is positive (>= 0)
   */
  validatePositiveNumber(value: number | undefined | null, fieldName: string): ValidationResult {
    if (value === undefined || value === null || isNaN(value)) {
      return {
        isValid: false,
        error: `${fieldName} must be a number`,
      };
    }

    if (value < 0) {
      return {
        isValid: false,
        error: `${fieldName} must be a positive amount`,
      };
    }

    return { isValid: true, error: null };
  }

  /**
   * Validates that a number is within a range
   */
  validateNumberRange(
    value: number | undefined | null,
    min: number,
    max: number,
    fieldName: string
  ): ValidationResult {
    if (value === undefined || value === null || isNaN(value)) {
      return {
        isValid: false,
        error: `${fieldName} must be a number`,
      };
    }

    if (value < min || value > max) {
      return {
        isValid: false,
        error: `${fieldName} must be between ${min} and ${max}`,
      };
    }

    return { isValid: true, error: null };
  }

  /**
   * Validates that a date is not in the future
   */
  validateDateNotFuture(value: string | undefined | null, fieldName: string): ValidationResult {
    if (!value || value.trim() === '') {
      return {
        isValid: false,
        error: `${fieldName} is required`,
      };
    }

    const inputDate = new Date(value);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    if (isNaN(inputDate.getTime())) {
      return {
        isValid: false,
        error: `${fieldName} must be a valid date`,
      };
    }

    if (inputDate > today) {
      return {
        isValid: false,
        error: `${fieldName} cannot be in the future`,
      };
    }

    return { isValid: true, error: null };
  }

  /**
   * Validates state code (2 uppercase letters)
   * Allows empty (optional) or valid state code
   */
  validateStateCode(value: string): ValidationResult {
    if (!value || value.trim() === '') {
      return { isValid: true, error: null }; // Optional field
    }

    const statePattern = /^[A-Z]{2}$/i;
    if (statePattern.test(value.trim())) {
      return { isValid: true, error: null };
    }

    return {
      isValid: false,
      error: 'Enter a valid 2-letter state code',
    };
  }

  /**
   * Validates that withholding does not exceed wages
   */
  validateWithholdingVsWages(withheld: number, wages: number): ValidationResult {
    if (withheld > wages) {
      return {
        isValid: false,
        error: 'Withholding cannot exceed wages',
      };
    }

    return { isValid: true, error: null };
  }

  /**
   * Validates required number field (must be > 0)
   */
  validateRequiredNumber(value: number | undefined | null, fieldName: string): ValidationResult {
    if (value === undefined || value === null || isNaN(value)) {
      return {
        isValid: false,
        error: `${fieldName} is required`,
      };
    }

    if (value <= 0) {
      return {
        isValid: false,
        error: `${fieldName} must be greater than zero`,
      };
    }

    return { isValid: true, error: null };
  }

  /**
   * Validates age (0-120)
   */
  validateAge(value: number | undefined | null): ValidationResult {
    if (value === undefined || value === null || isNaN(value)) {
      return {
        isValid: false,
        error: 'Age is required',
      };
    }

    if (value < 0 || value > 120) {
      return {
        isValid: false,
        error: 'Age must be between 0 and 120',
      };
    }

    return { isValid: true, error: null };
  }
}
