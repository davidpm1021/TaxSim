import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationService, SECTIONS, SectionStatus } from '@core/services';

@Component({
  selector: 'app-navigation-header',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="nav-header">
      <div class="nav-content">
        <!-- Brand -->
        <div class="brand">
          <div class="brand-icon">
            <span class="icon-inner">$</span>
          </div>
          <div class="brand-text">
            <span class="brand-name">TaxSim</span>
            <span class="brand-tag">2025</span>
          </div>
        </div>

        <!-- Progress Steps -->
        <div class="progress-section">
          <div class="steps-container">
            @for (section of sections; track section.id; let i = $index) {
              <div class="step-wrapper">
                <button
                  class="step"
                  [class.completed]="getSectionStatus(section.id) === 'completed'"
                  [class.current]="getSectionStatus(section.id) === 'current'"
                  [class.locked]="getSectionStatus(section.id) === 'locked'"
                  [disabled]="getSectionStatus(section.id) === 'locked'"
                  (click)="navigateToSection(section.id)"
                  [attr.aria-label]="section.label"
                  [attr.aria-current]="getSectionStatus(section.id) === 'current' ? 'step' : null"
                >
                  <span class="step-indicator">
                    @if (getSectionStatus(section.id) === 'completed') {
                      <svg viewBox="0 0 24 24" class="check-icon">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    } @else {
                      <span class="step-number">{{ i + 1 }}</span>
                    }
                  </span>
                </button>
                @if (i < sections.length - 1) {
                  <div class="step-connector" [class.completed]="getSectionStatus(section.id) === 'completed'"></div>
                }
              </div>
            }
          </div>

          <!-- Current step label (mobile) -->
          <div class="current-label">{{ currentSection().label }}</div>
        </div>

        <!-- Step Counter -->
        <div class="step-counter">
          <div class="counter-ring">
            <svg viewBox="0 0 36 36" class="progress-ring">
              <circle class="ring-bg" cx="18" cy="18" r="15.5" />
              <circle
                class="ring-progress"
                cx="18" cy="18" r="15.5"
                [style.stroke-dasharray]="progressCircle()"
              />
            </svg>
            <span class="counter-text">{{ currentSectionIndex() + 1 }}/{{ totalSections }}</span>
          </div>
        </div>
      </div>

      <!-- Section dropdown for detailed navigation -->
      @if (dropdownOpen()) {
        <div class="dropdown-overlay" (click)="closeDropdown()"></div>
        <div class="section-dropdown">
          <div class="dropdown-header">
            <span class="dropdown-title">Jump to Section</span>
            <button class="dropdown-close" (click)="closeDropdown()">
              <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
          </div>
          @for (section of sections; track section.id; let i = $index) {
            <button
              class="dropdown-item"
              [class.current]="getSectionStatus(section.id) === 'current'"
              [class.completed]="getSectionStatus(section.id) === 'completed'"
              [class.locked]="getSectionStatus(section.id) === 'locked'"
              [disabled]="getSectionStatus(section.id) === 'locked'"
              (click)="navigateToSection(section.id)"
            >
              <span class="item-number">{{ i + 1 }}</span>
              <span class="item-label">{{ section.label }}</span>
              <span class="item-status">
                @switch (getSectionStatus(section.id)) {
                  @case ('completed') {
                    <svg viewBox="0 0 24 24" class="status-icon check"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                  }
                  @case ('current') {
                    <span class="status-dot current"></span>
                  }
                  @case ('locked') {
                    <svg viewBox="0 0 24 24" class="status-icon lock"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
                  }
                  @default {
                    <span class="status-dot"></span>
                  }
                }
              </span>
            </button>
          }
        </div>
      }
    </header>

    <!-- Mobile bottom progress bar -->
    <div class="mobile-progress">
      <div class="progress-fill" [style.width.%]="progressPercent()"></div>
    </div>
  `,
  styles: `
    .nav-header {
      background: linear-gradient(135deg, #0b1541 0%, #1a1f3a 100%);
      color: white;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow:
        0 4px 20px rgba(0, 0, 0, 0.15),
        0 0 0 1px rgba(255, 255, 255, 0.05) inset;
    }

    .nav-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0.875rem 1.5rem;
      gap: 1.5rem;
    }

    /* Brand */
    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-shrink: 0;
    }

    .brand-icon {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #f4ad00, #ff8c00);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 10px rgba(244, 173, 0, 0.3);
    }

    .icon-inner {
      font-size: 1.25rem;
      font-weight: 800;
      color: #0b1541;
    }

    .brand-text {
      display: flex;
      flex-direction: column;
      line-height: 1.1;
    }

    .brand-name {
      font-size: 1.125rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .brand-tag {
      font-size: 0.625rem;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.5);
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    /* Progress Steps */
    .progress-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .steps-container {
      display: flex;
      align-items: center;
    }

    .step-wrapper {
      display: flex;
      align-items: center;
    }

    .step {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.2);
      background: transparent;
      color: rgba(255, 255, 255, 0.4);
      font-size: 0.8125rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;

      &:hover:not(:disabled) {
        border-color: rgba(255, 255, 255, 0.4);
        transform: scale(1.1);
      }

      &.completed {
        background: linear-gradient(135deg, #10b981, #059669);
        border-color: #10b981;
        color: white;
        box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
      }

      &.current {
        background: linear-gradient(135deg, #f4ad00, #ff8c00);
        border-color: #f4ad00;
        color: #0b1541;
        box-shadow: 0 2px 12px rgba(244, 173, 0, 0.5);
        transform: scale(1.1);
      }

      &.locked {
        opacity: 0.4;
        cursor: not-allowed;
      }

      &:disabled {
        cursor: not-allowed;
      }

      &:focus-visible {
        outline: 2px solid #f4ad00;
        outline-offset: 2px;
      }
    }

    .step-indicator {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .step-number {
      font-size: 0.75rem;
    }

    .check-icon {
      width: 16px;
      height: 16px;
      fill: currentColor;
    }

    .step-connector {
      width: 24px;
      height: 2px;
      background: rgba(255, 255, 255, 0.15);
      margin: 0 2px;
      transition: background 0.3s ease;

      &.completed {
        background: linear-gradient(90deg, #10b981, #059669);
      }
    }

    .current-label {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.6);
      font-weight: 500;
      display: none;
    }

    /* Step Counter */
    .step-counter {
      flex-shrink: 0;
    }

    .counter-ring {
      position: relative;
      width: 44px;
      height: 44px;
    }

    .progress-ring {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }

    .ring-bg {
      fill: none;
      stroke: rgba(255, 255, 255, 0.1);
      stroke-width: 3;
    }

    .ring-progress {
      fill: none;
      stroke: url(#progressGradient);
      stroke-width: 3;
      stroke-linecap: round;
      transition: stroke-dasharray 0.5s ease;
    }

    .counter-text {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.6875rem;
      font-weight: 700;
      color: white;
    }

    /* Dropdown */
    .dropdown-overlay {
      position: fixed;
      inset: 0;
      z-index: 99;
      background: rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(2px);
    }

    .section-dropdown {
      position: absolute;
      top: calc(100% + 0.5rem);
      left: 50%;
      transform: translateX(-50%);
      background: white;
      border-radius: 16px;
      box-shadow:
        0 20px 50px rgba(0, 0, 0, 0.2),
        0 0 0 1px rgba(0, 0, 0, 0.05);
      min-width: 280px;
      z-index: 100;
      overflow: hidden;
      animation: dropdownIn 0.2s ease;
    }

    @keyframes dropdownIn {
      from {
        opacity: 0;
        transform: translateX(-50%) translateY(-8px);
      }
      to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    }

    .dropdown-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid #eee;
    }

    .dropdown-title {
      font-size: 0.875rem;
      font-weight: 700;
      color: #0b1541;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }

    .dropdown-close {
      width: 28px;
      height: 28px;
      border: none;
      background: #f5f5f5;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;

      svg {
        width: 16px;
        height: 16px;
        fill: #666;
      }

      &:hover {
        background: #eee;
      }
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      width: 100%;
      padding: 0.875rem 1.25rem;
      border: none;
      background: white;
      color: #0b1541;
      font-size: 0.9375rem;
      text-align: left;
      cursor: pointer;
      transition: all 0.2s;

      &:hover:not(:disabled) {
        background: #f8f9fc;
      }

      &.current {
        background: linear-gradient(135deg, rgba(244, 173, 0, 0.1), rgba(255, 140, 0, 0.05));
        border-left: 3px solid #f4ad00;
      }

      &.completed {
        color: #10b981;
      }

      &.locked {
        color: #aaa;
        cursor: not-allowed;
      }

      &:disabled {
        cursor: not-allowed;
      }
    }

    .item-number {
      width: 24px;
      height: 24px;
      background: #f0f0f0;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 700;

      .completed & {
        background: rgba(16, 185, 129, 0.1);
        color: #10b981;
      }

      .current & {
        background: linear-gradient(135deg, #f4ad00, #ff8c00);
        color: #0b1541;
      }
    }

    .item-label {
      flex: 1;
      font-weight: 500;
    }

    .item-status {
      display: flex;
      align-items: center;
    }

    .status-icon {
      width: 18px;
      height: 18px;

      &.check {
        fill: #10b981;
      }

      &.lock {
        fill: #ccc;
      }
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #ddd;

      &.current {
        background: #f4ad00;
        box-shadow: 0 0 0 3px rgba(244, 173, 0, 0.2);
      }
    }

    /* Mobile progress bar */
    .mobile-progress {
      display: none;
      height: 3px;
      background: rgba(255, 255, 255, 0.1);
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #f4ad00, #1db8e8);
      transition: width 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .steps-container {
        display: none;
      }

      .current-label {
        display: block;
      }

      .brand-text {
        display: none;
      }

      .mobile-progress {
        display: block;
      }
    }

    @media (max-width: 480px) {
      .nav-content {
        padding: 0.75rem 1rem;
      }

      .counter-ring {
        width: 38px;
        height: 38px;
      }
    }
  `,
})
export class NavigationHeaderComponent {
  private readonly navigation = inject(NavigationService);

  readonly sections = SECTIONS;
  readonly totalSections = SECTIONS.length;
  readonly currentSection = this.navigation.currentSection;
  readonly currentSectionIndex = this.navigation.currentSectionIndex;

  readonly dropdownOpen = signal(false);

  readonly progressPercent = computed(() => {
    return ((this.currentSectionIndex() + 1) / this.totalSections) * 100;
  });

  readonly progressCircle = computed(() => {
    const circumference = 2 * Math.PI * 15.5;
    const progress = this.progressPercent() / 100;
    return `${circumference * progress} ${circumference}`;
  });

  getSectionStatus(sectionId: string): SectionStatus {
    return this.navigation.getSectionStatus(sectionId);
  }

  toggleDropdown(): void {
    this.dropdownOpen.update((open) => !open);
  }

  closeDropdown(): void {
    this.dropdownOpen.set(false);
  }

  navigateToSection(sectionId: string): void {
    this.navigation.navigateToSection(sectionId);
    this.closeDropdown();
  }
}
