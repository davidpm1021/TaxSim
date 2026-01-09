import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EstimatedTaxCalculatorComponent } from './estimated-tax-calculator.component';
import { NavigationService, SessionStorageService, SECTIONS } from '@core/services';
import { signal, WritableSignal } from '@angular/core';
import { TaxReturn, createEmptyTaxReturn, createEmptyForm1099NEC, createEmptyScheduleC } from '@core/models';

describe('EstimatedTaxCalculatorComponent', () => {
  let component: EstimatedTaxCalculatorComponent;
  let fixture: ComponentFixture<EstimatedTaxCalculatorComponent>;
  let mockNavigation: Partial<NavigationService>;
  let mockSessionStorage: Partial<SessionStorageService>;
  let taxReturnSignal: WritableSignal<TaxReturn>;

  const setupTaxReturn = (overrides: Partial<{
    form1099s: { nonemployeeCompensation: number }[];
    filingStatus: string;
    totalExpenses: number;
  }> = {}): TaxReturn => {
    const taxReturn = createEmptyTaxReturn();
    if (overrides.form1099s) {
      taxReturn.income.has1099Income = true;
      taxReturn.income.form1099s = overrides.form1099s.map((f, i) => ({
        ...createEmptyForm1099NEC(),
        id: `${i}`,
        nonemployeeCompensation: f.nonemployeeCompensation,
      }));
    }
    if (overrides.filingStatus) {
      taxReturn.personalInfo.filingStatus = overrides.filingStatus as any;
    }
    if (overrides.totalExpenses) {
      const scheduleC = createEmptyScheduleC();
      scheduleC.supplies = overrides.totalExpenses;
      scheduleC.totalExpenses = overrides.totalExpenses;
      taxReturn.income.scheduleC = scheduleC;
    }
    return taxReturn;
  };

  beforeEach(async () => {
    taxReturnSignal = signal(setupTaxReturn());

    mockNavigation = {
      navigateTo: jest.fn(),
      currentSection: signal(SECTIONS[2]),
      currentSectionIndex: signal(2),
      getSectionStatus: jest.fn(() => 'current' as const),
      navigateToSection: jest.fn(),
    };

    mockSessionStorage = {
      taxReturn: taxReturnSignal,
    };

    await TestBed.configureTestingModule({
      imports: [EstimatedTaxCalculatorComponent],
      providers: [
        { provide: NavigationService, useValue: mockNavigation },
        { provide: SessionStorageService, useValue: mockSessionStorage },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EstimatedTaxCalculatorComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display page title', () => {
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('h1');
    expect(title.textContent).toContain('Quarterly Estimated Taxes');
  });

  it('should display help trigger', () => {
    fixture.detectChanges();
    const helpTrigger = fixture.nativeElement.querySelector('.help-trigger');
    expect(helpTrigger.textContent).toContain('Why quarterly payments?');
  });

  describe('no income state', () => {
    it('should display no income notice when no 1099 income', () => {
      fixture.detectChanges();
      const notice = fixture.nativeElement.querySelector('.no-income-notice');
      expect(notice).toBeTruthy();
      expect(notice.textContent).toContain("haven't entered any 1099 income");
    });
  });

  describe('with income', () => {
    beforeEach(() => {
      taxReturnSignal.set(setupTaxReturn({
        form1099s: [{ nonemployeeCompensation: 10000 }],
      }));
    });

    it('should display income summary section', () => {
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Your Self-Employment Income');
    });

    it('should display gross income', () => {
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Gross 1099 Income');
    });

    it('should calculate total 1099 income', () => {
      fixture.detectChanges();
      expect(component.total1099Income()).toBe(10000);
    });

    it('should calculate self-employment tax', () => {
      fixture.detectChanges();
      // SE tax = 10000 * 0.9235 * 0.153 = ~1413
      expect(component.selfEmploymentTax()).toBeGreaterThan(0);
    });

    it('should display tax calculation section', () => {
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Estimated Tax Breakdown');
    });

    it('should display self-employment tax info', () => {
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Self-Employment Tax');
      expect(content).toContain('15.3%');
    });
  });

  describe('with expenses', () => {
    it('should show business expenses when present', () => {
      taxReturnSignal.set(setupTaxReturn({
        form1099s: [{ nonemployeeCompensation: 10000 }],
        totalExpenses: 2000,
      }));
      fixture.detectChanges();

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Business Expenses');
    });

    it('should calculate net SE income after expenses', () => {
      taxReturnSignal.set(setupTaxReturn({
        form1099s: [{ nonemployeeCompensation: 10000 }],
        totalExpenses: 2000,
      }));
      fixture.detectChanges();

      expect(component.netSEIncome()).toBe(8000);
    });
  });

  describe('navigation', () => {
    it('should navigate back appropriately on back', () => {
      fixture.detectChanges();
      component.onBack();
      expect(mockNavigation.navigateTo).toHaveBeenCalled();
    });
  });

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      fixture.detectChanges();
      const formatted = component.formatCurrency(1000);
      expect(formatted).toContain('$');
      expect(formatted).toContain('1,000');
    });
  });
});
