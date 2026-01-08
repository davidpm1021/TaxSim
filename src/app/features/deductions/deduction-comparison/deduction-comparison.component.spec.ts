import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeductionComparisonComponent } from './deduction-comparison.component';
import { SessionStorageService, NavigationService, TaxDataService, SECTIONS } from '@core/services';
import { signal, WritableSignal } from '@angular/core';
import { TaxReturn, createEmptyTaxReturn, FilingStatus } from '@core/models';
import { STANDARD_DEDUCTIONS } from '@core/constants/tax-year-2025';

describe('DeductionComparisonComponent', () => {
  let component: DeductionComparisonComponent;
  let fixture: ComponentFixture<DeductionComparisonComponent>;
  let mockSessionStorage: Partial<SessionStorageService>;
  let mockNavigation: Partial<NavigationService>;
  let mockTaxData: Partial<TaxDataService>;
  let taxReturnSignal: WritableSignal<TaxReturn>;

  const setupTaxReturn = (options: {
    filingStatus?: FilingStatus;
    mortgageInterest?: number;
    studentLoanInterest?: number;
    saltTaxes?: number;
    charitableContributions?: number;
    medicalExpenses?: number;
    useStandardDeduction?: boolean;
  } = {}) => {
    const taxReturn = createEmptyTaxReturn();
    taxReturn.personalInfo.filingStatus = options.filingStatus ?? 'single';
    taxReturn.income.hasW2Income = true;
    taxReturn.income.w2s = [{ id: '1', employerName: 'Test', wagesTips: 50000, federalWithheld: 5000, socialSecurityWages: 50000, socialSecurityWithheld: 3100, medicareWages: 50000, medicareWithheld: 725 }];
    taxReturn.deductions = {
      mortgageInterest: options.mortgageInterest ?? 0,
      studentLoanInterest: options.studentLoanInterest ?? 0,
      saltTaxes: options.saltTaxes ?? 0,
      charitableContributions: options.charitableContributions ?? 0,
      medicalExpenses: options.medicalExpenses ?? 0,
      useStandardDeduction: options.useStandardDeduction ?? true,
    };
    return taxReturn;
  };

  beforeEach(async () => {
    taxReturnSignal = signal(setupTaxReturn());

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
      completeSection: jest.fn(),
      currentSection: currentSection,
      currentSectionIndex: signal(3),
      getSectionStatus: jest.fn(() => 'current' as const),
      navigateToSection: jest.fn(),
    };

    mockTaxData = {
      formatCurrency: jest.fn((amount) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`),
      getStandardDeduction: jest.fn((status: FilingStatus) => STANDARD_DEDUCTIONS[status]),
      getFilingStatusOptions: jest.fn(() => [
        { value: 'single' as FilingStatus, label: 'Single', standardDeduction: STANDARD_DEDUCTIONS.single },
        { value: 'married-jointly' as FilingStatus, label: 'Married Filing Jointly', standardDeduction: STANDARD_DEDUCTIONS['married-jointly'] },
        { value: 'head-of-household' as FilingStatus, label: 'Head of Household', standardDeduction: STANDARD_DEDUCTIONS['head-of-household'] },
      ]),
    };

    await TestBed.configureTestingModule({
      imports: [DeductionComparisonComponent],
      providers: [
        { provide: SessionStorageService, useValue: mockSessionStorage },
        { provide: NavigationService, useValue: mockNavigation },
        { provide: TaxDataService, useValue: mockTaxData },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DeductionComparisonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display page title', () => {
    const title = fixture.nativeElement.querySelector('h1');
    expect(title.textContent).toContain('Your Deduction Options');
  });

  it('should display standard deduction column', () => {
    const columns = fixture.nativeElement.querySelectorAll('.comparison-column');
    expect(columns.length).toBe(2);
    expect(columns[0].textContent).toContain('Standard Deduction');
  });

  it('should display itemized deduction column', () => {
    const columns = fixture.nativeElement.querySelectorAll('.comparison-column');
    expect(columns[1].textContent).toContain('Itemized Deductions');
  });

  it('should show correct standard deduction for single filer', () => {
    expect(component.standardDeduction()).toBe(STANDARD_DEDUCTIONS.single);
  });

  it('should show correct standard deduction for married filing jointly', () => {
    taxReturnSignal.set(setupTaxReturn({ filingStatus: 'married-jointly' }));
    fixture.detectChanges();
    expect(component.standardDeduction()).toBe(STANDARD_DEDUCTIONS['married-jointly']);
  });

  it('should show correct filing status label', () => {
    expect(component.filingStatusLabel()).toBe('Single');
  });

  it('should calculate total itemized deductions', () => {
    taxReturnSignal.set(setupTaxReturn({
      mortgageInterest: 8000,
      studentLoanInterest: 2000,
      saltTaxes: 5000,
      charitableContributions: 1000,
      medicalExpenses: 0,
    }));
    fixture.detectChanges();

    expect(component.totalItemized()).toBe(16000);
  });

  it('should recommend standard when itemized is less', () => {
    taxReturnSignal.set(setupTaxReturn({
      mortgageInterest: 5000,
      studentLoanInterest: 1000,
    }));
    fixture.detectChanges();

    expect(component.recommendStandard()).toBe(true);
  });

  it('should recommend itemized when it exceeds standard', () => {
    taxReturnSignal.set(setupTaxReturn({
      mortgageInterest: 10000,
      saltTaxes: 10000,
      charitableContributions: 3000,
    }));
    fixture.detectChanges();

    expect(component.recommendStandard()).toBe(false);
  });

  it('should display recommended badge on better option', () => {
    taxReturnSignal.set(setupTaxReturn());
    fixture.detectChanges();

    const badges = fixture.nativeElement.querySelectorAll('.recommended-badge');
    expect(badges.length).toBe(1);
    expect(badges[0].textContent).toContain('Recommended');
  });

  it('should calculate savings amount correctly', () => {
    // Standard is 15000, itemized is 6000
    taxReturnSignal.set(setupTaxReturn({
      mortgageInterest: 5000,
      studentLoanInterest: 1000,
    }));
    fixture.detectChanges();

    expect(component.savingsAmount()).toBe(STANDARD_DEDUCTIONS.single - 6000);
  });

  it('should show recommendation box', () => {
    const recommendBox = fixture.nativeElement.querySelector('.recommendation-box');
    expect(recommendBox).toBeTruthy();
  });

  it('should update selection when standard is clicked', () => {
    component.selectDeduction(true);
    expect(component.useStandard()).toBe(true);
  });

  it('should update selection when itemized is clicked', () => {
    component.selectDeduction(false);
    expect(component.useStandard()).toBe(false);
  });

  it('should show selected state on chosen option', () => {
    component.selectDeduction(true);
    fixture.detectChanges();

    const standardColumn = fixture.nativeElement.querySelector('.comparison-column.selected');
    expect(standardColumn.textContent).toContain('Standard Deduction');
  });

  it('should show itemized breakdown when deductions exist', () => {
    taxReturnSignal.set(setupTaxReturn({
      mortgageInterest: 8000,
      saltTaxes: 5000,
    }));
    fixture.detectChanges();

    const breakdownRows = fixture.nativeElement.querySelectorAll('.breakdown-row');
    expect(breakdownRows.length).toBe(2);
  });

  it('should show empty message when no itemized deductions', () => {
    const emptyRow = fixture.nativeElement.querySelector('.breakdown-row.empty');
    expect(emptyRow).toBeTruthy();
    expect(emptyRow.textContent).toContain('No itemized deductions entered');
  });

  it('should save deduction choice and navigate on continue', () => {
    component.selectDeduction(true);
    component.onContinue();

    expect(mockSessionStorage.updateDeductions).toHaveBeenCalled();
    expect(mockNavigation.completeSection).toHaveBeenCalledWith('deductions');
    expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/credits');
  });

  it('should navigate back to itemized entry', () => {
    component.onBack();
    expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/deductions/itemized');
  });

  it('should navigate to itemized entry on edit click', () => {
    component.onEditItemized();
    expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/deductions/itemized');
  });

  it('should have edit link', () => {
    const editLink = fixture.nativeElement.querySelector('.edit-link');
    expect(editLink).toBeTruthy();
    expect(editLink.textContent).toContain('Edit itemized deductions');
  });

  it('should have help button', () => {
    const helpTrigger = fixture.nativeElement.querySelector('.help-trigger');
    expect(helpTrigger).toBeTruthy();
  });

  it('should apply effective limits to student loan', () => {
    taxReturnSignal.set(setupTaxReturn({
      studentLoanInterest: 5000,
    }));
    fixture.detectChanges();

    expect(component.effectiveStudentLoan()).toBe(2500);
  });

  it('should apply effective limits to SALT', () => {
    taxReturnSignal.set(setupTaxReturn({
      saltTaxes: 15000,
    }));
    fixture.detectChanges();

    expect(component.effectiveSalt()).toBe(10000);
  });

  it('should calculate deductible medical correctly', () => {
    // AGI is 50000, threshold is 3750, medical is 5000
    taxReturnSignal.set(setupTaxReturn({
      medicalExpenses: 5000,
    }));
    fixture.detectChanges();

    expect(component.deductibleMedical()).toBe(1250);
  });
});
