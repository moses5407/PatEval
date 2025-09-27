-- Migration: create_legacy_mapping_data_20250922
-- Created at: 1758470822

-- Create legacy mapping between old naming conventions and new body_parts_new
-- This ensures all existing data can be properly migrated

INSERT INTO body_part_legacy_mapping (body_part_id, legacy_name, legacy_system) 
SELECT 
    bp.id,
    legacy_name,
    'evaluation_selected_parts'
FROM (VALUES
    -- Map evaluation_selected_parts naming to new system
    ('SHOULDER_SEGMENT', 'Shoulder Complex'),
    ('C3_C7', 'Cervical Spine'), -- Using lower cervical as primary mapping
    ('L4_L5', 'Lumbar Spine'), -- Using lower lumbar as primary mapping
    ('KNEE_SEGMENT', 'Knee Complex'),
    ('HIP_JOINT', 'Hip Complex'),
    ('ANKLE_SEGMENT', 'Ankle Complex'),
    ('T9_T12', 'Thoracic Spine'), -- Using lower thoracic as primary mapping
    ('ELBOW_SEGMENT', 'Elbow Complex'),
    ('WRIST_SEGMENT', 'Wrist Complex')
) AS mapping(part_code, legacy_name)
JOIN body_parts_new bp ON bp.part_code = mapping.part_code;

-- Add protocol table mappings (lowercase/snake_case)
INSERT INTO body_part_legacy_mapping (body_part_id, legacy_name, legacy_system)
SELECT 
    bp.id,
    legacy_name,
    'protocol_tables'
FROM (VALUES
    -- Map protocol table naming to new system
    ('SHOULDER_SEGMENT', 'shoulder'),
    ('C3_C7', 'cervical_spine'),
    ('L4_L5', 'lumbar_spine'),
    ('KNEE_SEGMENT', 'knee'),
    ('HIP_JOINT', 'hip'),
    ('ANKLE_SEGMENT', 'ankle'),
    ('T9_T12', 'thoracic_spine'),
    ('ELBOW_SEGMENT', 'elbow'),
    ('WRIST_SEGMENT', 'wrist'),
    ('RADIOULNAR_PROX', 'forearm'), -- Forearm pronation/supination
    ('HAND_SEGMENT', 'hand')
) AS mapping(part_code, legacy_name)
JOIN body_parts_new bp ON bp.part_code = mapping.part_code;

-- Verify the mappings were created
CREATE VIEW legacy_mapping_verification AS
SELECT 
    bp.part_code,
    bp.display_name,
    bplm.legacy_name,
    bplm.legacy_system,
    COUNT(*) OVER (PARTITION BY bplm.legacy_system) as total_mappings
FROM body_part_legacy_mapping bplm
JOIN body_parts_new bp ON bp.id = bplm.body_part_id
ORDER BY bplm.legacy_system, bp.part_code;;