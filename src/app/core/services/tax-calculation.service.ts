import { Injectable } from '@angular/core';
import {
  Dependent,
  Deductions,
  FilingStatus,
  TaxCalculation,
  TaxReturn,
} from '@core/models';
import {
  TAX_BRACKETS,
  STANDARD_DEDUCTIONS,
  DEPENDENT_STANDARD_DEDUCTION_MINIMUM,
  DEPENDENT_STANDARD_DEDUCTION_ADDON,
  DEDUCTION_LIMITS,
  SELF_EMPLOYMENT_TAX,
  CHILD_TAX_CREDIT,
  EITC_PARAMS,
} from '@core/constants';

export interface SelfEmploymentTaxResult {
  selfEmploymentTax: number;
  deductiblePortion: number;
}

export interface ChildTaxCreditResult {
  total: number;
  refundable: number;
}

@Injectable({ providedIn: 'root' })
export class TaxCalculationService {
  /**
   * Calculate tax using progressive tax brackets
   */
  calculateTaxFromBrackets(taxableIncome: number, filingStatus: FilingStatus): number {
    if (taxableIncome <= 0) {
      return 0;
    }

    const brackets = TAX_BRACKETS[filingStatus];
    let tax = 0;
    let remainingIncome = taxableIncome;

    for (const bracket of brackets) {
      if (remainingIncome <= 0) {
        break;
      }

      const bracketSize = bracket.max - bracket.min;
      const taxableInBracket = Math.min(remainingIncome, bracketSize);
      tax += taxableInBracket * bracket.rate;
      remainingIncome -= taxableInBracket;
    }

    return Math.round(tax * 100) / 100;
  }

  /**
   * Calculate self-employment tax on 1099 income
   */
  calculateSelfEmploymentTax(income1099: number): SelfEmploymentTaxResult {
    if (income1099 <= 0) {
      return { selfEmploymentTax: 0, deductiblePortion: 0 };
    }

    const netEarnings = income1099 * SELF_EMPLOYMENT_TAX.netEarningsMultiplier;
    const selfEmploymentTax = Math.round(netEarnings * SELF_EMPLOYMENT_TAX.rate * 100) / 100;
    const deductiblePortion = Math.round(selfEmploymentTax * SELF_EMPLOYMENT_TAX.deductionRate * 100) / 100;

    return { selfEmploymentTax, deductiblePortion };
  }

  /**
   * Calculate standard deduction based on filing status and dependent status
   */
  calculateStandardDeduction(
    filingStatus: FilingStatus,
    claimedAsDependent: boolean,
    earnedIncome: number
  ): number {
    const fullDeduction = STANDARD_DEDUCTIONS[filingStatus];

    if (!claimedAsDependent) {
      return fullDeduction;
    }

    // For dependents: greater of $1,350 or earned income + $450, capped at full deduction
    const earnedIncomeDeduction = earnedIncome + DEPENDENT_STANDARD_DEDUCTION_ADDON;
    const dependentDeduction = Math.max(DEPENDENT_STANDARD_DEDUCTION_MINIMUM, earnedIncomeDeduction);

    return Math.min(dependentDeduction, fullDeduction);
  }

  /**
   * Calculate itemized deductions with caps applied
   * Note: Student loan interest is an above-the-line deduction (adjustment to AGI),
   * not an itemized deduction, so it's not included here.
   */
  calculateItemizedDeductions(
    deductions: Omit<Deductions, 'useStandardDeduction'>,
    agi: number
  ): number {
    let total = 0;

    // Mortgage interest - no cap
    total += deductions.mortgageInterest;

    // SALT - capped at $10,000
    total += Math.min(deductions.saltTaxes, DEDUCTION_LIMITS.saltTaxes);

    // Charitable contributions - no cap (simplified)
    total += deductions.charitableContributions;

    // Medical expenses - only amount exceeding 7.5% of AGI
    const medicalFloor = agi * DEDUCTION_LIMITS.medicalExpenseFloor;
    const deductibleMedical = Math.max(0, deductions.medicalExpenses - medicalFloor);
    total += deductibleMedical;

    return total;
  }

  /**
   * Calculate Child Tax Credit
   */
  calculateChildTaxCredit(
    dependents: Dependent[],
    agi: number,
    filingStatus: FilingStatus
  ): ChildTaxCreditResult {
    // Count qualifying children (under 17, lived with filer)
    const qualifyingChildren = dependents.filter(
      (d) => d.age <= CHILD_TAX_CREDIT.childMaxAge && d.livedWithFiler
    );

    if (qualifyingChildren.length === 0) {
      return { total: 0, refundable: 0 };
    }

    // Calculate base credit
    let credit = qualifyingChildren.length * CHILD_TAX_CREDIT.maxPerChild;

    // Apply phase-out
    const threshold = CHILD_TAX_CREDIT.phaseoutThreshold[filingStatus];
    if (agi > threshold) {
      // $50 reduction per $1,000 (or fraction thereof) over threshold
      const excessIncome = agi - threshold;
      const reductionUnits = Math.ceil(excessIncome / 1000);
      const reduction = reductionUnits * CHILD_TAX_CREDIT.phaseoutRate;
      credit = Math.max(0, credit - reduction);
    }

    // Calculate refundable portion (ACTC)
    const maxRefundable = qualifyingChildren.length * CHILD_TAX_CREDIT.refundableMax;
    const refundable = Math.min(credit, maxRefundable);

    return { total: credit, refundable };
  }

  /**
   * Calculate Earned Income Tax Credit
   */
  calculateEITC(
    earnedIncome: number,
    filingStatus: FilingStatus,
    numChildren: number,
    claimedAsDependent: boolean
  ): number {
    // Not eligible if claimed as dependent
    if (claimedAsDependent) {
      return 0;
    }

    // Cap children at 3 for EITC purposes
    const childrenForEITC = Math.min(numChildren, 3);
    const params = EITC_PARAMS[filingStatus][childrenForEITC];

    if (!params) {
      return 0;
    }

    // Check if income exceeds limit
    if (earnedIncome > params.phaseOutEnd) {
      return 0;
    }

    let credit = 0;

    // Phase-in: credit increases as income increases up to threshold
    if (earnedIncome <= params.earnedIncomeThreshold) {
      credit = earnedIncome * params.phaseInRate;
    } else {
      credit = params.maxCredit;
    }

    // Phase-out: credit decreases as income exceeds phase-out start
    if (earnedIncome > params.phaseOutStart) {
      const reduction = (earnedIncome - params.phaseOutStart) * params.phaseOutRate;
      credit = Math.max(0, credit - reduction);
    }

    return Math.round(credit * 100) / 100;
  }

  /**
   * Calculate complete tax return
   */
  calculateFullReturn(taxReturn: TaxReturn): TaxCalculation {
    const { personalInfo, income, deductions, adjustments } = taxReturn;

    // Calculate total income
    const totalW2Wages = income.w2s.reduce((sum, w2) => sum + w2.wagesTips, 0);
    const total1099Income = income.form1099s.reduce((sum, f) => sum + f.nonemployeeCompensation, 0);
    const grossIncome = totalW2Wages + total1099Income;

    // Calculate self-employment tax
    const seResult = this.calculateSelfEmploymentTax(total1099Income);
    const selfEmploymentTax = seResult.selfEmploymentTax;
    const selfEmploymentTaxDeduction = seResult.deductiblePortion;

    // Calculate student loan interest deduction (above-the-line, capped at $2,500)
    const studentLoanDeduction = Math.min(
      adjustments.studentLoanInterest || 0,
      DEDUCTION_LIMITS.studentLoanInterest
    );

    // Calculate AGI (includes SE tax deduction and student loan interest)
    const adjustedGrossIncome = Math.round(
      (grossIncome - selfEmploymentTaxDeduction - studentLoanDeduction) * 100
    ) / 100;

    // Calculate earned income for dependent standard deduction calculation
    const earnedIncome = totalW2Wages + total1099Income;

    // Calculate deductions
    const standardDeductionAmount = this.calculateStandardDeduction(
      personalInfo.filingStatus,
      personalInfo.claimedAsDependent,
      earnedIncome
    );

    const itemizedDeductionAmount = this.calculateItemizedDeductions(
      {
        mortgageInterest: deductions.mortgageInterest,
        saltTaxes: deductions.saltTaxes,
        charitableContributions: deductions.charitableContributions,
        medicalExpenses: deductions.medicalExpenses,
      },
      adjustedGrossIncome
    );

    // Determine which deduction to use
    let deductionUsed: 'standard' | 'itemized';
    let finalDeductionAmount: number;

    if (deductions.useStandardDeduction) {
      deductionUsed = 'standard';
      finalDeductionAmount = standardDeductionAmount;
    } else {
      deductionUsed = 'itemized';
      finalDeductionAmount = itemizedDeductionAmount;
    }

    // Calculate taxable income (cannot be negative)
    const taxableIncome = Math.max(0, Math.round((adjustedGrossIncome - finalDeductionAmount) * 100) / 100);

    // Calculate tax from brackets
    const taxBeforeCredits = this.calculateTaxFromBrackets(taxableIncome, personalInfo.filingStatus);

    // Calculate total tax before credits (income tax + SE tax)
    const totalTaxBeforeCredits = Math.round((taxBeforeCredits + selfEmploymentTax) * 100) / 100;

    // Calculate credits
    const ctcResult = this.calculateChildTaxCredit(
      personalInfo.dependents,
      adjustedGrossIncome,
      personalInfo.filingStatus
    );

    const numQualifyingChildren = personalInfo.dependents.filter(
      (d) => d.age <= CHILD_TAX_CREDIT.childMaxAge && d.livedWithFiler
    ).length;

    const eitc = this.calculateEITC(
      earnedIncome,
      personalInfo.filingStatus,
      numQualifyingChildren,
      personalInfo.claimedAsDependent
    );

    const totalCredits = Math.round((ctcResult.total + eitc) * 100) / 100;

    // Calculate withholding
    const totalWithholding = income.w2s.reduce((sum, w2) => sum + w2.federalWithheld, 0);

    // Apply credits to reduce tax liability
    // CTC is applied first against tax liability
    const taxAfterCTC = Math.max(0, totalTaxBeforeCredits - ctcResult.total);

    // Calculate how much CTC was actually used against tax
    const ctcUsedAgainstTax = Math.min(ctcResult.total, totalTaxBeforeCredits);
    const unusedCTC = ctcResult.total - ctcUsedAgainstTax;

    // Unused CTC can be refundable up to the refundable limit
    const refundableCTC = Math.min(unusedCTC, ctcResult.refundable);

    // EITC is fully refundable, applied after CTC
    const taxAfterAllCredits = Math.max(0, taxAfterCTC - eitc);

    // If EITC exceeds remaining tax, the excess is refundable
    const eitcUsedAgainstTax = Math.min(eitc, taxAfterCTC);
    const refundableEITC = eitc; // EITC is fully refundable regardless of tax liability

    // Total tax after all credits
    const totalTax = Math.round(taxAfterAllCredits * 100) / 100;

    // Calculate refund or amount owed
    // Refund = withholding + refundable credits - final tax liability
    const totalRefundableCredits = refundableCTC + refundableEITC;
    const netPosition = totalWithholding + totalRefundableCredits - taxAfterCTC;
    const refundOrOwed = Math.round(Math.abs(netPosition) * 100) / 100;
    const isRefund = netPosition >= 0;

    return {
      totalW2Wages,
      total1099Income,
      grossIncome,
      selfEmploymentTaxDeduction,
      adjustedGrossIncome,
      standardDeductionAmount,
      itemizedDeductionAmount,
      deductionUsed,
      finalDeductionAmount,
      taxableIncome,
      taxBeforeCredits,
      selfEmploymentTax,
      totalTaxBeforeCredits,
      totalCredits,
      totalTax,
      totalWithholding,
      refundOrOwed: Math.abs(refundOrOwed),
      isRefund,
    };
  }
}
