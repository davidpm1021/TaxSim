import { ChangeDetectionStrategy, Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationService, SessionStorageService } from '@core/services';
import {
  StudentType,
  STUDENT_TYPE_LABELS,
  STUDENT_TYPE_DESCRIPTIONS,
} from '@core/models';

interface StudentOption {
  type: StudentType;
  label: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="profile-page">
      <!-- Background -->
      <div class="bg-gradient"></div>
      <div class="bg-pattern"></div>

      <main class="profile-content" [class.visible]="contentVisible()">
        <header class="profile-header">
          <h1>Tell us about yourself</h1>
          <p class="subtitle">
            This helps us customize your tax filing experience and show you relevant information.
          </p>
        </header>

        <div class="options-grid">
          @for (option of studentOptions; track option.type) {
            <button
              class="option-card"
              [class.selected]="selectedType() === option.type"
              (click)="selectType(option.type)"
              type="button"
            >
              <div class="option-icon">{{ option.icon }}</div>
              <div class="option-content">
                <h3>{{ option.label }}</h3>
                <p>{{ option.description }}</p>
              </div>
              <div class="check-indicator">
                @if (selectedType() === option.type) {
                  <span class="check">✓</span>
                }
              </div>
            </button>
          }
        </div>

        <div class="action-section">
          <button
            class="continue-btn"
            [disabled]="!selectedType()"
            (click)="onContinue()"
          >
            <span>Continue</span>
            <span class="btn-arrow">→</span>
          </button>
        </div>
      </main>
    </div>
  `,
  styles: `
    .profile-page {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      padding: 2rem;
    }

    .bg-gradient {
      position: fixed;
      inset: 0;
      background:
        radial-gradient(ellipse at 20% 20%, rgba(31, 59, 155, 0.15) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 80%, rgba(29, 184, 232, 0.1) 0%, transparent 50%),
        linear-gradient(135deg, #0a0f1c 0%, #0b1541 50%, #1a1f3a 100%);
      z-index: 0;
    }

    .bg-pattern {
      position: fixed;
      inset: 0;
      background-image:
        radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px);
      background-size: 40px 40px;
      z-index: 1;
    }

    .profile-content {
      position: relative;
      z-index: 10;
      max-width: 700px;
      width: 100%;
      opacity: 0;
      transform: translateY(30px);
      transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);

      &.visible {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .profile-header {
      text-align: center;
      margin-bottom: 2.5rem;

      h1 {
        font-family: var(--font-heading);
        font-size: clamp(1.75rem, 5vw, 2.5rem);
        font-weight: 700;
        color: white;
        margin: 0 0 1rem;
      }

      .subtitle {
        font-size: 1.125rem;
        color: rgba(255, 255, 255, 0.6);
        max-width: 500px;
        margin: 0 auto;
        line-height: 1.5;
      }
    }

    .options-grid {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .option-card {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 1.5rem;
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(10px);
      border: 2px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      text-align: left;
      width: 100%;

      &:hover {
        background: rgba(255, 255, 255, 0.06);
        border-color: rgba(255, 255, 255, 0.15);
        transform: translateY(-2px);
      }

      &.selected {
        background: rgba(244, 173, 0, 0.1);
        border-color: rgba(244, 173, 0, 0.5);
        box-shadow: 0 0 20px rgba(244, 173, 0, 0.15);

        .option-icon {
          background: rgba(244, 173, 0, 0.2);
        }

        h3 {
          color: #f4ad00;
        }
      }

      &:focus-visible {
        outline: 3px solid rgba(244, 173, 0, 0.5);
        outline-offset: 2px;
      }
    }

    .option-icon {
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      font-size: 1.75rem;
      flex-shrink: 0;
      transition: background 0.3s ease;
    }

    .option-content {
      flex: 1;

      h3 {
        font-size: 1.125rem;
        font-weight: 600;
        color: white;
        margin: 0 0 0.375rem;
        transition: color 0.3s ease;
      }

      p {
        font-size: 0.9375rem;
        color: rgba(255, 255, 255, 0.5);
        margin: 0;
        line-height: 1.4;
      }
    }

    .check-indicator {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      .check {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f4ad00;
        color: #0b1541;
        border-radius: 50%;
        font-size: 1rem;
        font-weight: 700;
        animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
    }

    @keyframes popIn {
      from {
        transform: scale(0);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }

    .action-section {
      text-align: center;
    }

    .continue-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      background: linear-gradient(135deg, #f4ad00 0%, #ff8c00 100%);
      color: #0b1541;
      border: none;
      border-radius: 100px;
      padding: 1rem 2rem;
      font-size: 1.0625rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 4px 20px rgba(244, 173, 0, 0.3);

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 30px rgba(244, 173, 0, 0.4);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
      }

      &:focus-visible {
        outline: 3px solid rgba(244, 173, 0, 0.5);
        outline-offset: 4px;
      }

      .btn-arrow {
        font-size: 1.25rem;
        transition: transform 0.3s ease;
      }

      &:hover:not(:disabled) .btn-arrow {
        transform: translateX(4px);
      }
    }

    @media (max-width: 600px) {
      .profile-page {
        padding: 1.5rem;
      }

      .option-card {
        padding: 1.25rem;
      }

      .option-icon {
        width: 48px;
        height: 48px;
        font-size: 1.5rem;
      }

      .option-content h3 {
        font-size: 1rem;
      }

      .option-content p {
        font-size: 0.875rem;
      }

      .continue-btn {
        width: 100%;
        justify-content: center;
      }
    }
  `,
})
export class StudentProfileComponent implements OnInit {
  private readonly navigation = inject(NavigationService);
  private readonly sessionStorage = inject(SessionStorageService);

  contentVisible = signal(false);

  readonly studentOptions: StudentOption[] = [
    {
      type: 'high-school',
      label: STUDENT_TYPE_LABELS['high-school'],
      description: STUDENT_TYPE_DESCRIPTIONS['high-school'],
      icon: '🎒',
    },
    {
      type: 'college',
      label: STUDENT_TYPE_LABELS['college'],
      description: STUDENT_TYPE_DESCRIPTIONS['college'],
      icon: '🎓',
    },
    {
      type: 'working-adult',
      label: STUDENT_TYPE_LABELS['working-adult'],
      description: STUDENT_TYPE_DESCRIPTIONS['working-adult'],
      icon: '💼',
    },
  ];

  readonly selectedType = computed(() => {
    const profile = this.sessionStorage.taxReturn().personalInfo.studentProfile;
    // Check if it's been explicitly set (not just default)
    if (profile.studentType) {
      return profile.studentType;
    }
    return null;
  });

  ngOnInit(): void {
    setTimeout(() => this.contentVisible.set(true), 100);
  }

  selectType(type: StudentType): void {
    this.sessionStorage.updatePersonalInfo((info) => ({
      ...info,
      studentProfile: {
        ...info.studentProfile,
        studentType: type,
        isInCollege: type === 'college',
        hasStudentLoans: type === 'college' || type === 'working-adult',
      },
    }));
  }

  onContinue(): void {
    this.navigation.navigateTo('/welcome/documents');
  }
}
