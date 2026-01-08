import { Credits, createEmptyCredits } from './credits.model';
import { Deductions, createEmptyDeductions } from './deductions.model';
import { Income, createEmptyIncome } from './income.model';
import { PersonalInfo, createEmptyPersonalInfo } from './personal-info.model';
import { TaxCalculation } from './tax-calculation.model';

export interface TaxReturn {
  personalInfo: PersonalInfo;
  income: Income;
  deductions: Deductions;
  credits: Credits;
  calculation: TaxCalculation | null;
}

export function createEmptyTaxReturn(): TaxReturn {
  return {
    personalInfo: createEmptyPersonalInfo(),
    income: createEmptyIncome(),
    deductions: createEmptyDeductions(),
    credits: createEmptyCredits(),
    calculation: null,
  };
}
