import { FilingStatus } from '@core/models';

export const TAX_YEAR = 2025;

// Tax brackets by filing status
export interface TaxBracket {
  min: number;
  max: number;
  rate: number;
}

export const TAX_BRACKETS: Record<FilingStatus, TaxBracket[]> = {
  'single': [
    { min: 0, max: 11925, rate: 0.10 },
    { min: 11925, max: 48475, rate: 0.12 },
    { min: 48475, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250525, rate: 0.32 },
    { min: 250525, max: 626350, rate: 0.35 },
    { min: 626350, max: Infinity, rate: 0.37 },
  ],
  'married-jointly': [
    { min: 0, max: 23850, rate: 0.10 },
    { min: 23850, max: 96950, rate: 0.12 },
    { min: 96950, max: 206700, rate: 0.22 },
    { min: 206700, max: 394600, rate: 0.24 },
    { min: 394600, max: 501050, rate: 0.32 },
    { min: 501050, max: 751600, rate: 0.35 },
    { min: 751600, max: Infinity, rate: 0.37 },
  ],
  'head-of-household': [
    { min: 0, max: 17000, rate: 0.10 },
    { min: 17000, max: 64850, rate: 0.12 },
    { min: 64850, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250500, rate: 0.32 },
    { min: 250500, max: 626350, rate: 0.35 },
    { min: 626350, max: Infinity, rate: 0.37 },
  ],
};

// Standard deductions
export const STANDARD_DEDUCTIONS: Record<FilingStatus, number> = {
  'single': 15000,
  'married-jointly': 30000,
  'head-of-household': 22500,
};

// Standard deduction for dependents: Greater of $1,350 or earned income + $450 (capped at full standard deduction)
export const DEPENDENT_STANDARD_DEDUCTION_MINIMUM = 1350;
export const DEPENDENT_STANDARD_DEDUCTION_ADDON = 450;

// Deduction limits
export const DEDUCTION_LIMITS = {
  studentLoanInterest: 2500,
  saltTaxes: 10000,
  medicalExpenseFloor: 0.075, // 7.5% of AGI
};

// Self-employment tax
export const SELF_EMPLOYMENT_TAX = {
  rate: 0.153, // 15.3% (12.4% SS + 2.9% Medicare)
  netEarningsMultiplier: 0.9235, // Applied to net SE income
  deductionRate: 0.5, // 50% of SE tax is deductible
};

// Child Tax Credit
export const CHILD_TAX_CREDIT = {
  maxPerChild: 2000,
  refundableMax: 1700,
  childMaxAge: 16, // Under 17
  phaseoutThreshold: {
    'single': 200000,
    'married-jointly': 400000,
    'head-of-household': 200000,
  } as Record<FilingStatus, number>,
  phaseoutRate: 50, // $50 reduction per $1,000 over threshold
};

// Earned Income Tax Credit (EITC) - 2025 estimates
export interface EITCParams {
  maxCredit: number;
  phaseInRate: number;
  phaseOutRate: number;
  earnedIncomeThreshold: number;
  phaseOutStart: number;
  phaseOutEnd: number;
}

export const EITC_PARAMS: Record<FilingStatus, Record<number, EITCParams>> = {
  'single': {
    0: {
      maxCredit: 632,
      phaseInRate: 0.0765,
      phaseOutRate: 0.0765,
      earnedIncomeThreshold: 8260,
      phaseOutStart: 10330,
      phaseOutEnd: 18591,
    },
    1: {
      maxCredit: 4213,
      phaseInRate: 0.34,
      phaseOutRate: 0.1598,
      earnedIncomeThreshold: 12390,
      phaseOutStart: 22720,
      phaseOutEnd: 49084,
    },
    2: {
      maxCredit: 6960,
      phaseInRate: 0.40,
      phaseOutRate: 0.2106,
      earnedIncomeThreshold: 17400,
      phaseOutStart: 22720,
      phaseOutEnd: 55768,
    },
    3: {
      maxCredit: 7830,
      phaseInRate: 0.45,
      phaseOutRate: 0.2106,
      earnedIncomeThreshold: 17400,
      phaseOutStart: 22720,
      phaseOutEnd: 59899,
    },
  },
  'married-jointly': {
    0: {
      maxCredit: 632,
      phaseInRate: 0.0765,
      phaseOutRate: 0.0765,
      earnedIncomeThreshold: 8260,
      phaseOutStart: 17250,
      phaseOutEnd: 25511,
    },
    1: {
      maxCredit: 4213,
      phaseInRate: 0.34,
      phaseOutRate: 0.1598,
      earnedIncomeThreshold: 12390,
      phaseOutStart: 29640,
      phaseOutEnd: 56004,
    },
    2: {
      maxCredit: 6960,
      phaseInRate: 0.40,
      phaseOutRate: 0.2106,
      earnedIncomeThreshold: 17400,
      phaseOutStart: 29640,
      phaseOutEnd: 62688,
    },
    3: {
      maxCredit: 7830,
      phaseInRate: 0.45,
      phaseOutRate: 0.2106,
      earnedIncomeThreshold: 17400,
      phaseOutStart: 29640,
      phaseOutEnd: 66819,
    },
  },
  'head-of-household': {
    0: {
      maxCredit: 632,
      phaseInRate: 0.0765,
      phaseOutRate: 0.0765,
      earnedIncomeThreshold: 8260,
      phaseOutStart: 10330,
      phaseOutEnd: 18591,
    },
    1: {
      maxCredit: 4213,
      phaseInRate: 0.34,
      phaseOutRate: 0.1598,
      earnedIncomeThreshold: 12390,
      phaseOutStart: 22720,
      phaseOutEnd: 49084,
    },
    2: {
      maxCredit: 6960,
      phaseInRate: 0.40,
      phaseOutRate: 0.2106,
      earnedIncomeThreshold: 17400,
      phaseOutStart: 22720,
      phaseOutEnd: 55768,
    },
    3: {
      maxCredit: 7830,
      phaseInRate: 0.45,
      phaseOutRate: 0.2106,
      earnedIncomeThreshold: 17400,
      phaseOutStart: 22720,
      phaseOutEnd: 59899,
    },
  },
};

// Investment income limit for EITC
export const EITC_INVESTMENT_INCOME_LIMIT = 11600;

// US States (for W-2 Box 15)
export const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
  { code: 'DC', name: 'District of Columbia' },
];
