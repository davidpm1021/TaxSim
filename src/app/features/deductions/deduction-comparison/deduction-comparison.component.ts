import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationService, SessionStorageService, TaxDataService } from '@core/services';
import { DEDUCTION_LIMITS, SELF_EMPLOYMENT_TAX } from '@core/constants/tax-year-2025';
import {
  NavigationHeaderComponent,
  EducationalModalComponent,
  ContinueButtonComponent,
} from '@shared/components';

@Component({
  selector: 'app-deduction-comparison',
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
          <h1>Your Deduction Options</h1>
          <button class="help-trigger" (click)="openHelpModal()" type="button">
            <span class="help-icon">?</span>
            <span>Standard vs. Itemized - which is better?</span>
          </button>
        </header>

        <div class="comparison-container">
          <!-- Standard Deduction Column -->
          <div
            class="comparison-column"
            [class.selected]="useStandard()"
            [class.recommended]="recommendStandard()"
          >
            <div class="column-header">
              <h2>Standard Deduction</h2>
              @if (recommendStandard()) {
                <span class="recommended-badge">Recommended</span>
              }
            </div>
            <div class="column-content">
              <p class="deduction-description">
                A fixed amount based on your filing status. No receipts needed.
              </p>
              <div class="amount-display">
                <span class="amount">{{ formatCurrency(standardDeduction()) }}</span>
              </div>
              <div class="filing-status-note">
                Filing as: {{ filingStatusLabel() }}
              </div>
            </div>
            <button
              class="select-btn"
              [class.active]="useStandard()"
              (click)="selectDeduction(true)"
              type="button"
            >
              @if (useStandard()) {
                <span class="check-icon">&#10003;</span> Selected
              } @else {
                Use Standard
              }
            </button>
          </div>

          <!-- Itemized Deductions Column -->
          <div
            class="comparison-column"
            [class.selected]="!useStandard()"
            [class.recommended]="!recommendStandard()"
          >
            <div class="column-header">
              <h2>Itemized Deductions</h2>
              @if (!recommendStandard()) {
                <span class="recommended-badge">Recommended</span>
              }
            </div>
            <div class="column-content">
              <div class="itemized-breakdown">
                @if (mortgageInterest() > 0) {
                  <div class="breakdown-row">
                    <span>Mortgage interest</span>
                    <span>{{ formatCurrency(mortgageInterest()) }}</span>
                  </div>
                }
                @if (effectiveSalt() > 0) {
                  <div class="breakdown-row">
                    <span>State & local taxes</span>
                    <span>{{ formatCurrency(effectiveSalt()) }}</span>
                  </div>
                }
                @if (charitableContributions() > 0) {
                  <div class="breakdown-row">
                    <span>Charitable contributions</span>
                    <span>{{ formatCurrency(charitableContributions()) }}</span>
                  </div>
                }
                @if (deductibleMedical() > 0) {
                  <div class="breakdown-row">
                    <span>Medical expenses (above 7.5%)</span>
                    <span>{{ formatCurrency(deductibleMedical()) }}</span>
                  </div>
                }
                @if (totalItemized() === 0) {
                  <div class="breakdown-row empty">
                    <span>No itemized deductions entered</span>
                  </div>
                }
              </div>
              <div class="amount-display itemized">
                <span class="label">Total</span>
                <span class="amount">{{ formatCurrency(totalItemized()) }}</span>
              </div>
            </div>
            <button
              class="select-btn"
              [class.active]="!useStandard()"
              (click)="selectDeduction(false)"
              type="button"
            >
              @if (!useStandard()) {
                <span class="check-icon">&#10003;</span> Selected
              } @else {
                Use Itemized
              }
            </button>
          </div>
        </div>

        <!-- Recommendation Box -->
        <div class="recommendation-box" [class.standard]="recommendStandard()">
          <div class="recommendation-icon">
            @if (recommendStandard()) {
              <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            } @else {
              <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            }
          </div>
          <div class="recommendation-content">
            @if (recommendStandard()) {
              <p class="recommendation-title">
                The <strong>Standard Deduction</strong> saves you more!
              </p>
              <p class="recommendation-detail">
                You'll save <strong>{{ formatCurrency(savingsAmount()) }}</strong> more by using
                the standard deduction instead of itemizing.
              </p>
            } @else if (totalItemized() > standardDeduction()) {
              <p class="recommendation-title">
                <strong>Itemizing</strong> saves you more!
              </p>
              <p class="recommendation-detail">
                You'll save <strong>{{ formatCurrency(savingsAmount()) }}</strong> more by itemizing
                your deductions.
              </p>
            } @else {
              <p class="recommendation-title">
                Both options are equal
              </p>
              <p class="recommendation-detail">
                Your itemized deductions equal the standard deduction. Most people choose standard
                for simplicity.
              </p>
            }
          </div>
        </div>

        <!-- Edit Link -->
        <div class="edit-section">
          <button class="edit-link" (click)="onEditItemized()" type="button">
            Edit itemized deductions
          </button>
        </div>

        <app-continue-button
          (continue)="onContinue()"
          (back)="onBack()"
        />
      </div>
    </div>

    <app-educational-modal #helpModal [title]="'Standard vs. Itemized Deductions'">
      <p>
        The IRS lets you reduce your taxable income using <strong>one of two methods</strong>:
      </p>
      <p>
        <strong>Standard Deduction:</strong> A fixed amount based on your filing status
        ({{ formatCurrency(standardDeduction()) }} for {{ filingStatusLabel() }} in 2025).
        It's simple—no receipts or records needed.
      </p>
      <p>
        <strong>Itemized Deductions:</strong> Add up specific expenses you paid (mortgage interest,
        charitable donations, etc.). You'll need records to support these amounts.
      </p>
      <p>
        <em>Which should you choose?</em> <strong>Whichever is larger!</strong> If your itemized
        deductions don't exceed the standard deduction, take the standard—it's easier and saves
        you more. About 90% of taxpayers use the standard deduction.
      </p>
    </app-educational-modal>
  `,
  styles: `
    .page-container {
      min-height: calc(100vh - 60px);
      padding: 2rem;
      background: var(--ngpf-gray-pale);
    }

    .content-card {
      max-width: 800px;
      margin: 0 auto;
      background: var(--ngpf-white);
      border-radius: var(--radius-lg);
      padding: 2rem;
      box-shadow: var(--shadow-md);
    }

    .section-header {
      text-align: center;
      margin-bottom: 2rem;

      h1 {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--ngpf-navy-dark);
        margin: 0 0 0.75rem;
      }
    }

    .help-trigger {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      background: none;
      border: none;
      color: var(--ngpf-navy-light);
      font-size: 0.875rem;
      cursor: pointer;
      padding: 0;

      &:hover {
        text-decoration: underline;
      }
    }

    .help-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.25rem;
      height: 1.25rem;
      background: var(--ngpf-navy-light);
      color: var(--ngpf-white);
      border-radius: 50%;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .comparison-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 1.5rem;

      @media (max-width: 640px) {
        grid-template-columns: 1fr;
      }
    }

    .comparison-column {
      border: 2px solid var(--ngpf-gray-light);
      border-radius: var(--radius-md);
      overflow: hidden;
      transition: border-color 0.2s, box-shadow 0.2s;

      &.selected {
        border-color: var(--ngpf-navy-light);
        box-shadow: 0 0 0 3px rgba(39, 92, 228, 0.15);
      }

      &.recommended:not(.selected) {
        border-color: var(--ngpf-success);
      }
    }

    .column-header {
      padding: 1rem;
      background: var(--ngpf-gray-pale);
      border-bottom: 1px solid var(--ngpf-gray-light);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;

      h2 {
        font-size: 1rem;
        font-weight: 600;
        color: var(--ngpf-navy-dark);
        margin: 0;
      }
    }

    .recommended-badge {
      font-size: 0.6875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.025em;
      padding: 0.25rem 0.5rem;
      background: var(--ngpf-success-light);
      color: var(--ngpf-success);
      border-radius: 9999px;
    }

    .column-content {
      padding: 1.25rem;
      min-height: 180px;
      display: flex;
      flex-direction: column;
    }

    .deduction-description {
      font-size: 0.875rem;
      color: var(--ngpf-gray-dark);
      margin: 0 0 1rem;
      line-height: 1.4;
    }

    .amount-display {
      text-align: center;
      padding: 1rem;
      background: var(--ngpf-blue-pale);
      border-radius: var(--radius-sm);
      margin-top: auto;

      &.itemized {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }

    .amount-display .label {
      font-size: 0.875rem;
      color: var(--ngpf-gray-dark);
    }

    .amount-display .amount {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--ngpf-navy-light);
    }

    .filing-status-note {
      margin-top: 0.75rem;
      font-size: 0.8125rem;
      color: var(--ngpf-gray);
      text-align: center;
    }

    .itemized-breakdown {
      flex: 1;
      margin-bottom: 1rem;
    }

    .breakdown-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.8125rem;
      padding: 0.375rem 0;
      color: var(--ngpf-gray-dark);
      border-bottom: 1px solid var(--ngpf-gray-pale);

      &:last-child {
        border-bottom: none;
      }

      &.empty {
        color: var(--ngpf-gray);
        font-style: italic;
        justify-content: center;
        border-bottom: none;
      }
    }

    .select-btn {
      width: 100%;
      padding: 0.875rem;
      font-size: 0.9375rem;
      font-weight: 600;
      border: none;
      background: var(--ngpf-gray-pale);
      color: var(--ngpf-gray-dark);
      cursor: pointer;
      transition: background var(--transition-fast), color var(--transition-fast);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.375rem;

      &:hover:not(.active) {
        background: var(--ngpf-gray-light);
      }

      &.active {
        background: var(--ngpf-navy-light);
        color: var(--ngpf-white);
      }
    }

    .check-icon {
      font-size: 1rem;
    }

    .recommendation-box {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1.25rem;
      background: var(--ngpf-success-light);
      border: 1px solid var(--ngpf-success);
      border-radius: var(--radius-md);
      margin-bottom: 1.5rem;

      &.standard {
        background: var(--ngpf-success-light);
        border-color: var(--ngpf-success);

        .recommendation-icon {
          color: var(--ngpf-success);
        }
      }
    }

    .recommendation-icon {
      flex-shrink: 0;
      color: var(--ngpf-success);
    }

    .recommendation-content {
      flex: 1;
    }

    .recommendation-title {
      font-size: 1rem;
      color: var(--ngpf-navy-dark);
      margin: 0 0 0.25rem;
    }

    .recommendation-detail {
      font-size: 0.875rem;
      color: var(--ngpf-gray-dark);
      margin: 0;
    }

    .edit-section {
      text-align: center;
      margin-bottom: 1.5rem;
    }

    .edit-link {
      background: none;
      border: none;
      color: var(--ngpf-navy-light);
      font-size: 0.875rem;
      cursor: pointer;
      text-decoration: underline;
      padding: 0;

      &:hover {
        color: var(--ngpf-navy);
      }
    }
  `,
})
export class DeductionComparisonComponent {
  private readonly navigation = inject(NavigationService);
  private readonly sessionStorage = inject(SessionStorageService);
  private readonly taxData = inject(TaxDataService);

  readonly helpModal = viewChild.required<EducationalModalComponent>('helpModal');

  // Selection state
  readonly useStandard = signal(this.sessionStorage.taxReturn().deductions.useStandardDeduction);

  // Get filing status and standard deduction
  readonly filingStatus = computed(() => this.sessionStorage.taxReturn().personalInfo.filingStatus);

  readonly filingStatusLabel = computed(() => {
    const status = this.filingStatus();
    const options = this.taxData.getFilingStatusOptions();
    return options.find((o) => o.value === status)?.label ?? status;
  });

  readonly standardDeduction = computed(() =>
    this.taxData.getStandardDeduction(this.filingStatus())
  );

  // Get itemized deduction values from session storage
  readonly mortgageInterest = computed(() =>
    this.sessionStorage.taxReturn().deductions.mortgageInterest
  );

  readonly saltTaxes = computed(() =>
    this.sessionStorage.taxReturn().deductions.saltTaxes
  );

  readonly charitableContributions = computed(() =>
    this.sessionStorage.taxReturn().deductions.charitableContributions
  );

  readonly medicalExpenses = computed(() =>
    this.sessionStorage.taxReturn().deductions.medicalExpenses
  );

  // Get student loan interest from adjustments (above-the-line)
  readonly studentLoanInterest = computed(() =>
    this.sessionStorage.taxReturn().adjustments.studentLoanInterest
  );

  // Calculate AGI for medical expense threshold
  readonly agi = computed(() => {
    const income = this.sessionStorage.taxReturn().income;
    const totalW2 = income.w2s.reduce((sum, w2) => sum + (w2.wagesTips || 0), 0);
    const total1099 = income.form1099s.reduce((sum, f) => sum + (f.nonemployeeCompensation || 0), 0);
    const totalInterest = income.form1099Ints.reduce((sum, f) => sum + (f.interestIncome || 0), 0);
    const grossIncome = totalW2 + total1099 + totalInterest;

    const netSEEarnings = total1099 * SELF_EMPLOYMENT_TAX.netEarningsMultiplier;
    const seTax = netSEEarnings * SELF_EMPLOYMENT_TAX.rate;
    const seDeduction = seTax * SELF_EMPLOYMENT_TAX.deductionRate;

    // Student loan interest is above-the-line
    const studentLoanDeduction = this.studentLoanInterest();

    return grossIncome - seDeduction - studentLoanDeduction;
  });

  readonly medicalThreshold = computed(() => this.agi() * DEDUCTION_LIMITS.medicalExpenseFloor);

  readonly deductibleMedical = computed(() => {
    const excess = this.medicalExpenses() - this.medicalThreshold();
    return excess > 0 ? excess : 0;
  });

  // Effective amounts with limits applied
  readonly effectiveSalt = computed(() =>
    Math.min(this.saltTaxes(), DEDUCTION_LIMITS.saltTaxes)
  );

  // Total itemized (student loan interest is above-the-line, not part of itemized)
  readonly totalItemized = computed(() => {
    return (
      this.mortgageInterest() +
      this.effectiveSalt() +
      this.charitableContributions() +
      this.deductibleMedical()
    );
  });

  // Recommendation logic
  readonly recommendStandard = computed(() =>
    this.standardDeduction() >= this.totalItemized()
  );

  readonly savingsAmount = computed(() =>
    Math.abs(this.standardDeduction() - this.totalItemized())
  );

  selectDeduction(useStandard: boolean): void {
    this.useStandard.set(useStandard);
  }

  formatCurrency(amount: number): string {
    return this.taxData.formatCurrency(amount);
  }

  openHelpModal(): void {
    this.helpModal().open();
  }

  onEditItemized(): void {
    this.navigation.navigateTo('/deductions/itemized');
  }

  onContinue(): void {
    // Save the deduction choice
    this.sessionStorage.updateDeductions((current) => ({
      ...current,
      useStandardDeduction: this.useStandard(),
    }));

    this.navigation.completeSection('deductions');
    this.navigation.navigateTo('/credits');
  }

  onBack(): void {
    this.navigation.navigateTo('/deductions/itemized');
  }
}
