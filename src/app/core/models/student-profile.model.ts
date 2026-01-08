export type StudentType = 'high-school' | 'college' | 'working-adult';

export interface StudentProfile {
  studentType: StudentType;
  isInCollege: boolean;
  hasStudentLoans: boolean;
}

export function createEmptyStudentProfile(): StudentProfile {
  return {
    studentType: 'high-school',
    isInCollege: false,
    hasStudentLoans: false,
  };
}

export const STUDENT_TYPE_LABELS: Record<StudentType, string> = {
  'high-school': 'High School Student',
  'college': 'College Student',
  'working-adult': 'Recent Graduate / Working Adult',
};

export const STUDENT_TYPE_DESCRIPTIONS: Record<StudentType, string> = {
  'high-school': 'Working part-time or doing gig work while in high school',
  'college': 'Enrolled in college or trade school, may have tuition credits',
  'working-adult': 'Graduated and working, may have student loan payments',
};
