export interface TaxCalculation {
  // Income
  totalW2Wages: number;
  total1099Income: number;
  grossIncome: number;

  // Adjustments
  selfEmploymentTaxDeduction: number; // 50% of SE tax
  adjustedGrossIncome: number;

  // Deductions
  standardDeductionAmount: number;
  itemizedDeductionAmount: number;
  deductionUsed: 'standard' | 'itemized';
  finalDeductionAmount: number;

  // Taxable income
  taxableIncome: number;

  // Tax
  taxBeforeCredits: number;
  selfEmploymentTax: number;
  totalTaxBeforeCredits: number;

  // Credits
  totalCredits: number;

  // Final
  totalTax: number;
  totalWithholding: number;
  refundOrOwed: number;
  isRefund: boolean;
}
