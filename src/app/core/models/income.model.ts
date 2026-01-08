import { Form1099NEC } from './form-1099-nec.model';
import { Form1099INT } from './form-1099-int.model';
import { W2 } from './w2.model';

export interface Income {
  hasW2Income: boolean;
  has1099Income: boolean;
  hasInterestIncome: boolean;
  w2s: W2[];
  form1099s: Form1099NEC[];
  form1099Ints: Form1099INT[];
}

export function createEmptyIncome(): Income {
  return {
    hasW2Income: false,
    has1099Income: false,
    hasInterestIncome: false,
    w2s: [],
    form1099s: [],
    form1099Ints: [],
  };
}
