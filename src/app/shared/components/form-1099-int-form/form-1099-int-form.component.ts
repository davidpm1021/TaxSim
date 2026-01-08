import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Form1099INT } from '@core/models';

@Component({
  selector: 'app-form-1099-int-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="form-1099-int">
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
            <span class="form-number">1099-INT</span>
          </div>
          <div class="form-year">2025</div>
        </div>
        <div class="header-right">
          <div class="form-title">Interest<br/>Income</div>
          <div class="copy-info">
            Copy B<br/>
            For Recipient
          </div>
        </div>
      </div>

      <!-- Main Form Body -->
      <div class="form-body">
        <!-- Left Column: Payer and Recipient Info -->
        <div class="left-column">
          <!-- Payer's Name and Address -->
          <div class="box payer-info">
            <div class="box-label">PAYER'S name, street address, city or town, state or province, country, ZIP or foreign postal code, and telephone no.</div>
            <input
              type="text"
              class="box-value"
              [ngModel]="form1099().payerName"
              (ngModelChange)="onFieldChange('payerName', $event)"
              placeholder="Bank or institution name"
            />
          </div>

          <!-- Payer's TIN and Recipient's TIN -->
          <div class="tin-row">
            <div class="box payer-tin">
              <div class="box-label">PAYER'S TIN</div>
              <input
                type="text"
                class="box-value tin-input"
                [ngModel]="form1099().payerTin"
                (ngModelChange)="onFieldChange('payerTin', $event)"
                placeholder="00-0000000"
                maxlength="10"
              />
            </div>
            <div class="box recipient-tin">
              <div class="box-label">RECIPIENT'S TIN</div>
              <input
                type="text"
                class="box-value tin-input"
                [ngModel]="form1099().recipientTin"
                (ngModelChange)="onFieldChange('recipientTin', $event)"
                placeholder="000-00-0000"
                maxlength="11"
              />
            </div>
          </div>

          <!-- Recipient's Name -->
          <div class="box recipient-name">
            <div class="box-label">RECIPIENT'S name</div>
            <input
              type="text"
              class="box-value"
              [ngModel]="form1099().recipientName"
              (ngModelChange)="onFieldChange('recipientName', $event)"
              placeholder="Your name"
            />
          </div>

          <!-- Account Number (optional) -->
          <div class="box account-number">
            <div class="box-label">Account number (see instructions)</div>
            <div class="box-value account-hint">Not required for this simulation</div>
          </div>
        </div>

        <!-- Right Column: Income Boxes -->
        <div class="right-column">
          <!-- Box 1: Interest income (MAIN BOX) -->
          <div class="box box-1">
            <div class="box-label">1 Interest income</div>
            <div class="box-value-wrapper">
              <span class="currency-symbol">$</span>
              <input
                type="text"
                inputmode="numeric"
                class="box-value currency"
                [value]="formatCurrency(form1099().interestIncome, 'interestIncome')"
                (input)="onCurrencyInput($event, 'interestIncome')"
                (focus)="onCurrencyFocus($event, 'interestIncome')"
                (blur)="onCurrencyBlur($event, 'interestIncome')"
                (keydown)="onCurrencyKeyDown($event)"
                placeholder="0"
              />
            </div>
          </div>

          <!-- Box 2: Early withdrawal penalty -->
          <div class="box box-2">
            <div class="box-label">2 Early withdrawal penalty</div>
            <div class="box-value-wrapper">
              <span class="currency-symbol">$</span>
              <input
                type="text"
                inputmode="numeric"
                class="box-value currency"
                [value]="formatCurrency(form1099().earlyWithdrawalPenalty, 'earlyWithdrawalPenalty')"
                (input)="onCurrencyInput($event, 'earlyWithdrawalPenalty')"
                (focus)="onCurrencyFocus($event, 'earlyWithdrawalPenalty')"
                (blur)="onCurrencyBlur($event, 'earlyWithdrawalPenalty')"
                (keydown)="onCurrencyKeyDown($event)"
              />
            </div>
          </div>

          <!-- Box 3: Interest on U.S. Savings Bonds -->
          <div class="box box-3">
            <div class="box-label">3 Interest on U.S. Savings Bonds and Treasury obligations</div>
            <div class="box-value-wrapper">
              <span class="currency-symbol">$</span>
              <input
                type="text"
                inputmode="numeric"
                class="box-value currency"
                [value]="formatCurrency(form1099().usSavingsBondInterest, 'usSavingsBondInterest')"
                (input)="onCurrencyInput($event, 'usSavingsBondInterest')"
                (focus)="onCurrencyFocus($event, 'usSavingsBondInterest')"
                (blur)="onCurrencyBlur($event, 'usSavingsBondInterest')"
                (keydown)="onCurrencyKeyDown($event)"
              />
            </div>
          </div>

          <!-- Box 4: Federal income tax withheld -->
          <div class="box box-4">
            <div class="box-label">4 Federal income tax withheld</div>
            <div class="box-value-wrapper">
              <span class="currency-symbol">$</span>
              <input
                type="text"
                inputmode="numeric"
                class="box-value currency"
                [value]="formatCurrency(form1099().federalWithheld, 'federalWithheld')"
                (input)="onCurrencyInput($event, 'federalWithheld')"
                (focus)="onCurrencyFocus($event, 'federalWithheld')"
                (blur)="onCurrencyBlur($event, 'federalWithheld')"
                (keydown)="onCurrencyKeyDown($event)"
              />
            </div>
          </div>

          <!-- Box 8: Tax-exempt interest -->
          <div class="box box-8">
            <div class="box-label">8 Tax-exempt interest</div>
            <div class="box-value-wrapper">
              <span class="currency-symbol">$</span>
              <input
                type="text"
                inputmode="numeric"
                class="box-value currency"
                [value]="formatCurrency(form1099().taxExemptInterest, 'taxExemptInterest')"
                (input)="onCurrencyInput($event, 'taxExemptInterest')"
                (focus)="onCurrencyFocus($event, 'taxExemptInterest')"
                (blur)="onCurrencyBlur($event, 'taxExemptInterest')"
                (keydown)="onCurrencyKeyDown($event)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Form Footer -->
      <div class="form-footer">
        <span class="footer-left">Form 1099-INT</span>
        <span class="footer-center">Department of the Treasury - Internal Revenue Service</span>
        <span class="footer-right">(Rev. January 2024)</span>
      </div>
    </div>
  `,
  styles: `
    .form-1099-int {
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
      background: #e8f4fc; /* Light blue tint for 1099-INT */
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

    /* Payer Info Section */
    .payer-info {
      min-height: 60px;
    }

    /* TIN Row */
    .tin-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      border-bottom: 1px solid #000;
    }

    .payer-tin {
      border-right: 1px solid #000;
      border-bottom: none;
    }

    .recipient-tin {
      border-bottom: none;
    }

    .tin-input {
      letter-spacing: 1px;
    }

    /* Recipient sections */
    .recipient-name {
      min-height: 40px;
    }

    .account-number {
      border-bottom: none;
    }

    .account-hint {
      color: #999;
      font-style: italic;
      font-size: 11px;
    }

    /* Right Column Boxes */
    .right-column .box {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .box-1 {
      background: #fff3cd; /* Highlight Box 1 as the important one */
      min-height: 50px;
    }

    .box-1 .box-label {
      font-size: 10px;
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
      .form-1099-int {
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

      .payer-tin {
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
export class Form1099INTFormComponent {
  form1099 = input.required<Form1099INT>();
  form1099Change = output<Partial<Form1099INT>>();

  // Track which field is being edited to show raw value
  private editingField: string | null = null;
  private editingValue: string = '';

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

  onFieldChange(field: keyof Form1099INT, value: unknown): void {
    this.form1099Change.emit({ [field]: value });
  }

  onCurrencyInput(event: Event, field: keyof Form1099INT): void {
    const input = event.target as HTMLInputElement;
    const sanitized = input.value.replace(/[^0-9]/g, '');
    if (sanitized !== input.value) {
      input.value = sanitized;
    }
    this.editingValue = sanitized;
    const numericValue = parseInt(sanitized, 10) || 0;
    this.form1099Change.emit({ [field]: numericValue });
  }
}
