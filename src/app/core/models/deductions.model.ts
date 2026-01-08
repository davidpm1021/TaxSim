export interface Deductions {
  mortgageInterest: number;
  studentLoanInterest: number;
  saltTaxes: number;
  charitableContributions: number;
  medicalExpenses: number;
  useStandardDeduction: boolean;
}

export function createEmptyDeductions(): Deductions {
  return {
    mortgageInterest: 0,
    studentLoanInterest: 0,
    saltTaxes: 0,
    charitableContributions: 0,
    medicalExpenses: 0,
    useStandardDeduction: true,
  };
}
