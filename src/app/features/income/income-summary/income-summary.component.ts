import { ChangeDetectionStrategy, Component, computed, inject, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationService, SessionStorageService, TaxDataService } from '@core/services';
import { SELF_EMPLOYMENT_TAX } from '@core/constants/tax-year-2025';
import {
  NavigationHeaderComponent,
  EducationalModalComponent,
  ContinueButtonComponent,
} from '@shared/components';

@Component({
  selector: 'app-income-summary',
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
          <h1>Your Income Summary</h1>
          <button class="help-trigger" (click)="openHelpModal()" type="button">
            <span class="help-icon">?</span>
            <span>Understanding gross income</span>
          </button>
        </header>

        <div class="summary-sections">
          @if (hasW2Income()) {
            <div class="income-section">
              <h2>W-2 Wages</h2>
              <div class="income-items">
                @for (w2 of w2s(); track w2.id) {
                  <div class="income-item">
                    <span class="item-name">{{ w2.employerName }}</span>
                    <span class="item-amount">{{ formatCurrency(w2.wagesTips) }}</span>
                  </div>
                }
              </div>
              <div class="section-subtotal">
                <span>W-2 Total</span>
                <span>{{ formatCurrency(totalW2Wages()) }}</span>
              </div>
              <div class="withheld-note">
                <span class="note-label">Federal tax already withheld:</span>
                <span class="note-value">{{ formatCurrency(totalFederalWithheld()) }}</span>
              </div>
            </div>
          }

          @if (has1099Income()) {
            <div class="income-section">
              <h2>1099-NEC Self-Employment Income</h2>
              <div class="income-items">
                @for (form of form1099s(); track form.id) {
                  <div class="income-item">
                    <span class="item-name">{{ form.payerName }}</span>
                    <span class="item-amount">{{ formatCurrency(form.nonemployeeCompensation) }}</span>
                  </div>
                }
              </div>
              <div class="section-subtotal">
                <span>1099-NEC Total</span>
                <span>{{ formatCurrency(total1099Income()) }}</span>
              </div>
              <div class="se-tax-note">
                <div class="note-icon">!</div>
                <div class="note-content">
                  <span class="note-label">Estimated self-employment tax:</span>
                  <span class="note-value">{{ formatCurrency(estimatedSETax()) }}</span>
                </div>
              </div>
            </div>
          }

          @if (hasInterestIncome()) {
            <div class="income-section">
              <h2>1099-INT Interest Income</h2>
              <div class="income-items">
                @for (form of form1099Ints(); track form.id) {
                  <div class="income-item">
                    <span class="item-name">{{ form.payerName }}</span>
                    <span class="item-amount">{{ formatCurrency(form.interestIncome) }}</span>
                  </div>
                }
              </div>
              <div class="section-subtotal">
                <span>Interest Total</span>
                <span>{{ formatCurrency(totalInterestIncome()) }}</span>
              </div>
              @if (totalInterestWithheld() > 0) {
                <div class="withheld-note">
                  <span class="note-label">Federal tax already withheld:</span>
                  <span class="note-value">{{ formatCurrency(totalInterestWithheld()) }}</span>
                </div>
              }
            </div>
          }
        </div>

        <div class="total-section">
          <div class="total-row gross">
            <span class="total-label">Total Gross Income</span>
            <span class="total-amount">{{ formatCurrency(totalGrossIncome()) }}</span>
          </div>
          @if (has1099Income()) {
            <div class="total-row adjustment">
              <span class="total-label">
                Less: 1/2 SE Tax Deduction
                <button class="info-btn" (click)="openHelpModal()" type="button">?</button>
              </span>
              <span class="total-amount negative">-{{ formatCurrency(seDeduction()) }}</span>
            </div>
            <div class="total-row agi">
              <span class="total-label">Adjusted Gross Income (AGI)</span>
              <span class="total-amount">{{ formatCurrency(adjustedGrossIncome()) }}</span>
            </div>
          }
        </div>

        <app-continue-button
          (continue)="onContinue()"
          (back)="onBack()"
        />
      </div>
    </div>

    <app-educational-modal #helpModal [title]="'Understanding Your Income'">
      <p>
        <strong>Gross Income</strong> is the total of all the money you earned before any
        deductions or taxes are taken out.
      </p>
      <p>
        <strong>Adjusted Gross Income (AGI)</strong> is your gross income minus certain
        "above-the-line" deductions. For self-employed workers, one important deduction is
        half of the self-employment tax.
      </p>
      <p>
        <em>
          Why does half of SE tax get deducted? Because employers normally pay half of Social
          Security and Medicare taxes. Since you're self-employed, you pay both halves—but you
          get to deduct the "employer" portion.
        </em>
      </p>
      <p>
        Your AGI is important because many tax credits and deductions are based on it.
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

    .summary-sections {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .income-section {
      background: var(--ngpf-gray-pale);
      border: 1px solid var(--ngpf-gray-light);
      border-radius: var(--radius-md);
      padding: 1.25rem;

      h2 {
        font-size: 1rem;
        font-weight: 600;
        color: var(--ngpf-navy-dark);
        margin: 0 0 1rem;
      }
    }

    .income-items {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .income-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid var(--ngpf-gray-light);

      &:last-child {
        border-bottom: none;
      }
    }

    .item-name {
      color: var(--ngpf-gray-dark);
      font-size: 0.9375rem;
    }

    .item-amount {
      font-weight: 500;
      color: var(--ngpf-navy-dark);
    }

    .section-subtotal {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 0.75rem;
      border-top: 2px solid var(--ngpf-gray);
      font-weight: 600;
      color: var(--ngpf-navy-dark);
    }

    .withheld-note {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 0.75rem;
      padding: 0.75rem;
      background: var(--ngpf-success-light);
      border-radius: var(--radius-sm);
      font-size: 0.875rem;
    }

    .note-label {
      color: var(--ngpf-success);
    }

    .note-value {
      color: var(--ngpf-success);
      font-weight: 600;
    }

    .se-tax-note {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-top: 0.75rem;
      padding: 0.75rem;
      background: var(--ngpf-warning-light);
      border-radius: var(--radius-sm);
      font-size: 0.875rem;
    }

    .note-icon {
      flex-shrink: 0;
      width: 1.25rem;
      height: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--ngpf-orange);
      color: var(--ngpf-white);
      border-radius: 50%;
      font-weight: 700;
      font-size: 0.75rem;
    }

    .note-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex: 1;

      .note-label {
        color: var(--ngpf-orange-dark);
      }

      .note-value {
        color: var(--ngpf-orange-dark);
        font-weight: 600;
      }
    }

    .total-section {
      margin-top: 1.5rem;
      padding: 1.25rem;
      background: var(--ngpf-blue-pale);
      border-radius: var(--radius-md);
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;

      &.gross {
        font-size: 1rem;
        color: var(--ngpf-navy-dark);
      }

      &.adjustment {
        font-size: 0.875rem;
        color: var(--ngpf-gray-dark);
        border-top: 1px dashed var(--ngpf-gray);
        padding-top: 0.75rem;
        margin-top: 0.25rem;
      }

      &.agi {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--ngpf-navy-light);
        border-top: 2px solid var(--ngpf-navy-light);
        padding-top: 0.75rem;
        margin-top: 0.5rem;
      }
    }

    .total-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .total-amount {
      font-weight: 600;

      &.negative {
        color: var(--ngpf-error);
      }
    }

    .info-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1rem;
      height: 1rem;
      background: var(--ngpf-navy-light);
      color: var(--ngpf-white);
      border: none;
      border-radius: 50%;
      font-size: 0.625rem;
      cursor: pointer;
    }
  `,
})
export class IncomeSummaryComponent {
  private readonly navigation = inject(NavigationService);
  private readonly sessionStorage = inject(SessionStorageService);
  private readonly taxData = inject(TaxDataService);

  readonly helpModal = viewChild.required<EducationalModalComponent>('helpModal');

  readonly hasW2Income = computed(() => this.sessionStorage.taxReturn().income.hasW2Income);
  readonly has1099Income = computed(() => this.sessionStorage.taxReturn().income.has1099Income);
  readonly hasInterestIncome = computed(() => this.sessionStorage.taxReturn().income.hasInterestIncome);

  readonly w2s = computed(() => this.sessionStorage.taxReturn().income.w2s);
  readonly form1099s = computed(() => this.sessionStorage.taxReturn().income.form1099s);
  readonly form1099Ints = computed(() => this.sessionStorage.taxReturn().income.form1099Ints);

  readonly totalW2Wages = computed(() => {
    return this.w2s().reduce((sum, w2) => sum + (w2.wagesTips || 0), 0);
  });

  readonly totalFederalWithheld = computed(() => {
    return this.w2s().reduce((sum, w2) => sum + (w2.federalWithheld || 0), 0);
  });

  readonly total1099Income = computed(() => {
    return this.form1099s().reduce((sum, form) => sum + (form.nonemployeeCompensation || 0), 0);
  });

  readonly totalInterestIncome = computed(() => {
    return this.form1099Ints().reduce((sum, form) => sum + (form.interestIncome || 0), 0);
  });

  readonly totalInterestWithheld = computed(() => {
    return this.form1099Ints().reduce((sum, form) => sum + (form.federalWithheld || 0), 0);
  });

  readonly estimatedSETax = computed(() => {
    const netEarnings = this.total1099Income() * SELF_EMPLOYMENT_TAX.netEarningsMultiplier;
    return netEarnings * SELF_EMPLOYMENT_TAX.rate;
  });

  readonly seDeduction = computed(() => {
    return this.estimatedSETax() * SELF_EMPLOYMENT_TAX.deductionRate;
  });

  readonly totalGrossIncome = computed(() => {
    return this.totalW2Wages() + this.total1099Income() + this.totalInterestIncome();
  });

  readonly adjustedGrossIncome = computed(() => {
    return this.totalGrossIncome() - this.seDeduction();
  });

  formatCurrency(amount: number): string {
    return this.taxData.formatCurrency(amount);
  }

  openHelpModal(): void {
    this.helpModal().open();
  }

  onContinue(): void {
    this.navigation.completeSection('income');
    this.navigation.navigateTo('/deductions/itemized');
  }

  onBack(): void {
    // Go back to the last income entry form the user used
    if (this.hasInterestIncome()) {
      this.navigation.navigateTo('/income/1099-int');
    } else if (this.has1099Income()) {
      this.navigation.navigateTo('/income/1099');
    } else if (this.hasW2Income()) {
      this.navigation.navigateTo('/income/w2');
    } else {
      this.navigation.navigateTo('/income/types');
    }
  }
}
