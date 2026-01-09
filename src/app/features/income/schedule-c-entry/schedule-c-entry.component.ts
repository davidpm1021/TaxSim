import { ChangeDetectionStrategy, Component, computed, inject, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationService, SessionStorageService } from '@core/services';
import { createEmptyScheduleC, ScheduleC } from '@core/models';
import { MILEAGE_RATE, SELF_EMPLOYMENT_TAX } from '@core/constants/tax-year-2025';
import {
  NavigationHeaderComponent,
  EducationalModalComponent,
  ContinueButtonComponent,
  CurrencyInputComponent,
  MileageCalculatorComponent,
} from '@shared/components';

@Component({
  selector: 'app-schedule-c-entry',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NavigationHeaderComponent,
    EducationalModalComponent,
    ContinueButtonComponent,
    CurrencyInputComponent,
    MileageCalculatorComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-navigation-header />

    <div class="page-container">
      <div class="content-card">
        <header class="section-header">
          <h1>Self-Employment Expenses</h1>
          <button class="help-trigger" (click)="openHelpModal()" type="button">
            <span class="help-icon">?</span>
            <span>What can I deduct?</span>
          </button>
        </header>

        <p class="instruction">
          As a gig worker or freelancer, you can deduct business expenses to reduce your taxable
          income. Enter your expenses below to see how much you can save.
        </p>

        <div class="income-summary">
          <div class="summary-item">
            <span class="summary-label">Total 1099 Income:</span>
            <span class="summary-value">{{ formatCurrency(total1099Income()) }}</span>
          </div>
        </div>

        <div class="expense-section">
          <h2>Business Description</h2>
          <div class="input-group">
            <label for="businessDesc">What type of work did you do?</label>
            <input
              type="text"
              id="businessDesc"
              [ngModel]="scheduleC().businessDescription"
              (ngModelChange)="updateField('businessDescription', $event)"
              placeholder="e.g., Delivery driver, Freelance tutoring"
            />
          </div>
        </div>

        <div class="expense-section">
          <h2>Mileage</h2>
          <app-mileage-calculator
            [miles]="scheduleC().mileage.totalMiles"
            (milesChange)="onMilesChange($event)"
            (deductionChange)="onMileageDeductionChange($event)"
          />
        </div>

        <div class="expense-section">
          <h2>Other Business Expenses</h2>

          <div class="input-group">
            <label for="supplies">Supplies & Equipment</label>
            <app-currency-input
              inputId="supplies"
              [ngModel]="scheduleC().supplies"
              (ngModelChange)="updateField('supplies', $event)"
              placeholder="0"
            />
            <span class="input-hint">Delivery bags, phone mounts, uniforms, etc.</span>
          </div>

          <div class="input-group">
            <label for="phoneInternet">Phone & Internet (Business Use)</label>
            <app-currency-input
              inputId="phoneInternet"
              [ngModel]="scheduleC().phoneInternet"
              (ngModelChange)="updateField('phoneInternet', $event)"
              placeholder="0"
            />
            <span class="input-hint">Only the portion used for work (e.g., 20% of your phone bill)</span>
          </div>

          <div class="input-group">
            <label for="platformFees">Platform/Service Fees</label>
            <app-currency-input
              inputId="platformFees"
              [ngModel]="scheduleC().platformFees"
              (ngModelChange)="updateField('platformFees', $event)"
              placeholder="0"
            />
            <span class="input-hint">Fees charged by apps (often already deducted from your payments)</span>
          </div>

          <div class="input-group">
            <label for="otherExpenses">Other Business Expenses</label>
            <app-currency-input
              inputId="otherExpenses"
              [ngModel]="scheduleC().otherExpenses"
              (ngModelChange)="updateField('otherExpenses', $event)"
              placeholder="0"
            />
          </div>

          @if (scheduleC().otherExpenses > 0) {
            <div class="input-group">
              <label for="otherDesc">Description of Other Expenses</label>
              <input
                type="text"
                id="otherDesc"
                [ngModel]="scheduleC().otherExpensesDescription"
                (ngModelChange)="updateField('otherExpensesDescription', $event)"
                placeholder="Describe your other expenses"
              />
            </div>
          }
        </div>

        <div class="results-section">
          <h2>Your Schedule C Summary</h2>

          <div class="result-row">
            <span class="result-label">Gross 1099 Income</span>
            <span class="result-value">{{ formatCurrency(total1099Income()) }}</span>
          </div>

          <div class="expense-breakdown">
            <div class="result-row expense">
              <span class="result-label">Mileage ({{ scheduleC().mileage.totalMiles | number }} mi × {{ mileageRate | currency }}/mi)</span>
              <span class="result-value">- {{ formatCurrency(scheduleC().mileage.calculatedDeduction) }}</span>
            </div>
            <div class="result-row expense">
              <span class="result-label">Supplies</span>
              <span class="result-value">- {{ formatCurrency(scheduleC().supplies) }}</span>
            </div>
            <div class="result-row expense">
              <span class="result-label">Phone & Internet</span>
              <span class="result-value">- {{ formatCurrency(scheduleC().phoneInternet) }}</span>
            </div>
            <div class="result-row expense">
              <span class="result-label">Platform Fees</span>
              <span class="result-value">- {{ formatCurrency(scheduleC().platformFees) }}</span>
            </div>
            @if (scheduleC().otherExpenses > 0) {
              <div class="result-row expense">
                <span class="result-label">Other Expenses</span>
                <span class="result-value">- {{ formatCurrency(scheduleC().otherExpenses) }}</span>
              </div>
            }
          </div>

          <div class="result-row total-expenses">
            <span class="result-label">Total Expenses</span>
            <span class="result-value">- {{ formatCurrency(totalExpenses()) }}</span>
          </div>

          <div class="result-row net-profit" [class.negative]="netProfit() < 0">
            <span class="result-label">Net Profit (Taxable Amount)</span>
            <span class="result-value">{{ formatCurrency(netProfit()) }}</span>
          </div>

          @if (totalExpenses() > 0) {
            <div class="savings-notice">
              <div class="notice-icon">$</div>
              <div class="notice-content">
                <strong>Estimated Tax Savings</strong>
                <p>
                  By deducting {{ formatCurrency(totalExpenses()) }} in expenses, you could save
                  approximately <strong>{{ formatCurrency(estimatedTaxSavings()) }}</strong> in taxes!
                </p>
              </div>
            </div>
          }
        </div>

        <app-continue-button
          (continue)="onContinue()"
          (back)="onBack()"
        />
      </div>
    </div>

    <app-educational-modal #helpModal [title]=\"'Self-Employment Expense Deductions'\">
      <p>
        As a self-employed worker, you can deduct <strong>ordinary and necessary</strong> business
        expenses from your income. This reduces both your income tax AND your self-employment tax!
      </p>
      <p><strong>Common deductible expenses for gig workers:</strong></p>
      <ul>
        <li>
          <strong>Mileage</strong> — {{ mileageRate | currency }} per mile driven for business
          (not commuting to your first job or home from your last)
        </li>
        <li>
          <strong>Supplies</strong> — Delivery bags, phone mounts, work clothes with logos
        </li>
        <li>
          <strong>Phone/Internet</strong> — Only the business-use portion (estimate what % is for work)
        </li>
        <li>
          <strong>Platform fees</strong> — Service fees charged by apps
        </li>
      </ul>
      <p>
        <em>
          Keep records! The IRS may ask you to prove your expenses. Save receipts and track your
          mileage using an app.
        </em>
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
      margin-bottom: 0.5rem;

      h1 {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--ngpf-navy-dark);
        margin: 0 0 0.5rem;
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

    .instruction {
      color: var(--ngpf-gray-dark);
      margin: 0 0 1.5rem;
      font-size: 0.9375rem;
    }

    .income-summary {
      padding: 1rem 1.25rem;
      background: var(--ngpf-blue-pale);
      border-radius: var(--radius-sm);
      margin-bottom: 1.5rem;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .summary-label {
      font-size: 0.9375rem;
      color: var(--ngpf-gray-dark);
    }

    .summary-value {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--ngpf-navy-light);
    }

    .expense-section {
      margin-bottom: 1.5rem;

      h2 {
        font-size: 1rem;
        font-weight: 600;
        color: var(--ngpf-navy-dark);
        margin: 0 0 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid var(--ngpf-gray-light);
      }
    }

    .input-group {
      margin-bottom: 1rem;

      label {
        display: block;
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--ngpf-navy-dark);
        margin-bottom: 0.375rem;
      }

      input[type="text"] {
        width: 100%;
        padding: 0.625rem 0.875rem;
        border: 1px solid var(--ngpf-gray-light);
        border-radius: var(--radius-sm);
        font-size: 1rem;

        &:focus {
          outline: none;
          border-color: var(--ngpf-navy-light);
          box-shadow: 0 0 0 3px rgba(44, 82, 130, 0.1);
        }
      }
    }

    .input-hint {
      display: block;
      font-size: 0.75rem;
      color: var(--ngpf-gray);
      margin-top: 0.25rem;
    }

    .results-section {
      padding: 1.5rem;
      background: var(--ngpf-gray-pale);
      border-radius: var(--radius-md);
      margin-bottom: 1.5rem;

      h2 {
        font-size: 1rem;
        font-weight: 600;
        color: var(--ngpf-navy-dark);
        margin: 0 0 1rem;
      }
    }

    .result-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      font-size: 0.9375rem;
    }

    .result-label {
      color: var(--ngpf-gray-dark);
    }

    .result-value {
      font-weight: 500;
      color: var(--ngpf-navy-dark);
    }

    .expense-breakdown {
      padding-left: 1rem;
      border-left: 2px solid var(--ngpf-gray-light);
      margin: 0.5rem 0;
    }

    .result-row.expense {
      font-size: 0.875rem;

      .result-label {
        color: var(--ngpf-gray);
      }

      .result-value {
        color: var(--ngpf-error);
      }
    }

    .total-expenses {
      margin-top: 0.5rem;
      padding-top: 0.5rem;
      border-top: 1px solid var(--ngpf-gray-light);

      .result-value {
        color: var(--ngpf-error);
        font-weight: 600;
      }
    }

    .net-profit {
      margin-top: 0.5rem;
      padding-top: 0.75rem;
      border-top: 2px solid var(--ngpf-navy-light);
      font-weight: 600;
      font-size: 1rem;

      .result-value {
        color: var(--ngpf-navy-light);
        font-size: 1.125rem;
      }

      &.negative .result-value {
        color: var(--ngpf-error);
      }
    }

    .savings-notice {
      display: flex;
      gap: 0.75rem;
      margin-top: 1rem;
      padding: 1rem;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: var(--radius-sm);
    }

    .notice-icon {
      flex-shrink: 0;
      width: 1.5rem;
      height: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #10b981;
      color: white;
      border-radius: 50%;
      font-weight: 700;
      font-size: 0.875rem;
    }

    .notice-content {
      flex: 1;

      strong {
        display: block;
        color: #047857;
        margin-bottom: 0.25rem;
      }

      p {
        margin: 0;
        font-size: 0.875rem;
        color: #047857;
      }
    }
  `,
})
export class ScheduleCEntryComponent {
  private readonly navigation = inject(NavigationService);
  private readonly sessionStorage = inject(SessionStorageService);

  readonly helpModal = viewChild.required<EducationalModalComponent>('helpModal');

  readonly mileageRate = MILEAGE_RATE;

  readonly scheduleC = computed(() => {
    const income = this.sessionStorage.taxReturn().income;
    return income.scheduleC ?? createEmptyScheduleC();
  });

  readonly total1099Income = computed(() => {
    const income = this.sessionStorage.taxReturn().income;
    const necIncome = income.form1099s.reduce((sum, f) => sum + (f.nonemployeeCompensation || 0), 0);
    const kIncome = income.form1099Ks.reduce((sum, f) => sum + (f.grossAmount || 0), 0);
    // Note: 1099-K income may overlap with 1099-NEC - user was warned about this
    return necIncome + kIncome;
  });

  readonly totalExpenses = computed(() => {
    const sc = this.scheduleC();
    return (sc.mileage.calculatedDeduction || 0) +
           (sc.supplies || 0) +
           (sc.phoneInternet || 0) +
           (sc.platformFees || 0) +
           (sc.otherExpenses || 0);
  });

  readonly netProfit = computed(() => {
    return Math.max(0, this.total1099Income() - this.totalExpenses());
  });

  // Estimated tax savings: SE tax (15.3%) + income tax (~12%) on expenses
  readonly estimatedTaxSavings = computed(() => {
    const effectiveRate = SELF_EMPLOYMENT_TAX.rate + 0.12;
    return this.totalExpenses() * effectiveRate;
  });

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  openHelpModal(): void {
    this.helpModal().open();
  }

  updateField(field: keyof ScheduleC, value: unknown): void {
    const current = this.scheduleC();
    this.sessionStorage.updateIncome((income) => ({
      ...income,
      scheduleC: {
        ...current,
        [field]: value,
        totalExpenses: this.totalExpenses(),
      },
    }));
  }

  onMilesChange(miles: number): void {
    const current = this.scheduleC();
    this.sessionStorage.updateIncome((income) => ({
      ...income,
      scheduleC: {
        ...current,
        mileage: {
          ...current.mileage,
          totalMiles: miles,
        },
      },
    }));
  }

  onMileageDeductionChange(deduction: number): void {
    const current = this.scheduleC();
    this.sessionStorage.updateIncome((income) => ({
      ...income,
      scheduleC: {
        ...current,
        mileage: {
          ...current.mileage,
          calculatedDeduction: deduction,
        },
      },
    }));
  }

  onContinue(): void {
    // Save total expenses before continuing
    const current = this.scheduleC();
    this.sessionStorage.updateIncome((income) => ({
      ...income,
      scheduleC: {
        ...current,
        totalExpenses: this.totalExpenses(),
      },
    }));

    // Navigate to income summary
    this.navigation.navigateTo('/income/summary');
  }

  onBack(): void {
    // Go back to the last 1099 type entered
    const income = this.sessionStorage.taxReturn().income;
    if (income.has1099KIncome) {
      this.navigation.navigateTo('/income/1099-k');
    } else if (income.hasDividendIncome) {
      this.navigation.navigateTo('/income/1099-div');
    } else if (income.hasInterestIncome) {
      this.navigation.navigateTo('/income/1099-int');
    } else if (income.has1099Income) {
      this.navigation.navigateTo('/income/1099');
    } else {
      this.navigation.navigateTo('/income/types');
    }
  }
}
