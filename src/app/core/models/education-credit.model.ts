/**
 * Education Credits Model
 * Handles American Opportunity Credit (AOTC) and Lifetime Learning Credit (LLC)
 */

export type EducationCreditType = 'aotc' | 'llc' | 'none';

/**
 * Student education information for credit eligibility
 */
export interface StudentEducationInfo {
  enrollmentStatus: 'full-time' | 'half-time' | 'less-than-half-time';
  yearInProgram: 1 | 2 | 3 | 4 | 5; // 1-4 for undergrad, 5+ for grad
  hasCompletedFourYears: boolean;   // Has completed first 4 years of post-secondary education
  hasFelonyDrugConviction: boolean; // Disqualifies from AOTC
  pursuingDegree: boolean;          // Required for AOTC
}

export function createDefaultStudentEducationInfo(): StudentEducationInfo {
  return {
    enrollmentStatus: 'full-time',
    yearInProgram: 1,
    hasCompletedFourYears: false,
    hasFelonyDrugConviction: false,
    pursuingDegree: true,
  };
}

/**
 * Education credit calculation result
 */
export interface EducationCreditResult {
  creditType: EducationCreditType;
  qualifiedExpenses: number;
  creditAmount: number;
  refundableAmount: number;      // Only AOTC has refundable portion
  nonRefundableAmount: number;
  isEligibleForAOTC: boolean;
  isEligibleForLLC: boolean;
  aotcAmount: number;
  llcAmount: number;
  recommendedCredit: EducationCreditType;
  ineligibilityReasons: string[];
}

/**
 * Education credits stored in tax return
 */
export interface EducationCredits {
  hasEducationExpenses: boolean;
  studentEducationInfo: StudentEducationInfo;
  selectedCreditType: EducationCreditType;
  // Calculated values stored for review
  qualifiedExpenses: number;
  creditAmount: number;
  refundableAmount: number;
}

export function createEmptyEducationCredits(): EducationCredits {
  return {
    hasEducationExpenses: false,
    studentEducationInfo: createDefaultStudentEducationInfo(),
    selectedCreditType: 'none',
    qualifiedExpenses: 0,
    creditAmount: 0,
    refundableAmount: 0,
  };
}
