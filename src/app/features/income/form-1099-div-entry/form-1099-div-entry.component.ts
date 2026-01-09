import { ChangeDetectionStrategy, Component, computed, inject, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationService, SessionStorageService, ValidationService } from '@core/services';
import { Form1099DIV, createEmptyForm1099DIV } from '@core/models';
import {
  NavigationHeaderComponent,
  EducationalModalComponent,
  ContinueButtonComponent,
  Form1099DIVFormComponent,
  ValidationMessageComponent,
} from '@shared/components';

@Component({
  selector: 'app-form-1099-div-entry',
  standalone: true,
  imports: [
    CommonModule,
    NavigationHeaderComponent,
    EducationalModalComponent,
    ContinueButtonComponent,
    Form1099DIVFormComponent,
    ValidationMessageComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-navigation-header />

    <div class="page-container">
      <div class="content-card">
        <header class="section-header">
          <h1>Enter your 1099-DIV income</h1>
          <button class="help-trigger" (click)="openHelpModal()" type="button">
            <span class="help-icon">?</span>
            <span>About dividend income</span>
          </button>
        </header>

        <p class="instruction">
          Enter dividend income from each 1099-DIV form you received from brokerages or investment
          accounts (like Robinhood, Fidelity, or Schwab). Box 1a shows your total ordinary dividends.
        </p>

        <div class="form-list">
          @for (form of form1099Divs(); track form.id; let i = $index) {
            <div class="form-wrapper">
              @if (form1099Divs().length > 1) {
                <div class="form-actions">
                  <span class="form-label">1099-DIV #{{ i + 1 }}</span>
                  <button
                    type="button"
                    class="remove-btn"
                    (click)="removeForm(form.id)"
                    aria-label="Remove this 1099-DIV"
                  >
                    Remove
                  </button>
                </div>
              }
              <app-form-1099-div-form
                [form1099]="form"
                (form1099Change)="updateForm(form.id, $event)"
              />
            </div>
          }

          <button type="button" class="add-btn" (click)="addForm()">
            + Add Another 1099-DIV
          </button>
        </div>

        <div class="summary-section">
          <div class="summary-bar">
            <div class="summary-item">
              <span class="summary-label">Total Ordinary Dividends:</span>
              <span class="summary-value">{{ formatCurrency(totalOrdinaryDividends()) }}</span>
            </div>
            @if (totalQualifiedDividends() > 0) {
              <div class="summary-item secondary">
                <span class="summary-label">Qualified Dividends:</span>
                <span class="summary-value highlight">{{ formatCurrency(totalQualifiedDividends()) }}</span>
                <span class="tax-note">Lower tax rate!</span>
              </div>
            }
            @if (totalCapitalGains() > 0) {
              <div class="summary-item secondary">
                <span class="summary-label">Capital Gain Distributions:</span>
                <span class="summary-value">{{ formatCurrency(totalCapitalGains()) }}</span>
              </div>
            }
          </div>

          @if (totalFederalWithheld() > 0) {
            <div class="withholding-notice">
              <div class="notice-icon">✓</div>
              <div class="notice-content">
                <strong>Tax Already Withheld</strong>
                <p>
                  <strong>{{ formatCurrency(totalFederalWithheld()) }}</strong> was already
                  withheld from your dividend income and sent to the IRS.
                </p>
              </div>
            </div>
          }

          @if (totalQualifiedDividends() > 0) {
            <div class="info-callout">
              <div class="callout-icon">💡</div>
              <div class="callout-content">
                <strong>Good news about qualified dividends!</strong>
                <p>
                  Qualified dividends are taxed at lower capital gains rates (0%, 15%, or 20%)
                  instead of your regular income tax rate. This can save you money!
                </p>
              </div>
            </div>
          }
        </div>

        @if (validationWarning()) {
          <div class="validation-warning">
            <app-validation-message [error]="validationWarning()" />
          </div>
        }

        <app-continue-button
          [disabled]="!canContinue()"
          (continue)="onContinue()"
          (back)="onBack()"
        />
      </div>
    </div>

    <app-educational-modal #helpModal [title]="'Understanding Dividend Income'">
      <p>
        A <strong>1099-DIV form</strong> reports dividends and distributions you received from
        investments like stocks, mutual funds, or ETFs. You'll receive this from brokerages like
        Robinhood, Fidelity, Schwab, or Vanguard.
      </p>
      <p><strong>Key boxes on form 1099-DIV:</strong></p>
      <ul>
        <li>
          <strong>Box 1a (Total ordinary dividends)</strong> — All dividends you received. This is
          the main number to report.
        </li>
        <li>
          <strong>Box 1b (Qualified dividends)</strong> — A portion of 1a that qualifies for lower
          tax rates. The IRS taxes these at 0%, 15%, or 20% instead of your regular rate.
        </li>
        <li>
          <strong>Box 2a (Capital gain distributions)</strong> — Long-term capital gains from mutual
          funds, also taxed at lower rates.
        </li>
      </ul>
      <p>
        <em>
          Even if you reinvested your dividends (bought more shares), you still owe taxes on them
          in the year they were paid!
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
      max-width: 850px;
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

    .form-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-wrapper {
      position: relative;
    }

    .form-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
      padding: 0 0.25rem;
    }

    .form-label {
      font-weight: 600;
      color: var(--ngpf-navy-light);
      font-size: 1rem;
    }

    .remove-btn {
      background: none;
      border: none;
      color: var(--ngpf-error);
      font-size: 0.875rem;
      cursor: pointer;

      &:hover {
        text-decoration: underline;
      }
    }

    .add-btn {
      width: 100%;
      padding: 0.875rem;
      border: 2px dashed var(--ngpf-gray-light);
      border-radius: var(--radius-sm);
      background: transparent;
      color: var(--ngpf-navy-light);
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-fast);

      &:hover {
        border-color: var(--ngpf-navy-light);
        background: var(--ngpf-blue-pale);
      }
    }

    .summary-section {
      margin: 1.5rem 0;
    }

    .summary-bar {
      padding: 1rem 1.25rem;
      background: #f0fdf4; /* Light green to match dividend form */
      border-radius: var(--radius-sm);
      margin-bottom: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .summary-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      &.secondary {
        padding-top: 0.5rem;
        border-top: 1px solid rgba(0, 0, 0, 0.1);
      }
    }

    .summary-label {
      font-size: 0.875rem;
      color: var(--ngpf-gray-dark);
    }

    .summary-value {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--ngpf-navy-light);

      &.highlight {
        color: #15803d;
      }
    }

    .tax-note {
      font-size: 0.75rem;
      background: #dcfce7;
      color: #15803d;
      padding: 0.125rem 0.5rem;
      border-radius: 9999px;
      font-weight: 500;
    }

    .withholding-notice {
      display: flex;
      gap: 1rem;
      padding: 1rem 1.25rem;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: var(--radius-sm);
      margin-bottom: 1rem;
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

    .info-callout {
      display: flex;
      gap: 1rem;
      padding: 1rem 1.25rem;
      background: #fef3c7;
      border: 1px solid #fcd34d;
      border-radius: var(--radius-sm);
    }

    .callout-icon {
      flex-shrink: 0;
      font-size: 1.25rem;
    }

    .callout-content {
      flex: 1;

      strong {
        display: block;
        color: #92400e;
        margin-bottom: 0.25rem;
      }

      p {
        margin: 0;
        font-size: 0.875rem;
        color: #92400e;
      }
    }

    .validation-warning {
      margin-bottom: 1rem;
      padding: 0.75rem 1rem;
      background: var(--ngpf-error-light);
      border-radius: var(--radius-sm);
      border-left: 3px solid var(--ngpf-error);
    }
  `,
})
export class Form1099DIVEntryComponent {
  private readonly navigation = inject(NavigationService);
  private readonly sessionStorage = inject(SessionStorageService);
  private readonly validation = inject(ValidationService);

  readonly helpModal = viewChild.required<EducationalModalComponent>('helpModal');

  readonly form1099Divs = computed(() => {
    const formList = this.sessionStorage.taxReturn().income.form1099Divs;
    if (formList.length === 0) {
      const empty = createEmptyForm1099DIV();
      this.sessionStorage.updateIncome((income) => ({
        ...income,
        form1099Divs: [empty],
      }));
      return [empty];
    }
    return formList;
  });

  readonly totalOrdinaryDividends = computed(() => {
    return this.form1099Divs().reduce((sum, form) => sum + (form.ordinaryDividends || 0), 0);
  });

  readonly totalQualifiedDividends = computed(() => {
    return this.form1099Divs().reduce((sum, form) => sum + (form.qualifiedDividends || 0), 0);
  });

  readonly totalCapitalGains = computed(() => {
    return this.form1099Divs().reduce((sum, form) => sum + (form.capitalGainDistributions || 0), 0);
  });

  readonly totalFederalWithheld = computed(() => {
    return this.form1099Divs().reduce((sum, form) => sum + (form.federalWithheld || 0), 0);
  });

  readonly canContinue = computed(() => {
    const formList = this.form1099Divs();
    return formList.length > 0 && formList.every((form) =>
      this.validation.validateRequired(form.payerName, 'Payer name').isValid &&
      form.ordinaryDividends > 0
    );
  });

  readonly validationWarning = computed(() => {
    const formList = this.form1099Divs();
    if (formList.length === 0) return null;

    for (let i = 0; i < formList.length; i++) {
      const form = formList[i];
      const formLabel = formList.length > 1 ? `1099-DIV #${i + 1}: ` : '';

      if (!this.validation.validateRequired(form.payerName, 'Payer name').isValid) {
        return `${formLabel}Payer/brokerage name is required`;
      }

      if (!form.ordinaryDividends || form.ordinaryDividends <= 0) {
        return `${formLabel}Enter ordinary dividends amount (Box 1a)`;
      }

      // Warning if qualified dividends exceed ordinary dividends
      if (form.qualifiedDividends > form.ordinaryDividends) {
        return `${formLabel}Qualified dividends (Box 1b) cannot exceed ordinary dividends (Box 1a)`;
      }
    }

    return null;
  });

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  }

  openHelpModal(): void {
    this.helpModal().open();
  }

  addForm(): void {
    this.sessionStorage.updateIncome((income) => ({
      ...income,
      form1099Divs: [...income.form1099Divs, createEmptyForm1099DIV()],
    }));
  }

  removeForm(id: string): void {
    this.sessionStorage.updateIncome((income) => ({
      ...income,
      form1099Divs: income.form1099Divs.filter((form) => form.id !== id),
    }));
  }

  updateForm(id: string, changes: Partial<Form1099DIV>): void {
    this.sessionStorage.updateIncome((income) => ({
      ...income,
      form1099Divs: income.form1099Divs.map((form) =>
        form.id === id ? { ...form, ...changes } : form
      ),
    }));
  }

  onContinue(): void {
    // Go to 1099-K if user has that income, then Schedule C for self-employment, otherwise to summary
    const income = this.sessionStorage.taxReturn().income;
    if (income.has1099KIncome) {
      this.navigation.navigateTo('/income/1099-k');
    } else if (income.has1099Income) {
      // Has 1099-NEC income, go to Schedule C for expenses
      this.navigation.navigateTo('/income/schedule-c');
    } else {
      this.navigation.navigateTo('/income/summary');
    }
  }

  onBack(): void {
    // Go back through the income flow
    const income = this.sessionStorage.taxReturn().income;
    if (income.hasInterestIncome) {
      this.navigation.navigateTo('/income/1099-int');
    } else if (income.has1099Income) {
      this.navigation.navigateTo('/income/1099');
    } else if (income.hasW2Income) {
      this.navigation.navigateTo('/income/w2');
    } else {
      this.navigation.navigateTo('/income/types');
    }
  }
}
