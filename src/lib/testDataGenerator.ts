import { v4 as uuidv4 } from 'uuid';
import { addMonths, subMonths, format } from 'date-fns';
import { bodyParts, specialTests, jointROM, strengthTests } from './constants';

const generateRandomROM = (min: number, max: number, improvement = 0) => {
  const base = Math.floor(Math.random() * (max - min + 1)) + min;
  return Math.min(max, base + improvement);
};

const generateRandomStrength = (baseValue: number, improvement = 0) => {
  return Math.round(Math.min(5, baseValue + improvement));
};

const generateRandomTestResult = (previousResult?: string, improvement = false) => {
  if (previousResult && improvement) {
    return previousResult === 'positive' ? 'negative' : previousResult;
  }
  const results = ['positive', 'negative', 'inconclusive'];
  return results[Math.floor(Math.random() * results.length)];
};

const patientProfiles = [
  {
    firstName: 'John',
    lastName: 'Smith',
    dateOfBirth: '1985-03-15',
    condition: 'Post-surgical ACL reconstruction',
    parts: ['knee', 'hip'],
    employed: true
  },
  {
    firstName: 'Mary',
    lastName: 'Johnson',
    dateOfBirth: '1992-07-22',
    condition: 'Rotator cuff injury',
    parts: ['shoulder'],
    employed: true
  },
  {
    firstName: 'Robert',
    lastName: 'Williams',
    dateOfBirth: '1978-11-30',
    condition: 'Chronic low back pain',
    parts: ['lumbarSpine'],
    employed: true
  },
  {
    firstName: 'Patricia',
    lastName: 'Brown',
    dateOfBirth: '1965-09-08',
    condition: 'Cervical radiculopathy',
    parts: ['cervicalSpine', 'shoulder'],
    employed: false
  },
  {
    firstName: 'Michael',
    lastName: 'Davis',
    dateOfBirth: '1988-04-25',
    condition: 'Tennis elbow',
    parts: ['elbow', 'wrist'],
    employed: true
  },
  {
    firstName: 'Jennifer',
    lastName: 'Garcia',
    dateOfBirth: '1995-01-12',
    condition: 'Ankle sprain',
    parts: ['ankle', 'knee'],
    employed: true
  },
  {
    firstName: 'William',
    lastName: 'Miller',
    dateOfBirth: '1972-06-18',
    condition: 'Multiple joint arthritis',
    parts: ['hip', 'knee', 'ankle'],
    employed: false
  },
  {
    firstName: 'Elizabeth',
    lastName: 'Wilson',
    dateOfBirth: '1983-12-05',
    condition: 'Work-related shoulder injury',
    parts: ['shoulder', 'cervicalSpine'],
    employed: true
  }
];

const employers = [
  {
    name: 'Tech Solutions Inc',
    streetAddress: '123 Innovation Way',
    city: 'Austin',
    state: 'TX',
    zipCode: '78701',
    phone: '(512) 555-0123'
  },
  {
    name: 'Healthcare Partners',
    streetAddress: '456 Medical Center Blvd',
    city: 'Houston',
    state: 'TX',
    zipCode: '77001',
    phone: '(713) 555-0456'
  },
  {
    name: 'Construction Experts LLC',
    streetAddress: '789 Builder Road',
    city: 'Dallas',
    state: 'TX',
    zipCode: '75201',
    phone: '(214) 555-0789'
  }
];

const emergencyContacts = [
  {
    firstName: 'James',
    lastName: 'Smith',
    relationship: 'spouse',
    phone: '(555) 123-4567',
    email: 'james.smith@email.com'
  },
  {
    firstName: 'Sarah',
    lastName: 'Johnson',
    relationship: 'parent',
    phone: '(555) 234-5678',
    email: 'sarah.johnson@email.com'
  },
  {
    firstName: 'David',
    lastName: 'Williams',
    relationship: 'sibling',
    phone: '(555) 345-6789',
    email: 'david.williams@email.com'
  }
];

export function generateTestEvaluation(profile: any, evalIndex: number, baseDate: Date) {
  const evalDate = format(addMonths(baseDate, evalIndex), 'yyyy-MM-dd');
  const improvement = evalIndex * 0.5; // Gradual improvement factor

  const evaluation = {
    id: uuidv4(),
    evaluationDate: evalDate,
    selectedParts: profile.parts,
    
    demographics: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      dateOfBirth: profile.dateOfBirth,
      address: '123 Main St',
      phone: '(555) 555-5555',
      email: `${profile.firstName.toLowerCase()}.${profile.lastName.toLowerCase()}@email.com`
    },

    employmentStatus: profile.employed ? 'employed' : 'notEmployed',
    employer: profile.employed ? employers[Math.floor(Math.random() * employers.length)] : undefined,
    
    emergencyContact: emergencyContacts[Math.floor(Math.random() * emergencyContacts.length)],
    
    rangeOfMotion: {},
    specialTests: {},
    strengthTesting: {},
    
    timeline: [
      {
        date: evalDate,
        eventType: evalIndex === 0 ? 'initialInjury' : 'rehabVisit',
        description: evalIndex === 0 
          ? `Initial evaluation for ${profile.condition}`
          : '', // Remove default improvement comment
        bodyParts: profile.parts
      }
    ]
  };

  // Generate ROM data
  profile.parts.forEach(partId => {
    const romData = jointROM[partId];
    if (romData) {
      evaluation.rangeOfMotion[partId] = {};
      Object.entries(romData).forEach(([motion, motionData]) => {
        if (motionData && typeof motionData === 'object' && 'max' in motionData) {
          const { max } = motionData as { max: number };
          const baseROM = generateRandomROM(max * 0.6, max * 0.8);
          evaluation.rangeOfMotion[partId][motion] = {
            left: { 
              arom: generateRandomROM(baseROM, max, improvement * 5),
              prom: generateRandomROM(baseROM + 5, max, improvement * 5)
            },
            right: {
              arom: generateRandomROM(baseROM, max, improvement * 5),
              prom: generateRandomROM(baseROM + 5, max, improvement * 5)
            }
          };
        }
      });
    }
  });

  // Generate Special Tests data
  profile.parts.forEach(partId => {
    const tests = specialTests[partId];
    if (tests) {
      evaluation.specialTests[partId] = {};
      Object.keys(tests.tests).forEach(testId => {
        evaluation.specialTests[partId][testId] = {
          left: generateRandomTestResult(undefined, evalIndex > 0),
          right: generateRandomTestResult(undefined, evalIndex > 0),
          notes: '' // Remove default improvement comment
        };
      });
    }
  });

  // Generate Strength Testing data
  profile.parts.forEach(partId => {
    const tests = strengthTests[partId];
    if (tests) {
      evaluation.strengthTesting[partId] = {};
      Object.keys(tests).forEach(movement => {
        const baseStrength = 3 + Math.random();
        evaluation.strengthTesting[partId][movement] = {
          left: generateRandomStrength(baseStrength, improvement),
          right: generateRandomStrength(baseStrength, improvement),
          notes: '' // Remove default notes
        };
      });
    }
  });

  return evaluation;
}

export function generateTestData() {
  return patientProfiles.map(profile => {
    const patientId = uuidv4();
    const baseDate = subMonths(new Date(), 3);
    
    return {
      id: patientId,
      ...profile,
      evaluations: [0, 1, 2].map(index => 
        generateTestEvaluation(profile, index, baseDate)
      )
    };
  });
}