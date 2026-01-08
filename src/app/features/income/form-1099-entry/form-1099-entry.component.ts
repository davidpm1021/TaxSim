import { ChangeDetectionStrategy, Component, computed, inject, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationService, SessionStorageService, ValidationService } from '@core/services';
import { Form1099NEC, createEmptyForm1099NEC } from '@core/models';
import { SELF_EMPLOYMENT_TAX } from '@core/constants/tax-year-2025';
import {
  NavigationHeaderComponent,
  EducationalModalComponent,
  ContinueButtonComponent,
  Form1099NECFormComponent,
  ValidationMessageComponent,
} from '@shared/components';

@Component({
  selector: 'app-form-1099-entry',
  standalone: true,
  imports: [
    CommonModule,
    NavigationHeaderComponent,
    EducationalModalComponent,
    ContinueButtonComponent,
    Form1099NECFormComponent,
    ValidationMessageComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-navigation-header />

    <div class="page-container">
      <div class="content-card">
        <header class="section-header">
          <h1>Enter your 1099-NEC income</h1>
          <button class="help-trigger" (click)="openHelpModal()" type="button">
            <span class="help-icon">?</span>
            <span>About self-employment income</span>
          </button>
        </header>

        <p class="instruction">
          Enter income from each 1099-NEC form you received for freelance work, gig jobs, or other
          self-employment. Fill in the form below just like your actual 1099-NEC.
        </p>

        <div class="form-list">
          @for (form of form1099s(); track form.id; let i = $index) {
            <div class="form-wrapper">
              @if (form1099s().length > 1) {
                <div class="form-actions">
                  <span class="form-label">1099-NEC #{{ i + 1 }}</span>
                  <button
                    type="button"
                    class="remove-btn"
                    (click)="removeForm(form.id)"
                    aria-label="Remove this 1099-NEC"
                  >
                    Remove
                  </button>
                </div>
              }
              <app-form-1099-nec-form
                [form1099]="form"
                (form1099Change)="updateForm(form.id, $event)"
              />
            </div>
          }

          <button type="button" class="add-btn" (click)="addForm()">
            + Add Another 1099-NEC
          </button>
        </div>

        <div class="summary-section">
          <div class="summary-bar">
            <div class="summary-item">
              <span class="summary-label">Total 1099 Income:</span>
              <span class="summary-value">{{ formatCurrency(totalIncome()) }}</span>
            </div>
          </div>

          @if (totalIncome() > 0) {
            <div class="se-tax-notice">
              <div class="notice-icon">!</div>
              <div class="notice-content">
                <strong>Self-Employment Tax Applies</strong>
                <p>
                  You'll owe an estimated <strong>{{ formatCurrency(estimatedSETax()) }}</strong> in
                  self-employment tax ({{ seRate }}% for Social Security and Medicare).
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

    <app-educational-modal #helpModal [title]="'Understanding 1099-NEC Income'">
      <p>
        A <strong>1099-NEC form</strong> reports income you earned as an independent contractor,
        freelancer, or gig worker. Unlike W-2 income, no taxes are withheld—you receive the full
        amount.
      </p>
      <p><strong>Key differences from W-2:</strong></p>
      <ul>
        <li>
          <strong>No tax withheld</strong> — You're responsible for paying all taxes yourself.
        </li>
        <li>
          <strong>Self-employment tax</strong> — You owe 15.3% extra for Social Security and
          Medicare (employers normally pay half of this for W-2 workers).
        </li>
        <li>
          <strong>Quarterly payments</strong> — If you earn significant 1099 income, you may need
          to pay estimated taxes quarterly.
        </li>
      </ul>
      <p>
        <em>
          Good news: Half of your self-employment tax is deductible, reducing your taxable income!
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
    }

    .summary-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
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

    .se-tax-notice {
      display: flex;
      gap: 1rem;
      padding: 1rem 1.25rem;
      background: var(--ngpf-warning-light);
      border: 1px solid var(--ngpf-warning);
      border-radius: var(--radius-sm);
    }

    .notice-icon {
      flex-shrink: 0;
      width: 1.5rem;
      height: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--ngpf-warning);
      color: #856404;
      border-radius: 50%;
      font-weight: 700;
      font-size: 0.875rem;
    }

    .notice-content {
      flex: 1;

      strong {
        display: block;
        color: #856404;
        margin-bottom: 0.25rem;
      }

      p {
        margin: 0;
        font-size: 0.875rem;
        color: #856404;
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
export class Form1099EntryComponent {
  private readonly navigation = inject(NavigationService);
  private readonly sessionStorage = inject(SessionStorageService);
  private readonly validation = inject(ValidationService);

  readonly helpModal = viewChild.required<EducationalModalComponent>('helpModal');

  readonly seRate = Math.round(SELF_EMPLOYMENT_TAX.rate * 100 * 10) / 10;

  readonly form1099s = computed(() => {
    const formList = this.sessionStorage.taxReturn().income.form1099s;
    if (formList.length === 0) {
      const empty = createEmptyForm1099NEC();
      this.sessionStorage.updateIncome((income) => ({
        ...income,
        form1099s: [empty],
      }));
      return [empty];
    }
    return formList;
  });

  readonly totalIncome = computed(() => {
    return this.form1099s().reduce((sum, form) => sum + (form.nonemployeeCompensation || 0), 0);
  });

  readonly estimatedSETax = computed(() => {
    const netEarnings = this.totalIncome() * SELF_EMPLOYMENT_TAX.netEarningsMultiplier;
    return netEarnings * SELF_EMPLOYMENT_TAX.rate;
  });

  readonly canContinue = computed(() => {
    const formList = this.form1099s();
    return formList.length > 0 && formList.every((form) =>
      this.validation.validateRequired(form.payerName, 'Payer name').isValid &&
      form.nonemployeeCompensation > 0
    );
  });

  readonly validationWarning = computed(() => {
    const formList = this.form1099s();
    if (formList.length === 0) return null;

    for (let i = 0; i < formList.length; i++) {
      const form = formList[i];
      const formLabel = formList.length > 1 ? `1099-NEC #${i + 1}: ` : '';

      if (!this.validation.validateRequired(form.payerName, 'Payer name').isValid) {
        return `${formLabel}Payer name is required`;
      }

      if (!form.nonemployeeCompensation || form.nonemployeeCompensation <= 0) {
        return `${formLabel}Enter income amount (Box 1)`;
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
      form1099s: [...income.form1099s, createEmptyForm1099NEC()],
    }));
  }

  removeForm(id: string): void {
    this.sessionStorage.updateIncome((income) => ({
      ...income,
      form1099s: income.form1099s.filter((form) => form.id !== id),
    }));
  }

  updateForm(id: string, changes: Partial<Form1099NEC>): void {
    this.sessionStorage.updateIncome((income) => ({
      ...income,
      form1099s: income.form1099s.map((form) =>
        form.id === id ? { ...form, ...changes } : form
      ),
    }));
  }

  onContinue(): void {
    this.navigation.navigateTo('/income/summary');
  }

  onBack(): void {
    // Go back to W-2 entry if user has W-2 income, otherwise income types
    if (this.sessionStorage.taxReturn().income.hasW2Income) {
      this.navigation.navigateTo('/income/w2');
    } else {
      this.navigation.navigateTo('/income/types');
    }
  }
}
