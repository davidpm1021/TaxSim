import { Injectable } from '@angular/core';
import { FilingStatus, FILING_STATUS_LABELS } from '@core/models';
import {
  TAX_YEAR,
  TAX_BRACKETS,
  STANDARD_DEDUCTIONS,
  DEDUCTION_LIMITS,
  CHILD_TAX_CREDIT,
  US_STATES,
  TaxBracket,
} from '@core/constants';

export interface FilingStatusOption {
  value: FilingStatus;
  label: string;
  standardDeduction: number;
}

export interface StateOption {
  code: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class TaxDataService {
  readonly taxYear = TAX_YEAR;

  getFilingStatusOptions(): FilingStatusOption[] {
    return (Object.keys(FILING_STATUS_LABELS) as FilingStatus[]).map((status) => ({
      value: status,
      label: FILING_STATUS_LABELS[status],
      standardDeduction: STANDARD_DEDUCTIONS[status],
    }));
  }

  getStandardDeduction(filingStatus: FilingStatus): number {
    return STANDARD_DEDUCTIONS[filingStatus];
  }

  getTaxBrackets(filingStatus: FilingStatus): TaxBracket[] {
    return TAX_BRACKETS[filingStatus];
  }

  getDeductionLimits() {
    return {
      studentLoanInterest: DEDUCTION_LIMITS.studentLoanInterest,
      saltTaxes: DEDUCTION_LIMITS.saltTaxes,
      medicalExpenseFloorPercent: DEDUCTION_LIMITS.medicalExpenseFloor * 100,
    };
  }

  getChildTaxCreditInfo() {
    return {
      maxPerChild: CHILD_TAX_CREDIT.maxPerChild,
      refundableMax: CHILD_TAX_CREDIT.refundableMax,
      maxChildAge: CHILD_TAX_CREDIT.childMaxAge,
    };
  }

  getStateOptions(): StateOption[] {
    return US_STATES;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  formatPercent(rate: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(rate);
  }
}
