-- Migration: migrate_evaluation_selected_parts_data_20250922
-- Created at: 1758470924

-- Migrate existing evaluation_selected_parts data to normalized schema
-- This preserves all existing evaluation data while using the new body parts system

-- First, let's see what data we're working with
INSERT INTO evaluation_selected_parts_new (
    evaluation_id,
    body_part_id,
    anatomical_side,
    problem_description,
    created_at,
    notes
)
SELECT 
    esp.evaluation_id,
    bplm.body_part_id,
    'bilateral' as anatomical_side, -- Default since original didn't specify
    esp.body_part as problem_description, -- Preserve original naming for reference
    esp.created_at,
    CONCAT('Migrated from original body_part: ', esp.body_part) as notes
FROM evaluation_selected_parts esp
JOIN body_part_legacy_mapping bplm ON bplm.legacy_name = esp.body_part 
WHERE bplm.legacy_system = 'evaluation_selected_parts';

-- Handle any unmapped entries (if they exist)
INSERT INTO evaluation_selected_parts_new (
    evaluation_id,
    body_part_id,
    anatomical_side,
    problem_description,
    created_at,
    notes
)
SELECT 
    esp.evaluation_id,
    1, -- Default to head_neck region for unmapped items
    'bilateral' as anatomical_side,
    esp.body_part as problem_description,
    esp.created_at,
    CONCAT('UNMAPPED - Original body_part: ', esp.body_part, ' - Requires manual review') as notes
FROM evaluation_selected_parts esp
WHERE esp.body_part NOT IN (
    SELECT legacy_name FROM body_part_legacy_mapping 
    WHERE legacy_system = 'evaluation_selected_parts'
);

-- Verify migration success
CREATE VIEW migration_verification AS
SELECT 
    'Original evaluation_selected_parts' as table_name,
    COUNT(*) as record_count
FROM evaluation_selected_parts
UNION ALL
SELECT 
    'Migrated to evaluation_selected_parts_new' as table_name,
    COUNT(*) as record_count
FROM evaluation_selected_parts_new
UNION ALL
SELECT 
    'Successfully mapped records' as table_name,
    COUNT(*) as record_count
FROM evaluation_selected_parts_new
WHERE notes NOT LIKE '%UNMAPPED%'
UNION ALL
SELECT 
    'Unmapped records requiring review' as table_name,
    COUNT(*) as record_count
FROM evaluation_selected_parts_new
WHERE notes LIKE '%UNMAPPED%';;