import { Form1098T } from './form-1098-t.model';
import { StudentEducationInfo, createDefaultStudentEducationInfo } from './education-credit.model';

/**
 * Education section of tax return
 * Contains 1098-T forms and student education information for credit eligibility
 */
export interface Education {
  hasEducationExpenses: boolean;
  form1098Ts: Form1098T[];
  studentInfo: StudentEducationInfo;
}

export function createEmptyEducation(): Education {
  return {
    hasEducationExpenses: false,
    form1098Ts: [],
    studentInfo: createDefaultStudentEducationInfo(),
  };
}
