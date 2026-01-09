import { ChangeDetectionStrategy, Component, computed, inject, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationService, SessionStorageService, ValidationService } from '@core/services';
import { Form1099K, createEmptyForm1099K } from '@core/models';
import {
  NavigationHeaderComponent,
  EducationalModalComponent,
  ContinueButtonComponent,
  Form1099KFormComponent,
  ValidationMessageComponent,
} from '@shared/components';

@Component({
  selector: 'app-form-1099-k-entry',
  standalone: true,
  imports: [
    CommonModule,
    NavigationHeaderComponent,
    EducationalModalComponent,
    ContinueButtonComponent,
    Form1099KFormComponent,
    ValidationMessageComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-navigation-header />

    <div class="page-container">
      <div class="content-card">
        <header class="section-header">
          <h1>Enter your 1099-K income</h1>
          <button class="help-trigger" (click)="openHelpModal()" type="button">
            <span class="help-icon">?</span>
            <span>About payment app income</span>
          </button>
        </header>

        <p class="instruction">
          Enter income from payment apps and platforms like Venmo, PayPal, Cash App, Etsy, or eBay.
          Starting in 2024, platforms must report transactions over $600.
        </p>

        @if (has1099NECIncome()) {
          <div class="warning-callout">
            <div class="callout-icon">⚠️</div>
            <div class="callout-content">
              <strong>Avoid Double-Counting!</strong>
              <p>
                You already entered 1099-NEC income. If any of that income was also reported on a
                1099-K (like DoorDash payments), <strong>don't enter it again here</strong>.
                Only enter 1099-K amounts that are NOT already included in your 1099-NEC forms.
              </p>
            </div>
          </div>
        }

        <div class="form-list">
          @for (form of form1099Ks(); track form.id; let i = $index) {
            <div class="form-wrapper">
              @if (form1099Ks().length > 1) {
                <div class="form-actions">
                  <span class="form-label">1099-K #{{ i + 1 }}</span>
                  <button
                    type="button"
                    class="remove-btn"
                    (click)="removeForm(form.id)"
                    aria-label="Remove this 1099-K"
                  >
                    Remove
                  </button>
                </div>
              }
              <app-form-1099-k-form
                [form1099]="form"
                (form1099Change)="updateForm(form.id, $event)"
              />
            </div>
          }

          <button type="button" class="add-btn" (click)="addForm()">
            + Add Another 1099-K
          </button>
        </div>

        <div class="summary-section">
          <div class="summary-bar">
            <div class="summary-item">
              <span class="summary-label">Total Gross Payments:</span>
              <span class="summary-value">{{ formatCurrency(totalGrossAmount()) }}</span>
            </div>
            @if (totalTransactions() > 0) {
              <div class="summary-item secondary">
                <span class="summary-label">Total Transactions:</span>
                <span class="summary-value">{{ totalTransactions() | number }}</span>
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
                  withheld from your payments and sent to the IRS.
                </p>
              </div>
            </div>
          }

          <div class="info-callout">
            <div class="callout-icon">💡</div>
            <div class="callout-content">
              <strong>Remember: This is GROSS income</strong>
              <p>
                The 1099-K shows total payments received before any expenses. If you had business
                expenses (like supplies or mileage), you may be able to deduct them on Schedule C.
                For this simulation, we'll include the gross amount in your income.
              </p>
            </div>
          </div>
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

    <app-educational-modal #helpModal [title]="'Understanding 1099-K Income'">
      <p>
        A <strong>1099-K form</strong> reports payments you received through payment apps and
        online marketplaces. This is a newer form that many students receive for the first time.
      </p>
      <p><strong>Who sends 1099-K forms?</strong></p>
      <ul>
        <li><strong>Payment apps</strong> — Venmo, PayPal, Cash App (for business transactions)</li>
        <li><strong>Gig platforms</strong> — Uber, Lyft, DoorDash (sometimes in addition to 1099-NEC)</li>
        <li><strong>Online marketplaces</strong> — Etsy, eBay, Poshmark</li>
      </ul>
      <p><strong>Important things to know:</strong></p>
      <ul>
        <li>
          <strong>$600 threshold</strong> — Starting in 2024, platforms must report if you received
          $600 or more in payments.
        </li>
        <li>
          <strong>Personal payments excluded</strong> — Splitting dinner or receiving birthday money
          from friends shouldn't be on your 1099-K.
        </li>
        <li>
          <strong>Gross amount</strong> — The form shows total payments before fees or expenses.
        </li>
      </ul>
      <p>
        <em>
          If you received a 1099-K that includes personal payments by mistake, keep records showing
          which transactions were personal!
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

    .warning-callout {
      display: flex;
      gap: 1rem;
      padding: 1rem 1.25rem;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: var(--radius-sm);
      margin-bottom: 1.5rem;
    }

    .warning-callout .callout-icon {
      flex-shrink: 0;
      font-size: 1.25rem;
    }

    .warning-callout .callout-content {
      flex: 1;

      strong {
        display: block;
        color: #991b1b;
        margin-bottom: 0.25rem;
      }

      p {
        margin: 0;
        font-size: 0.875rem;
        color: #991b1b;
      }
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
      background: #fef3e2; /* Light orange to match 1099-K form */
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
      background: var(--ngpf-blue-pale);
      border: 1px solid var(--ngpf-navy-light);
      border-radius: var(--radius-sm);
    }

    .info-callout .callout-icon {
      flex-shrink: 0;
      font-size: 1.25rem;
    }

    .info-callout .callout-content {
      flex: 1;

      strong {
        display: block;
        color: var(--ngpf-navy-dark);
        margin-bottom: 0.25rem;
      }

      p {
        margin: 0;
        font-size: 0.875rem;
        color: var(--ngpf-navy-dark);
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
export class Form1099KEntryComponent {
  private readonly navigation = inject(NavigationService);
  private readonly sessionStorage = inject(SessionStorageService);
  private readonly validation = inject(ValidationService);

  readonly helpModal = viewChild.required<EducationalModalComponent>('helpModal');

  readonly form1099Ks = computed(() => {
    const formList = this.sessionStorage.taxReturn().income.form1099Ks;
    if (formList.length === 0) {
      const empty = createEmptyForm1099K();
      this.sessionStorage.updateIncome((income) => ({
        ...income,
        form1099Ks: [empty],
      }));
      return [empty];
    }
    return formList;
  });

  readonly has1099NECIncome = computed(() => {
    return this.sessionStorage.taxReturn().income.has1099Income;
  });

  readonly totalGrossAmount = computed(() => {
    return this.form1099Ks().reduce((sum, form) => sum + (form.grossAmount || 0), 0);
  });

  readonly totalTransactions = computed(() => {
    return this.form1099Ks().reduce((sum, form) => sum + (form.numberOfTransactions || 0), 0);
  });

  readonly totalFederalWithheld = computed(() => {
    return this.form1099Ks().reduce((sum, form) => sum + (form.federalWithheld || 0), 0);
  });

  readonly canContinue = computed(() => {
    const formList = this.form1099Ks();
    return formList.length > 0 && formList.every((form) =>
      this.validation.validateRequired(form.payerName, 'Platform name').isValid &&
      form.grossAmount > 0
    );
  });

  readonly validationWarning = computed(() => {
    const formList = this.form1099Ks();
    if (formList.length === 0) return null;

    for (let i = 0; i < formList.length; i++) {
      const form = formList[i];
      const formLabel = formList.length > 1 ? `1099-K #${i + 1}: ` : '';

      if (!this.validation.validateRequired(form.payerName, 'Platform name').isValid) {
        return `${formLabel}Platform/company name is required`;
      }

      if (!form.grossAmount || form.grossAmount <= 0) {
        return `${formLabel}Enter gross amount (Box 1a)`;
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
      form1099Ks: [...income.form1099Ks, createEmptyForm1099K()],
    }));
  }

  removeForm(id: string): void {
    this.sessionStorage.updateIncome((income) => ({
      ...income,
      form1099Ks: income.form1099Ks.filter((form) => form.id !== id),
    }));
  }

  updateForm(id: string, changes: Partial<Form1099K>): void {
    this.sessionStorage.updateIncome((income) => ({
      ...income,
      form1099Ks: income.form1099Ks.map((form) =>
        form.id === id ? { ...form, ...changes } : form
      ),
    }));
  }

  onContinue(): void {
    // Go to Schedule C if user has self-employment income (1099-NEC or 1099-K)
    const income = this.sessionStorage.taxReturn().income;
    if (income.has1099Income || income.has1099KIncome) {
      this.navigation.navigateTo('/income/schedule-c');
    } else {
      this.navigation.navigateTo('/income/summary');
    }
  }

  onBack(): void {
    // Go back through the income flow
    const income = this.sessionStorage.taxReturn().income;
    if (income.hasDividendIncome) {
      this.navigation.navigateTo('/income/1099-div');
    } else if (income.hasInterestIncome) {
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
