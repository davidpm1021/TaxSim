import { TestBed } from '@angular/core/testing';
import { TaxDataService } from './tax-data.service';

describe('TaxDataService', () => {
  let service: TaxDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaxDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return tax year 2025', () => {
    expect(service.taxYear).toBe(2025);
  });

  describe('getFilingStatusOptions', () => {
    it('should return all filing status options', () => {
      const options = service.getFilingStatusOptions();
      expect(options).toHaveLength(3);
      expect(options.map((o) => o.value)).toContain('single');
      expect(options.map((o) => o.value)).toContain('married-jointly');
      expect(options.map((o) => o.value)).toContain('head-of-household');
    });

    it('should include standard deduction for each status', () => {
      const options = service.getFilingStatusOptions();
      const single = options.find((o) => o.value === 'single');
      expect(single?.standardDeduction).toBe(15750);
    });
  });

  describe('getStandardDeduction', () => {
    it('should return correct deduction for single', () => {
      expect(service.getStandardDeduction('single')).toBe(15750);
    });

    it('should return correct deduction for married-jointly', () => {
      expect(service.getStandardDeduction('married-jointly')).toBe(31500);
    });

    it('should return correct deduction for head-of-household', () => {
      expect(service.getStandardDeduction('head-of-household')).toBe(23625);
    });
  });

  describe('getTaxBrackets', () => {
    it('should return 7 brackets for single filers', () => {
      const brackets = service.getTaxBrackets('single');
      expect(brackets).toHaveLength(7);
    });

    it('should start with 10% bracket', () => {
      const brackets = service.getTaxBrackets('single');
      expect(brackets[0].rate).toBe(0.1);
    });

    it('should end with 37% bracket', () => {
      const brackets = service.getTaxBrackets('single');
      expect(brackets[6].rate).toBe(0.37);
    });
  });

  describe('getDeductionLimits', () => {
    it('should return correct limits', () => {
      const limits = service.getDeductionLimits();
      expect(limits.studentLoanInterest).toBe(2500);
      expect(limits.saltTaxes).toBe(10000);
      expect(limits.medicalExpenseFloorPercent).toBe(7.5);
    });
  });

  describe('getChildTaxCreditInfo', () => {
    it('should return correct CTC info', () => {
      const info = service.getChildTaxCreditInfo();
      expect(info.maxPerChild).toBe(2200);
      expect(info.refundableMax).toBe(1900);
      expect(info.maxChildAge).toBe(16);
    });
  });

  describe('getStateOptions', () => {
    it('should return 51 states (50 + DC)', () => {
      const states = service.getStateOptions();
      expect(states).toHaveLength(51);
    });

    it('should include California', () => {
      const states = service.getStateOptions();
      const ca = states.find((s) => s.code === 'CA');
      expect(ca?.name).toBe('California');
    });
  });

  describe('formatCurrency', () => {
    it('should format whole numbers without decimals', () => {
      expect(service.formatCurrency(5000)).toBe('$5,000');
    });

    it('should format with decimals when present', () => {
      expect(service.formatCurrency(1234.56)).toBe('$1,234.56');
    });

    it('should handle negative numbers', () => {
      expect(service.formatCurrency(-500)).toBe('-$500');
    });
  });

  describe('formatPercent', () => {
    it('should format decimal as percent', () => {
      expect(service.formatPercent(0.1)).toBe('10%');
    });

    it('should format with one decimal when needed', () => {
      expect(service.formatPercent(0.075)).toBe('7.5%');
    });
  });
});
