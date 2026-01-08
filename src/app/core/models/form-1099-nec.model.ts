export interface Form1099NEC {
  id: string;
  // Payer information
  payerName: string;
  payerAddress: string;
  payerCityStateZip: string;
  payerTin: string;
  // Recipient information
  recipientTin: string;
  recipientName: string;
  recipientAddress: string;
  recipientCityStateZip: string;
  accountNumber: string;
  // Box 1: Nonemployee compensation
  nonemployeeCompensation: number;
  // Box 2: Payer made direct sales totaling $5,000 or more
  directSales: boolean;
  // Box 4: Federal income tax withheld
  federalWithheld: number;
  // State information (Box 5-7)
  state: string;
  statePayerId: string;
  stateIncome: number;
}

export function createEmptyForm1099NEC(): Form1099NEC {
  return {
    id: crypto.randomUUID(),
    payerName: '',
    payerAddress: '',
    payerCityStateZip: '',
    payerTin: '',
    recipientTin: '',
    recipientName: '',
    recipientAddress: '',
    recipientCityStateZip: '',
    accountNumber: '',
    nonemployeeCompensation: 0,
    directSales: false,
    federalWithheld: 0,
    state: '',
    statePayerId: '',
    stateIncome: 0,
  };
}
