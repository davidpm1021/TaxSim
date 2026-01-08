import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreditsSummaryComponent } from './credits-summary.component';
import {
  SessionStorageService,
  NavigationService,
  TaxDataService,
  TaxCalculationService,
  SECTIONS,
} from '@core/services';
import { signal, WritableSignal } from '@angular/core';
import { TaxReturn, createEmptyTaxReturn, FilingStatus, Dependent } from '@core/models';

describe('CreditsSummaryComponent', () => {
  let component: CreditsSummaryComponent;
  let fixture: ComponentFixture<CreditsSummaryComponent>;
  let mockSessionStorage: Partial<SessionStorageService>;
  let mockNavigation: Partial<NavigationService>;
  let mockTaxData: Partial<TaxDataService>;
  let mockTaxCalculation: Partial<TaxCalculationService>;
  let taxReturnSignal: WritableSignal<TaxReturn>;

  let dependentIdCounter = 0;
  const createDependent = (options: Partial<Dependent> = {}): Dependent => ({
    id: `dep-${++dependentIdCounter}`,
    firstName: options.firstName ?? 'Child',
    relationship: options.relationship ?? 'child',
    age: options.age ?? 10,
    livedWithFiler: options.livedWithFiler ?? true,
  });

  const setupTaxReturn = (options: {
    filingStatus?: FilingStatus;
    claimedAsDependent?: boolean;
    dependents?: Dependent[];
    w2Wages?: number;
    income1099?: number;
  } = {}) => {
    const taxReturn = createEmptyTaxReturn();
    taxReturn.personalInfo.filingStatus = options.filingStatus ?? 'single';
    taxReturn.personalInfo.claimedAsDependent = options.claimedAsDependent ?? false;
    taxReturn.personalInfo.dependents = options.dependents ?? [];
    taxReturn.income.hasW2Income = (options.w2Wages ?? 0) > 0;
    taxReturn.income.has1099Income = (options.income1099 ?? 0) > 0;
    if (options.w2Wages) {
      taxReturn.income.w2s = [{
        id: '1',
        employerName: 'Test',
        wagesTips: options.w2Wages,
        federalWithheld: options.w2Wages * 0.1,
        socialSecurityWages: options.w2Wages,
        socialSecurityWithheld: options.w2Wages * 0.062,
        medicareWages: options.w2Wages,
        medicareWithheld: options.w2Wages * 0.0145,
      }];
    }
    if (options.income1099) {
      taxReturn.income.form1099s = [{
        id: '1',
        payerName: 'Freelance',
        nonemployeeCompensation: options.income1099,
      }];
    }
    return taxReturn;
  };

  beforeEach(async () => {
    taxReturnSignal = signal(setupTaxReturn({ w2Wages: 50000 }));

    mockSessionStorage = {
      taxReturn: taxReturnSignal,
      updateCredits: jest.fn(),
    };

    const currentSection = signal(SECTIONS[4]); // Credits section
    mockNavigation = {
      navigateTo: jest.fn(),
      completeSection: jest.fn(),
      currentSection: currentSection,
      currentSectionIndex: signal(4),
      getSectionStatus: jest.fn(() => 'current' as const),
      navigateToSection: jest.fn(),
    };

    mockTaxData = {
      formatCurrency: jest.fn((amount) =>
        `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      ),
    };

    mockTaxCalculation = {
      calculateChildTaxCredit: jest.fn(() => ({ total: 0, refundable: 0 })),
      calculateEITC: jest.fn(() => 0),
    };

    await TestBed.configureTestingModule({
      imports: [CreditsSummaryComponent],
      providers: [
        { provide: SessionStorageService, useValue: mockSessionStorage },
        { provide: NavigationService, useValue: mockNavigation },
        { provide: TaxDataService, useValue: mockTaxData },
        { provide: TaxCalculationService, useValue: mockTaxCalculation },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreditsSummaryComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display page title', () => {
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('h1');
    expect(title.textContent).toContain('Tax Credits');
  });

  describe('when user has no credits', () => {
    beforeEach(() => {
      taxReturnSignal.set(setupTaxReturn({ w2Wages: 50000 }));
      (mockTaxCalculation.calculateChildTaxCredit as jest.Mock).mockReturnValue({ total: 0, refundable: 0 });
      (mockTaxCalculation.calculateEITC as jest.Mock).mockReturnValue(0);
      fixture.detectChanges();
    });

    it('should display no credits message', () => {
      const noCredits = fixture.nativeElement.querySelector('.no-credits');
      expect(noCredits).toBeTruthy();
      expect(noCredits.textContent).toContain('No Tax Credits This Year');
    });

    it('should show common reasons for ineligibility', () => {
      const reasons = fixture.nativeElement.querySelector('.ineligibility-reasons');
      expect(reasons).toBeTruthy();
      expect(reasons.textContent).toContain('Common reasons');
    });

    it('should show no qualifying children reason', () => {
      const reasons = fixture.nativeElement.querySelector('.ineligibility-reasons');
      expect(reasons.textContent).toContain('No qualifying children');
    });

    it('should have learn more button', () => {
      const learnMore = fixture.nativeElement.querySelector('.learn-more-btn');
      expect(learnMore).toBeTruthy();
      expect(learnMore.textContent).toContain('Learn more');
    });
  });

  describe('when user is claimed as dependent', () => {
    beforeEach(() => {
      taxReturnSignal.set(setupTaxReturn({
        w2Wages: 15000,
        claimedAsDependent: true,
      }));
      (mockTaxCalculation.calculateChildTaxCredit as jest.Mock).mockReturnValue({ total: 0, refundable: 0 });
      (mockTaxCalculation.calculateEITC as jest.Mock).mockReturnValue(0);
      fixture.detectChanges();
    });

    it('should show claimed as dependent reason', () => {
      const reasons = fixture.nativeElement.querySelector('.ineligibility-reasons');
      expect(reasons.textContent).toContain('Claimed as a dependent');
    });
  });

  describe('when user qualifies for Child Tax Credit', () => {
    beforeEach(() => {
      const child = createDependent({ firstName: 'Emma', age: 10 });
      taxReturnSignal.set(setupTaxReturn({
        w2Wages: 50000,
        dependents: [child],
      }));
      (mockTaxCalculation.calculateChildTaxCredit as jest.Mock).mockReturnValue({
        total: 2000,
        refundable: 1700,
      });
      (mockTaxCalculation.calculateEITC as jest.Mock).mockReturnValue(0);
      fixture.detectChanges();
    });

    it('should display Child Tax Credit card', () => {
      const creditCard = fixture.nativeElement.querySelector('.credit-card');
      expect(creditCard).toBeTruthy();
      expect(creditCard.textContent).toContain('Child Tax Credit');
    });

    it('should show credit amount', () => {
      const amount = fixture.nativeElement.querySelector('.credit-amount');
      expect(amount).toBeTruthy();
      expect(amount.textContent).toContain('2,000');
    });

    it('should show qualifying children count', () => {
      const details = fixture.nativeElement.querySelector('.credit-details');
      expect(details.textContent).toContain('1');
      expect(details.textContent).toContain('qualifying');
    });

    it('should list qualifying children by name', () => {
      const childList = fixture.nativeElement.querySelector('.children-list');
      expect(childList.textContent).toContain('Emma');
      expect(childList.textContent).toContain('age 10');
    });

    it('should show refundable portion note', () => {
      const refundNote = fixture.nativeElement.querySelector('.refundable-note');
      expect(refundNote).toBeTruthy();
      expect(refundNote.textContent).toContain('refundable');
      expect(refundNote.textContent).toContain('1,700');
    });

    it('should show total credits', () => {
      const total = fixture.nativeElement.querySelector('.total-credits');
      expect(total).toBeTruthy();
      expect(total.textContent).toContain('2,000');
    });
  });

  describe('when user qualifies for EITC', () => {
    beforeEach(() => {
      taxReturnSignal.set(setupTaxReturn({
        w2Wages: 15000,
        claimedAsDependent: false,
      }));
      (mockTaxCalculation.calculateChildTaxCredit as jest.Mock).mockReturnValue({ total: 0, refundable: 0 });
      (mockTaxCalculation.calculateEITC as jest.Mock).mockReturnValue(632);
      fixture.detectChanges();
    });

    it('should display EITC card', () => {
      const creditCards = fixture.nativeElement.querySelectorAll('.credit-card');
      const eitcCard = Array.from(creditCards).find((c: any) =>
        c.textContent.includes('Earned Income Tax Credit')
      );
      expect(eitcCard).toBeTruthy();
    });

    it('should show EITC amount', () => {
      const amounts = fixture.nativeElement.querySelectorAll('.credit-amount');
      expect(amounts.length).toBeGreaterThan(0);
      expect(amounts[0].textContent).toContain('632');
    });

    it('should show fully refundable note', () => {
      const details = fixture.nativeElement.querySelector('.credit-details');
      expect(details.textContent).toContain('fully refundable');
    });
  });

  describe('when user qualifies for both CTC and EITC', () => {
    beforeEach(() => {
      const child = createDependent({ firstName: 'Max', age: 8 });
      taxReturnSignal.set(setupTaxReturn({
        w2Wages: 25000,
        dependents: [child],
      }));
      (mockTaxCalculation.calculateChildTaxCredit as jest.Mock).mockReturnValue({
        total: 2000,
        refundable: 1700,
      });
      (mockTaxCalculation.calculateEITC as jest.Mock).mockReturnValue(4213);
      fixture.detectChanges();
    });

    it('should display both credit cards', () => {
      const creditCards = fixture.nativeElement.querySelectorAll('.credit-card');
      expect(creditCards.length).toBe(2);
    });

    it('should show combined total credits', () => {
      const total = fixture.nativeElement.querySelector('.total-amount');
      expect(total.textContent).toContain('6,213');
    });

    it('should note refundable credits in summary', () => {
      const totalNote = fixture.nativeElement.querySelector('.total-note');
      expect(totalNote.textContent).toContain('refundable');
    });
  });

  describe('navigation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should navigate to review on continue', () => {
      component.onContinue();
      expect(mockNavigation.completeSection).toHaveBeenCalledWith('credits');
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/review');
    });

    it('should navigate back to deductions comparison', () => {
      component.onBack();
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/deductions/comparison');
    });
  });

  describe('credit calculations', () => {
    it('should call calculateChildTaxCredit with correct parameters', () => {
      const child = createDependent({ firstName: 'Test', age: 5 });
      taxReturnSignal.set(setupTaxReturn({
        w2Wages: 50000,
        dependents: [child],
        filingStatus: 'single',
      }));
      fixture.detectChanges();

      expect(mockTaxCalculation.calculateChildTaxCredit).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ firstName: 'Test' })]),
        expect.any(Number),
        'single'
      );
    });

    it('should call calculateEITC with correct parameters', () => {
      taxReturnSignal.set(setupTaxReturn({
        w2Wages: 20000,
        claimedAsDependent: false,
        filingStatus: 'single',
      }));
      fixture.detectChanges();

      expect(mockTaxCalculation.calculateEITC).toHaveBeenCalledWith(
        20000,
        'single',
        0,
        false
      );
    });

    it('should save credits to session storage', () => {
      (mockTaxCalculation.calculateChildTaxCredit as jest.Mock).mockReturnValue({
        total: 2000,
        refundable: 1700,
      });
      (mockTaxCalculation.calculateEITC as jest.Mock).mockReturnValue(500);
      fixture.detectChanges();

      expect(mockSessionStorage.updateCredits).toHaveBeenCalled();
    });
  });

  describe('educational modals', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should have credits vs deductions help trigger', () => {
      const helpTrigger = fixture.nativeElement.querySelector('.help-trigger');
      expect(helpTrigger).toBeTruthy();
      expect(helpTrigger.textContent).toContain('Credits vs. Deductions');
    });

    it('should have CTC info button when CTC is shown', async () => {
      const child = createDependent();
      (mockTaxCalculation.calculateChildTaxCredit as jest.Mock).mockReturnValue({
        total: 2000,
        refundable: 1700,
      });
      taxReturnSignal.set(setupTaxReturn({ w2Wages: 50000, dependents: [child] }));

      // Re-create component to trigger ngOnInit with new data
      fixture = TestBed.createComponent(CreditsSummaryComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const infoButtons = fixture.nativeElement.querySelectorAll('.info-btn');
      expect(infoButtons.length).toBeGreaterThan(0);
    });
  });

  describe('multiple qualifying children', () => {
    beforeEach(() => {
      const children = [
        createDependent({ firstName: 'Alice', age: 5 }),
        createDependent({ firstName: 'Bob', age: 8 }),
        createDependent({ firstName: 'Charlie', age: 12 }),
      ];
      taxReturnSignal.set(setupTaxReturn({
        w2Wages: 60000,
        dependents: children,
      }));
      (mockTaxCalculation.calculateChildTaxCredit as jest.Mock).mockReturnValue({
        total: 6000,
        refundable: 5100,
      });
      fixture.detectChanges();
    });

    it('should show plural form for children', () => {
      const details = fixture.nativeElement.querySelector('.credit-details');
      expect(details.textContent).toContain('3');
      expect(details.textContent).toContain('children');
    });

    it('should list all qualifying children', () => {
      const childList = fixture.nativeElement.querySelector('.children-list');
      expect(childList.textContent).toContain('Alice');
      expect(childList.textContent).toContain('Bob');
      expect(childList.textContent).toContain('Charlie');
    });
  });
});
