import { ChangeDetectionStrategy, Component, computed, inject, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationService, SessionStorageService } from '@core/services';
import {
  NavigationHeaderComponent,
  EducationalModalComponent,
  ContinueButtonComponent,
  CurrencyInputComponent,
} from '@shared/components';

@Component({
  selector: 'app-scholarship-calculator',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NavigationHeaderComponent,
    EducationalModalComponent,
    ContinueButtonComponent,
    CurrencyInputComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-navigation-header />

    <div class="page-container">
      <div class="content-card">
        <header class="section-header">
          <h1>Scholarship Taxability Calculator</h1>
          <button class="help-trigger" (click)="openHelpModal()" type="button">
            <span class="help-icon">?</span>
            <span>When are scholarships taxable?</span>
          </button>
        </header>

        <p class="instruction">
          Not all scholarship money is tax-free! Use this calculator to see if any of your
          scholarships or grants might be taxable income.
        </p>

        <div class="calculator-section">
          <h2>Your Scholarships & Grants</h2>
          <div class="input-group">
            <label for="totalScholarships">Total scholarships and grants received</label>
            <app-currency-input
              inputId="totalScholarships"
              [ngModel]="totalScholarships()"
              (ngModelChange)="totalScholarships.set($event)"
              placeholder="0"
            />
            <span class="input-hint">Include all scholarships, grants, and fellowships</span>
          </div>
        </div>

        <div class="calculator-section">
          <h2>Qualified Education Expenses</h2>
          <p class="section-note">These expenses can be "paid" with tax-free scholarship money:</p>

          <div class="input-group">
            <label for="tuition">Tuition and required fees</label>
            <app-currency-input
              inputId="tuition"
              [ngModel]="tuition()"
              (ngModelChange)="tuition.set($event)"
              placeholder="0"
            />
          </div>

          <div class="input-group">
            <label for="books">Required books and supplies</label>
            <app-currency-input
              inputId="books"
              [ngModel]="books()"
              (ngModelChange)="books.set($event)"
              placeholder="0"
            />
            <span class="input-hint">Only include if required for your courses</span>
          </div>

          <div class="input-group">
            <label for="equipment">Required equipment</label>
            <app-currency-input
              inputId="equipment"
              [ngModel]="equipment()"
              (ngModelChange)="equipment.set($event)"
              placeholder="0"
            />
            <span class="input-hint">E.g., required computer, lab supplies</span>
          </div>
        </div>

        <div class="calculator-section">
          <h2>Non-Qualified Expenses</h2>
          <p class="section-note warning">Scholarship money used for these is taxable:</p>

          <div class="expense-list">
            <div class="expense-item">
              <span class="expense-icon">✗</span>
              <span>Room and board (dorm, meal plans)</span>
            </div>
            <div class="expense-item">
              <span class="expense-icon">✗</span>
              <span>Travel and transportation</span>
            </div>
            <div class="expense-item">
              <span class="expense-icon">✗</span>
              <span>Personal expenses</span>
            </div>
            <div class="expense-item">
              <span class="expense-icon">✗</span>
              <span>Optional supplies or equipment</span>
            </div>
          </div>
        </div>

        <div class="results-section" [class.has-taxable]="taxableAmount() > 0">
          <h2>Results</h2>

          <div class="result-row">
            <span class="result-label">Total Scholarships/Grants</span>
            <span class="result-value">{{ formatCurrency(totalScholarships()) }}</span>
          </div>

          <div class="result-row">
            <span class="result-label">Qualified Education Expenses</span>
            <span class="result-value">- {{ formatCurrency(totalQualifiedExpenses()) }}</span>
          </div>

          <div class="result-row total" [class.taxable]="taxableAmount() > 0" [class.not-taxable]="taxableAmount() === 0">
            <span class="result-label">
              @if (taxableAmount() > 0) {
                Taxable Scholarship Income
              } @else {
                No Taxable Scholarship Income
              }
            </span>
            <span class="result-value">{{ formatCurrency(taxableAmount()) }}</span>
          </div>

          @if (taxableAmount() > 0) {
            <div class="tax-notice">
              <div class="notice-icon">!</div>
              <div class="notice-content">
                <strong>This amount is taxable income</strong>
                <p>
                  {{ formatCurrency(taxableAmount()) }} of your scholarship money went toward
                  non-qualified expenses (like room and board). This amount must be reported
                  as income on your tax return.
                </p>
              </div>
            </div>
          } @else if (totalScholarships() > 0) {
            <div class="success-notice">
              <div class="notice-icon">✓</div>
              <div class="notice-content">
                <strong>Good news!</strong>
                <p>
                  All your scholarship money was used for qualified education expenses.
                  None of it is taxable!
                </p>
              </div>
            </div>
          }
        </div>

        <app-continue-button
          (continue)="onContinue()"
          (back)="onBack()"
        />
      </div>
    </div>

    <app-educational-modal #helpModal [title]="'When Are Scholarships Taxable?'">
      <p>
        Scholarships and grants used for <strong>qualified education expenses</strong> are
        generally tax-free. But if you receive more scholarship money than your qualified
        expenses, the extra amount becomes taxable income!
      </p>
      <p><strong>Qualified expenses include:</strong></p>
      <ul>
        <li>Tuition and required fees</li>
        <li>Books, supplies, and equipment required for courses</li>
      </ul>
      <p><strong>NOT qualified (taxable if paid with scholarships):</strong></p>
      <ul>
        <li>Room and board (dorm fees, meal plans)</li>
        <li>Travel expenses</li>
        <li>Personal living expenses</li>
        <li>Optional equipment</li>
      </ul>
      <p>
        <em>
          Example: If you receive a $30,000 scholarship but only have $22,000 in tuition and books,
          the remaining $8,000 is taxable income if used for room and board.
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
      max-width: 700px;
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

    .calculator-section {
      margin-bottom: 1.5rem;
      padding: 1.25rem;
      background: var(--ngpf-gray-pale);
      border-radius: var(--radius-md);

      h2 {
        font-size: 1rem;
        font-weight: 600;
        color: var(--ngpf-navy-dark);
        margin: 0 0 0.75rem;
      }
    }

    .section-note {
      font-size: 0.875rem;
      color: var(--ngpf-gray-dark);
      margin: 0 0 1rem;

      &.warning {
        color: var(--ngpf-error);
      }
    }

    .input-group {
      margin-bottom: 1rem;

      &:last-child {
        margin-bottom: 0;
      }

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

    .expense-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .expense-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--ngpf-gray-dark);
    }

    .expense-icon {
      color: var(--ngpf-error);
      font-weight: 600;
    }

    .results-section {
      padding: 1.25rem;
      background: var(--ngpf-blue-pale);
      border-radius: var(--radius-md);
      margin-bottom: 1.5rem;

      &.has-taxable {
        background: #fef2f2;
        border: 1px solid #fecaca;
      }

      h2 {
        font-size: 1rem;
        font-weight: 600;
        color: var(--ngpf-navy-dark);
        margin: 0 0 1rem;
      }
    }

    .result-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      font-size: 0.9375rem;

      &.total {
        margin-top: 0.5rem;
        padding-top: 0.75rem;
        border-top: 2px solid var(--ngpf-gray);
        font-weight: 600;
        font-size: 1rem;

        &.taxable {
          color: var(--ngpf-error);
          border-top-color: var(--ngpf-error);
        }

        &.not-taxable {
          color: var(--ngpf-success);
          border-top-color: var(--ngpf-success);
        }
      }
    }

    .result-label {
      color: var(--ngpf-gray-dark);
    }

    .result-value {
      font-weight: 500;
      color: var(--ngpf-navy-dark);
    }

    .tax-notice, .success-notice {
      display: flex;
      gap: 0.75rem;
      margin-top: 1rem;
      padding: 1rem;
      border-radius: var(--radius-sm);
    }

    .tax-notice {
      background: #fff1f2;
      border: 1px solid #fecaca;
    }

    .success-notice {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
    }

    .notice-icon {
      flex-shrink: 0;
      width: 1.5rem;
      height: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      font-weight: 700;
      font-size: 0.875rem;

      .tax-notice & {
        background: var(--ngpf-error);
        color: white;
      }

      .success-notice & {
        background: #10b981;
        color: white;
      }
    }

    .notice-content {
      flex: 1;

      strong {
        display: block;
        margin-bottom: 0.25rem;

        .tax-notice & {
          color: #991b1b;
        }

        .success-notice & {
          color: #166534;
        }
      }

      p {
        margin: 0;
        font-size: 0.875rem;

        .tax-notice & {
          color: #991b1b;
        }

        .success-notice & {
          color: #166534;
        }
      }
    }
  `,
})
export class ScholarshipCalculatorComponent {
  private readonly navigation = inject(NavigationService);
  private readonly sessionStorage = inject(SessionStorageService);

  readonly helpModal = viewChild.required<EducationalModalComponent>('helpModal');

  // Input signals
  readonly totalScholarships = signal(0);
  readonly tuition = signal(0);
  readonly books = signal(0);
  readonly equipment = signal(0);

  // Computed signals
  readonly totalQualifiedExpenses = computed(() => {
    return this.tuition() + this.books() + this.equipment();
  });

  readonly taxableAmount = computed(() => {
    const excess = this.totalScholarships() - this.totalQualifiedExpenses();
    return Math.max(0, excess);
  });

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  openHelpModal(): void {
    this.helpModal().open();
  }

  onContinue(): void {
    this.navigation.navigateTo('/education/credits');
  }

  onBack(): void {
    this.navigation.navigateTo('/education/1098-t');
  }
}
