import { TestBed } from '@angular/core/testing';
import { ValidationService } from './validation.service';

describe('ValidationService', () => {
  let service: ValidationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ValidationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('validateSSN', () => {
    it('should accept valid SSN format', () => {
      const result = service.validateSSN('123-45-6789');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should accept empty SSN (optional field)', () => {
      const result = service.validateSSN('');
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid SSN format', () => {
      const result = service.validateSSN('123456789');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('XXX-XX-XXXX');
    });

    it('should reject SSN with letters', () => {
      const result = service.validateSSN('123-AB-6789');
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateEIN', () => {
    it('should accept valid EIN format', () => {
      const result = service.validateEIN('12-3456789');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should accept empty EIN (optional field)', () => {
      const result = service.validateEIN('');
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid EIN format', () => {
      const result = service.validateEIN('123456789');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('XX-XXXXXXX');
    });
  });

  describe('validateRequired', () => {
    it('should accept non-empty string', () => {
      const result = service.validateRequired('John', 'First name');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should reject empty string', () => {
      const result = service.validateRequired('', 'First name');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('First name is required');
    });

    it('should reject whitespace-only string', () => {
      const result = service.validateRequired('   ', 'First name');
      expect(result.isValid).toBe(false);
    });

    it('should reject null/undefined', () => {
      expect(service.validateRequired(null as any, 'Field').isValid).toBe(false);
      expect(service.validateRequired(undefined as any, 'Field').isValid).toBe(false);
    });
  });

  describe('validatePositiveNumber', () => {
    it('should accept positive number', () => {
      const result = service.validatePositiveNumber(100, 'Amount');
      expect(result.isValid).toBe(true);
    });

    it('should accept zero', () => {
      const result = service.validatePositiveNumber(0, 'Amount');
      expect(result.isValid).toBe(true);
    });

    it('should reject negative number', () => {
      const result = service.validatePositiveNumber(-100, 'Amount');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('positive');
    });

    it('should reject null/undefined', () => {
      expect(service.validatePositiveNumber(null as any, 'Amount').isValid).toBe(false);
      expect(service.validatePositiveNumber(undefined as any, 'Amount').isValid).toBe(false);
    });
  });

  describe('validateNumberRange', () => {
    it('should accept number within range', () => {
      const result = service.validateNumberRange(50, 0, 100, 'Value');
      expect(result.isValid).toBe(true);
    });

    it('should accept boundary values', () => {
      expect(service.validateNumberRange(0, 0, 100, 'Value').isValid).toBe(true);
      expect(service.validateNumberRange(100, 0, 100, 'Value').isValid).toBe(true);
    });

    it('should reject number below range', () => {
      const result = service.validateNumberRange(-1, 0, 100, 'Value');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('between');
    });

    it('should reject number above range', () => {
      const result = service.validateNumberRange(101, 0, 100, 'Value');
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateDateNotFuture', () => {
    it('should accept past date', () => {
      const result = service.validateDateNotFuture('1990-01-01', 'Date of birth');
      expect(result.isValid).toBe(true);
    });

    it('should accept today', () => {
      const today = new Date().toISOString().split('T')[0];
      const result = service.validateDateNotFuture(today, 'Date');
      expect(result.isValid).toBe(true);
    });

    it('should reject future date', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const result = service.validateDateNotFuture(futureDate.toISOString().split('T')[0], 'Date');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('future');
    });

    it('should reject empty date', () => {
      const result = service.validateDateNotFuture('', 'Date');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('required');
    });
  });

  describe('validateStateCode', () => {
    it('should accept valid 2-letter state code', () => {
      expect(service.validateStateCode('CA').isValid).toBe(true);
      expect(service.validateStateCode('ny').isValid).toBe(true); // case insensitive
    });

    it('should accept empty (optional field)', () => {
      const result = service.validateStateCode('');
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid state codes', () => {
      expect(service.validateStateCode('CAL').isValid).toBe(false);
      expect(service.validateStateCode('C').isValid).toBe(false);
      expect(service.validateStateCode('12').isValid).toBe(false);
    });
  });

  describe('validateWithholdingVsWages', () => {
    it('should accept withholding less than wages', () => {
      const result = service.validateWithholdingVsWages(5000, 50000);
      expect(result.isValid).toBe(true);
    });

    it('should accept withholding equal to wages', () => {
      const result = service.validateWithholdingVsWages(50000, 50000);
      expect(result.isValid).toBe(true);
    });

    it('should reject withholding greater than wages', () => {
      const result = service.validateWithholdingVsWages(60000, 50000);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('cannot exceed');
    });
  });

  describe('validateRequiredNumber', () => {
    it('should accept positive number', () => {
      const result = service.validateRequiredNumber(100, 'Amount');
      expect(result.isValid).toBe(true);
    });

    it('should reject zero', () => {
      const result = service.validateRequiredNumber(0, 'Amount');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('greater than zero');
    });

    it('should reject negative number', () => {
      const result = service.validateRequiredNumber(-100, 'Amount');
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateAge', () => {
    it('should accept valid age', () => {
      expect(service.validateAge(25).isValid).toBe(true);
      expect(service.validateAge(0).isValid).toBe(true);
      expect(service.validateAge(120).isValid).toBe(true);
    });

    it('should reject age below 0', () => {
      const result = service.validateAge(-1);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('between 0 and 120');
    });

    it('should reject age above 120', () => {
      const result = service.validateAge(121);
      expect(result.isValid).toBe(false);
    });

    it('should reject null/undefined', () => {
      const result = service.validateAge(null as any);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('required');
    });
  });
});
