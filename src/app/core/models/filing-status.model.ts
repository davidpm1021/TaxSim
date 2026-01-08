export type FilingStatus = 'single' | 'married-jointly' | 'head-of-household';

export const FILING_STATUS_LABELS: Record<FilingStatus, string> = {
  'single': 'Single',
  'married-jointly': 'Married Filing Jointly',
  'head-of-household': 'Head of Household',
};
