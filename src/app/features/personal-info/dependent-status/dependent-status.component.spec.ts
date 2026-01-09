import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DependentStatusComponent } from './dependent-status.component';
import { NavigationService, SessionStorageService, SECTIONS } from '@core/services';
import { signal, WritableSignal } from '@angular/core';
import { TaxReturn, createEmptyTaxReturn } from '@core/models';

describe('DependentStatusComponent', () => {
  let component: DependentStatusComponent;
  let fixture: ComponentFixture<DependentStatusComponent>;
  let mockNavigation: Partial<NavigationService>;
  let mockSessionStorage: Partial<SessionStorageService>;
  let taxReturnSignal: WritableSignal<TaxReturn>;

  const setupTaxReturn = (overrides: Partial<{ firstName: string; claimedAsDependent: boolean }> = {}): TaxReturn => {
    const taxReturn = createEmptyTaxReturn();
    if (overrides.firstName !== undefined) {
      taxReturn.personalInfo.firstName = overrides.firstName;
    }
    if (overrides.claimedAsDependent !== undefined) {
      taxReturn.personalInfo.claimedAsDependent = overrides.claimedAsDependent;
    }
    return taxReturn;
  };

  beforeEach(async () => {
    taxReturnSignal = signal(createEmptyTaxReturn());

    mockNavigation = {
      navigateTo: jest.fn(),
      completeSection: jest.fn(),
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

    await TestBed.configureTestingModule({
      imports: [DependentStatusComponent],
      providers: [
        { provide: NavigationService, useValue: mockNavigation },
        { provide: SessionStorageService, useValue: mockSessionStorage },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DependentStatusComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display page title', () => {
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('h1');
    expect(title.textContent).toContain('Can someone claim you as a dependent?');
  });

  it('should display help trigger', () => {
    fixture.detectChanges();
    const helpTrigger = fixture.nativeElement.querySelector('.help-trigger');
    expect(helpTrigger.textContent).toContain('What does this mean?');
  });

  it('should display Yes option', () => {
    fixture.detectChanges();
    const content = fixture.nativeElement.textContent;
    expect(content).toContain('Yes');
    expect(content).toContain('can claim me on their tax return');
  });

  it('should display No option', () => {
    fixture.detectChanges();
    const content = fixture.nativeElement.textContent;
    expect(content).toContain('No');
    expect(content).toContain('No one else can claim me');
  });

  describe('initial state', () => {
    it('should return null for claimedAsDependent when no selection made', () => {
      fixture.detectChanges();
      // Default state: firstName is empty and claimedAsDependent is false
      expect(component.claimedAsDependent()).toBeNull();
    });

    it('should have continue button disabled initially', () => {
      fixture.detectChanges();
      const continueBtn = fixture.nativeElement.querySelector('app-continue-button');
      expect(continueBtn.getAttribute('ng-reflect-disabled')).toBe('true');
    });
  });

  describe('selection', () => {
    it('should select Yes when clicked', () => {
      fixture.detectChanges();
      component.setClaimedAsDependent(true);
      fixture.detectChanges();

      expect(mockSessionStorage.updatePersonalInfo).toHaveBeenCalled();
    });

    it('should select No when clicked', () => {
      fixture.detectChanges();
      component.setClaimedAsDependent(false);
      fixture.detectChanges();

      expect(mockSessionStorage.updatePersonalInfo).toHaveBeenCalled();
    });

    it('should show selected state on Yes option', () => {
      taxReturnSignal.set(setupTaxReturn({ firstName: 'John', claimedAsDependent: true }));
      fixture.detectChanges();

      const selectedOption = fixture.nativeElement.querySelector('.option.selected');
      expect(selectedOption).toBeTruthy();
      expect(selectedOption.textContent).toContain('Yes');
    });

    it('should show selected state on No option', () => {
      taxReturnSignal.set(setupTaxReturn({ firstName: 'John', claimedAsDependent: false }));
      fixture.detectChanges();

      const selectedOption = fixture.nativeElement.querySelector('.option.selected');
      expect(selectedOption).toBeTruthy();
      expect(selectedOption.textContent).toContain('No');
    });
  });

  describe('navigation', () => {
    it('should navigate to income/types when claimed as dependent', () => {
      taxReturnSignal.set(setupTaxReturn({ firstName: 'John', claimedAsDependent: true }));
      fixture.detectChanges();

      component.onContinue();
      expect(mockNavigation.completeSection).toHaveBeenCalledWith('personal-info');
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/income/types');
    });

    it('should navigate to dependents when NOT claimed as dependent', () => {
      taxReturnSignal.set(setupTaxReturn({ firstName: 'John', claimedAsDependent: false }));
      fixture.detectChanges();

      component.onContinue();
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/personal-info/dependents');
    });

    it('should navigate back to basic-info', () => {
      fixture.detectChanges();
      component.onBack();
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/personal-info/basic-info');
    });
  });
});
