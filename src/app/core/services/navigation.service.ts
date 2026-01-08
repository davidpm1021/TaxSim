import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

export interface Section {
  id: string;
  label: string;
  path: string;
  subsections?: Subsection[];
}

export interface Subsection {
  id: string;
  label: string;
  path: string;
}

export type SectionStatus = 'locked' | 'available' | 'current' | 'completed';

export const SECTIONS: Section[] = [
  {
    id: 'welcome',
    label: 'Welcome',
    path: '/welcome',
  },
  {
    id: 'personal-info',
    label: 'Personal Info',
    path: '/personal-info',
    subsections: [
      { id: 'filing-status', label: 'Filing Status', path: '/personal-info/filing-status' },
      { id: 'basic-info', label: 'Basic Info', path: '/personal-info/basic-info' },
      { id: 'dependent-status', label: 'Dependent Status', path: '/personal-info/dependent-status' },
      { id: 'dependents', label: 'Dependents', path: '/personal-info/dependents' },
    ],
  },
  {
    id: 'income',
    label: 'Income',
    path: '/income',
    subsections: [
      { id: 'income-types', label: 'Income Types', path: '/income/types' },
      { id: 'w2-entry', label: 'W-2 Entry', path: '/income/w2' },
      { id: '1099-entry', label: '1099 Entry', path: '/income/1099' },
      { id: 'income-summary', label: 'Summary', path: '/income/summary' },
    ],
  },
  {
    id: 'deductions',
    label: 'Deductions',
    path: '/deductions',
    subsections: [
      { id: 'itemized-entry', label: 'Itemized Deductions', path: '/deductions/itemized' },
      { id: 'deduction-comparison', label: 'Comparison', path: '/deductions/comparison' },
    ],
  },
  {
    id: 'credits',
    label: 'Credits',
    path: '/credits',
  },
  {
    id: 'review',
    label: 'Review',
    path: '/review',
  },
  {
    id: 'results',
    label: 'Results',
    path: '/results',
  },
];

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private readonly router = inject(Router);

  private readonly _currentSectionId = signal<string>('welcome');
  private readonly _completedSections = signal<Set<string>>(new Set());

  readonly currentSectionId = this._currentSectionId.asReadonly();
  readonly completedSections = this._completedSections.asReadonly();

  readonly currentSection = computed(() => {
    return SECTIONS.find((s) => s.id === this._currentSectionId()) ?? SECTIONS[0];
  });

  readonly currentSectionIndex = computed(() => {
    return SECTIONS.findIndex((s) => s.id === this._currentSectionId());
  });

  readonly totalSections = SECTIONS.length;

  readonly canGoBack = computed(() => {
    return this.currentSectionIndex() > 0;
  });

  readonly canGoForward = computed(() => {
    const currentIndex = this.currentSectionIndex();
    return currentIndex < SECTIONS.length - 1;
  });

  getSectionStatus(sectionId: string): SectionStatus {
    if (sectionId === this._currentSectionId()) {
      return 'current';
    }
    if (this._completedSections().has(sectionId)) {
      return 'completed';
    }

    const sectionIndex = SECTIONS.findIndex((s) => s.id === sectionId);
    const currentIndex = this.currentSectionIndex();

    // Results is locked until review is completed
    if (sectionId === 'results' && !this._completedSections().has('review')) {
      return 'locked';
    }

    // Sections before current are available
    if (sectionIndex < currentIndex) {
      return 'available';
    }

    // Next section is available if current is about to be completed
    if (sectionIndex === currentIndex + 1) {
      return 'available';
    }

    return 'locked';
  }

  navigateTo(path: string): void {
    const section = SECTIONS.find((s) => s.path === path || s.subsections?.some((sub) => sub.path === path));
    if (section) {
      this._currentSectionId.set(section.id);
    }
    this.router.navigate([path]);
  }

  navigateToSection(sectionId: string): void {
    const section = SECTIONS.find((s) => s.id === sectionId);
    if (section) {
      const status = this.getSectionStatus(sectionId);
      if (status !== 'locked') {
        this.navigateTo(section.path);
      }
    }
  }

  completeSection(sectionId: string): void {
    const updated = new Set(this._completedSections());
    updated.add(sectionId);
    this._completedSections.set(updated);
  }

  goToNext(): void {
    const currentIndex = this.currentSectionIndex();
    if (currentIndex < SECTIONS.length - 1) {
      this.completeSection(SECTIONS[currentIndex].id);
      const nextSection = SECTIONS[currentIndex + 1];
      this.navigateTo(nextSection.path);
    }
  }

  goToPrevious(): void {
    const currentIndex = this.currentSectionIndex();
    if (currentIndex > 0) {
      const prevSection = SECTIONS[currentIndex - 1];
      this.navigateTo(prevSection.path);
    }
  }

  reset(): void {
    this._currentSectionId.set('welcome');
    this._completedSections.set(new Set());
    this.router.navigate(['/welcome']);
  }

  setCurrentSectionFromUrl(url: string): void {
    const section = SECTIONS.find(
      (s) => url.startsWith(s.path) || s.subsections?.some((sub) => url.startsWith(sub.path))
    );
    if (section) {
      this._currentSectionId.set(section.id);
    }
  }
}
