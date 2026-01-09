/**
 * State tax models and interfaces
 */

export type StateCode =
  | 'AL' | 'AK' | 'AZ' | 'AR' | 'CA' | 'CO' | 'CT' | 'DE' | 'FL' | 'GA'
  | 'HI' | 'ID' | 'IL' | 'IN' | 'IA' | 'KS' | 'KY' | 'LA' | 'ME' | 'MD'
  | 'MA' | 'MI' | 'MN' | 'MS' | 'MO' | 'MT' | 'NE' | 'NV' | 'NH' | 'NJ'
  | 'NM' | 'NY' | 'NC' | 'ND' | 'OH' | 'OK' | 'OR' | 'PA' | 'RI' | 'SC'
  | 'SD' | 'TN' | 'TX' | 'UT' | 'VT' | 'VA' | 'WA' | 'WV' | 'WI' | 'WY'
  | 'DC';

export interface StateTaxBracket {
  min: number;
  max: number;
  rate: number;
  baseTax: number;
}

export interface StateStandardDeduction {
  single: number;
  marriedFilingJointly: number;
  marriedFilingSeparately: number;
  headOfHousehold: number;
}

export interface StatePersonalExemption {
  single: number;
  marriedFilingJointly: number;
  marriedFilingSeparately: number;
  headOfHousehold: number;
  dependent: number;
}

export interface StateSpecificCredit {
  name: string;
  description: string;
  maxAmount: number;
  eligibilityRules: string[];
}

export interface StateTaxInfo {
  code: StateCode;
  name: string;
  hasIncomeTax: boolean;
  taxType: 'none' | 'flat' | 'progressive';
  flatRate?: number;
  brackets?: {
    single: StateTaxBracket[];
    marriedFilingJointly: StateTaxBracket[];
    marriedFilingSeparately: StateTaxBracket[];
    headOfHousehold: StateTaxBracket[];
  };
  standardDeduction?: StateStandardDeduction;
  personalExemption?: StatePersonalExemption;
  specialRules?: string[];
  credits?: StateSpecificCredit[];
}

export interface StateTaxResult {
  stateCode: StateCode;
  stateName: string;
  hasIncomeTax: boolean;
  grossIncome: number;
  adjustments: number;
  stateAGI: number;
  standardDeduction: number;
  personalExemption: number;
  taxableIncome: number;
  taxBeforeCredits: number;
  credits: number;
  stateTaxOwed: number;
  stateWithholding: number;
  stateRefundOrOwed: number;
  effectiveRate: number;
  brackets?: {
    bracket: StateTaxBracket;
    incomeInBracket: number;
    taxFromBracket: number;
  }[];
}

export interface UserStateInfo {
  residenceState: StateCode | null;
  workState: StateCode | null;
  stateWages: number;
  stateWithholding: number;
}

// States with no income tax
export const NO_INCOME_TAX_STATES: StateCode[] = [
  'AK', // Alaska
  'FL', // Florida
  'NV', // Nevada
  'SD', // South Dakota
  'TX', // Texas
  'WA', // Washington
  'WY', // Wyoming
];

// States with flat income tax
export const FLAT_TAX_STATES: StateCode[] = [
  'CO', // Colorado
  'IL', // Illinois
  'IN', // Indiana
  'KY', // Kentucky
  'MA', // Massachusetts
  'MI', // Michigan
  'NC', // North Carolina
  'NH', // New Hampshire (interest/dividends only)
  'PA', // Pennsylvania
  'UT', // Utah
];

// Priority states for implementation (by student population)
export const PRIORITY_STATES: StateCode[] = [
  'CA', // California
  'TX', // Texas (no income tax)
  'FL', // Florida (no income tax)
  'NY', // New York
  'PA', // Pennsylvania
  'IL', // Illinois
  'OH', // Ohio
  'MI', // Michigan
  'NC', // North Carolina
  'GA', // Georgia
];

export function createEmptyUserStateInfo(): UserStateInfo {
  return {
    residenceState: null,
    workState: null,
    stateWages: 0,
    stateWithholding: 0,
  };
}
