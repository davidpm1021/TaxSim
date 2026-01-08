import { Dependent } from './dependent.model';
import { FilingStatus } from './filing-status.model';

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO date string
  filingStatus: FilingStatus;
  claimedAsDependent: boolean;
  hasDependents: boolean;
  dependents: Dependent[];
}

export function createEmptyPersonalInfo(): PersonalInfo {
  return {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    filingStatus: 'single',
    claimedAsDependent: false,
    hasDependents: false,
    dependents: [],
  };
}
