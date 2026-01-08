import { ChangeDetectionStrategy, Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationService, SessionStorageService, ValidationService } from '@core/services';
import {
  NavigationHeaderComponent,
  ContinueButtonComponent,
  ValidationMessageComponent,
} from '@shared/components';

@Component({
  selector: 'app-basic-info',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NavigationHeaderComponent,
    ContinueButtonComponent,
    ValidationMessageComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-navigation-header />

    <div class="page-container">
      <div class="content-wrapper" [class.visible]="isVisible()">
        <header class="page-header">
          <h1>Let's get some basic information</h1>
          <div class="simulation-badge">
            <svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
            <span>Use the fictional info from your worksheet</span>
          </div>
        </header>

        <form class="form-card" (ngSubmit)="onContinue()">
          <div class="form-row">
            <div class="form-group">
              <label for="firstName">
                <span class="label-text">First Name</span>
              </label>
              <div class="input-wrapper">
                <input
                  type="text"
                  id="firstName"
                  [ngModel]="firstName()"
                  (ngModelChange)="updateFirstName($event)"
                  (blur)="touchField('firstName')"
                  [class.invalid]="firstNameError()"
                  [class.valid]="firstName() && !firstNameError()"
                  name="firstName"
                  placeholder="Enter first name"
                  autocomplete="given-name"
                />
                @if (firstName() && !firstNameError()) {
                  <div class="input-check">
                    <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                  </div>
                }
              </div>
              <app-validation-message [error]="firstNameError()" />
            </div>

            <div class="form-group">
              <label for="lastName">
                <span class="label-text">Last Name</span>
              </label>
              <div class="input-wrapper">
                <input
                  type="text"
                  id="lastName"
                  [ngModel]="lastName()"
                  (ngModelChange)="updateLastName($event)"
                  (blur)="touchField('lastName')"
                  [class.invalid]="lastNameError()"
                  [class.valid]="lastName() && !lastNameError()"
                  name="lastName"
                  placeholder="Enter last name"
                  autocomplete="family-name"
                />
                @if (lastName() && !lastNameError()) {
                  <div class="input-check">
                    <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                  </div>
                }
              </div>
              <app-validation-message [error]="lastNameError()" />
            </div>
          </div>

          <div class="form-group">
            <label for="dateOfBirth">
              <span class="label-text">Date of Birth</span>
            </label>
            <div class="input-wrapper">
              <input
                type="date"
                id="dateOfBirth"
                [ngModel]="dateOfBirth()"
                (ngModelChange)="updateDateOfBirth($event)"
                (blur)="touchField('dateOfBirth')"
                [class.invalid]="dateOfBirthError()"
                [class.valid]="dateOfBirth() && !dateOfBirthError()"
                name="dateOfBirth"
                [max]="maxDate"
              />
              @if (dateOfBirth() && !dateOfBirthError()) {
                <div class="input-check">
                  <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                </div>
              }
            </div>
            <app-validation-message [error]="dateOfBirthError()" />
          </div>

          <app-continue-button
            [disabled]="!isValid()"
            (continue)="onContinue()"
            (back)="onBack()"
          />
        </form>
      </div>
    </div>
  `,
  styles: `
    .page-container {
      min-height: calc(100vh - 64px);
      padding: 2rem;
      background: linear-gradient(180deg, #f0f4f8 0%, #e2e8f0 100%);
    }

    .content-wrapper {
      max-width: 600px;
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
      margin-bottom: 2rem;

      h1 {
        font-family: var(--font-heading);
        font-size: 2rem;
        font-weight: 700;
        color: var(--ngpf-navy);
        margin: 0 0 1rem;
      }
    }

    .simulation-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: linear-gradient(135deg, rgba(244, 173, 0, 0.12), rgba(255, 140, 0, 0.08));
      border: 1px solid rgba(244, 173, 0, 0.2);
      color: #92400e;
      padding: 0.625rem 1rem;
      border-radius: 12px;
      font-size: 0.875rem;
      font-weight: 500;

      svg {
        width: 18px;
        height: 18px;
        fill: #f59e0b;
      }
    }

    .form-card {
      background: white;
      border-radius: 20px;
      padding: 2rem;
      box-shadow:
        0 1px 3px rgba(0, 0, 0, 0.04),
        0 8px 24px rgba(0, 0, 0, 0.06);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
      margin-bottom: 1.25rem;

      @media (max-width: 520px) {
        grid-template-columns: 1fr;
      }
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1.25rem;

      &:last-of-type {
        margin-bottom: 0;
      }
    }

    label {
      display: block;
    }

    .label-text {
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--ngpf-navy);
    }

    .input-wrapper {
      position: relative;
    }

    input {
      width: 100%;
      padding: 0.875rem 1rem;
      padding-right: 2.75rem;
      font-size: 1rem;
      font-family: var(--font-body);
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      background: #f8fafc;
      color: var(--ngpf-navy);
      transition: all 0.2s ease;

      &::placeholder {
        color: #94a3b8;
      }

      &:hover:not(:disabled) {
        border-color: #cbd5e1;
      }

      &:focus {
        outline: none;
        border-color: var(--ngpf-bright-blue);
        background: white;
        box-shadow: 0 0 0 4px rgba(39, 92, 228, 0.1);
      }

      &.valid {
        border-color: var(--ngpf-success);
        background: rgba(16, 185, 129, 0.03);

        &:focus {
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
        }
      }

      &.invalid {
        border-color: var(--ngpf-error);
        background: rgba(239, 68, 68, 0.03);

        &:focus {
          box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
        }
      }
    }

    input[type='date'] {
      cursor: pointer;
    }

    .input-check {
      position: absolute;
      right: 0.875rem;
      top: 50%;
      transform: translateY(-50%);
      width: 22px;
      height: 22px;
      background: var(--ngpf-success);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

      svg {
        width: 14px;
        height: 14px;
        fill: white;
      }
    }

    @keyframes popIn {
      from {
        transform: translateY(-50%) scale(0);
      }
      to {
        transform: translateY(-50%) scale(1);
      }
    }

    @media (max-width: 520px) {
      .page-container {
        padding: 1.25rem;
      }

      .form-card {
        padding: 1.5rem;
        border-radius: 16px;
      }

      .page-header h1 {
        font-size: 1.5rem;
      }
    }
  `,
})
export class BasicInfoComponent implements OnInit {
  private readonly navigation = inject(NavigationService);
  private readonly sessionStorage = inject(SessionStorageService);
  private readonly validation = inject(ValidationService);

  readonly maxDate = new Date().toISOString().split('T')[0];
  readonly isVisible = signal(false);

  // Track which fields have been touched (blurred)
  private readonly touchedFields = signal<Set<string>>(new Set());

  readonly firstName = computed(() => this.sessionStorage.taxReturn().personalInfo.firstName);
  readonly lastName = computed(() => this.sessionStorage.taxReturn().personalInfo.lastName);
  readonly dateOfBirth = computed(() => this.sessionStorage.taxReturn().personalInfo.dateOfBirth);

  // Validation error signals - only show errors after field is touched
  readonly firstNameError = computed(() => {
    if (!this.touchedFields().has('firstName')) return null;
    return this.validation.validateRequired(this.firstName(), 'First name').error;
  });

  readonly lastNameError = computed(() => {
    if (!this.touchedFields().has('lastName')) return null;
    return this.validation.validateRequired(this.lastName(), 'Last name').error;
  });

  readonly dateOfBirthError = computed(() => {
    if (!this.touchedFields().has('dateOfBirth')) return null;
    return this.validation.validateDateNotFuture(this.dateOfBirth(), 'Date of birth').error;
  });

  readonly isValid = computed(() => {
    const firstValid = this.validation.validateRequired(this.firstName(), 'First name').isValid;
    const lastValid = this.validation.validateRequired(this.lastName(), 'Last name').isValid;
    const dobValid = this.validation.validateDateNotFuture(this.dateOfBirth(), 'Date of birth').isValid;
    return firstValid && lastValid && dobValid;
  });

  ngOnInit(): void {
    setTimeout(() => this.isVisible.set(true), 50);
  }

  touchField(field: string): void {
    this.touchedFields.update((fields) => new Set([...fields, field]));
  }

  updateFirstName(value: string): void {
    this.sessionStorage.updatePersonalInfo((info) => ({
      ...info,
      firstName: value,
    }));
  }

  updateLastName(value: string): void {
    this.sessionStorage.updatePersonalInfo((info) => ({
      ...info,
      lastName: value,
    }));
  }

  updateDateOfBirth(value: string): void {
    this.sessionStorage.updatePersonalInfo((info) => ({
      ...info,
      dateOfBirth: value,
    }));
  }

  onContinue(): void {
    if (this.isValid()) {
      this.navigation.navigateTo('/personal-info/dependent-status');
    }
  }

  onBack(): void {
    this.navigation.navigateTo('/personal-info/filing-status');
  }
}
