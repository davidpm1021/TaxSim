import { ChangeDetectionStrategy, Component, computed, inject, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationService, SessionStorageService, TaxCalculationService } from '@core/services';
import { Form1098T, createEmptyForm1098T, createDefaultStudentEducationInfo } from '@core/models';
import { FormsModule } from '@angular/forms';
import {
  NavigationHeaderComponent,
  EducationalModalComponent,
  ContinueButtonComponent,
  Form1098TFormComponent,
} from '@shared/components';

@Component({
  selector: 'app-form-1098-t-entry',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NavigationHeaderComponent,
    EducationalModalComponent,
    ContinueButtonComponent,
    Form1098TFormComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-navigation-header />

    <div class="page-container">
      <div class="content-card">
        <header class="section-header">
          <h1>Education Expenses (Form 1098-T)</h1>
          <button class="help-trigger" (click)="openHelpModal()" type="button">
            <span class="help-icon">?</span>
            <span>About education credits</span>
          </button>
        </header>

        <p class="instruction">
          Enter information from your Form 1098-T (Tuition Statement) received from your college
          or university. This is used to calculate education credits like the American Opportunity
          Credit or Lifetime Learning Credit.
        </p>

        <!-- Student Information Section -->
        <div class="student-info-section">
          <h3>Student Information</h3>
          <p class="section-desc">Tell us about your education status to determine which credits you qualify for.</p>

          <div class="info-grid">
            <div class="field">
              <label for="enrollmentStatus">Enrollment Status</label>
              <select
                id="enrollmentStatus"
                [ngModel]="studentInfo().enrollmentStatus"
                (ngModelChange)="updateStudentInfo('enrollmentStatus', $event)"
              >
                <option value="full-time">Full-time student</option>
                <option value="half-time">Half-time student</option>
                <option value="less-than-half-time">Less than half-time</option>
              </select>
            </div>

            <div class="field">
              <label for="yearInProgram">Year in Program</label>
              <select
                id="yearInProgram"
                [ngModel]="studentInfo().yearInProgram"
                (ngModelChange)="updateStudentInfo('yearInProgram', +$event)"
              >
                <option [value]="1">1st year (Freshman)</option>
                <option [value]="2">2nd year (Sophomore)</option>
                <option [value]="3">3rd year (Junior)</option>
                <option [value]="4">4th year (Senior)</option>
                <option [value]="5">5th+ year or Graduate</option>
              </select>
            </div>

            <div class="checkbox-field">
              <label>
                <input
                  type="checkbox"
                  [ngModel]="studentInfo().pursuingDegree"
                  (ngModelChange)="updateStudentInfo('pursuingDegree', $event)"
                />
                <span>Pursuing a degree or credential</span>
              </label>
            </div>

            <div class="checkbox-field">
              <label>
                <input
                  type="checkbox"
                  [ngModel]="studentInfo().hasCompletedFourYears"
                  (ngModelChange)="updateStudentInfo('hasCompletedFourYears', $event)"
                />
                <span>Already completed 4 years of post-secondary education</span>
              </label>
            </div>
          </div>
        </div>

        <!-- 1098-T Forms Section -->
        <div class="forms-section">
          <h3>Form 1098-T Details</h3>

          <div class="form-list">
            @for (form of form1098Ts(); track form.id; let i = $index) {
              <div class="form-wrapper">
                @if (form1098Ts().length > 1) {
                  <div class="form-actions">
                    <span class="form-label">1098-T #{{ i + 1 }}</span>
                    <button
                      type="button"
                      class="remove-btn"
                      (click)="removeForm(form.id)"
                      aria-label="Remove this 1098-T"
                    >
                      Remove
                    </button>
                  </div>
                }
                <app-form-1098-t-form
                  [form1098]="form"
                  (form1098Change)="updateForm(form.id, $event)"
                />
              </div>
            }

            <button type="button" class="add-btn" (click)="addForm()">
              + Add Another 1098-T
            </button>
          </div>
        </div>

        <!-- Summary Section -->
        <div class="summary-section">
          <div class="summary-bar">
            <div class="summary-row">
              <span class="summary-label">Total Tuition Paid (Box 1):</span>
              <span class="summary-value">{{ formatCurrency(totalTuition()) }}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Total Scholarships (Box 5):</span>
              <span class="summary-value">{{ formatCurrency(totalScholarships()) }}</span>
            </div>
            <div class="summary-row highlight">
              <span class="summary-label">Qualified Education Expenses:</span>
              <span class="summary-value">{{ formatCurrency(qualifiedExpenses()) }}</span>
            </div>
          </div>

          @if (taxableScholarship() > 0) {
            <div class="warning-notice">
              <div class="notice-icon">!</div>
              <div class="notice-content">
                <strong>Taxable Scholarship Income</strong>
                <p>
                  Your scholarships exceed your qualified tuition expenses by
                  <strong>{{ formatCurrency(taxableScholarship()) }}</strong>.
                  This excess may be taxable income.
                </p>
              </div>
            </div>
          }

          @if (qualifiedExpenses() > 0) {
            <div class="credit-preview">
              <h4>Potential Education Credits</h4>
              <div class="credit-options">
                <div class="credit-option" [class.recommended]="creditResult().recommendedCredit === 'aotc'">
                  <div class="credit-header">
                    <span class="credit-name">American Opportunity Credit (AOTC)</span>
                    @if (creditResult().recommendedCredit === 'aotc') {
                      <span class="badge recommended">Recommended</span>
                    }
                  </div>
                  <div class="credit-amount">{{ formatCurrency(creditResult().aotcAmount) }}</div>
                  @if (creditResult().isEligibleForAOTC) {
                    <div class="credit-details">
                      Up to {{ formatCurrency(aotcRefundable()) }} is refundable
                    </div>
                  } @else {
                    <div class="credit-ineligible">Not eligible</div>
                  }
                </div>

                <div class="credit-option" [class.recommended]="creditResult().recommendedCredit === 'llc'">
                  <div class="credit-header">
                    <span class="credit-name">Lifetime Learning Credit (LLC)</span>
                    @if (creditResult().recommendedCredit === 'llc') {
                      <span class="badge recommended">Recommended</span>
                    }
                  </div>
                  <div class="credit-amount">{{ formatCurrency(creditResult().llcAmount) }}</div>
                  @if (creditResult().isEligibleForLLC) {
                    <div class="credit-details">Non-refundable credit</div>
                  } @else {
                    <div class="credit-ineligible">Not eligible</div>
                  }
                </div>
              </div>
            </div>
          }
        </div>

        <app-continue-button
          [disabled]="!canContinue()"
          (continue)="onContinue()"
          (back)="onBack()"
        />
      </div>
    </div>

    <app-educational-modal #helpModal [title]="'Understanding Education Credits'">
      <p>
        Education credits can significantly reduce your tax bill if you're paying for college.
        There are two main credits:
      </p>

      <h4>American Opportunity Tax Credit (AOTC)</h4>
      <ul>
        <li>Up to <strong>$2,500</strong> per student per year</li>
        <li>First 4 years of college only</li>
        <li>Must be enrolled at least half-time</li>
        <li><strong>40% is refundable</strong> (up to $1,000 back even with no tax liability)</li>
      </ul>

      <h4>Lifetime Learning Credit (LLC)</h4>
      <ul>
        <li>Up to <strong>$2,000</strong> per tax return</li>
        <li>No limit on years of education</li>
        <li>Works for graduate school and continuing education</li>
        <li>Not refundable</li>
      </ul>

      <p>
        <em>
          Note: You can only claim ONE of these credits per student per year.
          If someone else (like your parents) claims you as a dependent, they claim the credit.
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

    /* Student Info Section */
    .student-info-section {
      background: var(--ngpf-blue-pale);
      border-radius: var(--radius-md);
      padding: 1.5rem;
      margin-bottom: 2rem;

      h3 {
        font-size: 1.125rem;
        color: var(--ngpf-navy-dark);
        margin: 0 0 0.25rem;
      }
    }

    .section-desc {
      font-size: 0.875rem;
      color: var(--ngpf-gray-dark);
      margin: 0 0 1rem;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;

      label {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--ngpf-navy-dark);
      }

      select {
        padding: 0.625rem 0.75rem;
        border: 1px solid var(--ngpf-gray-light);
        border-radius: var(--radius-sm);
        font-size: 0.9375rem;
        background: white;

        &:focus {
          outline: none;
          border-color: var(--ngpf-navy-light);
          box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
        }
      }
    }

    .checkbox-field {
      grid-column: span 2;

      label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9375rem;
        color: var(--ngpf-navy-dark);
        cursor: pointer;
      }

      input[type="checkbox"] {
        width: 1.125rem;
        height: 1.125rem;
        cursor: pointer;
      }
    }

    /* Forms Section */
    .forms-section {
      margin-bottom: 2rem;

      h3 {
        font-size: 1.125rem;
        color: var(--ngpf-navy-dark);
        margin: 0 0 1rem;
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

    /* Summary Section */
    .summary-section {
      margin-bottom: 1.5rem;
    }

    .summary-bar {
      padding: 1.25rem;
      background: var(--ngpf-gray-pale);
      border-radius: var(--radius-md);
      margin-bottom: 1rem;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;

      &:not(:last-child) {
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      }

      &.highlight {
        padding-top: 1rem;
        margin-top: 0.5rem;
        border-top: 2px solid var(--ngpf-navy-light);
        border-bottom: none;

        .summary-label {
          font-weight: 600;
          color: var(--ngpf-navy-dark);
        }

        .summary-value {
          font-size: 1.25rem;
          color: var(--ngpf-navy-dark);
        }
      }
    }

    .summary-label {
      font-size: 0.9375rem;
      color: var(--ngpf-gray-dark);
    }

    .summary-value {
      font-size: 1.0625rem;
      font-weight: 600;
      color: var(--ngpf-navy-light);
    }

    .warning-notice {
      display: flex;
      gap: 1rem;
      padding: 1rem 1.25rem;
      background: #fef3c7;
      border: 1px solid #f59e0b;
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
      background: #f59e0b;
      color: white;
      border-radius: 50%;
      font-weight: 700;
      font-size: 0.875rem;
    }

    .notice-content {
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

    /* Credit Preview */
    .credit-preview {
      background: linear-gradient(135deg, #e8fce8 0%, #d1fae5 100%);
      border-radius: var(--radius-md);
      padding: 1.25rem;

      h4 {
        margin: 0 0 1rem;
        font-size: 1rem;
        color: var(--ngpf-navy-dark);
      }
    }

    .credit-options {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .credit-option {
      background: white;
      border-radius: var(--radius-sm);
      padding: 1rem;
      border: 2px solid transparent;

      &.recommended {
        border-color: #10b981;
        box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
      }
    }

    .credit-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .credit-name {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--ngpf-navy-dark);
    }

    .badge.recommended {
      font-size: 0.6875rem;
      padding: 0.125rem 0.5rem;
      background: #10b981;
      color: white;
      border-radius: 999px;
      font-weight: 600;
    }

    .credit-amount {
      font-size: 1.5rem;
      font-weight: 700;
      color: #047857;
      margin-bottom: 0.25rem;
    }

    .credit-details {
      font-size: 0.75rem;
      color: var(--ngpf-gray-dark);
    }

    .credit-ineligible {
      font-size: 0.75rem;
      color: var(--ngpf-error);
      font-style: italic;
    }

    @media (max-width: 600px) {
      .info-grid {
        grid-template-columns: 1fr;
      }

      .checkbox-field {
        grid-column: span 1;
      }

      .credit-options {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class Form1098TEntryComponent {
  private readonly navigation = inject(NavigationService);
  private readonly sessionStorage = inject(SessionStorageService);
  private readonly taxCalculation = inject(TaxCalculationService);

  readonly helpModal = viewChild.required<EducationalModalComponent>('helpModal');

  readonly studentInfo = computed(() => {
    const education = this.sessionStorage.taxReturn().education;
    return education.studentInfo || createDefaultStudentEducationInfo();
  });

  readonly form1098Ts = computed(() => {
    const formList = this.sessionStorage.taxReturn().education.form1098Ts;
    if (formList.length === 0) {
      const empty = createEmptyForm1098T();
      this.sessionStorage.updateEducation((education) => ({
        ...education,
        hasEducationExpenses: true,
        form1098Ts: [empty],
      }));
      return [empty];
    }
    return formList;
  });

  readonly totalTuition = computed(() => {
    return this.form1098Ts().reduce((sum, form) => sum + (form.paymentsReceived || 0), 0);
  });

  readonly totalScholarships = computed(() => {
    return this.form1098Ts().reduce((sum, form) => sum + (form.scholarshipsGrants || 0), 0);
  });

  readonly qualifiedExpenses = computed(() => {
    return Math.max(0, this.totalTuition() - this.totalScholarships());
  });

  readonly taxableScholarship = computed(() => {
    return Math.max(0, this.totalScholarships() - this.totalTuition());
  });

  readonly creditResult = computed(() => {
    const taxReturn = this.sessionStorage.taxReturn();
    // Calculate AGI for phase-out purposes
    const totalW2 = taxReturn.income.w2s.reduce((sum, w2) => sum + w2.wagesTips, 0);
    const total1099 = taxReturn.income.form1099s.reduce((sum, f) => sum + f.nonemployeeCompensation, 0);
    const agi = totalW2 + total1099;

    return this.taxCalculation.calculateEducationCredits(
      this.qualifiedExpenses(),
      agi,
      taxReturn.personalInfo.filingStatus,
      this.studentInfo()
    );
  });

  readonly aotcRefundable = computed(() => {
    if (!this.creditResult().isEligibleForAOTC) return 0;
    return Math.min(this.creditResult().aotcAmount * 0.4, 1000);
  });

  readonly canContinue = computed(() => {
    const formList = this.form1098Ts();
    return formList.length > 0 && formList.every((form) =>
      form.schoolName.trim().length > 0
    );
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

  updateStudentInfo(field: string, value: unknown): void {
    this.sessionStorage.updateEducation((education) => ({
      ...education,
      studentInfo: {
        ...education.studentInfo,
        [field]: value,
      },
    }));
  }

  addForm(): void {
    this.sessionStorage.updateEducation((education) => ({
      ...education,
      form1098Ts: [...education.form1098Ts, createEmptyForm1098T()],
    }));
  }

  removeForm(id: string): void {
    this.sessionStorage.updateEducation((education) => ({
      ...education,
      form1098Ts: education.form1098Ts.filter((form) => form.id !== id),
    }));
  }

  updateForm(id: string, changes: Partial<Form1098T>): void {
    this.sessionStorage.updateEducation((education) => ({
      ...education,
      form1098Ts: education.form1098Ts.map((form) =>
        form.id === id ? { ...form, ...changes } : form
      ),
    }));
  }

  onContinue(): void {
    // Save the education credit to credits
    const result = this.creditResult();
    this.sessionStorage.updateCredits((credits) => ({
      ...credits,
      educationCreditType: result.recommendedCredit,
      educationCredit: result.creditAmount,
      educationCreditRefundable: result.refundableAmount,
    }));

    // Navigate to education credits comparison page
    this.navigation.navigateTo('/education/credits');
  }

  onBack(): void {
    this.navigation.navigateTo('/deductions/comparison');
  }
}
