import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MILEAGE_RATE } from '@core/constants/tax-year-2025';

@Component({
  selector: 'app-mileage-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mileage-calculator">
      <h3>Mileage Deduction Calculator</h3>
      <p class="calculator-intro">
        Track miles driven for your gig work to reduce your taxable income.
      </p>

      <div class="input-method-toggle">
        <button
          type="button"
          class="method-btn"
          [class.active]="inputMethod() === 'direct'"
          (click)="inputMethod.set('direct')"
        >
          Enter Total Miles
        </button>
        <button
          type="button"
          class="method-btn"
          [class.active]="inputMethod() === 'estimate'"
          (click)="inputMethod.set('estimate')"
        >
          Estimate Miles
        </button>
      </div>

      @if (inputMethod() === 'direct') {
        <div class="input-group">
          <label for="totalMiles">Total business miles driven</label>
          <input
            type="number"
            id="totalMiles"
            [ngModel]="directMiles()"
            (ngModelChange)="onDirectMilesChange($event)"
            min="0"
            placeholder="0"
          />
          <span class="input-hint">Enter the total miles you drove for work this year</span>
        </div>
      } @else {
        <div class="estimate-inputs">
          <div class="input-group">
            <label for="numTrips">Number of trips/deliveries</label>
            <input
              type="number"
              id="numTrips"
              [ngModel]="numTrips()"
              (ngModelChange)="numTrips.set($event || 0)"
              min="0"
              placeholder="0"
            />
          </div>
          <div class="input-group">
            <label for="avgMiles">Average miles per trip</label>
            <input
              type="number"
              id="avgMiles"
              [ngModel]="avgMilesPerTrip()"
              (ngModelChange)="avgMilesPerTrip.set($event || 0)"
              min="0"
              step="0.1"
              placeholder="0"
            />
            <span class="input-hint">Most delivery trips average 5-10 miles</span>
          </div>
        </div>
      }

      <div class="calculation-result">
        <div class="result-row">
          <span class="result-label">Business Miles:</span>
          <span class="result-value">{{ totalMiles() | number }}</span>
        </div>
        <div class="result-row">
          <span class="result-label">Rate per Mile:</span>
          <span class="result-value">{{ mileageRate | currency }}</span>
        </div>
        <div class="result-row total">
          <span class="result-label">Mileage Deduction:</span>
          <span class="result-value highlight">{{ deduction() | currency }}</span>
        </div>
      </div>

      @if (totalMiles() > 0) {
        <div class="tax-savings-note">
          <div class="note-icon">$</div>
          <div class="note-content">
            <strong>Estimated Tax Savings</strong>
            <p>
              This {{ deduction() | currency }} deduction could save you approximately
              <strong>{{ estimatedTaxSavings() | currency }}</strong> in taxes
              (at 15.3% SE tax + ~12% income tax).
            </p>
          </div>
        </div>
      }

      <div class="mileage-tips">
        <h4>What counts as business miles?</h4>
        <ul>
          <li>Miles driven from your first pickup to your last drop-off</li>
          <li>Miles driving between jobs or deliveries</li>
          <li>Miles to buy work supplies</li>
        </ul>
        <p class="tip-warning">
          <strong>Does NOT include:</strong> Commuting from home to your first job,
          or from your last job back home.
        </p>
      </div>
    </div>
  `,
  styles: `
    .mileage-calculator {
      background: var(--ngpf-gray-pale);
      border-radius: var(--radius-md);
      padding: 1.5rem;
    }

    h3 {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--ngpf-navy-dark);
      margin: 0 0 0.5rem;
    }

    .calculator-intro {
      color: var(--ngpf-gray-dark);
      font-size: 0.875rem;
      margin: 0 0 1rem;
    }

    .input-method-toggle {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .method-btn {
      flex: 1;
      padding: 0.625rem 1rem;
      border: 2px solid var(--ngpf-gray-light);
      border-radius: var(--radius-sm);
      background: var(--ngpf-white);
      color: var(--ngpf-gray-dark);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-fast);

      &:hover {
        border-color: var(--ngpf-navy-light);
      }

      &.active {
        background: var(--ngpf-navy-light);
        border-color: var(--ngpf-navy-light);
        color: var(--ngpf-white);
      }
    }

    .input-group {
      margin-bottom: 1rem;

      label {
        display: block;
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--ngpf-navy-dark);
        margin-bottom: 0.375rem;
      }

      input {
        width: 100%;
        padding: 0.625rem 0.875rem;
        border: 1px solid var(--ngpf-gray-light);
        border-radius: var(--radius-sm);
        font-size: 1rem;

        &:focus {
          outline: none;
          border-color: var(--ngpf-navy-light);
          box-shadow: 0 0 0 3px rgba(44, 82, 130, 0.1);
        }
      }
    }

    .input-hint {
      display: block;
      font-size: 0.75rem;
      color: var(--ngpf-gray);
      margin-top: 0.25rem;
    }

    .estimate-inputs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;

      @media (max-width: 500px) {
        grid-template-columns: 1fr;
      }
    }

    .calculation-result {
      background: var(--ngpf-white);
      border-radius: var(--radius-sm);
      padding: 1rem;
      margin: 1rem 0;
    }

    .result-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.375rem 0;
      font-size: 0.9375rem;

      &.total {
        margin-top: 0.5rem;
        padding-top: 0.75rem;
        border-top: 2px solid var(--ngpf-gray-light);
        font-weight: 600;
      }
    }

    .result-label {
      color: var(--ngpf-gray-dark);
    }

    .result-value {
      font-weight: 500;
      color: var(--ngpf-navy-dark);

      &.highlight {
        color: var(--ngpf-success);
        font-size: 1.125rem;
      }
    }

    .tax-savings-note {
      display: flex;
      gap: 0.75rem;
      padding: 1rem;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: var(--radius-sm);
      margin-bottom: 1rem;
    }

    .note-icon {
      flex-shrink: 0;
      width: 1.5rem;
      height: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #10b981;
      color: white;
      border-radius: 50%;
      font-weight: 700;
      font-size: 0.875rem;
    }

    .note-content {
      flex: 1;

      strong {
        display: block;
        color: #047857;
        margin-bottom: 0.25rem;
      }

      p {
        margin: 0;
        font-size: 0.875rem;
        color: #047857;
      }
    }

    .mileage-tips {
      background: var(--ngpf-white);
      border-radius: var(--radius-sm);
      padding: 1rem;

      h4 {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--ngpf-navy-dark);
        margin: 0 0 0.5rem;
      }

      ul {
        margin: 0 0 0.75rem;
        padding-left: 1.25rem;

        li {
          font-size: 0.8125rem;
          color: var(--ngpf-gray-dark);
          margin-bottom: 0.25rem;
        }
      }

      .tip-warning {
        margin: 0;
        padding: 0.5rem;
        background: var(--ngpf-warning-light);
        border-radius: var(--radius-xs);
        font-size: 0.8125rem;
        color: #856404;
      }
    }
  `,
})
export class MileageCalculatorComponent {
  // Input/output for parent component binding
  readonly miles = input<number>(0);
  readonly milesChange = output<number>();
  readonly deductionChange = output<number>();

  // Internal state
  readonly inputMethod = signal<'direct' | 'estimate'>('direct');
  readonly directMiles = signal(0);
  readonly numTrips = signal(0);
  readonly avgMilesPerTrip = signal(0);

  readonly mileageRate = MILEAGE_RATE;

  readonly totalMiles = computed(() => {
    if (this.inputMethod() === 'direct') {
      return this.directMiles();
    }
    return Math.round(this.numTrips() * this.avgMilesPerTrip());
  });

  readonly deduction = computed(() => {
    return this.totalMiles() * MILEAGE_RATE;
  });

  // Rough estimate: SE tax (15.3%) + income tax (~12%) = ~27%
  readonly estimatedTaxSavings = computed(() => {
    return this.deduction() * 0.27;
  });

  onDirectMilesChange(value: number): void {
    this.directMiles.set(value || 0);
    this.emitChanges();
  }

  private emitChanges(): void {
    this.milesChange.emit(this.totalMiles());
    this.deductionChange.emit(this.deduction());
  }
}
