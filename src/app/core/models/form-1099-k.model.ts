export interface Form1099K {
  id: string;
  // Filer (Payment Settlement Entity) information
  payerName: string; // Platform name (e.g., Venmo, PayPal, DoorDash)
  payerTin: string;
  // Payee (recipient) information
  recipientTin: string;
  recipientName: string;
  // Box 1a: Gross amount of payment card/third party network transactions
  grossAmount: number;
  // Box 1b: Card not present transactions
  cardNotPresentTransactions: number;
  // Box 2: Merchant category code
  merchantCategoryCode: string;
  // Box 3: Number of payment transactions
  numberOfTransactions: number;
  // Box 4: Federal income tax withheld
  federalWithheld: number;
  // Box 5a-5l: Gross amount by month (simplified to quarterly)
  januaryAmount: number;
  februaryAmount: number;
  marchAmount: number;
  aprilAmount: number;
  mayAmount: number;
  juneAmount: number;
  julyAmount: number;
  augustAmount: number;
  septemberAmount: number;
  octoberAmount: number;
  novemberAmount: number;
  decemberAmount: number;
  // State information
  state: string;
  stateId: string;
  stateIncome: number;
}

export function createEmptyForm1099K(): Form1099K {
  return {
    id: crypto.randomUUID(),
    payerName: '',
    payerTin: '',
    recipientTin: '',
    recipientName: '',
    grossAmount: 0,
    cardNotPresentTransactions: 0,
    merchantCategoryCode: '',
    numberOfTransactions: 0,
    federalWithheld: 0,
    januaryAmount: 0,
    februaryAmount: 0,
    marchAmount: 0,
    aprilAmount: 0,
    mayAmount: 0,
    juneAmount: 0,
    julyAmount: 0,
    augustAmount: 0,
    septemberAmount: 0,
    octoberAmount: 0,
    novemberAmount: 0,
    decemberAmount: 0,
    state: '',
    stateId: '',
    stateIncome: 0,
  };
}
