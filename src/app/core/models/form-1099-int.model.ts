export interface Form1099INT {
  id: string;
  // Payer information
  payerName: string;
  payerTin: string;
  // Recipient information
  recipientTin: string;
  recipientName: string;
  // Box 1: Interest income
  interestIncome: number;
  // Box 2: Early withdrawal penalty
  earlyWithdrawalPenalty: number;
  // Box 3: Interest on U.S. Savings Bonds and Treasury obligations
  usSavingsBondInterest: number;
  // Box 4: Federal income tax withheld
  federalWithheld: number;
  // Box 8: Tax-exempt interest
  taxExemptInterest: number;
}

export function createEmptyForm1099INT(): Form1099INT {
  return {
    id: crypto.randomUUID(),
    payerName: '',
    payerTin: '',
    recipientTin: '',
    recipientName: '',
    interestIncome: 0,
    earlyWithdrawalPenalty: 0,
    usSavingsBondInterest: 0,
    federalWithheld: 0,
    taxExemptInterest: 0,
  };
}
