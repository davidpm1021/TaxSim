import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Form1099K } from '@core/models';

@Component({
  selector: 'app-form-1099-k-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="form-1099-k">
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
            <span class="form-number">1099-K</span>
          </div>
          <div class="form-year">2025</div>
        </div>
        <div class="header-right">
          <div class="form-title">Payment Card and<br/>Third Party<br/>Network Transactions</div>
          <div class="copy-info">
            Copy B<br/>
            For Payee
          </div>
        </div>
      </div>

      <!-- Main Form Body -->
      <div class="form-body">
        <!-- Left Column: Filer and Payee Info -->
        <div class="left-column">
          <!-- Filer's Name (Platform Name) -->
          <div class="box filer-info">
            <div class="box-label">FILER'S name, street address, city or town, state or province, country, ZIP or foreign postal code, and telephone no.</div>
            <input
              type="text"
              class="box-value"
              [ngModel]="form1099().payerName"
              (ngModelChange)="onFieldChange('payerName', $event)"
              placeholder="Platform name (e.g., Venmo, PayPal)"
            />
          </div>

          <!-- Filer's TIN and Payee's TIN -->
          <div class="tin-row">
            <div class="box filer-tin">
              <div class="box-label">FILER'S TIN</div>
              <input
                type="text"
                class="box-value tin-input"
                [ngModel]="form1099().payerTin"
                (ngModelChange)="onFieldChange('payerTin', $event)"
                placeholder="00-0000000"
                maxlength="10"
              />
            </div>
            <div class="box payee-tin">
              <div class="box-label">PAYEE'S TIN</div>
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

          <!-- Payee's Name -->
          <div class="box payee-name">
            <div class="box-label">PAYEE'S name</div>
            <input
              type="text"
              class="box-value"
              [ngModel]="form1099().recipientName"
              (ngModelChange)="onFieldChange('recipientName', $event)"
              placeholder="Your name"
            />
          </div>

          <!-- Account Number -->
          <div class="box account-number">
            <div class="box-label">Account number (see instructions)</div>
            <div class="box-value account-hint">Not required for this simulation</div>
          </div>
        </div>

        <!-- Right Column: Transaction Boxes -->
        <div class="right-column">
          <!-- Box 1a: Gross amount (MAIN BOX) -->
          <div class="box box-1a highlight">
            <div class="box-label">1a Gross amount of payment card/third party network transactions</div>
            <div class="box-value-wrapper">
              <span class="currency-symbol">$</span>
              <input
                type="text"
                inputmode="numeric"
                class="box-value currency"
                [value]="formatCurrency(form1099().grossAmount, 'grossAmount')"
                (input)="onCurrencyInput($event, 'grossAmount')"
                (focus)="onCurrencyFocus($event, 'grossAmount')"
                (blur)="onCurrencyBlur($event, 'grossAmount')"
                (keydown)="onCurrencyKeyDown($event)"
                placeholder="0"
              />
            </div>
          </div>

          <!-- Box 1b: Card not present -->
          <div class="box box-1b">
            <div class="box-label">1b Card not present transactions</div>
            <div class="box-value-wrapper">
              <span class="currency-symbol">$</span>
              <input
                type="text"
                inputmode="numeric"
                class="box-value currency"
                [value]="formatCurrency(form1099().cardNotPresentTransactions, 'cardNotPresentTransactions')"
                (input)="onCurrencyInput($event, 'cardNotPresentTransactions')"
                (focus)="onCurrencyFocus($event, 'cardNotPresentTransactions')"
                (blur)="onCurrencyBlur($event, 'cardNotPresentTransactions')"
                (keydown)="onCurrencyKeyDown($event)"
              />
            </div>
          </div>

          <!-- Box 3: Number of transactions -->
          <div class="box box-3">
            <div class="box-label">3 Number of payment transactions</div>
            <input
              type="text"
              inputmode="numeric"
              class="box-value"
              [ngModel]="form1099().numberOfTransactions || ''"
              (ngModelChange)="onFieldChange('numberOfTransactions', $event ? +$event : 0)"
              placeholder="0"
            />
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

      <!-- Important Notice Section -->
      <div class="notice-section">
        <div class="notice-header">Important Information</div>
        <div class="notice-content">
          <p><strong>$600 Threshold:</strong> Starting in 2024, payment apps must report transactions totaling $600 or more.</p>
          <p><strong>Avoid Double-Counting:</strong> If you also received a 1099-NEC for the same income (e.g., from DoorDash), don't report the same income twice.</p>
          <p><strong>Personal Payments:</strong> Personal payments (like splitting dinner) should not be included here.</p>
        </div>
      </div>

      <!-- Form Footer -->
      <div class="form-footer">
        <span class="footer-left">Form 1099-K</span>
        <span class="footer-center">Department of the Treasury - Internal Revenue Service</span>
        <span class="footer-right">(Rev. January 2024)</span>
      </div>
    </div>
  `,
  styles: `
    .form-1099-k {
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
      font-size: 10px;
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
      grid-template-columns: 1fr 250px;
      background: #fef3e2; /* Light orange tint for 1099-K */
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

    /* Filer Info Section */
    .filer-info {
      min-height: 60px;
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

    .payee-tin {
      border-bottom: none;
    }

    .tin-input {
      letter-spacing: 1px;
    }

    /* Payee sections */
    .payee-name {
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

    .box-1a.highlight {
      background: #fff3cd; /* Highlight Box 1a as the important one */
      min-height: 55px;
    }

    .box-1a .box-label {
      font-size: 8px;
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

    /* ========== NOTICE SECTION ========== */
    .notice-section {
      border-top: 2px solid #000;
      padding: 12px;
      background: #fff8e1;
    }

    .notice-header {
      font-weight: bold;
      font-size: 11px;
      margin-bottom: 8px;
      color: #e65100;
    }

    .notice-content {
      font-size: 10px;
      line-height: 1.5;
    }

    .notice-content p {
      margin: 4px 0;
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
      .form-1099-k {
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

      .box-label {
        font-size: 9px;
      }

      .box-value {
        font-size: 12px;
      }
    }
  `,
})
export class Form1099KFormComponent {
  form1099 = input.required<Form1099K>();
  form1099Change = output<Partial<Form1099K>>();

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

  onFieldChange(field: keyof Form1099K, value: unknown): void {
    this.form1099Change.emit({ [field]: value });
  }

  onCurrencyInput(event: Event, field: keyof Form1099K): void {
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
