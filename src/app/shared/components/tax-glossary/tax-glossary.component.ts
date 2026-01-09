import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface GlossaryTerm {
  term: string;
  definition: string;
  example?: string;
  relatedTerms?: string[];
}

export const TAX_GLOSSARY: GlossaryTerm[] = [
  {
    term: 'AGI (Adjusted Gross Income)',
    definition: 'Your total income minus specific deductions like student loan interest and half of self-employment tax. This is the starting point for calculating your taxes.',
    example: 'If you earned $50,000 and paid $1,000 in student loan interest, your AGI would be $49,000.',
    relatedTerms: ['Gross Income', 'Taxable Income'],
  },
  {
    term: 'Withholding',
    definition: 'Taxes your employer takes from your paycheck throughout the year and sends to the IRS on your behalf. Think of it as "prepaying" your taxes.',
    example: 'If your paycheck shows $500 in federal tax withheld, that money has already been sent to the IRS.',
    relatedTerms: ['W-2', 'Refund'],
  },
  {
    term: 'Standard Deduction',
    definition: 'A fixed dollar amount you can subtract from your AGI to reduce your taxable income. Most people use this instead of itemizing.',
    example: 'In 2025, the standard deduction for single filers is $15,000.',
    relatedTerms: ['Itemized Deduction', 'Taxable Income'],
  },
  {
    term: 'Itemized Deduction',
    definition: 'Specific expenses you can deduct instead of taking the standard deduction. Only worth it if your itemized deductions exceed the standard deduction.',
    example: 'Mortgage interest, state taxes, and charitable donations can be itemized.',
    relatedTerms: ['Standard Deduction', 'SALT'],
  },
  {
    term: 'Tax Credit',
    definition: 'A dollar-for-dollar reduction in the taxes you owe. Credits are more valuable than deductions because they directly reduce your tax bill.',
    example: 'A $1,000 tax credit reduces your taxes by exactly $1,000.',
    relatedTerms: ['Tax Deduction', 'Refundable Credit'],
  },
  {
    term: 'Tax Deduction',
    definition: 'An amount subtracted from your income before calculating taxes. The tax savings depends on your tax bracket.',
    example: 'A $1,000 deduction in the 12% bracket saves you $120 in taxes.',
    relatedTerms: ['Tax Credit', 'Standard Deduction'],
  },
  {
    term: 'Refundable Credit',
    definition: 'A tax credit that can give you money back even if you owe no taxes. The credit amount exceeding your tax liability is refunded to you.',
    example: 'The Earned Income Tax Credit (EITC) is refundable—you can receive it even if you owe $0 in taxes.',
    relatedTerms: ['Tax Credit', 'EITC'],
  },
  {
    term: 'W-2',
    definition: 'A form your employer gives you showing your wages and the taxes withheld from your paychecks during the year.',
    example: 'Box 1 shows your taxable wages, Box 2 shows federal tax withheld.',
    relatedTerms: ['Withholding', '1099'],
  },
  {
    term: '1099',
    definition: 'A form reporting income that isn\'t from a traditional employer—like freelance work, interest, or dividends. No taxes are withheld from this income.',
    example: 'DoorDash sends you a 1099-NEC if you earned $600 or more.',
    relatedTerms: ['W-2', 'Self-Employment Tax'],
  },
  {
    term: 'Self-Employment Tax',
    definition: 'The Social Security and Medicare taxes self-employed people pay. It\'s 15.3% because you pay both the employee and employer portions.',
    example: 'If you earned $10,000 from gig work, you\'d owe about $1,413 in self-employment tax.',
    relatedTerms: ['1099', 'Schedule C'],
  },
  {
    term: 'Filing Status',
    definition: 'Your tax category based on your marital and family situation. It affects your tax rates and standard deduction amount.',
    example: 'Single, Married Filing Jointly, and Head of Household are common filing statuses.',
    relatedTerms: ['Standard Deduction', 'Tax Bracket'],
  },
  {
    term: 'Tax Bracket',
    definition: 'Income ranges taxed at different rates. Only the income within each bracket is taxed at that rate (progressive taxation).',
    example: 'If you\'re in the 22% bracket, only your income above $48,475 is taxed at 22%—not all your income.',
    relatedTerms: ['Marginal Tax Rate', 'Taxable Income'],
  },
  {
    term: 'Marginal Tax Rate',
    definition: 'The tax rate on your last dollar of income—the highest bracket your income reaches.',
    example: 'If your taxable income is $50,000 (single), your marginal rate is 22%.',
    relatedTerms: ['Tax Bracket', 'Effective Tax Rate'],
  },
  {
    term: 'Effective Tax Rate',
    definition: 'Your actual overall tax rate—total taxes divided by total income. It\'s lower than your marginal rate because of how brackets work.',
    example: 'You might be in the 22% bracket but only pay 12% of your total income in taxes.',
    relatedTerms: ['Marginal Tax Rate', 'Tax Bracket'],
  },
  {
    term: 'Dependent',
    definition: 'A person (usually a child) you support financially and can claim on your tax return for certain benefits.',
    example: 'Claiming a child as a dependent can qualify you for the Child Tax Credit.',
    relatedTerms: ['Child Tax Credit', 'Filing Status'],
  },
  {
    term: 'EITC (Earned Income Tax Credit)',
    definition: 'A refundable credit for low-to-moderate income workers. The amount depends on your income and number of children.',
    example: 'A single parent with two kids earning $25,000 might receive over $6,000 from the EITC.',
    relatedTerms: ['Refundable Credit', 'Tax Credit'],
  },
  {
    term: 'Child Tax Credit',
    definition: 'A credit of up to $2,000 per qualifying child under 17. Part of it ($1,700) is refundable.',
    example: 'If you have two kids and owe $3,000 in taxes, the CTC could reduce it to $0 or less.',
    relatedTerms: ['Dependent', 'Refundable Credit'],
  },
  {
    term: 'AOTC (American Opportunity Credit)',
    definition: 'An education credit of up to $2,500 per student for the first 4 years of college. 40% ($1,000) is refundable.',
    example: 'If you paid $4,000 in tuition, you could get the full $2,500 credit.',
    relatedTerms: ['LLC', '1098-T'],
  },
  {
    term: 'LLC (Lifetime Learning Credit)',
    definition: 'An education credit of up to $2,000 for any post-secondary education. Not refundable, but no 4-year limit.',
    example: 'Graduate students or those taking continuing education courses can use this credit.',
    relatedTerms: ['AOTC', '1098-T'],
  },
  {
    term: 'SALT',
    definition: 'State and Local Taxes—the state income taxes and property taxes you can deduct if you itemize. Capped at $10,000.',
    example: 'If you paid $8,000 in state income tax and $4,000 in property tax, you can only deduct $10,000.',
    relatedTerms: ['Itemized Deduction', 'Standard Deduction'],
  },
  {
    term: 'Schedule C',
    definition: 'The IRS form for reporting self-employment income and expenses. Your profit (income minus expenses) is what gets taxed.',
    example: 'If you earned $10,000 from Uber but spent $3,000 on gas and car expenses, your Schedule C profit is $7,000.',
    relatedTerms: ['Self-Employment Tax', '1099'],
  },
  {
    term: 'Gross Income',
    definition: 'All the money you earned before any deductions or taxes. This includes wages, self-employment income, interest, and dividends.',
    example: 'If you earned $40,000 from your job and $5,000 from freelancing, your gross income is $45,000.',
    relatedTerms: ['AGI', 'Taxable Income'],
  },
  {
    term: 'Taxable Income',
    definition: 'The amount of income that\'s actually subject to tax—your AGI minus your deduction (standard or itemized).',
    example: 'If your AGI is $50,000 and you take the $15,000 standard deduction, your taxable income is $35,000.',
    relatedTerms: ['AGI', 'Standard Deduction'],
  },
  {
    term: 'Refund',
    definition: 'Money the IRS returns to you if you paid more in taxes (through withholding) than you actually owe.',
    example: 'If you had $5,000 withheld but only owe $4,000, you get a $1,000 refund.',
    relatedTerms: ['Withholding', 'Tax Liability'],
  },
  {
    term: 'Estimated Taxes',
    definition: 'Quarterly tax payments required if you have income without withholding (like self-employment) and expect to owe $1,000 or more.',
    example: 'Freelancers typically pay estimated taxes in April, June, September, and January.',
    relatedTerms: ['Self-Employment Tax', '1099'],
  },
];

@Component({
  selector: 'app-tax-glossary',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="glossary-container">
      <header class="glossary-header">
        <h2>Tax Glossary</h2>
        <p class="subtitle">Quick definitions for common tax terms</p>
      </header>

      <div class="search-box">
        <input
          type="text"
          [ngModel]="searchQuery()"
          (ngModelChange)="searchQuery.set($event)"
          placeholder="Search terms..."
          class="search-input"
        />
        @if (searchQuery()) {
          <button class="clear-btn" (click)="searchQuery.set('')" type="button">
            Clear
          </button>
        }
      </div>

      <div class="terms-list">
        @for (term of filteredTerms(); track term.term) {
          <div class="term-card" [class.expanded]="expandedTerm() === term.term">
            <button
              class="term-header"
              (click)="toggleTerm(term.term)"
              type="button"
            >
              <span class="term-name">{{ term.term }}</span>
              <span class="expand-icon">{{ expandedTerm() === term.term ? '−' : '+' }}</span>
            </button>

            @if (expandedTerm() === term.term) {
              <div class="term-content">
                <p class="definition">{{ term.definition }}</p>

                @if (term.example) {
                  <div class="example">
                    <span class="example-label">Example:</span>
                    <span>{{ term.example }}</span>
                  </div>
                }

                @if (term.relatedTerms && term.relatedTerms.length > 0) {
                  <div class="related-terms">
                    <span class="related-label">Related:</span>
                    @for (related of term.relatedTerms; track related; let last = $last) {
                      <button
                        class="related-link"
                        (click)="searchQuery.set(related); expandedTerm.set(related)"
                        type="button"
                      >
                        {{ related }}{{ last ? '' : ',' }}
                      </button>
                    }
                  </div>
                }
              </div>
            }
          </div>
        } @empty {
          <div class="no-results">
            <p>No terms found matching "{{ searchQuery() }}"</p>
          </div>
        }
      </div>

      <div class="glossary-footer">
        <p>{{ filteredTerms().length }} of {{ allTerms.length }} terms</p>
      </div>
    </div>
  `,
  styles: `
    .glossary-container {
      background: var(--ngpf-white);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      max-height: 80vh;
      overflow-y: auto;
    }

    .glossary-header {
      margin-bottom: 1.5rem;

      h2 {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--ngpf-navy-dark);
        margin: 0 0 0.25rem;
      }

      .subtitle {
        color: var(--ngpf-gray);
        font-size: 0.875rem;
        margin: 0;
      }
    }

    .search-box {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .search-input {
      flex: 1;
      padding: 0.625rem 1rem;
      border: 1px solid var(--ngpf-gray-light);
      border-radius: var(--radius-sm);
      font-size: 1rem;

      &:focus {
        outline: none;
        border-color: var(--ngpf-navy-light);
        box-shadow: 0 0 0 3px rgba(44, 82, 130, 0.1);
      }
    }

    .clear-btn {
      padding: 0.625rem 1rem;
      background: var(--ngpf-gray-pale);
      border: 1px solid var(--ngpf-gray-light);
      border-radius: var(--radius-sm);
      color: var(--ngpf-gray-dark);
      font-size: 0.875rem;
      cursor: pointer;

      &:hover {
        background: var(--ngpf-gray-light);
      }
    }

    .terms-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .term-card {
      border: 1px solid var(--ngpf-gray-light);
      border-radius: var(--radius-sm);
      overflow: hidden;
      transition: all var(--transition-fast);

      &.expanded {
        border-color: var(--ngpf-navy-light);
        box-shadow: var(--shadow-sm);
      }
    }

    .term-header {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.875rem 1rem;
      background: var(--ngpf-gray-pale);
      border: none;
      cursor: pointer;
      text-align: left;

      &:hover {
        background: var(--ngpf-blue-pale);
      }

      .expanded & {
        background: var(--ngpf-navy-light);
        color: var(--ngpf-white);
      }
    }

    .term-name {
      font-weight: 500;
      font-size: 0.9375rem;
    }

    .expand-icon {
      font-size: 1.25rem;
      font-weight: 300;
      line-height: 1;
    }

    .term-content {
      padding: 1rem;
      background: var(--ngpf-white);
    }

    .definition {
      margin: 0 0 0.75rem;
      color: var(--ngpf-gray-dark);
      font-size: 0.9375rem;
      line-height: 1.5;
    }

    .example {
      padding: 0.75rem;
      background: var(--ngpf-blue-pale);
      border-radius: var(--radius-xs);
      font-size: 0.875rem;
      margin-bottom: 0.75rem;

      .example-label {
        font-weight: 600;
        color: var(--ngpf-navy-dark);
        margin-right: 0.25rem;
      }
    }

    .related-terms {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.8125rem;

      .related-label {
        color: var(--ngpf-gray);
        margin-right: 0.25rem;
      }
    }

    .related-link {
      background: none;
      border: none;
      color: var(--ngpf-navy-light);
      cursor: pointer;
      padding: 0;
      font-size: inherit;

      &:hover {
        text-decoration: underline;
      }
    }

    .no-results {
      padding: 2rem;
      text-align: center;
      color: var(--ngpf-gray);
    }

    .glossary-footer {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--ngpf-gray-light);
      text-align: center;

      p {
        margin: 0;
        font-size: 0.75rem;
        color: var(--ngpf-gray);
      }
    }
  `,
})
export class TaxGlossaryComponent {
  readonly allTerms = TAX_GLOSSARY;
  readonly searchQuery = signal('');
  readonly expandedTerm = signal<string | null>(null);

  readonly filteredTerms = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) {
      return this.allTerms;
    }

    return this.allTerms.filter(
      (term) =>
        term.term.toLowerCase().includes(query) ||
        term.definition.toLowerCase().includes(query) ||
        term.relatedTerms?.some((r) => r.toLowerCase().includes(query))
    );
  });

  toggleTerm(term: string): void {
    if (this.expandedTerm() === term) {
      this.expandedTerm.set(null);
    } else {
      this.expandedTerm.set(term);
    }
  }
}
