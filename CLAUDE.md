# Tax Filing Simulation - Claude Code Instructions

> **Read First**: Review `.claude/VIBE_CODING.md` for workflow methodology before starting any task.

## Project Overview

Educational tax filing simulation for high school students. Mirrors TurboTax interview flow without requiring accounts or PII. Uses real 2025 federal tax data.

**Target Users**: High school students in financial literacy courses  
**Primary Goal**: Teach tax filing mechanics through hands-on simulation  
**NOT a goal**: Actual tax filing, comprehensive tax coverage, or assessment/grading

## Tech Stack

- **Framework**: Angular 19+ (standalone components only)
- **Language**: TypeScript 5.x (strict mode)
- **State**: Angular signals (`signal()`, `computed()`, `effect()`)
- **Styling**: SCSS with CSS custom properties
- **Testing**: Jest with Angular Testing Library
- **Build**: Angular CLI

## Code Conventions

### Components

```typescript
// ✅ ALWAYS: Standalone, OnPush, signals, inject()
@Component({
  selector: 'app-feature-name',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `...`
})
export class FeatureNameComponent {
  private readonly service = inject(SomeService);

  data = signal<Type | null>(null);
  derived = computed(() => this.data()?.property ?? '');
}

// ❌ NEVER: Constructor injection, default change detection
constructor(private service: SomeService) {} // NO
```

### Control Flow

```typescript
// ✅ ALWAYS: Native control flow
@if (condition) {
  <div>Content</div>
} @else {
  <div>Fallback</div>
}

@for (item of items(); track item.id) {
  <div>{{ item.name }}</div>
}

// ❌ NEVER: Structural directives
*ngIf, *ngFor, [ngSwitch] // NO
```

### Services

```typescript
// ✅ ALWAYS: providedIn root, typed returns
@Injectable({ providedIn: "root" })
export class TaxCalculationService {
  calculateTax(income: number, status: FilingStatus): TaxCalculation {
    // Implementation
  }
}
```

### File Naming

- Components: `feature-name.component.ts`
- Services: `feature-name.service.ts`
- Models: `feature-name.model.ts`
- Tests: `feature-name.component.spec.ts`

## Project Structure

```
src/app/
├── core/
│   ├── services/          # Singleton services
│   │   ├── tax-calculation.service.ts
│   │   ├── tax-data.service.ts
│   │   ├── session-storage.service.ts
│   │   └── navigation.service.ts
│   ├── models/            # TypeScript interfaces
│   └── constants/         # Tax year data (2025)
├── features/              # Lazy-loaded feature modules
│   ├── welcome/
│   ├── personal-info/
│   ├── income/
│   ├── deductions/
│   ├── credits/
│   ├── review/
│   └── results/
├── shared/
│   ├── components/        # Reusable UI components
│   └── pipes/
└── educational-content/   # Modal text content
```

## Key Commands

```bash
# Development
ng serve                              # Start dev server
ng test --watch                       # Run tests in watch mode
ng test --include=**/feature.spec.ts  # Run specific test file

# Build
ng build --configuration=production   # Production build

# Linting
ng lint                               # Run ESLint
ng lint --fix                         # Auto-fix issues
```

## Domain Terminology

Use these terms consistently in code and comments:

| Term                | Meaning                                           |
| ------------------- | ------------------------------------------------- |
| `FilingStatus`      | Single, Married Filing Jointly, Head of Household |
| `W2`                | Employee wage form (Box 1-17)                     |
| `Form1099NEC`       | Independent contractor income                     |
| `Dependent`         | Person claimed for tax benefits                   |
| `StandardDeduction` | Fixed deduction amount by filing status           |
| `ItemizedDeduction` | Sum of specific deductible expenses               |
| `TaxCredit`         | Dollar-for-dollar tax reduction (CTC, EITC)       |
| `TaxDeduction`      | Reduction to taxable income                       |
| `Withholding`       | Tax already paid via paycheck (W-2 Box 2)         |
| `AGI`               | Adjusted Gross Income                             |
| `TaxableIncome`     | AGI minus deductions                              |

## Tax Calculation Rules (2025)

### Order of Operations

1. Sum all income (W-2 Box 1 + 1099-NEC Box 1)
2. Calculate AGI (gross income - adjustments like 50% SE tax)
3. Subtract deduction (standard OR itemized, whichever is larger)
4. Apply tax brackets to get tax before credits
5. Add self-employment tax (15.3% × 92.35% of 1099 income)
6. Subtract credits (CTC, EITC)
7. Compare to withholding → refund or amount owed

### Key Limits

- Student loan interest: $2,500 max
- SALT deduction: $10,000 max
- Medical expenses: Only amount exceeding 7.5% of AGI
- Child Tax Credit: $2,000/child, refundable up to $1,700

## Testing Requirements

### Every Component Must Have Tests For:

1. Initial render state
2. User interactions (clicks, inputs)
3. Signal updates reflecting in template
4. Edge cases (empty data, max values)

### Test Pattern

```typescript
describe('W2EntryComponent', () => {
  it('should calculate total wages from multiple W2s', () => {
    // Arrange
    const component = setupComponent();

    // Act
    component.addW2({ wagesTips: 30000, ... });
    component.addW2({ wagesTips: 15000, ... });

    // Assert
    expect(component.totalWages()).toBe(45000);
  });
});
```

## Educational Modal Guidelines

- **Trigger**: `[?]` icon or "Learn more" link
- **Length**: 2-3 short paragraphs max
- **Tone**: Conversational, student-friendly, no jargon without explanation
- **Structure**: What it is → Why it matters → Simple example

## Session Storage Strategy

```typescript
// Use sessionStorage (clears on browser close)
// Auto-save after each section completion
// Load on app init for crash recovery
// "Start Over" explicitly clears

const STORAGE_KEY = "tax-simulation-data";
sessionStorage.setItem(STORAGE_KEY, JSON.stringify(taxReturn));
```

## Git Commit Convention

```
feat(income): add W-2 entry form with all box fields
fix(deductions): correct SALT cap at $10,000
test(credits): add EITC eligibility calculation tests
docs(readme): update setup instructions
refactor(core): extract tax bracket logic to service
```

## Pre-Implementation Checklist

Before writing code for any feature:

- [ ] Read the relevant PRD section (`docs/tax-simulation-prd.md`)
- [ ] Identify affected files and their current state
- [ ] Write failing tests first (TDD)
- [ ] Plan the implementation approach
- [ ] Get approval before proceeding

## Known Constraints

1. **No real PII** - All entered data is fictional
2. **Federal only** - State taxes deferred to future version
3. **Simplified 1099** - Gross income only, no Schedule C expenses
4. **Limited credits** - Only CTC and EITC (most relevant to students)
5. **Single session** - No user accounts or persistent storage

## Reference Documents

- `docs/tax-simulation-prd.md` - Full product requirements
- `.claude/VIBE_CODING.md` - Development workflow methodology
- `src/app/core/constants/tax-year-2025.ts` - Tax brackets and limits
