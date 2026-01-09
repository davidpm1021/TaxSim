/**
 * Form 1098-T - Tuition Statement
 * Sent by colleges/universities to report tuition payments and scholarships.
 * Used to claim education credits (AOTC and LLC).
 */
export interface Form1098T {
  id: string;
  schoolName: string;
  schoolAddress?: string;
  schoolTin?: string;              // School's EIN
  studentSsn?: string;             // Student's SSN
  paymentsReceived: number;        // Box 1: Payments received for qualified tuition and related expenses
  scholarshipsGrants: number;      // Box 5: Scholarships or grants
  adjustmentsPriorYear?: number;   // Box 4: Adjustments made for a prior year
  adjustmentsScholarships?: number; // Box 6: Adjustments to scholarships or grants for a prior year
  includesAmountsNextPeriod?: boolean; // Box 7: Checkbox if amounts include next academic period
  atLeastHalfTime?: boolean;       // Box 8: Student was at least half-time
  isGraduateStudent?: boolean;     // Box 9: Student is a graduate student
}

export function createEmptyForm1098T(): Form1098T {
  return {
    id: crypto.randomUUID(),
    schoolName: '',
    paymentsReceived: 0,
    scholarshipsGrants: 0,
    atLeastHalfTime: true,
    isGraduateStudent: false,
  };
}

/**
 * Calculate qualified education expenses from 1098-T
 * Qualified Expenses = Tuition Paid - Scholarships
 * If negative, the excess scholarship may be taxable income
 */
export function calculateQualifiedExpenses(form: Form1098T): number {
  return Math.max(0, form.paymentsReceived - form.scholarshipsGrants);
}

/**
 * Calculate taxable scholarship amount (when scholarships exceed qualified expenses)
 */
export function calculateTaxableScholarship(form: Form1098T): number {
  return Math.max(0, form.scholarshipsGrants - form.paymentsReceived);
}
