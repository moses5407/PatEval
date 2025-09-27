-- Migration: create_comprehensive_backups_20250922
-- Created at: 1758470589

-- Create comprehensive backups of all tables that will be modified
-- This migration creates backup tables with timestamp suffix for safety

-- Backup evaluation_selected_parts
CREATE TABLE evaluation_selected_parts_backup_20250922 AS 
SELECT * FROM evaluation_selected_parts;

-- Backup selectable_parts (existing structure)
CREATE TABLE selectable_parts_backup_20250922 AS 
SELECT * FROM selectable_parts;

-- Backup ROM related tables
CREATE TABLE rom_definitions_backup_20250922 AS 
SELECT * FROM rom_definitions;

CREATE TABLE rom_measurements_backup_20250922 AS 
SELECT * FROM rom_measurements;

-- Backup strength testing tables
CREATE TABLE strength_testing_protocols_backup_20250922 AS 
SELECT * FROM strength_testing_protocols;

CREATE TABLE strength_measurements_backup_20250922 AS 
SELECT * FROM strength_measurements;

-- Backup special tests tables
CREATE TABLE special_tests_backup_20250922 AS 
SELECT * FROM special_tests;

CREATE TABLE special_test_results_backup_20250922 AS 
SELECT * FROM special_test_results;

-- Backup functional tests
CREATE TABLE functional_test_protocols_backup_20250922 AS 
SELECT * FROM functional_test_protocols;

CREATE TABLE functional_test_results_backup_20250922 AS 
SELECT * FROM functional_test_results;

-- Create backup verification view
CREATE VIEW backup_verification_20250922 AS
SELECT 
    'evaluation_selected_parts' as table_name,
    (SELECT COUNT(*) FROM evaluation_selected_parts) as original_count,
    (SELECT COUNT(*) FROM evaluation_selected_parts_backup_20250922) as backup_count
UNION ALL
SELECT 
    'selectable_parts' as table_name,
    (SELECT COUNT(*) FROM selectable_parts) as original_count,
    (SELECT COUNT(*) FROM selectable_parts_backup_20250922) as backup_count
UNION ALL
SELECT 
    'rom_definitions' as table_name,
    (SELECT COUNT(*) FROM rom_definitions) as original_count,
    (SELECT COUNT(*) FROM rom_definitions_backup_20250922) as backup_count
UNION ALL
SELECT 
    'strength_testing_protocols' as table_name,
    (SELECT COUNT(*) FROM strength_testing_protocols) as original_count,
    (SELECT COUNT(*) FROM strength_testing_protocols_backup_20250922) as backup_count
UNION ALL
SELECT 
    'special_tests' as table_name,
    (SELECT COUNT(*) FROM special_tests) as original_count,
    (SELECT COUNT(*) FROM special_tests_backup_20250922) as backup_count;;