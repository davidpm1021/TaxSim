import { ChangeDetectionStrategy, Component, computed, inject, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationService, SessionStorageService, ValidationService } from '@core/services';
import { Form1099INT, createEmptyForm1099INT } from '@core/models';
import {
  NavigationHeaderComponent,
  EducationalModalComponent,
  ContinueButtonComponent,
  Form1099INTFormComponent,
  ValidationMessageComponent,
} from '@shared/components';

@Component({
  selector: 'app-form-1099-int-entry',
  standalone: true,
  imports: [
    CommonModule,
    NavigationHeaderComponent,
    EducationalModalComponent,
    ContinueButtonComponent,
    Form1099INTFormComponent,
    ValidationMessageComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-navigation-header />

    <div class="page-container">
      <div class="content-card">
        <header class="section-header">
          <h1>Enter your 1099-INT income</h1>
          <button class="help-trigger" (click)="openHelpModal()" type="button">
            <span class="help-icon">?</span>
            <span>About interest income</span>
          </button>
        </header>

        <p class="instruction">
          Enter interest income from each 1099-INT form you received from banks or other financial
          institutions. Box 1 shows your total taxable interest.
        </p>

        <div class="form-list">
          @for (form of form1099Ints(); track form.id; let i = $index) {
            <div class="form-wrapper">
              @if (form1099Ints().length > 1) {
                <div class="form-actions">
                  <span class="form-label">1099-INT #{{ i + 1 }}</span>
                  <button
                    type="button"
                    class="remove-btn"
                    (click)="removeForm(form.id)"
                    aria-label="Remove this 1099-INT"
                  >
                    Remove
                  </button>
                </div>
              }
              <app-form-1099-int-form
                [form1099]="form"
                (form1099Change)="updateForm(form.id, $event)"
              />
            </div>
          }

          <button type="button" class="add-btn" (click)="addForm()">
            + Add Another 1099-INT
          </button>
        </div>

        <div class="summary-section">
          <div class="summary-bar">
            <div class="summary-item">
              <span class="summary-label">Total Interest Income:</span>
              <span class="summary-value">{{ formatCurrency(totalInterest()) }}</span>
            </div>
            @if (totalTaxExempt() > 0) {
              <div class="summary-item secondary">
                <span class="summary-label">Tax-Exempt Interest:</span>
                <span class="summary-value">{{ formatCurrency(totalTaxExempt()) }}</span>
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
                  withheld from your interest income and sent to the IRS.
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

    <app-educational-modal #helpModal [title]="'Understanding Interest Income'">
      <p>
        A <strong>1099-INT form</strong> reports interest income you earned from banks, credit
        unions, or other financial institutions. This is usually from savings accounts, CDs
        (certificates of deposit), or money market accounts.
      </p>
      <p><strong>Key boxes on form 1099-INT:</strong></p>
      <ul>
        <li>
          <strong>Box 1 (Interest income)</strong> — Your total taxable interest. This gets added
          to your other income.
        </li>
        <li>
          <strong>Box 3 (U.S. Savings Bonds)</strong> — Interest from Treasury bonds, which may
          be exempt from state taxes.
        </li>
        <li>
          <strong>Box 8 (Tax-exempt interest)</strong> — Interest from municipal bonds that's
          usually not taxed federally.
        </li>
      </ul>
      <p>
        <em>
          Most students receive 1099-INT forms from their savings accounts. Even small amounts
          (over $10) must be reported!
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
      background: var(--ngpf-blue-pale);
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

    .validation-warning {
      margin-bottom: 1rem;
      padding: 0.75rem 1rem;
      background: var(--ngpf-error-light);
      border-radius: var(--radius-sm);
      border-left: 3px solid var(--ngpf-error);
    }
  `,
})
export class Form1099INTEntryComponent {
  private readonly navigation = inject(NavigationService);
  private readonly sessionStorage = inject(SessionStorageService);
  private readonly validation = inject(ValidationService);

  readonly helpModal = viewChild.required<EducationalModalComponent>('helpModal');

  readonly form1099Ints = computed(() => {
    const formList = this.sessionStorage.taxReturn().income.form1099Ints;
    if (formList.length === 0) {
      const empty = createEmptyForm1099INT();
      this.sessionStorage.updateIncome((income) => ({
        ...income,
        form1099Ints: [empty],
      }));
      return [empty];
    }
    return formList;
  });

  readonly totalInterest = computed(() => {
    return this.form1099Ints().reduce((sum, form) => sum + (form.interestIncome || 0), 0);
  });

  readonly totalTaxExempt = computed(() => {
    return this.form1099Ints().reduce((sum, form) => sum + (form.taxExemptInterest || 0), 0);
  });

  readonly totalFederalWithheld = computed(() => {
    return this.form1099Ints().reduce((sum, form) => sum + (form.federalWithheld || 0), 0);
  });

  readonly canContinue = computed(() => {
    const formList = this.form1099Ints();
    return formList.length > 0 && formList.every((form) =>
      this.validation.validateRequired(form.payerName, 'Payer name').isValid &&
      form.interestIncome > 0
    );
  });

  readonly validationWarning = computed(() => {
    const formList = this.form1099Ints();
    if (formList.length === 0) return null;

    for (let i = 0; i < formList.length; i++) {
      const form = formList[i];
      const formLabel = formList.length > 1 ? `1099-INT #${i + 1}: ` : '';

      if (!this.validation.validateRequired(form.payerName, 'Payer name').isValid) {
        return `${formLabel}Payer/bank name is required`;
      }

      if (!form.interestIncome || form.interestIncome <= 0) {
        return `${formLabel}Enter interest income amount (Box 1)`;
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
      form1099Ints: [...income.form1099Ints, createEmptyForm1099INT()],
    }));
  }

  removeForm(id: string): void {
    this.sessionStorage.updateIncome((income) => ({
      ...income,
      form1099Ints: income.form1099Ints.filter((form) => form.id !== id),
    }));
  }

  updateForm(id: string, changes: Partial<Form1099INT>): void {
    this.sessionStorage.updateIncome((income) => ({
      ...income,
      form1099Ints: income.form1099Ints.map((form) =>
        form.id === id ? { ...form, ...changes } : form
      ),
    }));
  }

  onContinue(): void {
    this.navigation.navigateTo('/income/summary');
  }

  onBack(): void {
    // Go back to 1099-NEC if user has that income, then W-2, then income types
    const income = this.sessionStorage.taxReturn().income;
    if (income.has1099Income) {
      this.navigation.navigateTo('/income/1099');
    } else if (income.hasW2Income) {
      this.navigation.navigateTo('/income/w2');
    } else {
      this.navigation.navigateTo('/income/types');
    }
  }
}
