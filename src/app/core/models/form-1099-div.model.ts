export interface Form1099DIV {
  id: string;
  // Payer information
  payerName: string;
  payerTin: string;
  // Recipient information
  recipientTin: string;
  recipientName: string;
  // Box 1a: Total ordinary dividends
  ordinaryDividends: number;
  // Box 1b: Qualified dividends (taxed at lower capital gains rates)
  qualifiedDividends: number;
  // Box 2a: Total capital gain distributions
  capitalGainDistributions: number;
  // Box 2b: Unrecaptured Section 1250 gain
  unrecapturedSection1250Gain: number;
  // Box 3: Nondividend distributions
  nondividendDistributions: number;
  // Box 4: Federal income tax withheld
  federalWithheld: number;
  // Box 5: Section 199A dividends
  section199ADividends: number;
  // Box 6: Investment expenses
  investmentExpenses: number;
  // Box 7: Foreign tax paid
  foreignTaxPaid: number;
}

export function createEmptyForm1099DIV(): Form1099DIV {
  return {
    id: crypto.randomUUID(),
    payerName: '',
    payerTin: '',
    recipientTin: '',
    recipientName: '',
    ordinaryDividends: 0,
    qualifiedDividends: 0,
    capitalGainDistributions: 0,
    unrecapturedSection1250Gain: 0,
    nondividendDistributions: 0,
    federalWithheld: 0,
    section199ADividends: 0,
    investmentExpenses: 0,
    foreignTaxPaid: 0,
  };
}
