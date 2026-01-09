import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResultsComponent } from './results.component';
import {
  SessionStorageService,
  NavigationService,
  TaxDataService,
  SECTIONS,
} from '@core/services';
import { signal, WritableSignal } from '@angular/core';
import { TaxReturn, createEmptyTaxReturn, TaxCalculation } from '@core/models';

describe('ResultsComponent', () => {
  let component: ResultsComponent;
  let fixture: ComponentFixture<ResultsComponent>;
  let mockSessionStorage: Partial<SessionStorageService>;
  let mockNavigation: Partial<NavigationService>;
  let mockTaxData: Partial<TaxDataService>;
  let taxReturnSignal: WritableSignal<TaxReturn>;

  const createMockCalculation = (overrides: Partial<TaxCalculation> = {}): TaxCalculation => ({
    totalW2Wages: overrides.totalW2Wages ?? 50000,
    total1099Income: overrides.total1099Income ?? 0,
    grossIncome: overrides.grossIncome ?? 50000,
    selfEmploymentTaxDeduction: overrides.selfEmploymentTaxDeduction ?? 0,
    adjustedGrossIncome: overrides.adjustedGrossIncome ?? 50000,
    standardDeductionAmount: overrides.standardDeductionAmount ?? 15750,
    itemizedDeductionAmount: overrides.itemizedDeductionAmount ?? 8000,
    deductionUsed: overrides.deductionUsed ?? 'standard',
    finalDeductionAmount: overrides.finalDeductionAmount ?? 15750,
    taxableIncome: overrides.taxableIncome ?? 35000,
    taxBeforeCredits: overrides.taxBeforeCredits ?? 4000,
    selfEmploymentTax: overrides.selfEmploymentTax ?? 0,
    totalTaxBeforeCredits: overrides.totalTaxBeforeCredits ?? 4000,
    totalCredits: overrides.totalCredits ?? 0,
    totalTax: overrides.totalTax ?? 4000,
    totalWithholding: overrides.totalWithholding ?? 5000,
    refundOrOwed: overrides.refundOrOwed ?? 1000,
    isRefund: overrides.isRefund ?? true,
  });

  const setupTaxReturn = (
    calculation: TaxCalculation | null = createMockCalculation(),
    credits: { childTaxCredit: number; earnedIncomeCredit: number } = { childTaxCredit: 0, earnedIncomeCredit: 0 }
  ): TaxReturn => {
    const taxReturn = createEmptyTaxReturn();
    taxReturn.calculation = calculation;
    taxReturn.credits = credits;
    return taxReturn;
  };

  beforeEach(async () => {
    taxReturnSignal = signal(setupTaxReturn());

    mockSessionStorage = {
      taxReturn: taxReturnSignal,
      clear: jest.fn(),
    };

    const currentSection = signal(SECTIONS[6]); // Results section
    mockNavigation = {
      navigateTo: jest.fn(),
      reset: jest.fn(),
      currentSection: currentSection,
      currentSectionIndex: signal(6),
      getSectionStatus: jest.fn(() => 'current' as const),
      navigateToSection: jest.fn(),
    };

    mockTaxData = {
      formatCurrency: jest.fn((amount: number) =>
        `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
      ),
    };

    await TestBed.configureTestingModule({
      imports: [ResultsComponent],
      providers: [
        { provide: SessionStorageService, useValue: mockSessionStorage },
        { provide: NavigationService, useValue: mockNavigation },
        { provide: TaxDataService, useValue: mockTaxData },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResultsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Refund display', () => {
    beforeEach(() => {
      taxReturnSignal.set(setupTaxReturn(createMockCalculation({
        refundOrOwed: 1500,
        isRefund: true,
      })));
      fixture.detectChanges();
    });

    it('should display Your Results title', () => {
      const title = fixture.nativeElement.querySelector('.result-hero h1');
      expect(title.textContent).toContain('Your Results');
    });

    it('should display refund label', () => {
      const label = fixture.nativeElement.querySelector('.result-label');
      expect(label.textContent).toContain('Your Federal Refund');
    });

    it('should display refund amount', () => {
      const amount = fixture.nativeElement.querySelector('.result-amount');
      expect(amount.textContent).toContain('1,500');
    });

    it('should display refund explanation', () => {
      const explanation = fixture.nativeElement.querySelector('.result-explanation');
      expect(explanation.textContent).toContain('receive back from the IRS');
    });

    it('should have refund styling', () => {
      const hero = fixture.nativeElement.querySelector('.result-hero');
      expect(hero.classList.contains('refund')).toBe(true);
    });

    it('should have why refund link', () => {
      const link = fixture.nativeElement.querySelector('.help-link');
      expect(link.textContent).toContain('Why am I getting a refund');
    });
  });

  describe('Amount owed display', () => {
    beforeEach(() => {
      taxReturnSignal.set(setupTaxReturn(createMockCalculation({
        refundOrOwed: 800,
        isRefund: false,
        totalWithholding: 3000,
        totalTaxBeforeCredits: 3800,
      })));
      fixture.detectChanges();
    });

    it('should display owed label', () => {
      const label = fixture.nativeElement.querySelector('.result-label');
      expect(label.textContent).toContain('You Owe');
    });

    it('should display owed amount', () => {
      const amount = fixture.nativeElement.querySelector('.result-amount');
      expect(amount.textContent).toContain('800');
    });

    it('should display owed explanation', () => {
      const explanation = fixture.nativeElement.querySelector('.result-explanation');
      expect(explanation.textContent).toContain('need to pay to the IRS');
    });

    it('should have owed styling', () => {
      const hero = fixture.nativeElement.querySelector('.result-hero');
      expect(hero.classList.contains('owed')).toBe(true);
    });

    it('should have why owe link', () => {
      const link = fixture.nativeElement.querySelector('.help-link');
      expect(link.textContent).toContain('Why do I owe money');
    });
  });

  describe('Income breakdown', () => {
    it('should display W-2 wages', () => {
      taxReturnSignal.set(setupTaxReturn(createMockCalculation({
        totalW2Wages: 45000,
        grossIncome: 45000,
      })));
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('W-2 Wages');
      expect(content).toContain('45,000');
    });

    it('should display 1099 income when present', () => {
      taxReturnSignal.set(setupTaxReturn(createMockCalculation({
        totalW2Wages: 40000,
        total1099Income: 10000,
        grossIncome: 50000,
      })));
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('1099-NEC Income');
      expect(content).toContain('10,000');
    });

    it('should not display 1099 section when zero', () => {
      taxReturnSignal.set(setupTaxReturn(createMockCalculation({
        total1099Income: 0,
      })));
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).not.toContain('1099-NEC Income');
    });

    it('should display total income', () => {
      taxReturnSignal.set(setupTaxReturn(createMockCalculation({
        grossIncome: 55000,
      })));
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Total Income');
      expect(content).toContain('55,000');
    });
  });

  describe('Adjustments section', () => {
    it('should display self-employment tax deduction when present', () => {
      taxReturnSignal.set(setupTaxReturn(createMockCalculation({
        total1099Income: 10000,
        selfEmploymentTaxDeduction: 707,
        adjustedGrossIncome: 49293,
      })));
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Self-Employment Tax Deduction');
      expect(content).toContain('Adjusted Gross Income');
    });

    it('should not display adjustments section when no SE income', () => {
      taxReturnSignal.set(setupTaxReturn(createMockCalculation({
        selfEmploymentTaxDeduction: 0,
      })));
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).not.toContain('Self-Employment Tax Deduction');
    });
  });

  describe('Deductions breakdown', () => {
    it('should display standard deduction when used', () => {
      taxReturnSignal.set(setupTaxReturn(createMockCalculation({
        deductionUsed: 'standard',
        finalDeductionAmount: 15000,
      })));
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Standard Deduction');
    });

    it('should display itemized deductions when used', () => {
      taxReturnSignal.set(setupTaxReturn(createMockCalculation({
        deductionUsed: 'itemized',
        finalDeductionAmount: 18000,
      })));
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Itemized Deductions');
    });

    it('should display taxable income', () => {
      taxReturnSignal.set(setupTaxReturn(createMockCalculation({
        taxableIncome: 35000,
      })));
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Taxable Income');
      expect(content).toContain('35,000');
    });
  });

  describe('Tax calculation breakdown', () => {
    it('should display tax before credits', () => {
      taxReturnSignal.set(setupTaxReturn(createMockCalculation({
        taxBeforeCredits: 4200,
      })));
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('4,200');
    });

    it('should display self-employment tax when present', () => {
      taxReturnSignal.set(setupTaxReturn(createMockCalculation({
        selfEmploymentTax: 1413,
        totalTaxBeforeCredits: 5613,
      })));
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Self-Employment Tax');
      expect(content).toContain('1,413');
    });

    it('should not display self-employment tax when zero', () => {
      taxReturnSignal.set(setupTaxReturn(createMockCalculation({
        selfEmploymentTax: 0,
      })));
      fixture.detectChanges();
      // Look for the specific SE tax row, not just the word
      const groups = fixture.nativeElement.querySelectorAll('.breakdown-group');
      const taxGroup = Array.from(groups).find((g: any) =>
        g.querySelector('h3')?.textContent.includes('Tax Calculation')
      );
      const rows = (taxGroup as HTMLElement)?.querySelectorAll('.breakdown-row');
      const seRow = Array.from(rows || []).find((r: any) =>
        r.textContent.includes('Self-Employment Tax') && !r.textContent.includes('Deduction')
      );
      expect(seRow).toBeFalsy();
    });

    it('should have tax brackets info button', () => {
      fixture.detectChanges();
      const groups = fixture.nativeElement.querySelectorAll('.breakdown-group');
      const taxGroup = Array.from(groups).find((g: any) =>
        g.querySelector('h3')?.textContent.includes('Tax Calculation')
      );
      const infoBtn = (taxGroup as HTMLElement)?.querySelector('.info-btn');
      expect(infoBtn).toBeTruthy();
    });
  });

  describe('Credits breakdown', () => {
    it('should display Child Tax Credit when present', () => {
      taxReturnSignal.set(setupTaxReturn(
        createMockCalculation({ totalCredits: 2000 }),
        { childTaxCredit: 2000, earnedIncomeCredit: 0 }
      ));
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Child Tax Credit');
      expect(content).toContain('2,000');
    });

    it('should display EITC when present', () => {
      taxReturnSignal.set(setupTaxReturn(
        createMockCalculation({ totalCredits: 632 }),
        { childTaxCredit: 0, earnedIncomeCredit: 632 }
      ));
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Earned Income Tax Credit');
      expect(content).toContain('632');
    });

    it('should display total credits when both present', () => {
      taxReturnSignal.set(setupTaxReturn(
        createMockCalculation({ totalCredits: 2632 }),
        { childTaxCredit: 2000, earnedIncomeCredit: 632 }
      ));
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Total Credits');
      expect(content).toContain('2,632');
    });

    it('should display no credits message when zero', () => {
      taxReturnSignal.set(setupTaxReturn(
        createMockCalculation({ totalCredits: 0 }),
        { childTaxCredit: 0, earnedIncomeCredit: 0 }
      ));
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('No credits applied');
    });
  });

  describe('Payments section', () => {
    it('should display federal tax withheld', () => {
      taxReturnSignal.set(setupTaxReturn(createMockCalculation({
        totalWithholding: 6000,
      })));
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Federal Tax Withheld');
      expect(content).toContain('6,000');
    });

    it('should have withholding info button', () => {
      fixture.detectChanges();
      const groups = fixture.nativeElement.querySelectorAll('.breakdown-group');
      const paymentsGroup = Array.from(groups).find((g: any) =>
        g.querySelector('h3')?.textContent.includes('Payments')
      );
      const infoBtn = (paymentsGroup as HTMLElement)?.querySelector('.info-btn');
      expect(infoBtn).toBeTruthy();
    });
  });

  describe('Final calculation formula', () => {
    it('should display calculation formula', () => {
      fixture.detectChanges();
      const formula = fixture.nativeElement.querySelector('.calculation-formula');
      expect(formula.textContent).toContain('Payments');
      expect(formula.textContent).toContain('Tax');
      expect(formula.textContent).toContain('Refundable Credits');
    });

    it('should display calculation values', () => {
      taxReturnSignal.set(setupTaxReturn(createMockCalculation({
        totalWithholding: 5000,
        totalTaxBeforeCredits: 4000,
        totalCredits: 500,
        refundOrOwed: 1500,
        isRefund: true,
      })));
      fixture.detectChanges();
      const values = fixture.nativeElement.querySelector('.calculation-values');
      expect(values.textContent).toContain('5,000');
      expect(values.textContent).toContain('4,000');
      expect(values.textContent).toContain('500');
    });

    it('should have refund styling when refund', () => {
      taxReturnSignal.set(setupTaxReturn(createMockCalculation({ isRefund: true })));
      fixture.detectChanges();
      const calc = fixture.nativeElement.querySelector('.final-calculation');
      expect(calc.classList.contains('refund')).toBe(true);
    });

    it('should have owed styling when owing', () => {
      taxReturnSignal.set(setupTaxReturn(createMockCalculation({ isRefund: false })));
      fixture.detectChanges();
      const calc = fixture.nativeElement.querySelector('.final-calculation');
      expect(calc.classList.contains('owed')).toBe(true);
    });
  });

  describe('Deduction comparison', () => {
    it('should display comparison section', () => {
      fixture.detectChanges();
      const comparison = fixture.nativeElement.querySelector('.comparison-section');
      expect(comparison).toBeTruthy();
      expect(comparison.textContent).toContain('Deduction Comparison');
    });

    it('should display standard deduction amount', () => {
      taxReturnSignal.set(setupTaxReturn(createMockCalculation({
        standardDeductionAmount: 15000,
      })));
      fixture.detectChanges();
      const cards = fixture.nativeElement.querySelectorAll('.comparison-card');
      const standardCard = cards[0];
      expect(standardCard.textContent).toContain('Standard Deduction');
      expect(standardCard.textContent).toContain('15,000');
    });

    it('should display itemized deduction amount', () => {
      taxReturnSignal.set(setupTaxReturn(createMockCalculation({
        itemizedDeductionAmount: 12000,
      })));
      fixture.detectChanges();
      const cards = fixture.nativeElement.querySelectorAll('.comparison-card');
      const itemizedCard = cards[1];
      expect(itemizedCard.textContent).toContain('Itemized Deductions');
      expect(itemizedCard.textContent).toContain('12,000');
    });

    it('should highlight selected deduction', () => {
      taxReturnSignal.set(setupTaxReturn(createMockCalculation({
        deductionUsed: 'standard',
      })));
      fixture.detectChanges();
      const cards = fixture.nativeElement.querySelectorAll('.comparison-card');
      expect(cards[0].classList.contains('selected')).toBe(true);
      expect(cards[1].classList.contains('selected')).toBe(false);
    });

    it('should show Your Choice badge on selected', () => {
      taxReturnSignal.set(setupTaxReturn(createMockCalculation({
        deductionUsed: 'itemized',
      })));
      fixture.detectChanges();
      const cards = fixture.nativeElement.querySelectorAll('.comparison-card');
      const badge = cards[1].querySelector('.selected-badge');
      expect(badge).toBeTruthy();
      expect(badge.textContent).toContain('Your Choice');
    });

    it('should display savings note when applicable', () => {
      taxReturnSignal.set(setupTaxReturn(createMockCalculation({
        standardDeductionAmount: 15000,
        itemizedDeductionAmount: 8000,
        deductionUsed: 'standard',
      })));
      fixture.detectChanges();
      const note = fixture.nativeElement.querySelector('.savings-note');
      expect(note).toBeTruthy();
      expect(note.textContent).toContain('saved');
    });
  });

  describe('Action buttons', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should have Print Summary button', () => {
      const buttons = fixture.nativeElement.querySelectorAll('.action-buttons button');
      const printBtn = Array.from(buttons).find((b: any) => b.textContent.includes('Print'));
      expect(printBtn).toBeTruthy();
    });

    it('should have Start Over button', () => {
      const buttons = fixture.nativeElement.querySelectorAll('.action-buttons button');
      const startOverBtn = Array.from(buttons).find((b: any) => b.textContent.includes('Start Over'));
      expect(startOverBtn).toBeTruthy();
    });

    it('should call print on Print Summary click', () => {
      const printSpy = jest.spyOn(window, 'print').mockImplementation(() => {});
      component.onPrint();
      expect(printSpy).toHaveBeenCalled();
      printSpy.mockRestore();
    });

    it('should clear session and navigate on Start Over', () => {
      component.onStartOver();
      expect(mockSessionStorage.clear).toHaveBeenCalled();
      expect(mockNavigation.reset).toHaveBeenCalled();
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/welcome');
    });
  });

  describe('Educational modals', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should have refund modal', () => {
      const modal = fixture.nativeElement.querySelector('app-educational-modal[title="Why Am I Getting a Refund?"]');
      expect(modal).toBeTruthy();
    });

    it('should have owe modal', () => {
      const modal = fixture.nativeElement.querySelector('app-educational-modal[title="Why Do I Owe Money?"]');
      expect(modal).toBeTruthy();
    });

    it('should have tax brackets modal', () => {
      const modal = fixture.nativeElement.querySelector('app-educational-modal[title="How Tax Brackets Work"]');
      expect(modal).toBeTruthy();
    });

    it('should have withholding modal', () => {
      const modal = fixture.nativeElement.querySelector('app-educational-modal[title="What is Tax Withholding?"]');
      expect(modal).toBeTruthy();
    });
  });

  describe('Edge cases', () => {
    it('should handle null calculation gracefully', () => {
      taxReturnSignal.set(setupTaxReturn(null));
      fixture.detectChanges();
      expect(component.totalW2Wages()).toBe(0);
      expect(component.grossIncome()).toBe(0);
      expect(component.isRefund()).toBe(true);
    });

    it('should handle zero refund/owed amount', () => {
      taxReturnSignal.set(setupTaxReturn(createMockCalculation({
        refundOrOwed: 0,
        isRefund: true,
      })));
      fixture.detectChanges();
      const amount = fixture.nativeElement.querySelector('.result-amount');
      expect(amount.textContent).toContain('$0');
    });

    it('should handle large numbers', () => {
      taxReturnSignal.set(setupTaxReturn(createMockCalculation({
        grossIncome: 150000,
        totalWithholding: 25000,
        refundOrOwed: 5000,
      })));
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('150,000');
    });
  });
});
