import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudentProfileComponent } from './student-profile.component';
import { NavigationService, SessionStorageService } from '@core/services';
import { signal, WritableSignal } from '@angular/core';
import { TaxReturn, createEmptyTaxReturn } from '@core/models';

describe('StudentProfileComponent', () => {
  let component: StudentProfileComponent;
  let fixture: ComponentFixture<StudentProfileComponent>;
  let mockNavigation: Partial<NavigationService>;
  let mockSessionStorage: Partial<SessionStorageService>;
  let taxReturnSignal: WritableSignal<TaxReturn>;

  beforeEach(async () => {
    taxReturnSignal = signal(createEmptyTaxReturn());

    mockNavigation = {
      navigateTo: jest.fn(),
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
      imports: [StudentProfileComponent],
      providers: [
        { provide: NavigationService, useValue: mockNavigation },
        { provide: SessionStorageService, useValue: mockSessionStorage },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentProfileComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display page title', () => {
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('h1');
    expect(title.textContent).toContain('Tell us about yourself');
  });

  it('should display subtitle', () => {
    fixture.detectChanges();
    const subtitle = fixture.nativeElement.querySelector('.subtitle');
    expect(subtitle.textContent).toContain('customize your tax filing experience');
  });

  it('should display three student type options', () => {
    fixture.detectChanges();
    const options = fixture.nativeElement.querySelectorAll('.option-card');
    expect(options.length).toBe(3);
  });

  it('should display High School Student option', () => {
    fixture.detectChanges();
    const content = fixture.nativeElement.textContent;
    expect(content).toContain('High School Student');
  });

  it('should display College Student option', () => {
    fixture.detectChanges();
    const content = fixture.nativeElement.textContent;
    expect(content).toContain('College Student');
  });

  it('should display Working Adult option', () => {
    fixture.detectChanges();
    const content = fixture.nativeElement.textContent;
    expect(content).toContain('Working Adult');
  });

  it('should have continue button enabled when type is selected', () => {
    // Default studentType is 'high-school', so button should be enabled
    fixture.detectChanges();
    const continueBtn = fixture.nativeElement.querySelector('.continue-btn');
    expect(continueBtn.disabled).toBe(false);
  });

  describe('visibility signals', () => {
    it('should have contentVisible signal initialized to false', () => {
      expect(component.contentVisible()).toBe(false);
    });
  });

  describe('selection', () => {
    it('should select high-school type when clicked', () => {
      fixture.detectChanges();
      component.selectType('high-school');
      fixture.detectChanges();

      expect(mockSessionStorage.updatePersonalInfo).toHaveBeenCalled();
      expect(component.selectedType()).toBe('high-school');
    });

    it('should select college type when clicked', () => {
      fixture.detectChanges();
      component.selectType('college');
      fixture.detectChanges();

      expect(component.selectedType()).toBe('college');
    });

    it('should select working-adult type when clicked', () => {
      fixture.detectChanges();
      component.selectType('working-adult');
      fixture.detectChanges();

      expect(component.selectedType()).toBe('working-adult');
    });

    it('should set isInCollege true for college type', () => {
      fixture.detectChanges();
      component.selectType('college');

      const taxReturn = taxReturnSignal();
      expect(taxReturn.personalInfo.studentProfile.isInCollege).toBe(true);
    });

    it('should set hasStudentLoans true for college type', () => {
      fixture.detectChanges();
      component.selectType('college');

      const taxReturn = taxReturnSignal();
      expect(taxReturn.personalInfo.studentProfile.hasStudentLoans).toBe(true);
    });

    it('should set hasStudentLoans true for working-adult type', () => {
      fixture.detectChanges();
      component.selectType('working-adult');

      const taxReturn = taxReturnSignal();
      expect(taxReturn.personalInfo.studentProfile.hasStudentLoans).toBe(true);
    });

    it('should enable continue button after selection', () => {
      fixture.detectChanges();
      component.selectType('high-school');
      fixture.detectChanges();

      const continueBtn = fixture.nativeElement.querySelector('.continue-btn');
      expect(continueBtn.disabled).toBe(false);
    });

    it('should show checkmark on selected option', () => {
      fixture.detectChanges();
      component.selectType('college');
      fixture.detectChanges();

      const selectedCard = fixture.nativeElement.querySelector('.option-card.selected');
      expect(selectedCard).toBeTruthy();
      const check = selectedCard.querySelector('.check');
      expect(check).toBeTruthy();
    });
  });

  describe('navigation', () => {
    it('should navigate to documents on continue', () => {
      fixture.detectChanges();
      component.selectType('high-school');
      fixture.detectChanges();

      component.onContinue();
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/welcome/documents');
    });

    it('should navigate when continue button clicked', () => {
      fixture.detectChanges();
      component.selectType('college');
      fixture.detectChanges();

      const continueBtn = fixture.nativeElement.querySelector('.continue-btn');
      continueBtn.click();
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/welcome/documents');
    });
  });
});
