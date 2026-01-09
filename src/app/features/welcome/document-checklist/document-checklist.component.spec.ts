import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DocumentChecklistComponent } from './document-checklist.component';
import { NavigationService, SessionStorageService } from '@core/services';
import { signal, WritableSignal } from '@angular/core';
import { TaxReturn, createEmptyTaxReturn } from '@core/models';

describe('DocumentChecklistComponent', () => {
  let component: DocumentChecklistComponent;
  let fixture: ComponentFixture<DocumentChecklistComponent>;
  let mockNavigation: Partial<NavigationService>;
  let mockSessionStorage: Partial<SessionStorageService>;
  let taxReturnSignal: WritableSignal<TaxReturn>;

  const setupTaxReturn = (studentType: 'high-school' | 'college' | 'working-adult' = 'high-school'): TaxReturn => {
    const taxReturn = createEmptyTaxReturn();
    taxReturn.personalInfo.studentProfile.studentType = studentType;
    return taxReturn;
  };

  beforeEach(async () => {
    taxReturnSignal = signal(setupTaxReturn());

    mockNavigation = {
      navigateTo: jest.fn(),
      completeSection: jest.fn(),
    };

    mockSessionStorage = {
      taxReturn: taxReturnSignal,
    };

    await TestBed.configureTestingModule({
      imports: [DocumentChecklistComponent],
      providers: [
        { provide: NavigationService, useValue: mockNavigation },
        { provide: SessionStorageService, useValue: mockSessionStorage },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentChecklistComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display page title', () => {
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('h1');
    expect(title.textContent).toContain('Gather Your Documents');
  });

  it('should display header icon', () => {
    fixture.detectChanges();
    const icon = fixture.nativeElement.querySelector('.header-icon');
    expect(icon.textContent).toContain('📋');
  });

  describe('visibility signals', () => {
    it('should have contentVisible signal initialized to false', () => {
      expect(component.contentVisible()).toBe(false);
    });
  });

  describe('high school student', () => {
    beforeEach(() => {
      taxReturnSignal.set(setupTaxReturn('high-school'));
    });

    it('should display high school specific subtitle', () => {
      fixture.detectChanges();
      const subtitle = fixture.nativeElement.querySelector('.subtitle');
      expect(subtitle.textContent).toContain('high school student');
      expect(subtitle.textContent).toContain('just need a few items');
    });

    it('should display W-2 document', () => {
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('W-2 Form');
    });

    it('should display 1099-NEC document', () => {
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('1099-NEC Form');
    });

    it('should display 1099-INT document', () => {
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('1099-INT Form');
    });

    it('should NOT display education documents section', () => {
      fixture.detectChanges();
      expect(component.educationDocuments().length).toBe(0);
    });

    it('should NOT display 1099-DIV document', () => {
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).not.toContain('1099-DIV Form');
    });
  });

  describe('college student', () => {
    beforeEach(() => {
      taxReturnSignal.set(setupTaxReturn('college'));
    });

    it('should display college specific subtitle', () => {
      fixture.detectChanges();
      const subtitle = fixture.nativeElement.querySelector('.subtitle');
      expect(subtitle.textContent).toContain('college student');
      expect(subtitle.textContent).toContain('education-related forms');
    });

    it('should display 1098-T document', () => {
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('1098-T Form');
    });

    it('should display 1098-E document', () => {
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('1098-E Form');
    });

    it('should display Scholarship Letters', () => {
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Scholarship Letters');
    });

    it('should display 1099-DIV document', () => {
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('1099-DIV Form');
    });

    it('should display 1099-K document', () => {
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('1099-K Form');
    });

    it('should have education documents section', () => {
      fixture.detectChanges();
      expect(component.educationDocuments().length).toBeGreaterThan(0);
    });
  });

  describe('working adult', () => {
    beforeEach(() => {
      taxReturnSignal.set(setupTaxReturn('working-adult'));
    });

    it('should display working adult specific subtitle', () => {
      fixture.detectChanges();
      const subtitle = fixture.nativeElement.querySelector('.subtitle');
      expect(subtitle.textContent).toContain('working adult');
      expect(subtitle.textContent).toContain('several income sources');
    });

    it('should display 1098-E document but NOT 1098-T', () => {
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('1098-E Form');
      expect(content).not.toContain('1098-T Form');
    });
  });

  describe('personal documents', () => {
    it('should display SSN document', () => {
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Social Security Number');
    });

    it('should display bank account info document', () => {
      fixture.detectChanges();
      const content = fixture.nativeElement.textContent;
      expect(content).toContain('Bank Account Info');
    });
  });

  describe('info box', () => {
    it('should display info box', () => {
      fixture.detectChanges();
      const infoBox = fixture.nativeElement.querySelector('.info-box');
      expect(infoBox).toBeTruthy();
    });

    it('should display encouraging message', () => {
      fixture.detectChanges();
      const infoBox = fixture.nativeElement.querySelector('.info-box');
      expect(infoBox.textContent).toContain("Don't have everything?");
      expect(infoBox.textContent).toContain("That's okay");
      expect(infoBox.textContent).toContain('simulation');
    });
  });

  describe('navigation', () => {
    it('should navigate back to profile', () => {
      fixture.detectChanges();
      component.onBack();
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/welcome/profile');
    });

    it('should complete section and navigate to filing status on continue', () => {
      fixture.detectChanges();
      component.onContinue();
      expect(mockNavigation.completeSection).toHaveBeenCalledWith('welcome');
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/personal-info/filing-status');
    });

    it('should navigate when back button clicked', () => {
      fixture.detectChanges();
      const backBtn = fixture.nativeElement.querySelector('.back-btn');
      backBtn.click();
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/welcome/profile');
    });

    it('should navigate when continue button clicked', () => {
      fixture.detectChanges();
      const continueBtn = fixture.nativeElement.querySelector('.continue-btn');
      continueBtn.click();
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/personal-info/filing-status');
    });
  });
});
