-- Migration: populate_body_parts_level_2_segments_20250922
-- Created at: 1758470696

-- Populate Level 2: Major anatomical segments
INSERT INTO body_parts_new (
    part_code, part_name, display_name, description,
    parent_part_id, part_level, sort_order,
    anatomical_region, anatomical_segment, structure_type,
    has_rom, has_strength, has_special_tests, has_palpation, has_functional_tests,
    bilateral, weight_bearing, functional_priority
) VALUES
-- HEAD & NECK Level 2
('CRANIUM', 'Cranium', 'Skull', 'Cranial bones and structures',
 1, 2, 110, 'head_neck', 'cranium', 'region',
 false, false, true, true, false, false, false, 'medium'),

('CERVICAL_SPINE_SEGMENT', 'Cervical Spine Segment', 'Cervical Spine', 'C1-C7 vertebrae and associated structures',
 1, 2, 120, 'head_neck', 'cervical', 'region',
 true, true, true, true, true, false, false, 'high'),

('TMJ_REGION', 'Temporomandibular Region', 'TMJ Region', 'Temporomandibular joint and surrounding structures',
 1, 2, 130, 'head_neck', 'temporomandibular', 'region',
 true, true, true, true, false, true, false, 'medium'),

-- UPPER EXTREMITY Level 2
('SHOULDER_SEGMENT', 'Shoulder Segment', 'Shoulder', 'Shoulder complex including all joints and muscles',
 2, 2, 210, 'upper_extremity', 'shoulder', 'region',
 true, true, true, true, true, true, false, 'high'),

('ARM_SEGMENT', 'Arm Segment', 'Upper Arm', 'Humerus and surrounding structures',
 2, 2, 220, 'upper_extremity', 'arm', 'region',
 false, true, false, true, true, true, false, 'medium'),

('ELBOW_SEGMENT', 'Elbow Segment', 'Elbow', 'Elbow joint complex',
 2, 2, 230, 'upper_extremity', 'elbow', 'region',
 true, true, true, true, true, true, false, 'high'),

('FOREARM_SEGMENT', 'Forearm Segment', 'Forearm', 'Radius, ulna, and surrounding structures',
 2, 2, 240, 'upper_extremity', 'forearm', 'region',
 true, true, false, true, true, true, false, 'medium'),

('WRIST_SEGMENT', 'Wrist Segment', 'Wrist', 'Wrist joint complex',
 2, 2, 250, 'upper_extremity', 'wrist', 'region',
 true, true, true, true, true, true, false, 'high'),

('HAND_SEGMENT', 'Hand Segment', 'Hand', 'Hand including fingers and thumb',
 2, 2, 260, 'upper_extremity', 'hand', 'region',
 true, true, true, true, true, true, false, 'high'),

-- TRUNK & SPINE Level 2
('THORACIC_SPINE_SEGMENT', 'Thoracic Spine Segment', 'Thoracic Spine', 'T1-T12 vertebrae and associated structures',
 3, 2, 310, 'trunk', 'thoracic', 'region',
 true, true, true, true, true, false, true, 'medium'),

('LUMBAR_SPINE_SEGMENT', 'Lumbar Spine Segment', 'Lumbar Spine', 'L1-L5 vertebrae and associated structures',
 3, 2, 320, 'trunk', 'lumbar', 'region',
 true, true, true, true, true, false, true, 'high'),

('SACRAL_SEGMENT', 'Sacral Segment', 'Sacral Region', 'Sacrum, coccyx, and sacroiliac joints',
 3, 2, 330, 'trunk', 'sacral', 'region',
 true, true, true, true, true, false, true, 'high'),

('THORAX_SEGMENT', 'Thorax Segment', 'Chest', 'Thoracic cage, ribs, and respiratory structures',
 3, 2, 340, 'trunk', 'thorax', 'region',
 true, true, false, true, true, false, false, 'medium'),

('ABDOMEN_SEGMENT', 'Abdomen Segment', 'Abdomen', 'Abdominal wall and core structures',
 3, 2, 350, 'trunk', 'abdomen', 'region',
 false, true, false, true, true, false, false, 'medium'),

-- LOWER EXTREMITY Level 2
('PELVIS_SEGMENT', 'Pelvis Segment', 'Pelvis', 'Pelvic girdle and hip region',
 4, 2, 410, 'lower_extremity', 'pelvis', 'region',
 true, true, true, true, true, true, true, 'high'),

('THIGH_SEGMENT', 'Thigh Segment', 'Thigh', 'Femur and surrounding structures',
 4, 2, 420, 'lower_extremity', 'thigh', 'region',
 false, true, false, true, true, true, true, 'medium'),

('KNEE_SEGMENT', 'Knee Segment', 'Knee', 'Knee joint complex',
 4, 2, 430, 'lower_extremity', 'knee', 'region',
 true, true, true, true, true, true, true, 'high'),

('LEG_SEGMENT', 'Leg Segment', 'Lower Leg', 'Tibia, fibula, and surrounding structures',
 4, 2, 440, 'lower_extremity', 'leg', 'region',
 false, true, false, true, true, true, true, 'medium'),

('ANKLE_SEGMENT', 'Ankle Segment', 'Ankle', 'Ankle joint complex',
 4, 2, 450, 'lower_extremity', 'ankle', 'region',
 true, true, true, true, true, true, true, 'high'),

('FOOT_SEGMENT', 'Foot Segment', 'Foot', 'Foot including toes',
 4, 2, 460, 'lower_extremity', 'foot', 'region',
 true, true, true, true, true, true, true, 'high');;