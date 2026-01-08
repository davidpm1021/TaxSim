import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItemizedEntryComponent } from './itemized-entry.component';
import { SessionStorageService, NavigationService, TaxDataService, SECTIONS } from '@core/services';
import { signal, WritableSignal } from '@angular/core';
import { TaxReturn, createEmptyTaxReturn } from '@core/models';
import { DEDUCTION_LIMITS } from '@core/constants/tax-year-2025';

describe('ItemizedEntryComponent', () => {
  let component: ItemizedEntryComponent;
  let fixture: ComponentFixture<ItemizedEntryComponent>;
  let mockSessionStorage: Partial<SessionStorageService>;
  let mockNavigation: Partial<NavigationService>;
  let mockTaxData: Partial<TaxDataService>;
  let taxReturnSignal: WritableSignal<TaxReturn>;

  beforeEach(async () => {
    const taxReturn = createEmptyTaxReturn();
    taxReturn.personalInfo.filingStatus = 'single';
    taxReturn.income.hasW2Income = true;
    taxReturn.income.w2s = [{ id: '1', employerName: 'Test', wagesTips: 50000, federalWithheld: 5000, socialSecurityWages: 50000, socialSecurityWithheld: 3100, medicareWages: 50000, medicareWithheld: 725 }];
    taxReturnSignal = signal(taxReturn);

    mockSessionStorage = {
      taxReturn: taxReturnSignal,
      updateDeductions: jest.fn((fn) => {
        const current = taxReturnSignal();
        const newDeductions = fn(current.deductions);
        taxReturnSignal.set({ ...current, deductions: newDeductions });
      }),
    };

    const currentSection = signal(SECTIONS[3]); // Deductions section
    mockNavigation = {
      navigateTo: jest.fn(),
      currentSection: currentSection,
      currentSectionIndex: signal(3),
      getSectionStatus: jest.fn(() => 'current' as const),
      navigateToSection: jest.fn(),
    };

    mockTaxData = {
      formatCurrency: jest.fn((amount) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`),
    };

    await TestBed.configureTestingModule({
      imports: [ItemizedEntryComponent],
      providers: [
        { provide: SessionStorageService, useValue: mockSessionStorage },
        { provide: NavigationService, useValue: mockNavigation },
        { provide: TaxDataService, useValue: mockTaxData },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ItemizedEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display page title', () => {
    const title = fixture.nativeElement.querySelector('h1');
    expect(title.textContent).toContain('Itemized Deductions');
  });

  it('should display all deduction input fields', () => {
    const mortgageInput = fixture.nativeElement.querySelector('#mortgage');
    const studentLoanInput = fixture.nativeElement.querySelector('#studentLoan');
    const saltInput = fixture.nativeElement.querySelector('#salt');
    const charitableInput = fixture.nativeElement.querySelector('#charitable');
    const medicalInput = fixture.nativeElement.querySelector('#medical');

    expect(mortgageInput).toBeTruthy();
    expect(studentLoanInput).toBeTruthy();
    expect(saltInput).toBeTruthy();
    expect(charitableInput).toBeTruthy();
    expect(medicalInput).toBeTruthy();
  });

  it('should display student loan limit badge', () => {
    const limitBadge = fixture.nativeElement.querySelector('.limit-badge');
    expect(limitBadge.textContent).toContain('Max');
    expect(limitBadge.textContent).toContain(DEDUCTION_LIMITS.studentLoanInterest.toLocaleString());
  });

  it('should update mortgage interest signal', () => {
    component.mortgageInterest.set(8000);
    expect(component.mortgageInterest()).toBe(8000);
  });

  it('should update student loan interest signal', () => {
    component.studentLoanInterest.set(1500);
    expect(component.studentLoanInterest()).toBe(1500);
  });

  it('should cap effective student loan at limit', () => {
    component.studentLoanInterest.set(5000);
    expect(component.effectiveStudentLoan()).toBe(DEDUCTION_LIMITS.studentLoanInterest);
  });

  it('should show warning when student loan exceeds limit', () => {
    component.studentLoanInterest.set(5000);
    fixture.detectChanges();

    const warning = fixture.nativeElement.querySelector('.limit-warning');
    expect(warning).toBeTruthy();
    expect(warning.textContent).toContain('Only');
  });

  it('should cap effective SALT at limit', () => {
    component.saltTaxes.set(15000);
    expect(component.effectiveSalt()).toBe(DEDUCTION_LIMITS.saltTaxes);
  });

  it('should show warning when SALT exceeds limit', () => {
    component.saltTaxes.set(15000);
    fixture.detectChanges();

    const warnings = fixture.nativeElement.querySelectorAll('.limit-warning');
    const saltWarning = Array.from(warnings).find((w: any) => w.textContent.includes('SALT'));
    expect(saltWarning).toBeTruthy();
  });

  it('should calculate AGI correctly', () => {
    // AGI = W2 wages - (0.5 * SE tax)
    // SE tax = 15.3% * 92.35% * 1099 income
    // With only W2 income of 50000, AGI = 50000
    expect(component.agi()).toBe(50000);
  });

  it('should calculate medical threshold as 7.5% of AGI', () => {
    const expectedThreshold = 50000 * 0.075; // 3750
    expect(component.medicalThreshold()).toBe(expectedThreshold);
  });

  it('should calculate deductible medical expenses correctly', () => {
    component.medicalExpenses.set(5000);
    const expectedDeductible = 5000 - (50000 * 0.075); // 5000 - 3750 = 1250
    expect(component.deductibleMedical()).toBe(expectedDeductible);
  });

  it('should return 0 for deductible medical when below threshold', () => {
    component.medicalExpenses.set(2000);
    expect(component.deductibleMedical()).toBe(0);
  });

  it('should calculate total itemized deductions correctly', () => {
    component.mortgageInterest.set(5000);
    component.studentLoanInterest.set(2000);
    component.saltTaxes.set(8000);
    component.charitableContributions.set(1000);
    component.medicalExpenses.set(5000);

    // Expected: 5000 + 2000 + 8000 + 1000 + 1250 (medical above 7.5%) = 17250
    const medicalDeductible = 5000 - (50000 * 0.075);
    const expected = 5000 + 2000 + 8000 + 1000 + medicalDeductible;
    expect(component.totalItemized()).toBe(expected);
  });

  it('should display summary preview section', () => {
    const summarySection = fixture.nativeElement.querySelector('.summary-preview');
    expect(summarySection).toBeTruthy();
    expect(summarySection.textContent).toContain('Your Itemized Total');
  });

  it('should save deductions and navigate on continue', () => {
    component.mortgageInterest.set(5000);
    component.studentLoanInterest.set(1000);
    component.saltTaxes.set(3000);
    component.charitableContributions.set(500);
    component.medicalExpenses.set(0);

    component.onContinue();

    expect(mockSessionStorage.updateDeductions).toHaveBeenCalled();
    expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/deductions/comparison');
  });

  it('should navigate back to income summary', () => {
    component.onBack();
    expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/income/summary');
  });

  it('should have help button for main modal', () => {
    const helpTrigger = fixture.nativeElement.querySelector('.help-trigger');
    expect(helpTrigger).toBeTruthy();
    expect(helpTrigger.textContent).toContain('What are itemized deductions');
  });

  it('should have info buttons for each deduction type', () => {
    const infoButtons = fixture.nativeElement.querySelectorAll('.info-btn');
    expect(infoButtons.length).toBe(5); // One for each deduction type
  });

  it('should show medical calculation when medical expenses entered', () => {
    component.medicalExpenses.set(5000);
    fixture.detectChanges();

    const medicalCalc = fixture.nativeElement.querySelector('.medical-calculation');
    expect(medicalCalc).toBeTruthy();
    expect(medicalCalc.textContent).toContain('AGI');
    expect(medicalCalc.textContent).toContain('Threshold');
    expect(medicalCalc.textContent).toContain('Deductible Amount');
  });

  it('should hide medical calculation when no medical expenses', () => {
    component.medicalExpenses.set(0);
    fixture.detectChanges();

    const medicalCalc = fixture.nativeElement.querySelector('.medical-calculation');
    expect(medicalCalc).toBeNull();
  });
});
