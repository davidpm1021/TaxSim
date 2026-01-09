import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Form1098T } from '@core/models';

@Component({
  selector: 'app-form-1098-t-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="form-1098-t">
      <!-- Form Header -->
      <div class="form-header">
        <div class="header-left">
          <div class="void-box">
            <input type="checkbox" class="void-checkbox" disabled />
            <span class="void-text">VOID</span>
          </div>
          <div class="corrected-box">
            <input type="checkbox" class="corrected-checkbox" disabled />
            <span class="corrected-text">CORRECTED</span>
          </div>
        </div>
        <div class="header-center">
          <div class="form-info">
            <span class="form-label">Form</span>
            <span class="form-number">1098-T</span>
          </div>
          <div class="form-year">2025</div>
        </div>
        <div class="header-right">
          <div class="form-title">Tuition<br/>Statement</div>
          <div class="copy-info">
            Copy B<br/>
            For Student
          </div>
        </div>
      </div>

      <!-- Main Form Body -->
      <div class="form-body">
        <!-- Left Column: School and Student Info -->
        <div class="left-column">
          <!-- School's Name and Address -->
          <div class="box school-info">
            <div class="box-label">FILER'S name, street address, city or town, state or province, country, ZIP or foreign postal code, and telephone no.</div>
            <input
              type="text"
              class="box-value"
              [ngModel]="form1098().schoolName"
              (ngModelChange)="onFieldChange('schoolName', $event)"
              placeholder="College or university name"
            />
            <input
              type="text"
              class="box-value address"
              [ngModel]="form1098().schoolAddress"
              (ngModelChange)="onFieldChange('schoolAddress', $event)"
              placeholder="Address (optional)"
            />
          </div>

          <!-- TIN Row -->
          <div class="tin-row">
            <div class="box filer-tin">
              <div class="box-label">FILER'S TIN</div>
              <input
                type="text"
                class="box-value tin-input"
                [ngModel]="form1098().schoolTin"
                (ngModelChange)="onFieldChange('schoolTin', $event)"
                placeholder="00-0000000"
                maxlength="10"
              />
            </div>
            <div class="box student-tin">
              <div class="box-label">STUDENT'S TIN</div>
              <input
                type="text"
                class="box-value tin-input"
                [ngModel]="form1098().studentSsn"
                (ngModelChange)="onFieldChange('studentSsn', $event)"
                placeholder="000-00-0000"
                maxlength="11"
              />
            </div>
          </div>

          <!-- Student's Name -->
          <div class="box student-name">
            <div class="box-label">STUDENT'S name</div>
            <div class="box-value student-hint">Your name as shown on tax form</div>
          </div>

          <!-- Account Number -->
          <div class="box account-number">
            <div class="box-label">Account number (see instructions)</div>
            <div class="box-value account-hint">Not required for this simulation</div>
          </div>
        </div>

        <!-- Right Column: Amount Boxes -->
        <div class="right-column">
          <!-- Box 1: Payments received (MAIN BOX) -->
          <div class="box box-1">
            <div class="box-label">1 Payments received for qualified tuition and related expenses</div>
            <div class="box-value-wrapper">
              <span class="currency-symbol">$</span>
              <input
                type="text"
                inputmode="numeric"
                class="box-value currency"
                [value]="formatCurrency(form1098().paymentsReceived, 'paymentsReceived')"
                (input)="onCurrencyInput($event, 'paymentsReceived')"
                (focus)="onCurrencyFocus($event, 'paymentsReceived')"
                (blur)="onCurrencyBlur($event, 'paymentsReceived')"
                (keydown)="onCurrencyKeyDown($event)"
                placeholder="0"
              />
            </div>
          </div>

          <!-- Box 4: Adjustments (optional) -->
          <div class="box box-4">
            <div class="box-label">4 Adjustments made for a prior year</div>
            <div class="box-value-wrapper">
              <span class="currency-symbol">$</span>
              <input
                type="text"
                inputmode="numeric"
                class="box-value currency"
                [value]="formatCurrency(form1098().adjustmentsPriorYear, 'adjustmentsPriorYear')"
                (input)="onCurrencyInput($event, 'adjustmentsPriorYear')"
                (focus)="onCurrencyFocus($event, 'adjustmentsPriorYear')"
                (blur)="onCurrencyBlur($event, 'adjustmentsPriorYear')"
                (keydown)="onCurrencyKeyDown($event)"
              />
            </div>
          </div>

          <!-- Box 5: Scholarships or grants (IMPORTANT) -->
          <div class="box box-5">
            <div class="box-label">5 Scholarships or grants</div>
            <div class="box-value-wrapper">
              <span class="currency-symbol">$</span>
              <input
                type="text"
                inputmode="numeric"
                class="box-value currency"
                [value]="formatCurrency(form1098().scholarshipsGrants, 'scholarshipsGrants')"
                (input)="onCurrencyInput($event, 'scholarshipsGrants')"
                (focus)="onCurrencyFocus($event, 'scholarshipsGrants')"
                (blur)="onCurrencyBlur($event, 'scholarshipsGrants')"
                (keydown)="onCurrencyKeyDown($event)"
                placeholder="0"
              />
            </div>
          </div>

          <!-- Box 6: Adjustments to scholarships (optional) -->
          <div class="box box-6">
            <div class="box-label">6 Adjustments to scholarships or grants for a prior year</div>
            <div class="box-value-wrapper">
              <span class="currency-symbol">$</span>
              <input
                type="text"
                inputmode="numeric"
                class="box-value currency"
                [value]="formatCurrency(form1098().adjustmentsScholarships, 'adjustmentsScholarships')"
                (input)="onCurrencyInput($event, 'adjustmentsScholarships')"
                (focus)="onCurrencyFocus($event, 'adjustmentsScholarships')"
                (blur)="onCurrencyBlur($event, 'adjustmentsScholarships')"
                (keydown)="onCurrencyKeyDown($event)"
              />
            </div>
          </div>

          <!-- Checkbox row: Boxes 7, 8, 9 -->
          <div class="checkbox-row">
            <div class="box checkbox-box box-8">
              <div class="box-label">8 At least half-time student</div>
              <div class="checkbox-wrapper">
                <input
                  type="checkbox"
                  class="box-checkbox"
                  [ngModel]="form1098().atLeastHalfTime"
                  (ngModelChange)="onFieldChange('atLeastHalfTime', $event)"
                />
              </div>
            </div>
            <div class="box checkbox-box box-9">
              <div class="box-label">9 Graduate student</div>
              <div class="checkbox-wrapper">
                <input
                  type="checkbox"
                  class="box-checkbox"
                  [ngModel]="form1098().isGraduateStudent"
                  (ngModelChange)="onFieldChange('isGraduateStudent', $event)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Calculation Summary -->
      @if (form1098().paymentsReceived > 0 || form1098().scholarshipsGrants > 0) {
        <div class="calculation-summary">
          <div class="calc-row">
            <span class="calc-label">Qualified Education Expenses:</span>
            <span class="calc-value">\${{ qualifiedExpenses | number:'1.0-0' }}</span>
          </div>
          @if (taxableScholarship > 0) {
            <div class="calc-row warning">
              <span class="calc-label">Taxable Scholarship Amount:</span>
              <span class="calc-value">\${{ taxableScholarship | number:'1.0-0' }}</span>
            </div>
            <div class="calc-note">
              Your scholarships exceed tuition. The excess may be taxable income.
            </div>
          }
        </div>
      }

      <!-- Form Footer -->
      <div class="form-footer">
        <span class="footer-left">Form 1098-T</span>
        <span class="footer-center">Department of the Treasury - Internal Revenue Service</span>
        <span class="footer-right">(Rev. January 2024)</span>
      </div>
    </div>
  `,
  styles: `
    .form-1098-t {
      font-family: Arial, Helvetica, sans-serif;
      max-width: 700px;
      margin: 0 auto;
      border: 2px solid #000;
      background: #fff;
    }

    /* ========== HEADER SECTION ========== */
    .form-header {
      display: grid;
      grid-template-columns: 140px 1fr 140px;
      border-bottom: 2px solid #000;
      min-height: 60px;
    }

    .header-left {
      border-right: 1px solid #000;
      padding: 8px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 6px;
    }

    .void-box, .corrected-box {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 10px;
    }

    .void-text, .corrected-text {
      font-weight: bold;
    }

    .void-checkbox, .corrected-checkbox {
      width: 12px;
      height: 12px;
    }

    .header-center {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 6px;
    }

    .form-info {
      display: flex;
      align-items: baseline;
      gap: 6px;
    }

    .form-label {
      font-size: 11px;
    }

    .form-number {
      font-size: 22px;
      font-weight: bold;
      color: #000;
    }

    .form-year {
      font-size: 16px;
      font-weight: bold;
    }

    .header-right {
      border-left: 1px solid #000;
      padding: 8px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      text-align: center;
    }

    .form-title {
      font-size: 11px;
      font-weight: bold;
      line-height: 1.3;
      margin-bottom: 4px;
    }

    .copy-info {
      font-size: 9px;
      line-height: 1.3;
    }

    /* ========== FORM BODY ========== */
    .form-body {
      display: grid;
      grid-template-columns: 1fr 200px;
      background: #e8fce8; /* Light green tint for education forms */
    }

    .left-column {
      border-right: 1px solid #000;
    }

    .right-column {
      display: flex;
      flex-direction: column;
    }

    .box {
      border-bottom: 1px solid #000;
      padding: 4px 6px;
      min-height: 40px;
    }

    .box:last-child {
      border-bottom: none;
    }

    .box-label {
      font-size: 8px;
      font-weight: bold;
      color: #000;
      margin-bottom: 2px;
      line-height: 1.2;
      text-transform: uppercase;
    }

    .box-value {
      border: none;
      background: transparent;
      font-family: 'Courier New', Courier, monospace;
      font-size: 13px;
      padding: 2px 4px;
      outline: none;
      width: 100%;
    }

    .box-value:focus {
      background: #fffde7;
    }

    .box-value::placeholder {
      color: #999;
      font-style: italic;
      font-size: 11px;
    }

    .box-value.address {
      font-size: 11px;
      margin-top: 2px;
    }

    /* School Info Section */
    .school-info {
      min-height: 70px;
    }

    /* TIN Row */
    .tin-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      border-bottom: 1px solid #000;
    }

    .filer-tin {
      border-right: 1px solid #000;
      border-bottom: none;
    }

    .student-tin {
      border-bottom: none;
    }

    .tin-input {
      letter-spacing: 1px;
    }

    /* Student and Account sections */
    .student-name {
      min-height: 40px;
    }

    .student-hint, .account-hint {
      color: #999;
      font-style: italic;
      font-size: 11px;
    }

    .account-number {
      border-bottom: none;
    }

    /* Right Column Boxes */
    .right-column .box {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .box-1, .box-5 {
      background: #fff3cd; /* Highlight important boxes */
      min-height: 50px;
    }

    .box-1 .box-label, .box-5 .box-label {
      font-size: 9px;
    }

    .box-value-wrapper {
      display: flex;
      align-items: center;
      flex: 1;
    }

    .currency-symbol {
      font-size: 14px;
      color: #666;
      padding-left: 4px;
    }

    .currency {
      text-align: right;
      font-size: 14px;
      flex: 1;
    }

    /* Checkbox Row */
    .checkbox-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      border-bottom: none;
    }

    .checkbox-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 50px;
      border-bottom: none;
    }

    .checkbox-box.box-8 {
      border-right: 1px solid #000;
    }

    .checkbox-wrapper {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .box-checkbox {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }

    /* ========== CALCULATION SUMMARY ========== */
    .calculation-summary {
      background: #f8f9fa;
      border-top: 2px solid #000;
      padding: 12px 16px;
    }

    .calc-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 0;
    }

    .calc-row.warning {
      color: #d32f2f;
      font-weight: 600;
    }

    .calc-label {
      font-size: 12px;
    }

    .calc-value {
      font-weight: 700;
      font-size: 14px;
      font-family: 'Courier New', Courier, monospace;
    }

    .calc-note {
      font-size: 11px;
      color: #666;
      margin-top: 8px;
      padding: 8px;
      background: #fff3cd;
      border-radius: 4px;
    }

    /* ========== FOOTER ========== */
    .form-footer {
      display: flex;
      justify-content: space-between;
      padding: 6px 12px;
      border-top: 2px solid #000;
      font-size: 9px;
      background: #fff;
    }

    .footer-left {
      font-weight: bold;
    }

    .footer-center {
      text-align: center;
    }

    .footer-right {
      color: #666;
    }

    /* ========== RESPONSIVE ========== */
    @media (max-width: 600px) {
      .form-1098-t {
        font-size: 12px;
      }

      .form-header {
        grid-template-columns: 1fr;
      }

      .header-left, .header-right {
        border: none;
        border-bottom: 1px solid #000;
        flex-direction: row;
        justify-content: center;
        gap: 16px;
      }

      .form-body {
        grid-template-columns: 1fr;
      }

      .left-column {
        border-right: none;
        border-bottom: 1px solid #000;
      }

      .tin-row {
        grid-template-columns: 1fr;
      }

      .filer-tin {
        border-right: none;
        border-bottom: 1px solid #000;
      }

      .checkbox-row {
        grid-template-columns: 1fr;
      }

      .checkbox-box.box-8 {
        border-right: none;
        border-bottom: 1px solid #000;
      }

      .box-label {
        font-size: 9px;
      }

      .box-value {
        font-size: 12px;
      }
    }
  `,
})
export class Form1098TFormComponent {
  form1098 = input.required<Form1098T>();
  form1098Change = output<Partial<Form1098T>>();

  // Track which field is being edited to show raw value
  private editingField: string | null = null;
  private editingValue: string = '';

  get qualifiedExpenses(): number {
    const form = this.form1098();
    return Math.max(0, form.paymentsReceived - form.scholarshipsGrants);
  }

  get taxableScholarship(): number {
    const form = this.form1098();
    return Math.max(0, form.scholarshipsGrants - form.paymentsReceived);
  }

  formatCurrency(value: number | undefined, field?: string): string {
    if (field && this.editingField === field) {
      return this.editingValue;
    }
    if (value === undefined || value === 0) return '';
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }

  onCurrencyFocus(event: FocusEvent, field: string): void {
    const input = event.target as HTMLInputElement;
    this.editingField = field;
    const rawValue = input.value.replace(/,/g, '');
    this.editingValue = rawValue === '0' ? '' : rawValue;
    input.value = this.editingValue;
    setTimeout(() => input.select(), 0);
  }

  onCurrencyBlur(event: FocusEvent, field: string): void {
    this.editingField = null;
    this.editingValue = '';
  }

  onCurrencyKeyDown(event: KeyboardEvent): void {
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (allowedKeys.includes(event.key)) return;
    if (event.ctrlKey || event.metaKey) return;
    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  }

  onFieldChange(field: keyof Form1098T, value: unknown): void {
    this.form1098Change.emit({ [field]: value });
  }

  onCurrencyInput(event: Event, field: keyof Form1098T): void {
    const input = event.target as HTMLInputElement;
    const sanitized = input.value.replace(/[^0-9]/g, '');
    if (sanitized !== input.value) {
      input.value = sanitized;
    }
    this.editingValue = sanitized;
    const numericValue = parseInt(sanitized, 10) || 0;
    this.form1098Change.emit({ [field]: numericValue });
  }
}
