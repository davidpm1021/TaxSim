# Tax Filing Simulation for High School Students

## Product Requirements Document (PRD)

**Version**: 1.0  
**Last Updated**: January 2025  
**Target Release**: MVP

---

## Executive Summary

An Angular/TypeScript web application that simulates the tax filing experience for high school financial literacy education. Students enter fictional tax data (provided via classroom worksheets) and navigate through a TurboTax-style interview flow, learning key tax concepts through inline educational modals. The simulation uses real 2025 tax brackets, deductions, and credits to provide an authentic experience without requiring accounts or personal information.

---

## Goals & Non-Goals

### Goals

- Teach students the mechanics of filing a tax return through hands-on simulation
- Provide an authentic experience mirroring commercial tax software (TurboTax/FreeTaxUSA)
- Explain key tax concepts (credits vs. deductions, standard vs. itemized, withholding) at decision points
- Support common tax scenarios: W-2 employment, 1099 gig work, dependents, itemized deductions
- Use accurate 2025 federal tax data (updated annually)

### Non-Goals

- Actual tax filing or IRS submission
- Account creation or user authentication
- PII collection or storage
- Comprehensive coverage of every credit/deduction (simplified for education)
- State tax returns (deferred to future iteration)
- Scoring, grading, or assessment features
- Instructor dashboards or assignment management

---

## User Personas

**Primary**: High school students (ages 14-18) in personal finance, economics, or life skills courses

**Secondary**: Teachers facilitating the activity (no special features required—they provide scenario data via worksheets)

---

## Core User Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            TAX FILING SIMULATION                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. WELCOME & SETUP                                                         │
│     └─→ Introduction screen explaining this is a simulation                 │
│     └─→ "Get Started" button                                                │
│                                                                             │
│  2. PERSONAL INFORMATION                                                    │
│     └─→ Filing status selection (Single, MFJ, HOH)                          │
│     └─→ Basic info (name, DOB - fictional)                                  │
│     └─→ "Can someone claim you as a dependent?" question                    │
│     └─→ Dependent entry (optional, simplified)                              │
│                                                                             │
│  3. INCOME                                                                  │
│     └─→ Income type selection (W-2, 1099-NEC, both)                         │
│     └─→ W-2 entry (visual form, multiple supported)                         │
│     └─→ 1099-NEC entry (gross income only, multiple supported)              │
│     └─→ Income summary                                                      │
│                                                                             │
│  4. DEDUCTIONS                                                              │
│     └─→ Potential itemized deductions entry:                                │
│         • Mortgage interest                                                 │
│         • Student loan interest                                             │
│         • State and local taxes (SALT)                                      │
│         • Charitable contributions                                          │
│         • Medical expenses                                                  │
│     └─→ Standard vs. Itemized comparison screen                             │
│     └─→ System recommendation with explanation                              │
│     └─→ Student confirms choice                                             │
│                                                                             │
│  5. CREDITS                                                                 │
│     └─→ System auto-determines eligibility based on entered data            │
│     └─→ Display applicable credits with explanations:                       │
│         • Child Tax Credit (if dependents entered)                          │
│         • Earned Income Tax Credit (if income qualifies)                    │
│     └─→ Credits summary                                                     │
│                                                                             │
│  6. REVIEW                                                                  │
│     └─→ Full return summary (all sections)                                  │
│     └─→ Edit capability (jump to any section)                               │
│                                                                             │
│  7. RESULTS                                                                 │
│     └─→ Refund or amount owed (prominent display)                           │
│     └─→ Income summary                                                      │
│     └─→ Deductions summary (standard vs. itemized comparison)               │
│     └─→ Credits applied                                                     │
│     └─→ Tax calculation breakdown                                           │
│     └─→ "Start Over" option                                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Detailed Feature Specifications

### 1. Navigation System

**Interview-Style Flow**

- One question/section displayed at a time
- "Continue" button advances to next question
- Progress preserved when navigating backward

**Section Dropdown Navigation**

- Persistent dropdown in header (like TurboTax)
- Sections: Personal Info | Income | Deductions | Credits | Review | Results
- Subsections accessible within each main section
- Visual indicator for completed vs. current vs. locked sections
- Results section locked until Review is complete

**Progress Indicator**

- Simple text indicator: "Step X of Y" or section name
- No complex stepper (keeps focus on content)

### 2. Personal Information Section

**Filing Status Selection**

- Radio button selection
- Options:
  - Single
  - Married Filing Jointly
  - Head of Household
- Educational modal available: "How do I choose my filing status?"

**Basic Information**

- First name (text input)
- Last name (text input)
- Date of birth (date picker)
- Note: "This is a simulation - use fictional information"

**Dependent Status**

- Question: "Can someone else claim you as a dependent on their tax return?"
- Yes/No radio buttons
- Educational modal: "What does it mean to be claimed as a dependent?"
- Affects standard deduction and credit eligibility

**Dependents Entry** (if applicable based on filing status)

- "Do you have dependents to claim?" Yes/No
- If yes, repeatable dependent form:
  - First name (text)
  - Relationship (dropdown: Child, Stepchild, Foster Child, Sibling, Parent, Other)
  - Age (number input)
  - "Did this person live with you for more than half the year?" Yes/No
- Add/remove dependent buttons
- Educational modal: "Who qualifies as a dependent?"

### 3. Income Section

**Income Type Selection**

- Checkboxes for income types received:
  - W-2 (wages from an employer)
  - 1099-NEC (self-employment/gig income)
- Educational modal: "What's the difference between W-2 and 1099 income?"

**W-2 Entry Form**

- Traditional form layout with labeled fields referencing box numbers
- Multiple W-2s supported ("Add another W-2" button)
- Fields:

| Field                           | Box #       | Input Type                     | Required |
| ------------------------------- | ----------- | ------------------------------ | -------- |
| Employer Name                   | Top section | Text                           | Yes      |
| Employer Address                | Top section | Text                           | No       |
| Employer EIN                    | Box b       | Text (XX-XXXXXXX format hint)  | No       |
| Wages, tips, other compensation | Box 1       | Currency                       | Yes      |
| Federal income tax withheld     | Box 2       | Currency                       | Yes      |
| Social Security wages           | Box 3       | Currency                       | Yes      |
| Social Security tax withheld    | Box 4       | Currency                       | Yes      |
| Medicare wages and tips         | Box 5       | Currency                       | Yes      |
| Medicare tax withheld           | Box 6       | Currency                       | Yes      |
| State                           | Box 15      | Dropdown (state abbreviations) | No       |
| State wages                     | Box 16      | Currency                       | No       |
| State income tax withheld       | Box 17      | Currency                       | No       |

- Visual reference: Small W-2 diagram showing box locations
- Educational modal: "Understanding your W-2"

**1099-NEC Entry Form**

- Simplified entry (gross income only)
- Multiple 1099s supported
- Fields:
  - Payer name (text)
  - Nonemployee compensation - Box 1 (currency)
- Disclaimer text: "This simulation shows gross 1099 income only. In real tax filing, you may be able to deduct business expenses on Schedule C."
- Educational modal: "What is 1099 income and how is it different from W-2?"

**Income Summary Screen**

- Total W-2 wages
- Total 1099 income
- Total federal tax already withheld
- Gross income total

### 4. Deductions Section

**Itemized Deductions Entry**

Intro screen: "Let's see if itemizing your deductions could save you money. Enter any of the following expenses you paid this year."

| Deduction                    | Input Type | Notes                                                                 |
| ---------------------------- | ---------- | --------------------------------------------------------------------- |
| Mortgage interest            | Currency   | Educational modal: "What is mortgage interest?"                       |
| Student loan interest        | Currency   | Cap at $2,500, educational modal available                            |
| State and local taxes (SALT) | Currency   | Cap at $10,000, educational modal available                           |
| Charitable contributions     | Currency   | Educational modal: "What counts as a charitable contribution?"        |
| Medical expenses             | Currency   | Note: "Only expenses exceeding 7.5% of your income may be deductible" |

**Standard vs. Itemized Comparison Screen**

Visual comparison layout:

```
┌─────────────────────────────────────────────────────────────────┐
│                    YOUR DEDUCTION OPTIONS                       │
├───────────────────────────┬─────────────────────────────────────┤
│     STANDARD DEDUCTION    │       ITEMIZED DEDUCTIONS           │
├───────────────────────────┼─────────────────────────────────────┤
│                           │  Mortgage interest:      $X,XXX     │
│                           │  Student loan interest:    $XXX     │
│                           │  State & local taxes:    $X,XXX     │
│                           │  Charitable giving:        $XXX     │
│                           │  Medical (above 7.5%):     $XXX     │
│                           ├─────────────────────────────────────┤
│       $XX,XXX             │  TOTAL:                  $X,XXX     │
├───────────────────────────┴─────────────────────────────────────┤
│  ✓ RECOMMENDED: Standard Deduction saves you $X,XXX more        │
│                                                                 │
│  [ ] Use Standard Deduction ($XX,XXX)                           │
│  [ ] Use Itemized Deductions ($X,XXX)                           │
│                                                                 │
│  [?] Why should I choose one over the other?                    │
└─────────────────────────────────────────────────────────────────┘
```

- Educational modal: "Standard deduction vs. Itemizing - which is better?"
- System highlights recommended option
- Student makes final selection

### 5. Credits Section

**Automatic Eligibility Determination**

System calculates eligibility based on entered data:

**Child Tax Credit**

- Eligibility: Dependent child under 17
- Amount: Up to $2,000 per qualifying child (2025)
- Phase-out: Begins at $200,000 (single) / $400,000 (MFJ)
- Refundable portion (ACTC): Up to $1,700

**Earned Income Tax Credit (EITC)**

- Eligibility: Based on earned income, filing status, number of children
- 2025 amounts (approximate, to be updated):
  - No children: Max ~$632 (income limit ~$18,591 single)
  - 1 child: Max ~$4,213 (income limit ~$49,084 single)
  - 2 children: Max ~$6,960 (income limit ~$55,768 single)
  - 3+ children: Max ~$7,830 (income limit ~$59,899 single)
- Not eligible if claimed as dependent

**Credits Display Screen**

If eligible for credits:

```
┌─────────────────────────────────────────────────────────────────┐
│                    TAX CREDITS YOU QUALIFY FOR                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✓ Child Tax Credit                              $2,000         │
│    For: [Dependent Name], age [X]                               │
│    [?] What is the Child Tax Credit?                            │
│                                                                 │
│  ✓ Earned Income Tax Credit                      $1,502         │
│    Based on your income and family size                         │
│    [?] What is the EITC?                                        │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  TOTAL CREDITS:                                  $3,502         │
│                                                                 │
│  [?] What's the difference between a credit and a deduction?    │
└─────────────────────────────────────────────────────────────────┘
```

If not eligible:

```
┌─────────────────────────────────────────────────────────────────┐
│                         TAX CREDITS                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Based on the information you entered, you don't qualify for    │
│  any tax credits this year. This is common for many filers!     │
│                                                                 │
│  [?] What are tax credits and who qualifies?                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6. Review Section

**Full Return Summary**

Organized by section with edit links:

```
┌─────────────────────────────────────────────────────────────────┐
│                    REVIEW YOUR RETURN                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PERSONAL INFORMATION                              [Edit]       │
│  ─────────────────────────────────────────────────────────────  │
│  Name: John Smith                                               │
│  Filing Status: Single                                          │
│  Claimed as Dependent: No                                       │
│  Dependents: None                                               │
│                                                                 │
│  INCOME                                            [Edit]       │
│  ─────────────────────────────────────────────────────────────  │
│  W-2 Wages: $45,000                                             │
│  1099-NEC Income: $2,500                                        │
│  Total Income: $47,500                                          │
│  Federal Tax Withheld: $5,200                                   │
│                                                                 │
│  DEDUCTIONS                                        [Edit]       │
│  ─────────────────────────────────────────────────────────────  │
│  Type: Standard Deduction                                       │
│  Amount: $14,600                                                │
│                                                                 │
│  CREDITS                                           [Edit]       │
│  ─────────────────────────────────────────────────────────────  │
│  Total Credits: $0                                              │
│                                                                 │
│                     [See My Results]                            │
└─────────────────────────────────────────────────────────────────┘
```

### 7. Results Section

**Primary Display: Refund or Amount Owed**

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                      🎉 YOUR RESULTS 🎉                         │
│                                                                 │
│            ┌─────────────────────────────────────┐              │
│            │                                     │              │
│            │    YOUR FEDERAL REFUND              │              │
│            │                                     │              │
│            │         $1,847                      │              │
│            │                                     │              │
│            └─────────────────────────────────────┘              │
│                                                                 │
│    This is the amount you would receive back from the IRS.      │
│    [?] Why am I getting a refund?                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

Or if owing:

```
│            │    YOU OWE                          │              │
│            │                                     │              │
│            │         $523                        │              │
│            │                                     │              │
│    This is the amount you would need to pay to the IRS.         │
│    [?] Why do I owe money?                                      │
```

**Detailed Breakdown**

```
┌─────────────────────────────────────────────────────────────────┐
│                    HOW WE CALCULATED THIS                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  INCOME                                                         │
│  ─────────────────────────────────────────────────────────────  │
│  W-2 Wages                                        $45,000       │
│  1099-NEC Income                                   $2,500       │
│                                                  ─────────      │
│  Total Income                                     $47,500       │
│                                                                 │
│  DEDUCTIONS                                                     │
│  ─────────────────────────────────────────────────────────────  │
│  Standard Deduction                              ($14,600)      │
│                                                  ─────────      │
│  Taxable Income                                   $32,900       │
│                                                                 │
│  TAX CALCULATION                                                │
│  ─────────────────────────────────────────────────────────────  │
│  Tax on $32,900 (see bracket breakdown)           $3,688       │
│  Self-Employment Tax (on 1099 income)               $383       │
│                                                  ─────────      │
│  Total Tax                                        $4,071       │
│                                                                 │
│  CREDITS                                                        │
│  ─────────────────────────────────────────────────────────────  │
│  (No credits applied)                                 $0       │
│                                                                 │
│  PAYMENTS                                                       │
│  ─────────────────────────────────────────────────────────────  │
│  Federal Tax Withheld (from W-2)                  $5,200       │
│  Estimated Tax Payments                               $0       │
│                                                  ─────────      │
│  Total Payments                                   $5,200       │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  PAYMENTS - TAX = REFUND                                        │
│  $5,200 - $4,071 = $1,129                                       │
│                                                                 │
│  [?] Show me how tax brackets work                              │
└─────────────────────────────────────────────────────────────────┘
```

**Standard vs. Itemized Comparison (in results)**

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEDUCTION COMPARISON                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  You chose: STANDARD DEDUCTION ✓                                │
│                                                                 │
│  ┌─────────────────────┬─────────────────────┐                  │
│  │ Standard Deduction  │ If You Itemized     │                  │
│  ├─────────────────────┼─────────────────────┤                  │
│  │     $14,600         │      $8,750         │                  │
│  ├─────────────────────┼─────────────────────┤                  │
│  │ Tax: $3,688         │ Tax: $4,390         │                  │
│  └─────────────────────┴─────────────────────┘                  │
│                                                                 │
│  By choosing standard, you saved $702 in taxes!                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Action Buttons**

- "Start Over" - clears all data, returns to welcome screen
- "Print Summary" - browser print dialog (optional, nice-to-have)

---

## Educational Modals

### Design Pattern

- Triggered by [?] icon or "Learn more" links
- Dismissible overlay modal
- Clear, student-friendly language
- 2-3 short paragraphs maximum
- "Got it" button to close

### Required Educational Content

| Topic                                | Trigger Location                        |
| ------------------------------------ | --------------------------------------- |
| Filing status explained              | Personal Info - status selection        |
| What is a dependent?                 | Personal Info - dependent question      |
| Being claimed as a dependent         | Personal Info - "can someone claim you" |
| W-2 vs 1099 income                   | Income - type selection                 |
| Understanding your W-2               | Income - W-2 entry                      |
| What is 1099/self-employment income? | Income - 1099 entry                     |
| Mortgage interest deduction          | Deductions - mortgage field             |
| Student loan interest deduction      | Deductions - student loan field         |
| SALT deduction                       | Deductions - SALT field                 |
| Charitable contributions             | Deductions - charity field              |
| Medical expense deduction            | Deductions - medical field              |
| Standard vs. Itemized deductions     | Deductions - comparison screen          |
| What is the Child Tax Credit?        | Credits - CTC display                   |
| What is the EITC?                    | Credits - EITC display                  |
| Credits vs. Deductions               | Credits - summary                       |
| Why am I getting a refund?           | Results - refund display                |
| Why do I owe money?                  | Results - owe display                   |
| How tax brackets work                | Results - calculation breakdown         |
| What is withholding?                 | Results - payments section              |

---

## 2025 Tax Data (Federal)

### Tax Brackets (Single Filers)

| Income Range        | Tax Rate |
| ------------------- | -------- |
| $0 - $11,925        | 10%      |
| $11,926 - $48,475   | 12%      |
| $48,476 - $103,350  | 22%      |
| $103,351 - $197,300 | 24%      |
| $197,301 - $250,525 | 32%      |
| $250,526 - $626,350 | 35%      |
| Over $626,350       | 37%      |

### Tax Brackets (Married Filing Jointly)

| Income Range        | Tax Rate |
| ------------------- | -------- |
| $0 - $23,850        | 10%      |
| $23,851 - $96,950   | 12%      |
| $96,951 - $206,700  | 22%      |
| $206,701 - $394,600 | 24%      |
| $394,601 - $501,050 | 32%      |
| $501,051 - $751,600 | 35%      |
| Over $751,600       | 37%      |

### Tax Brackets (Head of Household)

| Income Range        | Tax Rate |
| ------------------- | -------- |
| $0 - $17,000        | 10%      |
| $17,001 - $64,850   | 12%      |
| $64,851 - $103,350  | 22%      |
| $103,351 - $197,300 | 24%      |
| $197,301 - $250,500 | 32%      |
| $250,501 - $626,350 | 35%      |
| Over $626,350       | 37%      |

### Standard Deductions (2025)

| Filing Status          | Amount  | If Claimed as Dependent                                 |
| ---------------------- | ------- | ------------------------------------------------------- |
| Single                 | $15,000 | Greater of $1,350 or earned income + $450 (max $15,000) |
| Married Filing Jointly | $30,000 | N/A                                                     |
| Head of Household      | $22,500 | Greater of $1,350 or earned income + $450 (max $22,500) |

### Deduction Limits

| Deduction             | Limit                 |
| --------------------- | --------------------- |
| Student Loan Interest | $2,500                |
| SALT                  | $10,000               |
| Medical Expenses      | Exceeding 7.5% of AGI |

### Credits (2025 estimates - verify before launch)

| Credit             | Maximum      | Notes                                   |
| ------------------ | ------------ | --------------------------------------- |
| Child Tax Credit   | $2,000/child | Child under 17, refundable up to $1,700 |
| EITC (no children) | ~$632        | Income limit ~$18,591 (single)          |
| EITC (1 child)     | ~$4,213      | Income limit ~$49,084 (single)          |
| EITC (2 children)  | ~$6,960      | Income limit ~$55,768 (single)          |
| EITC (3+ children) | ~$7,830      | Income limit ~$59,899 (single)          |

### Self-Employment Tax

- Rate: 15.3% (12.4% Social Security + 2.9% Medicare)
- Applied to: 92.35% of net self-employment income
- Deduction: 50% of SE tax is deductible from gross income

---

## Technical Specifications

### Stack

- **Framework**: Angular 17+ (standalone components, signals)
- **Language**: TypeScript (strict mode)
- **Styling**: SCSS with CSS custom properties for theming
- **State Management**: Angular signals
- **Build**: Angular CLI
- **Testing**: Jest for unit tests

### Architecture

```
src/
├── app/
│   ├── core/
│   │   ├── services/
│   │   │   ├── tax-calculation.service.ts    # All tax math
│   │   │   ├── tax-data.service.ts           # 2025 brackets, limits
│   │   │   ├── session-storage.service.ts    # localStorage caching
│   │   │   └── navigation.service.ts         # Section flow control
│   │   ├── models/
│   │   │   ├── tax-return.model.ts           # Main data model
│   │   │   ├── w2.model.ts
│   │   │   ├── income-1099.model.ts
│   │   │   ├── dependent.model.ts
│   │   │   └── deductions.model.ts
│   │   └── constants/
│   │       └── tax-year-2025.ts              # All tax year data
│   │
│   ├── features/
│   │   ├── welcome/
│   │   ├── personal-info/
│   │   │   ├── filing-status/
│   │   │   ├── basic-info/
│   │   │   ├── dependent-status/
│   │   │   └── dependents/
│   │   ├── income/
│   │   │   ├── income-types/
│   │   │   ├── w2-entry/
│   │   │   ├── 1099-entry/
│   │   │   └── income-summary/
│   │   ├── deductions/
│   │   │   ├── itemized-entry/
│   │   │   └── deduction-comparison/
│   │   ├── credits/
│   │   │   └── credits-summary/
│   │   ├── review/
│   │   └── results/
│   │
│   ├── shared/
│   │   ├── components/
│   │   │   ├── navigation-header/
│   │   │   ├── section-dropdown/
│   │   │   ├── educational-modal/
│   │   │   ├── currency-input/
│   │   │   ├── continue-button/
│   │   │   └── info-tooltip/
│   │   └── pipes/
│   │       └── currency.pipe.ts
│   │
│   └── educational-content/
│       └── modal-content.ts                  # All educational text
│
├── assets/
│   └── images/
│       └── w2-reference.svg                  # W-2 box diagram
│
└── styles/
    ├── _variables.scss
    ├── _typography.scss
    └── _components.scss
```

### Data Models

```typescript
// tax-return.model.ts
export interface TaxReturn {
  personalInfo: PersonalInfo;
  income: Income;
  deductions: Deductions;
  credits: Credits;
  calculation?: TaxCalculation;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  filingStatus: FilingStatus;
  claimedAsDependent: boolean;
  dependents: Dependent[];
}

export type FilingStatus = "single" | "married-jointly" | "head-of-household";

export interface Dependent {
  firstName: string;
  relationship: DependentRelationship;
  age: number;
  livedWithFiler: boolean;
}

export interface Income {
  w2s: W2[];
  form1099s: Form1099NEC[];
}

export interface W2 {
  employerName: string;
  employerAddress?: string;
  employerEin?: string;
  wagesTips: number; // Box 1
  federalWithheld: number; // Box 2
  socialSecurityWages: number; // Box 3
  socialSecurityWithheld: number; // Box 4
  medicareWages: number; // Box 5
  medicareWithheld: number; // Box 6
  state?: string; // Box 15
  stateWages?: number; // Box 16
  stateWithheld?: number; // Box 17
}

export interface Form1099NEC {
  payerName: string;
  nonemployeeCompensation: number; // Box 1
}

export interface Deductions {
  mortgageInterest: number;
  studentLoanInterest: number;
  saltTaxes: number;
  charitableContributions: number;
  medicalExpenses: number;
  useStandardDeduction: boolean;
}

export interface Credits {
  childTaxCredit: number;
  earnedIncomeCredit: number;
}

export interface TaxCalculation {
  grossIncome: number;
  adjustedGrossIncome: number;
  standardDeductionAmount: number;
  itemizedDeductionAmount: number;
  taxableIncome: number;
  taxBeforeCredits: number;
  selfEmploymentTax: number;
  totalTax: number;
  totalCredits: number;
  totalPayments: number;
  refundOrOwed: number;
  isRefund: boolean;
}
```

### Session Storage Strategy

```typescript
// session-storage.service.ts
@Injectable({ providedIn: "root" })
export class SessionStorageService {
  private readonly STORAGE_KEY = "tax-simulation-data";

  save(data: TaxReturn): void {
    sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  load(): TaxReturn | null {
    const data = sessionStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  }

  clear(): void {
    sessionStorage.removeItem(this.STORAGE_KEY);
  }
}
```

- Use `sessionStorage` (not `localStorage`) - clears on browser close
- Auto-save on every section completion
- Load on app init (recover from accidental close)
- "Start Over" explicitly clears storage

### Routing Structure

```typescript
const routes: Routes = [
  { path: "", redirectTo: "welcome", pathMatch: "full" },
  { path: "welcome", component: WelcomeComponent },
  {
    path: "personal-info",
    children: [
      { path: "filing-status", component: FilingStatusComponent },
      { path: "basic-info", component: BasicInfoComponent },
      { path: "dependent-status", component: DependentStatusComponent },
      { path: "dependents", component: DependentsComponent },
    ],
  },
  {
    path: "income",
    children: [
      { path: "types", component: IncomeTypesComponent },
      { path: "w2", component: W2EntryComponent },
      { path: "w2/:index", component: W2EntryComponent },
      { path: "1099", component: Form1099EntryComponent },
      { path: "1099/:index", component: Form1099EntryComponent },
      { path: "summary", component: IncomeSummaryComponent },
    ],
  },
  {
    path: "deductions",
    children: [
      { path: "itemized", component: ItemizedEntryComponent },
      { path: "comparison", component: DeductionComparisonComponent },
    ],
  },
  { path: "credits", component: CreditsSummaryComponent },
  { path: "review", component: ReviewComponent },
  { path: "results", component: ResultsComponent },
];
```

---

## Future Considerations (Post-MVP)

### State Tax Module

- Architecture should support adding state-specific calculations
- State selection from W-2 Box 15 could drive which state module loads
- Consider starting with 5-10 most common states for classroom scenarios
- Each state would need:
  - Brackets and rates
  - Standard deduction (if applicable)
  - State-specific credits
  - Reciprocity rules (for multi-state)

### Potential Enhancements

- Print/PDF export of results
- Scenario presets (load pre-filled data for specific learning objectives)
- Side-by-side comparison tool (compare two different scenarios)
- "What if" calculator (change one variable, see impact)
- Accessibility audit and WCAG 2.1 AA compliance
- Spanish language support

---

## Success Metrics

Since this is an educational tool without user accounts, success is measured by:

- Teacher feedback (qualitative)
- Student completion of full flow (observable in classroom)
- Reduction in student questions about basic tax concepts
- Adoption by additional schools/districts

---

## Open Questions

1. **Exact 2025 EITC amounts**: Need to verify final IRS published amounts for 2025 tax year
2. **Mobile responsiveness priority**: Is tablet support required for MVP, or desktop-only acceptable?
3. **Accessibility requirements**: Any specific WCAG compliance level required by school districts?
4. **Hosting/deployment**: Where will this be hosted? NGPF infrastructure?
5. **Analytics**: Any need to track anonymous usage patterns for improvement?

---

## Appendix: Educational Modal Content (Draft)

### What's the difference between W-2 and 1099 income?

**W-2 Income** is what you earn as an employee. Your employer withholds taxes from each paycheck and sends them to the IRS for you. At tax time, you report what you earned and what was already withheld.

**1099-NEC Income** is what you earn as an independent contractor or from gig work (like DoorDash, tutoring, or freelance jobs). No taxes are withheld—you receive the full amount and are responsible for paying taxes yourself. You'll also owe self-employment tax (15.3%) to cover Social Security and Medicare.

_Example: If you work at a coffee shop, you get a W-2. If you mow lawns for neighbors, that's 1099 income._

---

### What's the difference between a credit and a deduction?

Both reduce your taxes, but in different ways:

**A deduction** reduces your _taxable income_. If you're in the 12% tax bracket and get a $1,000 deduction, you save $120 in taxes (12% × $1,000).

**A credit** reduces your _actual tax bill_ dollar-for-dollar. A $1,000 credit saves you exactly $1,000 in taxes—much more powerful!

_Think of it this way: A deduction is a discount on what gets taxed. A credit is a direct discount on what you owe._

---

### Standard Deduction vs. Itemizing

The IRS lets you reduce your taxable income in one of two ways:

**Standard Deduction**: A fixed amount based on your filing status (${standardDeduction} for single filers in 2025). No receipts needed—everyone can take this.

**Itemized Deductions**: Add up specific expenses you actually paid (mortgage interest, charitable donations, medical bills, etc.). You'll need records to prove these.

**Which should you choose?** Whichever is larger! If your itemized deductions don't add up to more than the standard deduction, take the standard. Most people (~90%) use the standard deduction.

---

_[Additional modal content to be written for remaining topics]_
