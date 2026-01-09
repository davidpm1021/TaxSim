import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface TaxDeadline {
  date: string;
  month: string;
  day: number;
  title: string;
  description: string;
  category: 'forms' | 'filing' | 'estimated' | 'other';
  importantFor: string[];
}

const TAX_DEADLINES: TaxDeadline[] = [
  {
    date: 'January 15',
    month: 'January',
    day: 15,
    title: 'Q4 Estimated Tax Due',
    description: 'Final quarterly estimated tax payment for the previous year. This covers income earned September through December.',
    category: 'estimated',
    importantFor: ['Self-employed', 'Gig workers', '1099 income'],
  },
  {
    date: 'January 31',
    month: 'January',
    day: 31,
    title: 'W-2 Deadline',
    description: 'Employers must send W-2 forms to employees. If you worked a job, watch for this in the mail or your employer\'s portal.',
    category: 'forms',
    importantFor: ['All employees', 'W-2 workers'],
  },
  {
    date: 'February 15',
    month: 'February',
    day: 15,
    title: '1099 Deadline',
    description: 'Companies must send 1099 forms for freelance work, gig income, bank interest, and investment dividends.',
    category: 'forms',
    importantFor: ['Gig workers', 'Freelancers', 'Investors'],
  },
  {
    date: 'April 15',
    month: 'April',
    day: 15,
    title: 'Tax Filing Deadline',
    description: 'The main deadline to file your federal tax return. This is also when Q1 estimated taxes are due for the current year.',
    category: 'filing',
    importantFor: ['Everyone who files taxes'],
  },
  {
    date: 'June 15',
    month: 'June',
    day: 15,
    title: 'Q2 Estimated Tax Due',
    description: 'Second quarterly estimated tax payment. Covers income earned April through May.',
    category: 'estimated',
    importantFor: ['Self-employed', 'Gig workers', '1099 income'],
  },
  {
    date: 'September 15',
    month: 'September',
    day: 15,
    title: 'Q3 Estimated Tax Due',
    description: 'Third quarterly estimated tax payment. Covers income earned June through August.',
    category: 'estimated',
    importantFor: ['Self-employed', 'Gig workers', '1099 income'],
  },
  {
    date: 'October 15',
    month: 'October',
    day: 15,
    title: 'Extended Filing Deadline',
    description: 'If you filed for an extension in April, this is the final deadline to submit your tax return.',
    category: 'filing',
    importantFor: ['Those who filed extensions'],
  },
];

@Component({
  selector: 'app-tax-calendar',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="calendar-page">
      <div class="calendar-container">
        <header class="calendar-header">
          <h1>Tax Calendar</h1>
          <p class="subtitle">Important deadlines every taxpayer should know</p>
        </header>

        <div class="filter-section">
          <span class="filter-label">Show:</span>
          <div class="filter-buttons">
            <button
              class="filter-btn"
              [class.active]="activeFilter() === 'all'"
              (click)="activeFilter.set('all')"
              type="button"
            >
              All Dates
            </button>
            <button
              class="filter-btn"
              [class.active]="activeFilter() === 'forms'"
              (click)="activeFilter.set('forms')"
              type="button"
            >
              Tax Forms
            </button>
            <button
              class="filter-btn"
              [class.active]="activeFilter() === 'filing'"
              (click)="activeFilter.set('filing')"
              type="button"
            >
              Filing
            </button>
            <button
              class="filter-btn"
              [class.active]="activeFilter() === 'estimated'"
              (click)="activeFilter.set('estimated')"
              type="button"
            >
              Estimated Taxes
            </button>
          </div>
        </div>

        <div class="timeline">
          @for (deadline of filteredDeadlines(); track deadline.date) {
            <div class="timeline-item" [class]="deadline.category">
              <div class="date-badge">
                <span class="month">{{ getShortMonth(deadline.month) }}</span>
                <span class="day">{{ deadline.day }}</span>
              </div>

              <div class="deadline-content">
                <div class="deadline-header">
                  <h3>{{ deadline.title }}</h3>
                  <span class="category-badge" [class]="deadline.category">
                    {{ getCategoryLabel(deadline.category) }}
                  </span>
                </div>
                <p class="description">{{ deadline.description }}</p>
                <div class="important-for">
                  <span class="label">Important for:</span>
                  @for (group of deadline.importantFor; track group) {
                    <span class="tag">{{ group }}</span>
                  }
                </div>
              </div>
            </div>
          }
        </div>

        <div class="tips-section">
          <h2>Tips for Students</h2>
          <div class="tips-grid">
            <div class="tip-card">
              <span class="tip-icon">📬</span>
              <h4>Watch Your Mail</h4>
              <p>W-2s and 1099s arrive January-February. Don't throw them away!</p>
            </div>
            <div class="tip-card">
              <span class="tip-icon">📱</span>
              <h4>Set Reminders</h4>
              <p>Add April 15 to your calendar now so you don't forget to file.</p>
            </div>
            <div class="tip-card">
              <span class="tip-icon">💰</span>
              <h4>File Early</h4>
              <p>If you're getting a refund, file as soon as you have all forms.</p>
            </div>
            <div class="tip-card">
              <span class="tip-icon">📝</span>
              <h4>Gig Workers</h4>
              <p>If you do gig work, you may need to pay quarterly estimated taxes.</p>
            </div>
          </div>
        </div>

        <div class="action-buttons">
          <button class="btn-secondary" (click)="goBack()" type="button">
            Back to Simulation
          </button>
        </div>
      </div>
    </div>
  `,
  styles: `
    .calendar-page {
      min-height: 100vh;
      background: linear-gradient(135deg, var(--ngpf-blue-pale) 0%, var(--ngpf-white) 100%);
      padding: 2rem;
    }

    .calendar-container {
      max-width: 800px;
      margin: 0 auto;
    }

    .calendar-header {
      text-align: center;
      margin-bottom: 2rem;

      h1 {
        font-size: 2rem;
        font-weight: 700;
        color: var(--ngpf-navy-dark);
        margin: 0 0 0.5rem;
      }

      .subtitle {
        font-size: 1.125rem;
        color: var(--ngpf-gray);
        margin: 0;
      }
    }

    .filter-section {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;

      .filter-label {
        font-weight: 500;
        color: var(--ngpf-gray-dark);
      }
    }

    .filter-buttons {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .filter-btn {
      padding: 0.5rem 1rem;
      background: var(--ngpf-white);
      border: 1px solid var(--ngpf-gray-light);
      border-radius: var(--radius-sm);
      font-size: 0.875rem;
      color: var(--ngpf-gray-dark);
      cursor: pointer;
      transition: all var(--transition-fast);

      &:hover {
        border-color: var(--ngpf-navy-light);
        color: var(--ngpf-navy-light);
      }

      &.active {
        background: var(--ngpf-navy-light);
        border-color: var(--ngpf-navy-light);
        color: var(--ngpf-white);
      }
    }

    .timeline {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .timeline-item {
      display: flex;
      gap: 1rem;
      background: var(--ngpf-white);
      border-radius: var(--radius-lg);
      padding: 1.25rem;
      box-shadow: var(--shadow-sm);
      border-left: 4px solid var(--ngpf-gray-light);
      transition: all var(--transition-fast);

      &.forms {
        border-left-color: var(--ngpf-teal);
      }

      &.filing {
        border-left-color: var(--ngpf-orange);
      }

      &.estimated {
        border-left-color: var(--ngpf-navy-light);
      }

      &:hover {
        box-shadow: var(--shadow-md);
        transform: translateX(4px);
      }
    }

    .date-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-width: 60px;
      height: 60px;
      background: var(--ngpf-gray-pale);
      border-radius: var(--radius-sm);
      flex-shrink: 0;

      .month {
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        color: var(--ngpf-gray);
        letter-spacing: 0.05em;
      }

      .day {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--ngpf-navy-dark);
        line-height: 1;
      }
    }

    .deadline-content {
      flex: 1;
    }

    .deadline-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
      margin-bottom: 0.5rem;

      h3 {
        margin: 0;
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--ngpf-navy-dark);
      }
    }

    .category-badge {
      padding: 0.25rem 0.625rem;
      border-radius: 100px;
      font-size: 0.75rem;
      font-weight: 500;

      &.forms {
        background: rgba(38, 166, 154, 0.1);
        color: var(--ngpf-teal);
      }

      &.filing {
        background: rgba(255, 152, 0, 0.1);
        color: var(--ngpf-orange);
      }

      &.estimated {
        background: rgba(44, 82, 130, 0.1);
        color: var(--ngpf-navy-light);
      }
    }

    .description {
      margin: 0 0 0.75rem;
      font-size: 0.9375rem;
      color: var(--ngpf-gray-dark);
      line-height: 1.5;
    }

    .important-for {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;

      .label {
        font-size: 0.8125rem;
        color: var(--ngpf-gray);
      }

      .tag {
        padding: 0.125rem 0.5rem;
        background: var(--ngpf-gray-pale);
        border-radius: var(--radius-xs);
        font-size: 0.75rem;
        color: var(--ngpf-gray-dark);
      }
    }

    .tips-section {
      margin-top: 3rem;

      h2 {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--ngpf-navy-dark);
        margin: 0 0 1.5rem;
        text-align: center;
      }
    }

    .tips-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
    }

    .tip-card {
      background: var(--ngpf-white);
      border-radius: var(--radius-md);
      padding: 1.25rem;
      text-align: center;
      box-shadow: var(--shadow-sm);

      .tip-icon {
        font-size: 2rem;
        display: block;
        margin-bottom: 0.5rem;
      }

      h4 {
        margin: 0 0 0.5rem;
        font-size: 1rem;
        font-weight: 600;
        color: var(--ngpf-navy-dark);
      }

      p {
        margin: 0;
        font-size: 0.875rem;
        color: var(--ngpf-gray-dark);
        line-height: 1.4;
      }
    }

    .action-buttons {
      margin-top: 2rem;
      display: flex;
      justify-content: center;
    }

    .btn-secondary {
      padding: 0.75rem 1.5rem;
      background: var(--ngpf-white);
      border: 2px solid var(--ngpf-navy-light);
      border-radius: var(--radius-sm);
      color: var(--ngpf-navy-light);
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition-fast);

      &:hover {
        background: var(--ngpf-navy-light);
        color: var(--ngpf-white);
      }
    }

    @media (max-width: 640px) {
      .calendar-page {
        padding: 1rem;
      }

      .timeline-item {
        flex-direction: column;
      }

      .date-badge {
        flex-direction: row;
        width: auto;
        height: auto;
        padding: 0.5rem 1rem;
        gap: 0.5rem;

        .month {
          font-size: 0.875rem;
        }

        .day {
          font-size: 1.125rem;
        }
      }
    }
  `,
})
export class TaxCalendarComponent {
  private readonly router = inject(Router);

  readonly deadlines = TAX_DEADLINES;
  readonly activeFilter = signal<'all' | 'forms' | 'filing' | 'estimated'>('all');

  readonly filteredDeadlines = computed(() => {
    const filter = this.activeFilter();
    if (filter === 'all') {
      return this.deadlines;
    }
    return this.deadlines.filter((d) => d.category === filter);
  });

  getShortMonth(month: string): string {
    return month.substring(0, 3).toUpperCase();
  }

  getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      forms: 'Tax Forms',
      filing: 'Filing',
      estimated: 'Estimated Tax',
      other: 'Other',
    };
    return labels[category] || category;
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
