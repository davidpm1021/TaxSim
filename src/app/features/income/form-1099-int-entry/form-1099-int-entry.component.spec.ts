import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Form1099INTEntryComponent } from './form-1099-int-entry.component';
import { NavigationService, SessionStorageService, ValidationService, SECTIONS } from '@core/services';
import { signal, WritableSignal } from '@angular/core';
import { TaxReturn, createEmptyTaxReturn, Form1099INT, createEmptyForm1099INT } from '@core/models';

describe('Form1099INTEntryComponent', () => {
  let component: Form1099INTEntryComponent;
  let fixture: ComponentFixture<Form1099INTEntryComponent>;
  let mockNavigation: Partial<NavigationService>;
  let mockSessionStorage: Partial<SessionStorageService>;
  let mockValidation: Partial<ValidationService>;
  let taxReturnSignal: WritableSignal<TaxReturn>;

  const createForm1099INT = (overrides: Partial<Form1099INT> = {}): Form1099INT => ({
    ...createEmptyForm1099INT(),
    ...overrides,
  });

  const setupTaxReturn = (overrides: Partial<{
    form1099Ints: Form1099INT[];
    has1099Income: boolean;
    hasW2Income: boolean;
    hasDividendIncome: boolean;
    has1099KIncome: boolean;
  }> = {}): TaxReturn => {
    const taxReturn = createEmptyTaxReturn();
    taxReturn.income.hasInterestIncome = true;
    // Always provide at least one form to avoid computed writing to signal
    taxReturn.income.form1099Ints = overrides.form1099Ints ?? [createEmptyForm1099INT()];
    taxReturn.income.has1099Income = overrides.has1099Income ?? false;
    taxReturn.income.hasW2Income = overrides.hasW2Income ?? false;
    taxReturn.income.hasDividendIncome = overrides.hasDividendIncome ?? false;
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
      imports: [Form1099INTEntryComponent],
      providers: [
        { provide: NavigationService, useValue: mockNavigation },
        { provide: SessionStorageService, useValue: mockSessionStorage },
        { provide: ValidationService, useValue: mockValidation },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Form1099INTEntryComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display page title', () => {
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('h1');
    expect(title.textContent).toContain('Enter your 1099-INT income');
  });

  it('should display help trigger', () => {
    fixture.detectChanges();
    const helpTrigger = fixture.nativeElement.querySelector('.help-trigger');
    expect(helpTrigger.textContent).toContain('About interest income');
  });

  describe('form list', () => {
    it('should have at least one form', () => {
      fixture.detectChanges();
      expect(component.form1099Ints().length).toBeGreaterThanOrEqual(1);
    });

    it('should add a new form when button clicked', () => {
      fixture.detectChanges();
      const initialCount = component.form1099Ints().length;

      component.addForm();
      expect(component.form1099Ints().length).toBe(initialCount + 1);
    });

    it('should remove form when remove button clicked', () => {
      taxReturnSignal.set(setupTaxReturn({
        form1099Ints: [createForm1099INT({ id: '1' }), createForm1099INT({ id: '2' })],
      }));
      fixture.detectChanges();

      component.removeForm('1');
      expect(component.form1099Ints().length).toBe(1);
    });
  });

  describe('totals', () => {
    it('should calculate total interest', () => {
      taxReturnSignal.set(setupTaxReturn({
        form1099Ints: [
          createForm1099INT({ interestIncome: 100 }),
          createForm1099INT({ interestIncome: 50 }),
        ],
      }));
      fixture.detectChanges();

      expect(component.totalInterest()).toBe(150);
    });

    it('should calculate total tax-exempt interest', () => {
      taxReturnSignal.set(setupTaxReturn({
        form1099Ints: [
          createForm1099INT({ taxExemptInterest: 25 }),
          createForm1099INT({ taxExemptInterest: 15 }),
        ],
      }));
      fixture.detectChanges();

      expect(component.totalTaxExempt()).toBe(40);
    });

    it('should calculate total federal withheld', () => {
      taxReturnSignal.set(setupTaxReturn({
        form1099Ints: [
          createForm1099INT({ federalWithheld: 10 }),
          createForm1099INT({ federalWithheld: 5 }),
        ],
      }));
      fixture.detectChanges();

      expect(component.totalFederalWithheld()).toBe(15);
    });
  });

  describe('validation', () => {
    it('should not allow continue when payer name is empty', () => {
      taxReturnSignal.set(setupTaxReturn({
        form1099Ints: [createForm1099INT({ payerName: '', interestIncome: 100 })],
      }));
      fixture.detectChanges();
      expect(component.canContinue()).toBe(false);
    });

    it('should not allow continue when interest is zero', () => {
      taxReturnSignal.set(setupTaxReturn({
        form1099Ints: [createForm1099INT({ payerName: 'Bank', interestIncome: 0 })],
      }));
      fixture.detectChanges();
      expect(component.canContinue()).toBe(false);
    });

    it('should allow continue with valid form data', () => {
      taxReturnSignal.set(setupTaxReturn({
        form1099Ints: [createForm1099INT({ payerName: 'Bank', interestIncome: 100 })],
      }));
      fixture.detectChanges();
      expect(component.canContinue()).toBe(true);
    });
  });

  describe('navigation', () => {
    it('should navigate to 1099-DIV when has dividend income on continue', () => {
      taxReturnSignal.set(setupTaxReturn({
        form1099Ints: [createForm1099INT({ payerName: 'Bank', interestIncome: 100 })],
        hasDividendIncome: true,
      }));
      fixture.detectChanges();

      component.onContinue();
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/income/1099-div');
    });

    it('should navigate to income summary when no other income on continue', () => {
      taxReturnSignal.set(setupTaxReturn({
        form1099Ints: [createForm1099INT({ payerName: 'Bank', interestIncome: 100 })],
      }));
      fixture.detectChanges();

      component.onContinue();
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/income/summary');
    });

    it('should navigate back to 1099-NEC when has 1099 income on back', () => {
      taxReturnSignal.set(setupTaxReturn({
        form1099Ints: [createForm1099INT()],
        has1099Income: true,
      }));
      fixture.detectChanges();

      component.onBack();
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/income/1099');
    });
  });

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      fixture.detectChanges();
      const formatted = component.formatCurrency(100.50);
      expect(formatted).toContain('$');
      expect(formatted).toContain('100');
    });
  });
});
