import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationService, SessionStorageService } from '@core/services';
import { NavigationHeaderComponent, ContinueButtonComponent } from '@shared/components';
import { StateCode, UserStateInfo, createEmptyUserStateInfo } from '@core/models';
import { ALL_STATES, STATE_TAX_DATA, stateHasIncomeTax, isStateImplemented } from '@core/constants/state-taxes-2025';

@Component({
  selector: 'app-state-selection',
  standalone: true,
  imports: [CommonModule, FormsModule, NavigationHeaderComponent, ContinueButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-navigation-header />

    <main class="form-container">
      <header class="page-header">
        <button class="back-btn" (click)="goBack()" type="button">
          <span class="back-arrow">&larr;</span> Back
        </button>
        <h2>State Information</h2>
        <p>Tell us about the state where you live and work</p>
      </header>

      <div class="content-card">
        <!-- Residence State -->
        <div class="form-section">
          <h3>Where do you live?</h3>
          <p class="section-hint">This is usually where you'll file your state tax return</p>

          <div class="form-group">
            <label for="residenceState">State of Residence</label>
            <select
              id="residenceState"
              [ngModel]="stateInfo().residenceState"
              (ngModelChange)="updateResidenceState($event)"
              class="form-select"
            >
              <option [ngValue]="null">Select a state...</option>
              @for (state of states; track state.code) {
                <option [value]="state.code">{{ state.name }}</option>
              }
            </select>
          </div>

          @if (residenceStateInfo()) {
            <div class="state-info-card" [class.no-tax]="!residenceStateInfo()!.hasIncomeTax">
              @if (!residenceStateInfo()!.hasIncomeTax) {
                <div class="info-badge success">No State Income Tax</div>
                <p>{{ residenceStateInfo()!.name }} does not have a state income tax. You won't need to file a state return here.</p>
              } @else if (residenceStateInfo()!.taxType === 'flat') {
                <div class="info-badge">Flat Tax: {{ (residenceStateInfo()!.flatRate || 0) * 100 | number:'1.2-2' }}%</div>
                <p>{{ residenceStateInfo()!.name }} has a flat income tax rate.</p>
              } @else {
                <div class="info-badge">Progressive Tax</div>
                <p>{{ residenceStateInfo()!.name }} has progressive tax brackets (higher income = higher rates).</p>
              }

              @if (!isResidenceStateImplemented()) {
                <div class="warning-note">
                  <span class="warning-icon">!</span>
                  <span>This state's tax calculation is not fully implemented yet. Results will be estimated.</span>
                </div>
              }
            </div>
          }
        </div>

        <!-- Work State -->
        <div class="form-section">
          <h3>Where do you work?</h3>
          <p class="section-hint">If you worked in a different state, you may need to file there too</p>

          <div class="form-group">
            <div class="checkbox-option">
              <input
                type="checkbox"
                id="sameAsResidence"
                [checked]="sameAsResidence()"
                (change)="toggleSameAsResidence($event)"
              />
              <label for="sameAsResidence">Same as residence state</label>
            </div>
          </div>

          @if (!sameAsResidence()) {
            <div class="form-group">
              <label for="workState">State Where You Worked</label>
              <select
                id="workState"
                [ngModel]="stateInfo().workState"
                (ngModelChange)="updateWorkState($event)"
                class="form-select"
              >
                <option [ngValue]="null">Select a state...</option>
                @for (state of states; track state.code) {
                  <option [value]="state.code">{{ state.name }}</option>
                }
              </select>
            </div>

            @if (workStateInfo() && stateInfo().workState !== stateInfo().residenceState) {
              <div class="multi-state-notice">
                <span class="notice-icon">&#x1F4CB;</span>
                <div>
                  <strong>Multi-State Filing</strong>
                  <p>You may need to file returns in both states. Your residence state typically gives credit for taxes paid to your work state.</p>
                </div>
              </div>
            }
          }
        </div>

        <!-- State Wages & Withholding -->
        @if (stateInfo().residenceState && residenceStateInfo()?.hasIncomeTax) {
          <div class="form-section">
            <h3>State Withholding</h3>
            <p class="section-hint">Enter any state taxes withheld from your W-2 (Box 17)</p>

            <div class="form-group">
              <label for="stateWithholding">State Tax Withheld</label>
              <div class="input-with-prefix">
                <span class="prefix">$</span>
                <input
                  type="number"
                  id="stateWithholding"
                  [ngModel]="stateInfo().stateWithholding"
                  (ngModelChange)="updateStateWithholding($event)"
                  placeholder="0"
                  min="0"
                  class="form-input"
                />
              </div>
              <span class="input-hint">Found in Box 17 of your W-2</span>
            </div>
          </div>
        }

        <!-- Educational Note -->
        <div class="edu-note">
          <span class="note-icon">&#x1F4A1;</span>
          <div>
            <strong>Why does state matter?</strong>
            <p>Each state has different tax rules. Some states have no income tax at all, while others have rates up to 13%. Where you live and work determines which states you'll owe taxes to.</p>
          </div>
        </div>
      </div>

      <app-continue-button
        [disabled]="!canContinue()"
        (continue)="onContinue()"
        buttonText="Continue"
      />
    </main>
  `,
  styles: `
    .form-container {
      max-width: 700px;
      margin: 0 auto;
      padding: 0 1rem 2rem;
    }

    .page-header {
      margin-bottom: 1.5rem;

      .back-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.5rem 0;
        background: none;
        border: none;
        color: var(--ngpf-navy-light);
        font-size: 0.9375rem;
        font-weight: 500;
        cursor: pointer;
        margin-bottom: 0.5rem;

        &:hover {
          color: var(--ngpf-navy-dark);
        }

        .back-arrow {
          font-size: 1.25rem;
        }
      }

      h2 {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--ngpf-navy-dark);
        margin: 0 0 0.25rem;
      }

      p {
        margin: 0;
        color: var(--ngpf-gray);
        font-size: 1rem;
      }
    }

    .content-card {
      background: var(--ngpf-white);
      border-radius: var(--radius-lg);
      padding: 2rem;
      box-shadow: var(--shadow-sm);
      margin-bottom: 1.5rem;
    }

    .form-section {
      margin-bottom: 2rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid var(--ngpf-gray-light);

      &:last-of-type {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
      }

      h3 {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--ngpf-navy-dark);
        margin: 0 0 0.25rem;
      }

      .section-hint {
        color: var(--ngpf-gray);
        font-size: 0.875rem;
        margin: 0 0 1rem;
      }
    }

    .form-group {
      margin-bottom: 1rem;

      label {
        display: block;
        font-weight: 500;
        color: var(--ngpf-gray-dark);
        margin-bottom: 0.375rem;
        font-size: 0.9375rem;
      }
    }

    .form-select {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid var(--ngpf-gray-light);
      border-radius: var(--radius-sm);
      font-size: 1rem;
      background: white;
      cursor: pointer;

      &:focus {
        outline: none;
        border-color: var(--ngpf-navy-light);
        box-shadow: 0 0 0 3px rgba(44, 82, 130, 0.1);
      }
    }

    .form-input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid var(--ngpf-gray-light);
      border-radius: var(--radius-sm);
      font-size: 1rem;

      &:focus {
        outline: none;
        border-color: var(--ngpf-navy-light);
        box-shadow: 0 0 0 3px rgba(44, 82, 130, 0.1);
      }
    }

    .input-with-prefix {
      display: flex;
      align-items: center;

      .prefix {
        padding: 0.75rem;
        background: var(--ngpf-gray-pale);
        border: 2px solid var(--ngpf-gray-light);
        border-right: none;
        border-radius: var(--radius-sm) 0 0 var(--radius-sm);
        color: var(--ngpf-gray);
      }

      .form-input {
        border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
      }
    }

    .input-hint {
      display: block;
      font-size: 0.8125rem;
      color: var(--ngpf-gray);
      margin-top: 0.25rem;
    }

    .checkbox-option {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      input[type="checkbox"] {
        width: 1.125rem;
        height: 1.125rem;
        cursor: pointer;
      }

      label {
        margin: 0;
        cursor: pointer;
      }
    }

    .state-info-card {
      background: var(--ngpf-blue-pale);
      border-radius: var(--radius-sm);
      padding: 1rem;
      margin-top: 1rem;

      &.no-tax {
        background: rgba(16, 185, 129, 0.1);
      }

      p {
        margin: 0.5rem 0 0;
        font-size: 0.9375rem;
        color: var(--ngpf-gray-dark);
      }
    }

    .info-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      background: var(--ngpf-navy-light);
      color: white;
      border-radius: 100px;
      font-size: 0.8125rem;
      font-weight: 600;

      &.success {
        background: var(--ngpf-green);
      }
    }

    .warning-note {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      margin-top: 0.75rem;
      padding: 0.75rem;
      background: rgba(255, 152, 0, 0.1);
      border-radius: var(--radius-xs);
      font-size: 0.875rem;
      color: var(--ngpf-orange-dark);

      .warning-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        background: var(--ngpf-orange);
        color: white;
        border-radius: 50%;
        font-size: 0.75rem;
        font-weight: 700;
        flex-shrink: 0;
      }
    }

    .multi-state-notice {
      display: flex;
      gap: 0.75rem;
      padding: 1rem;
      background: var(--ngpf-blue-pale);
      border-radius: var(--radius-sm);
      margin-top: 1rem;

      .notice-icon {
        font-size: 1.5rem;
        flex-shrink: 0;
      }

      strong {
        display: block;
        color: var(--ngpf-navy-dark);
        margin-bottom: 0.25rem;
      }

      p {
        margin: 0;
        font-size: 0.875rem;
        color: var(--ngpf-gray-dark);
      }
    }

    .edu-note {
      display: flex;
      gap: 0.75rem;
      padding: 1rem;
      background: var(--ngpf-gray-pale);
      border-radius: var(--radius-sm);
      margin-top: 1.5rem;

      .note-icon {
        font-size: 1.5rem;
        flex-shrink: 0;
      }

      strong {
        display: block;
        color: var(--ngpf-navy-dark);
        margin-bottom: 0.25rem;
      }

      p {
        margin: 0;
        font-size: 0.875rem;
        color: var(--ngpf-gray-dark);
      }
    }
  `,
})
export class StateSelectionComponent implements OnInit {
  private readonly navigation = inject(NavigationService);
  private readonly sessionStorage = inject(SessionStorageService);

  readonly states = ALL_STATES;
  readonly stateInfo = signal<UserStateInfo>(createEmptyUserStateInfo());
  readonly sameAsResidence = signal(true);

  readonly residenceStateInfo = computed(() => {
    const code = this.stateInfo().residenceState;
    if (!code) return null;
    return STATE_TAX_DATA[code] || null;
  });

  readonly workStateInfo = computed(() => {
    const code = this.stateInfo().workState;
    if (!code) return null;
    return STATE_TAX_DATA[code] || null;
  });

  readonly isResidenceStateImplemented = computed(() => {
    const code = this.stateInfo().residenceState;
    if (!code) return true;
    return isStateImplemented(code);
  });

  readonly canContinue = computed(() => {
    return this.stateInfo().residenceState !== null;
  });

  ngOnInit(): void {
    const taxReturn = this.sessionStorage.taxReturn();
    if (taxReturn?.stateInfo) {
      this.stateInfo.set(taxReturn.stateInfo);
      // Check if work state is same as residence
      if (taxReturn.stateInfo.workState === taxReturn.stateInfo.residenceState) {
        this.sameAsResidence.set(true);
      } else if (taxReturn.stateInfo.workState !== null) {
        this.sameAsResidence.set(false);
      }
    }
  }

  updateResidenceState(state: StateCode | null): void {
    const current = this.stateInfo();
    const updated: UserStateInfo = {
      ...current,
      residenceState: state,
      workState: this.sameAsResidence() ? state : current.workState,
    };
    this.stateInfo.set(updated);
    this.saveToSession();
  }

  updateWorkState(state: StateCode | null): void {
    const current = this.stateInfo();
    this.stateInfo.set({ ...current, workState: state });
    this.saveToSession();
  }

  updateStateWithholding(amount: number): void {
    const current = this.stateInfo();
    this.stateInfo.set({ ...current, stateWithholding: amount || 0 });
    this.saveToSession();
  }

  toggleSameAsResidence(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.sameAsResidence.set(checked);

    if (checked) {
      const current = this.stateInfo();
      this.stateInfo.set({ ...current, workState: current.residenceState });
      this.saveToSession();
    }
  }

  private saveToSession(): void {
    this.sessionStorage.updateStateInfo(() => this.stateInfo());
  }

  goBack(): void {
    this.navigation.navigateTo('/personal-info/dependents');
  }

  onContinue(): void {
    this.saveToSession();
    this.navigation.completeSection('personal-info');
    this.navigation.navigateTo('/income/types');
  }
}
