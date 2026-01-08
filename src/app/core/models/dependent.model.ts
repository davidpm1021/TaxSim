export type DependentRelationship =
  | 'child'
  | 'stepchild'
  | 'foster-child'
  | 'sibling'
  | 'parent'
  | 'other';

export const DEPENDENT_RELATIONSHIP_LABELS: Record<DependentRelationship, string> = {
  'child': 'Child',
  'stepchild': 'Stepchild',
  'foster-child': 'Foster Child',
  'sibling': 'Sibling',
  'parent': 'Parent',
  'other': 'Other',
};

export interface Dependent {
  id: string;
  firstName: string;
  relationship: DependentRelationship;
  age: number;
  livedWithFiler: boolean;
}
