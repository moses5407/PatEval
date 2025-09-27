-- Migration: core_tables_camelcase_migration
-- Created at: 1758529789

-- Migration: Rename Core Table Columns to camelCase
-- Phase 1: Core user-facing tables
-- Created: 2025-09-22
-- Purpose: Synchronize database column names with frontend TypeScript expectations

-- CRITICAL: Run this migration during off-peak hours
-- CRITICAL: Ensure you have recent backups before executing

BEGIN;

-- =====================================================
-- STEP 1: Create backup tables for rollback safety
-- =====================================================

DO $$
DECLARE
    backup_suffix TEXT := '_backup_pre_camelcase_' || to_char(now(), 'YYYYMMDDHH24MI');
BEGIN
    EXECUTE format('CREATE TABLE patients%s AS SELECT * FROM patients', backup_suffix);
    EXECUTE format('CREATE TABLE evaluations%s AS SELECT * FROM evaluations', backup_suffix);
    EXECUTE format('CREATE TABLE rom_measurements%s AS SELECT * FROM rom_measurements', backup_suffix);
    EXECUTE format('CREATE TABLE strength_measurements%s AS SELECT * FROM strength_measurements', backup_suffix);
    EXECUTE format('CREATE TABLE special_test_results%s AS SELECT * FROM special_test_results', backup_suffix);
    EXECUTE format('CREATE TABLE functional_test_results%s AS SELECT * FROM functional_test_results', backup_suffix);
    EXECUTE format('CREATE TABLE observations%s AS SELECT * FROM observations', backup_suffix);
    EXECUTE format('CREATE TABLE timeline_events%s AS SELECT * FROM timeline_events', backup_suffix);
    
    RAISE NOTICE 'Backup tables created with suffix: %', backup_suffix;
END $$;

-- =====================================================
-- STEP 2: Drop foreign key constraints temporarily
-- =====================================================

-- Drop FK constraints that reference columns we're about to rename
ALTER TABLE evaluations DROP CONSTRAINT IF EXISTS evaluations_patient_id_fkey;
ALTER TABLE rom_measurements DROP CONSTRAINT IF EXISTS rom_measurements_evaluation_id_fkey;
ALTER TABLE strength_measurements DROP CONSTRAINT IF EXISTS strength_measurements_evaluation_id_fkey;
ALTER TABLE special_test_results DROP CONSTRAINT IF EXISTS special_test_results_evaluation_id_fkey;
ALTER TABLE functional_test_results DROP CONSTRAINT IF EXISTS functional_test_results_evaluation_id_fkey;
ALTER TABLE observations DROP CONSTRAINT IF EXISTS observations_evaluation_id_fkey;
ALTER TABLE timeline_events DROP CONSTRAINT IF EXISTS timeline_events_evaluation_id_fkey;

-- =====================================================
-- STEP 3: Rename columns in patients table
-- =====================================================

-- Core demographic fields
ALTER TABLE patients RENAME COLUMN first_name TO "firstName";
ALTER TABLE patients RENAME COLUMN last_name TO "lastName";
ALTER TABLE patients RENAME COLUMN date_of_birth TO "dateOfBirth";
ALTER TABLE patients RENAME COLUMN medical_record_number TO "medicalRecordNumber";
ALTER TABLE patients RENAME COLUMN emergency_contact_name TO "emergencyContactName";
ALTER TABLE patients RENAME COLUMN emergency_contact_phone TO "emergencyContactPhone";

-- Employer fields
ALTER TABLE patients RENAME COLUMN employer_name TO "employerName";
ALTER TABLE patients RENAME COLUMN employer_address TO "employerAddress";
ALTER TABLE patients RENAME COLUMN employer_city TO "employerCity";
ALTER TABLE patients RENAME COLUMN employer_state TO "employerState";
ALTER TABLE patients RENAME COLUMN employer_zip_code TO "employerZipCode";
ALTER TABLE patients RENAME COLUMN employer_phone TO "employerPhone";

-- System fields
ALTER TABLE patients RENAME COLUMN clinic_id TO "clinicId";
ALTER TABLE patients RENAME COLUMN primary_therapist_id TO "primaryTherapistId";
ALTER TABLE patients RENAME COLUMN created_by TO "createdBy";
ALTER TABLE patients RENAME COLUMN created_at TO "createdAt";
ALTER TABLE patients RENAME COLUMN updated_at TO "updatedAt";

-- =====================================================
-- STEP 4: Rename columns in evaluations table
-- =====================================================

ALTER TABLE evaluations RENAME COLUMN patient_id TO "patientId";
ALTER TABLE evaluations RENAME COLUMN clinic_id TO "clinicId";
ALTER TABLE evaluations RENAME COLUMN created_by TO "createdBy";
ALTER TABLE evaluations RENAME COLUMN last_modified_by TO "lastModifiedBy";
ALTER TABLE evaluations RENAME COLUMN evaluation_date TO "evaluationDate";
ALTER TABLE evaluations RENAME COLUMN employment_status TO "employmentStatus";
ALTER TABLE evaluations RENAME COLUMN created_at TO "createdAt";
ALTER TABLE evaluations RENAME COLUMN updated_at TO "updatedAt";

-- =====================================================
-- STEP 5: Rename columns in rom_measurements table
-- =====================================================

ALTER TABLE rom_measurements RENAME COLUMN evaluation_id TO "evaluationId";
ALTER TABLE rom_measurements RENAME COLUMN body_part TO "bodyPart";
ALTER TABLE rom_measurements RENAME COLUMN motion_type TO "motionType";
ALTER TABLE rom_measurements RENAME COLUMN active_left TO "activeLeft";
ALTER TABLE rom_measurements RENAME COLUMN active_right TO "activeRight";
ALTER TABLE rom_measurements RENAME COLUMN active_value TO "activeValue";
ALTER TABLE rom_measurements RENAME COLUMN passive_left TO "passiveLeft";
ALTER TABLE rom_measurements RENAME COLUMN passive_right TO "passiveRight";
ALTER TABLE rom_measurements RENAME COLUMN passive_value TO "passiveValue";
ALTER TABLE rom_measurements RENAME COLUMN is_painful TO "isPainful";
ALTER TABLE rom_measurements RENAME COLUMN rom_definition_id TO "romDefinitionId";
ALTER TABLE rom_measurements RENAME COLUMN created_at TO "createdAt";

-- =====================================================
-- STEP 6: Rename columns in strength_measurements table
-- =====================================================

ALTER TABLE strength_measurements RENAME COLUMN evaluation_id TO "evaluationId";
ALTER TABLE strength_measurements RENAME COLUMN left_value TO "leftValue";
ALTER TABLE strength_measurements RENAME COLUMN right_value TO "rightValue";
ALTER TABLE strength_measurements RENAME COLUMN single_value TO "singleValue";
ALTER TABLE strength_measurements RENAME COLUMN is_painful TO "isPainful";
ALTER TABLE strength_measurements RENAME COLUMN test_mode_id TO "testModeId";
ALTER TABLE strength_measurements RENAME COLUMN strength_protocol_id TO "strengthProtocolId";
ALTER TABLE strength_measurements RENAME COLUMN body_part_id TO "bodyPartId";
ALTER TABLE strength_measurements RENAME COLUMN test_speed_dps TO "testSpeedDps";
ALTER TABLE strength_measurements RENAME COLUMN equipment_used TO "equipmentUsed";
ALTER TABLE strength_measurements RENAME COLUMN created_at TO "createdAt";

-- =====================================================
-- STEP 7: Rename columns in special_test_results table
-- =====================================================

ALTER TABLE special_test_results RENAME COLUMN evaluation_id TO "evaluationId";
ALTER TABLE special_test_results RENAME COLUMN body_part TO "bodyPart";
ALTER TABLE special_test_results RENAME COLUMN test_name TO "testName";
ALTER TABLE special_test_results RENAME COLUMN left_result TO "leftResult";
ALTER TABLE special_test_results RENAME COLUMN right_result TO "rightResult";
ALTER TABLE special_test_results RENAME COLUMN single_result TO "singleResult";
ALTER TABLE special_test_results RENAME COLUMN is_significant TO "isSignificant";
ALTER TABLE special_test_results RENAME COLUMN special_test_id TO "specialTestId";
ALTER TABLE special_test_results RENAME COLUMN created_at TO "createdAt";

-- =====================================================
-- STEP 8: Rename columns in functional_test_results table
-- =====================================================

ALTER TABLE functional_test_results RENAME COLUMN evaluation_id TO "evaluationId";
ALTER TABLE functional_test_results RENAME COLUMN body_part TO "bodyPart";
ALTER TABLE functional_test_results RENAME COLUMN test_name TO "testName";
ALTER TABLE functional_test_results RENAME COLUMN overall_score TO "overallScore";
ALTER TABLE functional_test_results RENAME COLUMN max_score TO "maxScore";
ALTER TABLE functional_test_results RENAME COLUMN left_score TO "leftScore";
ALTER TABLE functional_test_results RENAME COLUMN right_score TO "rightScore";
ALTER TABLE functional_test_results RENAME COLUMN assistance_needed TO "assistanceNeeded";
ALTER TABLE functional_test_results RENAME COLUMN created_at TO "createdAt";

-- =====================================================
-- STEP 9: Rename columns in observations table
-- =====================================================

ALTER TABLE observations RENAME COLUMN evaluation_id TO "evaluationId";
ALTER TABLE observations RENAME COLUMN observation_type TO "observationType";
ALTER TABLE observations RENAME COLUMN include_in_summary TO "includeInSummary";
ALTER TABLE observations RENAME COLUMN created_at TO "createdAt";

-- =====================================================
-- STEP 10: Rename columns in timeline_events table
-- =====================================================

ALTER TABLE timeline_events RENAME COLUMN evaluation_id TO "evaluationId";
ALTER TABLE timeline_events RENAME COLUMN event_date TO "eventDate";
ALTER TABLE timeline_events RENAME COLUMN event_type TO "eventType";
ALTER TABLE timeline_events RENAME COLUMN created_at TO "createdAt";

-- =====================================================
-- STEP 11: Recreate foreign key constraints
-- =====================================================

-- Evaluations to patients
ALTER TABLE evaluations ADD CONSTRAINT evaluations_patientId_fkey 
    FOREIGN KEY ("patientId") REFERENCES patients(id);

-- Measurements to evaluations
ALTER TABLE rom_measurements ADD CONSTRAINT rom_measurements_evaluationId_fkey 
    FOREIGN KEY ("evaluationId") REFERENCES evaluations(id);

ALTER TABLE strength_measurements ADD CONSTRAINT strength_measurements_evaluationId_fkey 
    FOREIGN KEY ("evaluationId") REFERENCES evaluations(id);

ALTER TABLE special_test_results ADD CONSTRAINT special_test_results_evaluationId_fkey 
    FOREIGN KEY ("evaluationId") REFERENCES evaluations(id);

ALTER TABLE functional_test_results ADD CONSTRAINT functional_test_results_evaluationId_fkey 
    FOREIGN KEY ("evaluationId") REFERENCES evaluations(id);

ALTER TABLE observations ADD CONSTRAINT observations_evaluationId_fkey 
    FOREIGN KEY ("evaluationId") REFERENCES evaluations(id);

ALTER TABLE timeline_events ADD CONSTRAINT timeline_events_evaluationId_fkey 
    FOREIGN KEY ("evaluationId") REFERENCES evaluations(id);

-- =====================================================
-- STEP 12: Recreate indexes with new column names
-- =====================================================

-- Drop old indexes if they exist
DROP INDEX IF EXISTS idx_patients_last_name;
DROP INDEX IF EXISTS idx_patients_first_name;
DROP INDEX IF EXISTS idx_patients_date_of_birth;
DROP INDEX IF EXISTS idx_evaluations_patient_id;
DROP INDEX IF EXISTS idx_evaluations_evaluation_date;
DROP INDEX IF EXISTS idx_rom_measurements_evaluation_id;
DROP INDEX IF EXISTS idx_strength_measurements_evaluation_id;
DROP INDEX IF EXISTS idx_special_test_results_evaluation_id;

-- Create new indexes with camelCase column names
CREATE INDEX idx_patients_lastName ON patients("lastName");
CREATE INDEX idx_patients_firstName ON patients("firstName");
CREATE INDEX idx_patients_dateOfBirth ON patients("dateOfBirth");
CREATE INDEX idx_evaluations_patientId ON evaluations("patientId");
CREATE INDEX idx_evaluations_evaluationDate ON evaluations("evaluationDate");
CREATE INDEX idx_rom_measurements_evaluationId ON rom_measurements("evaluationId");
CREATE INDEX idx_strength_measurements_evaluationId ON strength_measurements("evaluationId");
CREATE INDEX idx_special_test_results_evaluationId ON special_test_results("evaluationId");

-- =====================================================
-- STEP 13: Verification queries
-- =====================================================

-- Verify no data was lost
DO $$
DECLARE
    patient_count INTEGER;
    eval_count INTEGER;
    rom_count INTEGER;
    strength_count INTEGER;
    special_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO patient_count FROM patients;
    SELECT COUNT(*) INTO eval_count FROM evaluations;
    SELECT COUNT(*) INTO rom_count FROM rom_measurements;
    SELECT COUNT(*) INTO strength_count FROM strength_measurements;
    SELECT COUNT(*) INTO special_count FROM special_test_results;
    
    RAISE NOTICE 'Data verification:';
    RAISE NOTICE '  Patients: % records', patient_count;
    RAISE NOTICE '  Evaluations: % records', eval_count;
    RAISE NOTICE '  ROM measurements: % records', rom_count;
    RAISE NOTICE '  Strength measurements: % records', strength_count;
    RAISE NOTICE '  Special test results: % records', special_count;
    
    -- Test that we can select with new column names
    PERFORM "firstName", "lastName", "dateOfBirth" FROM patients LIMIT 1;
    PERFORM "patientId", "evaluationDate" FROM evaluations LIMIT 1;
    
    RAISE NOTICE 'New column names verified successfully';
END $$;

COMMIT;;