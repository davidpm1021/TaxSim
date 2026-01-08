import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationService, SessionStorageService, TaxDataService } from '@core/services';
import { DEDUCTION_LIMITS, SELF_EMPLOYMENT_TAX } from '@core/constants/tax-year-2025';
import {
  NavigationHeaderComponent,
  EducationalModalComponent,
  CurrencyInputComponent,
  ContinueButtonComponent,
} from '@shared/components';

type ModalTopic =
  | 'mortgage'
  | 'student-loan'
  | 'salt'
  | 'charitable'
  | 'medical'
  | 'overview';

@Component({
  selector: 'app-itemized-entry',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NavigationHeaderComponent,
    EducationalModalComponent,
    CurrencyInputComponent,
    ContinueButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-navigation-header />

    <div class="page-container">
      <div class="content-card">
        <header class="section-header">
          <h1>Itemized Deductions</h1>
          <p class="intro-text">
            Let's see if itemizing your deductions could save you money. Enter any of the
            following expenses you paid this year.
          </p>
          <button class="help-trigger" (click)="openModal('overview')" type="button">
            <span class="help-icon">?</span>
            <span>What are itemized deductions?</span>
          </button>
        </header>

        <div class="deduction-form">
          <!-- Mortgage Interest -->
          <div class="form-group">
            <div class="label-row">
              <label for="mortgage">Mortgage Interest</label>
              <button
                class="info-btn"
                (click)="openModal('mortgage')"
                type="button"
                aria-label="Learn about mortgage interest deduction"
              >
                ?
              </button>
            </div>
            <p class="field-hint">Interest paid on your home mortgage (Form 1098)</p>
            <app-currency-input
              inputId="mortgage"
              placeholder="0"
              [ngModel]="mortgageInterest()"
              (ngModelChange)="mortgageInterest.set($event)"
              ariaLabel="Mortgage interest amount"
            />
          </div>

          <!-- Student Loan Interest -->
          <div class="form-group">
            <div class="label-row">
              <label for="studentLoan">Student Loan Interest</label>
              <button
                class="info-btn"
                (click)="openModal('student-loan')"
                type="button"
                aria-label="Learn about student loan interest deduction"
              >
                ?
              </button>
            </div>
            <p class="field-hint">
              Interest paid on qualified student loans
              <span class="limit-badge">Max {{ formatCurrency(studentLoanLimit) }}</span>
            </p>
            <app-currency-input
              inputId="studentLoan"
              placeholder="0"
              [ngModel]="studentLoanInterest()"
              (ngModelChange)="studentLoanInterest.set($event)"
              ariaLabel="Student loan interest amount"
            />
            @if (studentLoanInterest() > studentLoanLimit) {
              <p class="limit-warning">
                Only {{ formatCurrency(studentLoanLimit) }} can be deducted
              </p>
            }
          </div>

          <!-- State and Local Taxes (SALT) -->
          <div class="form-group">
            <div class="label-row">
              <label for="salt">State and Local Taxes (SALT)</label>
              <button
                class="info-btn"
                (click)="openModal('salt')"
                type="button"
                aria-label="Learn about SALT deduction"
              >
                ?
              </button>
            </div>
            <p class="field-hint">
              State income taxes, property taxes, or sales taxes
              <span class="limit-badge">Max {{ formatCurrency(saltLimit) }}</span>
            </p>
            <app-currency-input
              inputId="salt"
              placeholder="0"
              [ngModel]="saltTaxes()"
              (ngModelChange)="saltTaxes.set($event)"
              ariaLabel="State and local taxes amount"
            />
            @if (saltTaxes() > saltLimit) {
              <p class="limit-warning">
                Only {{ formatCurrency(saltLimit) }} can be deducted (SALT cap)
              </p>
            }
          </div>

          <!-- Charitable Contributions -->
          <div class="form-group">
            <div class="label-row">
              <label for="charitable">Charitable Contributions</label>
              <button
                class="info-btn"
                (click)="openModal('charitable')"
                type="button"
                aria-label="Learn about charitable contribution deduction"
              >
                ?
              </button>
            </div>
            <p class="field-hint">
              Donations to qualified charitable organizations
            </p>
            <app-currency-input
              inputId="charitable"
              placeholder="0"
              [ngModel]="charitableContributions()"
              (ngModelChange)="charitableContributions.set($event)"
              ariaLabel="Charitable contributions amount"
            />
          </div>

          <!-- Medical Expenses -->
          <div class="form-group">
            <div class="label-row">
              <label for="medical">Medical Expenses</label>
              <button
                class="info-btn"
                (click)="openModal('medical')"
                type="button"
                aria-label="Learn about medical expense deduction"
              >
                ?
              </button>
            </div>
            <p class="field-hint">
              Enter your TOTAL out-of-pocket medical costs — we'll calculate the deductible amount (portion above 7.5% of your income)
            </p>
            <app-currency-input
              inputId="medical"
              placeholder="0"
              [ngModel]="medicalExpenses()"
              (ngModelChange)="medicalExpenses.set($event)"
              ariaLabel="Medical expenses amount"
            />
            @if (medicalExpenses() > 0) {
              <div class="medical-calculation">
                <div class="calc-row">
                  <span>Your AGI:</span>
                  <span>{{ formatCurrency(agi()) }}</span>
                </div>
                <div class="calc-row">
                  <span>7.5% Threshold:</span>
                  <span>{{ formatCurrency(medicalThreshold()) }}</span>
                </div>
                <div class="calc-row result">
                  <span>Deductible Amount:</span>
                  <span>{{ formatCurrency(deductibleMedical()) }}</span>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Summary Preview -->
        <div class="summary-preview">
          <h2>Your Itemized Total</h2>
          <div class="summary-rows">
            @if (mortgageInterest() > 0) {
              <div class="summary-row">
                <span>Mortgage Interest</span>
                <span>{{ formatCurrency(mortgageInterest()) }}</span>
              </div>
            }
            @if (studentLoanInterest() > 0) {
              <div class="summary-row">
                <span>Student Loan Interest</span>
                <span>{{ formatCurrency(effectiveStudentLoan()) }}</span>
              </div>
            }
            @if (saltTaxes() > 0) {
              <div class="summary-row">
                <span>State & Local Taxes</span>
                <span>{{ formatCurrency(effectiveSalt()) }}</span>
              </div>
            }
            @if (charitableContributions() > 0) {
              <div class="summary-row">
                <span>Charitable Contributions</span>
                <span>{{ formatCurrency(charitableContributions()) }}</span>
              </div>
            }
            @if (deductibleMedical() > 0) {
              <div class="summary-row">
                <span>Medical Expenses (above 7.5%)</span>
                <span>{{ formatCurrency(deductibleMedical()) }}</span>
              </div>
            }
            @if (totalItemized() === 0) {
              <div class="summary-row empty">
                <span>No deductions entered yet</span>
              </div>
            }
          </div>
          <div class="summary-total">
            <span>Total Itemized Deductions</span>
            <span class="total-amount">{{ formatCurrency(totalItemized()) }}</span>
          </div>
        </div>

        <app-continue-button
          (continue)="onContinue()"
          (back)="onBack()"
        />
      </div>
    </div>

    <!-- Educational Modals -->
    <app-educational-modal #overviewModal [title]="'What Are Itemized Deductions?'">
      <p>
        <strong>Itemized deductions</strong> are specific expenses the IRS allows you to subtract
        from your taxable income. Instead of taking the standard deduction (a fixed amount),
        you can "itemize" by listing out qualifying expenses.
      </p>
      <p>
        Common itemized deductions include mortgage interest, state and local taxes,
        charitable donations, and medical expenses. You should itemize only if your
        total exceeds the standard deduction.
      </p>
      <p>
        <em>Don't worry if you don't have many expenses to list—about 90% of taxpayers
        use the standard deduction. We'll help you compare both options!</em>
      </p>
    </app-educational-modal>

    <app-educational-modal #mortgageModal [title]="'Mortgage Interest Deduction'">
      <p>
        If you have a home loan, you can deduct the interest you pay on your mortgage.
        This is one of the largest deductions available for homeowners.
      </p>
      <p>
        Your mortgage lender sends you <strong>Form 1098</strong> each year showing
        how much interest you paid. The deduction applies to your primary home and
        possibly a second home.
      </p>
      <p>
        <em>Example: If you paid $8,000 in mortgage interest this year, you can deduct
        that full amount from your taxable income.</em>
      </p>
    </app-educational-modal>

    <app-educational-modal #studentLoanModal [title]="'Student Loan Interest Deduction'">
      <p>
        You can deduct up to <strong>{{ formatCurrency(studentLoanLimit) }}</strong> in
        interest paid on qualified student loans. This is an "above-the-line" deduction,
        meaning you can take it even if you don't itemize.
      </p>
      <p>
        The loan must have been used to pay for qualified education expenses like
        tuition, room and board, and books.
      </p>
      <p>
        <em>Note: This deduction phases out at higher incomes, but for most students
        and recent graduates, the full deduction is available.</em>
      </p>
    </app-educational-modal>

    <app-educational-modal #saltModal [title]="'State and Local Tax (SALT) Deduction'">
      <p>
        SALT lets you deduct state and local taxes you've paid, including:
      </p>
      <ul>
        <li>State income taxes (shown on your W-2 or state return)</li>
        <li>Property taxes on your home</li>
        <li>Sales taxes (if you choose this instead of income taxes)</li>
      </ul>
      <p>
        <strong>Important:</strong> The SALT deduction is capped at
        <strong>{{ formatCurrency(saltLimit) }}</strong> per year. This cap affects
        taxpayers in high-tax states the most.
      </p>
    </app-educational-modal>

    <app-educational-modal #charitableModal [title]="'Charitable Contributions'">
      <p>
        Donations to qualified charities—like religious organizations, educational
        institutions, and nonprofits—can be deducted when you itemize.
      </p>
      <p>
        Keep records of your donations! For cash gifts, you need a receipt or bank
        record. For donations over $250, you need written acknowledgment from the
        charity.
      </p>
      <p>
        <em>This includes monetary donations, donated goods (at fair market value),
        and even mileage driven for charitable purposes.</em>
      </p>
    </app-educational-modal>

    <app-educational-modal #medicalModal [title]="'Medical Expense Deduction'">
      <p>
        You can deduct medical expenses, but only the amount that exceeds
        <strong>7.5% of your Adjusted Gross Income (AGI)</strong>.
      </p>
      <p>
        Qualifying expenses include doctor visits, prescriptions, health insurance
        premiums (if not paid pre-tax), dental work, vision care, and medical equipment.
      </p>
      <p>
        <em>Example: If your AGI is $40,000, your threshold is $3,000 (7.5% × $40,000).
        If you had $5,000 in medical expenses, only $2,000 would be deductible.</em>
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
      max-width: 700px;
      margin: 0 auto;
      background: var(--ngpf-white);
      border-radius: var(--radius-lg);
      padding: 2rem;
      box-shadow: var(--shadow-md);
    }

    .section-header {
      margin-bottom: 2rem;

      h1 {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--ngpf-navy-dark);
        margin: 0 0 0.75rem;
      }
    }

    .intro-text {
      color: var(--ngpf-gray-dark);
      font-size: 0.9375rem;
      line-height: 1.5;
      margin: 0 0 0.75rem;
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

    .deduction-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .form-group {
      label {
        display: block;
        font-weight: 600;
        color: var(--ngpf-navy-dark);
        margin-bottom: 0.25rem;
      }
    }

    .label-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.25rem;
    }

    .field-hint {
      font-size: 0.8125rem;
      color: var(--ngpf-gray-dark);
      margin: 0 0 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .limit-badge {
      display: inline-block;
      background: var(--ngpf-blue-pale);
      color: var(--ngpf-navy);
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.125rem 0.5rem;
      border-radius: 9999px;
    }

    .info-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.125rem;
      height: 1.125rem;
      background: var(--ngpf-navy-light);
      color: var(--ngpf-white);
      border: none;
      border-radius: 50%;
      font-size: 0.6875rem;
      font-weight: 600;
      cursor: pointer;
      flex-shrink: 0;

      &:hover {
        background: var(--ngpf-navy);
      }
    }

    .limit-warning {
      font-size: 0.8125rem;
      color: var(--ngpf-error);
      margin: 0.375rem 0 0;
      display: flex;
      align-items: center;
      gap: 0.25rem;

      &::before {
        content: '!';
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 1rem;
        height: 1rem;
        background: var(--ngpf-error-light);
        color: var(--ngpf-error);
        border-radius: 50%;
        font-size: 0.625rem;
        font-weight: 700;
      }
    }

    .medical-calculation {
      margin-top: 0.75rem;
      padding: 0.75rem;
      background: var(--ngpf-gray-pale);
      border: 1px solid var(--ngpf-gray-light);
      border-radius: var(--radius-sm);
      font-size: 0.8125rem;
    }

    .calc-row {
      display: flex;
      justify-content: space-between;
      padding: 0.25rem 0;
      color: var(--ngpf-gray);

      &.result {
        border-top: 1px solid var(--ngpf-gray-light);
        margin-top: 0.5rem;
        padding-top: 0.5rem;
        font-weight: 600;
        color: var(--ngpf-navy-dark);
      }
    }

    .summary-preview {
      background: var(--ngpf-blue-pale);
      border-radius: var(--radius-md);
      padding: 1.25rem;
      margin-bottom: 1.5rem;

      h2 {
        font-size: 1rem;
        font-weight: 600;
        color: var(--ngpf-navy-dark);
        margin: 0 0 1rem;
      }
    }

    .summary-rows {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.875rem;
      color: var(--ngpf-gray-dark);

      &.empty {
        color: var(--ngpf-gray);
        font-style: italic;
        justify-content: center;
      }
    }

    .summary-total {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 0.75rem;
      border-top: 2px solid var(--ngpf-navy-light);
      font-weight: 600;
      color: var(--ngpf-navy-dark);
    }

    .total-amount {
      font-size: 1.125rem;
      color: var(--ngpf-navy-light);
    }

    app-educational-modal ul {
      margin: 0.5rem 0;
      padding-left: 1.25rem;

      li {
        margin-bottom: 0.25rem;
      }
    }
  `,
})
export class ItemizedEntryComponent {
  private readonly navigation = inject(NavigationService);
  private readonly sessionStorage = inject(SessionStorageService);
  private readonly taxData = inject(TaxDataService);

  // Modal references
  readonly overviewModal = viewChild.required<EducationalModalComponent>('overviewModal');
  readonly mortgageModal = viewChild.required<EducationalModalComponent>('mortgageModal');
  readonly studentLoanModal = viewChild.required<EducationalModalComponent>('studentLoanModal');
  readonly saltModal = viewChild.required<EducationalModalComponent>('saltModal');
  readonly charitableModal = viewChild.required<EducationalModalComponent>('charitableModal');
  readonly medicalModal = viewChild.required<EducationalModalComponent>('medicalModal');

  // Deduction limits from constants
  readonly studentLoanLimit = DEDUCTION_LIMITS.studentLoanInterest;
  readonly saltLimit = DEDUCTION_LIMITS.saltTaxes;
  readonly medicalFloor = DEDUCTION_LIMITS.medicalExpenseFloor;

  // Form field signals initialized from session storage
  readonly mortgageInterest = signal(this.sessionStorage.taxReturn().deductions.mortgageInterest);
  readonly studentLoanInterest = signal(this.sessionStorage.taxReturn().deductions.studentLoanInterest);
  readonly saltTaxes = signal(this.sessionStorage.taxReturn().deductions.saltTaxes);
  readonly charitableContributions = signal(this.sessionStorage.taxReturn().deductions.charitableContributions);
  readonly medicalExpenses = signal(this.sessionStorage.taxReturn().deductions.medicalExpenses);

  // Calculate AGI for medical expense threshold
  readonly agi = computed(() => {
    const income = this.sessionStorage.taxReturn().income;
    const totalW2 = income.w2s.reduce((sum, w2) => sum + (w2.wagesTips || 0), 0);
    const total1099 = income.form1099s.reduce((sum, f) => sum + (f.nonemployeeCompensation || 0), 0);
    const grossIncome = totalW2 + total1099;

    // Deduct half of SE tax
    const netSEEarnings = total1099 * SELF_EMPLOYMENT_TAX.netEarningsMultiplier;
    const seTax = netSEEarnings * SELF_EMPLOYMENT_TAX.rate;
    const seDeduction = seTax * SELF_EMPLOYMENT_TAX.deductionRate;

    return grossIncome - seDeduction;
  });

  readonly medicalThreshold = computed(() => this.agi() * this.medicalFloor);

  readonly deductibleMedical = computed(() => {
    const excess = this.medicalExpenses() - this.medicalThreshold();
    return excess > 0 ? excess : 0;
  });

  // Effective amounts after applying limits
  readonly effectiveStudentLoan = computed(() =>
    Math.min(this.studentLoanInterest(), this.studentLoanLimit)
  );

  readonly effectiveSalt = computed(() =>
    Math.min(this.saltTaxes(), this.saltLimit)
  );

  // Total itemized deductions
  readonly totalItemized = computed(() => {
    return (
      this.mortgageInterest() +
      this.effectiveStudentLoan() +
      this.effectiveSalt() +
      this.charitableContributions() +
      this.deductibleMedical()
    );
  });

  openModal(topic: ModalTopic): void {
    switch (topic) {
      case 'overview':
        this.overviewModal().open();
        break;
      case 'mortgage':
        this.mortgageModal().open();
        break;
      case 'student-loan':
        this.studentLoanModal().open();
        break;
      case 'salt':
        this.saltModal().open();
        break;
      case 'charitable':
        this.charitableModal().open();
        break;
      case 'medical':
        this.medicalModal().open();
        break;
    }
  }

  formatCurrency(amount: number): string {
    return this.taxData.formatCurrency(amount);
  }

  onContinue(): void {
    // Save deductions to session storage
    this.sessionStorage.updateDeductions((current) => ({
      ...current,
      mortgageInterest: this.mortgageInterest(),
      studentLoanInterest: this.studentLoanInterest(),
      saltTaxes: this.saltTaxes(),
      charitableContributions: this.charitableContributions(),
      medicalExpenses: this.medicalExpenses(),
    }));

    this.navigation.navigateTo('/deductions/comparison');
  }

  onBack(): void {
    this.navigation.navigateTo('/income/summary');
  }
}
