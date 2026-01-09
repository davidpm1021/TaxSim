import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationService, SessionStorageService, TaxCalculationService, TaxDataService } from '@core/services';
import { SELF_EMPLOYMENT_TAX } from '@core/constants/tax-year-2025';
import {
  NavigationHeaderComponent,
  ContinueButtonComponent,
  CurrencyInputComponent,
} from '@shared/components';

@Component({
  selector: 'app-what-if-calculator',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NavigationHeaderComponent,
    ContinueButtonComponent,
    CurrencyInputComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-navigation-header />

    <div class="page-container">
      <div class="content-card">
        <header class="section-header">
          <h1>What-If Scenario Calculator</h1>
          <p class="subtitle">See how changes in income would affect your taxes</p>
        </header>

        <div class="current-situation">
          <h2>Your Current Situation</h2>
          <div class="situation-grid">
            <div class="situation-item">
              <span class="label">W-2 Wages</span>
              <span class="value">{{ formatCurrency(currentW2Wages()) }}</span>
            </div>
            <div class="situation-item">
              <span class="label">1099 Income</span>
              <span class="value">{{ formatCurrency(current1099Income()) }}</span>
            </div>
            <div class="situation-item">
              <span class="label">Total Withholding</span>
              <span class="value">{{ formatCurrency(currentWithholding()) }}</span>
            </div>
            <div class="situation-item highlight">
              <span class="label">Current Result</span>
              <span class="value" [class.refund]="currentResult().isRefund" [class.owed]="!currentResult().isRefund">
                {{ currentResult().isRefund ? 'Refund: ' : 'Owed: ' }}{{ formatCurrency(currentResult().amount) }}
              </span>
            </div>
          </div>
        </div>

        <div class="scenario-section">
          <h2>Explore a Scenario</h2>
          <p class="scenario-intro">
            What if you earned more (or less) income? Adjust the values below to see how it
            would affect your taxes.
          </p>

          <div class="scenario-inputs">
            <div class="input-group">
              <label for="additionalW2">Additional W-2 Income</label>
              <app-currency-input
                inputId="additionalW2"
                [ngModel]="additionalW2()"
                (ngModelChange)="additionalW2.set($event)"
                placeholder="0"
              />
              <span class="input-hint">Extra income from a second job or raise</span>
            </div>

            <div class="input-group">
              <label for="additional1099">Additional 1099 Income</label>
              <app-currency-input
                inputId="additional1099"
                [ngModel]="additional1099()"
                (ngModelChange)="additional1099.set($event)"
                placeholder="0"
              />
              <span class="input-hint">Extra gig work or freelance income</span>
            </div>

            <div class="input-group">
              <label for="additionalWithholding">Additional Withholding</label>
              <app-currency-input
                inputId="additionalWithholding"
                [ngModel]="additionalWithholding()"
                (ngModelChange)="additionalWithholding.set($event)"
                placeholder="0"
              />
              <span class="input-hint">Extra taxes withheld from paychecks</span>
            </div>
          </div>

          <div class="quick-scenarios">
            <h3>Quick Scenarios</h3>
            <div class="scenario-buttons">
              <button
                type="button"
                class="scenario-btn"
                (click)="applyScenario('extra-gig', 2000)"
              >
                +$2,000 gig work
              </button>
              <button
                type="button"
                class="scenario-btn"
                (click)="applyScenario('extra-gig', 5000)"
              >
                +$5,000 gig work
              </button>
              <button
                type="button"
                class="scenario-btn"
                (click)="applyScenario('summer-job', 5000)"
              >
                +$5,000 summer job
              </button>
              <button
                type="button"
                class="scenario-btn"
                (click)="applyScenario('summer-job', 10000)"
              >
                +$10,000 internship
              </button>
              <button
                type="button"
                class="scenario-btn reset"
                (click)="resetScenario()"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <div class="comparison-section">
          <h2>Comparison</h2>

          <div class="comparison-table">
            <div class="comparison-header">
              <span></span>
              <span class="current-col">Current</span>
              <span class="scenario-col">Scenario</span>
              <span class="diff-col">Difference</span>
            </div>

            <div class="comparison-row">
              <span class="row-label">Total Income</span>
              <span class="current-col">{{ formatCurrency(currentTotalIncome()) }}</span>
              <span class="scenario-col">{{ formatCurrency(scenarioTotalIncome()) }}</span>
              <span class="diff-col" [class.positive]="incomeDiff() > 0">
                {{ incomeDiff() >= 0 ? '+' : '' }}{{ formatCurrency(incomeDiff()) }}
              </span>
            </div>

            <div class="comparison-row">
              <span class="row-label">Income Tax</span>
              <span class="current-col">{{ formatCurrency(currentResult().incomeTax) }}</span>
              <span class="scenario-col">{{ formatCurrency(scenarioResult().incomeTax) }}</span>
              <span class="diff-col" [class.negative]="incomeTaxDiff() > 0">
                {{ incomeTaxDiff() >= 0 ? '+' : '' }}{{ formatCurrency(incomeTaxDiff()) }}
              </span>
            </div>

            @if (current1099Income() > 0 || additional1099() > 0) {
              <div class="comparison-row">
                <span class="row-label">Self-Employment Tax</span>
                <span class="current-col">{{ formatCurrency(currentResult().seTax) }}</span>
                <span class="scenario-col">{{ formatCurrency(scenarioResult().seTax) }}</span>
                <span class="diff-col" [class.negative]="seTaxDiff() > 0">
                  {{ seTaxDiff() >= 0 ? '+' : '' }}{{ formatCurrency(seTaxDiff()) }}
                </span>
              </div>
            }

            <div class="comparison-row">
              <span class="row-label">Total Withholding</span>
              <span class="current-col">{{ formatCurrency(currentWithholding()) }}</span>
              <span class="scenario-col">{{ formatCurrency(scenarioWithholding()) }}</span>
              <span class="diff-col" [class.positive]="withholdingDiff() > 0">
                {{ withholdingDiff() >= 0 ? '+' : '' }}{{ formatCurrency(withholdingDiff()) }}
              </span>
            </div>

            <div class="comparison-row result">
              <span class="row-label">{{ currentResult().isRefund ? 'Refund' : 'Amount Owed' }}</span>
              <span class="current-col" [class.refund]="currentResult().isRefund" [class.owed]="!currentResult().isRefund">
                {{ formatCurrency(currentResult().amount) }}
              </span>
              <span class="scenario-col" [class.refund]="scenarioResult().isRefund" [class.owed]="!scenarioResult().isRefund">
                {{ formatCurrency(scenarioResult().amount) }}
              </span>
              <span class="diff-col" [class.positive]="resultDiff() > 0" [class.negative]="resultDiff() < 0">
                {{ resultDiff() >= 0 ? '+' : '' }}{{ formatCurrency(resultDiff()) }}
              </span>
            </div>
          </div>
        </div>

        @if (additionalIncome() > 0) {
          <div class="insight-section">
            <h2>Key Insights</h2>

            <div class="insight-card">
              <div class="insight-icon">$</div>
              <div class="insight-content">
                <strong>Take-Home Amount</strong>
                <p>
                  Of the extra {{ formatCurrency(additionalIncome()) }} in income, you would
                  keep <strong>{{ formatCurrency(takeHomeAmount()) }}</strong>
                  ({{ takeHomePercent() }}%).
                </p>
              </div>
            </div>

            <div class="insight-card">
              <div class="insight-icon">%</div>
              <div class="insight-content">
                <strong>Effective Tax Rate on Extra Income</strong>
                <p>
                  Your extra income would be taxed at an effective rate of
                  <strong>{{ effectiveTaxRateOnExtra() }}%</strong>.
                  @if (additional1099() > 0) {
                    This includes {{ seRateDisplay() }}% self-employment tax.
                  }
                </p>
              </div>
            </div>

            @if (resultDiff() < 0 && Math.abs(resultDiff()) > 100) {
              <div class="insight-card warning">
                <div class="insight-icon">!</div>
                <div class="insight-content">
                  <strong>Watch Out!</strong>
                  <p>
                    This extra income would reduce your refund (or increase what you owe) by
                    {{ formatCurrency(Math.abs(resultDiff())) }}.
                    @if (additional1099() > 0 && additionalWithholding() === 0) {
                      Consider setting aside money for quarterly estimated taxes.
                    }
                  </p>
                </div>
              </div>
            }
          </div>
        }

        <app-continue-button
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
      max-width: 800px;
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
        margin: 0 0 0.25rem;
      }

      .subtitle {
        color: var(--ngpf-gray);
        font-size: 0.9375rem;
        margin: 0;
      }
    }

    .current-situation, .scenario-section, .comparison-section, .insight-section {
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

    .situation-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;

      @media (max-width: 500px) {
        grid-template-columns: 1fr;
      }
    }

    .situation-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background: var(--ngpf-white);
      border-radius: var(--radius-sm);

      .label {
        font-size: 0.875rem;
        color: var(--ngpf-gray-dark);
      }

      .value {
        font-weight: 600;
        color: var(--ngpf-navy-dark);

        &.refund {
          color: var(--ngpf-success);
        }

        &.owed {
          color: var(--ngpf-error);
        }
      }

      &.highlight {
        background: var(--ngpf-blue-pale);
        grid-column: span 2;

        @media (max-width: 500px) {
          grid-column: span 1;
        }
      }
    }

    .scenario-intro {
      color: var(--ngpf-gray-dark);
      font-size: 0.875rem;
      margin: 0 0 1rem;
    }

    .scenario-inputs {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-bottom: 1rem;

      @media (max-width: 700px) {
        grid-template-columns: 1fr;
      }
    }

    .input-group {
      label {
        display: block;
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--ngpf-navy-dark);
        margin-bottom: 0.375rem;
      }
    }

    .input-hint {
      display: block;
      font-size: 0.75rem;
      color: var(--ngpf-gray);
      margin-top: 0.25rem;
    }

    .quick-scenarios {
      h3 {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--ngpf-gray-dark);
        margin: 0 0 0.5rem;
      }
    }

    .scenario-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .scenario-btn {
      padding: 0.5rem 0.875rem;
      border: 1px solid var(--ngpf-gray-light);
      border-radius: var(--radius-sm);
      background: var(--ngpf-white);
      color: var(--ngpf-navy-dark);
      font-size: 0.8125rem;
      cursor: pointer;
      transition: all var(--transition-fast);

      &:hover {
        border-color: var(--ngpf-navy-light);
        background: var(--ngpf-blue-pale);
      }

      &.reset {
        background: var(--ngpf-gray-pale);
        color: var(--ngpf-gray-dark);
      }
    }

    .comparison-table {
      background: var(--ngpf-white);
      border-radius: var(--radius-sm);
      overflow: hidden;
    }

    .comparison-header {
      display: grid;
      grid-template-columns: 1.5fr 1fr 1fr 1fr;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      background: var(--ngpf-navy-light);
      color: var(--ngpf-white);
      font-size: 0.8125rem;
      font-weight: 600;
    }

    .comparison-row {
      display: grid;
      grid-template-columns: 1.5fr 1fr 1fr 1fr;
      gap: 0.5rem;
      padding: 0.625rem 1rem;
      border-bottom: 1px solid var(--ngpf-gray-pale);
      font-size: 0.875rem;

      &:last-child {
        border-bottom: none;
      }

      &.result {
        background: var(--ngpf-blue-pale);
        font-weight: 600;
      }
    }

    .row-label {
      color: var(--ngpf-gray-dark);
    }

    .current-col, .scenario-col {
      text-align: right;
      color: var(--ngpf-navy-dark);
    }

    .diff-col {
      text-align: right;
      font-weight: 500;

      &.positive {
        color: var(--ngpf-success);
      }

      &.negative {
        color: var(--ngpf-error);
      }
    }

    .refund {
      color: var(--ngpf-success);
    }

    .owed {
      color: var(--ngpf-error);
    }

    .insight-card {
      display: flex;
      gap: 0.75rem;
      padding: 1rem;
      background: var(--ngpf-white);
      border-radius: var(--radius-sm);
      margin-bottom: 0.75rem;

      &:last-child {
        margin-bottom: 0;
      }

      &.warning {
        background: var(--ngpf-warning-light);
        border: 1px solid var(--ngpf-warning);
      }
    }

    .insight-icon {
      flex-shrink: 0;
      width: 2rem;
      height: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--ngpf-navy-light);
      color: var(--ngpf-white);
      border-radius: 50%;
      font-weight: 700;
      font-size: 0.875rem;

      .warning & {
        background: var(--ngpf-warning);
        color: #856404;
      }
    }

    .insight-content {
      flex: 1;

      strong {
        display: block;
        color: var(--ngpf-navy-dark);
        margin-bottom: 0.25rem;
      }

      p {
        margin: 0;
        font-size: 0.875rem;
        color: var(--ngpf-gray-dark);

        .warning & {
          color: #856404;
        }
      }
    }
  `,
})
export class WhatIfCalculatorComponent {
  private readonly navigation = inject(NavigationService);
  private readonly sessionStorage = inject(SessionStorageService);
  private readonly taxCalc = inject(TaxCalculationService);
  private readonly taxData = inject(TaxDataService);

  // User inputs for scenario
  readonly additionalW2 = signal(0);
  readonly additional1099 = signal(0);
  readonly additionalWithholding = signal(0);

  // Expose Math for template
  readonly Math = Math;
  readonly seRateDisplay = () => Math.round(SELF_EMPLOYMENT_TAX.rate * 100 * 10) / 10;

  // Current values from tax return
  readonly currentW2Wages = computed(() => {
    return this.sessionStorage.taxReturn().income.w2s.reduce((sum, w2) => sum + (w2.wagesTips || 0), 0);
  });

  readonly current1099Income = computed(() => {
    const income = this.sessionStorage.taxReturn().income;
    const necIncome = income.form1099s.reduce((sum, f) => sum + (f.nonemployeeCompensation || 0), 0);
    const kIncome = income.form1099Ks?.reduce((sum, f) => sum + (f.grossAmount || 0), 0) || 0;
    const expenses = income.scheduleC?.totalExpenses || 0;
    return Math.max(0, necIncome + kIncome - expenses);
  });

  readonly currentWithholding = computed(() => {
    return this.sessionStorage.taxReturn().income.w2s.reduce((sum, w2) => sum + (w2.federalWithheld || 0), 0);
  });

  readonly currentTotalIncome = computed(() => {
    return this.currentW2Wages() + this.current1099Income();
  });

  // Scenario values
  readonly scenarioTotalIncome = computed(() => {
    return this.currentTotalIncome() + this.additionalW2() + this.additional1099();
  });

  readonly scenarioWithholding = computed(() => {
    return this.currentWithholding() + this.additionalWithholding();
  });

  readonly additionalIncome = computed(() => {
    return this.additionalW2() + this.additional1099();
  });

  // Calculate current result
  readonly currentResult = computed(() => {
    const taxReturn = this.sessionStorage.taxReturn();
    const result = this.taxCalc.calculateFullReturn(taxReturn);
    return {
      incomeTax: result.taxBeforeCredits,
      seTax: result.selfEmploymentTax,
      totalTax: result.totalTaxBeforeCredits,
      amount: result.refundOrOwed,
      isRefund: result.isRefund,
    };
  });

  // Calculate scenario result
  readonly scenarioResult = computed(() => {
    const taxReturn = this.sessionStorage.taxReturn();

    // Create a modified copy with additional income
    const modifiedReturn = {
      ...taxReturn,
      income: {
        ...taxReturn.income,
        w2s: [
          ...taxReturn.income.w2s,
          ...(this.additionalW2() > 0 ? [{
            id: 'scenario-w2',
            employerName: 'Scenario Additional W-2',
            employerEin: '',
            employerAddress: '',
            employeeSsn: '',
            employeeName: '',
            employeeAddress: '',
            wagesTips: this.additionalW2(),
            federalWithheld: this.additionalWithholding(),
            socialSecurityWages: this.additionalW2(),
            socialSecurityWithheld: this.additionalW2() * 0.062,
            medicareWages: this.additionalW2(),
            medicareWithheld: this.additionalW2() * 0.0145,
            state: '',
            stateWages: 0,
            stateWithheld: 0,
          }] : []),
        ],
        form1099s: [
          ...taxReturn.income.form1099s,
          ...(this.additional1099() > 0 ? [{
            id: 'scenario-1099',
            payerName: 'Scenario Additional 1099',
            payerTin: '',
            recipientTin: '',
            recipientName: '',
            nonemployeeCompensation: this.additional1099(),
            federalWithheld: 0,
            stateTaxWithheld: 0,
            state: '',
            statePayerNumber: '',
            stateIncome: 0,
          }] : []),
        ],
      },
    };

    const result = this.taxCalc.calculateFullReturn(modifiedReturn as any);
    return {
      incomeTax: result.taxBeforeCredits,
      seTax: result.selfEmploymentTax,
      totalTax: result.totalTaxBeforeCredits,
      amount: result.refundOrOwed,
      isRefund: result.isRefund,
    };
  });

  // Differences
  readonly incomeDiff = computed(() => this.scenarioTotalIncome() - this.currentTotalIncome());
  readonly incomeTaxDiff = computed(() => this.scenarioResult().incomeTax - this.currentResult().incomeTax);
  readonly seTaxDiff = computed(() => this.scenarioResult().seTax - this.currentResult().seTax);
  readonly withholdingDiff = computed(() => this.scenarioWithholding() - this.currentWithholding());

  readonly resultDiff = computed(() => {
    const currentNet = this.currentResult().isRefund ? this.currentResult().amount : -this.currentResult().amount;
    const scenarioNet = this.scenarioResult().isRefund ? this.scenarioResult().amount : -this.scenarioResult().amount;
    return scenarioNet - currentNet;
  });

  // Insights
  readonly takeHomeAmount = computed(() => {
    const extraIncome = this.additionalIncome();
    const extraTax = this.incomeTaxDiff() + this.seTaxDiff();
    return Math.max(0, extraIncome - extraTax);
  });

  readonly takeHomePercent = computed(() => {
    if (this.additionalIncome() === 0) return 0;
    return Math.round((this.takeHomeAmount() / this.additionalIncome()) * 100);
  });

  readonly effectiveTaxRateOnExtra = computed(() => {
    if (this.additionalIncome() === 0) return 0;
    const extraTax = this.incomeTaxDiff() + this.seTaxDiff();
    return Math.round((extraTax / this.additionalIncome()) * 100);
  });

  formatCurrency(amount: number): string {
    return this.taxData.formatCurrency(amount);
  }

  applyScenario(type: 'extra-gig' | 'summer-job', amount: number): void {
    this.resetScenario();
    if (type === 'extra-gig') {
      this.additional1099.set(amount);
    } else {
      this.additionalW2.set(amount);
      // Assume about 12% withholding on W-2 income
      this.additionalWithholding.set(Math.round(amount * 0.12));
    }
  }

  resetScenario(): void {
    this.additionalW2.set(0);
    this.additional1099.set(0);
    this.additionalWithholding.set(0);
  }

  onContinue(): void {
    this.navigation.navigateTo('/educational/glossary');
  }

  onBack(): void {
    this.navigation.navigateTo('/results');
  }
}
