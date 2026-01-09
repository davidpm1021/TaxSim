import { TestBed } from '@angular/core/testing';
import { TaxCalculationService } from './tax-calculation.service';
import { FilingStatus, TaxReturn, createEmptyTaxReturn } from '@core/models';

describe('TaxCalculationService', () => {
  let service: TaxCalculationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaxCalculationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('calculateTaxFromBrackets', () => {
    describe('single filer', () => {
      const status: FilingStatus = 'single';

      it('should return 0 for 0 income', () => {
        expect(service.calculateTaxFromBrackets(0, status)).toBe(0);
      });

      it('should calculate 10% for income in first bracket', () => {
        // $10,000 at 10% = $1,000
        expect(service.calculateTaxFromBrackets(10000, status)).toBe(1000);
      });

      it('should calculate tax at bracket boundary ($11,925)', () => {
        // $11,925 at 10% = $1,192.50
        expect(service.calculateTaxFromBrackets(11925, status)).toBe(1192.5);
      });

      it('should calculate tax spanning first two brackets', () => {
        // $30,000: $11,925 at 10% + $18,075 at 12%
        // = $1,192.50 + $2,169 = $3,361.50
        expect(service.calculateTaxFromBrackets(30000, status)).toBe(3361.5);
      });

      it('should calculate tax at second bracket boundary ($48,475)', () => {
        // $11,925 at 10% + $36,550 at 12%
        // = $1,192.50 + $4,386 = $5,578.50
        expect(service.calculateTaxFromBrackets(48475, status)).toBe(5578.5);
      });

      it('should calculate tax spanning three brackets', () => {
        // $60,000: $11,925 at 10% + $36,550 at 12% + $11,525 at 22%
        // = $1,192.50 + $4,386 + $2,535.50 = $8,114
        expect(service.calculateTaxFromBrackets(60000, status)).toBe(8114);
      });

      it('should calculate tax for high income ($200,000)', () => {
        // $11,925 at 10% = $1,192.50
        // $36,550 at 12% = $4,386
        // $54,875 at 22% = $12,072.50
        // $93,950 at 24% = $22,548
        // $2,700 at 32% = $864
        // Total = $41,063
        expect(service.calculateTaxFromBrackets(200000, status)).toBe(41063);
      });
    });

    describe('married filing jointly', () => {
      const status: FilingStatus = 'married-jointly';

      it('should calculate 10% for income in first bracket', () => {
        // $20,000 at 10% = $2,000
        expect(service.calculateTaxFromBrackets(20000, status)).toBe(2000);
      });

      it('should calculate tax at first bracket boundary ($23,850)', () => {
        // $23,850 at 10% = $2,385
        expect(service.calculateTaxFromBrackets(23850, status)).toBe(2385);
      });

      it('should calculate tax spanning first two brackets', () => {
        // $60,000: $23,850 at 10% + $36,150 at 12%
        // = $2,385 + $4,338 = $6,723
        expect(service.calculateTaxFromBrackets(60000, status)).toBe(6723);
      });
    });

    describe('head of household', () => {
      const status: FilingStatus = 'head-of-household';

      it('should calculate 10% for income in first bracket', () => {
        // $15,000 at 10% = $1,500
        expect(service.calculateTaxFromBrackets(15000, status)).toBe(1500);
      });

      it('should calculate tax at first bracket boundary ($17,000)', () => {
        // $17,000 at 10% = $1,700
        expect(service.calculateTaxFromBrackets(17000, status)).toBe(1700);
      });

      it('should calculate tax spanning first two brackets', () => {
        // $40,000: $17,000 at 10% + $23,000 at 12%
        // = $1,700 + $2,760 = $4,460
        expect(service.calculateTaxFromBrackets(40000, status)).toBe(4460);
      });
    });
  });

  describe('calculateSelfEmploymentTax', () => {
    it('should return 0 for 0 income', () => {
      expect(service.calculateSelfEmploymentTax(0)).toEqual({
        selfEmploymentTax: 0,
        deductiblePortion: 0,
      });
    });

    it('should calculate SE tax correctly', () => {
      // $10,000 * 92.35% = $9,235 net earnings
      // $9,235 * 15.3% = $1,412.955, rounded = $1,412.96
      const result = service.calculateSelfEmploymentTax(10000);
      expect(result.selfEmploymentTax).toBeCloseTo(1412.96, 2);
      // Deductible = 50% of SE tax = $706.48
      expect(result.deductiblePortion).toBeCloseTo(706.48, 2);
    });

    it('should calculate SE tax for larger income', () => {
      // $50,000 * 92.35% = $46,175 net earnings
      // $46,175 * 15.3% = $7,064.775
      const result = service.calculateSelfEmploymentTax(50000);
      expect(result.selfEmploymentTax).toBeCloseTo(7064.78, 2);
      expect(result.deductiblePortion).toBeCloseTo(3532.39, 2);
    });
  });

  describe('calculateStandardDeduction', () => {
    it('should return $15,000 for single filer', () => {
      expect(service.calculateStandardDeduction('single', false, 0)).toBe(15000);
    });

    it('should return $30,000 for married filing jointly', () => {
      expect(service.calculateStandardDeduction('married-jointly', false, 0)).toBe(30000);
    });

    it('should return $22,500 for head of household', () => {
      expect(service.calculateStandardDeduction('head-of-household', false, 0)).toBe(22500);
    });

    describe('when claimed as dependent', () => {
      it('should return minimum $1,350 for dependent with no earned income', () => {
        expect(service.calculateStandardDeduction('single', true, 0)).toBe(1350);
      });

      it('should return earned income + $450 when greater than minimum', () => {
        // $2,000 + $450 = $2,450
        expect(service.calculateStandardDeduction('single', true, 2000)).toBe(2450);
      });

      it('should cap at full standard deduction', () => {
        // Even with high earned income, cap at $15,000 for single
        expect(service.calculateStandardDeduction('single', true, 50000)).toBe(15000);
      });

      it('should return minimum when earned income + $450 is less', () => {
        // $500 + $450 = $950, but minimum is $1,350
        expect(service.calculateStandardDeduction('single', true, 500)).toBe(1350);
      });
    });
  });

  describe('calculateItemizedDeductions', () => {
    // Note: Student loan interest is now an above-the-line adjustment (reduces AGI),
    // not an itemized deduction. It's handled in calculateFullReturn, not here.

    it('should sum all deductions', () => {
      const result = service.calculateItemizedDeductions({
        mortgageInterest: 5000,
        saltTaxes: 8000,
        charitableContributions: 2000,
        medicalExpenses: 0,
      }, 50000);
      expect(result).toBe(15000);
    });

    it('should cap SALT at $10,000', () => {
      const result = service.calculateItemizedDeductions({
        mortgageInterest: 0,
        saltTaxes: 15000, // Should cap at $10,000
        charitableContributions: 0,
        medicalExpenses: 0,
      }, 50000);
      expect(result).toBe(10000);
    });

    it('should only count medical expenses exceeding 7.5% of AGI', () => {
      // AGI = $50,000, 7.5% = $3,750
      // Medical = $5,000, deductible = $5,000 - $3,750 = $1,250
      const result = service.calculateItemizedDeductions({
        mortgageInterest: 0,
        saltTaxes: 0,
        charitableContributions: 0,
        medicalExpenses: 5000,
      }, 50000);
      expect(result).toBe(1250);
    });

    it('should return 0 for medical if below 7.5% threshold', () => {
      // AGI = $50,000, 7.5% = $3,750
      // Medical = $2,000, below threshold, deductible = $0
      const result = service.calculateItemizedDeductions({
        mortgageInterest: 0,
        saltTaxes: 0,
        charitableContributions: 0,
        medicalExpenses: 2000,
      }, 50000);
      expect(result).toBe(0);
    });

    it('should apply all caps together', () => {
      // Mortgage: $10,000 (no cap)
      // SALT: $12,000 -> $10,000 (capped)
      // Charity: $1,000 (no cap)
      // Medical: $8,000 on $50,000 AGI -> $8,000 - $3,750 = $4,250
      // Total: $10,000 + $10,000 + $1,000 + $4,250 = $25,250
      const result = service.calculateItemizedDeductions({
        mortgageInterest: 10000,
        saltTaxes: 12000,
        charitableContributions: 1000,
        medicalExpenses: 8000,
      }, 50000);
      expect(result).toBe(25250);
    });
  });

  describe('calculateChildTaxCredit', () => {
    it('should return 0 for no qualifying children', () => {
      const result = service.calculateChildTaxCredit([], 50000, 'single');
      expect(result).toEqual({ total: 0, refundable: 0 });
    });

    it('should return $2,200 for one qualifying child under 17', () => {
      const dependents = [
        { id: '1', firstName: 'Child', relationship: 'child' as const, age: 10, livedWithFiler: true },
      ];
      const result = service.calculateChildTaxCredit(dependents, 50000, 'single');
      expect(result.total).toBe(2200);
    });

    it('should return $4,400 for two qualifying children', () => {
      const dependents = [
        { id: '1', firstName: 'Child1', relationship: 'child' as const, age: 10, livedWithFiler: true },
        { id: '2', firstName: 'Child2', relationship: 'child' as const, age: 8, livedWithFiler: true },
      ];
      const result = service.calculateChildTaxCredit(dependents, 50000, 'single');
      expect(result.total).toBe(4400);
    });

    it('should not count children 17 or older', () => {
      const dependents = [
        { id: '1', firstName: 'Child', relationship: 'child' as const, age: 17, livedWithFiler: true },
      ];
      const result = service.calculateChildTaxCredit(dependents, 50000, 'single');
      expect(result.total).toBe(0);
    });

    it('should not count children who did not live with filer', () => {
      const dependents = [
        { id: '1', firstName: 'Child', relationship: 'child' as const, age: 10, livedWithFiler: false },
      ];
      const result = service.calculateChildTaxCredit(dependents, 50000, 'single');
      expect(result.total).toBe(0);
    });

    it('should phase out for single filer over $200,000', () => {
      const dependents = [
        { id: '1', firstName: 'Child', relationship: 'child' as const, age: 10, livedWithFiler: true },
      ];
      // $210,000 income, $10,000 over threshold
      // Phase out: $50 per $1,000 = $500 reduction
      // CTC: $2,200 - $500 = $1,700
      const result = service.calculateChildTaxCredit(dependents, 210000, 'single');
      expect(result.total).toBe(1700);
    });

    it('should phase out for MFJ over $400,000', () => {
      const dependents = [
        { id: '1', firstName: 'Child', relationship: 'child' as const, age: 10, livedWithFiler: true },
      ];
      // $420,000 income, $20,000 over threshold
      // Phase out: $50 per $1,000 = $1,000 reduction
      // CTC: $2,200 - $1,000 = $1,200
      const result = service.calculateChildTaxCredit(dependents, 420000, 'married-jointly');
      expect(result.total).toBe(1200);
    });

    it('should not go below 0', () => {
      const dependents = [
        { id: '1', firstName: 'Child', relationship: 'child' as const, age: 10, livedWithFiler: true },
      ];
      // $300,000 income for single, $100,000 over threshold
      // Phase out: $50 per $1,000 = $5,000 reduction
      // CTC: $2,200 - $5,000 = -$2,800 -> $0
      const result = service.calculateChildTaxCredit(dependents, 300000, 'single');
      expect(result.total).toBe(0);
    });

    it('should cap refundable portion at $1,900 per child', () => {
      const dependents = [
        { id: '1', firstName: 'Child', relationship: 'child' as const, age: 10, livedWithFiler: true },
      ];
      const result = service.calculateChildTaxCredit(dependents, 50000, 'single');
      expect(result.refundable).toBe(1900);
    });

    it('should cap total refundable at actual credit amount', () => {
      const dependents = [
        { id: '1', firstName: 'Child', relationship: 'child' as const, age: 10, livedWithFiler: true },
      ];
      // With phaseout reducing credit to $1,700
      const result = service.calculateChildTaxCredit(dependents, 210000, 'single');
      expect(result.refundable).toBe(1700); // Capped at total credit, not $1,900
    });
  });

  describe('calculateEITC', () => {
    it('should return 0 if claimed as dependent', () => {
      const result = service.calculateEITC(30000, 'single', 0, true);
      expect(result).toBe(0);
    });

    it('should return 0 if income exceeds limit (no children)', () => {
      // Single, no children, limit is ~$18,591
      const result = service.calculateEITC(25000, 'single', 0, false);
      expect(result).toBe(0);
    });

    it('should calculate EITC for single with no children', () => {
      // $10,000 income, single, no children
      // Phase-in: $8,260 * 7.65% = $631.89 (max credit)
      // Then phase-out starts at $10,330
      // Since $10,000 < $10,330, still in plateau, credit = $631.89
      const result = service.calculateEITC(10000, 'single', 0, false);
      expect(result).toBeCloseTo(632, 0);
    });

    it('should calculate EITC for single with 1 child', () => {
      // $20,000 income, single, 1 child
      // Max credit: $4,213
      // Phase-in complete at $12,390
      // Phase-out starts at $22,720
      // Since $20,000 < $22,720, credit = max = $4,213
      const result = service.calculateEITC(20000, 'single', 1, false);
      expect(result).toBeCloseTo(4213, 0);
    });

    it('should phase out EITC for higher income', () => {
      // $40,000 income, single, 1 child
      // Max credit: $4,213
      // Phase-out starts at $22,720, rate 15.98%
      // Reduction: ($40,000 - $22,720) * 15.98% = $2,761.94
      // Credit: $4,213 - $2,761.94 = $1,451.06
      const result = service.calculateEITC(40000, 'single', 1, false);
      expect(result).toBeCloseTo(1452, 0); // Allow for rounding
    });

    it('should return 0 when phased out completely', () => {
      // $50,000 income, single, 1 child
      // Limit is ~$49,084, so $50,000 is over
      const result = service.calculateEITC(50000, 'single', 1, false);
      expect(result).toBe(0);
    });

    it('should calculate higher EITC for MFJ', () => {
      // $30,000 income, MFJ, 1 child
      // Phase-out starts at $29,640 for MFJ
      // Reduction: ($30,000 - $29,640) * 15.98% = $57.53
      // Credit: $4,213 - $57.53 = $4,155.47
      const result = service.calculateEITC(30000, 'married-jointly', 1, false);
      expect(result).toBeCloseTo(4155, 0);
    });

    it('should cap children at 3 for EITC purposes', () => {
      // 5 children should use same params as 3 children
      const result3 = service.calculateEITC(20000, 'single', 3, false);
      const result5 = service.calculateEITC(20000, 'single', 5, false);
      expect(result5).toBe(result3);
    });
  });

  describe('calculateFullReturn', () => {
    it('should calculate a simple W-2 only return', () => {
      const taxReturn = createEmptyTaxReturn();
      taxReturn.personalInfo.filingStatus = 'single';
      taxReturn.personalInfo.claimedAsDependent = false;
      taxReturn.income.hasW2Income = true;
      taxReturn.income.w2s = [{
        id: '1',
        employerName: 'Acme Corp',
        wagesTips: 50000,
        federalWithheld: 5000,
        socialSecurityWages: 50000,
        socialSecurityWithheld: 3100,
        medicareWages: 50000,
        medicareWithheld: 725,
      }];
      taxReturn.deductions.useStandardDeduction = true;

      const result = service.calculateFullReturn(taxReturn);

      expect(result.grossIncome).toBe(50000);
      expect(result.adjustedGrossIncome).toBe(50000);
      expect(result.standardDeductionAmount).toBe(15000);
      expect(result.taxableIncome).toBe(35000);
      // Tax on $35,000: $11,925 at 10% + $23,075 at 12% = $1,192.50 + $2,769 = $3,961.50
      expect(result.taxBeforeCredits).toBeCloseTo(3961.5, 2);
      expect(result.selfEmploymentTax).toBe(0);
      expect(result.totalWithholding).toBe(5000);
      expect(result.isRefund).toBe(true);
      expect(result.refundOrOwed).toBeCloseTo(1038.5, 2); // $5,000 - $3,961.50
    });

    it('should calculate return with 1099 income and SE tax', () => {
      const taxReturn = createEmptyTaxReturn();
      taxReturn.personalInfo.filingStatus = 'single';
      taxReturn.income.has1099Income = true;
      taxReturn.income.form1099s = [{
        id: '1',
        payerName: 'Client',
        nonemployeeCompensation: 30000,
      }];
      taxReturn.deductions.useStandardDeduction = true;

      const result = service.calculateFullReturn(taxReturn);

      // SE tax: $30,000 * 92.35% * 15.3% = $4,238.87 (with rounding)
      // SE tax deduction: 50% = $2,119.44
      expect(result.grossIncome).toBe(30000);
      expect(result.selfEmploymentTax).toBeCloseTo(4238.87, 2);
      expect(result.selfEmploymentTaxDeduction).toBeCloseTo(2119.44, 2);
      expect(result.adjustedGrossIncome).toBeCloseTo(27880.56, 2);
      // Taxable: $27,880.56 - $15,000 = $12,880.56
      expect(result.taxableIncome).toBeCloseTo(12880.56, 2);
    });

    it('should calculate return with child tax credit', () => {
      const taxReturn = createEmptyTaxReturn();
      taxReturn.personalInfo.filingStatus = 'single';
      taxReturn.personalInfo.hasDependents = true;
      taxReturn.personalInfo.dependents = [{
        id: '1',
        firstName: 'Child',
        relationship: 'child',
        age: 10,
        livedWithFiler: true,
      }];
      taxReturn.income.hasW2Income = true;
      taxReturn.income.w2s = [{
        id: '1',
        employerName: 'Acme Corp',
        wagesTips: 50000,
        federalWithheld: 6000,
        socialSecurityWages: 50000,
        socialSecurityWithheld: 3100,
        medicareWages: 50000,
        medicareWithheld: 725,
      }];
      taxReturn.deductions.useStandardDeduction = true;

      const result = service.calculateFullReturn(taxReturn);

      expect(result.totalCredits).toBe(2200);
      // Tax: ~$3,961.50 - $2,200 CTC = ~$1,761.50
      expect(result.totalTax).toBeCloseTo(1761.5, 2);
      // Refund: $6,000 - $1,761.50 = $4,238.50
      expect(result.refundOrOwed).toBeCloseTo(4238.5, 2);
    });

    it('should use itemized deductions when larger', () => {
      const taxReturn = createEmptyTaxReturn();
      taxReturn.personalInfo.filingStatus = 'single';
      taxReturn.income.hasW2Income = true;
      taxReturn.income.w2s = [{
        id: '1',
        employerName: 'Acme Corp',
        wagesTips: 100000,
        federalWithheld: 15000,
        socialSecurityWages: 100000,
        socialSecurityWithheld: 6200,
        medicareWages: 100000,
        medicareWithheld: 1450,
      }];
      taxReturn.deductions = {
        mortgageInterest: 12000,
        saltTaxes: 10000,
        charitableContributions: 3000,
        medicalExpenses: 0,
        useStandardDeduction: false, // Force itemized
      };
      // Student loan interest is now an above-the-line adjustment
      taxReturn.adjustments.studentLoanInterest = 2500;

      const result = service.calculateFullReturn(taxReturn);

      // Itemized: $12,000 + $10,000 + $3,000 = $25,000 (student loan not included)
      // AGI: $100,000 - $2,500 = $97,500
      expect(result.itemizedDeductionAmount).toBe(25000);
      expect(result.deductionUsed).toBe('itemized');
      expect(result.finalDeductionAmount).toBe(25000);
      // Taxable: $97,500 - $25,000 = $72,500
      expect(result.taxableIncome).toBe(72500);
      expect(result.adjustedGrossIncome).toBe(97500);
    });

    it('should handle return with both W-2 and 1099 income', () => {
      const taxReturn = createEmptyTaxReturn();
      taxReturn.personalInfo.filingStatus = 'single';
      taxReturn.income.hasW2Income = true;
      taxReturn.income.has1099Income = true;
      taxReturn.income.w2s = [{
        id: '1',
        employerName: 'Employer',
        wagesTips: 40000,
        federalWithheld: 4000,
        socialSecurityWages: 40000,
        socialSecurityWithheld: 2480,
        medicareWages: 40000,
        medicareWithheld: 580,
      }];
      taxReturn.income.form1099s = [{
        id: '1',
        payerName: 'Client',
        nonemployeeCompensation: 10000,
      }];
      taxReturn.deductions.useStandardDeduction = true;

      const result = service.calculateFullReturn(taxReturn);

      expect(result.totalW2Wages).toBe(40000);
      expect(result.total1099Income).toBe(10000);
      expect(result.grossIncome).toBe(50000);
      // SE tax on $10,000 = $1,412.96, deduction = $706.48
      expect(result.selfEmploymentTax).toBeCloseTo(1412.96, 2);
      expect(result.adjustedGrossIncome).toBeCloseTo(49293.52, 2);
    });

    it('should calculate EITC for eligible filer', () => {
      const taxReturn = createEmptyTaxReturn();
      taxReturn.personalInfo.filingStatus = 'single';
      taxReturn.personalInfo.claimedAsDependent = false;
      taxReturn.income.hasW2Income = true;
      taxReturn.income.w2s = [{
        id: '1',
        employerName: 'Employer',
        wagesTips: 15000,
        federalWithheld: 500,
        socialSecurityWages: 15000,
        socialSecurityWithheld: 930,
        medicareWages: 15000,
        medicareWithheld: 217.5,
      }];
      taxReturn.deductions.useStandardDeduction = true;

      const result = service.calculateFullReturn(taxReturn);

      // Single, no children, $15,000 income should get some EITC
      // Phase-out: ($15,000 - $10,330) * 7.65% = $357.31
      // Credit: $632 - $357.31 = $274.69
      expect(result.totalCredits).toBeCloseTo(275, 0);
    });

    it('should not allow negative taxable income', () => {
      const taxReturn = createEmptyTaxReturn();
      taxReturn.personalInfo.filingStatus = 'single';
      taxReturn.income.hasW2Income = true;
      taxReturn.income.w2s = [{
        id: '1',
        employerName: 'Employer',
        wagesTips: 10000,
        federalWithheld: 500,
        socialSecurityWages: 10000,
        socialSecurityWithheld: 620,
        medicareWages: 10000,
        medicareWithheld: 145,
      }];
      taxReturn.deductions.useStandardDeduction = true;

      const result = service.calculateFullReturn(taxReturn);

      // $10,000 - $15,000 standard = -$5,000, should be $0
      expect(result.taxableIncome).toBe(0);
      expect(result.taxBeforeCredits).toBe(0);
    });
  });
});
