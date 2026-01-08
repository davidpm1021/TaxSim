/**
 * Above-the-line deductions (adjustments to income)
 * These reduce AGI and can be taken regardless of standard/itemized deduction choice
 */
export interface Adjustments {
  // Student loan interest (Form 1098-E) - up to $2,500
  studentLoanInterest: number;
  // Educator expenses - up to $300 (for teachers)
  educatorExpenses: number;
  // HSA contributions (not from employer)
  hsaContributions: number;
  // Traditional IRA contributions
  iraContributions: number;
  // Self-employment health insurance
  selfEmploymentHealthInsurance: number;
}

export function createEmptyAdjustments(): Adjustments {
  return {
    studentLoanInterest: 0,
    educatorExpenses: 0,
    hsaContributions: 0,
    iraContributions: 0,
    selfEmploymentHealthInsurance: 0,
  };
}

export const ADJUSTMENT_LIMITS = {
  studentLoanInterest: 2500,
  educatorExpenses: 300,
};
