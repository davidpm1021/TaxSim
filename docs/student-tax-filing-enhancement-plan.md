# Student Tax Filing Enhancement Plan

## Executive Summary

This document outlines enhancements to make the TaxSim application more comprehensive for high school and college students, while maintaining its educational focus. The goal is to cover the realistic tax situations students encounter while teaching them the mechanics of tax filing.

---

## Current State Analysis

### What We Have
- **Personal Info**: Filing status, basic info, dependent status, dependents
- **Income**: W-2, 1099-NEC (styled like real forms)
- **Deductions**: Standard vs itemized (mortgage, student loan, SALT, charitable, medical)
- **Credits**: Child Tax Credit, EITC
- **Results**: Tax calculation with educational breakdowns

### What's Missing for Students
The current app misses several common student tax scenarios and educational opportunities.

---

## Student Tax Profiles

### High School Student (Ages 16-18)
**Typical Situation:**
- Part-time job (retail, food service, lifeguard) → W-2
- Gig work (DoorDash, babysitting, lawn care) → 1099-NEC or unreported
- Savings account interest → 1099-INT
- Small investment account (Robinhood) → 1099-DIV
- Usually claimed as dependent by parents
- May not need to file (income under threshold)

**Key Learning Needs:**
- When do I actually need to file?
- What's the difference between W-2 and 1099?
- Why did my friend get a bigger refund?
- What documents do I need to collect?

### College Student (Ages 18-24)
**Typical Situation:**
- Summer internship or part-time job → W-2
- Work-study → W-2
- Freelance/tutoring → 1099-NEC
- Gig economy (Uber, TaskRabbit) → 1099-NEC, 1099-K
- Bank interest → 1099-INT
- Investment account → 1099-DIV
- Tuition payments → 1098-T (for education credits)
- Student loan interest → 1098-E
- Scholarships/grants (potentially taxable)
- May or may not be claimed as dependent

**Key Learning Needs:**
- Should my parents claim me or should I file independently?
- What's the American Opportunity Credit and can I get it?
- Are my scholarships taxable?
- How do I handle 1099 income from multiple gig apps?
- Why do I owe money when my friend got a refund?

### Recent Graduate / Young Adult (Ages 22-26)
**Typical Situation:**
- Full-time job → W-2
- Side hustle → 1099-NEC, 1099-K
- Student loan payments → 1098-E
- First apartment (renter's credit in some states)
- Health insurance decisions (marketplace, employer, parent's plan)
- Starting retirement savings → 401k, IRA
- Investment portfolio → 1099-DIV, 1099-B

---

## Recommended Enhancements

### Phase 1: Foundation (High Priority)

#### 1.1 Student Profile Selection
Add an onboarding screen after welcome:

```
"Tell us about yourself"

○ High School Student
  - Working part-time or doing gig work
  - May be claimed as dependent

○ College Student
  - May have tuition credits available
  - Working while in school

○ Recent Graduate
  - First full-time job
  - Student loan payments
```

This customizes the flow and shows relevant sections.

#### 1.2 Document Checklist
Before starting data entry, show what documents to collect:

**For High School Students:**
- [ ] W-2 from employer(s)
- [ ] 1099-NEC for gig work ($600+)
- [ ] 1099-INT from bank (if interest > $10)
- [ ] Social Security Number
- [ ] Parent's info (if they claim you)

**For College Students:**
- [ ] All documents above, plus:
- [ ] 1098-T from school (tuition)
- [ ] 1098-E from loan servicer (interest paid)
- [ ] Scholarship/grant amounts
- [ ] 1099-K from payment apps (if > $600)

#### 1.3 Form 1099-INT (Interest Income)
Very common for anyone with a savings account.

**Fields:**
- Payer name (bank name)
- Box 1: Interest income
- Box 4: Federal tax withheld (rare)

**Educational Content:**
- "Even small amounts of interest are taxable income"
- "Banks report interest over $10 to the IRS"
- "This is 'passive income' - you earned it without working"

#### 1.4 Move Student Loan Interest to Correct Location
Currently in itemized deductions - should be an "adjustment to income" (above-the-line deduction).

**Why it matters:**
- You can take this deduction even with standard deduction
- Reduces AGI, which affects other calculations
- Up to $2,500 deductible

---

### Phase 2: Education Credits (Critical for College Students)

#### 2.1 Form 1098-T Entry
Colleges send this form showing tuition paid and scholarships received.

**Fields:**
- School name
- Box 1: Payments received for qualified tuition and expenses
- Box 5: Scholarships or grants

**Key Calculation:**
```
Qualified Expenses = Box 1 - Box 5
If Box 5 > Box 1, excess may be taxable income
```

#### 2.2 American Opportunity Credit (AOTC)
The most valuable education credit - up to $2,500/year.

**Eligibility:**
- First 4 years of post-secondary education
- Enrolled at least half-time
- Not completed 4 years of higher education
- No felony drug conviction
- MAGI under $90,000 (single) / $180,000 (MFJ)

**Calculation:**
```
100% of first $2,000 of qualified expenses
+ 25% of next $2,000
= Maximum $2,500

40% is REFUNDABLE (up to $1,000 back even with no tax liability!)
```

**Who claims it:**
- If student is dependent → parent claims
- If student is independent → student claims

#### 2.3 Lifetime Learning Credit (LLC)
Alternative to AOTC for those who don't qualify.

**Eligibility:**
- Any post-secondary education
- No limit on years
- Graduate school qualifies
- MAGI under $80,000 (single) / $160,000 (MFJ)

**Calculation:**
```
20% of first $10,000 of qualified expenses
= Maximum $2,000
NOT refundable
```

#### 2.4 Credit Comparison Tool
Help users choose between AOTC and LLC:

```
Based on your situation:
┌─────────────────────────────────────────────────┐
│ American Opportunity Credit                      │
│ You could receive: $2,500                       │
│ ✓ RECOMMENDED - Higher value, partially        │
│   refundable                                    │
├─────────────────────────────────────────────────┤
│ Lifetime Learning Credit                        │
│ You could receive: $2,000                       │
│ You're eligible for AOTC which is better       │
└─────────────────────────────────────────────────┘
```

---

### Phase 3: Enhanced Income Types

#### 3.1 Form 1099-DIV (Dividends)
For students with investment accounts (increasingly common with Robinhood, etc.)

**Fields:**
- Payer name
- Box 1a: Total ordinary dividends
- Box 1b: Qualified dividends (taxed at lower capital gains rates)
- Box 2a: Total capital gain distributions

**Educational Content:**
- "Qualified dividends are taxed at lower rates (0%, 15%, or 20%)"
- "You pay taxes on dividends even if you reinvested them"

#### 3.2 Form 1099-K (Payment Apps)
Critical for gig workers - NEW $600 threshold starting 2024.

**Common Sources:**
- Venmo, PayPal, Cash App (for business transactions)
- Etsy, eBay (selling goods)
- Uber, Lyft, DoorDash (backup to 1099-NEC)

**Fields:**
- Payer/Platform name
- Box 1a: Gross amount of payment card/third party transactions

**Educational Content:**
- "This reports GROSS payments - you can deduct expenses"
- "Personal payments (splitting dinner) shouldn't be included"
- "If you received this AND a 1099-NEC for the same income, don't double-count"

#### 3.3 Scholarship/Grant Taxability Calculator
Help students understand when scholarships are taxable.

**Rule:**
```
Taxable Scholarship = Total Scholarships - Qualified Education Expenses

Qualified Expenses:
✓ Tuition and fees
✓ Books and supplies required for courses
✗ Room and board
✗ Travel
✗ Optional equipment
```

**Example:**
```
Total scholarship: $25,000
Tuition: $20,000
Required books: $1,000
Room & board: $12,000

Qualified expenses: $21,000
Taxable scholarship: $25,000 - $21,000 = $4,000
```

---

### Phase 4: Self-Employment Enhancements

#### 4.1 Simplified Schedule C
For 1099 workers, allow basic expense deductions.

**Common Student Gig Worker Expenses:**
- **Mileage**: $0.67/mile (2024 rate)
- **Phone/Internet**: Business use percentage
- **Supplies**: Delivery bags, equipment
- **Platform fees**: Deducted from payments

**Simplified Entry:**
```
Gross Income (from 1099s): $5,000
Less: Expenses
  - Mileage (500 miles × $0.67):    $335
  - Supplies:                        $50
  - Phone (20% business use):        $240
Total Expenses:                      $625

Net Profit (for tax purposes):       $4,375
```

#### 4.2 Mileage Calculator
Help gig workers track deductible mileage.

**Input Options:**
- Enter total miles driven for work
- OR: Enter number of deliveries × average miles per delivery

**Output:**
```
Business miles: 2,000
Rate: $0.67/mile
Deduction: $1,340

This reduces your taxable self-employment income!
```

#### 4.3 Quarterly Estimated Tax Calculator
For students with significant 1099 income.

**When Required:**
- Expect to owe $1,000+ in taxes
- No employer withholding to cover it

**Calculator Output:**
```
Estimated annual 1099 income: $10,000
Estimated self-employment tax: $1,413
Estimated income tax: $800
Total estimated tax: $2,213

Quarterly payment: $554
Due dates: Apr 15, Jun 15, Sep 15, Jan 15
```

---

### Phase 5: Educational Enhancements

#### 5.1 Tax Glossary
Inline definitions for tax terms:

- **AGI (Adjusted Gross Income)**: Your total income minus specific deductions like student loan interest
- **Withholding**: Taxes your employer takes from your paycheck throughout the year
- **Refundable Credit**: A credit that can give you money back even if you owe no tax
- **Above-the-line Deduction**: Reduces your income before calculating AGI (better than itemized)

#### 5.2 "What If" Scenarios
Let students explore hypothetical situations:

```
"What if I earned $2,000 more in gig work?"

Current refund: $1,200
With $2,000 more income:
  - Additional income tax: $220
  - Additional SE tax: $283
  - New refund: $697

You'd keep $1,497 of that extra $2,000
```

#### 5.3 Real Form Viewer
Show what actual IRS forms look like with data filled in:

- "Here's what your Form 1040 would look like"
- "This is the W-2 you'd receive from your employer"
- Highlight key fields and explain their meaning

#### 5.4 Tax Calendar
Key dates students should know:

```
January 31: Employers must send W-2s
February 15: 1099s must be sent
April 15: Tax filing deadline
June 15: Q2 estimated tax due
September 15: Q3 estimated tax due
October 15: Extended filing deadline
January 15: Q4 estimated tax due
```

#### 5.5 Filing Decision Helper
Help students determine if they need to file:

```
Based on your situation:

Filing Status: Single (claimed as dependent)
Earned Income: $5,000 (W-2)
Unearned Income: $50 (interest)

Standard deduction for dependents: $1,300 or earned income + $450

Your threshold: $5,450

✓ You should file a return
  - Your earned income ($5,000) is close to the threshold
  - Federal taxes were withheld - file to get your refund!
```

---

### Phase 6: State Taxes (Future)

#### 6.1 State Tax Module
Add support for common states where students file:

**Priority States** (by student population):
1. California
2. Texas (no state income tax)
3. Florida (no state income tax)
4. New York
5. Pennsylvania
6. Illinois
7. Ohio
8. Michigan
9. North Carolina
10. Georgia

**Features:**
- State income brackets
- State-specific credits (renter's credit, etc.)
- Reciprocity rules (work in one state, live in another)

---

## Implementation Priority Matrix

| Feature | Student Impact | Complexity | Priority |
|---------|---------------|------------|----------|
| Student profile selection | High | Low | P1 |
| Document checklist | High | Low | P1 |
| 1099-INT entry | High | Low | P1 |
| Student loan → adjustments | Medium | Low | P1 |
| 1098-T entry | High | Medium | P2 |
| AOTC calculation | High | Medium | P2 |
| LLC calculation | Medium | Medium | P2 |
| Credit comparison | High | Low | P2 |
| 1099-DIV entry | Medium | Low | P3 |
| 1099-K entry | Medium | Low | P3 |
| Scholarship calculator | Medium | Medium | P3 |
| Simplified Schedule C | High | Medium | P4 |
| Mileage calculator | Medium | Low | P4 |
| Quarterly tax calculator | Medium | Medium | P4 |
| Tax glossary | High | Low | P5 |
| What-if scenarios | Medium | Medium | P5 |
| Form viewer | Medium | High | P5 |
| Tax calendar | Low | Low | P5 |
| State taxes | Medium | High | P6 |

---

## New Data Models Required

### Income Models
```typescript
interface Form1099INT {
  id: string;
  payerName: string;
  payerTin: string;
  interestIncome: number;        // Box 1
  earlyWithdrawalPenalty: number; // Box 2
  usSavingsBondInterest: number;  // Box 3
  federalWithheld: number;        // Box 4
}

interface Form1099DIV {
  id: string;
  payerName: string;
  payerTin: string;
  ordinaryDividends: number;      // Box 1a
  qualifiedDividends: number;     // Box 1b
  capitalGainDistributions: number; // Box 2a
  federalWithheld: number;        // Box 4
}

interface Form1099K {
  id: string;
  payerName: string;              // Platform name
  grossAmount: number;            // Box 1a
  // Note: User needs to avoid double-counting with 1099-NEC
}

interface Form1098T {
  id: string;
  schoolName: string;
  schoolTin: string;
  paymentsReceived: number;       // Box 1
  scholarshipsGrants: number;     // Box 5
  adjustmentsPriorYear: number;   // Box 4
  adjustmentsScholarships: number; // Box 6
}

interface Form1098E {
  id: string;
  lenderName: string;
  studentLoanInterestPaid: number; // Box 1
}
```

### Education Credit Models
```typescript
interface EducationCredit {
  studentName: string;
  studentSsn: string;
  school: Form1098T;
  creditType: 'aotc' | 'llc' | 'none';
  qualifiedExpenses: number;
  creditAmount: number;
  refundableAmount: number; // For AOTC only
}

interface StudentProfile {
  type: 'high-school' | 'college' | 'graduate';
  enrollmentStatus: 'full-time' | 'half-time' | 'less-than-half';
  yearInSchool: number; // 1-4 for AOTC eligibility
  hasCompletedFourYears: boolean;
  hasFelonyDrugConviction: boolean;
}
```

### Self-Employment Models
```typescript
interface ScheduleCSimplified {
  grossIncome: number;
  expenses: {
    mileage: number;
    milesDeduction: number;
    supplies: number;
    phoneInternet: number;
    platformFees: number;
    other: number;
    otherDescription: string;
  };
  netProfit: number;
}
```

---

## UI/UX Considerations

### Progressive Disclosure
Don't overwhelm students. Show only what's relevant:
- High schooler? Skip education credits section
- No 1099 income? Skip self-employment tax explanation
- No investment income? Skip dividend sections

### Contextual Education
Add "Learn More" triggers throughout:
- After entering W-2: "Why did my employer take out taxes?"
- After 1099-NEC: "Why doesn't my gig job withhold taxes?"
- After education credits: "Why is AOTC better than LLC?"

### Mobile-First
Many students will use phones:
- Form entry should work on small screens
- Large tap targets for buttons
- Swipe between form fields

### Gamification (Light)
- Progress indicators: "You're 60% done!"
- Celebrations: "You qualify for a $2,500 education credit!"
- Comparisons: "You're doing better than 70% of filers your age"

---

## Testing Scenarios

### Scenario 1: High School Part-Timer
- 16 years old, claimed as dependent
- W-2 from Target: $4,500 wages, $200 withheld
- 1099-INT from bank: $15
- Expected: Refund of ~$200 (most withholding returned)

### Scenario 2: College Student with AOTC
- 20 years old, still dependent
- W-2 from campus job: $6,000 wages, $400 withheld
- 1098-T: $15,000 tuition, $10,000 scholarship
- Expected: Parent claims AOTC ($1,250), student gets refund

### Scenario 3: Gig Worker
- 19 years old, not claimed as dependent
- No W-2
- 1099-NEC from DoorDash: $12,000
- 1099-K from Venmo: $3,000 (included in DoorDash)
- Expenses: 3,000 miles, $200 supplies
- Expected: Owes ~$1,500 SE tax + income tax

### Scenario 4: Graduate Student
- 24 years old, not claimed as dependent
- W-2 from assistantship: $25,000 wages, $2,500 withheld
- 1098-T: $10,000 tuition (paid by fellowship)
- 1098-E: $1,200 student loan interest
- Expected: LLC credit + student loan deduction, small refund

---

## Success Metrics

1. **Completion Rate**: % of users who finish the entire flow
2. **Time to Complete**: Average minutes to complete filing
3. **Help Modal Views**: Which topics need more explanation
4. **Error Rate**: How often users enter invalid data
5. **Return Rate**: % who come back the next tax year

---

## Conclusion

This enhancement plan transforms TaxSim from a basic tax calculator into a comprehensive educational tool that covers the realistic tax situations students face. By prioritizing education credits, common income types, and contextual learning, we can help students understand not just how to file taxes, but why taxes work the way they do.

The phased approach allows for incremental development while delivering value early. Phase 1-2 alone would cover 80% of student tax situations.
