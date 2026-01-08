import { ChangeDetectionStrategy, Component, computed, inject, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationService, SessionStorageService } from '@core/services';
import {
  NavigationHeaderComponent,
  EducationalModalComponent,
  ContinueButtonComponent,
} from '@shared/components';

@Component({
  selector: 'app-dependent-status',
  standalone: true,
  imports: [
    CommonModule,
    NavigationHeaderComponent,
    EducationalModalComponent,
    ContinueButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-navigation-header />

    <div class="page-container">
      <div class="content-card">
        <header class="section-header">
          <h1>Can someone claim you as a dependent?</h1>
          <button class="help-trigger" (click)="openHelpModal()" type="button">
            <span class="help-icon">?</span>
            <span>What does this mean?</span>
          </button>
        </header>

        <div class="options" role="radiogroup" aria-label="Dependent status">
          <label class="option" [class.selected]="claimedAsDependent() === true">
            <input
              type="radio"
              name="claimedAsDependent"
              [checked]="claimedAsDependent() === true"
              (change)="setClaimedAsDependent(true)"
            />
            <div class="option-content">
              <span class="option-label">Yes</span>
              <span class="option-description">
                A parent, guardian, or someone else can claim me on their tax return
              </span>
            </div>
            <span class="check-mark">✓</span>
          </label>

          <label class="option" [class.selected]="claimedAsDependent() === false">
            <input
              type="radio"
              name="claimedAsDependent"
              [checked]="claimedAsDependent() === false"
              (change)="setClaimedAsDependent(false)"
            />
            <div class="option-content">
              <span class="option-label">No</span>
              <span class="option-description">
                No one else can claim me as a dependent
              </span>
            </div>
            <span class="check-mark">✓</span>
          </label>
        </div>

        <app-continue-button
          [disabled]="claimedAsDependent() === null"
          (continue)="onContinue()"
          (back)="onBack()"
        />
      </div>
    </div>

    <app-educational-modal #helpModal [title]="'Being claimed as a dependent'">
      <p>
        <strong>A dependent</strong> is someone who relies on another person for financial support.
        If you're under 19 (or under 24 and a full-time student), your parents may be able to claim
        you on their tax return.
      </p>
      <p>
        <strong>Why does this matter?</strong> If someone can claim you as a dependent, your
        standard deduction is limited, and you can't claim certain credits like the Earned Income
        Tax Credit.
      </p>
      <p>
        <em>
          Tip: Even if your parents don't actually claim you, if they could claim you, you should
          answer "Yes" here.
        </em>
      </p>
    </app-educational-modal>
  `,
  styles: `
    .page-container {
      min-height: calc(100vh - 64px);
      padding: 2rem;
      background: linear-gradient(180deg, #f0f4f8 0%, #e2e8f0 100%);
    }

    .content-card {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 20px;
      padding: 2rem;
      box-shadow:
        0 1px 3px rgba(0, 0, 0, 0.04),
        0 8px 24px rgba(0, 0, 0, 0.06);
      animation: fadeIn 0.5s ease;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .section-header {
      text-align: center;
      margin-bottom: 2rem;

      h1 {
        font-family: var(--font-heading);
        font-size: 1.75rem;
        font-weight: 700;
        color: var(--ngpf-navy);
        margin: 0 0 1rem;
      }
    }

    .help-trigger {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: none;
      border: none;
      color: var(--ngpf-bright-blue);
      font-size: 0.9375rem;
      font-weight: 500;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 8px;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(39, 92, 228, 0.08);
      }

      &:focus-visible {
        outline: 2px solid var(--ngpf-bright-blue);
        outline-offset: 2px;
      }
    }

    .help-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.5rem;
      height: 1.5rem;
      background: var(--ngpf-bright-blue);
      color: white;
      border-radius: 50%;
      font-size: 0.875rem;
      font-weight: 700;
    }

    .options {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .option {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem 1.5rem;
      border: 2px solid #e2e8f0;
      border-radius: 16px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      background: #f8fafc;

      &:hover {
        border-color: #cbd5e1;
        background: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      }

      &.selected {
        border-color: var(--ngpf-bright-blue);
        background: linear-gradient(135deg, rgba(39, 92, 228, 0.03), rgba(29, 184, 232, 0.02));
        box-shadow:
          0 0 0 4px rgba(39, 92, 228, 0.1),
          0 4px 12px rgba(39, 92, 228, 0.15);
      }

      input[type='radio'] {
        position: absolute;
        opacity: 0;
        pointer-events: none;
      }

      &:focus-within {
        outline: 3px solid rgba(244, 173, 0, 0.5);
        outline-offset: 2px;
      }
    }

    .option-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .option-label {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--ngpf-navy);
    }

    .option-description {
      font-size: 0.875rem;
      color: #64748b;
      line-height: 1.4;
    }

    .check-mark {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--ngpf-success);
      color: white;
      border-radius: 50%;
      font-size: 1rem;
      opacity: 0;
      transform: scale(0.5);
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

      .selected & {
        opacity: 1;
        transform: scale(1);
      }
    }

    @media (max-width: 520px) {
      .page-container {
        padding: 1.25rem;
      }

      .content-card {
        padding: 1.5rem;
        border-radius: 16px;
      }

      .section-header h1 {
        font-size: 1.375rem;
      }
    }
  `,
})
export class DependentStatusComponent {
  private readonly navigation = inject(NavigationService);
  private readonly sessionStorage = inject(SessionStorageService);

  readonly helpModal = viewChild.required<EducationalModalComponent>('helpModal');

  readonly claimedAsDependent = computed(() => {
    const info = this.sessionStorage.taxReturn().personalInfo;
    // Return null if not yet set (initial state uses false but we want explicit selection)
    if (info.firstName === '' && info.claimedAsDependent === false) {
      return null;
    }
    return info.claimedAsDependent;
  });

  setClaimedAsDependent(value: boolean): void {
    this.sessionStorage.updatePersonalInfo((info) => ({
      ...info,
      claimedAsDependent: value,
    }));
  }

  openHelpModal(): void {
    this.helpModal().open();
  }

  onContinue(): void {
    const filingStatus = this.sessionStorage.taxReturn().personalInfo.filingStatus;
    // Skip dependents question for single filers who are claimed as dependents
    if (this.claimedAsDependent() || filingStatus === 'single') {
      // Go to income section
      this.navigation.completeSection('personal-info');
      this.navigation.navigateTo('/income/types');
    } else {
      // Ask about dependents
      this.navigation.navigateTo('/personal-info/dependents');
    }
  }

  onBack(): void {
    this.navigation.navigateTo('/personal-info/basic-info');
  }
}
