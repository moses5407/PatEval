-- Migration: populate_body_parts_level_1_regions_20250922
-- Created at: 1758470671

-- Populate Level 1: Main anatomical regions
INSERT INTO body_parts_new (
    part_code, part_name, display_name, description,
    parent_part_id, part_level, sort_order,
    anatomical_region, anatomical_segment, structure_type,
    has_rom, has_strength, has_special_tests, has_palpation, has_functional_tests,
    bilateral, weight_bearing, functional_priority
) VALUES
-- Level 1: Main Body Regions
('HEAD_NECK_REGION', 'Head and Neck Region', 'Head & Neck', 'Cranium, cervical spine, and associated structures', 
 NULL, 1, 100, 'head_neck', 'cranial_cervical', 'region', 
 true, true, true, true, true, false, false, 'high'),

('UPPER_EXTREMITY_REGION', 'Upper Extremity Region', 'Upper Extremity', 'Arms, shoulders, and hands including all joints and structures', 
 NULL, 1, 200, 'upper_extremity', 'appendicular_upper', 'region', 
 true, true, true, true, true, true, false, 'high'),

('TRUNK_SPINE_REGION', 'Trunk and Spine Region', 'Trunk & Spine', 'Thoracic and lumbar spine, pelvis, and trunk structures', 
 NULL, 1, 300, 'trunk', 'axial_trunk', 'region', 
 true, true, true, true, true, false, true, 'high'),

('LOWER_EXTREMITY_REGION', 'Lower Extremity Region', 'Lower Extremity', 'Legs, hips, knees, ankles, and feet including all joints and structures', 
 NULL, 1, 400, 'lower_extremity', 'appendicular_lower', 'region', 
 true, true, true, true, true, true, true, 'high');;