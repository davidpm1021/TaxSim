import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DependentsComponent } from './dependents.component';
import { NavigationService, SessionStorageService, ValidationService, SECTIONS } from '@core/services';
import { signal, WritableSignal } from '@angular/core';
import { TaxReturn, createEmptyTaxReturn, Dependent } from '@core/models';

describe('DependentsComponent', () => {
  let component: DependentsComponent;
  let fixture: ComponentFixture<DependentsComponent>;
  let mockNavigation: Partial<NavigationService>;
  let mockSessionStorage: Partial<SessionStorageService>;
  let mockValidation: Partial<ValidationService>;
  let taxReturnSignal: WritableSignal<TaxReturn>;

  const createDependent = (overrides: Partial<Dependent> = {}): Dependent => ({
    id: overrides.id ?? crypto.randomUUID(),
    firstName: overrides.firstName ?? '',
    relationship: overrides.relationship ?? 'child',
    age: overrides.age ?? 0,
    livedWithFiler: overrides.livedWithFiler ?? true,
  });

  const setupTaxReturn = (overrides: Partial<{
    hasDependents: boolean;
    dependents: Dependent[];
  }> = {}): TaxReturn => {
    const taxReturn = createEmptyTaxReturn();
    taxReturn.personalInfo.hasDependents = overrides.hasDependents ?? false;
    taxReturn.personalInfo.dependents = overrides.dependents ?? [];
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
      validateAge: jest.fn((age: number) => ({
        isValid: age >= 0 && age <= 120,
        error: age >= 0 && age <= 120 ? null : 'Enter a valid age (0-120)',
      })),
    };

    await TestBed.configureTestingModule({
      imports: [DependentsComponent],
      providers: [
        { provide: NavigationService, useValue: mockNavigation },
        { provide: SessionStorageService, useValue: mockSessionStorage },
        { provide: ValidationService, useValue: mockValidation },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DependentsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display page title', () => {
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('h1');
    expect(title.textContent).toContain('Do you have dependents to claim?');
  });

  it('should display help trigger', () => {
    fixture.detectChanges();
    const helpTrigger = fixture.nativeElement.querySelector('.help-trigger');
    expect(helpTrigger.textContent).toContain('Who qualifies?');
  });

  it('should display Yes option', () => {
    fixture.detectChanges();
    const content = fixture.nativeElement.textContent;
    expect(content).toContain('Yes, I have dependents');
  });

  it('should display No option', () => {
    fixture.detectChanges();
    const content = fixture.nativeElement.textContent;
    expect(content).toContain("No, I don't have dependents");
  });

  describe('initial state', () => {
    it('should show options when no selection made', () => {
      fixture.detectChanges();
      const options = fixture.nativeElement.querySelectorAll('.option');
      expect(options.length).toBe(2);
    });
  });

  describe('selection', () => {
    it('should set hasDependents to true when Yes clicked', () => {
      fixture.detectChanges();
      component.setHasDependents(true);
      expect(mockSessionStorage.updatePersonalInfo).toHaveBeenCalled();
    });

    it('should set hasDependents to false when No clicked', () => {
      fixture.detectChanges();
      component.setHasDependents(false);
      expect(mockSessionStorage.updatePersonalInfo).toHaveBeenCalled();
    });

    it('should add an empty dependent when Yes is selected', () => {
      fixture.detectChanges();
      component.setHasDependents(true);

      const taxReturn = taxReturnSignal();
      expect(taxReturn.personalInfo.dependents.length).toBe(1);
    });
  });

  describe('dependent management', () => {
    beforeEach(() => {
      taxReturnSignal.set(setupTaxReturn({
        hasDependents: true,
        dependents: [createDependent({ id: '1', firstName: 'Child1', age: 10 })],
      }));
    });

    it('should display dependent card when hasDependents is true', () => {
      fixture.detectChanges();
      const card = fixture.nativeElement.querySelector('.dependent-card');
      expect(card).toBeTruthy();
    });

    it('should display dependent number', () => {
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Dependent 1');
    });

    it('should display Add Another Dependent button', () => {
      fixture.detectChanges();
      const addBtn = fixture.nativeElement.querySelector('.add-btn');
      expect(addBtn.textContent).toContain('Add Another Dependent');
    });

    it('should add another dependent when button clicked', () => {
      fixture.detectChanges();
      component.addDependent();

      const taxReturn = taxReturnSignal();
      expect(taxReturn.personalInfo.dependents.length).toBe(2);
    });

    it('should remove dependent when remove button clicked', () => {
      fixture.detectChanges();
      component.removeDependent('1');

      const taxReturn = taxReturnSignal();
      expect(taxReturn.personalInfo.dependents.length).toBe(0);
    });

    it('should update dependent field', () => {
      fixture.detectChanges();
      component.updateDependent('1', 'firstName', 'Updated Name');

      const taxReturn = taxReturnSignal();
      expect(taxReturn.personalInfo.dependents[0].firstName).toBe('Updated Name');
    });
  });

  describe('validation', () => {
    it('should allow continue when hasDependents is false', () => {
      taxReturnSignal.set(setupTaxReturn({ hasDependents: false }));
      fixture.detectChanges();
      expect(component.canContinue()).toBe(true);
    });

    it('should not allow continue when hasDependents is true but no dependents added', () => {
      taxReturnSignal.set(setupTaxReturn({ hasDependents: true, dependents: [] }));
      fixture.detectChanges();
      expect(component.canContinue()).toBe(false);
    });

    it('should not allow continue when dependent has empty name', () => {
      taxReturnSignal.set(setupTaxReturn({
        hasDependents: true,
        dependents: [createDependent({ firstName: '', age: 10 })],
      }));
      fixture.detectChanges();
      expect(component.canContinue()).toBe(false);
    });

    it('should allow continue when dependent is valid', () => {
      taxReturnSignal.set(setupTaxReturn({
        hasDependents: true,
        dependents: [createDependent({ firstName: 'Child', age: 10 })],
      }));
      fixture.detectChanges();
      expect(component.canContinue()).toBe(true);
    });
  });

  describe('navigation', () => {
    it('should navigate to state selection on continue', () => {
      taxReturnSignal.set(setupTaxReturn({ hasDependents: false }));
      fixture.detectChanges();

      component.onContinue();
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/personal-info/state');
    });

    it('should navigate back to dependent-status', () => {
      fixture.detectChanges();
      component.onBack();
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/personal-info/dependent-status');
    });
  });
});
