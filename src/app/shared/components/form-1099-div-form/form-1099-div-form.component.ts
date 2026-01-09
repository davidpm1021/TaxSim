import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Form1099DIV } from '@core/models';

@Component({
  selector: 'app-form-1099-div-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="form-1099-div">
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
            <span class="form-number">1099-DIV</span>
          </div>
          <div class="form-year">2025</div>
        </div>
        <div class="header-right">
          <div class="form-title">Dividends and<br/>Distributions</div>
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
              placeholder="Brokerage or company name"
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

          <!-- Account Number -->
          <div class="box account-number">
            <div class="box-label">Account number (see instructions)</div>
            <div class="box-value account-hint">Not required for this simulation</div>
          </div>
        </div>

        <!-- Right Column: Income Boxes -->
        <div class="right-column">
          <!-- Row 1: Boxes 1a and 1b -->
          <div class="box-row">
            <!-- Box 1a: Total ordinary dividends (MAIN BOX) -->
            <div class="box box-1a">
              <div class="box-label">1a Total ordinary dividends</div>
              <div class="box-value-wrapper">
                <span class="currency-symbol">$</span>
                <input
                  type="text"
                  inputmode="numeric"
                  class="box-value currency"
                  [value]="formatCurrency(form1099().ordinaryDividends, 'ordinaryDividends')"
                  (input)="onCurrencyInput($event, 'ordinaryDividends')"
                  (focus)="onCurrencyFocus($event, 'ordinaryDividends')"
                  (blur)="onCurrencyBlur($event, 'ordinaryDividends')"
                  (keydown)="onCurrencyKeyDown($event)"
                  placeholder="0"
                />
              </div>
            </div>

            <!-- Box 1b: Qualified dividends -->
            <div class="box box-1b">
              <div class="box-label">1b Qualified dividends</div>
              <div class="box-value-wrapper">
                <span class="currency-symbol">$</span>
                <input
                  type="text"
                  inputmode="numeric"
                  class="box-value currency"
                  [value]="formatCurrency(form1099().qualifiedDividends, 'qualifiedDividends')"
                  (input)="onCurrencyInput($event, 'qualifiedDividends')"
                  (focus)="onCurrencyFocus($event, 'qualifiedDividends')"
                  (blur)="onCurrencyBlur($event, 'qualifiedDividends')"
                  (keydown)="onCurrencyKeyDown($event)"
                />
              </div>
            </div>
          </div>

          <!-- Row 2: Boxes 2a and 2b -->
          <div class="box-row">
            <!-- Box 2a: Total capital gain distributions -->
            <div class="box box-2a">
              <div class="box-label">2a Total capital gain distr.</div>
              <div class="box-value-wrapper">
                <span class="currency-symbol">$</span>
                <input
                  type="text"
                  inputmode="numeric"
                  class="box-value currency"
                  [value]="formatCurrency(form1099().capitalGainDistributions, 'capitalGainDistributions')"
                  (input)="onCurrencyInput($event, 'capitalGainDistributions')"
                  (focus)="onCurrencyFocus($event, 'capitalGainDistributions')"
                  (blur)="onCurrencyBlur($event, 'capitalGainDistributions')"
                  (keydown)="onCurrencyKeyDown($event)"
                />
              </div>
            </div>

            <!-- Box 2b: Unrecaptured Section 1250 gain -->
            <div class="box box-2b">
              <div class="box-label">2b Unrecap. Sec. 1250 gain</div>
              <div class="box-value-wrapper">
                <span class="currency-symbol">$</span>
                <input
                  type="text"
                  inputmode="numeric"
                  class="box-value currency"
                  [value]="formatCurrency(form1099().unrecapturedSection1250Gain, 'unrecapturedSection1250Gain')"
                  (input)="onCurrencyInput($event, 'unrecapturedSection1250Gain')"
                  (focus)="onCurrencyFocus($event, 'unrecapturedSection1250Gain')"
                  (blur)="onCurrencyBlur($event, 'unrecapturedSection1250Gain')"
                  (keydown)="onCurrencyKeyDown($event)"
                />
              </div>
            </div>
          </div>

          <!-- Row 3: Boxes 3 and 4 -->
          <div class="box-row">
            <!-- Box 3: Nondividend distributions -->
            <div class="box box-3">
              <div class="box-label">3 Nondividend distributions</div>
              <div class="box-value-wrapper">
                <span class="currency-symbol">$</span>
                <input
                  type="text"
                  inputmode="numeric"
                  class="box-value currency"
                  [value]="formatCurrency(form1099().nondividendDistributions, 'nondividendDistributions')"
                  (input)="onCurrencyInput($event, 'nondividendDistributions')"
                  (focus)="onCurrencyFocus($event, 'nondividendDistributions')"
                  (blur)="onCurrencyBlur($event, 'nondividendDistributions')"
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
          </div>

          <!-- Row 4: Boxes 5 and 6 -->
          <div class="box-row">
            <!-- Box 5: Section 199A dividends -->
            <div class="box box-5">
              <div class="box-label">5 Section 199A dividends</div>
              <div class="box-value-wrapper">
                <span class="currency-symbol">$</span>
                <input
                  type="text"
                  inputmode="numeric"
                  class="box-value currency"
                  [value]="formatCurrency(form1099().section199ADividends, 'section199ADividends')"
                  (input)="onCurrencyInput($event, 'section199ADividends')"
                  (focus)="onCurrencyFocus($event, 'section199ADividends')"
                  (blur)="onCurrencyBlur($event, 'section199ADividends')"
                  (keydown)="onCurrencyKeyDown($event)"
                />
              </div>
            </div>

            <!-- Box 6: Investment expenses -->
            <div class="box box-6">
              <div class="box-label">6 Investment expenses</div>
              <div class="box-value-wrapper">
                <span class="currency-symbol">$</span>
                <input
                  type="text"
                  inputmode="numeric"
                  class="box-value currency"
                  [value]="formatCurrency(form1099().investmentExpenses, 'investmentExpenses')"
                  (input)="onCurrencyInput($event, 'investmentExpenses')"
                  (focus)="onCurrencyFocus($event, 'investmentExpenses')"
                  (blur)="onCurrencyBlur($event, 'investmentExpenses')"
                  (keydown)="onCurrencyKeyDown($event)"
                />
              </div>
            </div>
          </div>

          <!-- Row 5: Box 7 (Foreign tax paid) -->
          <div class="box-row single">
            <!-- Box 7: Foreign tax paid -->
            <div class="box box-7">
              <div class="box-label">7 Foreign tax paid</div>
              <div class="box-value-wrapper">
                <span class="currency-symbol">$</span>
                <input
                  type="text"
                  inputmode="numeric"
                  class="box-value currency"
                  [value]="formatCurrency(form1099().foreignTaxPaid, 'foreignTaxPaid')"
                  (input)="onCurrencyInput($event, 'foreignTaxPaid')"
                  (focus)="onCurrencyFocus($event, 'foreignTaxPaid')"
                  (blur)="onCurrencyBlur($event, 'foreignTaxPaid')"
                  (keydown)="onCurrencyKeyDown($event)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Footer -->
      <div class="form-footer">
        <span class="footer-left">Form 1099-DIV</span>
        <span class="footer-center">Department of the Treasury - Internal Revenue Service</span>
        <span class="footer-right">(Rev. January 2024)</span>
      </div>
    </div>
  `,
  styles: `
    .form-1099-div {
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
      grid-template-columns: 1fr 280px;
      background: #f0fdf4; /* Light green tint for 1099-DIV */
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

    /* Right Column Boxes - Paired layout */
    .box-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      border-bottom: 1px solid #000;
    }

    .box-row:last-child {
      border-bottom: none;
    }

    .box-row.single {
      grid-template-columns: 1fr;
    }

    .box-row .box {
      border-bottom: none;
      min-height: 45px;
    }

    .box-row .box:first-child {
      border-right: 1px solid #000;
    }

    .box-1a {
      background: #fff3cd; /* Highlight Box 1a as the main one */
    }

    .box-1b {
      background: #e8f5e9; /* Lighter green for qualified dividends - lower tax rate */
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
      .form-1099-div {
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

      .box-row {
        grid-template-columns: 1fr;
      }

      .box-row .box:first-child {
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
export class Form1099DIVFormComponent {
  form1099 = input.required<Form1099DIV>();
  form1099Change = output<Partial<Form1099DIV>>();

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

  onFieldChange(field: keyof Form1099DIV, value: unknown): void {
    this.form1099Change.emit({ [field]: value });
  }

  onCurrencyInput(event: Event, field: keyof Form1099DIV): void {
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
