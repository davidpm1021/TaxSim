import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IncomeTypesComponent } from './income-types.component';
import { NavigationService, SessionStorageService, SECTIONS } from '@core/services';
import { signal, WritableSignal } from '@angular/core';
import { TaxReturn, createEmptyTaxReturn } from '@core/models';

describe('IncomeTypesComponent', () => {
  let component: IncomeTypesComponent;
  let fixture: ComponentFixture<IncomeTypesComponent>;
  let mockNavigation: Partial<NavigationService>;
  let mockSessionStorage: Partial<SessionStorageService>;
  let taxReturnSignal: WritableSignal<TaxReturn>;

  const setupTaxReturn = (overrides: Partial<{
    hasW2Income: boolean;
    has1099Income: boolean;
    hasInterestIncome: boolean;
    hasDividendIncome: boolean;
    has1099KIncome: boolean;
  }> = {}): TaxReturn => {
    const taxReturn = createEmptyTaxReturn();
    taxReturn.income.hasW2Income = overrides.hasW2Income ?? false;
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

    await TestBed.configureTestingModule({
      imports: [IncomeTypesComponent],
      providers: [
        { provide: NavigationService, useValue: mockNavigation },
        { provide: SessionStorageService, useValue: mockSessionStorage },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(IncomeTypesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display page title', () => {
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('h1');
    expect(title.textContent).toContain('What types of income did you receive?');
  });

  it('should display instruction text', () => {
    fixture.detectChanges();
    const instruction = fixture.nativeElement.querySelector('.instruction');
    expect(instruction.textContent).toContain('Select all that apply');
  });

  it('should display help trigger', () => {
    fixture.detectChanges();
    const helpTrigger = fixture.nativeElement.querySelector('.help-trigger');
    expect(helpTrigger.textContent).toContain("What's the difference?");
  });

  describe('income options', () => {
    it('should display W-2 option', () => {
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('W-2 Wages');
      expect(content).toContain('Income from an employer who withholds taxes');
    });

    it('should display 1099-NEC option', () => {
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('1099-NEC Income');
      expect(content).toContain('Self-employment or gig work income');
    });

    it('should display 1099-INT option', () => {
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('1099-INT Interest');
      expect(content).toContain('Interest earned from bank accounts');
    });

    it('should display 1099-DIV option', () => {
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('1099-DIV Dividends');
      expect(content).toContain('Dividends from stocks');
    });

    it('should display 1099-K option', () => {
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('1099-K Payment Apps');
      expect(content).toContain('Venmo, PayPal');
    });
  });

  describe('income selection', () => {
    it('should toggle W-2 income when clicked', () => {
      fixture.detectChanges();
      component.toggleW2();
      expect(mockSessionStorage.updateIncome).toHaveBeenCalled();
      expect(component.hasW2()).toBe(true);
    });

    it('should toggle 1099 income when clicked', () => {
      fixture.detectChanges();
      component.toggle1099();
      expect(mockSessionStorage.updateIncome).toHaveBeenCalled();
      expect(component.has1099()).toBe(true);
    });

    it('should toggle interest income when clicked', () => {
      fixture.detectChanges();
      component.toggleInterest();
      expect(mockSessionStorage.updateIncome).toHaveBeenCalled();
      expect(component.hasInterest()).toBe(true);
    });

    it('should toggle dividend income when clicked', () => {
      fixture.detectChanges();
      component.toggleDividends();
      expect(mockSessionStorage.updateIncome).toHaveBeenCalled();
      expect(component.hasDividends()).toBe(true);
    });

    it('should toggle 1099-K income when clicked', () => {
      fixture.detectChanges();
      component.toggle1099K();
      expect(mockSessionStorage.updateIncome).toHaveBeenCalled();
      expect(component.has1099K()).toBe(true);
    });

    it('should show selected state when W-2 is selected', () => {
      taxReturnSignal.set(setupTaxReturn({ hasW2Income: true }));
      fixture.detectChanges();

      const selectedOption = fixture.nativeElement.querySelector('.income-option.selected');
      expect(selectedOption).toBeTruthy();
    });
  });

  describe('hasAnyIncome', () => {
    it('should return false when no income selected', () => {
      fixture.detectChanges();
      expect(component.hasAnyIncome()).toBe(false);
    });

    it('should return true when W-2 is selected', () => {
      taxReturnSignal.set(setupTaxReturn({ hasW2Income: true }));
      fixture.detectChanges();
      expect(component.hasAnyIncome()).toBe(true);
    });

    it('should return true when 1099 is selected', () => {
      taxReturnSignal.set(setupTaxReturn({ has1099Income: true }));
      fixture.detectChanges();
      expect(component.hasAnyIncome()).toBe(true);
    });

    it('should return true when multiple income types selected', () => {
      taxReturnSignal.set(setupTaxReturn({
        hasW2Income: true,
        hasInterestIncome: true,
      }));
      fixture.detectChanges();
      expect(component.hasAnyIncome()).toBe(true);
    });
  });

  describe('navigation', () => {
    it('should navigate to W-2 entry when W-2 selected on continue', () => {
      taxReturnSignal.set(setupTaxReturn({ hasW2Income: true }));
      fixture.detectChanges();

      component.onContinue();
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/income/w2');
    });

    it('should navigate to 1099 entry when only 1099 selected on continue', () => {
      taxReturnSignal.set(setupTaxReturn({ has1099Income: true }));
      fixture.detectChanges();

      component.onContinue();
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/income/1099');
    });

    it('should navigate to 1099-INT entry when only interest selected on continue', () => {
      taxReturnSignal.set(setupTaxReturn({ hasInterestIncome: true }));
      fixture.detectChanges();

      component.onContinue();
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/income/1099-int');
    });

    it('should navigate to 1099-DIV entry when only dividends selected on continue', () => {
      taxReturnSignal.set(setupTaxReturn({ hasDividendIncome: true }));
      fixture.detectChanges();

      component.onContinue();
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/income/1099-div');
    });

    it('should navigate to 1099-K entry when only 1099-K selected on continue', () => {
      taxReturnSignal.set(setupTaxReturn({ has1099KIncome: true }));
      fixture.detectChanges();

      component.onContinue();
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/income/1099-k');
    });

    it('should navigate back to dependent-status on back', () => {
      fixture.detectChanges();
      component.onBack();
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/personal-info/dependent-status');
    });
  });

  describe('continue button', () => {
    it('should be disabled when no income selected', () => {
      fixture.detectChanges();
      const continueBtn = fixture.nativeElement.querySelector('app-continue-button');
      expect(continueBtn.getAttribute('ng-reflect-disabled')).toBe('true');
    });

    it('should be enabled when income is selected', () => {
      taxReturnSignal.set(setupTaxReturn({ hasW2Income: true }));
      fixture.detectChanges();
      const continueBtn = fixture.nativeElement.querySelector('app-continue-button');
      expect(continueBtn.getAttribute('ng-reflect-disabled')).toBe('false');
    });
  });
});
