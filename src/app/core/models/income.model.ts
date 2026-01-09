import { Form1099NEC } from './form-1099-nec.model';
import { Form1099INT } from './form-1099-int.model';
import { Form1099DIV } from './form-1099-div.model';
import { Form1099K } from './form-1099-k.model';
import { W2 } from './w2.model';

export interface Income {
  hasW2Income: boolean;
  has1099Income: boolean;
  hasInterestIncome: boolean;
  hasDividendIncome: boolean;
  has1099KIncome: boolean;
  w2s: W2[];
  form1099s: Form1099NEC[];
  form1099Ints: Form1099INT[];
  form1099Divs: Form1099DIV[];
  form1099Ks: Form1099K[];
}

export function createEmptyIncome(): Income {
  return {
    hasW2Income: false,
    has1099Income: false,
    hasInterestIncome: false,
    hasDividendIncome: false,
    has1099KIncome: false,
    w2s: [],
    form1099s: [],
    form1099Ints: [],
    form1099Divs: [],
    form1099Ks: [],
  };
}
