import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScheduleCEntryComponent } from './schedule-c-entry.component';
import { NavigationService, SessionStorageService, SECTIONS } from '@core/services';
import { signal, WritableSignal } from '@angular/core';
import { TaxReturn, createEmptyTaxReturn, createEmptyScheduleC, ScheduleC, createEmptyForm1099NEC } from '@core/models';

describe('ScheduleCEntryComponent', () => {
  let component: ScheduleCEntryComponent;
  let fixture: ComponentFixture<ScheduleCEntryComponent>;
  let mockNavigation: Partial<NavigationService>;
  let mockSessionStorage: Partial<SessionStorageService>;
  let taxReturnSignal: WritableSignal<TaxReturn>;

  const setupTaxReturn = (overrides: Partial<{
    scheduleC: ScheduleC;
    form1099s: { nonemployeeCompensation: number }[];
    form1099Ks: { grossAmount: number }[];
  }> = {}): TaxReturn => {
    const taxReturn = createEmptyTaxReturn();
    taxReturn.income.has1099Income = true;
    taxReturn.income.scheduleC = overrides.scheduleC ?? createEmptyScheduleC();
    if (overrides.form1099s) {
      taxReturn.income.form1099s = overrides.form1099s.map((f, i) => ({
        ...createEmptyForm1099NEC(),
        id: `${i}`,
        nonemployeeCompensation: f.nonemployeeCompensation,
      }));
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
      updateIncome: jest.fn((updater) => {
        const current = taxReturnSignal();
        taxReturnSignal.set({
          ...current,
          income: updater(current.income),
        });
      }),
    };

    await TestBed.configureTestingModule({
      imports: [ScheduleCEntryComponent],
      providers: [
        { provide: NavigationService, useValue: mockNavigation },
        { provide: SessionStorageService, useValue: mockSessionStorage },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ScheduleCEntryComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display page title', () => {
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('h1');
    expect(title.textContent).toContain('Self-Employment Expenses');
  });

  it('should display help trigger', () => {
    fixture.detectChanges();
    const helpTrigger = fixture.nativeElement.querySelector('.help-trigger');
    expect(helpTrigger.textContent).toContain('What can I deduct?');
  });

  it('should display instruction text', () => {
    fixture.detectChanges();
    const instruction = fixture.nativeElement.querySelector('.instruction');
    expect(instruction.textContent).toContain('gig worker or freelancer');
    expect(instruction.textContent).toContain('deduct business expenses');
  });

  describe('income summary', () => {
    it('should display total 1099 income', () => {
      taxReturnSignal.set(setupTaxReturn({
        form1099s: [{ nonemployeeCompensation: 5000 }],
      }));
      fixture.detectChanges();

      const summaryLabel = fixture.nativeElement.querySelector('.income-summary .summary-label');
      expect(summaryLabel.textContent).toContain('Total 1099 Income');
    });

    it('should calculate total 1099 income', () => {
      taxReturnSignal.set(setupTaxReturn({
        form1099s: [
          { nonemployeeCompensation: 3000 },
          { nonemployeeCompensation: 2000 },
        ],
      }));
      fixture.detectChanges();

      expect(component.total1099Income()).toBe(5000);
    });
  });

  describe('business description', () => {
    it('should display business description input', () => {
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector('#businessDesc');
      expect(input).toBeTruthy();
    });

    it('should update business description', () => {
      fixture.detectChanges();
      component.updateField('businessDescription', 'Delivery driver');
      expect(mockSessionStorage.updateIncome).toHaveBeenCalled();
    });
  });

  describe('mileage section', () => {
    it('should display mileage section', () => {
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Mileage');
    });

    it('should include mileage calculator component', () => {
      fixture.detectChanges();
      const mileageCalc = fixture.nativeElement.querySelector('app-mileage-calculator');
      expect(mileageCalc).toBeTruthy();
    });
  });

  describe('other expenses', () => {
    it('should display supplies input', () => {
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Supplies & Equipment');
    });

    it('should display phone & internet input', () => {
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Phone & Internet');
    });

    it('should display platform fees input', () => {
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Platform/Service Fees');
    });

    it('should display other expenses input', () => {
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Other Business Expenses');
    });

    it('should update supplies expense', () => {
      fixture.detectChanges();
      component.updateField('supplies', 100);
      expect(mockSessionStorage.updateIncome).toHaveBeenCalled();
    });

    it('should update phone/internet expense', () => {
      fixture.detectChanges();
      component.updateField('phoneInternet', 50);
      expect(mockSessionStorage.updateIncome).toHaveBeenCalled();
    });
  });

  describe('results summary', () => {
    it('should display Schedule C Summary section', () => {
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Your Schedule C Summary');
    });

    it('should display gross income in results', () => {
      taxReturnSignal.set(setupTaxReturn({
        form1099s: [{ nonemployeeCompensation: 10000 }],
      }));
      fixture.detectChanges();

      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Gross 1099 Income');
    });
  });

  describe('navigation', () => {
    it('should navigate to income summary on continue', () => {
      fixture.detectChanges();
      component.onContinue();
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/income/summary');
    });

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

    it('should format zero correctly', () => {
      fixture.detectChanges();
      const formatted = component.formatCurrency(0);
      expect(formatted).toContain('$');
      expect(formatted).toContain('0');
    });
  });
});
