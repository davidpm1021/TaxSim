import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { W2, Box12Entry } from '@core/models';

@Component({
  selector: 'app-w2-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w2-form">
      <!-- Form Header -->
      <div class="w2-header">
        <div class="header-left">
          <div class="void-box">
            <span class="void-text">VOID</span>
            <input type="checkbox" class="void-checkbox" disabled />
          </div>
          <div class="corrected-box">
            <input type="checkbox" class="corrected-checkbox" disabled />
            <span class="corrected-text">CORRECTED</span>
          </div>
        </div>
        <div class="header-center">
          <div class="form-info">
            <span class="form-label">Form</span>
            <span class="form-number">W-2</span>
          </div>
          <div class="form-title">Wage and Tax Statement</div>
          <div class="form-year">2025</div>
        </div>
        <div class="header-right">
          <div class="copy-info">
            Copy B—To Be Filed With Employee's
            <br />
            <strong>FEDERAL</strong> Tax Return.
          </div>
          <div class="copy-note">
            This information is being furnished to the
            <br />
            Internal Revenue Service.
          </div>
        </div>
      </div>

      <!-- Main Form Body -->
      <div class="w2-body">
        <!-- Row 1: Box a | Box 1 | Box 2 -->
        <div class="form-row row-1">
          <div class="box box-a">
            <div class="box-label">a Employee's social security number</div>
            <input
              type="text"
              class="box-value ssn-input"
              [ngModel]="w2().employeeSsn"
              (ngModelChange)="onFieldChange('employeeSsn', $event)"
              placeholder="000-00-0000"
              maxlength="11"
            />
          </div>
          <div class="box box-1">
            <div class="box-label">1 Wages, tips, other compensation</div>
            <input
              type="text"
              class="box-value currency"
              [ngModel]="formatCurrency(w2().wagesTips)"
              (ngModelChange)="onCurrencyChange('wagesTips', $event)"
              (focus)="onCurrencyFocus($event)"
            />
          </div>
          <div class="box box-2">
            <div class="box-label">2 Federal income tax withheld</div>
            <input
              type="text"
              class="box-value currency"
              [ngModel]="formatCurrency(w2().federalWithheld)"
              (ngModelChange)="onCurrencyChange('federalWithheld', $event)"
              (focus)="onCurrencyFocus($event)"
            />
          </div>
        </div>

        <!-- Row 2: Box b | Box 3 | Box 4 -->
        <div class="form-row row-2">
          <div class="box box-b">
            <div class="box-label">b Employer identification number (EIN)</div>
            <input
              type="text"
              class="box-value ein-input"
              [ngModel]="w2().employerEin"
              (ngModelChange)="onFieldChange('employerEin', $event)"
              placeholder="00-0000000"
              maxlength="10"
            />
          </div>
          <div class="box box-3">
            <div class="box-label">3 Social security wages</div>
            <input
              type="text"
              class="box-value currency"
              [ngModel]="formatCurrency(w2().socialSecurityWages)"
              (ngModelChange)="onCurrencyChange('socialSecurityWages', $event)"
              (focus)="onCurrencyFocus($event)"
            />
          </div>
          <div class="box box-4">
            <div class="box-label">4 Social security tax withheld</div>
            <input
              type="text"
              class="box-value currency"
              [ngModel]="formatCurrency(w2().socialSecurityWithheld)"
              (ngModelChange)="onCurrencyChange('socialSecurityWithheld', $event)"
              (focus)="onCurrencyFocus($event)"
            />
          </div>
        </div>

        <!-- Row 3: Box c (spans 2 rows) | Box 5 | Box 6 -->
        <div class="form-row row-3">
          <div class="box box-c">
            <div class="box-label">c Employer's name, address, and ZIP code</div>
            <input
              type="text"
              class="box-value"
              [ngModel]="w2().employerName"
              (ngModelChange)="onFieldChange('employerName', $event)"
              placeholder="Employer name"
            />
            <input
              type="text"
              class="box-value"
              [ngModel]="w2().employerAddress"
              (ngModelChange)="onFieldChange('employerAddress', $event)"
              placeholder="Street address"
            />
            <input
              type="text"
              class="box-value"
              [ngModel]="w2().employerCityStateZip"
              (ngModelChange)="onFieldChange('employerCityStateZip', $event)"
              placeholder="City, State ZIP"
            />
          </div>
          <div class="box-group-right">
            <div class="box box-5">
              <div class="box-label">5 Medicare wages and tips</div>
              <input
                type="text"
                class="box-value currency"
                [ngModel]="formatCurrency(w2().medicareWages)"
                (ngModelChange)="onCurrencyChange('medicareWages', $event)"
                (focus)="onCurrencyFocus($event)"
              />
            </div>
            <div class="box box-6">
              <div class="box-label">6 Medicare tax withheld</div>
              <input
                type="text"
                class="box-value currency"
                [ngModel]="formatCurrency(w2().medicareWithheld)"
                (ngModelChange)="onCurrencyChange('medicareWithheld', $event)"
                (focus)="onCurrencyFocus($event)"
              />
            </div>
            <div class="box box-7">
              <div class="box-label">7 Social security tips</div>
              <input
                type="text"
                class="box-value currency"
                [ngModel]="formatCurrency(w2().socialSecurityTips)"
                (ngModelChange)="onCurrencyChange('socialSecurityTips', $event)"
                (focus)="onCurrencyFocus($event)"
              />
            </div>
            <div class="box box-8">
              <div class="box-label">8 Allocated tips</div>
              <input
                type="text"
                class="box-value currency"
                [ngModel]="formatCurrency(w2().allocatedTips)"
                (ngModelChange)="onCurrencyChange('allocatedTips', $event)"
                (focus)="onCurrencyFocus($event)"
              />
            </div>
          </div>
        </div>

        <!-- Row 4: Box d | Box 9 | Box 10 -->
        <div class="form-row row-4">
          <div class="box box-d">
            <div class="box-label">d Control number</div>
            <input
              type="text"
              class="box-value"
              [ngModel]="w2().controlNumber"
              (ngModelChange)="onFieldChange('controlNumber', $event)"
            />
          </div>
          <div class="box box-9">
            <div class="box-label">9</div>
            <div class="box-value"></div>
          </div>
          <div class="box box-10">
            <div class="box-label">10 Dependent care benefits</div>
            <input
              type="text"
              class="box-value currency"
              [ngModel]="formatCurrency(w2().dependentCareBenefits)"
              (ngModelChange)="onCurrencyChange('dependentCareBenefits', $event)"
              (focus)="onCurrencyFocus($event)"
            />
          </div>
        </div>

        <!-- Row 5: Box e | Box 11 | (spans to box 13) -->
        <div class="form-row row-5">
          <div class="box box-e">
            <div class="box-label">e Employee's first name and initial&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Last name&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Suff.</div>
            <div class="name-inputs">
              <input
                type="text"
                class="box-value name-first"
                [ngModel]="w2().employeeFirstName"
                (ngModelChange)="onFieldChange('employeeFirstName', $event)"
                placeholder="First name"
              />
              <input
                type="text"
                class="box-value name-last"
                [ngModel]="w2().employeeLastName"
                (ngModelChange)="onFieldChange('employeeLastName', $event)"
                placeholder="Last name"
              />
              <input
                type="text"
                class="box-value name-suffix"
                [ngModel]="w2().employeeSuffix"
                (ngModelChange)="onFieldChange('employeeSuffix', $event)"
                maxlength="4"
              />
            </div>
          </div>
          <div class="box box-11">
            <div class="box-label">11 Nonqualified plans</div>
            <input
              type="text"
              class="box-value currency"
              [ngModel]="formatCurrency(w2().nonqualifiedPlans)"
              (ngModelChange)="onCurrencyChange('nonqualifiedPlans', $event)"
              (focus)="onCurrencyFocus($event)"
            />
          </div>
        </div>

        <!-- Row 6: Box f | Box 12 | Box 13 -->
        <div class="form-row row-6">
          <div class="box box-f">
            <div class="box-label">f Employee's address and ZIP code</div>
            <input
              type="text"
              class="box-value"
              [ngModel]="w2().employeeAddress"
              (ngModelChange)="onFieldChange('employeeAddress', $event)"
              placeholder="Street address"
            />
            <input
              type="text"
              class="box-value"
              [ngModel]="w2().employeeCityStateZip"
              (ngModelChange)="onFieldChange('employeeCityStateZip', $event)"
              placeholder="City, State ZIP"
            />
          </div>
          <div class="box box-12">
            <div class="box-label">12a See instructions for box 12</div>
            <div class="box12-grid">
              @for (entry of getBox12Entries(); track $index; let i = $index) {
                <div class="box12-row">
                  <span class="box12-letter">{{ i === 0 ? '' : '12' + getBox12Letter(i) }}</span>
                  <div class="box12-code-section">
                    <span class="code-label">C<br/>o<br/>d<br/>e</span>
                    <input
                      type="text"
                      class="box12-code"
                      [ngModel]="entry.code"
                      (ngModelChange)="onBox12CodeChange(i, $event)"
                      maxlength="2"
                    />
                  </div>
                  <input
                    type="text"
                    class="box12-amount currency"
                    [ngModel]="formatCurrency(entry.amount)"
                    (ngModelChange)="onBox12AmountChange(i, $event)"
                    (focus)="onCurrencyFocus($event)"
                  />
                </div>
              }
            </div>
          </div>
          <div class="box box-13">
            <div class="box-label">13</div>
            <div class="checkbox-grid">
              <label class="checkbox-item">
                <span class="checkbox-text">Statutory<br/>employee</span>
                <input
                  type="checkbox"
                  [ngModel]="w2().statutoryEmployee"
                  (ngModelChange)="onFieldChange('statutoryEmployee', $event)"
                />
              </label>
              <label class="checkbox-item">
                <span class="checkbox-text">Retirement<br/>plan</span>
                <input
                  type="checkbox"
                  [ngModel]="w2().retirementPlan"
                  (ngModelChange)="onFieldChange('retirementPlan', $event)"
                />
              </label>
              <label class="checkbox-item third-party">
                <span class="checkbox-text">Third-party<br/>sick pay</span>
                <input
                  type="checkbox"
                  [ngModel]="w2().thirdPartySickPay"
                  (ngModelChange)="onFieldChange('thirdPartySickPay', $event)"
                />
              </label>
            </div>
          </div>
        </div>

        <!-- Row 7: Box 14 -->
        <div class="form-row row-7">
          <div class="box box-14">
            <div class="box-label">14 Other</div>
            <textarea
              class="box-value box14-textarea"
              [ngModel]="w2().box14Other"
              (ngModelChange)="onFieldChange('box14Other', $event)"
              rows="2"
            ></textarea>
          </div>
        </div>

        <!-- Row 8: State Section Row 1 -->
        <div class="form-row row-8">
          <div class="box box-15">
            <div class="box-label">15 State</div>
            <input
              type="text"
              class="box-value state-code"
              [ngModel]="w2().state"
              (ngModelChange)="onFieldChange('state', $event)"
              maxlength="2"
              placeholder="ST"
            />
          </div>
          <div class="box box-15-ein">
            <div class="box-label">Employer's state ID number</div>
            <input
              type="text"
              class="box-value"
              [ngModel]="w2().employerStateId"
              (ngModelChange)="onFieldChange('employerStateId', $event)"
            />
          </div>
          <div class="box box-16">
            <div class="box-label">16 State wages, tips, etc.</div>
            <input
              type="text"
              class="box-value currency"
              [ngModel]="formatCurrency(w2().stateWages)"
              (ngModelChange)="onCurrencyChange('stateWages', $event)"
              (focus)="onCurrencyFocus($event)"
            />
          </div>
          <div class="box box-17">
            <div class="box-label">17 State income tax</div>
            <input
              type="text"
              class="box-value currency"
              [ngModel]="formatCurrency(w2().stateWithheld)"
              (ngModelChange)="onCurrencyChange('stateWithheld', $event)"
              (focus)="onCurrencyFocus($event)"
            />
          </div>
        </div>

        <!-- Row 9: State Section Row 2 -->
        <div class="form-row row-9">
          <div class="box box-15">
            <input
              type="text"
              class="box-value state-code"
              [ngModel]="w2().state2 || ''"
              (ngModelChange)="onFieldChange('state2', $event)"
              maxlength="2"
              placeholder="ST"
            />
          </div>
          <div class="box box-15-ein">
            <input
              type="text"
              class="box-value"
              [ngModel]="w2().employerStateId2 || ''"
              (ngModelChange)="onFieldChange('employerStateId2', $event)"
            />
          </div>
          <div class="box box-16">
            <input
              type="text"
              class="box-value currency"
              [ngModel]="formatCurrency(w2().stateWages2 || 0)"
              (ngModelChange)="onCurrencyChange('stateWages2', $event)"
              (focus)="onCurrencyFocus($event)"
            />
          </div>
          <div class="box box-17">
            <input
              type="text"
              class="box-value currency"
              [ngModel]="formatCurrency(w2().stateWithheld2 || 0)"
              (ngModelChange)="onCurrencyChange('stateWithheld2', $event)"
              (focus)="onCurrencyFocus($event)"
            />
          </div>
        </div>

        <!-- Row 10: Local Section -->
        <div class="form-row row-10">
          <div class="box box-18">
            <div class="box-label">18 Local wages, tips, etc.</div>
            <input
              type="text"
              class="box-value currency"
              [ngModel]="formatCurrency(w2().localWages)"
              (ngModelChange)="onCurrencyChange('localWages', $event)"
              (focus)="onCurrencyFocus($event)"
            />
          </div>
          <div class="box box-19">
            <div class="box-label">19 Local income tax</div>
            <input
              type="text"
              class="box-value currency"
              [ngModel]="formatCurrency(w2().localWithheld)"
              (ngModelChange)="onCurrencyChange('localWithheld', $event)"
              (focus)="onCurrencyFocus($event)"
            />
          </div>
          <div class="box box-20">
            <div class="box-label">20 Locality name</div>
            <input
              type="text"
              class="box-value"
              [ngModel]="w2().localityName"
              (ngModelChange)="onFieldChange('localityName', $event)"
            />
          </div>
        </div>
      </div>

      <!-- Form Footer -->
      <div class="w2-footer">
        <span class="footer-left">Form W-2</span>
        <span class="footer-center">Department of the Treasury—Internal Revenue Service</span>
        <span class="footer-right">Wage and Tax Statement 2025</span>
      </div>
    </div>
  `,
  styles: `
    .w2-form {
      font-family: Arial, Helvetica, sans-serif;
      max-width: 850px;
      margin: 0 auto;
      border: 2px solid #000;
      background: #fff;
    }

    /* ========== HEADER SECTION ========== */
    .w2-header {
      display: grid;
      grid-template-columns: 150px 1fr 200px;
      border-bottom: 2px solid #000;
      min-height: 70px;
    }

    .header-left {
      border-right: 1px solid #000;
      padding: 8px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 4px;
    }

    .void-box, .corrected-box {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
    }

    .void-text {
      font-weight: bold;
      letter-spacing: 2px;
    }

    .void-checkbox, .corrected-checkbox {
      width: 14px;
      height: 14px;
    }

    .header-center {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 8px;
    }

    .form-info {
      display: flex;
      align-items: baseline;
      gap: 8px;
    }

    .form-label {
      font-size: 12px;
    }

    .form-number {
      font-size: 32px;
      font-weight: bold;
    }

    .form-title {
      font-size: 14px;
      font-weight: bold;
      margin-top: 2px;
    }

    .form-year {
      font-size: 18px;
      font-weight: bold;
    }

    .header-right {
      border-left: 1px solid #000;
      padding: 8px;
      font-size: 10px;
      line-height: 1.3;
    }

    .copy-info {
      margin-bottom: 6px;
    }

    .copy-note {
      color: #333;
    }

    /* ========== FORM BODY ========== */
    .w2-body {
      background: #e8f5e9; /* Light green tint like Copy B */
    }

    .form-row {
      display: grid;
      border-bottom: 1px solid #000;
    }

    .box {
      border-right: 1px solid #000;
      padding: 4px 6px;
      min-height: 44px;
      display: flex;
      flex-direction: column;
    }

    .box:last-child {
      border-right: none;
    }

    .box-label {
      font-size: 10px;
      font-weight: bold;
      color: #000;
      margin-bottom: 4px;
      line-height: 1.2;
    }

    .box-value {
      flex: 1;
      border: none;
      background: transparent;
      font-family: 'Courier New', Courier, monospace;
      font-size: 14px;
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
      font-size: 12px;
    }

    .currency {
      text-align: right;
    }

    .ssn-input, .ein-input {
      letter-spacing: 1px;
    }

    .state-code {
      text-transform: uppercase;
      width: 40px !important;
      flex: none !important;
    }

    /* ========== ROW LAYOUTS ========== */

    /* Row 1: a | 1 | 2 */
    .row-1 {
      grid-template-columns: 240px 1fr 180px;
    }

    /* Row 2: b | 3 | 4 */
    .row-2 {
      grid-template-columns: 240px 1fr 180px;
    }

    /* Row 3: c (tall) | 5,6,7,8 stacked */
    .row-3 {
      grid-template-columns: 240px 1fr;
    }

    .box-c {
      min-height: 100px;
    }

    .box-c .box-value {
      margin-bottom: 4px;
    }

    .box-group-right {
      display: grid;
      grid-template-columns: 1fr 180px;
      grid-template-rows: 1fr 1fr;
    }

    .box-group-right .box-5 {
      grid-column: 1;
      grid-row: 1;
    }

    .box-group-right .box-6 {
      grid-column: 2;
      grid-row: 1;
      border-right: none;
    }

    .box-group-right .box-7 {
      grid-column: 1;
      grid-row: 2;
      border-top: 1px solid #000;
    }

    .box-group-right .box-8 {
      grid-column: 2;
      grid-row: 2;
      border-top: 1px solid #000;
      border-right: none;
    }

    /* Row 4: d | 9 | 10 */
    .row-4 {
      grid-template-columns: 240px 1fr 180px;
    }

    .box-9 {
      /* Empty box */
    }

    /* Row 5: e | 11 */
    .row-5 {
      grid-template-columns: 1fr 180px;
    }

    .box-e {
      min-height: 50px;
    }

    .name-inputs {
      display: flex;
      gap: 8px;
    }

    .name-first {
      flex: 2;
    }

    .name-last {
      flex: 3;
    }

    .name-suffix {
      flex: 0 0 50px;
    }

    /* Row 6: f | 12 | 13 */
    .row-6 {
      grid-template-columns: 240px 1fr 150px;
    }

    .box-f {
      min-height: 80px;
    }

    .box-f .box-value {
      margin-bottom: 4px;
    }

    /* Box 12 styling */
    .box-12 {
      min-height: 120px;
    }

    .box12-grid {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .box12-row {
      display: flex;
      align-items: center;
      gap: 4px;
      height: 26px;
    }

    .box12-letter {
      font-size: 9px;
      font-weight: bold;
      width: 24px;
      text-align: right;
    }

    .box12-code-section {
      display: flex;
      align-items: center;
      gap: 2px;
    }

    .code-label {
      font-size: 7px;
      line-height: 1;
      text-align: center;
    }

    .box12-code {
      width: 30px;
      height: 22px;
      border: 1px solid #666;
      text-align: center;
      font-family: 'Courier New', Courier, monospace;
      font-size: 12px;
      text-transform: uppercase;
      background: #fff;
    }

    .box12-amount {
      flex: 1;
      height: 22px;
      border: none;
      border-bottom: 1px solid #666;
      font-family: 'Courier New', Courier, monospace;
      font-size: 12px;
      text-align: right;
      background: transparent;
      padding: 0 4px;
    }

    .box12-amount:focus {
      background: #fffde7;
    }

    /* Box 13 checkboxes */
    .box-13 {
      min-height: 120px;
    }

    .checkbox-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      padding-top: 4px;
    }

    .checkbox-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      font-size: 9px;
      text-align: center;
      cursor: pointer;
    }

    .checkbox-item input[type='checkbox'] {
      width: 16px;
      height: 16px;
    }

    .checkbox-item.third-party {
      grid-column: 1 / -1;
    }

    .checkbox-text {
      line-height: 1.2;
    }

    /* Row 7: Box 14 (full width) */
    .row-7 {
      grid-template-columns: 1fr;
    }

    .box-14 {
      min-height: 50px;
      border-right: none;
    }

    .box14-textarea {
      flex: 1;
      border: none;
      background: transparent;
      font-family: 'Courier New', Courier, monospace;
      font-size: 12px;
      padding: 4px;
      resize: none;
      outline: none;
    }

    .box14-textarea:focus {
      background: #fffde7;
    }

    /* Row 8 & 9: State section */
    .row-8, .row-9 {
      grid-template-columns: 60px 180px 1fr 180px;
    }

    .box-15 {
      border-right: none;
    }

    .box-15-ein {
      border-right: 1px solid #000;
    }

    /* Row 10: Local section */
    .row-10 {
      grid-template-columns: 1fr 1fr 1fr;
      border-bottom: none;
    }

    /* ========== FOOTER ========== */
    .w2-footer {
      display: flex;
      justify-content: space-between;
      padding: 6px 12px;
      border-top: 2px solid #000;
      font-size: 10px;
      background: #fff;
    }

    .footer-left {
      font-weight: bold;
    }

    .footer-center {
      text-align: center;
    }

    .footer-right {
      font-weight: bold;
    }

    /* ========== RESPONSIVE ========== */
    @media (max-width: 768px) {
      .w2-form {
        font-size: 12px;
      }

      .w2-header {
        grid-template-columns: 1fr;
      }

      .header-left, .header-right {
        border: none;
        border-bottom: 1px solid #000;
      }

      .row-1, .row-2, .row-4 {
        grid-template-columns: 1fr 1fr;
      }

      .row-3 {
        grid-template-columns: 1fr;
      }

      .box-c {
        border-bottom: 1px solid #000;
      }

      .box-group-right {
        grid-template-columns: 1fr 1fr;
      }

      .row-5 {
        grid-template-columns: 1fr;
      }

      .row-6 {
        grid-template-columns: 1fr 1fr;
      }

      .row-8, .row-9 {
        grid-template-columns: 40px 1fr 1fr 1fr;
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
export class W2FormComponent {
  w2 = input.required<W2>();
  w2Change = output<Partial<W2>>();

  formatCurrency(value: number | undefined): string {
    if (value === undefined || value === 0) return '';
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  onCurrencyFocus(event: FocusEvent): void {
    const input = event.target as HTMLInputElement;
    if (input.value === '0.00' || input.value === '') {
      input.value = '';
    }
  }

  onFieldChange(field: keyof W2, value: unknown): void {
    this.w2Change.emit({ [field]: value });
  }

  onCurrencyChange(field: keyof W2, value: string): void {
    const numericValue = parseFloat(value.replace(/,/g, '')) || 0;
    this.w2Change.emit({ [field]: numericValue });
  }

  getBox12Entries(): Box12Entry[] {
    const entries = this.w2().box12 || [];
    // Always show 4 rows (12a-12d)
    while (entries.length < 4) {
      entries.push({ code: '', amount: 0 });
    }
    return entries.slice(0, 4);
  }

  getBox12Letter(index: number): string {
    return String.fromCharCode(97 + index); // a, b, c, d
  }

  onBox12CodeChange(index: number, code: string): void {
    const entries = [...this.getBox12Entries()];
    entries[index] = { ...entries[index], code: code.toUpperCase() };
    this.w2Change.emit({ box12: entries });
  }

  onBox12AmountChange(index: number, value: string): void {
    const numericValue = parseFloat(value.replace(/,/g, '')) || 0;
    const entries = [...this.getBox12Entries()];
    entries[index] = { ...entries[index], amount: numericValue };
    this.w2Change.emit({ box12: entries });
  }
}
