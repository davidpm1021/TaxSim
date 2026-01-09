import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Form1099DIVEntryComponent } from './form-1099-div-entry.component';
import { NavigationService, SessionStorageService, ValidationService, SECTIONS } from '@core/services';
import { signal, WritableSignal } from '@angular/core';
import { TaxReturn, createEmptyTaxReturn, Form1099DIV, createEmptyForm1099DIV } from '@core/models';

describe('Form1099DIVEntryComponent', () => {
  let component: Form1099DIVEntryComponent;
  let fixture: ComponentFixture<Form1099DIVEntryComponent>;
  let mockNavigation: Partial<NavigationService>;
  let mockSessionStorage: Partial<SessionStorageService>;
  let mockValidation: Partial<ValidationService>;
  let taxReturnSignal: WritableSignal<TaxReturn>;

  const createForm1099DIV = (overrides: Partial<Form1099DIV> = {}): Form1099DIV => ({
    ...createEmptyForm1099DIV(),
    ...overrides,
  });

  const setupTaxReturn = (overrides: Partial<{
    form1099Divs: Form1099DIV[];
    has1099Income: boolean;
    hasInterestIncome: boolean;
    has1099KIncome: boolean;
  }> = {}): TaxReturn => {
    const taxReturn = createEmptyTaxReturn();
    taxReturn.income.hasDividendIncome = true;
    // Always provide at least one form to avoid computed writing to signal
    taxReturn.income.form1099Divs = overrides.form1099Divs ?? [createEmptyForm1099DIV()];
    taxReturn.income.has1099Income = overrides.has1099Income ?? false;
    taxReturn.income.hasInterestIncome = overrides.hasInterestIncome ?? false;
    taxReturn.income.has1099KIncome = overrides.has1099KIncome ?? false;
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
      updateIncome: jest.fn((updater) => {
        const current = taxReturnSignal();
        taxReturnSignal.set({
          ...current,
          income: updater(current.income),
        });
      }),
    };

    mockValidation = {
      validateRequired: jest.fn((value: string) => ({
        isValid: value.trim().length > 0,
        error: value.trim().length > 0 ? null : 'Field is required',
      })),
    };

    await TestBed.configureTestingModule({
      imports: [Form1099DIVEntryComponent],
      providers: [
        { provide: NavigationService, useValue: mockNavigation },
        { provide: SessionStorageService, useValue: mockSessionStorage },
        { provide: ValidationService, useValue: mockValidation },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Form1099DIVEntryComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display page title', () => {
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('h1');
    expect(title.textContent).toContain('Enter your 1099-DIV income');
  });

  it('should display help trigger', () => {
    fixture.detectChanges();
    const helpTrigger = fixture.nativeElement.querySelector('.help-trigger');
    expect(helpTrigger.textContent).toContain('About dividend income');
  });

  describe('form list', () => {
    it('should have at least one form', () => {
      fixture.detectChanges();
      expect(component.form1099Divs().length).toBeGreaterThanOrEqual(1);
    });

    it('should add a new form when button clicked', () => {
      fixture.detectChanges();
      const initialCount = component.form1099Divs().length;

      component.addForm();
      expect(component.form1099Divs().length).toBe(initialCount + 1);
    });

    it('should remove form when remove button clicked', () => {
      taxReturnSignal.set(setupTaxReturn({
        form1099Divs: [createForm1099DIV({ id: '1' }), createForm1099DIV({ id: '2' })],
      }));
      fixture.detectChanges();

      component.removeForm('1');
      expect(component.form1099Divs().length).toBe(1);
    });
  });

  describe('totals', () => {
    it('should calculate total ordinary dividends', () => {
      taxReturnSignal.set(setupTaxReturn({
        form1099Divs: [
          createForm1099DIV({ ordinaryDividends: 500 }),
          createForm1099DIV({ ordinaryDividends: 300 }),
        ],
      }));
      fixture.detectChanges();

      expect(component.totalOrdinaryDividends()).toBe(800);
    });

    it('should calculate total qualified dividends', () => {
      taxReturnSignal.set(setupTaxReturn({
        form1099Divs: [
          createForm1099DIV({ qualifiedDividends: 400 }),
          createForm1099DIV({ qualifiedDividends: 200 }),
        ],
      }));
      fixture.detectChanges();

      expect(component.totalQualifiedDividends()).toBe(600);
    });

    it('should calculate total capital gains', () => {
      taxReturnSignal.set(setupTaxReturn({
        form1099Divs: [
          createForm1099DIV({ capitalGainDistributions: 100 }),
          createForm1099DIV({ capitalGainDistributions: 50 }),
        ],
      }));
      fixture.detectChanges();

      expect(component.totalCapitalGains()).toBe(150);
    });
  });

  describe('validation', () => {
    it('should not allow continue when payer name is empty', () => {
      taxReturnSignal.set(setupTaxReturn({
        form1099Divs: [createForm1099DIV({ payerName: '', ordinaryDividends: 500 })],
      }));
      fixture.detectChanges();
      expect(component.canContinue()).toBe(false);
    });

    it('should not allow continue when dividends are zero', () => {
      taxReturnSignal.set(setupTaxReturn({
        form1099Divs: [createForm1099DIV({ payerName: 'Robinhood', ordinaryDividends: 0 })],
      }));
      fixture.detectChanges();
      expect(component.canContinue()).toBe(false);
    });

    it('should allow continue with valid form data', () => {
      taxReturnSignal.set(setupTaxReturn({
        form1099Divs: [createForm1099DIV({ payerName: 'Robinhood', ordinaryDividends: 500 })],
      }));
      fixture.detectChanges();
      expect(component.canContinue()).toBe(true);
    });
  });

  describe('navigation', () => {
    it('should navigate to 1099-K when has 1099-K income on continue', () => {
      taxReturnSignal.set(setupTaxReturn({
        form1099Divs: [createForm1099DIV({ payerName: 'Broker', ordinaryDividends: 500 })],
        has1099KIncome: true,
      }));
      fixture.detectChanges();

      component.onContinue();
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/income/1099-k');
    });

    it('should navigate to schedule-c when has 1099 income on continue', () => {
      taxReturnSignal.set(setupTaxReturn({
        form1099Divs: [createForm1099DIV({ payerName: 'Broker', ordinaryDividends: 500 })],
        has1099Income: true,
      }));
      fixture.detectChanges();

      component.onContinue();
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/income/schedule-c');
    });

    it('should navigate to income summary when no other income on continue', () => {
      taxReturnSignal.set(setupTaxReturn({
        form1099Divs: [createForm1099DIV({ payerName: 'Broker', ordinaryDividends: 500 })],
      }));
      fixture.detectChanges();

      component.onContinue();
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/income/summary');
    });

    it('should navigate back to 1099-INT when has interest income on back', () => {
      taxReturnSignal.set(setupTaxReturn({
        form1099Divs: [createForm1099DIV()],
        hasInterestIncome: true,
      }));
      fixture.detectChanges();

      component.onBack();
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/income/1099-int');
    });
  });

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      fixture.detectChanges();
      const formatted = component.formatCurrency(500);
      expect(formatted).toContain('$');
      expect(formatted).toContain('500');
    });
  });
});
