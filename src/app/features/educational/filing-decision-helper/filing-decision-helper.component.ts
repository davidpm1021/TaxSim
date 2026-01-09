import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CurrencyInputComponent } from '../../../shared/components/currency-input/currency-input.component';

interface FilingRequirement {
  mustFile: boolean;
  shouldFile: boolean;
  reasons: string[];
  threshold: number;
  earnedIncomeThreshold: number;
  unearnedIncomeThreshold: number;
}

// 2025 Filing thresholds for dependents
const DEPENDENT_EARNED_THRESHOLD = 14600; // Standard deduction for dependents
const DEPENDENT_UNEARNED_THRESHOLD = 1300;
const DEPENDENT_COMBINED_THRESHOLD = 1300;

// 2025 Filing thresholds for non-dependents
const SINGLE_THRESHOLD = 14600;
const MFJ_THRESHOLD = 29200;
const HOH_THRESHOLD = 21900;

@Component({
  selector: 'app-filing-decision-helper',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyInputComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="helper-page">
      <div class="helper-container">
        <header class="helper-header">
          <h1>Do I Need to File Taxes?</h1>
          <p class="subtitle">Answer a few questions to find out</p>
        </header>

        <div class="questions-section">
          <!-- Question 1: Dependent Status -->
          <div class="question-card">
            <h3>1. Can someone else claim you as a dependent?</h3>
            <p class="hint">Usually, your parents claim you if you're under 19 (or under 24 if a full-time student) and they provide more than half your support.</p>
            <div class="options">
              <button
                class="option-btn"
                [class.selected]="isDependent() === true"
                (click)="isDependent.set(true)"
                type="button"
              >
                Yes
              </button>
              <button
                class="option-btn"
                [class.selected]="isDependent() === false"
                (click)="isDependent.set(false)"
                type="button"
              >
                No
              </button>
            </div>
          </div>

          @if (isDependent() !== null) {
            <!-- Question 2: Filing Status (only if not dependent) -->
            @if (!isDependent()) {
              <div class="question-card">
                <h3>2. What's your filing status?</h3>
                <div class="options vertical">
                  <button
                    class="option-btn"
                    [class.selected]="filingStatus() === 'single'"
                    (click)="filingStatus.set('single')"
                    type="button"
                  >
                    Single
                  </button>
                  <button
                    class="option-btn"
                    [class.selected]="filingStatus() === 'mfj'"
                    (click)="filingStatus.set('mfj')"
                    type="button"
                  >
                    Married Filing Jointly
                  </button>
                  <button
                    class="option-btn"
                    [class.selected]="filingStatus() === 'hoh'"
                    (click)="filingStatus.set('hoh')"
                    type="button"
                  >
                    Head of Household
                  </button>
                </div>
              </div>
            }

            <!-- Question 3: Earned Income -->
            <div class="question-card">
              <h3>{{ isDependent() ? '2' : '3' }}. How much did you earn from jobs?</h3>
              <p class="hint">Include W-2 wages and 1099 gig/freelance income</p>
              <div class="income-input">
                <app-currency-input
                  inputId="earnedIncome"
                  [ngModel]="earnedIncome()"
                  (ngModelChange)="earnedIncome.set($event)"
                />
              </div>
            </div>

            <!-- Question 4: Unearned Income -->
            <div class="question-card">
              <h3>{{ isDependent() ? '3' : '4' }}. How much unearned income did you have?</h3>
              <p class="hint">Interest from bank accounts, dividends, capital gains, etc.</p>
              <div class="income-input">
                <app-currency-input
                  inputId="unearnedIncome"
                  [ngModel]="unearnedIncome()"
                  (ngModelChange)="unearnedIncome.set($event)"
                />
              </div>
            </div>

            <!-- Question 5: Withholding -->
            <div class="question-card">
              <h3>{{ isDependent() ? '4' : '5' }}. Was any federal tax withheld from your pay?</h3>
              <p class="hint">Check Box 2 on your W-2</p>
              <div class="options">
                <button
                  class="option-btn"
                  [class.selected]="hadWithholding() === true"
                  (click)="hadWithholding.set(true)"
                  type="button"
                >
                  Yes
                </button>
                <button
                  class="option-btn"
                  [class.selected]="hadWithholding() === false"
                  (click)="hadWithholding.set(false)"
                  type="button"
                >
                  No / Not sure
                </button>
              </div>
            </div>
          }
        </div>

        <!-- Results -->
        @if (showResults()) {
          <div class="results-section" [class]="resultClass()">
            <div class="result-icon">
              @if (filingResult().mustFile) {
                📋
              } @else if (filingResult().shouldFile) {
                💡
              } @else {
                ✓
              }
            </div>

            <h2 class="result-title">
              @if (filingResult().mustFile) {
                You Need to File a Tax Return
              } @else if (filingResult().shouldFile) {
                Filing is Optional, But Recommended
              } @else {
                You Don't Need to File
              }
            </h2>

            <div class="result-details">
              <div class="income-summary">
                <h4>Your Income Summary</h4>
                <div class="summary-row">
                  <span>Earned Income (jobs):</span>
                  <span>{{ earnedIncome() | currency }}</span>
                </div>
                <div class="summary-row">
                  <span>Unearned Income:</span>
                  <span>{{ unearnedIncome() | currency }}</span>
                </div>
                <div class="summary-row total">
                  <span>Total Income:</span>
                  <span>{{ totalIncome() | currency }}</span>
                </div>
              </div>

              <div class="threshold-info">
                <h4>Filing Threshold</h4>
                @if (isDependent()) {
                  <p>As a dependent, you must file if:</p>
                  <ul>
                    <li>Earned income exceeds {{ DEPENDENT_EARNED_THRESHOLD | currency }}</li>
                    <li>Unearned income exceeds {{ DEPENDENT_UNEARNED_THRESHOLD | currency }}</li>
                    <li>Total income exceeds the larger of {{ DEPENDENT_COMBINED_THRESHOLD | currency }} or earned income + $450</li>
                  </ul>
                } @else {
                  <p>Your filing threshold: {{ getThreshold() | currency }}</p>
                }
              </div>

              <div class="reasons">
                <h4>Why?</h4>
                <ul>
                  @for (reason of filingResult().reasons; track reason) {
                    <li>{{ reason }}</li>
                  }
                </ul>
              </div>

              @if (hadWithholding() && !filingResult().mustFile) {
                <div class="refund-alert">
                  <strong>Important:</strong> Even though you don't have to file, you should file anyway to get your withheld taxes refunded! The IRS won't send you money automatically.
                </div>
              }
            </div>

            <button class="btn-primary" (click)="startSimulation()" type="button">
              {{ filingResult().mustFile || filingResult().shouldFile ? 'Start Tax Simulation' : 'Try the Simulation Anyway' }}
            </button>
          </div>
        }

        <div class="action-buttons">
          <button class="btn-secondary" (click)="goBack()" type="button">
            Back
          </button>
          @if (showResults()) {
            <button class="btn-secondary" (click)="reset()" type="button">
              Start Over
            </button>
          }
        </div>
      </div>
    </div>
  `,
  styles: `
    .helper-page {
      min-height: 100vh;
      background: linear-gradient(135deg, var(--ngpf-blue-pale) 0%, var(--ngpf-white) 100%);
      padding: 2rem;
    }

    .helper-container {
      max-width: 700px;
      margin: 0 auto;
    }

    .helper-header {
      text-align: center;
      margin-bottom: 2rem;

      h1 {
        font-size: 2rem;
        font-weight: 700;
        color: var(--ngpf-navy-dark);
        margin: 0 0 0.5rem;
      }

      .subtitle {
        font-size: 1.125rem;
        color: var(--ngpf-gray);
        margin: 0;
      }
    }

    .questions-section {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .question-card {
      background: var(--ngpf-white);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      box-shadow: var(--shadow-sm);

      h3 {
        margin: 0 0 0.5rem;
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--ngpf-navy-dark);
      }

      .hint {
        margin: 0 0 1rem;
        font-size: 0.875rem;
        color: var(--ngpf-gray);
      }
    }

    .options {
      display: flex;
      gap: 0.75rem;

      &.vertical {
        flex-direction: column;
      }
    }

    .option-btn {
      flex: 1;
      padding: 0.875rem 1.25rem;
      background: var(--ngpf-gray-pale);
      border: 2px solid transparent;
      border-radius: var(--radius-sm);
      font-size: 1rem;
      font-weight: 500;
      color: var(--ngpf-gray-dark);
      cursor: pointer;
      transition: all var(--transition-fast);
      text-align: center;

      &:hover {
        background: var(--ngpf-blue-pale);
        border-color: var(--ngpf-navy-light);
      }

      &.selected {
        background: var(--ngpf-navy-light);
        border-color: var(--ngpf-navy-light);
        color: var(--ngpf-white);
      }
    }

    .income-input {
      max-width: 200px;
    }

    .results-section {
      margin-top: 2rem;
      background: var(--ngpf-white);
      border-radius: var(--radius-lg);
      padding: 2rem;
      box-shadow: var(--shadow-md);
      border-top: 4px solid var(--ngpf-gray);
      text-align: center;

      &.must-file {
        border-top-color: var(--ngpf-orange);
      }

      &.should-file {
        border-top-color: var(--ngpf-teal);
      }

      &.no-file {
        border-top-color: var(--ngpf-green);
      }
    }

    .result-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .result-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--ngpf-navy-dark);
      margin: 0 0 1.5rem;
    }

    .result-details {
      text-align: left;
    }

    .income-summary,
    .threshold-info,
    .reasons {
      margin-bottom: 1.25rem;

      h4 {
        margin: 0 0 0.5rem;
        font-size: 0.9375rem;
        font-weight: 600;
        color: var(--ngpf-navy-dark);
      }

      p {
        margin: 0 0 0.5rem;
        color: var(--ngpf-gray-dark);
      }

      ul {
        margin: 0;
        padding-left: 1.25rem;
        color: var(--ngpf-gray-dark);

        li {
          margin-bottom: 0.25rem;
        }
      }
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 0.375rem 0;
      font-size: 0.9375rem;
      color: var(--ngpf-gray-dark);

      &.total {
        border-top: 1px solid var(--ngpf-gray-light);
        margin-top: 0.5rem;
        padding-top: 0.5rem;
        font-weight: 600;
        color: var(--ngpf-navy-dark);
      }
    }

    .refund-alert {
      background: var(--ngpf-blue-pale);
      border-radius: var(--radius-sm);
      padding: 1rem;
      margin-top: 1rem;
      font-size: 0.9375rem;
      color: var(--ngpf-navy-dark);

      strong {
        color: var(--ngpf-orange);
      }
    }

    .btn-primary {
      margin-top: 1.5rem;
      padding: 0.875rem 2rem;
      background: var(--ngpf-orange);
      border: none;
      border-radius: var(--radius-sm);
      color: var(--ngpf-white);
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition-fast);

      &:hover {
        background: var(--ngpf-orange-dark);
        transform: translateY(-2px);
      }
    }

    .action-buttons {
      margin-top: 2rem;
      display: flex;
      justify-content: center;
      gap: 1rem;
    }

    .btn-secondary {
      padding: 0.75rem 1.5rem;
      background: var(--ngpf-white);
      border: 2px solid var(--ngpf-navy-light);
      border-radius: var(--radius-sm);
      color: var(--ngpf-navy-light);
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition-fast);

      &:hover {
        background: var(--ngpf-navy-light);
        color: var(--ngpf-white);
      }
    }

    @media (max-width: 640px) {
      .helper-page {
        padding: 1rem;
      }

      .options:not(.vertical) {
        flex-direction: column;
      }
    }
  `,
})
export class FilingDecisionHelperComponent {
  private readonly router = inject(Router);

  // Constants exposed for template
  readonly DEPENDENT_EARNED_THRESHOLD = DEPENDENT_EARNED_THRESHOLD;
  readonly DEPENDENT_UNEARNED_THRESHOLD = DEPENDENT_UNEARNED_THRESHOLD;
  readonly DEPENDENT_COMBINED_THRESHOLD = DEPENDENT_COMBINED_THRESHOLD;

  // Form state
  readonly isDependent = signal<boolean | null>(null);
  readonly filingStatus = signal<'single' | 'mfj' | 'hoh'>('single');
  readonly earnedIncome = signal(0);
  readonly unearnedIncome = signal(0);
  readonly hadWithholding = signal<boolean | null>(null);

  readonly totalIncome = computed(() => this.earnedIncome() + this.unearnedIncome());

  readonly showResults = computed(() => {
    if (this.isDependent() === null) return false;
    if (!this.isDependent() && !this.filingStatus()) return false;
    if (this.hadWithholding() === null) return false;
    return true;
  });

  readonly filingResult = computed<FilingRequirement>(() => {
    const earned = this.earnedIncome();
    const unearned = this.unearnedIncome();
    const total = this.totalIncome();
    const withholding = this.hadWithholding();
    const isDependent = this.isDependent();
    const reasons: string[] = [];

    let mustFile = false;
    let shouldFile = false;
    let threshold = 0;

    if (isDependent) {
      // Dependent filing rules
      const earnedThreshold = DEPENDENT_EARNED_THRESHOLD;
      const unearnedThreshold = DEPENDENT_UNEARNED_THRESHOLD;
      const combinedThreshold = Math.max(DEPENDENT_COMBINED_THRESHOLD, earned + 450);

      threshold = combinedThreshold;

      if (earned > earnedThreshold) {
        mustFile = true;
        reasons.push(`Your earned income (${this.formatCurrency(earned)}) exceeds the ${this.formatCurrency(earnedThreshold)} threshold`);
      }

      if (unearned > unearnedThreshold) {
        mustFile = true;
        reasons.push(`Your unearned income (${this.formatCurrency(unearned)}) exceeds the ${this.formatCurrency(unearnedThreshold)} threshold`);
      }

      if (total > combinedThreshold && !mustFile) {
        mustFile = true;
        reasons.push(`Your total income (${this.formatCurrency(total)}) exceeds your threshold (${this.formatCurrency(combinedThreshold)})`);
      }

      if (!mustFile) {
        reasons.push(`Your income is below the filing thresholds for dependents`);
      }
    } else {
      // Non-dependent filing rules
      switch (this.filingStatus()) {
        case 'single':
          threshold = SINGLE_THRESHOLD;
          break;
        case 'mfj':
          threshold = MFJ_THRESHOLD;
          break;
        case 'hoh':
          threshold = HOH_THRESHOLD;
          break;
      }

      if (total >= threshold) {
        mustFile = true;
        reasons.push(`Your total income (${this.formatCurrency(total)}) meets or exceeds the ${this.formatCurrency(threshold)} filing threshold`);
      } else {
        reasons.push(`Your income (${this.formatCurrency(total)}) is below the ${this.formatCurrency(threshold)} filing threshold`);
      }
    }

    // Check for withholding refund opportunity
    if (withholding && !mustFile) {
      shouldFile = true;
      reasons.push(`You had taxes withheld—filing lets you get that money back!`);
    }

    return {
      mustFile,
      shouldFile,
      reasons,
      threshold,
      earnedIncomeThreshold: DEPENDENT_EARNED_THRESHOLD,
      unearnedIncomeThreshold: DEPENDENT_UNEARNED_THRESHOLD,
    };
  });

  readonly resultClass = computed(() => {
    const result = this.filingResult();
    if (result.mustFile) return 'must-file';
    if (result.shouldFile) return 'should-file';
    return 'no-file';
  });

  getThreshold(): number {
    if (this.isDependent()) {
      return Math.max(DEPENDENT_COMBINED_THRESHOLD, this.earnedIncome() + 450);
    }
    switch (this.filingStatus()) {
      case 'single':
        return SINGLE_THRESHOLD;
      case 'mfj':
        return MFJ_THRESHOLD;
      case 'hoh':
        return HOH_THRESHOLD;
      default:
        return SINGLE_THRESHOLD;
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  reset(): void {
    this.isDependent.set(null);
    this.filingStatus.set('single');
    this.earnedIncome.set(0);
    this.unearnedIncome.set(0);
    this.hadWithholding.set(null);
  }

  startSimulation(): void {
    this.router.navigate(['/personal-info']);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
