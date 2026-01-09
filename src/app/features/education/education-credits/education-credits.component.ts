import { ChangeDetectionStrategy, Component, computed, inject, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationService, SessionStorageService, TaxCalculationService } from '@core/services';
import { EducationCreditType, createDefaultStudentEducationInfo } from '@core/models';
import {
  NavigationHeaderComponent,
  EducationalModalComponent,
  ContinueButtonComponent,
} from '@shared/components';

@Component({
  selector: 'app-education-credits',
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
          <h1>Your Education Credit Options</h1>
          <button class="help-trigger" (click)="openHelpModal()" type="button">
            <span class="help-icon">?</span>
            <span>How credits work</span>
          </button>
        </header>

        <p class="instruction">
          Based on your education expenses, here are the credits you may qualify for.
          You can only claim ONE education credit per student per year.
        </p>

        <!-- Credit Comparison Cards -->
        <div class="credit-comparison">
          <!-- AOTC Card -->
          <div
            class="credit-card"
            [class.selected]="selectedCredit() === 'aotc'"
            [class.disabled]="!creditResult().isEligibleForAOTC"
            (click)="creditResult().isEligibleForAOTC && selectCredit('aotc')"
          >
            @if (creditResult().recommendedCredit === 'aotc') {
              <div class="recommended-badge">Recommended</div>
            }

            <div class="card-header">
              <h3>American Opportunity Credit</h3>
              <span class="acronym">AOTC</span>
            </div>

            <div class="credit-amount">{{ formatCurrency(creditResult().aotcAmount) }}</div>

            @if (creditResult().isEligibleForAOTC) {
              <div class="credit-breakdown">
                <div class="breakdown-row">
                  <span>Non-refundable portion:</span>
                  <span>{{ formatCurrency(creditResult().aotcAmount - aotcRefundable()) }}</span>
                </div>
                <div class="breakdown-row refundable">
                  <span>Refundable portion:</span>
                  <span>{{ formatCurrency(aotcRefundable()) }}</span>
                </div>
              </div>

              <ul class="feature-list">
                <li class="pro">Up to $2,500 per student</li>
                <li class="pro">40% is refundable (up to $1,000 back)</li>
                <li class="con">First 4 years of college only</li>
                <li class="con">Must be at least half-time</li>
              </ul>

              @if (selectedCredit() === 'aotc') {
                <div class="selection-indicator">
                  <span class="checkmark">✓</span> Selected
                </div>
              } @else {
                <button class="select-btn" type="button">Select AOTC</button>
              }
            } @else {
              <div class="ineligible-message">
                <strong>Not Eligible</strong>
                <ul>
                  @for (reason of aotcReasons(); track reason) {
                    <li>{{ reason }}</li>
                  }
                </ul>
              </div>
            }
          </div>

          <!-- LLC Card -->
          <div
            class="credit-card"
            [class.selected]="selectedCredit() === 'llc'"
            [class.disabled]="!creditResult().isEligibleForLLC"
            (click)="creditResult().isEligibleForLLC && selectCredit('llc')"
          >
            @if (creditResult().recommendedCredit === 'llc') {
              <div class="recommended-badge">Recommended</div>
            }

            <div class="card-header">
              <h3>Lifetime Learning Credit</h3>
              <span class="acronym">LLC</span>
            </div>

            <div class="credit-amount">{{ formatCurrency(creditResult().llcAmount) }}</div>

            @if (creditResult().isEligibleForLLC) {
              <div class="credit-breakdown">
                <div class="breakdown-row">
                  <span>Non-refundable:</span>
                  <span>{{ formatCurrency(creditResult().llcAmount) }}</span>
                </div>
              </div>

              <ul class="feature-list">
                <li class="pro">Up to $2,000 per tax return</li>
                <li class="pro">No limit on years of education</li>
                <li class="pro">Graduate school qualifies</li>
                <li class="con">Not refundable</li>
              </ul>

              @if (selectedCredit() === 'llc') {
                <div class="selection-indicator">
                  <span class="checkmark">✓</span> Selected
                </div>
              } @else {
                <button class="select-btn" type="button">Select LLC</button>
              }
            } @else {
              <div class="ineligible-message">
                <strong>Not Eligible</strong>
                <ul>
                  @for (reason of llcReasons(); track reason) {
                    <li>{{ reason }}</li>
                  }
                </ul>
              </div>
            }
          </div>
        </div>

        <!-- Savings Summary -->
        @if (selectedCredit() !== 'none' && selectedCreditAmount() > 0) {
          <div class="savings-summary">
            <div class="summary-content">
              <div class="summary-icon">💰</div>
              <div class="summary-text">
                <strong>Your Education Credit:</strong>
                <span class="amount">{{ formatCurrency(selectedCreditAmount()) }}</span>
                @if (selectedRefundable() > 0) {
                  <span class="refundable-note">
                    (includes {{ formatCurrency(selectedRefundable()) }} refundable)
                  </span>
                }
              </div>
            </div>
          </div>
        }

        <!-- No Credit Eligible -->
        @if (!creditResult().isEligibleForAOTC && !creditResult().isEligibleForLLC) {
          <div class="no-credit-message">
            <div class="message-icon">ℹ️</div>
            <div class="message-content">
              <strong>No Education Credit Available</strong>
              <p>
                Based on your situation, you don't qualify for education credits this year.
                This could be due to income limits or education status requirements.
              </p>
            </div>
          </div>
        }

        <!-- Skip Option -->
        <div class="skip-option">
          <label>
            <input
              type="checkbox"
              [checked]="selectedCredit() === 'none'"
              (change)="selectedCredit() !== 'none' ? selectCredit('none') : selectCredit(creditResult().recommendedCredit)"
            />
            <span>Skip education credit (claim neither)</span>
          </label>
        </div>

        <app-continue-button
          (continue)="onContinue()"
          (back)="onBack()"
        />
      </div>
    </div>

    <app-educational-modal #helpModal [title]="'Understanding Education Credits'">
      <h4>Credits vs. Deductions</h4>
      <p>
        Education credits directly reduce your tax bill dollar-for-dollar,
        making them more valuable than deductions.
      </p>

      <h4>Refundable vs. Non-Refundable</h4>
      <p>
        <strong>Refundable credits</strong> (like part of AOTC) can give you money back
        even if you don't owe any taxes. <strong>Non-refundable credits</strong> can only
        reduce your tax bill to zero.
      </p>

      <h4>Which Should I Choose?</h4>
      <p>
        The AOTC is usually better because:
      </p>
      <ul>
        <li>Higher maximum value ($2,500 vs $2,000)</li>
        <li>Part of it is refundable</li>
      </ul>
      <p>
        Choose LLC only if you don't qualify for AOTC (e.g., 5th year of college, graduate school,
        or not pursuing a degree).
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
      margin: 0 0 2rem;
      font-size: 0.9375rem;
    }

    /* Credit Comparison */
    .credit-comparison {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .credit-card {
      position: relative;
      background: var(--ngpf-gray-pale);
      border: 2px solid var(--ngpf-gray-light);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      cursor: pointer;
      transition: all var(--transition-fast);

      &:hover:not(.disabled) {
        border-color: var(--ngpf-navy-light);
        box-shadow: var(--shadow-md);
      }

      &.selected {
        border-color: #10b981;
        background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
      }

      &.disabled {
        cursor: not-allowed;
        opacity: 0.7;
      }
    }

    .recommended-badge {
      position: absolute;
      top: -10px;
      right: 16px;
      background: #10b981;
      color: white;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;

      h3 {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--ngpf-navy-dark);
        margin: 0;
      }
    }

    .acronym {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--ngpf-gray-dark);
      background: rgba(0, 0, 0, 0.1);
      padding: 0.125rem 0.5rem;
      border-radius: var(--radius-sm);
    }

    .credit-amount {
      font-size: 2.25rem;
      font-weight: 700;
      color: #047857;
      margin-bottom: 1rem;
    }

    .credit-breakdown {
      background: white;
      border-radius: var(--radius-sm);
      padding: 0.75rem;
      margin-bottom: 1rem;
    }

    .breakdown-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.875rem;
      padding: 0.25rem 0;

      &.refundable {
        color: #047857;
        font-weight: 600;
      }
    }

    .feature-list {
      list-style: none;
      padding: 0;
      margin: 0 0 1rem;

      li {
        font-size: 0.875rem;
        padding: 0.375rem 0;
        padding-left: 1.5rem;
        position: relative;

        &::before {
          position: absolute;
          left: 0;
          font-size: 0.875rem;
        }

        &.pro::before {
          content: '✓';
          color: #10b981;
        }

        &.con::before {
          content: '⚠';
          color: #f59e0b;
        }
      }
    }

    .select-btn {
      width: 100%;
      padding: 0.75rem;
      background: var(--ngpf-navy-light);
      color: white;
      border: none;
      border-radius: var(--radius-sm);
      font-size: 0.9375rem;
      font-weight: 600;
      cursor: pointer;
      transition: background var(--transition-fast);

      &:hover {
        background: var(--ngpf-navy-dark);
      }
    }

    .selection-indicator {
      width: 100%;
      padding: 0.75rem;
      background: #10b981;
      color: white;
      border-radius: var(--radius-sm);
      font-size: 0.9375rem;
      font-weight: 600;
      text-align: center;
    }

    .checkmark {
      margin-right: 0.5rem;
    }

    .ineligible-message {
      background: var(--ngpf-error-light);
      border-radius: var(--radius-sm);
      padding: 1rem;
      color: var(--ngpf-error);

      strong {
        display: block;
        margin-bottom: 0.5rem;
      }

      ul {
        margin: 0;
        padding-left: 1.25rem;
        font-size: 0.875rem;
      }
    }

    /* Savings Summary */
    .savings-summary {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border-radius: var(--radius-lg);
      padding: 1.25rem 1.5rem;
      margin-bottom: 1.5rem;
    }

    .summary-content {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .summary-icon {
      font-size: 2rem;
    }

    .summary-text {
      color: white;

      strong {
        display: block;
        font-size: 0.875rem;
        opacity: 0.9;
        margin-bottom: 0.25rem;
      }

      .amount {
        font-size: 1.5rem;
        font-weight: 700;
      }

      .refundable-note {
        font-size: 0.875rem;
        opacity: 0.9;
        margin-left: 0.5rem;
      }
    }

    /* No Credit Message */
    .no-credit-message {
      display: flex;
      gap: 1rem;
      padding: 1.25rem;
      background: var(--ngpf-blue-pale);
      border-radius: var(--radius-md);
      margin-bottom: 1.5rem;
    }

    .message-icon {
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .message-content {
      strong {
        display: block;
        color: var(--ngpf-navy-dark);
        margin-bottom: 0.5rem;
      }

      p {
        margin: 0;
        font-size: 0.9375rem;
        color: var(--ngpf-gray-dark);
      }
    }

    /* Skip Option */
    .skip-option {
      margin-bottom: 1.5rem;

      label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9375rem;
        color: var(--ngpf-gray-dark);
        cursor: pointer;
      }

      input[type="checkbox"] {
        width: 1.125rem;
        height: 1.125rem;
      }
    }

    @media (max-width: 700px) {
      .credit-comparison {
        grid-template-columns: 1fr;
      }

      .credit-amount {
        font-size: 1.75rem;
      }
    }
  `,
})
export class EducationCreditsComponent {
  private readonly navigation = inject(NavigationService);
  private readonly sessionStorage = inject(SessionStorageService);
  private readonly taxCalculation = inject(TaxCalculationService);

  readonly helpModal = viewChild.required<EducationalModalComponent>('helpModal');

  readonly selectedCredit = signal<EducationCreditType>(
    this.sessionStorage.taxReturn().credits.educationCreditType || 'none'
  );

  readonly studentInfo = computed(() => {
    const education = this.sessionStorage.taxReturn().education;
    return education.studentInfo || createDefaultStudentEducationInfo();
  });

  readonly qualifiedExpenses = computed(() => {
    const form1098Ts = this.sessionStorage.taxReturn().education.form1098Ts;
    const totalTuition = form1098Ts.reduce((sum, f) => sum + (f.paymentsReceived || 0), 0);
    const totalScholarships = form1098Ts.reduce((sum, f) => sum + (f.scholarshipsGrants || 0), 0);
    return Math.max(0, totalTuition - totalScholarships);
  });

  readonly creditResult = computed(() => {
    const taxReturn = this.sessionStorage.taxReturn();
    const totalW2 = taxReturn.income.w2s.reduce((sum, w2) => sum + w2.wagesTips, 0);
    const total1099 = taxReturn.income.form1099s.reduce((sum, f) => sum + f.nonemployeeCompensation, 0);
    const agi = totalW2 + total1099;

    return this.taxCalculation.calculateEducationCredits(
      this.qualifiedExpenses(),
      agi,
      taxReturn.personalInfo.filingStatus,
      this.studentInfo(),
      this.selectedCredit()
    );
  });

  readonly aotcRefundable = computed(() => {
    if (!this.creditResult().isEligibleForAOTC) return 0;
    return Math.min(this.creditResult().aotcAmount * 0.4, 1000);
  });

  readonly aotcReasons = computed(() => {
    return this.creditResult().ineligibilityReasons
      .filter(r => r.startsWith('AOTC:'))
      .map(r => r.replace('AOTC: ', ''));
  });

  readonly llcReasons = computed(() => {
    return this.creditResult().ineligibilityReasons
      .filter(r => r.startsWith('LLC:'))
      .map(r => r.replace('LLC: ', ''));
  });

  readonly selectedCreditAmount = computed(() => {
    const selected = this.selectedCredit();
    if (selected === 'aotc') return this.creditResult().aotcAmount;
    if (selected === 'llc') return this.creditResult().llcAmount;
    return 0;
  });

  readonly selectedRefundable = computed(() => {
    if (this.selectedCredit() === 'aotc') {
      return this.aotcRefundable();
    }
    return 0;
  });

  constructor() {
    // Initialize with recommended credit if none selected
    const currentCredit = this.sessionStorage.taxReturn().credits.educationCreditType;
    if (currentCredit === 'none') {
      const result = this.creditResult();
      if (result.recommendedCredit !== 'none') {
        this.selectedCredit.set(result.recommendedCredit);
      }
    }
  }

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

  selectCredit(credit: EducationCreditType): void {
    this.selectedCredit.set(credit);
  }

  onContinue(): void {
    // Save selected credit
    const selected = this.selectedCredit();
    let creditAmount = 0;
    let refundableAmount = 0;

    if (selected === 'aotc' && this.creditResult().isEligibleForAOTC) {
      creditAmount = this.creditResult().aotcAmount;
      refundableAmount = this.aotcRefundable();
    } else if (selected === 'llc' && this.creditResult().isEligibleForLLC) {
      creditAmount = this.creditResult().llcAmount;
      refundableAmount = 0;
    }

    this.sessionStorage.updateCredits((credits) => ({
      ...credits,
      educationCreditType: selected,
      educationCredit: creditAmount,
      educationCreditRefundable: refundableAmount,
    }));

    // Navigate to credits summary (existing credits page)
    this.navigation.navigateTo('/credits');
  }

  onBack(): void {
    this.navigation.navigateTo('/education/1098-t');
  }
}
