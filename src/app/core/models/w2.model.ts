/**
 * Box 12 entry - codes with amounts for retirement contributions,
 * health savings accounts, and other special items.
 */
export interface Box12Entry {
  code: string;   // e.g., 'D', 'DD', 'W', 'AA', etc.
  amount: number;
}

/**
 * IRS Form W-2 - Wage and Tax Statement
 * Complete model matching all boxes on the official form.
 */
export interface W2 {
  id: string;

  // ═══════════════════════════════════════════════════════════════
  // LEFT COLUMN - Employee & Employer Information
  // ═══════════════════════════════════════════════════════════════

  /** Box a - Employee's social security number */
  employeeSsn: string;

  /** Box b - Employer identification number (EIN) */
  employerEin: string;

  /** Box c - Employer's name */
  employerName: string;

  /** Box c - Employer's street address */
  employerAddress: string;

  /** Box c - Employer's city, state, and ZIP code */
  employerCityStateZip: string;

  /** Box d - Control number (optional employer use) */
  controlNumber: string;

  /** Box e - Employee's first name and middle initial */
  employeeFirstName: string;

  /** Box e - Employee's last name */
  employeeLastName: string;

  /** Box e - Employee's suffix (Jr., Sr., etc.) */
  employeeSuffix: string;

  /** Box f - Employee's street address */
  employeeAddress: string;

  /** Box f - Employee's city, state, and ZIP code */
  employeeCityStateZip: string;

  // ═══════════════════════════════════════════════════════════════
  // CENTER & RIGHT COLUMNS - Income and Tax Information
  // ═══════════════════════════════════════════════════════════════

  /** Box 1 - Wages, tips, other compensation */
  wagesTips: number;

  /** Box 2 - Federal income tax withheld */
  federalWithheld: number;

  /** Box 3 - Social security wages */
  socialSecurityWages: number;

  /** Box 4 - Social security tax withheld */
  socialSecurityWithheld: number;

  /** Box 5 - Medicare wages and tips */
  medicareWages: number;

  /** Box 6 - Medicare tax withheld */
  medicareWithheld: number;

  /** Box 7 - Social security tips */
  socialSecurityTips: number;

  /** Box 8 - Allocated tips */
  allocatedTips: number;

  // Box 9 is intentionally blank (verification code, not used)

  /** Box 10 - Dependent care benefits */
  dependentCareBenefits: number;

  /** Box 11 - Nonqualified plans */
  nonqualifiedPlans: number;

  /**
   * Box 12a-12d - Various codes and amounts
   * Common codes:
   * - D: Elective deferrals to 401(k)
   * - DD: Cost of employer-sponsored health coverage
   * - W: Employer contributions to HSA
   * - AA: Roth 401(k) contributions
   */
  box12: Box12Entry[];

  // ═══════════════════════════════════════════════════════════════
  // BOX 13 - Checkboxes
  // ═══════════════════════════════════════════════════════════════

  /** Box 13 - Statutory employee */
  statutoryEmployee: boolean;

  /** Box 13 - Retirement plan */
  retirementPlan: boolean;

  /** Box 13 - Third-party sick pay */
  thirdPartySickPay: boolean;

  // ═══════════════════════════════════════════════════════════════
  // BOX 14 - Other
  // ═══════════════════════════════════════════════════════════════

  /** Box 14 - Other (union dues, health insurance, etc.) */
  box14Other: string;

  // ═══════════════════════════════════════════════════════════════
  // STATE TAX SECTION (Boxes 15-17) - Up to 2 states
  // ═══════════════════════════════════════════════════════════════

  /** Box 15 - State abbreviation */
  state: string;

  /** Box 15 - Employer's state ID number */
  employerStateId: string;

  /** Box 16 - State wages, tips, etc. */
  stateWages: number;

  /** Box 17 - State income tax */
  stateWithheld: number;

  // Second state line (optional)
  /** Box 15 - Second state abbreviation */
  state2?: string;

  /** Box 15 - Second employer's state ID number */
  employerStateId2?: string;

  /** Box 16 - Second state wages */
  stateWages2?: number;

  /** Box 17 - Second state income tax */
  stateWithheld2?: number;

  // ═══════════════════════════════════════════════════════════════
  // LOCAL TAX SECTION (Boxes 18-20)
  // ═══════════════════════════════════════════════════════════════

  /** Box 18 - Local wages, tips, etc. */
  localWages: number;

  /** Box 19 - Local income tax */
  localWithheld: number;

  /** Box 20 - Locality name */
  localityName: string;
}

/**
 * Creates an empty W2 form with default values.
 */
export function createEmptyW2(): W2 {
  return {
    id: crypto.randomUUID(),

    // Employee & Employer info
    employeeSsn: '',
    employerEin: '',
    employerName: '',
    employerAddress: '',
    employerCityStateZip: '',
    controlNumber: '',
    employeeFirstName: '',
    employeeLastName: '',
    employeeSuffix: '',
    employeeAddress: '',
    employeeCityStateZip: '',

    // Income boxes
    wagesTips: 0,
    federalWithheld: 0,
    socialSecurityWages: 0,
    socialSecurityWithheld: 0,
    medicareWages: 0,
    medicareWithheld: 0,
    socialSecurityTips: 0,
    allocatedTips: 0,
    dependentCareBenefits: 0,
    nonqualifiedPlans: 0,

    // Box 12
    box12: [],

    // Box 13 checkboxes
    statutoryEmployee: false,
    retirementPlan: false,
    thirdPartySickPay: false,

    // Box 14
    box14Other: '',

    // State section
    state: '',
    employerStateId: '',
    stateWages: 0,
    stateWithheld: 0,

    // Local section
    localWages: 0,
    localWithheld: 0,
    localityName: '',
  };
}
