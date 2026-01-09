/**
 * Simplified Schedule C (Profit or Loss From Business)
 * For gig workers and freelancers with 1099 income
 */
export interface ScheduleC {
  id: string;
  businessDescription: string; // "Delivery driver", "Freelance tutoring", etc.

  // Expenses
  mileage: MileageExpense;
  supplies: number;           // Delivery bags, equipment, etc.
  phoneInternet: number;      // Business use portion
  platformFees: number;       // Fees deducted by apps (already taken from payments)
  otherExpenses: number;
  otherExpensesDescription: string;

  // Calculated (stored for reference)
  totalExpenses: number;
}

export interface MileageExpense {
  totalMiles: number;
  calculatedDeduction: number;
}

export function createEmptyScheduleC(): ScheduleC {
  return {
    id: crypto.randomUUID(),
    businessDescription: '',
    mileage: {
      totalMiles: 0,
      calculatedDeduction: 0,
    },
    supplies: 0,
    phoneInternet: 0,
    platformFees: 0,
    otherExpenses: 0,
    otherExpensesDescription: '',
    totalExpenses: 0,
  };
}

export function calculateScheduleCExpenses(scheduleC: ScheduleC, mileageRate: number): number {
  const mileageDeduction = scheduleC.mileage.totalMiles * mileageRate;
  return mileageDeduction +
         scheduleC.supplies +
         scheduleC.phoneInternet +
         scheduleC.platformFees +
         scheduleC.otherExpenses;
}
