import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NavigationService,
  SessionStorageService,
  TaxDataService,
  TaxCalculationService,
} from '@core/services';
import { CHILD_TAX_CREDIT, SELF_EMPLOYMENT_TAX } from '@core/constants/tax-year-2025';
import {
  NavigationHeaderComponent,
  EducationalModalComponent,
  ContinueButtonComponent,
} from '@shared/components';

@Component({
  selector: 'app-credits-summary',
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
          <h1>Tax Credits You Qualify For</h1>
          <button class="help-trigger" (click)="openCreditsVsDeductionsModal()" type="button">
            <span class="help-icon">?</span>
            <span>Credits vs. Deductions - what's the difference?</span>
          </button>
        </header>

        @if (hasAnyCredits()) {
          <div class="credits-list">
            <!-- Child Tax Credit -->
            @if (childTaxCredit() > 0) {
              <div class="credit-card">
                <div class="credit-header">
                  <div class="credit-check">&#10003;</div>
                  <div class="credit-info">
                    <h2>Child Tax Credit</h2>
                    <button
                      class="info-btn"
                      (click)="openCTCModal()"
                      type="button"
                      aria-label="Learn about Child Tax Credit"
                    >
                      ?
                    </button>
                  </div>
                  <div class="credit-amount">{{ formatCurrency(childTaxCredit()) }}</div>
                </div>
                <div class="credit-details">
                  <p>
                    For {{ qualifyingChildrenCount() }}
                    qualifying {{ qualifyingChildrenCount() === 1 ? 'child' : 'children' }}:
                  </p>
                  <ul class="children-list">
                    @for (child of qualifyingChildren(); track child.id) {
                      <li>{{ child.firstName }}, age {{ child.age }}</li>
                    }
                  </ul>
                  @if (childTaxCreditRefundable() > 0) {
                    <p class="refundable-note">
                      Up to {{ formatCurrency(childTaxCreditRefundable()) }} is refundable
                      (Additional Child Tax Credit)
                    </p>
                  }
                </div>
              </div>
            }

            <!-- Earned Income Tax Credit -->
            @if (earnedIncomeCredit() > 0) {
              <div class="credit-card">
                <div class="credit-header">
                  <div class="credit-check">&#10003;</div>
                  <div class="credit-info">
                    <h2>Earned Income Tax Credit</h2>
                    <button
                      class="info-btn"
                      (click)="openEITCModal()"
                      type="button"
                      aria-label="Learn about Earned Income Tax Credit"
                    >
                      ?
                    </button>
                  </div>
                  <div class="credit-amount">{{ formatCurrency(earnedIncomeCredit()) }}</div>
                </div>
                <div class="credit-details">
                  <p>Based on your earned income and family size</p>
                  <p class="refundable-note">
                    This credit is fully refundable - you get the full amount even if you don't owe any tax!
                  </p>
                </div>
              </div>
            }
          </div>

          <!-- Total Credits Summary -->
          <div class="total-credits">
            <div class="total-row">
              <span class="total-label">Total Tax Credits</span>
              <span class="total-amount">{{ formatCurrency(totalCredits()) }}</span>
            </div>
            <p class="total-note">
              These credits will reduce your tax bill dollar-for-dollar.
              @if (hasRefundableCredits()) {
                Some of your credits are refundable, meaning you could get money back
                even if you don't owe any tax.
              }
            </p>
          </div>
        } @else {
          <!-- No Credits Available -->
          <div class="no-credits">
            <div class="no-credits-icon">
              <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
            </div>
            <h2>No Tax Credits This Year</h2>
            <p>
              Based on the information you entered, you don't qualify for any tax credits
              this year. This is common for many filers!
            </p>
            <div class="ineligibility-reasons">
              <h3>Common reasons you might not qualify:</h3>
              <ul>
                @if (claimedAsDependent()) {
                  <li>
                    <strong>Claimed as a dependent:</strong> If someone else claims you as a
                    dependent, you're not eligible for most credits.
                  </li>
                }
                @if (!hasQualifyingChildren()) {
                  <li>
                    <strong>No qualifying children:</strong> The Child Tax Credit requires
                    dependent children under age 17.
                  </li>
                }
                @if (incomeAboveEITCLimit()) {
                  <li>
                    <strong>Income above EITC limits:</strong> The Earned Income Tax Credit
                    has income limits that vary by filing status and family size.
                  </li>
                }
              </ul>
            </div>
            <button class="learn-more-btn" (click)="openCreditsVsDeductionsModal()" type="button">
              Learn more about tax credits
            </button>
          </div>
        }

        <app-continue-button
          (continue)="onContinue()"
          (back)="onBack()"
        />
      </div>
    </div>

    <!-- Educational Modals -->
    <app-educational-modal #creditsVsDeductionsModal [title]="'Credits vs. Deductions'">
      <p>
        Both credits and deductions reduce your taxes, but they work very differently:
      </p>
      <p>
        <strong>Tax Deductions</strong> reduce your <em>taxable income</em>. If you're in the 12%
        tax bracket and claim a $1,000 deduction, you save $120 in taxes (12% × $1,000).
      </p>
      <p>
        <strong>Tax Credits</strong> reduce your <em>actual tax bill</em> dollar-for-dollar.
        A $1,000 credit saves you exactly $1,000 in taxes - much more powerful!
      </p>
      <p>
        Some credits are <strong>refundable</strong>, meaning you get the full amount even
        if you don't owe any tax. Others are <strong>non-refundable</strong> and can only
        reduce your tax to $0.
      </p>
    </app-educational-modal>

    <app-educational-modal #ctcModal [title]="'Child Tax Credit (CTC)'">
      <p>
        The <strong>Child Tax Credit</strong> provides up to <strong>$2,000 per qualifying child</strong>
        to help families with the costs of raising children.
      </p>
      <p><strong>To qualify, a child must:</strong></p>
      <ul>
        <li>Be under age 17 at the end of the tax year</li>
        <li>Be your son, daughter, stepchild, or other eligible relative</li>
        <li>Have lived with you for more than half the year</li>
        <li>Be claimed as your dependent</li>
      </ul>
      <p>
        <strong>Refundable portion:</strong> Up to $1,700 per child is refundable as the
        Additional Child Tax Credit (ACTC), meaning you can receive it even if you don't
        owe any tax.
      </p>
    </app-educational-modal>

    <app-educational-modal #eitcModal [title]="'Earned Income Tax Credit (EITC)'">
      <p>
        The <strong>Earned Income Tax Credit</strong> is a refundable credit for low-to-moderate
        income workers. It's one of the most valuable credits available!
      </p>
      <p><strong>Key features:</strong></p>
      <ul>
        <li>Credit amount depends on your income, filing status, and number of children</li>
        <li>Maximum credit ranges from ~$632 (no children) to ~$7,830 (3+ children)</li>
        <li>Fully refundable - you get the full amount as a refund if you don't owe tax</li>
        <li>You must have earned income (wages, salary, or self-employment income)</li>
      </ul>
      <p>
        <strong>Important:</strong> You cannot claim the EITC if someone else can claim
        you as a dependent on their tax return.
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
      margin-bottom: 1.5rem;

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

    .credits-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .credit-card {
      border: 2px solid var(--ngpf-success);
      border-radius: var(--radius-md);
      overflow: hidden;
      background: var(--ngpf-success-light);
    }

    .credit-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.25rem;
      background: var(--ngpf-white);
      border-bottom: 1px solid var(--ngpf-success-light);
    }

    .credit-check {
      width: 2rem;
      height: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--ngpf-success);
      color: var(--ngpf-white);
      border-radius: 50%;
      font-size: 1rem;
      font-weight: 600;
      flex-shrink: 0;
    }

    .credit-info {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 0.5rem;

      h2 {
        font-size: 1.0625rem;
        font-weight: 600;
        color: var(--ngpf-navy-dark);
        margin: 0;
      }
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

    .credit-amount {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--ngpf-success);
    }

    .credit-details {
      padding: 1rem 1.25rem;

      p {
        margin: 0 0 0.5rem;
        font-size: 0.875rem;
        color: var(--ngpf-gray-dark);
      }
    }

    .children-list {
      margin: 0.5rem 0;
      padding-left: 1.25rem;
      font-size: 0.875rem;
      color: var(--ngpf-gray-dark);

      li {
        margin-bottom: 0.25rem;
      }
    }

    .refundable-note {
      background: var(--ngpf-success-light);
      padding: 0.5rem 0.75rem;
      border-radius: var(--radius-sm);
      font-size: 0.8125rem;
      color: var(--ngpf-success);
      margin-top: 0.75rem;
    }

    .total-credits {
      background: var(--ngpf-blue-pale);
      border-radius: var(--radius-md);
      padding: 1.25rem;
      margin-bottom: 1.5rem;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .total-label {
      font-size: 1.0625rem;
      font-weight: 600;
      color: var(--ngpf-navy-dark);
    }

    .total-amount {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--ngpf-navy-light);
    }

    .total-note {
      margin: 0;
      font-size: 0.875rem;
      color: var(--ngpf-gray-dark);
      line-height: 1.5;
    }

    .no-credits {
      text-align: center;
      padding: 2rem 1rem;

      h2 {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--ngpf-navy-dark);
        margin: 1rem 0 0.5rem;
      }

      > p {
        color: var(--ngpf-gray-dark);
        font-size: 0.9375rem;
        margin: 0 0 1.5rem;
        max-width: 400px;
        margin-left: auto;
        margin-right: auto;
      }
    }

    .no-credits-icon {
      color: var(--ngpf-gray);
    }

    .ineligibility-reasons {
      text-align: left;
      background: var(--ngpf-gray-pale);
      border-radius: var(--radius-md);
      padding: 1.25rem;
      margin-bottom: 1.5rem;

      h3 {
        font-size: 0.9375rem;
        font-weight: 600;
        color: var(--ngpf-navy-dark);
        margin: 0 0 0.75rem;
      }

      ul {
        margin: 0;
        padding-left: 1.25rem;
      }

      li {
        margin-bottom: 0.75rem;
        font-size: 0.875rem;
        color: var(--ngpf-gray-dark);
        line-height: 1.4;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }

    .learn-more-btn {
      background: none;
      border: none;
      color: var(--ngpf-navy-light);
      font-size: 0.9375rem;
      cursor: pointer;
      text-decoration: underline;
      padding: 0;

      &:hover {
        color: var(--ngpf-navy);
      }
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
export class CreditsSummaryComponent implements OnInit {
  private readonly navigation = inject(NavigationService);
  private readonly sessionStorage = inject(SessionStorageService);
  private readonly taxData = inject(TaxDataService);
  private readonly taxCalculation = inject(TaxCalculationService);

  // Modal references
  readonly creditsVsDeductionsModal = viewChild.required<EducationalModalComponent>('creditsVsDeductionsModal');
  readonly ctcModal = viewChild.required<EducationalModalComponent>('ctcModal');
  readonly eitcModal = viewChild.required<EducationalModalComponent>('eitcModal');

  // Credit amounts
  readonly childTaxCredit = signal(0);
  readonly childTaxCreditRefundable = signal(0);
  readonly earnedIncomeCredit = signal(0);

  // Computed values
  readonly totalCredits = computed(() =>
    this.childTaxCredit() + this.earnedIncomeCredit()
  );

  readonly hasAnyCredits = computed(() => this.totalCredits() > 0);

  readonly hasRefundableCredits = computed(() =>
    this.childTaxCreditRefundable() > 0 || this.earnedIncomeCredit() > 0
  );

  // Personal info access
  readonly claimedAsDependent = computed(() =>
    this.sessionStorage.taxReturn().personalInfo.claimedAsDependent
  );

  readonly qualifyingChildren = computed(() =>
    this.sessionStorage.taxReturn().personalInfo.dependents.filter(
      (d) => d.age <= CHILD_TAX_CREDIT.childMaxAge && d.livedWithFiler
    )
  );

  readonly qualifyingChildrenCount = computed(() => this.qualifyingChildren().length);

  readonly hasQualifyingChildren = computed(() => this.qualifyingChildrenCount() > 0);

  readonly incomeAboveEITCLimit = computed(() => {
    const taxReturn = this.sessionStorage.taxReturn();
    const totalW2 = taxReturn.income.w2s.reduce((sum, w2) => sum + (w2.wagesTips || 0), 0);
    const total1099 = taxReturn.income.form1099s.reduce((sum, f) => sum + (f.nonemployeeCompensation || 0), 0);
    const earnedIncome = totalW2 + total1099;
    // Simplified check - if income is above ~$60k, likely above EITC limits
    return earnedIncome > 60000;
  });

  ngOnInit(): void {
    this.calculateCredits();
  }

  private calculateCredits(): void {
    const taxReturn = this.sessionStorage.taxReturn();
    const { personalInfo, income } = taxReturn;

    // Calculate AGI
    const totalW2 = income.w2s.reduce((sum, w2) => sum + (w2.wagesTips || 0), 0);
    const total1099 = income.form1099s.reduce((sum, f) => sum + (f.nonemployeeCompensation || 0), 0);
    const grossIncome = totalW2 + total1099;

    // Calculate SE tax deduction for AGI
    const netSEEarnings = total1099 * SELF_EMPLOYMENT_TAX.netEarningsMultiplier;
    const seTax = netSEEarnings * SELF_EMPLOYMENT_TAX.rate;
    const seDeduction = seTax * SELF_EMPLOYMENT_TAX.deductionRate;
    const agi = grossIncome - seDeduction;

    // Calculate earned income for EITC
    const earnedIncome = totalW2 + total1099;

    // Calculate Child Tax Credit
    const ctcResult = this.taxCalculation.calculateChildTaxCredit(
      personalInfo.dependents,
      agi,
      personalInfo.filingStatus
    );
    this.childTaxCredit.set(ctcResult.total);
    this.childTaxCreditRefundable.set(ctcResult.refundable);

    // Calculate EITC
    const numQualifyingChildren = this.qualifyingChildrenCount();
    const eitc = this.taxCalculation.calculateEITC(
      earnedIncome,
      personalInfo.filingStatus,
      numQualifyingChildren,
      personalInfo.claimedAsDependent
    );
    this.earnedIncomeCredit.set(eitc);

    // Save credits to session storage (preserve education credits)
    this.sessionStorage.updateCredits((current) => ({
      ...current,
      childTaxCredit: ctcResult.total,
      childTaxCreditRefundable: ctcResult.refundable,
      earnedIncomeCredit: eitc,
    }));
  }

  openCreditsVsDeductionsModal(): void {
    this.creditsVsDeductionsModal().open();
  }

  openCTCModal(): void {
    this.ctcModal().open();
  }

  openEITCModal(): void {
    this.eitcModal().open();
  }

  formatCurrency(amount: number): string {
    return this.taxData.formatCurrency(amount);
  }

  onContinue(): void {
    this.navigation.completeSection('credits');
    this.navigation.navigateTo('/review');
  }

  onBack(): void {
    this.navigation.navigateTo('/deductions/comparison');
  }
}
