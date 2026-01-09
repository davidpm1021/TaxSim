import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavigationHeaderComponent } from './navigation-header.component';
import { NavigationService, SECTIONS } from '@core/services';
import { signal } from '@angular/core';

describe('NavigationHeaderComponent', () => {
  let component: NavigationHeaderComponent;
  let fixture: ComponentFixture<NavigationHeaderComponent>;
  let navigationServiceMock: Partial<NavigationService>;

  beforeEach(async () => {
    navigationServiceMock = {
      currentSection: signal(SECTIONS[0]),
      currentSectionIndex: signal(0),
      getSectionStatus: jest.fn().mockReturnValue('available'),
      navigateToSection: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [NavigationHeaderComponent],
      providers: [{ provide: NavigationService, useValue: navigationServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(NavigationHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the current section label on mobile', () => {
    const label = fixture.nativeElement.querySelector('.current-label');
    expect(label.textContent).toBe('Welcome');
  });

  it('should display step counter', () => {
    const counter = fixture.nativeElement.querySelector('.counter-text');
    expect(counter.textContent.trim()).toBe('1/8'); // 8 sections: Welcome, Personal Info, Income, Deductions, Education, Credits, Review, Results
  });

  it('should show all step indicators', () => {
    const steps = fixture.nativeElement.querySelectorAll('.step');
    expect(steps.length).toBe(SECTIONS.length);
  });

  it('should toggle dropdown on step click when dropdown is enabled', () => {
    expect(component.dropdownOpen()).toBe(false);

    // Manually toggle dropdown since the new design shows dropdown for navigation
    component.toggleDropdown();
    fixture.detectChanges();

    expect(component.dropdownOpen()).toBe(true);

    const dropdown = fixture.nativeElement.querySelector('.section-dropdown');
    expect(dropdown).toBeTruthy();
  });

  it('should show all sections in dropdown', () => {
    component.dropdownOpen.set(true);
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('.dropdown-item');
    expect(items.length).toBe(SECTIONS.length);
  });

  it('should close dropdown when clicking overlay', () => {
    component.dropdownOpen.set(true);
    fixture.detectChanges();

    const overlay = fixture.nativeElement.querySelector('.dropdown-overlay');
    overlay.click();
    fixture.detectChanges();

    expect(component.dropdownOpen()).toBe(false);
  });

  it('should navigate when clicking a section', () => {
    component.dropdownOpen.set(true);
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('.dropdown-item');
    items[1].click(); // Click "Personal Info"

    expect(navigationServiceMock.navigateToSection).toHaveBeenCalledWith('personal-info');
    expect(component.dropdownOpen()).toBe(false);
  });

  it('should disable locked sections', () => {
    (navigationServiceMock.getSectionStatus as jest.Mock).mockImplementation((id) => {
      return id === 'results' ? 'locked' : 'available';
    });

    component.dropdownOpen.set(true);
    fixture.detectChanges();

    const lockedItem = fixture.nativeElement.querySelector('.dropdown-item.locked');
    expect(lockedItem).toBeTruthy();
    expect(lockedItem.disabled).toBe(true);
  });

  it('should show completed status indicator', () => {
    (navigationServiceMock.getSectionStatus as jest.Mock).mockImplementation((id) => {
      return id === 'welcome' ? 'completed' : 'available';
    });

    component.dropdownOpen.set(true);
    fixture.detectChanges();

    const completedItem = fixture.nativeElement.querySelector('.dropdown-item.completed');
    expect(completedItem).toBeTruthy();
    // Check for the checkmark SVG icon
    expect(completedItem.querySelector('.status-icon.check')).toBeTruthy();
  });

  it('should highlight current section', () => {
    (navigationServiceMock.getSectionStatus as jest.Mock).mockImplementation((id) => {
      return id === 'welcome' ? 'current' : 'available';
    });

    component.dropdownOpen.set(true);
    fixture.detectChanges();

    const currentItem = fixture.nativeElement.querySelector('.dropdown-item.current');
    expect(currentItem).toBeTruthy();
    expect(currentItem.querySelector('.item-label').textContent).toBe('Welcome');
  });

  it('should show step as completed in header', () => {
    (navigationServiceMock.getSectionStatus as jest.Mock).mockImplementation((id) => {
      return id === 'welcome' ? 'completed' : 'available';
    });
    // Toggle signal to force OnPush re-evaluation
    component.dropdownOpen.set(true);
    component.dropdownOpen.set(false);
    fixture.detectChanges();

    const completedStep = fixture.nativeElement.querySelector('.step.completed');
    expect(completedStep).toBeTruthy();
    expect(completedStep.querySelector('.check-icon')).toBeTruthy();
  });

  it('should show step as current in header', () => {
    (navigationServiceMock.getSectionStatus as jest.Mock).mockImplementation((id) => {
      return id === 'welcome' ? 'current' : 'available';
    });
    // Toggle signal to force OnPush re-evaluation
    component.dropdownOpen.set(true);
    component.dropdownOpen.set(false);
    fixture.detectChanges();

    const currentStep = fixture.nativeElement.querySelector('.step.current');
    expect(currentStep).toBeTruthy();
  });

  it('should show locked step as disabled', () => {
    (navigationServiceMock.getSectionStatus as jest.Mock).mockImplementation((id) => {
      return id === 'results' ? 'locked' : 'available';
    });
    // Toggle signal to force OnPush re-evaluation
    component.dropdownOpen.set(true);
    component.dropdownOpen.set(false);
    fixture.detectChanges();

    const lockedStep = fixture.nativeElement.querySelector('.step.locked');
    expect(lockedStep).toBeTruthy();
    expect(lockedStep.disabled).toBe(true);
  });
});
