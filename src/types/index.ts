export type BodyPart = 'neck' | 'shoulder' | 'elbow' | 'wrist' | 'lumbarSpine' | 'hip' | 'knee' | 'ankle';

export type Side = 'left' | 'right' | 'bilateral';
export type Surface = 'anterior' | 'posterior' | 'medial' | 'lateral';

export interface SymptomGroup {
  id: string;
  location: string;
  side: Side;
  symptoms: string[];
  severity: number;
  description: string;
  onset: string;
  aggravating: string[];
  alleviating: string[];
}

export interface Problem {
  id: string;
  bodyPart: BodyPart;
  symptomGroups: SymptomGroup[];
}

export type EventType = 'mdVisit' | 'dxImaging' | 'medication' | 'rehabVisit' | 'other';

export type Prefix = 'Mr' | 'Mrs' | 'Ms' | 'Dr' | 'Other';
export type Suffix = 'Jr' | 'Sr' | 'II' | 'III' | 'IV' | 'Other';
export type EmploymentStatus = 'employed' | 'notEmployed';
export type Relationship = 'spouse' | 'parent' | 'child' | 'sibling' | 'friend' | 'other';
export type TestResult = 'positive' | 'negative' | 'inconclusive';

export interface PatientForm {
  evaluationDate: string; // ISO date string
  demographics: {
    prefix?: Prefix;
    prefixOther?: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    suffix?: Suffix;
    suffixOther?: string;
    dateOfBirth: string;
    address: string;
    phone: string;
    email: string;
    photo?: string; // Base64 encoded image data
    sports?: string[]; // Array of sports/activities
    gender?: string;
    preferredPronouns?: string;
    bodyType?: string;
  };
  employer?: {
    name: string;
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
  };
  employmentStatus: EmploymentStatus;
  emergencyContact: {
    firstName: string;
    lastName: string;
    relationship: Relationship;
    relationshipOther?: string;
    phone: string;
    email: string;
  };
  // Summary inclusion flags
  summaryInclusion: {
    demographics: boolean;
    employer: boolean;
    emergencyContact: boolean;
    problems: boolean;
    timeline: boolean;
    rangeOfMotion: boolean;
    specialTests: boolean;
    strengthTesting: boolean;
    narrative: boolean;
  };
  problems: Problem[];
  timeline: Array<{
    id: string;
    date: string;
    bodyParts: BodyPart[];
    eventType: EventType;
    eventTypeOther?: string;
    description: string;
  }>;
  rangeOfMotion: {
    [key in BodyPart]?: {
      active: {
        left?: number;
        right?: number;
        value?: number;
      };
      passive: {
        left?: number;
        right?: number;
        value?: number;
      };
      notes?: string;
    };
  };
  specialTests: {
    [key in BodyPart]?: Array<{
      name: string;
      result: {
        left?: TestResult;
        right?: TestResult;
        value?: TestResult;
      };
      notes?: string;
    }>;
  };
  strengthTesting: {
    [key in BodyPart]?: {
      left?: number;
      right?: number;
      value?: number;
      notes?: string;
    };
  };
}