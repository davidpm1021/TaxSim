import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReviewComponent } from './review.component';
import {
  SessionStorageService,
  NavigationService,
  TaxDataService,
  TaxCalculationService,
  SECTIONS,
} from '@core/services';
import { signal, WritableSignal } from '@angular/core';
import { TaxReturn, createEmptyTaxReturn, FilingStatus, TaxCalculation } from '@core/models';

describe('ReviewComponent', () => {
  let component: ReviewComponent;
  let fixture: ComponentFixture<ReviewComponent>;
  let mockSessionStorage: Partial<SessionStorageService>;
  let mockNavigation: Partial<NavigationService>;
  let mockTaxData: Partial<TaxDataService>;
  let mockTaxCalculation: Partial<TaxCalculationService>;
  let taxReturnSignal: WritableSignal<TaxReturn>;

  const setupTaxReturn = (overrides: Partial<{
    firstName: string;
    lastName: string;
    filingStatus: FilingStatus;
    claimedAsDependent: boolean;
    dependents: { id: string; firstName: string; relationship: string; age: number; livedWithFiler: boolean }[];
    hasW2Income: boolean;
    has1099Income: boolean;
    w2s: { id: string; employerName: string; wagesTips: number; federalWithheld: number; socialSecurityWages: number; socialSecurityWithheld: number; medicareWages: number; medicareWithheld: number }[];
    form1099s: { id: string; payerName: string; nonemployeeCompensation: number }[];
    useStandardDeduction: boolean;
    mortgageInterest: number;
    studentLoanInterest: number;
    saltTaxes: number;
    charitableContributions: number;
    medicalExpenses: number;
    childTaxCredit: number;
    earnedIncomeCredit: number;
  }> = {}): TaxReturn => {
    const taxReturn = createEmptyTaxReturn();
    taxReturn.personalInfo.firstName = overrides.firstName ?? 'John';
    taxReturn.personalInfo.lastName = overrides.lastName ?? 'Doe';
    taxReturn.personalInfo.filingStatus = overrides.filingStatus ?? 'single';
    taxReturn.personalInfo.claimedAsDependent = overrides.claimedAsDependent ?? false;
    taxReturn.personalInfo.dependents = overrides.dependents ?? [];
    taxReturn.income.hasW2Income = overrides.hasW2Income ?? true;
    taxReturn.income.has1099Income = overrides.has1099Income ?? false;
    taxReturn.income.w2s = overrides.w2s ?? [{
      id: '1',
      employerName: 'Acme Corp',
      wagesTips: 50000,
      federalWithheld: 5000,
      socialSecurityWages: 50000,
      socialSecurityWithheld: 3100,
      medicareWages: 50000,
      medicareWithheld: 725,
    }];
    taxReturn.income.form1099s = overrides.form1099s ?? [];
    taxReturn.deductions.useStandardDeduction = overrides.useStandardDeduction ?? true;
    taxReturn.deductions.mortgageInterest = overrides.mortgageInterest ?? 0;
    taxReturn.deductions.studentLoanInterest = overrides.studentLoanInterest ?? 0;
    taxReturn.deductions.saltTaxes = overrides.saltTaxes ?? 0;
    taxReturn.deductions.charitableContributions = overrides.charitableContributions ?? 0;
    taxReturn.deductions.medicalExpenses = overrides.medicalExpenses ?? 0;
    taxReturn.credits.childTaxCredit = overrides.childTaxCredit ?? 0;
    taxReturn.credits.earnedIncomeCredit = overrides.earnedIncomeCredit ?? 0;
    return taxReturn;
  };

  beforeEach(async () => {
    taxReturnSignal = signal(setupTaxReturn());

    mockSessionStorage = {
      taxReturn: taxReturnSignal,
      updateCalculation: jest.fn(),
    };

    const currentSection = signal(SECTIONS[5]); // Review section
    mockNavigation = {
      navigateTo: jest.fn(),
      completeSection: jest.fn(),
      currentSection: currentSection,
      currentSectionIndex: signal(5),
      getSectionStatus: jest.fn(() => 'current' as const),
      navigateToSection: jest.fn(),
    };

    mockTaxData = {
      formatCurrency: jest.fn((amount: number) =>
        `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      ),
      getFilingStatusOptions: jest.fn(() => [
        { value: 'single', label: 'Single' },
        { value: 'married_filing_jointly', label: 'Married Filing Jointly' },
        { value: 'married_filing_separately', label: 'Married Filing Separately' },
        { value: 'head_of_household', label: 'Head of Household' },
      ]),
      getStandardDeduction: jest.fn((status: FilingStatus) => {
        switch (status) {
          case 'single': return 15000;
          case 'married_filing_jointly': return 30000;
          case 'head_of_household': return 22500;
          default: return 15000;
        }
      }),
    };

    mockTaxCalculation = {
      calculateItemizedDeductions: jest.fn((deductions: any, agi: number) => {
        return deductions.mortgageInterest +
          Math.min(deductions.studentLoanInterest, 2500) +
          Math.min(deductions.saltTaxes, 10000) +
          deductions.charitableContributions +
          Math.max(0, deductions.medicalExpenses - agi * 0.075);
      }),
      calculateFullReturn: jest.fn((): TaxCalculation => ({
        grossIncome: 50000,
        adjustedGrossIncome: 50000,
        taxableIncome: 35000,
        taxBeforeCredits: 4500,
        selfEmploymentTax: 0,
        totalTax: 4500,
        totalCredits: 0,
        totalWithheld: 5000,
        refundOrOwed: 500,
        effectiveTaxRate: 9,
        marginalTaxRate: 22,
      })),
    };

    await TestBed.configureTestingModule({
      imports: [ReviewComponent],
      providers: [
        { provide: SessionStorageService, useValue: mockSessionStorage },
        { provide: NavigationService, useValue: mockNavigation },
        { provide: TaxDataService, useValue: mockTaxData },
        { provide: TaxCalculationService, useValue: mockTaxCalculation },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display page title', () => {
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('h1');
    expect(title.textContent).toContain('Review Your Return');
  });

  it('should display intro text', () => {
    fixture.detectChanges();
    const intro = fixture.nativeElement.querySelector('.intro-text');
    expect(intro.textContent).toContain('review all your information');
  });

  describe('Personal Information section', () => {
    it('should display full name', () => {
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('John Doe');
    });

    it('should display filing status label', () => {
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Single');
    });

    it('should display married filing jointly status', () => {
      taxReturnSignal.set(setupTaxReturn({ filingStatus: 'married_filing_jointly' }));
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Married Filing Jointly');
    });

    it('should display claimed as dependent status', () => {
      taxReturnSignal.set(setupTaxReturn({ claimedAsDependent: true }));
      fixture.detectChanges();
      const rows = fixture.nativeElement.querySelectorAll('.info-row');
      const dependentRow = Array.from(rows).find((r: any) => r.textContent.includes('Claimed as Dependent'));
      expect((dependentRow as HTMLElement)?.textContent).toContain('Yes');
    });

    it('should display None when no dependents', () => {
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('None');
    });

    it('should display dependent count and names', () => {
      taxReturnSignal.set(setupTaxReturn({
        dependents: [
          { id: '1', firstName: 'Emma', relationship: 'child', age: 10, livedWithFiler: true },
          { id: '2', firstName: 'Jack', relationship: 'child', age: 8, livedWithFiler: true },
        ],
      }));
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('2');
      expect(content).toContain('Emma, Jack');
    });

    it('should have edit button that navigates to personal info', () => {
      fixture.detectChanges();
      const personalSection = fixture.nativeElement.querySelector('.review-section');
      const editBtn = personalSection.querySelector('.edit-btn');
      editBtn.click();
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/personal-info/filing-status');
    });
  });

  describe('Income section', () => {
    it('should display W-2 wages', () => {
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('W-2 Wages');
      expect(content).toContain('50,000');
    });

    it('should display 1099 income when present', () => {
      taxReturnSignal.set(setupTaxReturn({
        has1099Income: true,
        form1099s: [{ id: '1', payerName: 'Client', nonemployeeCompensation: 10000 }],
      }));
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('1099-NEC Income');
      expect(content).toContain('10,000');
    });

    it('should not display 1099 section when no 1099 income', () => {
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).not.toContain('1099-NEC Income');
    });

    it('should display total income', () => {
      taxReturnSignal.set(setupTaxReturn({
        has1099Income: true,
        form1099s: [{ id: '1', payerName: 'Client', nonemployeeCompensation: 10000 }],
      }));
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Total Income');
      expect(content).toContain('60,000');
    });

    it('should display federal tax withheld', () => {
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Federal Tax Withheld');
      expect(content).toContain('5,000');
    });

    it('should have edit button that navigates to income', () => {
      fixture.detectChanges();
      const sections = fixture.nativeElement.querySelectorAll('.review-section');
      const incomeSection = sections[1];
      const editBtn = incomeSection.querySelector('.edit-btn');
      editBtn.click();
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/income/types');
    });
  });

  describe('Deductions section', () => {
    it('should display standard deduction when selected', () => {
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Standard Deduction');
      expect(content).toContain('15,000');
    });

    it('should display itemized deductions when selected', () => {
      taxReturnSignal.set(setupTaxReturn({
        useStandardDeduction: false,
        mortgageInterest: 8000,
        saltTaxes: 5000,
        charitableContributions: 2000,
      }));
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Itemized Deductions');
    });

    it('should show itemized breakdown', () => {
      taxReturnSignal.set(setupTaxReturn({
        useStandardDeduction: false,
        mortgageInterest: 8000,
        saltTaxes: 5000,
        charitableContributions: 2000,
      }));
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Mortgage Interest');
      expect(content).toContain('8,000');
      expect(content).toContain('State & Local Taxes');
      expect(content).toContain('5,000');
      expect(content).toContain('Charitable Contributions');
      expect(content).toContain('2,000');
    });

    it('should not show itemized breakdown when using standard', () => {
      fixture.detectChanges();
      const breakdown = fixture.nativeElement.querySelector('.itemized-breakdown');
      expect(breakdown).toBeFalsy();
    });

    it('should have edit button that navigates to deductions', () => {
      fixture.detectChanges();
      const sections = fixture.nativeElement.querySelectorAll('.review-section');
      const deductionsSection = sections[2];
      const editBtn = deductionsSection.querySelector('.edit-btn');
      editBtn.click();
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/deductions/itemized');
    });
  });

  describe('Credits section', () => {
    it('should display zero credits when none', () => {
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Total Credits');
      expect(content).toContain('$0.00');
    });

    it('should display Child Tax Credit', () => {
      taxReturnSignal.set(setupTaxReturn({ childTaxCredit: 2000 }));
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Child Tax Credit');
      expect(content).toContain('2,000');
    });

    it('should display Earned Income Credit', () => {
      taxReturnSignal.set(setupTaxReturn({ earnedIncomeCredit: 632 }));
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Earned Income Credit');
      expect(content).toContain('632');
    });

    it('should display total credits when both present', () => {
      taxReturnSignal.set(setupTaxReturn({
        childTaxCredit: 2000,
        earnedIncomeCredit: 500,
      }));
      fixture.detectChanges();
      const totalRows = fixture.nativeElement.querySelectorAll('.info-row.total');
      const creditsTotalRow = Array.from(totalRows).find((r: any) => r.textContent.includes('Total Credits'));
      expect((creditsTotalRow as HTMLElement)?.textContent).toContain('2,500');
    });

    it('should have edit button that navigates to credits', () => {
      fixture.detectChanges();
      const sections = fixture.nativeElement.querySelectorAll('.review-section');
      const creditsSection = sections[3];
      const editBtn = creditsSection.querySelector('.edit-btn');
      editBtn.click();
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/credits');
    });
  });

  describe('Summary preview', () => {
    it('should display summary section', () => {
      fixture.detectChanges();
      const summary = fixture.nativeElement.querySelector('.summary-preview');
      expect(summary).toBeTruthy();
      expect(summary.textContent).toContain('Quick Summary');
    });

    it('should display total income in summary', () => {
      fixture.detectChanges();
      const summary = fixture.nativeElement.querySelector('.summary-preview');
      expect(summary.textContent).toContain('Total Income');
      expect(summary.textContent).toContain('50,000');
    });

    it('should display deductions in summary', () => {
      fixture.detectChanges();
      const summary = fixture.nativeElement.querySelector('.summary-preview');
      expect(summary.textContent).toContain('Deductions');
      expect(summary.textContent).toContain('-');
    });

    it('should display taxable income in summary', () => {
      fixture.detectChanges();
      const summary = fixture.nativeElement.querySelector('.summary-preview');
      expect(summary.textContent).toContain('Taxable Income');
    });

    it('should display tax withheld in summary', () => {
      fixture.detectChanges();
      const summary = fixture.nativeElement.querySelector('.summary-preview');
      expect(summary.textContent).toContain('Tax Withheld');
      expect(summary.textContent).toContain('5,000');
    });

    it('should calculate taxable income correctly', () => {
      fixture.detectChanges();
      // Total income: 50000, Standard deduction: 15000
      // Taxable income: 35000
      expect(component.taxableIncome()).toBe(35000);
    });

    it('should not allow negative taxable income', () => {
      taxReturnSignal.set(setupTaxReturn({
        w2s: [{
          id: '1',
          employerName: 'Small Job',
          wagesTips: 5000,
          federalWithheld: 0,
          socialSecurityWages: 5000,
          socialSecurityWithheld: 310,
          medicareWages: 5000,
          medicareWithheld: 73,
        }],
      }));
      fixture.detectChanges();
      // Total income: 5000, Standard deduction: 15000
      // Taxable income should be 0, not -10000
      expect(component.taxableIncome()).toBe(0);
    });
  });

  describe('Navigation', () => {
    it('should have See My Results button', () => {
      fixture.detectChanges();
      const continueBtn = fixture.nativeElement.querySelector('app-continue-button');
      expect(continueBtn).toBeTruthy();
    });

    it('should calculate full return on continue', () => {
      fixture.detectChanges();
      component.onContinue();
      expect(mockTaxCalculation.calculateFullReturn).toHaveBeenCalled();
    });

    it('should save calculation on continue', () => {
      fixture.detectChanges();
      component.onContinue();
      expect(mockSessionStorage.updateCalculation).toHaveBeenCalled();
    });

    it('should complete section and navigate to results on continue', () => {
      fixture.detectChanges();
      component.onContinue();
      expect(mockNavigation.completeSection).toHaveBeenCalledWith('review');
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/results');
    });

    it('should navigate back to credits', () => {
      fixture.detectChanges();
      component.onBack();
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/credits');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty name gracefully', () => {
      taxReturnSignal.set(setupTaxReturn({ firstName: '', lastName: '' }));
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Not provided');
    });

    it('should handle multiple W2s', () => {
      taxReturnSignal.set(setupTaxReturn({
        w2s: [
          { id: '1', employerName: 'Job 1', wagesTips: 30000, federalWithheld: 3000, socialSecurityWages: 30000, socialSecurityWithheld: 1860, medicareWages: 30000, medicareWithheld: 435 },
          { id: '2', employerName: 'Job 2', wagesTips: 20000, federalWithheld: 2000, socialSecurityWages: 20000, socialSecurityWithheld: 1240, medicareWages: 20000, medicareWithheld: 290 },
        ],
      }));
      fixture.detectChanges();
      expect(component.totalW2Wages()).toBe(50000);
      expect(component.totalWithheld()).toBe(5000);
    });

    it('should handle multiple 1099s', () => {
      taxReturnSignal.set(setupTaxReturn({
        has1099Income: true,
        form1099s: [
          { id: '1', payerName: 'Client 1', nonemployeeCompensation: 5000 },
          { id: '2', payerName: 'Client 2', nonemployeeCompensation: 3000 },
        ],
      }));
      fixture.detectChanges();
      expect(component.total1099Income()).toBe(8000);
    });

    it('should handle head of household status', () => {
      taxReturnSignal.set(setupTaxReturn({ filingStatus: 'head_of_household' }));
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Head of Household');
    });

    it('should handle all itemized deduction types', () => {
      taxReturnSignal.set(setupTaxReturn({
        useStandardDeduction: false,
        mortgageInterest: 5000,
        studentLoanInterest: 2000,
        saltTaxes: 8000,
        charitableContributions: 1000,
        medicalExpenses: 6000,
      }));
      fixture.detectChanges();
      const breakdown = fixture.nativeElement.querySelector('.itemized-breakdown');
      expect(breakdown.textContent).toContain('Mortgage Interest');
      expect(breakdown.textContent).toContain('Student Loan Interest');
      expect(breakdown.textContent).toContain('State & Local Taxes');
      expect(breakdown.textContent).toContain('Charitable Contributions');
      expect(breakdown.textContent).toContain('Medical Expenses');
    });
  });
});
