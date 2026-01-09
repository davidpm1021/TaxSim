import { ComponentFixture, TestBed } from '@angular/core/testing';
import { W2EntryComponent } from './w2-entry.component';
import { NavigationService, SessionStorageService, ValidationService, SECTIONS } from '@core/services';
import { signal, WritableSignal } from '@angular/core';
import { TaxReturn, createEmptyTaxReturn, W2, createEmptyW2 } from '@core/models';

describe('W2EntryComponent', () => {
  let component: W2EntryComponent;
  let fixture: ComponentFixture<W2EntryComponent>;
  let mockNavigation: Partial<NavigationService>;
  let mockSessionStorage: Partial<SessionStorageService>;
  let mockValidation: Partial<ValidationService>;
  let taxReturnSignal: WritableSignal<TaxReturn>;

  const createW2 = (overrides: Partial<W2> = {}): W2 => ({
    ...createEmptyW2(),
    ...overrides,
  });

  const setupTaxReturn = (overrides: Partial<{
    w2s: W2[];
    has1099Income: boolean;
    hasInterestIncome: boolean;
    hasDividendIncome: boolean;
    has1099KIncome: boolean;
  }> = {}): TaxReturn => {
    const taxReturn = createEmptyTaxReturn();
    taxReturn.income.hasW2Income = true;
    taxReturn.income.w2s = overrides.w2s ?? [];
    taxReturn.income.has1099Income = overrides.has1099Income ?? false;
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
      validateWithholdingVsWages: jest.fn((withheld: number, wages: number) => ({
        isValid: withheld <= wages,
        error: withheld <= wages ? null : 'Withholding cannot exceed wages',
      })),
    };

    await TestBed.configureTestingModule({
      imports: [W2EntryComponent],
      providers: [
        { provide: NavigationService, useValue: mockNavigation },
        { provide: SessionStorageService, useValue: mockSessionStorage },
        { provide: ValidationService, useValue: mockValidation },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(W2EntryComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display page title', () => {
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('h1');
    expect(title.textContent).toContain('Enter your W-2 information');
  });

  it('should display help trigger', () => {
    fixture.detectChanges();
    const helpTrigger = fixture.nativeElement.querySelector('.help-trigger');
    expect(helpTrigger.textContent).toContain('Understanding your W-2');
  });

  it('should display instruction text', () => {
    fixture.detectChanges();
    const instruction = fixture.nativeElement.querySelector('.instruction');
    expect(instruction.textContent).toContain('Enter the information from each W-2');
  });

  describe('W-2 list', () => {
    it('should create an empty W-2 when none exist', () => {
      fixture.detectChanges();
      expect(component.w2s().length).toBe(1);
    });

    it('should display Add Another W-2 button', () => {
      fixture.detectChanges();
      const addBtn = fixture.nativeElement.querySelector('.add-btn');
      expect(addBtn.textContent).toContain('Add Another W-2');
    });

    it('should add a new W-2 when button clicked', () => {
      fixture.detectChanges();
      const initialCount = component.w2s().length;

      component.addW2();
      expect(component.w2s().length).toBe(initialCount + 1);
    });

    it('should display W-2 number when multiple W-2s', () => {
      taxReturnSignal.set(setupTaxReturn({
        w2s: [createW2({ id: '1' }), createW2({ id: '2' })],
      }));
      fixture.detectChanges();

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('W-2 #1');
      expect(content).toContain('W-2 #2');
    });

    it('should remove W-2 when remove button clicked', () => {
      taxReturnSignal.set(setupTaxReturn({
        w2s: [createW2({ id: '1' }), createW2({ id: '2' })],
      }));
      fixture.detectChanges();

      component.removeW2('1');
      expect(component.w2s().length).toBe(1);
      expect(component.w2s()[0].id).toBe('2');
    });
  });

  describe('totals', () => {
    it('should calculate total wages', () => {
      taxReturnSignal.set(setupTaxReturn({
        w2s: [
          createW2({ wagesTips: 30000 }),
          createW2({ wagesTips: 15000 }),
        ],
      }));
      fixture.detectChanges();

      expect(component.totalWages()).toBe(45000);
    });

    it('should calculate total federal withheld', () => {
      taxReturnSignal.set(setupTaxReturn({
        w2s: [
          createW2({ federalWithheld: 3000 }),
          createW2({ federalWithheld: 1500 }),
        ],
      }));
      fixture.detectChanges();

      expect(component.totalWithheld()).toBe(4500);
    });

    it('should display summary bar with totals', () => {
      taxReturnSignal.set(setupTaxReturn({
        w2s: [createW2({ wagesTips: 50000, federalWithheld: 5000 })],
      }));
      fixture.detectChanges();

      const summaryBar = fixture.nativeElement.querySelector('.summary-bar');
      expect(summaryBar.textContent).toContain('Total W-2 Wages');
      expect(summaryBar.textContent).toContain('Total Federal Withheld');
    });
  });

  describe('validation', () => {
    it('should not allow continue when no W-2s', () => {
      taxReturnSignal.set(setupTaxReturn({ w2s: [] }));
      fixture.detectChanges();
      expect(component.canContinue()).toBe(false);
    });

    it('should not allow continue when employer name is empty', () => {
      taxReturnSignal.set(setupTaxReturn({
        w2s: [createW2({ employerName: '', wagesTips: 50000 })],
      }));
      fixture.detectChanges();
      expect(component.canContinue()).toBe(false);
    });

    it('should not allow continue when wages are zero', () => {
      taxReturnSignal.set(setupTaxReturn({
        w2s: [createW2({ employerName: 'Test Employer', wagesTips: 0 })],
      }));
      fixture.detectChanges();
      expect(component.canContinue()).toBe(false);
    });

    it('should allow continue with valid W-2 data', () => {
      taxReturnSignal.set(setupTaxReturn({
        w2s: [createW2({ employerName: 'Test Employer', wagesTips: 50000, federalWithheld: 5000 })],
      }));
      fixture.detectChanges();
      expect(component.canContinue()).toBe(true);
    });

    it('should show validation warning when employer name missing', () => {
      taxReturnSignal.set(setupTaxReturn({
        w2s: [createW2({ employerName: '', wagesTips: 50000 })],
      }));
      fixture.detectChanges();
      expect(component.validationWarning()).toContain('Employer name is required');
    });

    it('should show validation warning when wages missing', () => {
      taxReturnSignal.set(setupTaxReturn({
        w2s: [createW2({ employerName: 'Test', wagesTips: 0 })],
      }));
      fixture.detectChanges();
      expect(component.validationWarning()).toContain('Enter wages');
    });
  });

  describe('W-2 changes', () => {
    it('should update W-2 when changes emitted', () => {
      const w2 = createW2({ id: 'test-id', employerName: 'Old Name' });
      taxReturnSignal.set(setupTaxReturn({ w2s: [w2] }));
      fixture.detectChanges();

      component.onW2Change('test-id', { employerName: 'New Name' });
      expect(component.w2s()[0].employerName).toBe('New Name');
    });
  });

  describe('navigation', () => {
    it('should navigate to 1099 when has 1099 income on continue', () => {
      taxReturnSignal.set(setupTaxReturn({
        w2s: [createW2({ employerName: 'Test', wagesTips: 50000 })],
        has1099Income: true,
      }));
      fixture.detectChanges();

      component.onContinue();
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/income/1099');
    });

    it('should navigate to 1099-INT when has interest income on continue', () => {
      taxReturnSignal.set(setupTaxReturn({
        w2s: [createW2({ employerName: 'Test', wagesTips: 50000 })],
        hasInterestIncome: true,
      }));
      fixture.detectChanges();

      component.onContinue();
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/income/1099-int');
    });

    it('should navigate to income summary when only W-2 income on continue', () => {
      taxReturnSignal.set(setupTaxReturn({
        w2s: [createW2({ employerName: 'Test', wagesTips: 50000 })],
      }));
      fixture.detectChanges();

      component.onContinue();
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/income/summary');
    });

    it('should navigate back to income types on back', () => {
      fixture.detectChanges();
      component.onBack();
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/income/types');
    });
  });

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      fixture.detectChanges();
      expect(component.formatCurrency(50000)).toBe('$50,000.00');
    });

    it('should format zero correctly', () => {
      fixture.detectChanges();
      expect(component.formatCurrency(0)).toBe('$0.00');
    });
  });
});
