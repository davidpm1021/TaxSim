import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StateSelectionComponent } from './state-selection.component';
import { NavigationService, SessionStorageService, SECTIONS } from '@core/services';
import { signal, WritableSignal } from '@angular/core';
import { TaxReturn, createEmptyTaxReturn, StateCode } from '@core/models';

describe('StateSelectionComponent', () => {
  let component: StateSelectionComponent;
  let fixture: ComponentFixture<StateSelectionComponent>;
  let mockNavigation: Partial<NavigationService>;
  let mockSessionStorage: Partial<SessionStorageService>;
  let taxReturnSignal: WritableSignal<TaxReturn>;

  const setupTaxReturn = (overrides: Partial<{
    residenceState: StateCode | null;
    workState: StateCode | null;
    stateWithholding: number;
  }> = {}): TaxReturn => {
    const taxReturn = createEmptyTaxReturn();
    taxReturn.stateInfo.residenceState = overrides.residenceState ?? null;
    taxReturn.stateInfo.workState = overrides.workState ?? null;
    taxReturn.stateInfo.stateWithholding = overrides.stateWithholding ?? 0;
    return taxReturn;
  };

  beforeEach(async () => {
    taxReturnSignal = signal(setupTaxReturn());

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
      updateStateInfo: jest.fn((updater) => {
        const current = taxReturnSignal();
        taxReturnSignal.set({
          ...current,
          stateInfo: updater(current.stateInfo),
        });
      }),
    };

    await TestBed.configureTestingModule({
      imports: [StateSelectionComponent],
      providers: [
        { provide: NavigationService, useValue: mockNavigation },
        { provide: SessionStorageService, useValue: mockSessionStorage },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StateSelectionComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display page title', () => {
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('h2');
    expect(title.textContent).toContain('State Information');
  });

  it('should display residence state section', () => {
    fixture.detectChanges();
    const content = fixture.nativeElement.textContent;
    expect(content).toContain('Where do you live?');
  });

  it('should display work state section', () => {
    fixture.detectChanges();
    const content = fixture.nativeElement.textContent;
    expect(content).toContain('Where do you work?');
  });

  it('should display state dropdown', () => {
    fixture.detectChanges();
    const select = fixture.nativeElement.querySelector('#residenceState');
    expect(select).toBeTruthy();
  });

  it('should display same as residence checkbox', () => {
    fixture.detectChanges();
    const checkbox = fixture.nativeElement.querySelector('#sameAsResidence');
    expect(checkbox).toBeTruthy();
  });

  it('should display educational note', () => {
    fixture.detectChanges();
    const content = fixture.nativeElement.textContent;
    expect(content).toContain('Why does state matter?');
  });

  describe('initial state', () => {
    it('should have sameAsResidence checked by default', () => {
      fixture.detectChanges();
      expect(component.sameAsResidence()).toBe(true);
    });

    it('should not allow continue without selecting residence state', () => {
      fixture.detectChanges();
      expect(component.canContinue()).toBe(false);
    });
  });

  describe('state selection', () => {
    it('should update residence state', () => {
      fixture.detectChanges();
      component.updateResidenceState('CA');
      expect(mockSessionStorage.updateStateInfo).toHaveBeenCalled();
    });

    it('should update work state to match residence when sameAsResidence is true', () => {
      fixture.detectChanges();
      component.updateResidenceState('CA');

      const taxReturn = taxReturnSignal();
      expect(taxReturn.stateInfo.workState).toBe('CA');
    });

    it('should allow different work state when sameAsResidence is false', () => {
      fixture.detectChanges();
      component.toggleSameAsResidence({ target: { checked: false } } as any);
      component.updateResidenceState('CA');
      component.updateWorkState('NY');

      expect(mockSessionStorage.updateStateInfo).toHaveBeenCalled();
    });

    it('should enable continue after selecting residence state', () => {
      fixture.detectChanges();
      component.updateResidenceState('TX');
      fixture.detectChanges();

      expect(component.canContinue()).toBe(true);
    });
  });

  describe('state info display', () => {
    it('should show no income tax message for Texas', () => {
      taxReturnSignal.set(setupTaxReturn({ residenceState: 'TX' }));
      fixture.detectChanges();

      // Texas has no income tax
      expect(component.residenceStateInfo()?.hasIncomeTax).toBe(false);
    });

    it('should show progressive tax info for California', () => {
      taxReturnSignal.set(setupTaxReturn({ residenceState: 'CA' }));
      fixture.detectChanges();

      expect(component.residenceStateInfo()?.hasIncomeTax).toBe(true);
      expect(component.residenceStateInfo()?.taxType).toBe('progressive');
    });

    it('should show flat tax info for Illinois', () => {
      taxReturnSignal.set(setupTaxReturn({ residenceState: 'IL' }));
      fixture.detectChanges();

      expect(component.residenceStateInfo()?.hasIncomeTax).toBe(true);
      expect(component.residenceStateInfo()?.taxType).toBe('flat');
    });
  });

  describe('withholding', () => {
    it('should show withholding input when state has income tax', () => {
      taxReturnSignal.set(setupTaxReturn({ residenceState: 'CA' }));
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('#stateWithholding');
      expect(input).toBeTruthy();
    });

    it('should update state withholding', () => {
      taxReturnSignal.set(setupTaxReturn({ residenceState: 'CA' }));
      fixture.detectChanges();

      component.updateStateWithholding(500);
      expect(mockSessionStorage.updateStateInfo).toHaveBeenCalled();
    });
  });

  describe('navigation', () => {
    it('should navigate to income/types on continue', () => {
      taxReturnSignal.set(setupTaxReturn({ residenceState: 'CA' }));
      fixture.detectChanges();

      component.onContinue();
      expect(mockNavigation.completeSection).toHaveBeenCalledWith('personal-info');
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/income/types');
    });

    it('should navigate back to dependents', () => {
      fixture.detectChanges();
      component.goBack();
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/personal-info/dependents');
    });
  });
});
