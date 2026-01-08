import { ChangeDetectionStrategy, Component, computed, inject, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationService, SessionStorageService, ValidationService } from '@core/services';
import { Dependent, DependentRelationship, DEPENDENT_RELATIONSHIP_LABELS } from '@core/models';
import {
  NavigationHeaderComponent,
  EducationalModalComponent,
  ContinueButtonComponent,
  ValidationMessageComponent,
} from '@shared/components';

@Component({
  selector: 'app-dependents',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NavigationHeaderComponent,
    EducationalModalComponent,
    ContinueButtonComponent,
    ValidationMessageComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-navigation-header />

    <div class="page-container">
      <div class="content-card">
        <header class="section-header">
          <h1>Do you have dependents to claim?</h1>
          <button class="help-trigger" (click)="openHelpModal()" type="button">
            <span class="help-icon">?</span>
            <span>Who qualifies?</span>
          </button>
        </header>

        <div class="initial-question" [class.hidden]="hasAnswered()">
          <div class="options" role="radiogroup" aria-label="Has dependents">
            <label class="option" [class.selected]="hasDependents() === true">
              <input
                type="radio"
                name="hasDependents"
                [checked]="hasDependents() === true"
                (change)="setHasDependents(true)"
              />
              <span class="option-label">Yes, I have dependents</span>
              <span class="check-mark">✓</span>
            </label>

            <label class="option" [class.selected]="hasDependents() === false">
              <input
                type="radio"
                name="hasDependents"
                [checked]="hasDependents() === false"
                (change)="setHasDependents(false)"
              />
              <span class="option-label">No, I don't have dependents</span>
              <span class="check-mark">✓</span>
            </label>
          </div>
        </div>

        @if (hasDependents()) {
          <div class="dependents-section">
            <h2>Your Dependents</h2>

            @for (dependent of dependents(); track dependent.id; let i = $index) {
              <div class="dependent-card">
                <div class="dependent-header">
                  <span class="dependent-number">Dependent {{ i + 1 }}</span>
                  <button
                    type="button"
                    class="remove-btn"
                    (click)="removeDependent(dependent.id)"
                    aria-label="Remove dependent"
                  >
                    Remove
                  </button>
                </div>

                <div class="dependent-form">
                  <div class="form-group">
                    <label [for]="'dep-name-' + i">First Name</label>
                    <input
                      type="text"
                      [id]="'dep-name-' + i"
                      [ngModel]="dependent.firstName"
                      (ngModelChange)="updateDependent(dependent.id, 'firstName', $event)"
                      (blur)="touchField(dependent.id, 'firstName')"
                      [class.invalid]="getFieldError(dependent.id, 'firstName')"
                      [name]="'dep-name-' + i"
                      placeholder="Enter first name"
                    />
                    <app-validation-message [error]="getFieldError(dependent.id, 'firstName')" />
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label [for]="'dep-rel-' + i">Relationship</label>
                      <select
                        [id]="'dep-rel-' + i"
                        [ngModel]="dependent.relationship"
                        (ngModelChange)="updateDependent(dependent.id, 'relationship', $event)"
                        [name]="'dep-rel-' + i"
                      >
                        @for (rel of relationships; track rel.value) {
                          <option [value]="rel.value">{{ rel.label }}</option>
                        }
                      </select>
                    </div>

                    <div class="form-group">
                      <label [for]="'dep-age-' + i">Age</label>
                      <input
                        type="number"
                        [id]="'dep-age-' + i"
                        [ngModel]="dependent.age"
                        (ngModelChange)="updateDependent(dependent.id, 'age', $event)"
                        (blur)="touchField(dependent.id, 'age')"
                        [class.invalid]="getFieldError(dependent.id, 'age')"
                        [name]="'dep-age-' + i"
                        min="0"
                        max="120"
                      />
                      <app-validation-message [error]="getFieldError(dependent.id, 'age')" />
                    </div>
                  </div>

                  <div class="form-group checkbox-group">
                    <label class="checkbox-label">
                      <input
                        type="checkbox"
                        [checked]="dependent.livedWithFiler"
                        (change)="updateDependent(dependent.id, 'livedWithFiler', $any($event.target).checked)"
                      />
                      <span>Lived with me more than half the year</span>
                    </label>
                  </div>
                </div>
              </div>
            }

            <button type="button" class="add-btn" (click)="addDependent()">
              + Add Another Dependent
            </button>
          </div>
        }

        <app-continue-button
          [disabled]="!canContinue()"
          (continue)="onContinue()"
          (back)="onBack()"
        />
      </div>
    </div>

    <app-educational-modal #helpModal [title]="'Who qualifies as a dependent?'">
      <p>
        To claim someone as a dependent, they generally must:
      </p>
      <ul>
        <li>Be your child, stepchild, foster child, sibling, or other qualifying relative</li>
        <li>Have lived with you for more than half the year (for a qualifying child)</li>
        <li>Not provide more than half of their own financial support</li>
        <li>Be under 19 (or under 24 if a full-time student) for a qualifying child</li>
      </ul>
      <p>
        <em>
          For this simulation, use the dependent information from your worksheet scenario.
        </em>
      </p>
    </app-educational-modal>
  `,
  styles: `
    .page-container {
      min-height: calc(100vh - 60px);
      padding: 2rem;
      background: var(--ngpf-gray-pale);
    }

    .content-card {
      max-width: 600px;
      margin: 0 auto;
      background: var(--ngpf-white);
      border-radius: var(--radius-lg);
      padding: 2rem;
      box-shadow: var(--shadow-md);
    }

    .section-header {
      margin-bottom: 1.5rem;

      h1 {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--ngpf-navy-dark);
        margin: 0 0 0.5rem;
      }
    }

    .help-trigger {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      background: none;
      border: none;
      color: var(--ngpf-navy-light);
      font-size: 0.875rem;
      cursor: pointer;
      padding: 0;

      &:hover {
        text-decoration: underline;
      }
    }

    .help-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.25rem;
      height: 1.25rem;
      background: var(--ngpf-navy-light);
      color: var(--ngpf-white);
      border-radius: 50%;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .hidden {
      display: none;
    }

    .options {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .option {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.25rem;
      border: 2px solid var(--ngpf-gray-light);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-fast);

      &:hover {
        border-color: var(--ngpf-gray);
      }

      &.selected {
        border-color: var(--ngpf-navy-light);
        background: var(--ngpf-blue-pale);
      }

      input[type='radio'] {
        position: absolute;
        opacity: 0;
      }
    }

    .option-label {
      flex: 1;
      font-size: 1rem;
      font-weight: 500;
    }

    .check-mark {
      width: 1.5rem;
      height: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--ngpf-navy-light);
      color: var(--ngpf-white);
      border-radius: 50%;
      opacity: 0;

      .selected & {
        opacity: 1;
      }
    }

    .dependents-section {
      margin-top: 1.5rem;

      h2 {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--ngpf-navy-dark);
        margin: 0 0 1rem;
      }
    }

    .dependent-card {
      border: 1px solid var(--ngpf-gray-light);
      border-radius: var(--radius-sm);
      padding: 1rem;
      margin-bottom: 1rem;
    }

    .dependent-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .dependent-number {
      font-weight: 600;
      color: var(--ngpf-navy-light);
    }

    .remove-btn {
      background: none;
      border: none;
      color: var(--ngpf-error);
      font-size: 0.875rem;
      cursor: pointer;

      &:hover {
        text-decoration: underline;
      }
    }

    .dependent-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;

      label {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--ngpf-gray-dark);
      }

      input, select {
        padding: 0.625rem 0.75rem;
        font-size: 1rem;
        border: 2px solid var(--ngpf-gray-light);
        border-radius: var(--radius-sm);
        font-family: inherit;

        &:focus {
          outline: none;
          border-color: var(--ngpf-navy-light);
        }

        &.invalid {
          border-color: var(--ngpf-error);

          &:focus {
            box-shadow: 0 0 0 3px rgba(211, 47, 47, 0.15);
          }
        }
      }
    }

    .checkbox-group {
      .checkbox-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;

        input[type='checkbox'] {
          width: 1.125rem;
          height: 1.125rem;
          accent-color: var(--ngpf-navy-light);
        }

        span {
          font-size: 0.9375rem;
          color: var(--ngpf-gray-dark);
        }
      }
    }

    .add-btn {
      width: 100%;
      padding: 0.875rem;
      border: 2px dashed var(--ngpf-gray-light);
      border-radius: var(--radius-sm);
      background: transparent;
      color: var(--ngpf-navy-light);
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-fast);

      &:hover {
        border-color: var(--ngpf-navy-light);
        background: var(--ngpf-blue-pale);
      }
    }
  `,
})
export class DependentsComponent {
  private readonly navigation = inject(NavigationService);
  private readonly sessionStorage = inject(SessionStorageService);
  private readonly validation = inject(ValidationService);

  readonly helpModal = viewChild.required<EducationalModalComponent>('helpModal');

  // Track touched fields per dependent: Map<dependentId, Set<fieldName>>
  private readonly touchedFields = signal<Map<string, Set<string>>>(new Map());

  readonly relationships = Object.entries(DEPENDENT_RELATIONSHIP_LABELS).map(([value, label]) => ({
    value: value as DependentRelationship,
    label,
  }));

  readonly hasDependents = computed(() => {
    return this.sessionStorage.taxReturn().personalInfo.hasDependents;
  });

  readonly dependents = computed(() => {
    return this.sessionStorage.taxReturn().personalInfo.dependents;
  });

  readonly hasAnswered = computed(() => {
    return this.hasDependents() !== false || this.dependents().length > 0;
  });

  readonly canContinue = computed(() => {
    if (this.hasDependents() === false) {
      return true;
    }
    if (this.hasDependents() === true) {
      const deps = this.dependents();
      return deps.length > 0 && deps.every((d) => this.isDependentValid(d));
    }
    return false;
  });

  private isDependentValid(dependent: Dependent): boolean {
    const nameValid = this.validation.validateRequired(dependent.firstName, 'Name').isValid;
    const ageValid = this.validation.validateAge(dependent.age).isValid;
    return nameValid && ageValid;
  }

  touchField(dependentId: string, field: string): void {
    this.touchedFields.update((map) => {
      const newMap = new Map(map);
      const fields = newMap.get(dependentId) || new Set<string>();
      newMap.set(dependentId, new Set([...fields, field]));
      return newMap;
    });
  }

  getFieldError(dependentId: string, field: string): string | null {
    const touched = this.touchedFields().get(dependentId);
    if (!touched || !touched.has(field)) return null;

    const dependent = this.dependents().find((d) => d.id === dependentId);
    if (!dependent) return null;

    if (field === 'firstName') {
      return this.validation.validateRequired(dependent.firstName, "Dependent's name").error;
    }
    if (field === 'age') {
      return this.validation.validateAge(dependent.age).error;
    }
    return null;
  }

  setHasDependents(value: boolean): void {
    this.sessionStorage.updatePersonalInfo((info) => ({
      ...info,
      hasDependents: value,
      dependents: value && info.dependents.length === 0 ? [this.createEmptyDependent()] : info.dependents,
    }));
  }

  addDependent(): void {
    this.sessionStorage.updatePersonalInfo((info) => ({
      ...info,
      dependents: [...info.dependents, this.createEmptyDependent()],
    }));
  }

  removeDependent(id: string): void {
    this.sessionStorage.updatePersonalInfo((info) => {
      const dependents = info.dependents.filter((d) => d.id !== id);
      return {
        ...info,
        dependents,
        hasDependents: dependents.length > 0,
      };
    });
  }

  updateDependent(id: string, field: keyof Dependent, value: unknown): void {
    this.sessionStorage.updatePersonalInfo((info) => ({
      ...info,
      dependents: info.dependents.map((d) =>
        d.id === id ? { ...d, [field]: value } : d
      ),
    }));
  }

  private createEmptyDependent(): Dependent {
    return {
      id: crypto.randomUUID(),
      firstName: '',
      relationship: 'child',
      age: 0,
      livedWithFiler: true,
    };
  }

  openHelpModal(): void {
    this.helpModal().open();
  }

  onContinue(): void {
    this.navigation.completeSection('personal-info');
    this.navigation.navigateTo('/income/types');
  }

  onBack(): void {
    this.navigation.navigateTo('/personal-info/dependent-status');
  }
}
