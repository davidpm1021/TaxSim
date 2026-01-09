import { TestBed } from '@angular/core/testing';
import { SessionStorageService } from './session-storage.service';
import { createEmptyTaxReturn } from '@core/models';

describe('SessionStorageService', () => {
  let service: SessionStorageService;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionStorageService);
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return empty tax return on first load', () => {
    const result = service.taxReturn();
    expect(result).toEqual(createEmptyTaxReturn());
  });

  it('should save and load tax return data', () => {
    const taxReturn = createEmptyTaxReturn();
    taxReturn.personalInfo.firstName = 'John';
    taxReturn.personalInfo.lastName = 'Doe';

    service.save(taxReturn);

    const loaded = service.taxReturn();
    expect(loaded.personalInfo.firstName).toBe('John');
    expect(loaded.personalInfo.lastName).toBe('Doe');
  });

  it('should persist data to sessionStorage', () => {
    const taxReturn = createEmptyTaxReturn();
    taxReturn.personalInfo.firstName = 'Jane';

    service.save(taxReturn);

    const stored = sessionStorage.getItem('tax-simulation-data');
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed.personalInfo.firstName).toBe('Jane');
  });

  it('should clear data', () => {
    const taxReturn = createEmptyTaxReturn();
    taxReturn.personalInfo.firstName = 'Test';
    service.save(taxReturn);

    service.clear();

    const result = service.taxReturn();
    expect(result.personalInfo.firstName).toBe('');
    expect(sessionStorage.getItem('tax-simulation-data')).toBeNull();
  });

  it('should update personal info', () => {
    service.updatePersonalInfo((current) => ({
      ...current,
      firstName: 'Updated',
      filingStatus: 'married-jointly',
    }));

    const result = service.taxReturn();
    expect(result.personalInfo.firstName).toBe('Updated');
    expect(result.personalInfo.filingStatus).toBe('married-jointly');
  });

  it('should update income', () => {
    service.updateIncome((current) => ({
      ...current,
      hasW2Income: true,
    }));

    const result = service.taxReturn();
    expect(result.income.hasW2Income).toBe(true);
  });

  it('should update deductions', () => {
    service.updateDeductions((current) => ({
      ...current,
      mortgageInterest: 5000,
    }));

    const result = service.taxReturn();
    expect(result.deductions.mortgageInterest).toBe(5000);
  });

  it('should update credits', () => {
    service.updateCredits((current) => ({
      ...current,
      childTaxCredit: 2200,
    }));

    const result = service.taxReturn();
    expect(result.credits.childTaxCredit).toBe(2200);
  });

  it('should update calculation', () => {
    const calculation = {
      totalW2Wages: 50000,
      total1099Income: 0,
      grossIncome: 50000,
      selfEmploymentTaxDeduction: 0,
      adjustedGrossIncome: 50000,
      standardDeductionAmount: 15750,
      itemizedDeductionAmount: 0,
      deductionUsed: 'standard' as const,
      finalDeductionAmount: 15750,
      taxableIncome: 35000,
      taxBeforeCredits: 4000,
      selfEmploymentTax: 0,
      totalTaxBeforeCredits: 4000,
      totalCredits: 0,
      totalTax: 4000,
      totalWithholding: 5000,
      refundOrOwed: 1000,
      isRefund: true,
    };

    service.updateCalculation(calculation);

    const result = service.taxReturn();
    expect(result.calculation).toEqual(calculation);
  });
});
