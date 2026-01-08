import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NavigationService,
  SessionStorageService,
  TaxDataService,
  TaxCalculationService,
} from '@core/services';
import { CHILD_TAX_CREDIT } from '@core/constants/tax-year-2025';
import {
  NavigationHeaderComponent,
  ContinueButtonComponent,
} from '@shared/components';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [
    CommonModule,
    NavigationHeaderComponent,
    ContinueButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-navigation-header />

    <div class="page-container">
      <div class="content-card">
        <header class="section-header">
          <h1>Review Your Return</h1>
          <p class="intro-text">
            Please review all your information before seeing your results.
            Click "Edit" on any section to make changes.
          </p>
        </header>

        <!-- Personal Information Section -->
        <div class="review-section">
          <div class="section-title-row">
            <h2>Personal Information</h2>
            <button class="edit-btn" (click)="editPersonalInfo()" type="button">
              Edit
            </button>
          </div>
          <div class="section-content">
            <div class="info-row">
              <span class="info-label">Name</span>
              <span class="info-value">{{ fullName() }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Filing Status</span>
              <span class="info-value">{{ filingStatusLabel() }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Claimed as Dependent</span>
              <span class="info-value">{{ claimedAsDependent() ? 'Yes' : 'No' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Dependents</span>
              <span class="info-value">
                @if (dependentsCount() === 0) {
                  None
                } @else {
                  {{ dependentsCount() }} ({{ dependentNames() }})
                }
              </span>
            </div>
          </div>
        </div>

        <!-- Income Section -->
        <div class="review-section">
          <div class="section-title-row">
            <h2>Income</h2>
            <button class="edit-btn" (click)="editIncome()" type="button">
              Edit
            </button>
          </div>
          <div class="section-content">
            @if (hasW2Income()) {
              <div class="info-row">
                <span class="info-label">W-2 Wages</span>
                <span class="info-value">{{ formatCurrency(totalW2Wages()) }}</span>
              </div>
            }
            @if (has1099Income()) {
              <div class="info-row">
                <span class="info-label">1099-NEC Income</span>
                <span class="info-value">{{ formatCurrency(total1099Income()) }}</span>
              </div>
            }
            <div class="info-row total">
              <span class="info-label">Total Income</span>
              <span class="info-value">{{ formatCurrency(totalIncome()) }}</span>
            </div>
            @if (totalWithheld() > 0) {
              <div class="info-row highlight">
                <span class="info-label">Federal Tax Withheld</span>
                <span class="info-value positive">{{ formatCurrency(totalWithheld()) }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Deductions Section -->
        <div class="review-section">
          <div class="section-title-row">
            <h2>Deductions</h2>
            <button class="edit-btn" (click)="editDeductions()" type="button">
              Edit
            </button>
          </div>
          <div class="section-content">
            <div class="info-row">
              <span class="info-label">Type</span>
              <span class="info-value">
                {{ useStandardDeduction() ? 'Standard Deduction' : 'Itemized Deductions' }}
              </span>
            </div>
            <div class="info-row total">
              <span class="info-label">Deduction Amount</span>
              <span class="info-value">{{ formatCurrency(deductionAmount()) }}</span>
            </div>
            @if (!useStandardDeduction()) {
              <div class="itemized-breakdown">
                @if (mortgageInterest() > 0) {
                  <div class="breakdown-row">
                    <span>Mortgage Interest</span>
                    <span>{{ formatCurrency(mortgageInterest()) }}</span>
                  </div>
                }
                @if (studentLoanInterest() > 0) {
                  <div class="breakdown-row">
                    <span>Student Loan Interest</span>
                    <span>{{ formatCurrency(studentLoanInterest()) }}</span>
                  </div>
                }
                @if (saltTaxes() > 0) {
                  <div class="breakdown-row">
                    <span>State & Local Taxes</span>
                    <span>{{ formatCurrency(saltTaxes()) }}</span>
                  </div>
                }
                @if (charitableContributions() > 0) {
                  <div class="breakdown-row">
                    <span>Charitable Contributions</span>
                    <span>{{ formatCurrency(charitableContributions()) }}</span>
                  </div>
                }
                @if (medicalExpenses() > 0) {
                  <div class="breakdown-row">
                    <span>Medical Expenses</span>
                    <span>{{ formatCurrency(medicalExpenses()) }}</span>
                  </div>
                }
              </div>
            }
          </div>
        </div>

        <!-- Credits Section -->
        <div class="review-section">
          <div class="section-title-row">
            <h2>Credits</h2>
            <button class="edit-btn" (click)="editCredits()" type="button">
              Edit
            </button>
          </div>
          <div class="section-content">
            @if (totalCredits() > 0) {
              @if (childTaxCredit() > 0) {
                <div class="info-row">
                  <span class="info-label">Child Tax Credit</span>
                  <span class="info-value">{{ formatCurrency(childTaxCredit()) }}</span>
                </div>
              }
              @if (earnedIncomeCredit() > 0) {
                <div class="info-row">
                  <span class="info-label">Earned Income Credit</span>
                  <span class="info-value">{{ formatCurrency(earnedIncomeCredit()) }}</span>
                </div>
              }
              <div class="info-row total">
                <span class="info-label">Total Credits</span>
                <span class="info-value positive">{{ formatCurrency(totalCredits()) }}</span>
              </div>
            } @else {
              <div class="info-row">
                <span class="info-label">Total Credits</span>
                <span class="info-value">{{ formatCurrency(0) }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Summary Preview -->
        <div class="summary-preview">
          <h3>Quick Summary</h3>
          <div class="summary-grid">
            <div class="summary-item">
              <span class="summary-label">Total Income</span>
              <span class="summary-value">{{ formatCurrency(totalIncome()) }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Deductions</span>
              <span class="summary-value">-{{ formatCurrency(deductionAmount()) }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Taxable Income</span>
              <span class="summary-value">{{ formatCurrency(taxableIncome()) }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Tax Withheld</span>
              <span class="summary-value positive">{{ formatCurrency(totalWithheld()) }}</span>
            </div>
          </div>
        </div>

        <app-continue-button
          buttonText="See My Results"
          [isLastStep]="true"
          (continue)="onContinue()"
          (back)="onBack()"
        />
      </div>
    </div>
  `,
  styles: `
    .page-container {
      min-height: calc(100vh - 60px);
      padding: 2rem;
      background: var(--ngpf-gray-pale);
    }

    .content-card {
      max-width: 720px;
      margin: 0 auto;
      background: var(--ngpf-white);
      border-radius: var(--radius-lg);
      padding: 2rem;
      box-shadow: var(--shadow-lg);
    }

    .section-header {
      margin-bottom: 1.5rem;
      text-align: center;

      h1 {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--ngpf-navy-dark);
        margin: 0 0 0.5rem;
      }
    }

    .intro-text {
      color: var(--ngpf-gray-dark);
      font-size: 0.9375rem;
      margin: 0;
    }

    .review-section {
      border: 1px solid var(--ngpf-gray-light);
      border-radius: var(--radius-md);
      margin-bottom: 1rem;
      overflow: hidden;
    }

    .section-title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.25rem;
      background: var(--ngpf-blue-pale);
      border-bottom: 1px solid var(--ngpf-gray-light);

      h2 {
        font-size: 1rem;
        font-weight: 700;
        color: var(--ngpf-navy-dark);
        margin: 0;
      }
    }

    .edit-btn {
      background: none;
      border: 2px solid var(--ngpf-navy-light);
      color: var(--ngpf-navy-light);
      padding: 0.375rem 1rem;
      border-radius: var(--radius-xl);
      font-size: 0.8125rem;
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition-fast);

      &:hover {
        background: var(--ngpf-navy-light);
        color: white;
      }
    }

    .section-content {
      padding: 1rem 1.25rem;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.625rem 0;
      border-bottom: 1px solid var(--ngpf-gray-pale);

      &:last-child {
        border-bottom: none;
      }

      &.total {
        border-top: 2px solid var(--ngpf-gray-light);
        margin-top: 0.5rem;
        padding-top: 0.875rem;
        font-weight: 700;
      }

      &.highlight {
        background: var(--ngpf-success-light);
        margin: 0.5rem -1.25rem;
        padding: 0.75rem 1.25rem;
        border-bottom: none;
      }
    }

    .info-label {
      color: var(--ngpf-gray-dark);
      font-size: 0.9375rem;
    }

    .info-value {
      font-weight: 600;
      color: var(--ngpf-navy-dark);
      font-size: 0.9375rem;

      &.positive {
        color: var(--ngpf-success);
      }
    }

    .itemized-breakdown {
      margin-top: 0.75rem;
      padding: 0.875rem;
      background: var(--ngpf-gray-pale);
      border-radius: var(--radius-sm);
    }

    .breakdown-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.8125rem;
      color: var(--ngpf-gray-dark);
      padding: 0.25rem 0;

      &:last-child {
        border-bottom: none;
      }
    }

    .summary-preview {
      background: linear-gradient(135deg, var(--ngpf-navy-dark) 0%, var(--ngpf-navy) 100%);
      border-radius: var(--radius-md);
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      color: white;

      h3 {
        font-size: 1rem;
        font-weight: 600;
        margin: 0 0 1rem;
        text-align: center;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        opacity: 0.9;
      }
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;

      @media (max-width: 500px) {
        grid-template-columns: 1fr;
      }
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.625rem 0.875rem;
      background: rgba(255, 255, 255, 0.1);
      border-radius: var(--radius-sm);
    }

    .summary-label {
      font-size: 0.8125rem;
      font-weight: 500;
      opacity: 0.85;
    }

    .summary-value {
      font-weight: 700;
      font-size: 0.9375rem;

      &.positive {
        color: #86efac;
      }
    }
  `,
})
export class ReviewComponent {
  private readonly navigation = inject(NavigationService);
  private readonly sessionStorage = inject(SessionStorageService);
  private readonly taxData = inject(TaxDataService);
  private readonly taxCalculation = inject(TaxCalculationService);

  // Personal Info
  readonly fullName = computed(() => {
    const info = this.sessionStorage.taxReturn().personalInfo;
    return `${info.firstName} ${info.lastName}`.trim() || 'Not provided';
  });

  readonly filingStatus = computed(() =>
    this.sessionStorage.taxReturn().personalInfo.filingStatus
  );

  readonly filingStatusLabel = computed(() => {
    const options = this.taxData.getFilingStatusOptions();
    return options.find((o) => o.value === this.filingStatus())?.label ?? this.filingStatus();
  });

  readonly claimedAsDependent = computed(() =>
    this.sessionStorage.taxReturn().personalInfo.claimedAsDependent
  );

  readonly dependents = computed(() =>
    this.sessionStorage.taxReturn().personalInfo.dependents
  );

  readonly dependentsCount = computed(() => this.dependents().length);

  readonly dependentNames = computed(() =>
    this.dependents().map((d) => d.firstName).join(', ')
  );

  // Income
  readonly hasW2Income = computed(() =>
    this.sessionStorage.taxReturn().income.hasW2Income
  );

  readonly has1099Income = computed(() =>
    this.sessionStorage.taxReturn().income.has1099Income
  );

  readonly totalW2Wages = computed(() =>
    this.sessionStorage.taxReturn().income.w2s.reduce((sum, w2) => sum + (w2.wagesTips || 0), 0)
  );

  readonly total1099Income = computed(() =>
    this.sessionStorage.taxReturn().income.form1099s.reduce(
      (sum, f) => sum + (f.nonemployeeCompensation || 0),
      0
    )
  );

  readonly totalIncome = computed(() =>
    this.totalW2Wages() + this.total1099Income()
  );

  readonly totalWithheld = computed(() =>
    this.sessionStorage.taxReturn().income.w2s.reduce(
      (sum, w2) => sum + (w2.federalWithheld || 0),
      0
    )
  );

  // Deductions
  readonly useStandardDeduction = computed(() =>
    this.sessionStorage.taxReturn().deductions.useStandardDeduction
  );

  readonly mortgageInterest = computed(() =>
    this.sessionStorage.taxReturn().deductions.mortgageInterest
  );

  readonly studentLoanInterest = computed(() =>
    this.sessionStorage.taxReturn().deductions.studentLoanInterest
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

  readonly deductionAmount = computed(() => {
    if (this.useStandardDeduction()) {
      return this.taxData.getStandardDeduction(this.filingStatus());
    }
    // Calculate itemized deductions with limits
    return this.taxCalculation.calculateItemizedDeductions(
      {
        mortgageInterest: this.mortgageInterest(),
        studentLoanInterest: this.studentLoanInterest(),
        saltTaxes: this.saltTaxes(),
        charitableContributions: this.charitableContributions(),
        medicalExpenses: this.medicalExpenses(),
      },
      this.totalIncome() // Using gross income as approximation for AGI here
    );
  });

  readonly taxableIncome = computed(() =>
    Math.max(0, this.totalIncome() - this.deductionAmount())
  );

  // Credits
  readonly childTaxCredit = computed(() =>
    this.sessionStorage.taxReturn().credits.childTaxCredit
  );

  readonly earnedIncomeCredit = computed(() =>
    this.sessionStorage.taxReturn().credits.earnedIncomeCredit
  );

  readonly totalCredits = computed(() =>
    this.childTaxCredit() + this.earnedIncomeCredit()
  );

  formatCurrency(amount: number): string {
    return this.taxData.formatCurrency(amount);
  }

  editPersonalInfo(): void {
    this.navigation.navigateTo('/personal-info/filing-status');
  }

  editIncome(): void {
    this.navigation.navigateTo('/income/types');
  }

  editDeductions(): void {
    this.navigation.navigateTo('/deductions/itemized');
  }

  editCredits(): void {
    this.navigation.navigateTo('/credits');
  }

  onContinue(): void {
    // Calculate the full return before showing results
    const taxReturn = this.sessionStorage.taxReturn();
    const calculation = this.taxCalculation.calculateFullReturn(taxReturn);
    this.sessionStorage.updateCalculation(calculation);

    this.navigation.completeSection('review');
    this.navigation.navigateTo('/results');
  }

  onBack(): void {
    this.navigation.navigateTo('/credits');
  }
}
