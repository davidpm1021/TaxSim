import { ChangeDetectionStrategy, Component, computed, inject, signal, viewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationService, SessionStorageService, TaxDataService } from '@core/services';
import { FilingStatus } from '@core/models';
import {
  NavigationHeaderComponent,
  EducationalModalComponent,
  ContinueButtonComponent,
} from '@shared/components';

@Component({
  selector: 'app-filing-status',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NavigationHeaderComponent,
    EducationalModalComponent,
    ContinueButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-navigation-header />

    <div class="page-container">
      <div class="content-wrapper" [class.visible]="isVisible()">
        <header class="page-header">
          <div class="header-badge">Step 1 of 6</div>
          <h1>What's your filing status?</h1>
          <p class="header-subtitle">
            This determines your tax brackets and standard deduction amount
          </p>
        </header>

        <div class="filing-options" role="radiogroup" aria-label="Filing status options">
          @for (option of filingOptions(); track option.value; let i = $index) {
            <button
              type="button"
              class="filing-card"
              [class.selected]="selectedStatus() === option.value"
              [style.animation-delay.ms]="i * 100"
              (click)="selectStatus(option.value)"
              [attr.aria-pressed]="selectedStatus() === option.value"
            >
              <div class="card-icon">
                @switch (option.value) {
                  @case ('single') {
                    <svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                  }
                  @case ('married-jointly') {
                    <svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
                  }
                  @case ('head-of-household') {
                    <svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                  }
                }
              </div>

              <div class="card-content">
                <span class="card-label">{{ option.label }}</span>
                <span class="card-description">
                  @switch (option.value) {
                    @case ('single') { Unmarried or legally separated }
                    @case ('married-jointly') { Married, filing together }
                    @case ('head-of-household') { Unmarried with dependents }
                  }
                </span>
              </div>

              <div class="card-deduction">
                <span class="deduction-label">Standard Deduction</span>
                <span class="deduction-amount">{{ formatCurrency(option.standardDeduction) }}</span>
              </div>

              <div class="card-check">
                <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
              </div>
            </button>
          }
        </div>

        <button class="help-link" (click)="openHelpModal()" type="button">
          <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>
          <span>Not sure which to choose?</span>
        </button>

        <app-continue-button
          [disabled]="!selectedStatus()"
          [showBack]="false"
          (continue)="onContinue()"
        />
      </div>
    </div>

    <app-educational-modal #helpModal [title]="'How do I choose my filing status?'">
      <p>
        <strong>Single</strong> — You're unmarried, divorced, or legally separated on December 31st
        of the tax year.
      </p>
      <p>
        <strong>Married Filing Jointly</strong> — You're married and want to file one return together
        with your spouse. This usually results in the lowest tax.
      </p>
      <p>
        <strong>Head of Household</strong> — You're unmarried, paid more than half the cost of
        keeping up a home, and have a qualifying dependent living with you.
      </p>
      <p>
        <em>
          For this simulation, choose the status that matches your fictional scenario from the
          worksheet.
        </em>
      </p>
    </app-educational-modal>
  `,
  styles: `
    .page-container {
      min-height: calc(100vh - 64px);
      padding: 2rem;
      background: linear-gradient(180deg, #f0f4f8 0%, #e2e8f0 100%);
    }

    .content-wrapper {
      max-width: 700px;
      margin: 0 auto;
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);

      &.visible {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .page-header {
      text-align: center;
      margin-bottom: 2.5rem;
    }

    .header-badge {
      display: inline-block;
      background: linear-gradient(135deg, rgba(244, 173, 0, 0.15), rgba(255, 140, 0, 0.1));
      color: #b45309;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 0.375rem 0.875rem;
      border-radius: 100px;
      margin-bottom: 1rem;
    }

    .page-header h1 {
      font-family: var(--font-heading);
      font-size: 2rem;
      font-weight: 700;
      color: var(--ngpf-navy);
      margin: 0 0 0.5rem;
    }

    .header-subtitle {
      font-size: 1rem;
      color: #64748b;
      margin: 0;
    }

    .filing-options {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .filing-card {
      display: grid;
      grid-template-columns: 56px 1fr auto auto;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem 1.5rem;
      background: white;
      border: 2px solid transparent;
      border-radius: 16px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow:
        0 1px 3px rgba(0, 0, 0, 0.04),
        0 4px 12px rgba(0, 0, 0, 0.03);
      text-align: left;
      animation: slideIn 0.5s ease forwards;
      opacity: 0;

      &:hover {
        transform: translateY(-2px);
        box-shadow:
          0 4px 12px rgba(0, 0, 0, 0.08),
          0 8px 24px rgba(0, 0, 0, 0.04);
      }

      &.selected {
        border-color: var(--ngpf-bright-blue);
        background: linear-gradient(135deg, rgba(39, 92, 228, 0.03), rgba(29, 184, 232, 0.02));
        box-shadow:
          0 0 0 4px rgba(39, 92, 228, 0.1),
          0 4px 12px rgba(39, 92, 228, 0.15);
      }

      &:focus-visible {
        outline: 3px solid rgba(244, 173, 0, 0.5);
        outline-offset: 2px;
      }
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .card-icon {
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f0f4f8, #e2e8f0);
      border-radius: 14px;
      transition: all 0.3s ease;

      svg {
        width: 28px;
        height: 28px;
        fill: #64748b;
        transition: fill 0.3s ease;
      }

      .selected & {
        background: linear-gradient(135deg, var(--ngpf-bright-blue), #1d4ed8);

        svg {
          fill: white;
        }
      }
    }

    .card-content {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .card-label {
      font-size: 1.0625rem;
      font-weight: 600;
      color: var(--ngpf-navy);
    }

    .card-description {
      font-size: 0.875rem;
      color: #64748b;
    }

    .card-deduction {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.125rem;
    }

    .deduction-label {
      font-size: 0.6875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      color: #94a3b8;
    }

    .deduction-amount {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--ngpf-success);
    }

    .card-check {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--ngpf-success);
      border-radius: 50%;
      opacity: 0;
      transform: scale(0.5);
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

      svg {
        width: 16px;
        height: 16px;
        fill: white;
      }

      .selected & {
        opacity: 1;
        transform: scale(1);
      }
    }

    .help-link {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      padding: 0.75rem;
      background: transparent;
      border: none;
      color: var(--ngpf-bright-blue);
      font-size: 0.9375rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;

      svg {
        width: 20px;
        height: 20px;
        fill: currentColor;
      }

      &:hover {
        color: var(--ngpf-royal-blue);
      }

      &:focus-visible {
        outline: 2px solid var(--ngpf-bright-blue);
        outline-offset: 2px;
        border-radius: 8px;
      }
    }

    @media (max-width: 640px) {
      .page-container {
        padding: 1.25rem;
      }

      .filing-card {
        grid-template-columns: 48px 1fr auto;
        gap: 0.875rem;
        padding: 1rem 1.25rem;
      }

      .card-icon {
        width: 48px;
        height: 48px;

        svg {
          width: 24px;
          height: 24px;
        }
      }

      .card-deduction {
        display: none;
      }

      .card-check {
        width: 24px;
        height: 24px;

        svg {
          width: 14px;
          height: 14px;
        }
      }
    }
  `,
})
export class FilingStatusComponent implements OnInit {
  private readonly navigation = inject(NavigationService);
  private readonly sessionStorage = inject(SessionStorageService);
  private readonly taxData = inject(TaxDataService);

  readonly helpModal = viewChild.required<EducationalModalComponent>('helpModal');

  readonly isVisible = signal(false);
  readonly filingOptions = computed(() => this.taxData.getFilingStatusOptions());

  readonly selectedStatus = computed(() => {
    return this.sessionStorage.taxReturn().personalInfo.filingStatus;
  });

  ngOnInit(): void {
    setTimeout(() => this.isVisible.set(true), 50);
  }

  formatCurrency(amount: number): string {
    return this.taxData.formatCurrency(amount);
  }

  openHelpModal(): void {
    this.helpModal().open();
  }

  selectStatus(status: FilingStatus): void {
    this.sessionStorage.updatePersonalInfo((info) => ({
      ...info,
      filingStatus: status,
    }));
  }

  onContinue(): void {
    this.navigation.navigateTo('/personal-info/basic-info');
  }
}
