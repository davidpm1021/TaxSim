import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilingStatusComponent } from './filing-status.component';
import { NavigationService, SessionStorageService, TaxDataService, SECTIONS } from '@core/services';
import { signal, WritableSignal } from '@angular/core';
import { TaxReturn, createEmptyTaxReturn } from '@core/models';

describe('FilingStatusComponent', () => {
  let component: FilingStatusComponent;
  let fixture: ComponentFixture<FilingStatusComponent>;
  let mockNavigation: Partial<NavigationService>;
  let mockSessionStorage: Partial<SessionStorageService>;
  let mockTaxData: Partial<TaxDataService>;
  let taxReturnSignal: WritableSignal<TaxReturn>;

  beforeEach(async () => {
    taxReturnSignal = signal(createEmptyTaxReturn());

    mockNavigation = {
      navigateTo: jest.fn(),
      currentSection: signal(SECTIONS[1]),
      currentSectionIndex: signal(1),
      getSectionStatus: jest.fn(() => 'current' as const),
      navigateToSection: jest.fn(),
    };

    mockSessionStorage = {
      taxReturn: taxReturnSignal,
      updatePersonalInfo: jest.fn((updater) => {
        const current = taxReturnSignal();
        taxReturnSignal.set({
          ...current,
          personalInfo: updater(current.personalInfo),
        });
      }),
    };

    mockTaxData = {
      getFilingStatusOptions: jest.fn(() => [
        { value: 'single' as const, label: 'Single', standardDeduction: 15750 },
        { value: 'married-jointly' as const, label: 'Married Filing Jointly', standardDeduction: 31500 },
        { value: 'head-of-household' as const, label: 'Head of Household', standardDeduction: 23625 },
      ]),
      formatCurrency: jest.fn((amount: number) => `$${amount.toLocaleString()}`),
    };

    await TestBed.configureTestingModule({
      imports: [FilingStatusComponent],
      providers: [
        { provide: NavigationService, useValue: mockNavigation },
        { provide: SessionStorageService, useValue: mockSessionStorage },
        { provide: TaxDataService, useValue: mockTaxData },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FilingStatusComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display page title', () => {
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('h1');
    expect(title.textContent).toContain("What's your filing status?");
  });

  it('should display step indicator', () => {
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('.header-badge');
    expect(badge.textContent).toContain('Step 1 of 6');
  });

  it('should display three filing status options', () => {
    fixture.detectChanges();
    const cards = fixture.nativeElement.querySelectorAll('.filing-card');
    expect(cards.length).toBe(3);
  });

  it('should display Single option', () => {
    fixture.detectChanges();
    const content = fixture.nativeElement.textContent;
    expect(content).toContain('Single');
    expect(content).toContain('Unmarried or legally separated');
  });

  it('should display Married Filing Jointly option', () => {
    fixture.detectChanges();
    const content = fixture.nativeElement.textContent;
    expect(content).toContain('Married Filing Jointly');
    expect(content).toContain('Married, filing together');
  });

  it('should display Head of Household option', () => {
    fixture.detectChanges();
    const content = fixture.nativeElement.textContent;
    expect(content).toContain('Head of Household');
    expect(content).toContain('Unmarried with dependents');
  });

  it('should display standard deduction amounts', () => {
    fixture.detectChanges();
    expect(mockTaxData.formatCurrency).toHaveBeenCalledWith(15750);
    expect(mockTaxData.formatCurrency).toHaveBeenCalledWith(31500);
    expect(mockTaxData.formatCurrency).toHaveBeenCalledWith(23625);
  });

  it('should display help link', () => {
    fixture.detectChanges();
    const helpLink = fixture.nativeElement.querySelector('.help-link');
    expect(helpLink.textContent).toContain('Not sure which to choose?');
  });

  describe('selection', () => {
    it('should select single status when clicked', () => {
      fixture.detectChanges();
      component.selectStatus('single');
      fixture.detectChanges();

      expect(mockSessionStorage.updatePersonalInfo).toHaveBeenCalled();
      expect(component.selectedStatus()).toBe('single');
    });

    it('should select married-jointly status when clicked', () => {
      fixture.detectChanges();
      component.selectStatus('married-jointly');
      fixture.detectChanges();

      expect(component.selectedStatus()).toBe('married-jointly');
    });

    it('should select head-of-household status when clicked', () => {
      fixture.detectChanges();
      component.selectStatus('head-of-household');
      fixture.detectChanges();

      expect(component.selectedStatus()).toBe('head-of-household');
    });

    it('should show selected state on card', () => {
      fixture.detectChanges();
      component.selectStatus('single');
      fixture.detectChanges();

      const selectedCard = fixture.nativeElement.querySelector('.filing-card.selected');
      expect(selectedCard).toBeTruthy();
    });
  });

  describe('navigation', () => {
    it('should navigate to basic-info on continue', () => {
      fixture.detectChanges();
      component.selectStatus('single');
      fixture.detectChanges();

      component.onContinue();
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/personal-info/basic-info');
    });

    it('should have continue button disabled when no status selected', () => {
      // Reset to empty state
      const emptyReturn = createEmptyTaxReturn();
      emptyReturn.personalInfo.filingStatus = null as any;
      taxReturnSignal.set(emptyReturn);
      fixture.detectChanges();

      const continueBtn = fixture.nativeElement.querySelector('app-continue-button');
      expect(continueBtn.getAttribute('ng-reflect-disabled')).toBe('true');
    });
  });

  describe('visibility', () => {
    it('should have isVisible signal initialized to false', () => {
      expect(component.isVisible()).toBe(false);
    });
  });

  describe('formatCurrency', () => {
    it('should call taxData.formatCurrency', () => {
      fixture.detectChanges();
      component.formatCurrency(15000);
      expect(mockTaxData.formatCurrency).toHaveBeenCalledWith(15000);
    });
  });
});
