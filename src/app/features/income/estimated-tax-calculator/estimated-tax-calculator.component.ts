import { ChangeDetectionStrategy, Component, computed, inject, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationService, SessionStorageService } from '@core/services';
import {
  SELF_EMPLOYMENT_TAX,
  ESTIMATED_TAX_DUE_DATES,
  ESTIMATED_TAX_THRESHOLD,
  TAX_BRACKETS,
} from '@core/constants/tax-year-2025';
import {
  NavigationHeaderComponent,
  EducationalModalComponent,
  ContinueButtonComponent,
} from '@shared/components';

@Component({
  selector: 'app-estimated-tax-calculator',
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
          <h1>Quarterly Estimated Taxes</h1>
          <button class="help-trigger" (click)="openHelpModal()" type="button">
            <span class="help-icon">?</span>
            <span>Why quarterly payments?</span>
          </button>
        </header>

        <p class="instruction">
          Since no taxes are withheld from your 1099 income, you may need to make quarterly
          estimated tax payments to avoid penalties.
        </p>

        @if (total1099Income() === 0) {
          <div class="no-income-notice">
            <p>You haven't entered any 1099 income yet. This calculator is for self-employment income.</p>
          </div>
        } @else {
          <div class="income-summary">
            <h2>Your Self-Employment Income</h2>
            <div class="summary-row">
              <span>Gross 1099 Income:</span>
              <span class="value">{{ formatCurrency(total1099Income()) }}</span>
            </div>
            @if (totalExpenses() > 0) {
              <div class="summary-row">
                <span>Business Expenses:</span>
                <span class="value expense">- {{ formatCurrency(totalExpenses()) }}</span>
              </div>
            }
            <div class="summary-row total">
              <span>Net Self-Employment Income:</span>
              <span class="value">{{ formatCurrency(netSEIncome()) }}</span>
            </div>
          </div>

          <div class="tax-calculation">
            <h2>Estimated Tax Breakdown</h2>

            <div class="tax-item">
              <div class="tax-header">
                <span class="tax-name">Self-Employment Tax</span>
                <span class="tax-rate">15.3%</span>
              </div>
              <div class="tax-detail">
                <span>{{ formatCurrency(netSEIncome()) }} × 92.35% × 15.3%</span>
                <span class="tax-amount">{{ formatCurrency(selfEmploymentTax()) }}</span>
              </div>
              <p class="tax-note">
                This covers Social Security (12.4%) and Medicare (2.9%). As a self-employed worker,
                you pay both the employee and employer portions.
              </p>
            </div>

            <div class="tax-item">
              <div class="tax-header">
                <span class="tax-name">Estimated Income Tax</span>
                <span class="tax-rate">~{{ effectiveIncomeTaxRate() }}%</span>
              </div>
              <div class="tax-detail">
                <span>Based on {{ filingStatus() }} tax brackets</span>
                <span class="tax-amount">{{ formatCurrency(estimatedIncomeTax()) }}</span>
              </div>
              <p class="tax-note">
                This is a rough estimate. Your actual income tax depends on your total income,
                deductions, and credits.
              </p>
            </div>

            <div class="total-tax">
              <span>Total Estimated Tax:</span>
              <span class="amount">{{ formatCurrency(totalEstimatedTax()) }}</span>
            </div>
          </div>

          @if (totalEstimatedTax() >= estimatedTaxThreshold) {
            <div class="quarterly-payments">
              <h2>Your Quarterly Payments</h2>

              <div class="payment-notice warning">
                <div class="notice-icon">!</div>
                <div class="notice-content">
                  <strong>You may need to make quarterly payments</strong>
                  <p>
                    Since you could owe more than {{ formatCurrency(estimatedTaxThreshold) }} in taxes,
                    the IRS expects you to pay estimated taxes quarterly to avoid penalties.
                  </p>
                </div>
              </div>

              <div class="payment-schedule">
                <div class="payment-amount">
                  <span class="label">Each Quarterly Payment:</span>
                  <span class="amount">{{ formatCurrency(quarterlyPayment()) }}</span>
                </div>

                <div class="due-dates">
                  <h3>Due Dates</h3>
                  @for (date of dueDates; track date.quarter) {
                    <div class="due-date-row">
                      <span class="quarter">Q{{ date.quarter }}</span>
                      <span class="period">{{ date.periodCovered }}</span>
                      <span class="date">Due: {{ date.dueDate }}</span>
                    </div>
                  }
                </div>
              </div>

              <div class="how-to-pay">
                <h3>How to Pay</h3>
                <ul>
                  <li><strong>Online:</strong> IRS Direct Pay (irs.gov/payments) - free, no account needed</li>
                  <li><strong>By mail:</strong> Form 1040-ES with a check</li>
                  <li><strong>Through an app:</strong> Some tax apps can schedule payments</li>
                </ul>
              </div>
            </div>
          } @else {
            <div class="no-quarterly-notice">
              <div class="notice-icon">✓</div>
              <div class="notice-content">
                <strong>You probably don't need quarterly payments</strong>
                <p>
                  Your estimated tax of {{ formatCurrency(totalEstimatedTax()) }} is below the
                  {{ formatCurrency(estimatedTaxThreshold) }} threshold. You can likely wait until you
                  file your return to pay.
                </p>
              </div>
            </div>
          }

          <div class="w2-withholding-note">
            <h3>Have a W-2 job too?</h3>
            <p>
              If you also have W-2 income, the taxes withheld from your paycheck may cover your
              1099 tax liability. You can adjust your W-4 to withhold extra from your paycheck
              instead of making quarterly payments.
            </p>
            @if (totalWithheld() > 0) {
              <div class="withholding-info">
                <span>Your current W-2 withholding:</span>
                <span class="value">{{ formatCurrency(totalWithheld()) }}</span>
              </div>
              @if (totalWithheld() >= totalEstimatedTax()) {
                <p class="good-news">
                  Your W-2 withholding may already cover your estimated tax!
                </p>
              }
            }
          </div>
        }

        <app-continue-button
          (continue)="onContinue()"
          (back)="onBack()"
        />
      </div>
    </div>

    <app-educational-modal #helpModal [title]="'Why Quarterly Estimated Taxes?'">
      <p>
        The U.S. tax system is <strong>pay-as-you-go</strong>. When you have a W-2 job, your
        employer withholds taxes from each paycheck. But with 1099 income, no one withholds
        taxes—you receive the full amount.
      </p>
      <p><strong>The IRS expects you to pay quarterly if:</strong></p>
      <ul>
        <li>You expect to owe $1,000 or more in taxes</li>
        <li>Your withholding won't cover at least 90% of this year's tax</li>
        <li>Your withholding won't cover 100% of last year's tax</li>
      </ul>
      <p><strong>What happens if you don't pay quarterly?</strong></p>
      <p>
        You may owe an underpayment penalty when you file. The penalty is usually small (a few
        percentage points), but it's better to pay on time.
      </p>
      <p>
        <em>
          Pro tip: Many gig workers set aside 25-30% of each payment for taxes. Open a separate
          savings account just for taxes!
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

    .no-income-notice {
      padding: 2rem;
      background: var(--ngpf-gray-pale);
      border-radius: var(--radius-md);
      text-align: center;
      color: var(--ngpf-gray-dark);
    }

    .income-summary, .tax-calculation, .quarterly-payments {
      margin-bottom: 1.5rem;
      padding: 1.25rem;
      background: var(--ngpf-gray-pale);
      border-radius: var(--radius-md);

      h2 {
        font-size: 1rem;
        font-weight: 600;
        color: var(--ngpf-navy-dark);
        margin: 0 0 1rem;
      }
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.375rem 0;
      font-size: 0.9375rem;
      color: var(--ngpf-gray-dark);

      .value {
        font-weight: 500;
        color: var(--ngpf-navy-dark);

        &.expense {
          color: var(--ngpf-error);
        }
      }

      &.total {
        margin-top: 0.5rem;
        padding-top: 0.5rem;
        border-top: 1px solid var(--ngpf-gray-light);
        font-weight: 600;

        .value {
          color: var(--ngpf-navy-light);
          font-size: 1.125rem;
        }
      }
    }

    .tax-item {
      background: var(--ngpf-white);
      border-radius: var(--radius-sm);
      padding: 1rem;
      margin-bottom: 1rem;
    }

    .tax-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .tax-name {
      font-weight: 600;
      color: var(--ngpf-navy-dark);
    }

    .tax-rate {
      font-size: 0.875rem;
      color: var(--ngpf-gray);
    }

    .tax-detail {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.875rem;
      color: var(--ngpf-gray-dark);
    }

    .tax-amount {
      font-weight: 600;
      color: var(--ngpf-navy-light);
    }

    .tax-note {
      margin: 0.5rem 0 0;
      font-size: 0.8125rem;
      color: var(--ngpf-gray);
    }

    .total-tax {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: var(--ngpf-navy-light);
      border-radius: var(--radius-sm);
      color: var(--ngpf-white);
      font-weight: 600;

      .amount {
        font-size: 1.25rem;
      }
    }

    .payment-notice {
      display: flex;
      gap: 0.75rem;
      padding: 1rem;
      border-radius: var(--radius-sm);
      margin-bottom: 1rem;

      &.warning {
        background: var(--ngpf-warning-light);
        border: 1px solid var(--ngpf-warning);
      }
    }

    .notice-icon {
      flex-shrink: 0;
      width: 1.5rem;
      height: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      font-weight: 700;
      font-size: 0.875rem;

      .payment-notice.warning & {
        background: var(--ngpf-warning);
        color: #856404;
      }
    }

    .notice-content {
      flex: 1;

      strong {
        display: block;
        margin-bottom: 0.25rem;
      }

      .payment-notice.warning & {
        strong, p {
          color: #856404;
        }
      }

      p {
        margin: 0;
        font-size: 0.875rem;
      }
    }

    .no-quarterly-notice {
      display: flex;
      gap: 0.75rem;
      padding: 1rem;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: var(--radius-sm);
      margin-bottom: 1.5rem;

      .notice-icon {
        background: #10b981;
        color: white;
      }

      .notice-content {
        strong {
          color: #047857;
        }

        p {
          color: #047857;
        }
      }
    }

    .payment-schedule {
      background: var(--ngpf-white);
      border-radius: var(--radius-sm);
      padding: 1rem;
      margin-bottom: 1rem;
    }

    .payment-amount {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 1rem;
      margin-bottom: 1rem;
      border-bottom: 2px solid var(--ngpf-gray-light);

      .label {
        font-weight: 500;
        color: var(--ngpf-gray-dark);
      }

      .amount {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--ngpf-navy-light);
      }
    }

    .due-dates {
      h3 {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--ngpf-navy-dark);
        margin: 0 0 0.75rem;
      }
    }

    .due-date-row {
      display: grid;
      grid-template-columns: 2rem 1fr auto;
      gap: 0.75rem;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid var(--ngpf-gray-pale);
      font-size: 0.875rem;

      &:last-child {
        border-bottom: none;
      }
    }

    .quarter {
      font-weight: 600;
      color: var(--ngpf-navy-light);
    }

    .period {
      color: var(--ngpf-gray);
    }

    .date {
      font-weight: 500;
      color: var(--ngpf-navy-dark);
    }

    .how-to-pay {
      background: var(--ngpf-white);
      border-radius: var(--radius-sm);
      padding: 1rem;

      h3 {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--ngpf-navy-dark);
        margin: 0 0 0.5rem;
      }

      ul {
        margin: 0;
        padding-left: 1.25rem;

        li {
          font-size: 0.8125rem;
          color: var(--ngpf-gray-dark);
          margin-bottom: 0.375rem;
        }
      }
    }

    .w2-withholding-note {
      padding: 1rem;
      background: var(--ngpf-blue-pale);
      border-radius: var(--radius-sm);
      margin-bottom: 1.5rem;

      h3 {
        font-size: 0.9375rem;
        font-weight: 600;
        color: var(--ngpf-navy-dark);
        margin: 0 0 0.5rem;
      }

      p {
        font-size: 0.875rem;
        color: var(--ngpf-gray-dark);
        margin: 0 0 0.75rem;
      }

      .good-news {
        color: #047857;
        font-weight: 500;
      }
    }

    .withholding-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem;
      background: var(--ngpf-white);
      border-radius: var(--radius-xs);
      font-size: 0.875rem;
      margin-bottom: 0.5rem;

      .value {
        font-weight: 600;
        color: var(--ngpf-navy-light);
      }
    }
  `,
})
export class EstimatedTaxCalculatorComponent {
  private readonly navigation = inject(NavigationService);
  private readonly sessionStorage = inject(SessionStorageService);

  readonly helpModal = viewChild.required<EducationalModalComponent>('helpModal');

  readonly dueDates = ESTIMATED_TAX_DUE_DATES;
  readonly estimatedTaxThreshold = ESTIMATED_TAX_THRESHOLD;

  readonly filingStatus = computed(() => {
    const status = this.sessionStorage.taxReturn().personalInfo.filingStatus;
    switch (status) {
      case 'single': return 'Single';
      case 'married-jointly': return 'Married Filing Jointly';
      case 'head-of-household': return 'Head of Household';
      default: return 'Single';
    }
  });

  readonly total1099Income = computed(() => {
    const income = this.sessionStorage.taxReturn().income;
    const necIncome = income.form1099s.reduce((sum, f) => sum + (f.nonemployeeCompensation || 0), 0);
    const kIncome = income.form1099Ks.reduce((sum, f) => sum + (f.grossAmount || 0), 0);
    return necIncome + kIncome;
  });

  readonly totalExpenses = computed(() => {
    const scheduleC = this.sessionStorage.taxReturn().income.scheduleC;
    return scheduleC?.totalExpenses ?? 0;
  });

  readonly netSEIncome = computed(() => {
    return Math.max(0, this.total1099Income() - this.totalExpenses());
  });

  readonly selfEmploymentTax = computed(() => {
    const netEarnings = this.netSEIncome() * SELF_EMPLOYMENT_TAX.netEarningsMultiplier;
    return netEarnings * SELF_EMPLOYMENT_TAX.rate;
  });

  readonly estimatedIncomeTax = computed(() => {
    // Get total income including W-2
    const income = this.sessionStorage.taxReturn().income;
    const w2Wages = income.w2s.reduce((sum, w2) => sum + (w2.wagesTips || 0), 0);
    const totalIncome = w2Wages + this.netSEIncome();

    // Subtract half of SE tax (it's an adjustment)
    const adjustedIncome = totalIncome - (this.selfEmploymentTax() * SELF_EMPLOYMENT_TAX.deductionRate);

    // Apply standard deduction (simplified)
    const status = this.sessionStorage.taxReturn().personalInfo.filingStatus || 'single';
    const standardDeduction = status === 'married-jointly' ? 31500 : status === 'head-of-household' ? 23625 : 15750;
    const taxableIncome = Math.max(0, adjustedIncome - standardDeduction);

    // Calculate tax using brackets
    const brackets = TAX_BRACKETS[status] || TAX_BRACKETS['single'];
    let tax = 0;
    let remainingIncome = taxableIncome;

    for (const bracket of brackets) {
      const taxableInBracket = Math.min(remainingIncome, bracket.max - bracket.min);
      if (taxableInBracket <= 0) break;
      tax += taxableInBracket * bracket.rate;
      remainingIncome -= taxableInBracket;
    }

    // Return only the portion attributable to SE income (proportional)
    if (totalIncome > 0) {
      const seIncomeRatio = this.netSEIncome() / totalIncome;
      return tax * seIncomeRatio;
    }
    return tax;
  });

  readonly effectiveIncomeTaxRate = computed(() => {
    if (this.netSEIncome() === 0) return 0;
    return Math.round((this.estimatedIncomeTax() / this.netSEIncome()) * 100);
  });

  readonly totalEstimatedTax = computed(() => {
    return this.selfEmploymentTax() + this.estimatedIncomeTax();
  });

  readonly quarterlyPayment = computed(() => {
    return this.totalEstimatedTax() / 4;
  });

  readonly totalWithheld = computed(() => {
    const income = this.sessionStorage.taxReturn().income;
    return income.w2s.reduce((sum, w2) => sum + (w2.federalWithheld || 0), 0);
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

  onContinue(): void {
    this.navigation.navigateTo('/income/summary');
  }

  onBack(): void {
    this.navigation.navigateTo('/income/schedule-c');
  }
}
