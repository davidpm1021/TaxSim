import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NavigationService, SECTIONS } from './navigation.service';

describe('NavigationService', () => {
  let service: NavigationService;
  let routerSpy: jest.Mocked<Router>;

  beforeEach(() => {
    routerSpy = {
      navigate: jest.fn(),
    } as unknown as jest.Mocked<Router>;

    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: routerSpy }],
    });
    service = TestBed.inject(NavigationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start at welcome section', () => {
    expect(service.currentSectionId()).toBe('welcome');
  });

  it('should return current section', () => {
    expect(service.currentSection().id).toBe('welcome');
  });

  it('should return correct section index', () => {
    expect(service.currentSectionIndex()).toBe(0);
  });

  it('should not allow going back from first section', () => {
    expect(service.canGoBack()).toBe(false);
  });

  it('should allow going forward from first section', () => {
    expect(service.canGoForward()).toBe(true);
  });

  describe('navigation', () => {
    it('should navigate to a path', () => {
      service.navigateTo('/personal-info');

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/personal-info']);
      expect(service.currentSectionId()).toBe('personal-info');
    });

    it('should navigate to next section', () => {
      service.goToNext();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/personal-info']);
      expect(service.completedSections().has('welcome')).toBe(true);
    });

    it('should navigate to previous section', () => {
      service.navigateTo('/personal-info');
      service.goToPrevious();

      expect(routerSpy.navigate).toHaveBeenLastCalledWith(['/welcome']);
    });

    it('should not navigate to locked section', () => {
      // Results should be locked initially
      service.navigateToSection('results');

      // Should not navigate
      expect(service.currentSectionId()).toBe('welcome');
    });
  });

  describe('section status', () => {
    it('should return current for current section', () => {
      expect(service.getSectionStatus('welcome')).toBe('current');
    });

    it('should return available for adjacent section', () => {
      expect(service.getSectionStatus('personal-info')).toBe('available');
    });

    it('should return locked for results until review is completed', () => {
      expect(service.getSectionStatus('results')).toBe('locked');
    });

    it('should return completed for completed sections', () => {
      service.completeSection('welcome');
      service.navigateTo('/personal-info');

      expect(service.getSectionStatus('welcome')).toBe('completed');
    });
  });

  describe('reset', () => {
    it('should reset to welcome', () => {
      service.navigateTo('/personal-info');
      service.completeSection('welcome');
      service.completeSection('personal-info');

      service.reset();

      expect(service.currentSectionId()).toBe('welcome');
      expect(service.completedSections().size).toBe(0);
      expect(routerSpy.navigate).toHaveBeenLastCalledWith(['/welcome']);
    });
  });

  describe('URL sync', () => {
    it('should set current section from URL', () => {
      service.setCurrentSectionFromUrl('/income/w2');

      expect(service.currentSectionId()).toBe('income');
    });

    it('should handle main section paths', () => {
      service.setCurrentSectionFromUrl('/deductions');

      expect(service.currentSectionId()).toBe('deductions');
    });
  });
});
