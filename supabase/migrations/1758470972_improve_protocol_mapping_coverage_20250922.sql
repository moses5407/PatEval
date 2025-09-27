-- Migration: improve_protocol_mapping_coverage_20250922
-- Created at: 1758470972

-- Improve mapping coverage for protocol tables with additional mapping strategies

-- For ROM definitions, try mapping based on common movement patterns
UPDATE rom_definitions 
SET body_part_id_new = (
    CASE 
        WHEN movement_name ILIKE '%shoulder%' OR movement_name ILIKE '%scapular%' THEN 
            (SELECT id FROM body_parts_new WHERE part_code = 'SHOULDER_SEGMENT')
        WHEN movement_name ILIKE '%elbow%' THEN 
            (SELECT id FROM body_parts_new WHERE part_code = 'ELBOW_SEGMENT')
        WHEN movement_name ILIKE '%wrist%' THEN 
            (SELECT id FROM body_parts_new WHERE part_code = 'WRIST_SEGMENT')
        WHEN movement_name ILIKE '%cervical%' THEN 
            (SELECT id FROM body_parts_new WHERE part_code = 'C3_C7')
        WHEN movement_name ILIKE '%lumbar%' THEN 
            (SELECT id FROM body_parts_new WHERE part_code = 'L4_L5')
        WHEN movement_name ILIKE '%thoracic%' THEN 
            (SELECT id FROM body_parts_new WHERE part_code = 'T9_T12')
        WHEN movement_name ILIKE '%hip%' THEN 
            (SELECT id FROM body_parts_new WHERE part_code = 'HIP_JOINT')
        WHEN movement_name ILIKE '%knee%' THEN 
            (SELECT id FROM body_parts_new WHERE part_code = 'KNEE_SEGMENT')
        WHEN movement_name ILIKE '%ankle%' THEN 
            (SELECT id FROM body_parts_new WHERE part_code = 'ANKLE_SEGMENT')
        WHEN movement_name ILIKE '%foot%' OR movement_name ILIKE '%toe%' OR movement_name ILIKE '%mtp%' THEN 
            (SELECT id FROM body_parts_new WHERE part_code = 'FOOT_SEGMENT')
        WHEN movement_name ILIKE '%hand%' OR movement_name ILIKE '%finger%' OR movement_name ILIKE '%thumb%' THEN 
            (SELECT id FROM body_parts_new WHERE part_code = 'HAND_SEGMENT')
    END
)
WHERE body_part_id_new IS NULL;

-- For special tests, try mapping based on test names and patterns
UPDATE special_tests 
SET body_part_id_new = (
    CASE 
        WHEN test_name ILIKE '%shoulder%' OR test_name ILIKE '%impingement%' OR test_name ILIKE '%rotator%' THEN 
            (SELECT id FROM body_parts_new WHERE part_code = 'SHOULDER_SEGMENT')
        WHEN test_name ILIKE '%elbow%' OR test_name ILIKE '%tennis%' OR test_name ILIKE '%golfer%' THEN 
            (SELECT id FROM body_parts_new WHERE part_code = 'ELBOW_SEGMENT')
        WHEN test_name ILIKE '%wrist%' OR test_name ILIKE '%carpal%' THEN 
            (SELECT id FROM body_parts_new WHERE part_code = 'WRIST_SEGMENT')
        WHEN test_name ILIKE '%cervical%' OR test_name ILIKE '%neck%' THEN 
            (SELECT id FROM body_parts_new WHERE part_code = 'C3_C7')
        WHEN test_name ILIKE '%lumbar%' OR test_name ILIKE '%straight leg%' OR test_name ILIKE '%slr%' THEN 
            (SELECT id FROM body_parts_new WHERE part_code = 'L4_L5')
        WHEN test_name ILIKE '%thoracic%' OR test_name ILIKE '%rib%' THEN 
            (SELECT id FROM body_parts_new WHERE part_code = 'T9_T12')
        WHEN test_name ILIKE '%hip%' OR test_name ILIKE '%faber%' OR test_name ILIKE '%thomas%' THEN 
            (SELECT id FROM body_parts_new WHERE part_code = 'HIP_JOINT')
        WHEN test_name ILIKE '%knee%' OR test_name ILIKE '%meniscus%' OR test_name ILIKE '%mcl%' OR test_name ILIKE '%lcl%' OR test_name ILIKE '%acl%' OR test_name ILIKE '%pcl%' THEN 
            (SELECT id FROM body_parts_new WHERE part_code = 'KNEE_SEGMENT')
        WHEN test_name ILIKE '%ankle%' OR test_name ILIKE '%drawer%' THEN 
            (SELECT id FROM body_parts_new WHERE part_code = 'ANKLE_SEGMENT')
        WHEN test_name ILIKE '%foot%' OR test_name ILIKE '%plantar%' THEN 
            (SELECT id FROM body_parts_new WHERE part_code = 'FOOT_SEGMENT')
        WHEN test_name ILIKE '%hand%' OR test_name ILIKE '%finger%' OR test_name ILIKE '%thumb%' THEN 
            (SELECT id FROM body_parts_new WHERE part_code = 'HAND_SEGMENT')
        WHEN test_name ILIKE '%si%' OR test_name ILIKE '%sacroiliac%' THEN 
            (SELECT id FROM body_parts_new WHERE part_code = 'SI_JOINT')
    END
)
WHERE body_part_id_new IS NULL;

-- Update verification view
DROP VIEW protocol_migration_verification;
CREATE VIEW protocol_migration_verification AS
SELECT 
    'ROM Definitions Updated' as table_name,
    COUNT(*) as total_records,
    COUNT(body_part_id_new) as mapped_records,
    COUNT(*) - COUNT(body_part_id_new) as unmapped_records,
    ROUND(COUNT(body_part_id_new)::DECIMAL / COUNT(*) * 100, 1) as mapping_percentage
FROM rom_definitions
UNION ALL
SELECT 
    'Strength Protocols Updated' as table_name,
    COUNT(*) as total_records,
    COUNT(body_part_id_new) as mapped_records,
    COUNT(*) - COUNT(body_part_id_new) as unmapped_records,
    ROUND(COUNT(body_part_id_new)::DECIMAL / COUNT(*) * 100, 1) as mapping_percentage
FROM strength_testing_protocols
UNION ALL
SELECT 
    'Special Tests Updated' as table_name,
    COUNT(*) as total_records,
    COUNT(body_part_id_new) as mapped_records,
    COUNT(*) - COUNT(body_part_id_new) as unmapped_records,
    ROUND(COUNT(body_part_id_new)::DECIMAL / COUNT(*) * 100, 1) as mapping_percentage
FROM special_tests;;