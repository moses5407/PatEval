export const prefixes = [
  { value: 'mr', label: 'Mr.' },
  { value: 'mrs', label: 'Mrs.' },
  { value: 'ms', label: 'Ms.' },
  { value: 'dr', label: 'Dr.' },
  { value: 'other', label: 'Other' }
] as const;

export const suffixes = [
  { value: 'jr', label: 'Jr.' },
  { value: 'sr', label: 'Sr.' },
  { value: 'ii', label: 'II' },
  { value: 'iii', label: 'III' },
  { value: 'iv', label: 'IV' },
  { value: 'other', label: 'Other' }
] as const;

export const relationships = [
  { value: 'spouse', label: 'Spouse' },
  { value: 'parent', label: 'Parent' },
  { value: 'child', label: 'Child' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'friend', label: 'Friend' },
  { value: 'other', label: 'Other' }
] as const;

export const employmentStatuses = [
  { value: 'employed', label: 'Employed' },
  { value: 'unemployed', label: 'Not Employed' }
] as const;