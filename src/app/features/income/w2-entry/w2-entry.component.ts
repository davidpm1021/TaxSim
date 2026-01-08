import { ChangeDetectionStrategy, Component, computed, inject, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationService, SessionStorageService, ValidationService } from '@core/services';
import { W2, createEmptyW2 } from '@core/models';
import {
  NavigationHeaderComponent,
  EducationalModalComponent,
  ContinueButtonComponent,
  W2FormComponent,
  ValidationMessageComponent,
} from '@shared/components';

@Component({
  selector: 'app-w2-entry',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NavigationHeaderComponent,
    EducationalModalComponent,
    ContinueButtonComponent,
    W2FormComponent,
    ValidationMessageComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-navigation-header />

    <div class="page-container">
      <div class="content-card">
        <header class="section-header">
          <h1>Enter your W-2 information</h1>
          <button class="help-trigger" (click)="openHelpModal()" type="button">
            <span class="help-icon">?</span>
            <span>Understanding your W-2</span>
          </button>
        </header>

        <p class="instruction">
          Enter the information from each W-2 you received. The form below matches the official IRS
          Form W-2 layout. Look for the box numbers on your actual form.
        </p>

        <div class="w2-list">
          @for (w2 of w2s(); track w2.id; let i = $index) {
            <div class="w2-entry">
              <div class="w2-entry-header">
                <span class="w2-number">W-2 #{{ i + 1 }}</span>
                @if (w2s().length > 1) {
                  <button
                    type="button"
                    class="remove-btn"
                    (click)="removeW2(w2.id)"
                    aria-label="Remove this W-2"
                  >
                    Remove
                  </button>
                }
              </div>

              <app-w2-form [w2]="w2" (w2Change)="onW2Change(w2.id, $event)" />
            </div>
          }

          <button type="button" class="add-btn" (click)="addW2()">
            + Add Another W-2
          </button>
        </div>

        <div class="summary-bar">
          <div class="summary-item">
            <span class="summary-label">Total W-2 Wages (Box 1):</span>
            <span class="summary-value">{{ formatCurrency(totalWages()) }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Total Federal Withheld (Box 2):</span>
            <span class="summary-value">{{ formatCurrency(totalWithheld()) }}</span>
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

    <app-educational-modal #helpModal [title]="'Understanding Your W-2'">
      <p>
        A <strong>W-2 form</strong> is what your employer gives you each year showing how much you
        earned and how much tax was already withheld from your paychecks.
      </p>
      <p><strong>Key boxes to know:</strong></p>
      <ul>
        <li>
          <strong>Box 1 (Wages)</strong> — Your total taxable income from this job. This is the
          amount you'll pay federal income tax on.
        </li>
        <li>
          <strong>Box 2 (Federal Tax Withheld)</strong> — The amount your employer already sent to
          the IRS on your behalf. Think of this as "prepaying" your taxes.
        </li>
        <li>
          <strong>Boxes 3-6</strong> — Social Security and Medicare wages and taxes. These fund
          retirement and healthcare benefits.
        </li>
        <li>
          <strong>Box 12</strong> — Special items like 401(k) contributions (code D), health
          insurance costs (code DD), or HSA contributions (code W).
        </li>
        <li>
          <strong>Boxes 15-17</strong> — State tax information, similar to the federal boxes but
          for state taxes.
        </li>
      </ul>
      <p>
        <em>
          When you file your tax return, you compare what you owe (based on Box 1) to what you
          already paid (Box 2). If you paid more than you owe, you get a refund!
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
      max-width: 900px;
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

    .w2-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .w2-entry {
      border: 1px solid var(--ngpf-gray-light);
      border-radius: var(--radius-md);
      padding: 1rem;
      background: var(--ngpf-gray-pale);
    }

    .w2-entry-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .w2-number {
      font-weight: 600;
      color: var(--ngpf-navy-light);
      font-size: 1.125rem;
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

    .summary-bar {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      padding: 1rem 1.25rem;
      background: var(--ngpf-blue-pale);
      border-radius: var(--radius-sm);
      margin: 1.5rem 0;

      @media (max-width: 500px) {
        flex-direction: column;
        gap: 0.5rem;
      }
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
      font-size: 1rem;
      font-weight: 600;
      color: var(--ngpf-navy-light);
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
export class W2EntryComponent {
  private readonly navigation = inject(NavigationService);
  private readonly sessionStorage = inject(SessionStorageService);
  private readonly validation = inject(ValidationService);

  readonly helpModal = viewChild.required<EducationalModalComponent>('helpModal');

  constructor() {
    // Ensure at least one W2 exists when component loads
    const w2List = this.sessionStorage.taxReturn().income.w2s;
    if (w2List.length === 0) {
      this.sessionStorage.updateIncome((income) => ({
        ...income,
        w2s: [createEmptyW2()],
      }));
    }
  }

  readonly w2s = computed(() => {
    return this.sessionStorage.taxReturn().income.w2s;
  });

  readonly totalWages = computed(() => {
    return this.w2s().reduce((sum, w2) => sum + (w2.wagesTips || 0), 0);
  });

  readonly totalWithheld = computed(() => {
    return this.w2s().reduce((sum, w2) => sum + (w2.federalWithheld || 0), 0);
  });

  readonly canContinue = computed(() => {
    const w2List = this.w2s();
    if (w2List.length === 0) return false;

    return w2List.every((w2) => {
      // Require employer name
      const hasEmployerName = this.validation.validateRequired(w2.employerName, 'Employer name').isValid;
      // Require wages > 0
      const hasWages = w2.wagesTips > 0;
      // Withholding cannot exceed wages
      const validWithholding = this.validation.validateWithholdingVsWages(w2.federalWithheld || 0, w2.wagesTips || 0).isValid;

      return hasEmployerName && hasWages && validWithholding;
    });
  });

  readonly validationWarning = computed(() => {
    const w2List = this.w2s();
    if (w2List.length === 0) return null;

    for (let i = 0; i < w2List.length; i++) {
      const w2 = w2List[i];
      const w2Label = w2List.length > 1 ? `W-2 #${i + 1}: ` : '';

      // Check employer name
      if (!this.validation.validateRequired(w2.employerName, 'Employer name').isValid) {
        return `${w2Label}Employer name is required`;
      }

      // Check wages
      if (!w2.wagesTips || w2.wagesTips <= 0) {
        return `${w2Label}Enter wages (Box 1)`;
      }

      // Check withholding vs wages
      const withholdingResult = this.validation.validateWithholdingVsWages(w2.federalWithheld || 0, w2.wagesTips || 0);
      if (!withholdingResult.isValid) {
        return `${w2Label}${withholdingResult.error}`;
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

  addW2(): void {
    this.sessionStorage.updateIncome((income) => ({
      ...income,
      w2s: [...income.w2s, createEmptyW2()],
    }));
  }

  removeW2(id: string): void {
    this.sessionStorage.updateIncome((income) => ({
      ...income,
      w2s: income.w2s.filter((w2) => w2.id !== id),
    }));
  }

  onW2Change(id: string, changes: Partial<W2>): void {
    this.sessionStorage.updateIncome((income) => ({
      ...income,
      w2s: income.w2s.map((w2) => (w2.id === id ? { ...w2, ...changes } : w2)),
    }));
  }

  onContinue(): void {
    // Auto-populate SS and Medicare fields if not already set
    this.sessionStorage.updateIncome((income) => ({
      ...income,
      w2s: income.w2s.map((w2) => ({
        ...w2,
        // Only populate if not already set by user
        socialSecurityWages: w2.socialSecurityWages || w2.wagesTips,
        medicareWages: w2.medicareWages || w2.wagesTips,
        socialSecurityWithheld: w2.socialSecurityWithheld || w2.wagesTips * 0.062,
        medicareWithheld: w2.medicareWithheld || w2.wagesTips * 0.0145,
      })),
    }));

    // Navigate based on what other income types user selected
    const income = this.sessionStorage.taxReturn().income;
    if (income.has1099Income) {
      this.navigation.navigateTo('/income/1099');
    } else if (income.hasInterestIncome) {
      this.navigation.navigateTo('/income/1099-int');
    } else {
      this.navigation.navigateTo('/income/summary');
    }
  }

  onBack(): void {
    this.navigation.navigateTo('/income/types');
  }
}
