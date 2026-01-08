import { Dependent } from './dependent.model';
import { FilingStatus } from './filing-status.model';
import { StudentProfile, createEmptyStudentProfile } from './student-profile.model';

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO date string
  filingStatus: FilingStatus;
  claimedAsDependent: boolean;
  hasDependents: boolean;
  dependents: Dependent[];
  studentProfile: StudentProfile;
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
    studentProfile: createEmptyStudentProfile(),
  };
}
