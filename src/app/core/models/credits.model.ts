import { EducationCreditType } from './education-credit.model';

export interface Credits {
  childTaxCredit: number;
  childTaxCreditRefundable: number;
  earnedIncomeCredit: number;
  // Education credits
  educationCreditType: EducationCreditType;
  educationCredit: number;
  educationCreditRefundable: number; // Only AOTC has refundable portion
}

export function createEmptyCredits(): Credits {
  return {
    childTaxCredit: 0,
    childTaxCreditRefundable: 0,
    earnedIncomeCredit: 0,
    educationCreditType: 'none',
    educationCredit: 0,
    educationCreditRefundable: 0,
  };
}
