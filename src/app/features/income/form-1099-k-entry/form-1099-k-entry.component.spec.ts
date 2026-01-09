import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Form1099KEntryComponent } from './form-1099-k-entry.component';
import { NavigationService, SessionStorageService, ValidationService, SECTIONS } from '@core/services';
import { signal, WritableSignal } from '@angular/core';
import { TaxReturn, createEmptyTaxReturn, Form1099K, createEmptyForm1099K } from '@core/models';

describe('Form1099KEntryComponent', () => {
  let component: Form1099KEntryComponent;
  let fixture: ComponentFixture<Form1099KEntryComponent>;
  let mockNavigation: Partial<NavigationService>;
  let mockSessionStorage: Partial<SessionStorageService>;
  let mockValidation: Partial<ValidationService>;
  let taxReturnSignal: WritableSignal<TaxReturn>;

  const createForm1099K = (overrides: Partial<Form1099K> = {}): Form1099K => ({
    ...createEmptyForm1099K(),
    ...overrides,
  });

  const setupTaxReturn = (overrides: Partial<{
    form1099Ks: Form1099K[];
    has1099Income: boolean;
    hasDividendIncome: boolean;
    hasInterestIncome: boolean;
  }> = {}): TaxReturn => {
    const taxReturn = createEmptyTaxReturn();
    taxReturn.income.has1099KIncome = true;
    // Always provide at least one form to avoid computed writing to signal
    taxReturn.income.form1099Ks = overrides.form1099Ks ?? [createEmptyForm1099K()];
    taxReturn.income.has1099Income = overrides.has1099Income ?? false;
    taxReturn.income.hasDividendIncome = overrides.hasDividendIncome ?? false;
    taxReturn.income.hasInterestIncome = overrides.hasInterestIncome ?? false;
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
      imports: [Form1099KEntryComponent],
      providers: [
        { provide: NavigationService, useValue: mockNavigation },
        { provide: SessionStorageService, useValue: mockSessionStorage },
        { provide: ValidationService, useValue: mockValidation },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Form1099KEntryComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display page title', () => {
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('h1');
    expect(title.textContent).toContain('Enter your 1099-K income');
  });

  it('should display help trigger', () => {
    fixture.detectChanges();
    const helpTrigger = fixture.nativeElement.querySelector('.help-trigger');
    expect(helpTrigger.textContent).toContain('About payment app income');
  });

  it('should display instruction about payment apps', () => {
    fixture.detectChanges();
    const instruction = fixture.nativeElement.querySelector('.instruction');
    expect(instruction.textContent).toContain('Venmo, PayPal, Cash App');
  });

  describe('double-counting warning', () => {
    it('should display warning when has 1099-NEC income', () => {
      taxReturnSignal.set(setupTaxReturn({
        form1099Ks: [createForm1099K()],
        has1099Income: true,
      }));
      fixture.detectChanges();

      const warning = fixture.nativeElement.querySelector('.warning-callout');
      expect(warning).toBeTruthy();
      expect(warning.textContent).toContain('Avoid Double-Counting');
    });

    it('should not display warning when no 1099-NEC income', () => {
      fixture.detectChanges();
      const warning = fixture.nativeElement.querySelector('.warning-callout');
      expect(warning).toBeFalsy();
    });
  });

  describe('form list', () => {
    it('should have at least one form', () => {
      fixture.detectChanges();
      expect(component.form1099Ks().length).toBeGreaterThanOrEqual(1);
    });

    it('should add a new form when button clicked', () => {
      fixture.detectChanges();
      const initialCount = component.form1099Ks().length;

      component.addForm();
      expect(component.form1099Ks().length).toBe(initialCount + 1);
    });

    it('should remove form when remove button clicked', () => {
      taxReturnSignal.set(setupTaxReturn({
        form1099Ks: [createForm1099K({ id: '1' }), createForm1099K({ id: '2' })],
      }));
      fixture.detectChanges();

      component.removeForm('1');
      expect(component.form1099Ks().length).toBe(1);
    });
  });

  describe('totals', () => {
    it('should calculate total gross amount', () => {
      taxReturnSignal.set(setupTaxReturn({
        form1099Ks: [
          createForm1099K({ grossAmount: 1000 }),
          createForm1099K({ grossAmount: 500 }),
        ],
      }));
      fixture.detectChanges();

      expect(component.totalGrossAmount()).toBe(1500);
    });

    it('should calculate total transactions', () => {
      taxReturnSignal.set(setupTaxReturn({
        form1099Ks: [
          createForm1099K({ numberOfTransactions: 50 }),
          createForm1099K({ numberOfTransactions: 30 }),
        ],
      }));
      fixture.detectChanges();

      expect(component.totalTransactions()).toBe(80);
    });

    it('should calculate total federal withheld', () => {
      taxReturnSignal.set(setupTaxReturn({
        form1099Ks: [
          createForm1099K({ federalWithheld: 100 }),
          createForm1099K({ federalWithheld: 50 }),
        ],
      }));
      fixture.detectChanges();

      expect(component.totalFederalWithheld()).toBe(150);
    });
  });

  describe('validation', () => {
    it('should not allow continue when payer name is empty', () => {
      taxReturnSignal.set(setupTaxReturn({
        form1099Ks: [createForm1099K({ payerName: '', grossAmount: 1000 })],
      }));
      fixture.detectChanges();
      expect(component.canContinue()).toBe(false);
    });

    it('should not allow continue when gross amount is zero', () => {
      taxReturnSignal.set(setupTaxReturn({
        form1099Ks: [createForm1099K({ payerName: 'Venmo', grossAmount: 0 })],
      }));
      fixture.detectChanges();
      expect(component.canContinue()).toBe(false);
    });

    it('should allow continue with valid form data', () => {
      taxReturnSignal.set(setupTaxReturn({
        form1099Ks: [createForm1099K({ payerName: 'Venmo', grossAmount: 1000 })],
      }));
      fixture.detectChanges();
      expect(component.canContinue()).toBe(true);
    });
  });

  describe('navigation', () => {
    it('should navigate to schedule-c on continue (self-employment income)', () => {
      taxReturnSignal.set(setupTaxReturn({
        form1099Ks: [createForm1099K({ payerName: 'PayPal', grossAmount: 1000 })],
      }));
      fixture.detectChanges();

      component.onContinue();
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/income/schedule-c');
    });

    it('should navigate back to 1099-DIV when has dividend income on back', () => {
      taxReturnSignal.set(setupTaxReturn({
        form1099Ks: [createForm1099K()],
        hasDividendIncome: true,
      }));
      fixture.detectChanges();

      component.onBack();
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/income/1099-div');
    });

    it('should navigate back to 1099-INT when has interest income on back', () => {
      taxReturnSignal.set(setupTaxReturn({
        form1099Ks: [createForm1099K()],
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
      const formatted = component.formatCurrency(1000);
      expect(formatted).toContain('$');
      expect(formatted).toContain('1,000');
    });
  });
});
