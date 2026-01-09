import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BasicInfoComponent } from './basic-info.component';
import { NavigationService, SessionStorageService, ValidationService, SECTIONS } from '@core/services';
import { signal, WritableSignal } from '@angular/core';
import { TaxReturn, createEmptyTaxReturn } from '@core/models';

describe('BasicInfoComponent', () => {
  let component: BasicInfoComponent;
  let fixture: ComponentFixture<BasicInfoComponent>;
  let mockNavigation: Partial<NavigationService>;
  let mockSessionStorage: Partial<SessionStorageService>;
  let mockValidation: Partial<ValidationService>;
  let taxReturnSignal: WritableSignal<TaxReturn>;

  const setupTaxReturn = (overrides: Partial<{
    firstName: string;
    lastName: string;
    dateOfBirth: string;
  }> = {}): TaxReturn => {
    const taxReturn = createEmptyTaxReturn();
    taxReturn.personalInfo.firstName = overrides.firstName ?? '';
    taxReturn.personalInfo.lastName = overrides.lastName ?? '';
    taxReturn.personalInfo.dateOfBirth = overrides.dateOfBirth ?? '';
    return taxReturn;
  };

  beforeEach(async () => {
    taxReturnSignal = signal(setupTaxReturn());

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

    mockValidation = {
      validateRequired: jest.fn((value: string, fieldName: string) => ({
        isValid: value.trim().length > 0,
        error: value.trim().length > 0 ? null : `${fieldName} is required`,
      })),
      validateDateNotFuture: jest.fn((value: string, fieldName: string) => {
        if (!value) return { isValid: false, error: `${fieldName} is required` };
        const date = new Date(value);
        const now = new Date();
        if (date > now) return { isValid: false, error: `${fieldName} cannot be in the future` };
        return { isValid: true, error: null };
      }),
    };

    await TestBed.configureTestingModule({
      imports: [BasicInfoComponent],
      providers: [
        { provide: NavigationService, useValue: mockNavigation },
        { provide: SessionStorageService, useValue: mockSessionStorage },
        { provide: ValidationService, useValue: mockValidation },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BasicInfoComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display page title', () => {
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('h1');
    expect(title.textContent).toContain("Let's get some basic information");
  });

  it('should display simulation badge', () => {
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('.simulation-badge');
    expect(badge.textContent).toContain('fictional info');
  });

  it('should display first name input', () => {
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('#firstName');
    expect(input).toBeTruthy();
  });

  it('should display last name input', () => {
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('#lastName');
    expect(input).toBeTruthy();
  });

  it('should display date of birth input', () => {
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('#dateOfBirth');
    expect(input).toBeTruthy();
  });

  describe('form updates', () => {
    it('should update first name on input', () => {
      fixture.detectChanges();
      component.updateFirstName('John');
      expect(mockSessionStorage.updatePersonalInfo).toHaveBeenCalled();
    });

    it('should update last name on input', () => {
      fixture.detectChanges();
      component.updateLastName('Doe');
      expect(mockSessionStorage.updatePersonalInfo).toHaveBeenCalled();
    });

    it('should update date of birth on input', () => {
      fixture.detectChanges();
      component.updateDateOfBirth('2000-01-15');
      expect(mockSessionStorage.updatePersonalInfo).toHaveBeenCalled();
    });
  });

  describe('validation', () => {
    it('should be invalid when all fields are empty', () => {
      fixture.detectChanges();
      expect(component.isValid()).toBe(false);
    });

    it('should be valid when all fields are filled correctly', () => {
      taxReturnSignal.set(setupTaxReturn({
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '2000-01-15',
      }));
      fixture.detectChanges();
      expect(component.isValid()).toBe(true);
    });

    it('should be invalid when first name is empty', () => {
      taxReturnSignal.set(setupTaxReturn({
        firstName: '',
        lastName: 'Doe',
        dateOfBirth: '2000-01-15',
      }));
      fixture.detectChanges();
      expect(component.isValid()).toBe(false);
    });

    it('should be invalid when last name is empty', () => {
      taxReturnSignal.set(setupTaxReturn({
        firstName: 'John',
        lastName: '',
        dateOfBirth: '2000-01-15',
      }));
      fixture.detectChanges();
      expect(component.isValid()).toBe(false);
    });

    it('should track touched fields on blur', () => {
      fixture.detectChanges();
      component.touchField('firstName');
      // After touching, validation should be triggered
      expect(component.firstNameError()).toBe('First name is required');
    });
  });

  describe('navigation', () => {
    it('should navigate to dependent-status on continue when valid', () => {
      taxReturnSignal.set(setupTaxReturn({
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '2000-01-15',
      }));
      fixture.detectChanges();

      component.onContinue();
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/personal-info/dependent-status');
    });

    it('should not navigate when form is invalid', () => {
      fixture.detectChanges();
      component.onContinue();
      expect(mockNavigation.navigateTo).not.toHaveBeenCalled();
    });

    it('should navigate back to filing-status', () => {
      fixture.detectChanges();
      component.onBack();
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/personal-info/filing-status');
    });
  });

  describe('visibility', () => {
    it('should have isVisible signal initialized to false', () => {
      expect(component.isVisible()).toBe(false);
    });
  });
});
