import { Injectable } from '@angular/core';
import {
  StateCode,
  StateTaxInfo,
  StateTaxResult,
  StateTaxBracket,
  UserStateInfo,
} from '../models/state-tax.model';
import { FilingStatus } from '../models/filing-status.model';
import { STATE_TAX_DATA, getStateName, isStateImplemented } from '../constants/state-taxes-2025';

@Injectable({
  providedIn: 'root',
})
export class StateTaxCalculationService {
  /**
   * Calculate state income tax
   */
  calculateStateTax(
    stateCode: StateCode,
    filingStatus: FilingStatus,
    federalAGI: number,
    stateWages: number,
    stateWithholding: number,
    numDependents: number = 0
  ): StateTaxResult {
    const stateInfo = STATE_TAX_DATA[stateCode];
    const stateName = getStateName(stateCode);

    // Handle states not in our data (assume no tax for simulation)
    if (!stateInfo || !isStateImplemented(stateCode)) {
      return this.createNoTaxResult(stateCode, stateName, federalAGI, stateWithholding);
    }

    // Handle states with no income tax
    if (!stateInfo.hasIncomeTax) {
      return this.createNoTaxResult(stateCode, stateName, federalAGI, stateWithholding);
    }

    // Calculate based on tax type
    if (stateInfo.taxType === 'flat') {
      return this.calculateFlatTax(stateInfo, filingStatus, federalAGI, stateWithholding, numDependents);
    } else {
      return this.calculateProgressiveTax(stateInfo, filingStatus, federalAGI, stateWithholding, numDependents);
    }
  }

  /**
   * Create result for states with no income tax
   */
  private createNoTaxResult(
    stateCode: StateCode,
    stateName: string,
    grossIncome: number,
    stateWithholding: number
  ): StateTaxResult {
    return {
      stateCode,
      stateName,
      hasIncomeTax: false,
      grossIncome,
      adjustments: 0,
      stateAGI: grossIncome,
      standardDeduction: 0,
      personalExemption: 0,
      taxableIncome: 0,
      taxBeforeCredits: 0,
      credits: 0,
      stateTaxOwed: 0,
      stateWithholding,
      stateRefundOrOwed: -stateWithholding, // Negative = refund
      effectiveRate: 0,
    };
  }

  /**
   * Calculate flat tax for states like PA, IL, MI, NC
   */
  private calculateFlatTax(
    stateInfo: StateTaxInfo,
    filingStatus: FilingStatus,
    federalAGI: number,
    stateWithholding: number,
    numDependents: number
  ): StateTaxResult {
    const stateName = stateInfo.name;
    const flatRate = stateInfo.flatRate || 0;

    // Get filing status key
    const statusKey = this.getFilingStatusKey(filingStatus);

    // Calculate deductions and exemptions
    let standardDeduction = 0;
    let personalExemption = 0;

    if (stateInfo.standardDeduction) {
      standardDeduction = stateInfo.standardDeduction[statusKey] || 0;
    }

    if (stateInfo.personalExemption) {
      personalExemption = stateInfo.personalExemption[statusKey] || 0;
      // Add dependent exemptions
      if (numDependents > 0 && stateInfo.personalExemption.dependent) {
        personalExemption += numDependents * stateInfo.personalExemption.dependent;
      }
    }

    // Calculate taxable income
    const stateAGI = federalAGI; // Most states start with federal AGI
    const taxableIncome = Math.max(0, stateAGI - standardDeduction - personalExemption);

    // Calculate tax
    const taxBeforeCredits = taxableIncome * flatRate;
    const credits = 0; // No credits implemented yet
    const stateTaxOwed = Math.max(0, taxBeforeCredits - credits);

    // Calculate refund or amount owed
    const stateRefundOrOwed = stateTaxOwed - stateWithholding;

    // Calculate effective rate
    const effectiveRate = federalAGI > 0 ? stateTaxOwed / federalAGI : 0;

    return {
      stateCode: stateInfo.code,
      stateName,
      hasIncomeTax: true,
      grossIncome: federalAGI,
      adjustments: 0,
      stateAGI,
      standardDeduction,
      personalExemption,
      taxableIncome,
      taxBeforeCredits,
      credits,
      stateTaxOwed,
      stateWithholding,
      stateRefundOrOwed,
      effectiveRate,
    };
  }

  /**
   * Calculate progressive tax for states like CA, NY, OH, GA
   */
  private calculateProgressiveTax(
    stateInfo: StateTaxInfo,
    filingStatus: FilingStatus,
    federalAGI: number,
    stateWithholding: number,
    numDependents: number
  ): StateTaxResult {
    const stateName = stateInfo.name;

    // Get filing status key
    const statusKey = this.getFilingStatusKey(filingStatus);

    // Get brackets for filing status
    const brackets = stateInfo.brackets?.[statusKey];
    if (!brackets) {
      return this.createNoTaxResult(stateInfo.code, stateName, federalAGI, stateWithholding);
    }

    // Calculate deductions and exemptions
    let standardDeduction = 0;
    let personalExemption = 0;

    if (stateInfo.standardDeduction) {
      standardDeduction = stateInfo.standardDeduction[statusKey] || 0;
    }

    if (stateInfo.personalExemption) {
      personalExemption = stateInfo.personalExemption[statusKey] || 0;
      // Add dependent exemptions
      if (numDependents > 0 && stateInfo.personalExemption.dependent) {
        personalExemption += numDependents * stateInfo.personalExemption.dependent;
      }
    }

    // Calculate taxable income
    const stateAGI = federalAGI;
    const taxableIncome = Math.max(0, stateAGI - standardDeduction - personalExemption);

    // Calculate tax using brackets
    const { tax, bracketDetails } = this.calculateTaxFromBrackets(taxableIncome, brackets);

    const taxBeforeCredits = tax;
    const credits = 0; // No credits implemented yet
    const stateTaxOwed = Math.max(0, taxBeforeCredits - credits);

    // Calculate refund or amount owed
    const stateRefundOrOwed = stateTaxOwed - stateWithholding;

    // Calculate effective rate
    const effectiveRate = federalAGI > 0 ? stateTaxOwed / federalAGI : 0;

    return {
      stateCode: stateInfo.code,
      stateName,
      hasIncomeTax: true,
      grossIncome: federalAGI,
      adjustments: 0,
      stateAGI,
      standardDeduction,
      personalExemption,
      taxableIncome,
      taxBeforeCredits,
      credits,
      stateTaxOwed,
      stateWithholding,
      stateRefundOrOwed,
      effectiveRate,
      brackets: bracketDetails,
    };
  }

  /**
   * Calculate tax from progressive brackets
   */
  private calculateTaxFromBrackets(
    taxableIncome: number,
    brackets: StateTaxBracket[]
  ): {
    tax: number;
    bracketDetails: { bracket: StateTaxBracket; incomeInBracket: number; taxFromBracket: number }[];
  } {
    let tax = 0;
    const bracketDetails: { bracket: StateTaxBracket; incomeInBracket: number; taxFromBracket: number }[] = [];

    for (const bracket of brackets) {
      if (taxableIncome <= bracket.min) {
        break;
      }

      const incomeInBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
      if (incomeInBracket > 0) {
        const taxFromBracket = incomeInBracket * bracket.rate;
        tax += taxFromBracket;
        bracketDetails.push({
          bracket,
          incomeInBracket,
          taxFromBracket,
        });
      }
    }

    return { tax, bracketDetails };
  }

  /**
   * Convert FilingStatus to the key used in state tax data
   */
  private getFilingStatusKey(
    filingStatus: FilingStatus
  ): 'single' | 'marriedFilingJointly' | 'marriedFilingSeparately' | 'headOfHousehold' {
    switch (filingStatus) {
      case 'single':
        return 'single';
      case 'married-jointly':
        return 'marriedFilingJointly';
      case 'head-of-household':
        return 'headOfHousehold';
      default:
        return 'single';
    }
  }

  /**
   * Get list of states that have income tax
   */
  getStatesWithIncomeTax(): { code: StateCode; name: string }[] {
    return Object.values(STATE_TAX_DATA)
      .filter((state) => state.hasIncomeTax)
      .map((state) => ({ code: state.code, name: state.name }));
  }

  /**
   * Get list of states without income tax
   */
  getStatesWithoutIncomeTax(): { code: StateCode; name: string }[] {
    return Object.values(STATE_TAX_DATA)
      .filter((state) => !state.hasIncomeTax)
      .map((state) => ({ code: state.code, name: state.name }));
  }

  /**
   * Get state tax info for display
   */
  getStateTaxInfo(stateCode: StateCode): StateTaxInfo | null {
    return STATE_TAX_DATA[stateCode] || null;
  }

  /**
   * Format state tax summary for display
   */
  formatStateTaxSummary(result: StateTaxResult): string {
    if (!result.hasIncomeTax) {
      return `${result.stateName} has no state income tax.`;
    }

    const refundOrOwed = result.stateRefundOrOwed;
    if (refundOrOwed < 0) {
      return `${result.stateName} refund: $${Math.abs(refundOrOwed).toLocaleString()}`;
    } else if (refundOrOwed > 0) {
      return `${result.stateName} tax owed: $${refundOrOwed.toLocaleString()}`;
    } else {
      return `${result.stateName} tax: $0 (even)`;
    }
  }
}
