import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WelcomeComponent } from './welcome.component';
import { NavigationService } from '@core/services';

describe('WelcomeComponent', () => {
  let component: WelcomeComponent;
  let fixture: ComponentFixture<WelcomeComponent>;
  let mockNavigation: Partial<NavigationService>;

  beforeEach(async () => {
    mockNavigation = {
      navigateTo: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [WelcomeComponent],
      providers: [{ provide: NavigationService, useValue: mockNavigation }],
    }).compileComponents();

    fixture = TestBed.createComponent(WelcomeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display hero title', () => {
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('.hero-title');
    expect(title.textContent).toContain('Master Your');
    expect(title.textContent).toContain('Tax Return');
  });

  it('should display educational simulation badge', () => {
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('.edu-badge');
    expect(badge.textContent).toContain('Educational Simulation');
  });

  it('should display hero subtitle', () => {
    fixture.detectChanges();
    const subtitle = fixture.nativeElement.querySelector('.hero-subtitle');
    expect(subtitle.textContent).toContain('Experience filing taxes');
    expect(subtitle.textContent).toContain('simulation');
  });

  it('should display four feature cards', () => {
    fixture.detectChanges();
    const cards = fixture.nativeElement.querySelectorAll('.feature-card');
    expect(cards.length).toBe(4);
  });

  it('should display feature card titles', () => {
    fixture.detectChanges();
    const content = fixture.nativeElement.textContent;
    expect(content).toContain('Read Tax Forms');
    expect(content).toContain('Understand Deductions');
    expect(content).toContain('Tax Brackets Demystified');
    expect(content).toContain('Refund or Owe?');
  });

  it('should display quick tools section', () => {
    fixture.detectChanges();
    const toolsTitle = fixture.nativeElement.querySelector('.edu-tools-title');
    expect(toolsTitle.textContent).toContain('Quick Tools');
  });

  it('should display three educational tool buttons', () => {
    fixture.detectChanges();
    const tools = fixture.nativeElement.querySelectorAll('.edu-tool-card');
    expect(tools.length).toBe(3);
  });

  it('should display CTA button', () => {
    fixture.detectChanges();
    const ctaButton = fixture.nativeElement.querySelector('.cta-button');
    expect(ctaButton.textContent).toContain('Start Your Tax Journey');
  });

  it('should display time estimate', () => {
    fixture.detectChanges();
    const estimate = fixture.nativeElement.querySelector('.time-estimate');
    expect(estimate.textContent).toContain('15-20 minutes');
  });

  it('should display simulation notice', () => {
    fixture.detectChanges();
    const notice = fixture.nativeElement.querySelector('.simulation-notice');
    expect(notice.textContent).toContain('100% Safe');
    expect(notice.textContent).toContain('simulation');
  });

  describe('visibility signals', () => {
    it('should have contentVisible signal initialized to false', () => {
      expect(component.contentVisible()).toBe(false);
    });

    it('should have featuresVisible signal initialized to false', () => {
      expect(component.featuresVisible()).toBe(false);
    });

    it('should have ctaVisible signal initialized to false', () => {
      expect(component.ctaVisible()).toBe(false);
    });
  });

  describe('navigation', () => {
    it('should navigate to profile on getStarted', () => {
      fixture.detectChanges();
      component.getStarted();
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/welcome/profile');
    });

    it('should navigate to filing helper when tool clicked', () => {
      fixture.detectChanges();
      component.goToFilingHelper();
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/educational/filing-helper');
    });

    it('should navigate to calendar when tool clicked', () => {
      fixture.detectChanges();
      component.goToCalendar();
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/educational/calendar');
    });

    it('should navigate to what-if when tool clicked', () => {
      fixture.detectChanges();
      component.goToWhatIf();
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/educational/what-if');
    });

    it('should navigate when CTA button is clicked', () => {
      fixture.detectChanges();
      const ctaButton = fixture.nativeElement.querySelector('.cta-button');
      ctaButton.click();
      expect(mockNavigation.navigateTo).toHaveBeenCalledWith('/welcome/profile');
    });
  });
});
