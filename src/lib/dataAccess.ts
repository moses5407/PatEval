import { v4 as uuidv4 } from 'uuid';
import { isMultiUserMode, supabase, getCurrentUserProfile } from './supabase';
import * as indexedDbApi from './db';

// Dual-mode data access layer
// Automatically chooses between IndexedDB (single-user) and Supabase (multi-user)

let isMultiUser: boolean | null = null;
let userProfile: any = null;

// Field mapping utilities for snake_case (DB) <-> camelCase (Frontend) conversion
const mapPatientFromDb = (dbPatient: any) => ({
  id: dbPatient.id,
  firstName: dbPatient.first_name,
  lastName: dbPatient.last_name,
  dateOfBirth: dbPatient.date_of_birth,
  gender: dbPatient.gender,
  email: dbPatient.email,
  phone: dbPatient.phone,
  address: dbPatient.address,
  medicalRecordNumber: dbPatient.medical_record_number,
  emergencyContactName: dbPatient.emergency_contact_name,
  emergencyContactPhone: dbPatient.emergency_contact_phone,
  employerName: dbPatient.employer_name,
  employerAddress: dbPatient.employer_address,
  employerCity: dbPatient.employer_city,
  employerState: dbPatient.employer_state,
  employerZipCode: dbPatient.employer_zip_code,
  employerPhone: dbPatient.employer_phone,
  notes: dbPatient.notes,
  clinicId: dbPatient.clinic_id,
  primaryTherapistId: dbPatient.primary_therapist_id,
  createdBy: dbPatient.created_by,
  createdAt: dbPatient.created_at,
  updatedAt: dbPatient.updated_at
});

const mapPatientToDb = (frontendPatient: any) => ({
  id: frontendPatient.id,
  first_name: frontendPatient.firstName,
  last_name: frontendPatient.lastName,
  date_of_birth: frontendPatient.dateOfBirth,
  gender: frontendPatient.gender,
  email: frontendPatient.email,
  phone: frontendPatient.phone,
  address: frontendPatient.address,
  medical_record_number: frontendPatient.medicalRecordNumber,
  emergency_contact_name: frontendPatient.emergencyContactName,
  emergency_contact_phone: frontendPatient.emergencyContactPhone,
  employer_name: frontendPatient.employerName,
  employer_address: frontendPatient.employerAddress,
  employer_city: frontendPatient.employerCity,
  employer_state: frontendPatient.employerState,
  employer_zip_code: frontendPatient.employerZipCode,
  employer_phone: frontendPatient.employerPhone,
  notes: frontendPatient.notes,
  clinic_id: frontendPatient.clinicId,
  primary_therapist_id: frontendPatient.primaryTherapistId,
  created_by: frontendPatient.createdBy,
  created_at: frontendPatient.createdAt,
  updated_at: frontendPatient.updatedAt
});

const mapEvaluationFromDb = (dbEvaluation: any) => ({
  id: dbEvaluation.id,
  patientId: dbEvaluation.patient_id,
  clinicId: dbEvaluation.clinic_id,
  createdBy: dbEvaluation.created_by,
  lastModifiedBy: dbEvaluation.last_modified_by,
  evaluationDate: dbEvaluation.evaluation_date,
  status: dbEvaluation.status,
  employmentStatus: dbEvaluation.employment_status,
  createdAt: dbEvaluation.created_at,
  updatedAt: dbEvaluation.updated_at
});

const mapEvaluationToDb = (frontendEvaluation: any) => ({
  id: frontendEvaluation.id,
  patient_id: frontendEvaluation.patientId,
  clinic_id: frontendEvaluation.clinicId,
  created_by: frontendEvaluation.createdBy,
  last_modified_by: frontendEvaluation.lastModifiedBy,
  evaluation_date: frontendEvaluation.evaluationDate,
  status: frontendEvaluation.status,
  employment_status: frontendEvaluation.employmentStatus,
  created_at: frontendEvaluation.createdAt,
  updated_at: frontendEvaluation.updatedAt
});

const mapRomFromDb = (dbRom: any) => ({
  id: dbRom.id,
  evaluationId: dbRom.evaluation_id,
  bodyPart: dbRom.body_part,
  motionType: dbRom.motion_type,
  activeLeft: dbRom.active_left,
  activeRight: dbRom.active_right,
  activeValue: dbRom.active_value,
  passiveLeft: dbRom.passive_left,
  passiveRight: dbRom.passive_right,
  passiveValue: dbRom.passive_value,
  isPainful: dbRom.is_painful,
  notes: dbRom.notes,
  createdAt: dbRom.created_at,
  romDefinitionId: dbRom.rom_definition_id
});

const mapStrengthFromDb = (dbStrength: any) => ({
  id: dbStrength.id,
  evaluationId: dbStrength.evaluation_id,
  leftValue: dbStrength.left_value,
  rightValue: dbStrength.right_value,
  singleValue: dbStrength.single_value,
  isPainful: dbStrength.is_painful,
  notes: dbStrength.notes,
  createdAt: dbStrength.created_at,
  testModeId: dbStrength.test_mode_id,
  strengthProtocolId: dbStrength.strength_protocol_id,
  bodyPartId: dbStrength.body_part_id,
  testSpeedDps: dbStrength.test_speed_dps,
  equipmentUsed: dbStrength.equipment_used,
  bodyPart: dbStrength.body_part
});

const mapSpecialTestFromDb = (dbTest: any) => ({
  id: dbTest.id,
  evaluationId: dbTest.evaluation_id,
  bodyPart: dbTest.body_part,
  testName: dbTest.test_name,
  leftResult: dbTest.left_result,
  rightResult: dbTest.right_result,
  singleResult: dbTest.single_result,
  isSignificant: dbTest.is_significant,
  notes: dbTest.notes,
  createdAt: dbTest.created_at,
  specialTestId: dbTest.special_test_id
});

const mapObservationFromDb = (dbObs: any) => ({
  id: dbObs.id,
  evaluationId: dbObs.evaluation_id,
  observationType: dbObs.observation_type,
  assessment: dbObs.assessment,
  notes: dbObs.notes,
  includeInSummary: dbObs.include_in_summary,
  createdAt: dbObs.created_at
});

const mapTimelineEventFromDb = (dbEvent: any) => ({
  id: dbEvent.id,
  evaluationId: dbEvent.evaluation_id,
  eventDate: dbEvent.event_date,
  eventType: dbEvent.event_type,
  description: dbEvent.description,
  createdAt: dbEvent.created_at
});

// Initialize and determine mode
export async function initializeDataAccess() {
  try {
    // First, always initialize IndexedDB for backward compatibility
    await indexedDbApi.initDB();
    
    // Check if multi-user mode should be enabled
    isMultiUser = await isMultiUserMode();
    
    if (isMultiUser) {
      userProfile = await getCurrentUserProfile();
      console.log('Running in multi-user mode with profile:', userProfile);
    } else {
      console.log('Running in single-user mode (IndexedDB)');
    }
    
    return { isMultiUser, userProfile };
  } catch (error) {
    console.warn('Failed to initialize multi-user mode, falling back to single-user:', error);
    isMultiUser = false;
    return { isMultiUser: false, userProfile: null };
  }
}

// Get current mode status
export function getDataAccessMode() {
  return { isMultiUser, userProfile };
}

// Patient operations
export async function searchPatients(firstName: string, lastName: string, dateOfBirth: string) {
  if (isMultiUser) {
    try {
      let query = supabase
        .from('patients')
        .select('*');
      
      if (firstName) {
        query = query.ilike('first_name', `%${firstName}%`);
      }
      if (lastName) {
        query = query.ilike('last_name', `%${lastName}%`);
      }
      if (dateOfBirth) {
        query = query.eq('date_of_birth', dateOfBirth);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      // Map snake_case DB fields to camelCase frontend fields
      return data?.map(patient => ({
        id: patient.id,
        firstName: patient.first_name,
        lastName: patient.last_name,
        dateOfBirth: patient.date_of_birth,
        // Include multi-user fields
        clinicId: patient.clinic_id,
        primaryTherapistId: patient.primary_therapist_id,
        createdBy: patient.created_by
      })) || [];
    } catch (error) {
      console.error('Multi-user patient search failed:', error);
      throw error;
    }
  } else {
    return indexedDbApi.searchPatients(firstName, lastName, dateOfBirth);
  }
}

export async function getEvaluationDetails(evaluationId: string) {
  if (isMultiUser) {
    try {
      // Get the specific evaluation and patient data separately to avoid nested query issues
      const { data: evaluation, error: evalError } = await supabase
        .from('evaluations')
        .select('*')
        .eq('id', evaluationId)
        .single();
      
      if (evalError) throw evalError;
      if (!evaluation) throw new Error('Evaluation not found');

      // Get patient data separately using snake_case column names
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select(`
          id,
          first_name,
          last_name,
          date_of_birth,
          phone,
          email,
          address,
          emergency_contact_name,
          emergency_contact_phone,
          employer_name,
          employer_address,
          employer_phone
        `)
        .eq('id', evaluation.patient_id)
        .single();
      
      if (patientError) throw patientError;
      if (!patient) throw new Error('Patient not found');

      // Fetch selected parts/problems
      const { data: selectedParts } = await supabase
        .from('evaluation_selected_parts_new')
        .select(`
          *,
          body_parts_new(
            id,
            name,
            description,
            body_region_id
          )
        `)
        .eq('evaluation_id', evaluationId);

      // Fetch timeline events using snake_case column names
      const { data: timelineEvents } = await supabase
        .from('timeline_events')
        .select('*')
        .eq('evaluation_id', evaluationId)
        .order('event_date', { ascending: true });

      // Fetch observations using snake_case column names
      const { data: observations } = await supabase
        .from('observations')
        .select('*')
        .eq('evaluation_id', evaluationId);

      // Fetch ROM measurements using snake_case column names
      const { data: romMeasurements } = await supabase
        .from('rom_measurements')
        .select('*')
        .eq('evaluation_id', evaluationId);

      // Fetch strength measurements using snake_case column names
      const { data: strengthMeasurements } = await supabase
        .from('strength_measurements')
        .select('*')
        .eq('evaluation_id', evaluationId);

      // Fetch special test results using snake_case column names
      const { data: specialTests } = await supabase
        .from('special_test_results')
        .select('*')
        .eq('evaluation_id', evaluationId);

      // Map evaluation fields from snake_case to camelCase
      const mappedEvaluation = mapEvaluationFromDb(evaluation);
      const mappedPatient = mapPatientFromDb(patient);
      
      return {
        id: mappedEvaluation.id,
        patientId: mappedEvaluation.patientId,
        evaluationDate: mappedEvaluation.evaluationDate,
        status: mappedEvaluation.status || 'draft',
        
        // Patient demographics - mapped from snake_case
        demographics: {
          firstName: mappedPatient.firstName,
          lastName: mappedPatient.lastName,
          dateOfBirth: mappedPatient.dateOfBirth,
          phone: mappedPatient.phone,
          email: mappedPatient.email,
          address: mappedPatient.address
        },
        
        // Emergency contact - mapped from snake_case
        emergencyContact: {
          name: mappedPatient.emergencyContactName,
          phone: mappedPatient.emergencyContactPhone
        },
        
        // Employer information - mapped from snake_case
        employer: {
          name: mappedPatient.employerName,
          address: mappedPatient.employerAddress,
          phone: mappedPatient.employerPhone
        },
        
        // Employment status - mapped from snake_case
        employmentStatus: mappedEvaluation.employmentStatus,
        
        // Selected body parts/problems
        selectedParts: selectedParts?.map(part => ({
          id: part.body_part_id,
          name: part.body_parts_new?.part_name || part.problem_description,
          description: part.problem_description,
          anatomicalSide: part.anatomical_side,
          notes: part.notes
        })) || [],
        
        // Timeline - mapped from snake_case
        timeline: timelineEvents?.map(event => mapTimelineEventFromDb(event)).map(event => ({
          date: event.eventDate,
          type: event.eventType,
          description: event.description
        })) || [],
        
        // Observations - mapped from snake_case
        observations: observations?.map(obs => mapObservationFromDb(obs)).reduce((acc, obs) => {
          acc[obs.observationType] = obs.assessment;
          return acc;
        }, {} as Record<string, any>) || {},
        
        // Measurements organized by type - mapped from snake_case
        rangeOfMotion: romMeasurements?.map(rom => mapRomFromDb(rom)).reduce((acc, rom) => {
          if (!acc[rom.bodyPart]) acc[rom.bodyPart] = {};
          acc[rom.bodyPart][rom.motionType] = {
            active: {
              left: rom.activeLeft,
              right: rom.activeRight,
              value: rom.activeValue
            },
            passive: {
              left: rom.passiveLeft,
              right: rom.passiveRight,
              value: rom.passiveValue
            },
            notes: rom.notes
          };
          return acc;
        }, {} as Record<string, any>) || {},
        
        strengthTesting: strengthMeasurements?.map(strength => mapStrengthFromDb(strength)).reduce((acc, strength) => {
          if (!acc[strength.bodyPart]) acc[strength.bodyPart] = {};
          acc[strength.bodyPart] = {
            left: strength.leftValue,
            right: strength.rightValue,
            value: strength.singleValue,
            notes: strength.notes
          };
          return acc;
        }, {} as Record<string, any>) || {},
        
        specialTests: specialTests?.map(test => mapSpecialTestFromDb(test)).reduce((acc, test) => {
          if (!acc[test.bodyPart]) acc[test.bodyPart] = [];
          acc[test.bodyPart].push({
            name: test.testName,
            result: {
              left: test.leftResult,
              right: test.rightResult,
              value: test.singleResult
            },
            notes: test.notes
          });
          return acc;
        }, {} as Record<string, any>) || {},
        
        // Multi-user fields - mapped from snake_case
        clinicId: mappedEvaluation.clinicId,
        createdBy: mappedEvaluation.createdBy,
        lastModifiedBy: mappedEvaluation.lastModifiedBy,
        createdAt: mappedEvaluation.createdAt,
        updatedAt: mappedEvaluation.updatedAt
      };
    } catch (error) {
      console.error('Multi-user evaluation details fetch failed:', error);
      throw error;
    }
  } else {
    // For single-user mode, we need to implement this in IndexedDB API as well
    throw new Error('getEvaluationDetails not yet implemented for single-user mode');
  }
}

export async function getPatientEvaluations(patientId: string) {
  if (isMultiUser) {
    try {
      // First get the evaluations with patient data using snake_case column names
      const { data: evaluations, error: evalError } = await supabase
        .from('evaluations')
        .select(`
          *,
          patients!inner(
            id,
            first_name,
            last_name,
            date_of_birth,
            phone,
            email,
            address,
            emergency_contact_name,
            emergency_contact_phone,
            employer_name,
            employer_address,
            employer_phone
          )
        `)
        .eq('patient_id', patientId)
        .order('evaluation_date', { ascending: false });
      
      if (evalError) throw evalError;
      if (!evaluations || evaluations.length === 0) return [];

      // For each evaluation, fetch all related data
      const completeEvaluations = await Promise.all(
        evaluations.map(async (evaluation) => {
          const evalId = evaluation.id;
          
          // Fetch selected parts/problems
          const { data: selectedParts } = await supabase
            .from('evaluation_selected_parts_new')
            .select(`
              *,
              body_parts_new(
                id,
                part_name,
                description,
                body_region_id
              )
            `)
            .eq('evaluation_id', evalId);

          // Fetch timeline events using snake_case column names
          const { data: timelineEvents } = await supabase
            .from('timeline_events')
            .select('*')
            .eq('evaluation_id', evalId)
            .order('event_date', { ascending: true });

          // Fetch observations using snake_case column names
          const { data: observations } = await supabase
            .from('observations')
            .select('*')
            .eq('evaluation_id', evalId);

          // Fetch ROM measurements using snake_case column names
          const { data: romMeasurements } = await supabase
            .from('rom_measurements')
            .select('*')
            .eq('evaluation_id', evalId);

          // Fetch strength measurements using snake_case column names
          const { data: strengthMeasurements } = await supabase
            .from('strength_measurements')
            .select('*')
            .eq('evaluation_id', evalId);

          // Fetch special test results using snake_case column names
          const { data: specialTests } = await supabase
            .from('special_test_results')
            .select('*')
            .eq('evaluation_id', evalId);

          // Map all data from snake_case to camelCase
          const mappedEvaluation = mapEvaluationFromDb(evaluation);
          const mappedPatient = mapPatientFromDb(evaluation.patients);
          
          return {
            id: mappedEvaluation.id,
            patientId: mappedEvaluation.patientId,
            evaluationDate: mappedEvaluation.evaluationDate,
            status: mappedEvaluation.status || 'draft',
            
            // Patient demographics - mapped from snake_case
            demographics: {
              firstName: mappedPatient.firstName,
              lastName: mappedPatient.lastName,
              dateOfBirth: mappedPatient.dateOfBirth,
              phone: mappedPatient.phone,
              email: mappedPatient.email,
              address: mappedPatient.address
            },
            
            // Emergency contact - mapped from snake_case
            emergencyContact: {
              name: mappedPatient.emergencyContactName,
              phone: mappedPatient.emergencyContactPhone
            },
            
            // Employer information - mapped from snake_case
            employer: {
              name: mappedPatient.employerName,
              address: mappedPatient.employerAddress,
              phone: mappedPatient.employerPhone
            },
            
            // Employment status - mapped from snake_case
            employmentStatus: mappedEvaluation.employmentStatus,
            
            // Selected body parts/problems
            selectedParts: selectedParts?.map(part => ({
              id: part.body_part_id,
              name: part.body_parts_new?.part_name || part.problem_description,
              description: part.problem_description,
              anatomicalSide: part.anatomical_side,
              notes: part.notes
            })) || [],
            
            // Timeline - mapped from snake_case
            timeline: timelineEvents?.map(event => mapTimelineEventFromDb(event)).map(event => ({
              date: event.eventDate,
              type: event.eventType,
              description: event.description
            })) || [],
            
            // Observations - mapped from snake_case
            observations: observations?.map(obs => mapObservationFromDb(obs)).reduce((acc, obs) => {
              acc[obs.observationType] = obs.assessment;
              return acc;
            }, {} as Record<string, any>) || {},
            
            // Measurements - mapped from snake_case
            measurements: {
              rom: romMeasurements?.map(rom => mapRomFromDb(rom)).reduce((acc, rom) => {
                if (!acc[rom.bodyPart]) acc[rom.bodyPart] = {};
                acc[rom.bodyPart][rom.motionType] = {
                  active: {
                    left: rom.activeLeft,
                    right: rom.activeRight,
                    value: rom.activeValue
                  },
                  passive: {
                    left: rom.passiveLeft,
                    right: rom.passiveRight,
                    value: rom.passiveValue
                  },
                  notes: rom.notes
                };
                return acc;
              }, {} as Record<string, any>) || {},
              
              strength: strengthMeasurements?.map(strength => mapStrengthFromDb(strength)).reduce((acc, strength) => {
                if (!acc[strength.bodyPart]) acc[strength.bodyPart] = {};
                acc[strength.bodyPart] = {
                  left: strength.leftValue,
                  right: strength.rightValue,
                  value: strength.singleValue,
                  notes: strength.notes
                };
                return acc;
              }, {} as Record<string, any>) || {},
              
              specialTests: specialTests?.map(test => mapSpecialTestFromDb(test)).reduce((acc, test) => {
                if (!acc[test.bodyPart]) acc[test.bodyPart] = [];
                acc[test.bodyPart].push({
                  name: test.testName,
                  result: {
                    left: test.leftResult,
                    right: test.rightResult,
                    value: test.singleResult
                  },
                  notes: test.notes
                });
                return acc;
              }, {} as Record<string, any>) || {}
            },
            
            // Multi-user fields - mapped from snake_case
            clinicId: mappedEvaluation.clinicId,
            createdBy: mappedEvaluation.createdBy,
            lastModifiedBy: mappedEvaluation.lastModifiedBy,
            createdAt: mappedEvaluation.createdAt,
            updatedAt: mappedEvaluation.updatedAt
          };
        })
      );

      return completeEvaluations;
    } catch (error) {
      console.error('Multi-user evaluations fetch failed:', error);
      throw error;
    }
  } else {
    return indexedDbApi.getPatientEvaluations(patientId);
  }
}

export async function saveFormData(data: any, existingPatientId: string | null) {
  if (isMultiUser) {
    try {
      let patientId = existingPatientId;
      
      // Create or update patient using snake_case column names
      if (!patientId) {
        patientId = uuidv4();
        const patientData = {
          id: patientId,
          first_name: data.demographics.firstName,
          last_name: data.demographics.lastName,
          date_of_birth: data.demographics.dateOfBirth,
          gender: data.demographics.gender,
          email: data.demographics.email,
          phone: data.demographics.phone,
          address: data.demographics.address,
          emergency_contact_name: data.emergencyContact?.firstName + ' ' + data.emergencyContact?.lastName,
          emergency_contact_phone: data.emergencyContact?.phone,
          employer_name: data.employer?.name,
          employer_address: data.employer?.streetAddress,
          employer_city: data.employer?.city,
          employer_state: data.employer?.state,
          employer_zip_code: data.employer?.zipCode,
          employer_phone: data.employer?.phone,
          clinic_id: userProfile?.clinic_id,
          primary_therapist_id: userProfile?.profile_id,
          created_by: userProfile?.profile_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const { error: patientError } = await supabase
          .from('patients')
          .insert(patientData);
        
        if (patientError) throw patientError;
      } else {
        // Update existing patient
        const patientData = {
          first_name: data.demographics.firstName,
          last_name: data.demographics.lastName,
          date_of_birth: data.demographics.dateOfBirth,
          gender: data.demographics.gender,
          email: data.demographics.email,
          phone: data.demographics.phone,
          address: data.demographics.address,
          emergency_contact_name: data.emergencyContact?.firstName + ' ' + data.emergencyContact?.lastName,
          emergency_contact_phone: data.emergencyContact?.phone,
          employer_name: data.employer?.name,
          employer_address: data.employer?.streetAddress,
          employer_city: data.employer?.city,
          employer_state: data.employer?.state,
          employer_zip_code: data.employer?.zipCode,
          employer_phone: data.employer?.phone,
          updated_at: new Date().toISOString()
        };
        
        const { error: patientUpdateError } = await supabase
          .from('patients')
          .update(patientData)
          .eq('id', patientId);
        
        if (patientUpdateError) throw patientUpdateError;
      }
      
      // Save evaluation using snake_case column names
      const evalId = data.id || uuidv4();
      const evaluationData = {
        id: evalId,
        patient_id: patientId,
        evaluation_date: data.evaluationDate,
        employment_status: data.employmentStatus,
        status: data.status || 'draft',
        clinic_id: userProfile?.clinic_id,
        created_by: userProfile?.profile_id,
        last_modified_by: userProfile?.profile_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { error: evalError } = await supabase
        .from('evaluations')
        .upsert(evaluationData);
      
      if (evalError) throw evalError;
      
      return { patientId, evaluationId: evalId };
    } catch (error) {
      console.error('Multi-user save failed:', error);
      throw error;
    }
  } else {
    return indexedDbApi.saveFormData(data, existingPatientId);
  }
}

// Database management
export async function clearDatabase() {
  if (isMultiUser) {
    // In multi-user mode, we don't clear the entire database
    // Instead, we could clear user-specific data if needed
    console.warn('Clear database not supported in multi-user mode');
    return;
  } else {
    return indexedDbApi.clearDatabase();
  }
}

export async function isDatabaseEmpty() {
  if (isMultiUser) {
    try {
      const { count, error } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count === 0;
    } catch (error) {
      console.error('Failed to check database status:', error);
      return false;
    }
  } else {
    return indexedDbApi.isDatabaseEmpty();
  }
}

export async function addTestPatient(patientData: any) {
  if (isMultiUser) {
    // In multi-user mode, we don't auto-add test data
    console.log('Test data not added in multi-user mode');
    return;
  } else {
    return indexedDbApi.addTestPatient(patientData);
  }
}