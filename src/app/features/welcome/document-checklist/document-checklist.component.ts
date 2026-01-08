import { ChangeDetectionStrategy, Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationService, SessionStorageService } from '@core/services';
import { StudentType } from '@core/models';

interface DocumentItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  requiredFor: StudentType[];
}

@Component({
  selector: 'app-document-checklist',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="checklist-page">
      <!-- Background -->
      <div class="bg-gradient"></div>
      <div class="bg-pattern"></div>

      <main class="checklist-content" [class.visible]="contentVisible()">
        <header class="checklist-header">
          <div class="header-icon">📋</div>
          <h1>Gather Your Documents</h1>
          <p class="subtitle">
            Before you start, make sure you have these documents handy.
            @if (studentType() === 'high-school') {
              As a high school student, you'll likely just need a few items.
            } @else if (studentType() === 'college') {
              As a college student, you may have additional education-related forms.
            } @else {
              As a working adult, you may have several income sources to report.
            }
          </p>
        </header>

        <div class="documents-list">
          <div class="documents-section">
            <h2>
              <span class="section-icon">📄</span>
              Income Documents
            </h2>
            <div class="document-cards">
              @for (doc of incomeDocuments(); track doc.id) {
                <div class="document-card">
                  <div class="doc-icon">{{ doc.icon }}</div>
                  <div class="doc-content">
                    <h3>{{ doc.name }}</h3>
                    <p>{{ doc.description }}</p>
                  </div>
                </div>
              }
            </div>
          </div>

          @if (educationDocuments().length > 0) {
            <div class="documents-section">
              <h2>
                <span class="section-icon">🎓</span>
                Education Documents
              </h2>
              <div class="document-cards">
                @for (doc of educationDocuments(); track doc.id) {
                  <div class="document-card">
                    <div class="doc-icon">{{ doc.icon }}</div>
                    <div class="doc-content">
                      <h3>{{ doc.name }}</h3>
                      <p>{{ doc.description }}</p>
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <div class="documents-section">
            <h2>
              <span class="section-icon">👤</span>
              Personal Information
            </h2>
            <div class="document-cards">
              @for (doc of personalDocuments; track doc.id) {
                <div class="document-card">
                  <div class="doc-icon">{{ doc.icon }}</div>
                  <div class="doc-content">
                    <h3>{{ doc.name }}</h3>
                    <p>{{ doc.description }}</p>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>

        <div class="info-box">
          <div class="info-icon">💡</div>
          <div class="info-content">
            <strong>Don't have everything?</strong>
            <p>
              That's okay! This is a simulation using fictional data from your worksheet.
              You can enter sample numbers to practice.
            </p>
          </div>
        </div>

        <div class="action-section">
          <button class="back-btn" (click)="onBack()">
            <span class="btn-arrow">←</span>
            <span>Back</span>
          </button>
          <button class="continue-btn" (click)="onContinue()">
            <span>I'm Ready to Start</span>
            <span class="btn-arrow">→</span>
          </button>
        </div>
      </main>
    </div>
  `,
  styles: `
    .checklist-page {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
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

    .checklist-content {
      position: relative;
      z-index: 10;
      max-width: 700px;
      width: 100%;
      opacity: 0;
      transform: translateY(30px);
      transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      padding: 2rem 0;

      &.visible {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .checklist-header {
      text-align: center;
      margin-bottom: 2.5rem;

      .header-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
      }

      h1 {
        font-family: var(--font-heading);
        font-size: clamp(1.75rem, 5vw, 2.25rem);
        font-weight: 700;
        color: white;
        margin: 0 0 1rem;
      }

      .subtitle {
        font-size: 1.0625rem;
        color: rgba(255, 255, 255, 0.6);
        max-width: 500px;
        margin: 0 auto;
        line-height: 1.5;
      }
    }

    .documents-list {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .documents-section {
      h2 {
        display: flex;
        align-items: center;
        gap: 0.625rem;
        font-size: 1.125rem;
        font-weight: 600;
        color: white;
        margin: 0 0 1rem;

        .section-icon {
          font-size: 1.25rem;
        }
      }
    }

    .document-cards {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .document-card {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem 1.25rem;
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.05);
        border-color: rgba(255, 255, 255, 0.12);
      }

      .doc-icon {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        font-size: 1.25rem;
        flex-shrink: 0;
      }

      .doc-content {
        flex: 1;

        h3 {
          font-size: 0.9375rem;
          font-weight: 600;
          color: white;
          margin: 0 0 0.25rem;
        }

        p {
          font-size: 0.8125rem;
          color: rgba(255, 255, 255, 0.5);
          margin: 0;
          line-height: 1.4;
        }
      }
    }

    .info-box {
      display: flex;
      gap: 1rem;
      padding: 1.25rem;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.2);
      border-radius: 12px;
      margin-bottom: 2rem;

      .info-icon {
        font-size: 1.5rem;
        flex-shrink: 0;
      }

      .info-content {
        strong {
          display: block;
          color: #10b981;
          font-size: 0.9375rem;
          margin-bottom: 0.25rem;
        }

        p {
          font-size: 0.875rem;
          color: rgba(16, 185, 129, 0.8);
          margin: 0;
          line-height: 1.5;
        }
      }
    }

    .action-section {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }

    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.05);
      color: rgba(255, 255, 255, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 100px;
      padding: 0.875rem 1.5rem;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        color: white;
      }

      .btn-arrow {
        transition: transform 0.3s ease;
      }

      &:hover .btn-arrow {
        transform: translateX(-4px);
      }
    }

    .continue-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      background: linear-gradient(135deg, #f4ad00 0%, #ff8c00 100%);
      color: #0b1541;
      border: none;
      border-radius: 100px;
      padding: 0.875rem 1.75rem;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 4px 20px rgba(244, 173, 0, 0.3);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 30px rgba(244, 173, 0, 0.4);
      }

      &:focus-visible {
        outline: 3px solid rgba(244, 173, 0, 0.5);
        outline-offset: 4px;
      }

      .btn-arrow {
        font-size: 1.125rem;
        transition: transform 0.3s ease;
      }

      &:hover .btn-arrow {
        transform: translateX(4px);
      }
    }

    @media (max-width: 600px) {
      .checklist-page {
        padding: 1.5rem;
      }

      .checklist-content {
        padding: 1rem 0;
      }

      .document-card {
        padding: 1rem;
      }

      .action-section {
        flex-direction: column;
      }

      .back-btn,
      .continue-btn {
        width: 100%;
        justify-content: center;
      }
    }
  `,
})
export class DocumentChecklistComponent implements OnInit {
  private readonly navigation = inject(NavigationService);
  private readonly sessionStorage = inject(SessionStorageService);

  contentVisible = signal(false);

  private readonly allIncomeDocuments: DocumentItem[] = [
    {
      id: 'w2',
      name: 'W-2 Form',
      description: 'From each employer you worked for (Box 1 shows wages, Box 2 shows taxes withheld)',
      icon: '📑',
      requiredFor: ['high-school', 'college', 'working-adult'],
    },
    {
      id: '1099-nec',
      name: '1099-NEC Form',
      description: 'For freelance/gig work over $600 (DoorDash, Uber, freelancing)',
      icon: '📄',
      requiredFor: ['high-school', 'college', 'working-adult'],
    },
    {
      id: '1099-int',
      name: '1099-INT Form',
      description: 'From your bank showing interest earned on savings accounts',
      icon: '🏦',
      requiredFor: ['high-school', 'college', 'working-adult'],
    },
    {
      id: '1099-div',
      name: '1099-DIV Form',
      description: 'From investment accounts showing dividends received',
      icon: '📈',
      requiredFor: ['college', 'working-adult'],
    },
    {
      id: '1099-k',
      name: '1099-K Form',
      description: 'From payment apps (Venmo, PayPal) for business transactions over $600',
      icon: '💳',
      requiredFor: ['college', 'working-adult'],
    },
  ];

  private readonly allEducationDocuments: DocumentItem[] = [
    {
      id: '1098-t',
      name: '1098-T Form',
      description: 'From your school showing tuition paid and scholarships received',
      icon: '🎓',
      requiredFor: ['college'],
    },
    {
      id: '1098-e',
      name: '1098-E Form',
      description: 'From your loan servicer showing student loan interest paid',
      icon: '📚',
      requiredFor: ['college', 'working-adult'],
    },
    {
      id: 'scholarship',
      name: 'Scholarship Letters',
      description: 'Award letters showing scholarship and grant amounts',
      icon: '🏆',
      requiredFor: ['college'],
    },
  ];

  readonly personalDocuments: DocumentItem[] = [
    {
      id: 'ssn',
      name: 'Social Security Number',
      description: 'Your SSN for identification (for this simulation, you can use a sample)',
      icon: '🆔',
      requiredFor: ['high-school', 'college', 'working-adult'],
    },
    {
      id: 'bank',
      name: 'Bank Account Info',
      description: 'For direct deposit of your refund (routing and account numbers)',
      icon: '🏧',
      requiredFor: ['high-school', 'college', 'working-adult'],
    },
  ];

  readonly studentType = computed(() => {
    return this.sessionStorage.taxReturn().personalInfo.studentProfile.studentType;
  });

  readonly incomeDocuments = computed(() => {
    const type = this.studentType();
    return this.allIncomeDocuments.filter((doc) => doc.requiredFor.includes(type));
  });

  readonly educationDocuments = computed(() => {
    const type = this.studentType();
    return this.allEducationDocuments.filter((doc) => doc.requiredFor.includes(type));
  });

  ngOnInit(): void {
    setTimeout(() => this.contentVisible.set(true), 100);
  }

  onBack(): void {
    this.navigation.navigateTo('/welcome/profile');
  }

  onContinue(): void {
    this.navigation.completeSection('welcome');
    this.navigation.navigateTo('/personal-info/filing-status');
  }
}
