-- Migration: update_protocol_tables_with_body_parts_20250922
-- Created at: 1758470945

-- Update protocol tables to use new body_parts_new references
-- This normalizes all protocol data to use the standardized body part IDs

-- Add body_part_id column to rom_definitions
ALTER TABLE rom_definitions 
ADD COLUMN body_part_id_new INTEGER REFERENCES body_parts_new(id);

-- Update rom_definitions with new body part references
UPDATE rom_definitions 
SET body_part_id_new = (
    SELECT bplm.body_part_id 
    FROM body_part_legacy_mapping bplm
    JOIN body_parts_new bp ON bp.id = bplm.body_part_id
    JOIN selectable_parts sp ON sp.id = rom_definitions.joint_part_id
    WHERE bplm.legacy_name = sp.part_name
    AND bplm.legacy_system = 'evaluation_selected_parts'
    LIMIT 1
);

-- For any ROM definitions that didn't map via selectable_parts, try direct mapping
UPDATE rom_definitions 
SET body_part_id_new = (
    SELECT bp.id 
    FROM body_parts_new bp
    WHERE bp.display_name LIKE '%' || (
        SELECT sp.part_name 
        FROM selectable_parts sp 
        WHERE sp.id = rom_definitions.joint_part_id
    ) || '%'
    LIMIT 1
)
WHERE body_part_id_new IS NULL;

-- Add body_part_id column to strength_testing_protocols  
ALTER TABLE strength_testing_protocols 
ADD COLUMN body_part_id_new INTEGER REFERENCES body_parts_new(id);

-- Update strength_testing_protocols with new body part references
UPDATE strength_testing_protocols 
SET body_part_id_new = (
    SELECT bplm.body_part_id 
    FROM body_part_legacy_mapping bplm
    WHERE bplm.legacy_name = strength_testing_protocols.joint_name
    AND bplm.legacy_system = 'protocol_tables'
    LIMIT 1
);

-- Add body_part_id column to special_tests
ALTER TABLE special_tests 
ADD COLUMN body_part_id_new INTEGER REFERENCES body_parts_new(id);

-- For special_tests, we need to map based on the body part associations
UPDATE special_tests 
SET body_part_id_new = (
    SELECT bplm.body_part_id 
    FROM body_part_legacy_mapping bplm
    JOIN special_test_body_parts stbp ON stbp.special_test_id = special_tests.id
    JOIN selectable_parts sp ON sp.id = stbp.body_part_id
    WHERE bplm.legacy_name = sp.part_name
    AND bplm.legacy_system = 'evaluation_selected_parts'
    LIMIT 1
);

-- Verification view for protocol table updates
CREATE VIEW protocol_migration_verification AS
SELECT 
    'ROM Definitions Updated' as table_name,
    COUNT(*) as total_records,
    COUNT(body_part_id_new) as mapped_records,
    COUNT(*) - COUNT(body_part_id_new) as unmapped_records
FROM rom_definitions
UNION ALL
SELECT 
    'Strength Protocols Updated' as table_name,
    COUNT(*) as total_records,
    COUNT(body_part_id_new) as mapped_records,
    COUNT(*) - COUNT(body_part_id_new) as unmapped_records
FROM strength_testing_protocols
UNION ALL
SELECT 
    'Special Tests Updated' as table_name,
    COUNT(*) as total_records,
    COUNT(body_part_id_new) as mapped_records,
    COUNT(*) - COUNT(body_part_id_new) as unmapped_records
FROM special_tests;;