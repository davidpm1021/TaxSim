import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NavigationService,
  SessionStorageService,
  TaxDataService,
  StateTaxCalculationService,
} from '@core/services';
import { StateTaxResult } from '@core/models';
import {
  NavigationHeaderComponent,
  EducationalModalComponent,
} from '@shared/components';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [
    CommonModule,
    NavigationHeaderComponent,
    EducationalModalComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-navigation-header />

    <div class="page-container">
      <div class="content-card">
        <!-- Primary Result Display -->
        <div class="result-hero" [class.refund]="isRefund()" [class.owed]="!isRefund()">
          <h1>Your Results</h1>
          <div class="result-box">
            <span class="result-label">
              @if (isRefund()) {
                Your Federal Refund
              } @else {
                You Owe
              }
            </span>
            <span class="result-amount">{{ formatCurrency(refundOrOwed()) }}</span>
          </div>
          <p class="result-explanation">
            @if (isRefund()) {
              This is the amount you would receive back from the IRS.
            } @else {
              This is the amount you would need to pay to the IRS.
            }
          </p>
          <button class="help-link" (click)="openWhyModal()" type="button">
            @if (isRefund()) {
              Why am I getting a refund?
            } @else {
              Why do I owe money?
            }
          </button>
        </div>

        <!-- Detailed Breakdown -->
        <section class="breakdown-section">
          <h2>How We Calculated This</h2>

          <!-- Income -->
          <div class="breakdown-group">
            <h3>Income</h3>
            <div class="breakdown-rows">
              @if (totalW2Wages() > 0) {
                <div class="breakdown-row">
                  <span>W-2 Wages</span>
                  <span>{{ formatCurrency(totalW2Wages()) }}</span>
                </div>
              }
              @if (total1099Income() > 0) {
                <div class="breakdown-row">
                  <span>1099-NEC Income</span>
                  <span>{{ formatCurrency(total1099Income()) }}</span>
                </div>
              }
              <div class="breakdown-row total">
                <span>Total Income</span>
                <span>{{ formatCurrency(grossIncome()) }}</span>
              </div>
            </div>
          </div>

          <!-- Adjustments (if any) -->
          @if (selfEmploymentTaxDeduction() > 0) {
            <div class="breakdown-group">
              <h3>Adjustments</h3>
              <div class="breakdown-rows">
                <div class="breakdown-row">
                  <span>Self-Employment Tax Deduction</span>
                  <span>({{ formatCurrency(selfEmploymentTaxDeduction()) }})</span>
                </div>
                <div class="breakdown-row total">
                  <span>Adjusted Gross Income (AGI)</span>
                  <span>{{ formatCurrency(adjustedGrossIncome()) }}</span>
                </div>
              </div>
            </div>
          }

          <!-- Deductions -->
          <div class="breakdown-group">
            <h3>Deductions</h3>
            <div class="breakdown-rows">
              <div class="breakdown-row">
                <span>
                  {{ deductionUsed() === 'standard' ? 'Standard Deduction' : 'Itemized Deductions' }}
                </span>
                <span>({{ formatCurrency(finalDeductionAmount()) }})</span>
              </div>
              <div class="breakdown-row total">
                <span>Taxable Income</span>
                <span>{{ formatCurrency(taxableIncome()) }}</span>
              </div>
            </div>
          </div>

          <!-- Tax Calculation -->
          <div class="breakdown-group">
            <h3>
              Tax Calculation
              <button class="info-btn" (click)="openBracketsModal()" type="button" aria-label="Learn about tax brackets">?</button>
            </h3>
            <div class="breakdown-rows">
              <div class="breakdown-row">
                <span>Tax on {{ formatCurrency(taxableIncome()) }}</span>
                <span>{{ formatCurrency(taxBeforeCredits()) }}</span>
              </div>
              @if (selfEmploymentTax() > 0) {
                <div class="breakdown-row">
                  <span>Self-Employment Tax</span>
                  <span>{{ formatCurrency(selfEmploymentTax()) }}</span>
                </div>
              }
              <div class="breakdown-row total">
                <span>Total Tax Before Credits</span>
                <span>{{ formatCurrency(totalTaxBeforeCredits()) }}</span>
              </div>
            </div>
          </div>

          <!-- Credits -->
          <div class="breakdown-group">
            <h3>Credits</h3>
            <div class="breakdown-rows">
              @if (totalCredits() > 0) {
                @if (childTaxCredit() > 0) {
                  <div class="breakdown-row">
                    <span>Child Tax Credit</span>
                    <span>({{ formatCurrency(childTaxCredit()) }})</span>
                  </div>
                }
                @if (earnedIncomeCredit() > 0) {
                  <div class="breakdown-row">
                    <span>Earned Income Tax Credit</span>
                    <span>({{ formatCurrency(earnedIncomeCredit()) }})</span>
                  </div>
                }
                <div class="breakdown-row total positive">
                  <span>Total Credits</span>
                  <span>({{ formatCurrency(totalCredits()) }})</span>
                </div>
              } @else {
                <div class="breakdown-row muted">
                  <span>No credits applied</span>
                  <span>$0</span>
                </div>
              }
            </div>
          </div>

          <!-- Payments/Withholding -->
          <div class="breakdown-group">
            <h3>
              Payments
              <button class="info-btn" (click)="openWithholdingModal()" type="button" aria-label="Learn about withholding">?</button>
            </h3>
            <div class="breakdown-rows">
              <div class="breakdown-row">
                <span>Federal Tax Withheld (from W-2)</span>
                <span>{{ formatCurrency(totalWithholding()) }}</span>
              </div>
              <div class="breakdown-row total">
                <span>Total Payments</span>
                <span>{{ formatCurrency(totalWithholding()) }}</span>
              </div>
            </div>
          </div>

          <!-- State Tax Section -->
          @if (hasStateInfo()) {
            <div class="breakdown-group state-tax">
              <h3>
                State Taxes: {{ stateTaxResult()?.stateName }}
                <button class="info-btn" (click)="openStateTaxModal()" type="button" aria-label="Learn about state taxes">?</button>
              </h3>
              <div class="breakdown-rows">
                @if (!stateTaxResult()?.hasIncomeTax) {
                  <div class="breakdown-row no-state-tax">
                    <span>{{ stateTaxResult()?.stateName }} has no state income tax</span>
                    <span class="success-badge">$0</span>
                  </div>
                } @else {
                  <div class="breakdown-row">
                    <span>State Taxable Income</span>
                    <span>{{ formatCurrency(stateTaxResult()?.taxableIncome || 0) }}</span>
                  </div>
                  @if ((stateTaxResult()?.standardDeduction || 0) > 0) {
                    <div class="breakdown-row">
                      <span>State Deductions</span>
                      <span>({{ formatCurrency(stateTaxResult()?.standardDeduction || 0) }})</span>
                    </div>
                  }
                  <div class="breakdown-row">
                    <span>State Tax</span>
                    <span>{{ formatCurrency(stateTaxResult()?.stateTaxOwed || 0) }}</span>
                  </div>
                  <div class="breakdown-row">
                    <span>State Withholding</span>
                    <span>({{ formatCurrency(stateTaxResult()?.stateWithholding || 0) }})</span>
                  </div>
                  <div class="breakdown-row total" [class.refund]="(stateTaxResult()?.stateRefundOrOwed || 0) < 0" [class.owed]="(stateTaxResult()?.stateRefundOrOwed || 0) > 0">
                    <span>{{ (stateTaxResult()?.stateRefundOrOwed || 0) < 0 ? 'State Refund' : 'State Amount Owed' }}</span>
                    <span>{{ formatCurrency(Math.abs(stateTaxResult()?.stateRefundOrOwed || 0)) }}</span>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Final Calculation -->
          <div class="final-calculation" [class.refund]="isRefund()" [class.owed]="!isRefund()">
            <div class="calculation-formula">
              <span>Payments</span>
              <span>-</span>
              <span>Tax</span>
              <span>+</span>
              <span>Refundable Credits</span>
              <span>=</span>
              <span>{{ isRefund() ? 'Refund' : 'Amount Owed' }}</span>
            </div>
            <div class="calculation-values">
              <span>{{ formatCurrency(totalWithholding()) }}</span>
              <span>-</span>
              <span>{{ formatCurrency(totalTaxBeforeCredits()) }}</span>
              <span>+</span>
              <span>{{ formatCurrency(totalCredits()) }}</span>
              <span>=</span>
              <span class="final-value">{{ isRefund() ? '' : '-' }}{{ formatCurrency(refundOrOwed()) }}</span>
            </div>
          </div>
        </section>

        <!-- Deduction Comparison -->
        <section class="comparison-section">
          <h2>Deduction Comparison</h2>
          <p class="comparison-intro">
            You chose: <strong>{{ deductionUsed() === 'standard' ? 'Standard Deduction' : 'Itemized Deductions' }}</strong>
          </p>
          <div class="comparison-cards">
            <div class="comparison-card" [class.selected]="deductionUsed() === 'standard'">
              @if (deductionUsed() === 'standard') {
                <span class="selected-badge">Your Choice</span>
              }
              <h4>Standard Deduction</h4>
              <span class="comparison-amount">{{ formatCurrency(standardDeductionAmount()) }}</span>
            </div>
            <div class="comparison-card" [class.selected]="deductionUsed() === 'itemized'">
              @if (deductionUsed() === 'itemized') {
                <span class="selected-badge">Your Choice</span>
              }
              <h4>Itemized Deductions</h4>
              <span class="comparison-amount">{{ formatCurrency(itemizedDeductionAmount()) }}</span>
            </div>
          </div>
          @if (deductionSavings() > 0) {
            <p class="savings-note">
              By choosing {{ deductionUsed() === 'standard' ? 'standard' : 'itemized' }},
              you saved approximately <strong>{{ formatCurrency(deductionSavings()) }}</strong> in taxes!
            </p>
          }
        </section>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button class="btn-secondary" (click)="onPrint()" type="button">
            Print Summary
          </button>
          <button class="btn-primary" (click)="onStartOver()" type="button">
            Start Over
          </button>
        </div>
      </div>
    </div>

    <!-- Educational Modals -->
    <app-educational-modal
      title="Why Am I Getting a Refund?"
      #refundModal
    >
      <p>
        You're getting a refund because your employer withheld <strong>more</strong>
        money from your paychecks than you actually owe in taxes.
      </p>
      <p>
        Throughout the year, your employer estimates how much tax you'll owe and sends
        that money to the IRS on your behalf. When you file your return, the IRS
        compares what was withheld to what you actually owe.
      </p>
      <p>
        <strong>The math:</strong> If you had $5,000 withheld but only owe $4,000,
        the IRS sends back the $1,000 difference as your refund.
      </p>
    </app-educational-modal>

    <app-educational-modal
      title="Why Do I Owe Money?"
      #oweModal
    >
      <p>
        You owe money because your employer withheld <strong>less</strong>
        money from your paychecks than you actually owe in taxes.
      </p>
      <p>
        This often happens if you have additional income (like 1099 self-employment
        income) that didn't have any taxes withheld, or if your W-4 withholding
        settings don't match your actual tax situation.
      </p>
      <p>
        <strong>The math:</strong> If you only had $3,000 withheld but owe $4,000,
        you need to pay the $1,000 difference to the IRS.
      </p>
    </app-educational-modal>

    <app-educational-modal
      title="How Tax Brackets Work"
      #bracketsModal
    >
      <p>
        The U.S. uses a <strong>progressive tax system</strong> with tax brackets.
        This means different portions of your income are taxed at different rates.
      </p>
      <p>
        For example, if you're single with $50,000 in taxable income:
      </p>
      <ul>
        <li>First $11,925 is taxed at 10% = $1,192.50</li>
        <li>Next $36,550 ($11,926-$48,475) is taxed at 12% = $4,386</li>
        <li>Remaining $1,525 ($48,476-$50,000) is taxed at 22% = $335.50</li>
        <li><strong>Total tax: $5,914</strong></li>
      </ul>
      <p>
        Your "tax bracket" (22% in this example) only applies to income above the
        previous bracket's threshold—not your entire income!
      </p>
    </app-educational-modal>

    <app-educational-modal
      title="What is Tax Withholding?"
      #withholdingModal
    >
      <p>
        <strong>Tax withholding</strong> is money your employer takes out of each
        paycheck and sends directly to the IRS on your behalf.
      </p>
      <p>
        When you start a job, you fill out a W-4 form that tells your employer how
        much to withhold. The goal is to have roughly the right amount withheld so
        you don't owe a lot or get a huge refund.
      </p>
      <p>
        <strong>Box 2 on your W-2</strong> shows the total federal income tax that
        was withheld from all your paychecks during the year. This is like a
        prepayment toward your annual tax bill.
      </p>
    </app-educational-modal>

    <app-educational-modal
      title="Understanding State Taxes"
      #stateTaxModal
    >
      <p>
        In addition to federal taxes, most states also have their own income tax.
        <strong>State tax rules vary widely</strong>—some states have no income tax
        at all, while others have rates as high as 13%.
      </p>
      <p>
        <strong>Key differences from federal taxes:</strong>
      </p>
      <ul>
        <li>Different tax brackets and rates</li>
        <li>Different deduction amounts</li>
        <li>Some states have flat tax rates</li>
        <li>Nine states have no income tax</li>
      </ul>
      <p>
        Your state tax is calculated separately and filed on a separate return.
        <strong>Box 17 on your W-2</strong> shows your state tax withholding.
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
      max-width: 750px;
      margin: 0 auto;
      background: white;
      border-radius: 24px;
      padding: 0;
      box-shadow:
        0 1px 3px rgba(0, 0, 0, 0.04),
        0 8px 32px rgba(0, 0, 0, 0.08);
      overflow: hidden;
      animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Hero Section */
    .result-hero {
      padding: 3.5rem 2rem;
      text-align: center;
      color: white;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: -50%;
        right: -50%;
        width: 100%;
        height: 200%;
        background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
      }

      &.refund {
        background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
      }

      &.owed {
        background: linear-gradient(135deg, #f59e0b 0%, #ea580c 50%, #c2410c 100%);
      }

      h1 {
        font-family: var(--font-heading);
        font-size: 1rem;
        font-weight: 600;
        margin: 0 0 1.5rem;
        opacity: 0.9;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        position: relative;
      }
    }

    .result-box {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 20px;
      padding: 2rem 2.5rem;
      margin: 0 auto 1.5rem;
      max-width: 360px;
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      position: relative;
      animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
    }

    @keyframes popIn {
      from {
        opacity: 0;
        transform: scale(0.9);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    .result-label {
      font-size: 0.8125rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      opacity: 0.9;
    }

    .result-amount {
      font-size: 3.5rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      text-shadow: 0 2px 20px rgba(0,0,0,0.1);
    }

    .result-explanation {
      font-size: 0.9375rem;
      margin: 0 0 1rem;
      opacity: 0.85;
      font-weight: 400;
      position: relative;
    }

    .help-link {
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 100px;
      color: white;
      font-size: 0.875rem;
      font-weight: 600;
      padding: 0.625rem 1.25rem;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;

      &:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: translateY(-1px);
      }
    }

    /* Breakdown Section */
    .breakdown-section {
      padding: 2.5rem 2rem;

      h2 {
        font-family: var(--font-heading);
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--ngpf-navy);
        margin: 0 0 2rem;
        text-align: center;
      }
    }

    .breakdown-group {
      margin-bottom: 1.25rem;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      overflow: hidden;
      background: #f8fafc;

      h3 {
        font-size: 0.75rem;
        font-weight: 700;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin: 0;
        padding: 1rem 1.5rem;
        background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
    }

    .breakdown-rows {
      padding: 1rem 1.5rem;
      background: white;
    }

    .breakdown-row {
      display: flex;
      justify-content: space-between;
      padding: 0.75rem 0;
      font-size: 0.9375rem;
      color: #64748b;

      &.total {
        border-top: 2px solid #e2e8f0;
        margin-top: 0.5rem;
        padding-top: 1rem;
        font-weight: 700;
        color: var(--ngpf-navy);
      }

      &.positive {
        color: var(--ngpf-success);
      }

      &.muted {
        color: #94a3b8;
        font-style: italic;
      }

      &.refund {
        color: var(--ngpf-success);
      }

      &.owed {
        color: var(--ngpf-orange);
      }
    }

    /* State Tax Section */
    .breakdown-group.state-tax {
      h3 {
        background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
      }
    }

    .no-state-tax {
      background: rgba(16, 185, 129, 0.05);
      border-radius: 8px;
      padding: 1rem !important;

      .success-badge {
        background: var(--ngpf-green);
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 100px;
        font-weight: 600;
        font-size: 0.875rem;
      }
    }

    .info-btn {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: var(--ngpf-bright-blue);
      color: white;
      border: none;
      font-size: 0.75rem;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;

      &:hover {
        background: var(--ngpf-royal-blue);
        transform: scale(1.1);
      }
    }

    /* Final Calculation */
    .final-calculation {
      margin-top: 2rem;
      padding: 1.75rem;
      border-radius: 16px;
      text-align: center;

      &.refund {
        background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
        border: 2px solid #10b981;
      }

      &.owed {
        background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
        border: 2px solid #f59e0b;
      }
    }

    .calculation-formula {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: #64748b;
      margin-bottom: 0.75rem;
      flex-wrap: wrap;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .calculation-values {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.5rem;
      font-size: 1rem;
      font-weight: 700;
      color: var(--ngpf-navy);
      flex-wrap: wrap;
    }

    .final-value {
      font-size: 1.375rem;
      padding: 0.5rem 1rem;
      border-radius: 10px;
      background: rgba(0, 0, 0, 0.08);
    }

    /* Comparison Section */
    .comparison-section {
      padding: 0 2rem 2.5rem;

      h2 {
        font-family: var(--font-heading);
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--ngpf-navy);
        margin: 0 0 0.75rem;
        text-align: center;
      }
    }

    .comparison-intro {
      text-align: center;
      color: #64748b;
      font-size: 0.9375rem;
      margin: 0 0 1.25rem;
    }

    .comparison-cards {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;

      @media (max-width: 500px) {
        grid-template-columns: 1fr;
      }
    }

    .comparison-card {
      position: relative;
      padding: 1.75rem;
      border: 2px solid #e2e8f0;
      border-radius: 16px;
      text-align: center;
      background: #f8fafc;
      transition: all 0.3s ease;

      &.selected {
        border-color: var(--ngpf-bright-blue);
        background: linear-gradient(135deg, rgba(39, 92, 228, 0.05), rgba(29, 184, 232, 0.03));
        box-shadow: 0 4px 12px rgba(39, 92, 228, 0.1);
      }

      h4 {
        font-size: 0.8125rem;
        font-weight: 600;
        color: #64748b;
        margin: 0 0 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }
    }

    .selected-badge {
      position: absolute;
      top: -12px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, var(--ngpf-bright-blue), #1d4ed8);
      color: white;
      font-size: 0.6875rem;
      font-weight: 700;
      padding: 0.375rem 0.875rem;
      border-radius: 100px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      box-shadow: 0 2px 8px rgba(39, 92, 228, 0.3);
    }

    .comparison-amount {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--ngpf-navy);
    }

    .savings-note {
      text-align: center;
      color: #047857;
      font-size: 0.9375rem;
      font-weight: 600;
      margin: 1.25rem 0 0;
      padding: 1rem 1.25rem;
      background: linear-gradient(135deg, #d1fae5, #a7f3d0);
      border-radius: 12px;
      border: 1px solid #10b981;
    }

    /* Action Buttons */
    .action-buttons {
      display: flex;
      justify-content: center;
      gap: 1rem;
      padding: 0 2rem 2.5rem;
      flex-wrap: wrap;
    }

    .btn-primary,
    .btn-secondary {
      padding: 1rem 2rem;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .btn-primary {
      background: linear-gradient(135deg, #f4ad00 0%, #ff8c00 100%);
      color: #0b1541;
      border: none;
      box-shadow: 0 4px 15px rgba(244, 173, 0, 0.3);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(244, 173, 0, 0.4);
      }
    }

    .btn-secondary {
      background: white;
      color: var(--ngpf-navy);
      border: 2px solid #e2e8f0;

      &:hover {
        background: #f8fafc;
        border-color: #cbd5e1;
      }
    }

    /* Modal list styling */
    ul {
      margin: 0.5rem 0;
      padding-left: 1.5rem;

      li {
        margin-bottom: 0.375rem;
        line-height: 1.5;
      }
    }

    @media (max-width: 520px) {
      .page-container {
        padding: 1.25rem;
      }

      .content-card {
        border-radius: 20px;
      }

      .result-hero {
        padding: 2.5rem 1.5rem;
      }

      .result-amount {
        font-size: 2.75rem;
      }

      .breakdown-section,
      .comparison-section,
      .action-buttons {
        padding-left: 1.5rem;
        padding-right: 1.5rem;
      }

      .action-buttons {
        flex-direction: column;
      }

      .btn-primary,
      .btn-secondary {
        width: 100%;
      }
    }
  `,
})
export class ResultsComponent {
  private readonly navigation = inject(NavigationService);
  private readonly sessionStorage = inject(SessionStorageService);
  private readonly taxData = inject(TaxDataService);
  private readonly stateTaxService = inject(StateTaxCalculationService);

  // Expose Math for template
  readonly Math = Math;

  private readonly refundModal = viewChild.required<EducationalModalComponent>('refundModal');
  private readonly oweModal = viewChild.required<EducationalModalComponent>('oweModal');
  private readonly bracketsModal = viewChild.required<EducationalModalComponent>('bracketsModal');
  private readonly withholdingModal = viewChild.required<EducationalModalComponent>('withholdingModal');
  private readonly stateTaxModal = viewChild.required<EducationalModalComponent>('stateTaxModal');

  // Get calculation from session storage
  private readonly calculation = computed(() =>
    this.sessionStorage.taxReturn().calculation
  );

  private readonly credits = computed(() =>
    this.sessionStorage.taxReturn().credits
  );

  // Income
  readonly totalW2Wages = computed(() =>
    this.calculation()?.totalW2Wages ?? 0
  );

  readonly total1099Income = computed(() =>
    this.calculation()?.total1099Income ?? 0
  );

  readonly grossIncome = computed(() =>
    this.calculation()?.grossIncome ?? 0
  );

  // Adjustments
  readonly selfEmploymentTaxDeduction = computed(() =>
    this.calculation()?.selfEmploymentTaxDeduction ?? 0
  );

  readonly adjustedGrossIncome = computed(() =>
    this.calculation()?.adjustedGrossIncome ?? 0
  );

  // Deductions
  readonly deductionUsed = computed(() =>
    this.calculation()?.deductionUsed ?? 'standard'
  );

  readonly standardDeductionAmount = computed(() =>
    this.calculation()?.standardDeductionAmount ?? 0
  );

  readonly itemizedDeductionAmount = computed(() =>
    this.calculation()?.itemizedDeductionAmount ?? 0
  );

  readonly finalDeductionAmount = computed(() =>
    this.calculation()?.finalDeductionAmount ?? 0
  );

  readonly taxableIncome = computed(() =>
    this.calculation()?.taxableIncome ?? 0
  );

  // Tax
  readonly taxBeforeCredits = computed(() =>
    this.calculation()?.taxBeforeCredits ?? 0
  );

  readonly selfEmploymentTax = computed(() =>
    this.calculation()?.selfEmploymentTax ?? 0
  );

  readonly totalTaxBeforeCredits = computed(() =>
    this.calculation()?.totalTaxBeforeCredits ?? 0
  );

  // Credits
  readonly childTaxCredit = computed(() =>
    this.credits().childTaxCredit
  );

  readonly earnedIncomeCredit = computed(() =>
    this.credits().earnedIncomeCredit
  );

  readonly totalCredits = computed(() =>
    this.calculation()?.totalCredits ?? 0
  );

  // Final
  readonly totalWithholding = computed(() =>
    this.calculation()?.totalWithholding ?? 0
  );

  readonly totalTax = computed(() =>
    this.calculation()?.totalTax ?? 0
  );

  readonly refundOrOwed = computed(() =>
    this.calculation()?.refundOrOwed ?? 0
  );

  readonly isRefund = computed(() =>
    this.calculation()?.isRefund ?? true
  );

  // Deduction savings calculation
  readonly deductionSavings = computed(() => {
    const calc = this.calculation();
    if (!calc) return 0;

    const difference = Math.abs(calc.standardDeductionAmount - calc.itemizedDeductionAmount);
    // Rough tax savings estimate using 12% bracket (common for students)
    const estimatedSavings = difference * 0.12;
    return Math.round(estimatedSavings);
  });

  // State tax
  private readonly stateInfo = computed(() =>
    this.sessionStorage.taxReturn().stateInfo
  );

  private readonly personalInfo = computed(() =>
    this.sessionStorage.taxReturn().personalInfo
  );

  readonly hasStateInfo = computed(() => {
    const info = this.stateInfo();
    return info?.residenceState !== null;
  });

  readonly stateTaxResult = computed<StateTaxResult | null>(() => {
    const stateInfo = this.stateInfo();
    const personalInfo = this.personalInfo();
    const calc = this.calculation();

    if (!stateInfo?.residenceState || !calc) {
      return null;
    }

    const numDependents = personalInfo.dependents?.length ?? 0;

    return this.stateTaxService.calculateStateTax(
      stateInfo.residenceState,
      personalInfo.filingStatus,
      calc.adjustedGrossIncome,
      stateInfo.stateWages || calc.totalW2Wages,
      stateInfo.stateWithholding,
      numDependents
    );
  });

  formatCurrency(amount: number): string {
    return this.taxData.formatCurrency(amount);
  }

  openWhyModal(): void {
    if (this.isRefund()) {
      this.refundModal().open();
    } else {
      this.oweModal().open();
    }
  }

  openBracketsModal(): void {
    this.bracketsModal().open();
  }

  openWithholdingModal(): void {
    this.withholdingModal().open();
  }

  openStateTaxModal(): void {
    this.stateTaxModal().open();
  }

  onPrint(): void {
    window.print();
  }

  onStartOver(): void {
    this.sessionStorage.clear();
    this.navigation.reset();
    this.navigation.navigateTo('/welcome');
  }
}
