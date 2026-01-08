export interface Credits {
  childTaxCredit: number;
  childTaxCreditRefundable: number;
  earnedIncomeCredit: number;
}

export function createEmptyCredits(): Credits {
  return {
    childTaxCredit: 0,
    childTaxCreditRefundable: 0,
    earnedIncomeCredit: 0,
  };
}
