export interface Form1099NEC {
  id: string;
  payerName: string;
  nonemployeeCompensation: number; // Box 1
}

export function createEmptyForm1099NEC(): Form1099NEC {
  return {
    id: crypto.randomUUID(),
    payerName: '',
    nonemployeeCompensation: 0,
  };
}
