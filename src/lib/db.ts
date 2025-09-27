import { v4 as uuidv4 } from 'uuid';
import { openDB, IDBPDatabase } from 'idb';
import { DuplicatePatientError, PatientNotFoundError, SaveFailedError, TransactionFailedError } from './errors';

const DB_NAME = 'patient-evaluation';
const DB_VERSION = 22;

let dbInstance: IDBPDatabase | null = null;
let initializationPromise: Promise<IDBPDatabase> | null = null;

export async function initDB() {
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = openDB(DB_NAME, DB_VERSION, {
    async upgrade(db, oldVersion, newVersion) {
      [...db.objectStoreNames].forEach(store => db.deleteObjectStore(store));

      const patientStore = db.createObjectStore('patients', { 
        keyPath: 'id',
        autoIncrement: false 
      });
      patientStore.createIndex('nameAndDob', ['firstName', 'lastName', 'dateOfBirth'], { 
        unique: true 
      });
      
      const evaluationStore = db.createObjectStore('evaluations', { keyPath: 'id' });
      evaluationStore.createIndex('patientId', 'patientId');
      evaluationStore.createIndex('evaluationDate', 'evaluationDate');
    },
    blocked() {
      console.warn('Database upgrade blocked. Please close other tabs/windows.');
    },
    blocking() {
      if (dbInstance) {
        dbInstance.close();
        dbInstance = null;
      }
    },
    terminated() {
      dbInstance = null;
      initializationPromise = null;
    }
  });

  try {
    dbInstance = await initializationPromise;
    return dbInstance;
  } catch (error) {
    initializationPromise = null;
    throw error;
  }
}

export async function clearDatabase() {
  const db = await initDB();
  const tx = db.transaction(['patients', 'evaluations'], 'readwrite');
  try {
    await Promise.all([
      tx.objectStore('patients').clear(),
      tx.objectStore('evaluations').clear()
    ]);
    await tx.done;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new TransactionFailedError('Database operation was aborted');
    }
    throw error;
  }
}

export async function isDatabaseEmpty() {
  const db = await initDB();
  const tx = db.transaction('patients', 'readonly');
  try {
    const count = await tx.objectStore('patients').count();
    return count === 0;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new TransactionFailedError('Database operation was aborted');
    }
    throw error;
  }
}

export async function addTestPatient(patientData: any) {
  const db = await initDB();
  const tx = db.transaction(['patients', 'evaluations'], 'readwrite');
  
  try {
    const { evaluations, ...patient } = patientData;
    
    await tx.objectStore('patients').add({
      ...patient,
      id: patient.id || uuidv4()
    });
    
    for (const evaluation of evaluations) {
      await tx.objectStore('evaluations').add({
        ...evaluation,
        id: evaluation.id || uuidv4(),
        patientId: patient.id,
      });
    }
    
    await tx.done;
  } catch (error) {
    if (error.name === 'ConstraintError') {
      console.warn(`Patient ${patientData.firstName} ${patientData.lastName} already exists`);
    } else if (error.name === 'AbortError') {
      throw new TransactionFailedError('Database operation was aborted');
    } else {
      throw error;
    }
  }
}

export async function searchPatients(firstName: string, lastName: string, dateOfBirth: string) {
  const db = await initDB();
  const tx = db.transaction('patients', 'readonly');
  
  try {
    const store = tx.objectStore('patients');
    const patients = await store.getAll();

    if (!firstName && !lastName && !dateOfBirth) {
      return patients;
    }

    const searchFirstName = firstName?.toLowerCase().trim() || '';
    const searchLastName = lastName?.toLowerCase().trim() || '';

    // Use Map to deduplicate by patient ID
    const patientMap = new Map();
    patients.forEach(patient => {
      if (
        (searchFirstName === '' || patient.firstName.toLowerCase().trim().includes(searchFirstName)) &&
        (searchLastName === '' || patient.lastName.toLowerCase().trim().includes(searchLastName)) &&
        (!dateOfBirth || patient.dateOfBirth === dateOfBirth)
      ) {
        patientMap.set(patient.id, patient);
      }
    });

    return Array.from(patientMap.values());
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new TransactionFailedError('Database operation was aborted');
    }
    throw error;
  }
}

export async function getPatientEvaluations(patientId: string) {
  const db = await initDB();
  const tx = db.transaction('evaluations', 'readonly');
  
  try {
    const index = tx.objectStore('evaluations').index('patientId');
    const evaluations = await index.getAll(patientId);
    
    return evaluations.sort((a, b) => 
      new Date(b.evaluationDate).getTime() - new Date(a.evaluationDate).getTime()
    );
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new TransactionFailedError('Database operation was aborted');
    }
    throw error;
  }
}

export async function saveFormData(data: any, existingPatientId: string | null) {
  console.log('=== DB SAVE DEBUG: Starting database save ===');
  console.log('Data received by saveFormData:', JSON.stringify(data, null, 2));
  console.log('Demographics in received data:', data.demographics);
  console.log('Existing Patient ID:', existingPatientId);
  
  const db = await initDB();
  
  try {
    let patientId = existingPatientId;
    
    if (!patientId) {
      const patientTx = db.transaction('patients', 'readwrite');
      try {
        patientId = uuidv4();
        const newPatient = {
          id: patientId,
          firstName: data.demographics.firstName,
          lastName: data.demographics.lastName,
          dateOfBirth: data.demographics.dateOfBirth
        };
        await patientTx.objectStore('patients').add(newPatient);
        await patientTx.done;
        console.log('Created new patient:', newPatient);
      } catch (error) {
        if (error.name === 'AbortError') {
          throw new TransactionFailedError('Database operation was aborted');
        }
        throw error;
      }
    }

    const evalTx = db.transaction('evaluations', 'readwrite');
    try {
      const evalId = data.id || uuidv4();
      
      const evaluationData = {
        id: evalId,
        patientId,
        evaluationDate: data.evaluationDate,
        // Ensure all demographic data is properly saved
        demographics: {
          prefix: data.demographics?.prefix || '',
          prefixOther: data.demographics?.prefixOther || '',
          firstName: data.demographics?.firstName || '',
          middleName: data.demographics?.middleName || '',
          lastName: data.demographics?.lastName || '',
          suffix: data.demographics?.suffix || '',
          suffixOther: data.demographics?.suffixOther || '',
          dateOfBirth: data.demographics?.dateOfBirth || '',
          address: data.demographics?.address || '',
          phone: data.demographics?.phone || '',
          email: data.demographics?.email || '',
          photo: data.demographics?.photo || '',
          gender: data.demographics?.gender || '',
          preferredPronouns: data.demographics?.preferredPronouns || '',
          bodyType: data.demographics?.bodyType || '',
          sports: data.demographics?.sports || []
        },
        employmentStatus: data.employmentStatus || '',
        employer: data.employer ? { ...data.employer } : null,
        emergencyContact: data.emergencyContact ? { ...data.emergencyContact } : null,
        // Ensure observations are properly saved with all sections
        observations: {
          posture: {
            assessment: data.observations?.posture?.assessment || '',
            notes: data.observations?.posture?.notes || '',
            includeInSummary: data.observations?.posture?.includeInSummary || false
          },
          gait: {
            assessment: data.observations?.gait?.assessment || '',
            notes: data.observations?.gait?.notes || '',
            includeInSummary: data.observations?.gait?.includeInSummary || false
          },
          skinIntegumentary: {
            assessment: data.observations?.skinIntegumentary?.assessment || '',
            notes: data.observations?.skinIntegumentary?.notes || '',
            includeInSummary: data.observations?.skinIntegumentary?.includeInSummary || false,
            wounds: data.observations?.skinIntegumentary?.wounds || []
          },
          assistiveDevices: {
            devices: data.observations?.assistiveDevices?.devices || [],
            notes: data.observations?.assistiveDevices?.notes || '',
            includeInSummary: data.observations?.assistiveDevices?.includeInSummary || false
          },
          generalAppearance: {
            assessment: data.observations?.generalAppearance?.assessment || [],
            notes: data.observations?.generalAppearance?.notes || '',
            includeInSummary: data.observations?.generalAppearance?.includeInSummary || false
          },
          bodyType: {
            assessment: data.observations?.bodyType?.assessment || '',
            notes: data.observations?.bodyType?.notes || '',
            includeInSummary: data.observations?.bodyType?.includeInSummary || false
          }
        },
        // Ensure functional testing data is preserved
        functionalTesting: {
          upperQuarter: {
            shoulderFlexion: { result: data.functionalTesting?.upperQuarter?.shoulderFlexion?.result || '', notes: data.functionalTesting?.upperQuarter?.shoulderFlexion?.notes || '' },
            functionalReach: { result: data.functionalTesting?.upperQuarter?.functionalReach?.result || '', notes: data.functionalTesting?.upperQuarter?.functionalReach?.notes || '' },
            ndi: { result: data.functionalTesting?.upperQuarter?.ndi?.result || '', notes: data.functionalTesting?.upperQuarter?.ndi?.notes || '' },
            dashQuickDash: { result: data.functionalTesting?.upperQuarter?.dashQuickDash?.result || '', notes: data.functionalTesting?.upperQuarter?.dashQuickDash?.notes || '' },
            gripStrength: { result: data.functionalTesting?.upperQuarter?.gripStrength?.result || '', notes: data.functionalTesting?.upperQuarter?.gripStrength?.notes || '' }
          },
          lowerQuarter: {
            singleLegStance: { result: data.functionalTesting?.lowerQuarter?.singleLegStance?.result || '', notes: data.functionalTesting?.lowerQuarter?.singleLegStance?.notes || '' },
            functionalSquat: { result: data.functionalTesting?.lowerQuarter?.functionalSquat?.result || '', notes: data.functionalTesting?.lowerQuarter?.functionalSquat?.notes || '' },
            stepDown: { result: data.functionalTesting?.lowerQuarter?.stepDown?.result || '', notes: data.functionalTesting?.lowerQuarter?.stepDown?.notes || '' },
            tug: { result: data.functionalTesting?.lowerQuarter?.tug?.result || '', notes: data.functionalTesting?.lowerQuarter?.tug?.notes || '' },
            sixMinWalk: { result: data.functionalTesting?.lowerQuarter?.sixMinWalk?.result || '', notes: data.functionalTesting?.lowerQuarter?.sixMinWalk?.notes || '' },
            starExcursion: { result: data.functionalTesting?.lowerQuarter?.starExcursion?.result || '', notes: data.functionalTesting?.lowerQuarter?.starExcursion?.notes || '' }
          },
          wholeBody: {
            fms: { result: data.functionalTesting?.wholeBody?.fms?.result || '', notes: data.functionalTesting?.wholeBody?.fms?.notes || '' },
            bergBalance: { result: data.functionalTesting?.wholeBody?.bergBalance?.result || '', notes: data.functionalTesting?.wholeBody?.bergBalance?.notes || '' },
            adlAssessment: { result: data.functionalTesting?.wholeBody?.adlAssessment?.result || '', notes: data.functionalTesting?.wholeBody?.adlAssessment?.notes || '' },
            staticPosture: { result: data.functionalTesting?.wholeBody?.staticPosture?.result || '', notes: data.functionalTesting?.wholeBody?.staticPosture?.notes || '' },
            gaitAnalysis: { result: data.functionalTesting?.wholeBody?.gaitAnalysis?.result || '', notes: data.functionalTesting?.wholeBody?.gaitAnalysis?.notes || '' }
          }
        },
        // Preserve summary inclusion settings
        summaryInclusion: {
          demographics: data.summaryInclusion?.demographics !== false,
          employer: data.summaryInclusion?.employer || false,
          emergencyContact: data.summaryInclusion?.emergencyContact || false,
          observations: data.summaryInclusion?.observations !== false,
          problems: data.summaryInclusion?.problems !== false,
          timeline: data.summaryInclusion?.timeline !== false,
          rangeOfMotion: data.summaryInclusion?.rangeOfMotion !== false,
          specialTests: data.summaryInclusion?.specialTests !== false,
          strengthTesting: data.summaryInclusion?.strengthTesting !== false,
          functionalTesting: data.summaryInclusion?.functionalTesting !== false,
          narrative: data.summaryInclusion?.narrative || false
        },
        selectedParts: [...(data.selectedParts || [])],
        problems: Object.fromEntries(
          Object.entries(data.problems || {}).map(([key, value]) => [
            key,
            {
              ...(value as any),
              symptomGroups: (value as any).symptomGroups?.map((group: any) => ({
                ...group,
                symptoms: [...(group.symptoms || [])],
                aggravating: [...(group.aggravating || [])],
                alleviating: [...(group.alleviating || [])]
              })) || []
            }
          ])
        ),
        timeline: (data.timeline || []).map((item: any) => ({
          ...item,
          bodyParts: [...(item.bodyParts || [])],
          eventType: item.eventType || [] // Don't spread - keep as array
        })),
        rangeOfMotion: data.rangeOfMotion || {},
        specialTests: data.specialTests || {},
        strengthTesting: data.strengthTesting || {}
      };
      
      console.log('=== DB SAVE DEBUG: Final evaluation data structure ===');
      console.log('Demographics being saved:', evaluationData.demographics);
      console.log('Complete evaluation data:', JSON.stringify(evaluationData, null, 2));
      
      await evalTx.objectStore('evaluations').put(evaluationData);
      await evalTx.done;
      
      console.log('✅ Successfully saved evaluation:', evalId);
      console.log('Demographics saved:', evaluationData.demographics);
      return { patientId, evalId };
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new TransactionFailedError('Database operation was aborted');
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in saveFormData:', error);
    throw error;
  }
}