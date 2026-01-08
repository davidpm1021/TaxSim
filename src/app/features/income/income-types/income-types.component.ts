import { ChangeDetectionStrategy, Component, computed, inject, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationService, SessionStorageService } from '@core/services';
import {
  NavigationHeaderComponent,
  EducationalModalComponent,
  ContinueButtonComponent,
} from '@shared/components';

@Component({
  selector: 'app-income-types',
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
          <h1>What types of income did you receive?</h1>
          <button class="help-trigger" (click)="openHelpModal()" type="button">
            <span class="help-icon">?</span>
            <span>What's the difference?</span>
          </button>
        </header>

        <p class="instruction">Select all that apply:</p>

        <div class="income-options">
          <label class="income-option" [class.selected]="hasW2()">
            <input
              type="checkbox"
              [checked]="hasW2()"
              (change)="toggleW2()"
            />
            <div class="option-icon">W-2</div>
            <div class="option-content">
              <span class="option-label">W-2 Wages</span>
              <span class="option-description">
                Income from an employer who withholds taxes from your paycheck
              </span>
            </div>
            <span class="check-mark">✓</span>
          </label>

          <label class="income-option" [class.selected]="has1099()">
            <input
              type="checkbox"
              [checked]="has1099()"
              (change)="toggle1099()"
            />
            <div class="option-icon">1099</div>
            <div class="option-content">
              <span class="option-label">1099-NEC Income</span>
              <span class="option-description">
                Self-employment or gig work income (DoorDash, freelancing, etc.)
              </span>
            </div>
            <span class="check-mark">✓</span>
          </label>

          <label class="income-option" [class.selected]="hasInterest()">
            <input
              type="checkbox"
              [checked]="hasInterest()"
              (change)="toggleInterest()"
            />
            <div class="option-icon">INT</div>
            <div class="option-content">
              <span class="option-label">1099-INT Interest</span>
              <span class="option-description">
                Interest earned from bank accounts, CDs, or investments
              </span>
            </div>
            <span class="check-mark">✓</span>
          </label>
        </div>

        <app-continue-button
          [disabled]="!hasAnyIncome()"
          (continue)="onContinue()"
          (back)="onBack()"
        />
      </div>
    </div>

    <app-educational-modal #helpModal [title]="'Types of Income'">
      <p>
        <strong>W-2 Income</strong> is what you earn as an employee. Your employer withholds taxes
        from each paycheck and sends them to the IRS for you. At tax time, you report what you
        earned and what was already withheld.
      </p>
      <p>
        <strong>1099-NEC Income</strong> is what you earn as an independent contractor or from gig
        work (like DoorDash, tutoring, or freelance jobs). No taxes are withheld—you receive the
        full amount and are responsible for paying taxes yourself. You'll also owe self-employment
        tax (15.3%) to cover Social Security and Medicare.
      </p>
      <p>
        <strong>1099-INT Income</strong> is interest you earn from bank accounts, savings accounts,
        or CDs. Banks report this to the IRS if you earn more than $10 in interest. This income is
        taxed as regular income.
      </p>
      <p>
        <em>
          Example: If you work at a coffee shop, you get a W-2. If you mow lawns for neighbors,
          that's 1099-NEC income. If you have a savings account that earns interest, that's 1099-INT income.
        </em>
      </p>
    </app-educational-modal>
  `,
  styles: `
    .page-container {
      min-height: calc(100vh - 64px);
      padding: 2rem;
      background: linear-gradient(180deg, #f0f4f8 0%, #e2e8f0 100%);
    }

    .content-card {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 20px;
      padding: 2rem;
      box-shadow:
        0 1px 3px rgba(0, 0, 0, 0.04),
        0 8px 24px rgba(0, 0, 0, 0.06);
      animation: slideUp 0.5s ease;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .section-header {
      text-align: center;
      margin-bottom: 1.5rem;

      h1 {
        font-family: var(--font-heading);
        font-size: 1.75rem;
        font-weight: 700;
        color: var(--ngpf-navy);
        margin: 0 0 1rem;
      }
    }

    .help-trigger {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: none;
      border: none;
      color: var(--ngpf-bright-blue);
      font-size: 0.9375rem;
      font-weight: 500;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 8px;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(39, 92, 228, 0.08);
      }

      &:focus-visible {
        outline: 2px solid var(--ngpf-bright-blue);
        outline-offset: 2px;
      }
    }

    .help-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.5rem;
      height: 1.5rem;
      background: var(--ngpf-bright-blue);
      color: white;
      border-radius: 50%;
      font-size: 0.875rem;
      font-weight: 700;
    }

    .instruction {
      color: #64748b;
      font-size: 0.9375rem;
      margin: 0 0 1rem;
      text-align: center;
    }

    .income-options {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .income-option {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem 1.5rem;
      border: 2px solid #e2e8f0;
      border-radius: 16px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      background: #f8fafc;

      &:hover {
        border-color: #cbd5e1;
        background: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      }

      &.selected {
        border-color: var(--ngpf-bright-blue);
        background: linear-gradient(135deg, rgba(39, 92, 228, 0.03), rgba(29, 184, 232, 0.02));
        box-shadow:
          0 0 0 4px rgba(39, 92, 228, 0.1),
          0 4px 12px rgba(39, 92, 228, 0.15);
      }

      input[type='checkbox'] {
        position: absolute;
        opacity: 0;
        pointer-events: none;
      }

      &:focus-within {
        outline: 3px solid rgba(244, 173, 0, 0.5);
        outline-offset: 2px;
      }
    }

    .option-icon {
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f0f4f8, #e2e8f0);
      border-radius: 14px;
      font-size: 0.8125rem;
      font-weight: 800;
      color: #64748b;
      letter-spacing: -0.02em;
      transition: all 0.3s ease;

      .selected & {
        background: linear-gradient(135deg, var(--ngpf-bright-blue), #1d4ed8);
        color: white;
      }
    }

    .option-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .option-label {
      font-size: 1.0625rem;
      font-weight: 600;
      color: var(--ngpf-navy);
    }

    .option-description {
      font-size: 0.875rem;
      color: #64748b;
      line-height: 1.4;
    }

    .check-mark {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--ngpf-success);
      color: white;
      border-radius: 50%;
      font-size: 1rem;
      opacity: 0;
      transform: scale(0.5);
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

      .selected & {
        opacity: 1;
        transform: scale(1);
      }
    }

    @media (max-width: 520px) {
      .page-container {
        padding: 1.25rem;
      }

      .content-card {
        padding: 1.5rem;
        border-radius: 16px;
      }

      .section-header h1 {
        font-size: 1.375rem;
      }

      .option-icon {
        width: 48px;
        height: 48px;
        font-size: 0.75rem;
      }
    }
  `,
})
export class IncomeTypesComponent {
  private readonly navigation = inject(NavigationService);
  private readonly sessionStorage = inject(SessionStorageService);

  readonly helpModal = viewChild.required<EducationalModalComponent>('helpModal');

  readonly hasW2 = computed(() => this.sessionStorage.taxReturn().income.hasW2Income);
  readonly has1099 = computed(() => this.sessionStorage.taxReturn().income.has1099Income);
  readonly hasInterest = computed(() => this.sessionStorage.taxReturn().income.hasInterestIncome);
  readonly hasAnyIncome = computed(() => this.hasW2() || this.has1099() || this.hasInterest());

  toggleW2(): void {
    this.sessionStorage.updateIncome((income) => ({
      ...income,
      hasW2Income: !income.hasW2Income,
      w2s: !income.hasW2Income && income.w2s.length === 0 ? [] : income.w2s,
    }));
  }

  toggle1099(): void {
    this.sessionStorage.updateIncome((income) => ({
      ...income,
      has1099Income: !income.has1099Income,
      form1099s: !income.has1099Income && income.form1099s.length === 0 ? [] : income.form1099s,
    }));
  }

  toggleInterest(): void {
    this.sessionStorage.updateIncome((income) => ({
      ...income,
      hasInterestIncome: !income.hasInterestIncome,
      form1099Ints: !income.hasInterestIncome && income.form1099Ints.length === 0 ? [] : income.form1099Ints,
    }));
  }

  openHelpModal(): void {
    this.helpModal().open();
  }

  onContinue(): void {
    if (this.hasW2()) {
      this.navigation.navigateTo('/income/w2');
    } else if (this.has1099()) {
      this.navigation.navigateTo('/income/1099');
    } else if (this.hasInterest()) {
      this.navigation.navigateTo('/income/1099-int');
    }
  }

  onBack(): void {
    this.navigation.navigateTo('/personal-info/dependent-status');
  }
}
