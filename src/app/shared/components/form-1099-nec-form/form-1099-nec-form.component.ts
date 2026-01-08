import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Form1099NEC } from '@core/models';

@Component({
  selector: 'app-form-1099-nec-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="form-1099-nec">
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
            <span class="form-number">1099-NEC</span>
          </div>
          <div class="form-year">2025</div>
        </div>
        <div class="header-right">
          <div class="form-title">Nonemployee<br/>Compensation</div>
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
              placeholder="Payer name"
            />
            <input
              type="text"
              class="box-value"
              [ngModel]="form1099().payerAddress"
              (ngModelChange)="onFieldChange('payerAddress', $event)"
              placeholder="Street address"
            />
            <input
              type="text"
              class="box-value"
              [ngModel]="form1099().payerCityStateZip"
              (ngModelChange)="onFieldChange('payerCityStateZip', $event)"
              placeholder="City, State ZIP"
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
              placeholder="Recipient name"
            />
          </div>

          <!-- Recipient's Address -->
          <div class="box recipient-address">
            <div class="box-label">Street address (including apt. no.)</div>
            <input
              type="text"
              class="box-value"
              [ngModel]="form1099().recipientAddress"
              (ngModelChange)="onFieldChange('recipientAddress', $event)"
              placeholder="Street address"
            />
          </div>

          <!-- Recipient's City, State, ZIP -->
          <div class="box recipient-city">
            <div class="box-label">City or town, state or province, country, and ZIP or foreign postal code</div>
            <input
              type="text"
              class="box-value"
              [ngModel]="form1099().recipientCityStateZip"
              (ngModelChange)="onFieldChange('recipientCityStateZip', $event)"
              placeholder="City, State ZIP"
            />
          </div>

          <!-- Account Number -->
          <div class="box account-number">
            <div class="box-label">Account number (see instructions)</div>
            <input
              type="text"
              class="box-value"
              [ngModel]="form1099().accountNumber"
              (ngModelChange)="onFieldChange('accountNumber', $event)"
            />
          </div>
        </div>

        <!-- Right Column: Box 1-4 -->
        <div class="right-column">
          <!-- Box 1: Nonemployee compensation -->
          <div class="box box-1">
            <div class="box-label">1 Nonemployee compensation</div>
            <div class="box-value-wrapper">
              <span class="currency-symbol">$</span>
              <input
                type="text"
                inputmode="numeric"
                class="box-value currency"
                [value]="formatCurrency(form1099().nonemployeeCompensation, 'nonemployeeCompensation')"
                (input)="onCurrencyInput($event, 'nonemployeeCompensation')"
                (focus)="onCurrencyFocus($event, 'nonemployeeCompensation')"
                (blur)="onCurrencyBlur($event, 'nonemployeeCompensation')"
                (keydown)="onCurrencyKeyDown($event)"
              />
            </div>
          </div>

          <!-- Box 2: Payer made direct sales -->
          <div class="box box-2">
            <div class="box-label-inline">
              <input
                type="checkbox"
                [ngModel]="form1099().directSales"
                (ngModelChange)="onFieldChange('directSales', $event)"
              />
              <span>2 Payer made direct sales totaling $5,000 or more of consumer products to recipient for resale</span>
            </div>
          </div>

          <!-- Box 3: Reserved (empty) -->
          <div class="box box-3">
            <div class="box-label">3</div>
            <div class="box-value reserved"></div>
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
        </div>
      </div>

      <!-- State Section -->
      <div class="state-section">
        <div class="state-row">
          <div class="box box-5">
            <div class="box-label">5 State tax withheld</div>
            <div class="box-value-wrapper">
              <span class="currency-symbol">$</span>
              <input
                type="text"
                inputmode="numeric"
                class="box-value currency"
                [value]="formatCurrency(form1099().stateIncome, 'stateIncome')"
                (input)="onCurrencyInput($event, 'stateIncome')"
                (focus)="onCurrencyFocus($event, 'stateIncome')"
                (blur)="onCurrencyBlur($event, 'stateIncome')"
                (keydown)="onCurrencyKeyDown($event)"
              />
            </div>
          </div>
          <div class="box box-6">
            <div class="box-label">6 State/Payer's state no.</div>
            <div class="state-input-group">
              <input
                type="text"
                class="box-value state-code"
                [ngModel]="form1099().state"
                (ngModelChange)="onFieldChange('state', $event)"
                placeholder="ST"
                maxlength="2"
              />
              <input
                type="text"
                class="box-value state-id"
                [ngModel]="form1099().statePayerId"
                (ngModelChange)="onFieldChange('statePayerId', $event)"
                placeholder="State payer ID"
              />
            </div>
          </div>
          <div class="box box-7">
            <div class="box-label">7 State income</div>
            <div class="box-value-wrapper">
              <span class="currency-symbol">$</span>
              <input
                type="text"
                inputmode="numeric"
                class="box-value currency"
                [value]="formatCurrency(form1099().stateIncome, 'stateIncome')"
                (input)="onCurrencyInput($event, 'stateIncome')"
                (focus)="onCurrencyFocus($event, 'stateIncome')"
                (blur)="onCurrencyBlur($event, 'stateIncome')"
                (keydown)="onCurrencyKeyDown($event)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Form Footer -->
      <div class="form-footer">
        <span class="footer-left">Form 1099-NEC</span>
        <span class="footer-center">Department of the Treasury - Internal Revenue Service</span>
        <span class="footer-right">(Rev. January 2024)</span>
      </div>
    </div>
  `,
  styles: `
    .form-1099-nec {
      font-family: Arial, Helvetica, sans-serif;
      max-width: 750px;
      margin: 0 auto;
      border: 2px solid #000;
      background: #fff;
    }

    /* ========== HEADER SECTION ========== */
    .form-header {
      display: grid;
      grid-template-columns: 140px 1fr 150px;
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
      font-size: 24px;
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
      background: #d4edda; /* Light green tint like Copy B */
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

    .box-label-inline {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      font-size: 8px;
      line-height: 1.3;

      input[type="checkbox"] {
        margin-top: 2px;
        width: 12px;
        height: 12px;
      }
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
      min-height: 80px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .payer-info .box-value {
      flex: none;
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
    .recipient-name,
    .recipient-address,
    .recipient-city {
      min-height: 36px;
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

    .box-1 {
      background: #fff3cd; /* Highlight Box 1 as the important one */
      min-height: 60px;
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
      font-size: 16px;
      flex: 1;
    }

    .box-2 {
      min-height: 50px;
      padding: 6px;
    }

    .box-3 {
      min-height: 30px;
    }

    .reserved {
      color: #999;
      font-style: italic;
      font-size: 10px;
    }

    .box-4 {
      min-height: 50px;
    }

    /* ========== STATE SECTION ========== */
    .state-section {
      border-top: 1px solid #000;
      background: #d4edda;
    }

    .state-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
    }

    .state-row .box {
      border-right: 1px solid #000;
      border-bottom: none;
    }

    .state-row .box:last-child {
      border-right: none;
    }

    .box-5, .box-6, .box-7 {
      min-height: 50px;
    }

    .state-input-group {
      display: flex;
      gap: 8px;
    }

    .state-code {
      width: 35px !important;
      flex: none !important;
      text-transform: uppercase;
    }

    .state-id {
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
      .form-1099-nec {
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

      .state-row {
        grid-template-columns: 1fr;
      }

      .state-row .box {
        border-right: none;
        border-bottom: 1px solid #000;
      }

      .state-row .box:last-child {
        border-bottom: none;
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
export class Form1099NECFormComponent {
  form1099 = input.required<Form1099NEC>();
  form1099Change = output<Partial<Form1099NEC>>();

  // Track which field is being edited to show raw value
  private editingField: string | null = null;
  private editingValue: string = '';

  formatCurrency(value: number | undefined, field?: string): string {
    // If this field is being edited, show the raw input value
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
    // Convert formatted value to raw number for editing
    const rawValue = input.value.replace(/,/g, '');
    this.editingValue = rawValue === '0' ? '' : rawValue;
    input.value = this.editingValue;
    // Select all for easy replacement
    setTimeout(() => input.select(), 0);
  }

  onCurrencyBlur(event: FocusEvent, field: string): void {
    this.editingField = null;
    this.editingValue = '';
  }

  onCurrencyKeyDown(event: KeyboardEvent): void {
    // Allow: backspace, delete, tab, escape, enter, arrows
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (allowedKeys.includes(event.key)) {
      return;
    }
    // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if (event.ctrlKey || event.metaKey) {
      return;
    }
    // Block non-numeric keys (only digits allowed)
    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  }

  onFieldChange(field: keyof Form1099NEC, value: unknown): void {
    this.form1099Change.emit({ [field]: value });
  }

  onCurrencyInput(event: Event, field: keyof Form1099NEC): void {
    const input = event.target as HTMLInputElement;
    // Remove any non-numeric characters
    const sanitized = input.value.replace(/[^0-9]/g, '');
    if (sanitized !== input.value) {
      input.value = sanitized;
    }
    this.editingValue = sanitized;
    const numericValue = parseInt(sanitized, 10) || 0;
    this.form1099Change.emit({ [field]: numericValue });
  }
}
