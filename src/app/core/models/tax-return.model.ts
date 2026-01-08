import { Adjustments, createEmptyAdjustments } from './adjustments.model';
import { Credits, createEmptyCredits } from './credits.model';
import { Deductions, createEmptyDeductions } from './deductions.model';
import { Income, createEmptyIncome } from './income.model';
import { PersonalInfo, createEmptyPersonalInfo } from './personal-info.model';
import { TaxCalculation } from './tax-calculation.model';

export interface TaxReturn {
  personalInfo: PersonalInfo;
  income: Income;
  adjustments: Adjustments;
  deductions: Deductions;
  credits: Credits;
  calculation: TaxCalculation | null;
}

export function createEmptyTaxReturn(): TaxReturn {
  return {
    personalInfo: createEmptyPersonalInfo(),
    income: createEmptyIncome(),
    adjustments: createEmptyAdjustments(),
    deductions: createEmptyDeductions(),
    credits: createEmptyCredits(),
    calculation: null,
  };
}
