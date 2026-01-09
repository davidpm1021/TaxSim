import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Form1099EntryComponent } from './form-1099-entry.component';
import { NavigationService, SessionStorageService, ValidationService, SECTIONS } from '@core/services';
import { signal, WritableSignal } from '@angular/core';
import { TaxReturn, createEmptyTaxReturn, Form1099NEC, createEmptyForm1099NEC } from '@core/models';

describe('Form1099EntryComponent', () => {
  let component: Form1099EntryComponent;
  let fixture: ComponentFixture<Form1099EntryComponent>;
  let mockNavigation: Partial<NavigationService>;
  let mockSessionStorage: Partial<SessionStorageService>;
  let mockValidation: Partial<ValidationService>;
  let taxReturnSignal: WritableSignal<TaxReturn>;

  const createForm1099 = (overrides: Partial<Form1099NEC> = {}): Form1099NEC => ({
    ...createEmptyForm1099NEC(),
    ...overrides,
  });

  const setupTaxReturn = (overrides: Partial<{
    form1099s: Form1099NEC[];
    hasW2Income: boolean;
    hasInterestIncome: boolean;
    hasDividendIncome: boolean;
    has1099KIncome: boolean;
  }> = {}): TaxReturn => {
    const taxReturn = createEmptyTaxReturn();
    taxReturn.income.has1099Income = true;
    // Always provide at least one form to avoid computed writing to signal
    taxReturn.income.form1099s = overrides.form1099s ?? [createEmptyForm1099NEC()];
    taxReturn.income.hasW2Income = overrides.hasW2Income ?? false;
    taxReturn.income.hasInterestIncome = overrides.hasInterestIncome ?? false;
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
      imports: [Form1099EntryComponent],
      providers: [
        { provide: NavigationService, useValue: mockNavigation },
        { provide: SessionStorageService, useValue: mockSessionStorage },
        { provide: ValidationService, useValue: mockValidation },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Form1099EntryComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display page title', () => {
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('h1');
    expect(title.textContent).toContain('Enter your 1099-NEC income');
  });

  it('should display help trigger', () => {
    fixture.detectChanges();
    const helpTrigger = fixture.nativeElement.querySelector('.help-trigger');
    expect(helpTrigger.textContent).toContain('About self-employment income');
  });

  it('should display instruction text', () => {
    fixture.detectChanges();
    const instruction = fixture.nativeElement.querySelector('.instruction');
    expect(instruction.textContent).toContain('Enter income from each 1099-NEC');
  });

  describe('1099 list', () => {
    it('should have at least one form', () => {
      fixture.detectChanges();
      expect(component.form1099s().length).toBeGreaterThanOrEqual(1);
    });

    it('should display Add Another 1099-NEC button', () => {
      fixture.detectChanges();
      const addBtn = fixture.nativeElement.querySelector('.add-btn');
      expect(addBtn.textContent).toContain('Add Another 1099-NEC');
    });

    it('should add a new form when button clicked', () => {
      fixture.detectChanges();
      const initialCount = component.form1099s().length;

      component.addForm();
      expect(component.form1099s().length).toBe(initialCount + 1);
    });

    it('should remove form when remove button clicked', () => {
      taxReturnSignal.set(setupTaxReturn({
        form1099s: [createForm1099({ id: '1' }), createForm1099({ id: '2' })],
      }));
      fixture.detectChanges();

      component.removeForm('1');
      expect(component.form1099s().length).toBe(1);
      expect(component.form1099s()[0].id).toBe('2');
    });
  });

  describe('totals', () => {
    it('should calculate total income', () => {
      taxReturnSignal.set(setupTaxReturn({
        form1099s: [
          createForm1099({ nonemployeeCompensation: 5000 }),
          createForm1099({ nonemployeeCompensation: 3000 }),
        ],
      }));
      fixture.detectChanges();

      expect(component.totalIncome()).toBe(8000);
    });

    it('should calculate estimated SE tax', () => {
      taxReturnSignal.set(setupTaxReturn({
        form1099s: [createForm1099({ nonemployeeCompensation: 10000 })],
      }));
      fixture.detectChanges();

      // SE tax = 10000 * 0.9235 * 0.153 = 1412.96 approximately
      expect(component.estimatedSETax()).toBeGreaterThan(0);
    });

    it('should display summary bar with total', () => {
      taxReturnSignal.set(setupTaxReturn({
        form1099s: [createForm1099({ nonemployeeCompensation: 5000 })],
      }));
      fixture.detectChanges();

      const summaryBar = fixture.nativeElement.querySelector('.summary-bar');
      expect(summaryBar.textContent).toContain('Total 1099 Income');
    });
  });

  describe('self-employment tax notice', () => {
    it('should display SE tax notice when there is income', () => {
      taxReturnSignal.set(setupTaxReturn({
        form1099s: [createForm1099({ nonemployeeCompensation: 5000 })],
      }));
      fixture.detectChanges();

      const notice = fixture.nativeElement.querySelector('.se-tax-notice');
      expect(notice).toBeTruthy();
      expect(notice.textContent).toContain('Self-Employment Tax Applies');
    });

    it('should not display SE tax notice when no income', () => {
      taxReturnSignal.set(setupTaxReturn({
        form1099s: [createForm1099({ nonemployeeCompensation: 0 })],
      }));
      fixture.detectChanges();

      const notice = fixture.nativeElement.querySelector('.se-tax-notice');
      expect(notice).toBeFalsy();
    });
  });

  describe('validation', () => {
    it('should not allow continue when payer name is empty', () => {
      taxReturnSignal.set(setupTaxReturn({
        form1099s: [createForm1099({ payerName: '', nonemployeeCompensation: 5000 })],
      }));
      fixture.detectChanges();
      expect(component.canContinue()).toBe(false);
    });

    it('should not allow continue when income is zero', () => {
      taxReturnSignal.set(setupTaxReturn({
        form1099s: [createForm1099({ payerName: 'Test Payer', nonemployeeCompensation: 0 })],
      }));
      fixture.detectChanges();
      expect(component.canContinue()).toBe(false);
    });

    it('should allow continue with valid form data', () => {
      taxReturnSignal.set(setupTaxReturn({
        form1099s: [createForm1099({ payerName: 'Test Payer', nonemployeeCompensation: 5000 })],
      }));
      fixture.detectChanges();
      expect(component.canContinue()).toBe(true);
    });

    it('should show validation warning when payer name missing', () => {
      taxReturnSignal.set(setupTaxReturn({
        form1099s: [createForm1099({ payerName: '', nonemployeeCompensation: 5000 })],
      }));
      fixture.detectChanges();
      expect(component.validationWarning()).toContain('Payer name is required');
    });

    it('should show validation warning when income missing', () => {
      taxReturnSignal.set(setupTaxReturn({
        form1099s: [createForm1099({ payerName: 'Test', nonemployeeCompensation: 0 })],
      }));
      fixture.detectChanges();
      expect(component.validationWarning()).toContain('Enter income amount');
    });
  });

  describe('form changes', () => {
    it('should update form when changes emitted', () => {
      const form = createForm1099({ id: 'test-id', payerName: 'Old Name' });
      taxReturnSignal.set(setupTaxReturn({ form1099s: [form] }));
      fixture.detectChanges();

      component.updateForm('test-id', { payerName: 'New Name' });
      expect(component.form1099s()[0].payerName).toBe('New Name');
    });
  });

  describe('navigation', () => {
    it('should navigate to 1099-INT when has interest income on continue', () => {
      taxReturnSignal.set(setupTaxReturn({
        form1099s: [createForm1099({ payerName: 'Test', nonemployeeCompensation: 5000 })],
        hasInterestIncome: true,
      }));
      fixture.detectChanges();

      component.onContinue();
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/income/1099-int');
    });

    it('should navigate to schedule-c when only 1099 income on continue', () => {
      taxReturnSignal.set(setupTaxReturn({
        form1099s: [createForm1099({ payerName: 'Test', nonemployeeCompensation: 5000 })],
      }));
      fixture.detectChanges();

      component.onContinue();
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/income/schedule-c');
    });

    it('should navigate back to W-2 when has W-2 income on back', () => {
      taxReturnSignal.set(setupTaxReturn({
        form1099s: [createForm1099()],
        hasW2Income: true,
      }));
      fixture.detectChanges();

      component.onBack();
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/income/w2');
    });

    it('should navigate back to income types when no W-2 income on back', () => {
      fixture.detectChanges();
      component.onBack();
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/income/types');
    });
  });

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      fixture.detectChanges();
      const formatted = component.formatCurrency(5000);
      expect(formatted).toContain('$');
      expect(formatted).toContain('5,000');
    });
  });
});
