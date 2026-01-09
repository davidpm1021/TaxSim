import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IncomeSummaryComponent } from './income-summary.component';
import { NavigationService, SessionStorageService, TaxDataService, SECTIONS } from '@core/services';
import { signal, WritableSignal } from '@angular/core';
import { TaxReturn, createEmptyTaxReturn, W2, Form1099NEC, createEmptyW2, createEmptyForm1099NEC } from '@core/models';

describe('IncomeSummaryComponent', () => {
  let component: IncomeSummaryComponent;
  let fixture: ComponentFixture<IncomeSummaryComponent>;
  let mockNavigation: Partial<NavigationService>;
  let mockSessionStorage: Partial<SessionStorageService>;
  let mockTaxData: Partial<TaxDataService>;
  let taxReturnSignal: WritableSignal<TaxReturn>;

  const createW2 = (overrides: Partial<W2> = {}): W2 => ({
    ...createEmptyW2(),
    ...overrides,
  });

  const createForm1099 = (overrides: Partial<Form1099NEC> = {}): Form1099NEC => ({
    ...createEmptyForm1099NEC(),
    ...overrides,
  });

  const setupTaxReturn = (overrides: Partial<{
    hasW2Income: boolean;
    w2s: W2[];
    has1099Income: boolean;
    form1099s: Form1099NEC[];
    hasInterestIncome: boolean;
    hasDividendIncome: boolean;
    has1099KIncome: boolean;
  }> = {}): TaxReturn => {
    const taxReturn = createEmptyTaxReturn();
    taxReturn.income.hasW2Income = overrides.hasW2Income ?? false;
    taxReturn.income.w2s = overrides.w2s ?? [];
    taxReturn.income.has1099Income = overrides.has1099Income ?? false;
    taxReturn.income.form1099s = overrides.form1099s ?? [];
    taxReturn.income.hasInterestIncome = overrides.hasInterestIncome ?? false;
    taxReturn.income.hasDividendIncome = overrides.hasDividendIncome ?? false;
    taxReturn.income.has1099KIncome = overrides.has1099KIncome ?? false;
    return taxReturn;
  };

  beforeEach(async () => {
    taxReturnSignal = signal(setupTaxReturn());

    mockNavigation = {
      navigateTo: jest.fn(),
      completeSection: jest.fn(),
      currentSection: signal(SECTIONS[2]),
      currentSectionIndex: signal(2),
      getSectionStatus: jest.fn(() => 'current' as const),
      navigateToSection: jest.fn(),
    };

    mockSessionStorage = {
      taxReturn: taxReturnSignal,
    };

    mockTaxData = {
      formatCurrency: jest.fn((amount: number) => `$${amount.toLocaleString()}`),
    };

    await TestBed.configureTestingModule({
      imports: [IncomeSummaryComponent],
      providers: [
        { provide: NavigationService, useValue: mockNavigation },
        { provide: SessionStorageService, useValue: mockSessionStorage },
        { provide: TaxDataService, useValue: mockTaxData },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(IncomeSummaryComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display page title', () => {
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('h1');
    expect(title.textContent).toContain('Your Income Summary');
  });

  it('should display help trigger', () => {
    fixture.detectChanges();
    const helpTrigger = fixture.nativeElement.querySelector('.help-trigger');
    expect(helpTrigger.textContent).toContain('Understanding gross income');
  });

  describe('W-2 income section', () => {
    it('should display W-2 section when has W-2 income', () => {
      taxReturnSignal.set(setupTaxReturn({
        hasW2Income: true,
        w2s: [createW2({ employerName: 'Test Corp', wagesTips: 50000, federalWithheld: 5000 })],
      }));
      fixture.detectChanges();

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('W-2 Wages');
      expect(content).toContain('Test Corp');
    });

    it('should not display W-2 section when no W-2 income', () => {
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).not.toContain('W-2 Wages');
    });

    it('should calculate total W-2 wages', () => {
      taxReturnSignal.set(setupTaxReturn({
        hasW2Income: true,
        w2s: [
          createW2({ wagesTips: 30000 }),
          createW2({ wagesTips: 20000 }),
        ],
      }));
      fixture.detectChanges();

      expect(component.totalW2Wages()).toBe(50000);
    });

    it('should calculate total federal withheld', () => {
      taxReturnSignal.set(setupTaxReturn({
        hasW2Income: true,
        w2s: [
          createW2({ federalWithheld: 3000 }),
          createW2({ federalWithheld: 2000 }),
        ],
      }));
      fixture.detectChanges();

      expect(component.totalFederalWithheld()).toBe(5000);
    });

    it('should display withheld amount', () => {
      taxReturnSignal.set(setupTaxReturn({
        hasW2Income: true,
        w2s: [createW2({ wagesTips: 50000, federalWithheld: 5000 })],
      }));
      fixture.detectChanges();

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Federal tax already withheld');
    });
  });

  describe('1099-NEC income section', () => {
    it('should display 1099 section when has 1099 income', () => {
      taxReturnSignal.set(setupTaxReturn({
        has1099Income: true,
        form1099s: [createForm1099({ payerName: 'Gig Company', nonemployeeCompensation: 5000 })],
      }));
      fixture.detectChanges();

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('1099-NEC Self-Employment Income');
      expect(content).toContain('Gig Company');
    });

    it('should calculate total 1099 income', () => {
      taxReturnSignal.set(setupTaxReturn({
        has1099Income: true,
        form1099s: [
          createForm1099({ nonemployeeCompensation: 3000 }),
          createForm1099({ nonemployeeCompensation: 2000 }),
        ],
      }));
      fixture.detectChanges();

      expect(component.total1099Income()).toBe(5000);
    });

    it('should display estimated SE tax', () => {
      taxReturnSignal.set(setupTaxReturn({
        has1099Income: true,
        form1099s: [createForm1099({ nonemployeeCompensation: 10000 })],
      }));
      fixture.detectChanges();

      expect(component.estimatedSETax()).toBeGreaterThan(0);
    });
  });

  describe('gross income totals', () => {
    it('should calculate total gross income', () => {
      taxReturnSignal.set(setupTaxReturn({
        hasW2Income: true,
        w2s: [createW2({ wagesTips: 50000 })],
        has1099Income: true,
        form1099s: [createForm1099({ nonemployeeCompensation: 10000 })],
      }));
      fixture.detectChanges();

      expect(component.totalGrossIncome()).toBe(60000);
    });

    it('should display total gross income in total section', () => {
      taxReturnSignal.set(setupTaxReturn({
        hasW2Income: true,
        w2s: [createW2({ wagesTips: 50000 })],
      }));
      fixture.detectChanges();

      const totalSection = fixture.nativeElement.querySelector('.total-section');
      expect(totalSection.textContent).toContain('Total Gross Income');
    });
  });

  describe('AGI calculation', () => {
    it('should calculate SE deduction', () => {
      taxReturnSignal.set(setupTaxReturn({
        has1099Income: true,
        form1099s: [createForm1099({ nonemployeeCompensation: 10000 })],
      }));
      fixture.detectChanges();

      // SE deduction is half of SE tax
      expect(component.seDeduction()).toBe(component.estimatedSETax() * 0.5);
    });

    it('should calculate adjusted gross income', () => {
      taxReturnSignal.set(setupTaxReturn({
        has1099Income: true,
        form1099s: [createForm1099({ nonemployeeCompensation: 10000 })],
      }));
      fixture.detectChanges();

      const expectedAGI = component.totalGrossIncome() - component.seDeduction();
      expect(component.adjustedGrossIncome()).toBe(expectedAGI);
    });

    it('should display AGI section when has 1099 income', () => {
      taxReturnSignal.set(setupTaxReturn({
        has1099Income: true,
        form1099s: [createForm1099({ nonemployeeCompensation: 10000 })],
      }));
      fixture.detectChanges();

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Adjusted Gross Income (AGI)');
      expect(content).toContain('1/2 SE Tax Deduction');
    });
  });

  describe('navigation', () => {
    it('should complete income section and navigate to deductions on continue', () => {
      fixture.detectChanges();
      component.onContinue();

      expect(mockNavigation.completeSection).toHaveBeenCalledWith('income');
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/deductions/itemized');
    });

    it('should navigate back to schedule-c when has 1099 income on back', () => {
      taxReturnSignal.set(setupTaxReturn({
        has1099Income: true,
        form1099s: [createForm1099()],
      }));
      fixture.detectChanges();

      component.onBack();
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/income/schedule-c');
    });

    it('should navigate back to W-2 when only W-2 income on back', () => {
      taxReturnSignal.set(setupTaxReturn({
        hasW2Income: true,
        w2s: [createW2()],
      }));
      fixture.detectChanges();

      component.onBack();
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/income/w2');
    });

    it('should navigate back to income types when no income on back', () => {
      fixture.detectChanges();
      component.onBack();
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/income/types');
    });
  });

  describe('formatCurrency', () => {
    it('should call taxData.formatCurrency', () => {
      fixture.detectChanges();
      component.formatCurrency(50000);
      expect(mockTaxData.formatCurrency).toHaveBeenCalledWith(50000);
    });
  });
});
