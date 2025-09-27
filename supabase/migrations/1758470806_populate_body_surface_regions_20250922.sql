-- Migration: populate_body_surface_regions_20250922
-- Created at: 1758470806

-- Populate body surface regions for non-joint anatomical areas
INSERT INTO body_parts_new (
    part_code, part_name, display_name, description,
    parent_part_id, part_level, sort_order,
    anatomical_region, anatomical_segment, anatomical_level, structure_type,
    has_rom, has_strength, has_special_tests, has_palpation, has_functional_tests,
    bilateral, weight_bearing, functional_priority
) VALUES
-- ARM SURFACES (parent_id = 9 for arm segment)
('ARM_ANTERIOR', 'Anterior Arm Surface', 'Anterior Arm', 'Front surface of upper arm',
 9, 3, 221, 'upper_extremity', 'arm', 'anterior', 'surface',
 false, false, false, true, false, true, false, 'medium'),

('ARM_POSTERIOR', 'Posterior Arm Surface', 'Posterior Arm', 'Back surface of upper arm',
 9, 3, 222, 'upper_extremity', 'arm', 'posterior', 'surface',
 false, false, false, true, false, true, false, 'medium'),

('ARM_MEDIAL', 'Medial Arm Surface', 'Medial Arm', 'Inner surface of upper arm',
 9, 3, 223, 'upper_extremity', 'arm', 'medial', 'surface',
 false, false, false, true, false, true, false, 'medium'),

('ARM_LATERAL', 'Lateral Arm Surface', 'Lateral Arm', 'Outer surface of upper arm',
 9, 3, 224, 'upper_extremity', 'arm', 'lateral', 'surface',
 false, false, false, true, false, true, false, 'medium'),

-- FOREARM SURFACES (parent_id = 11 for forearm segment)
('FOREARM_ANTERIOR', 'Anterior Forearm Surface', 'Anterior Forearm', 'Front surface of forearm',
 11, 3, 241, 'upper_extremity', 'forearm', 'anterior', 'surface',
 false, false, false, true, false, true, false, 'medium'),

('FOREARM_POSTERIOR', 'Posterior Forearm Surface', 'Posterior Forearm', 'Back surface of forearm',
 11, 3, 242, 'upper_extremity', 'forearm', 'posterior', 'surface',
 false, false, false, true, false, true, false, 'medium'),

('FOREARM_RADIAL', 'Radial Forearm Surface', 'Radial Forearm', 'Thumb side of forearm',
 11, 3, 243, 'upper_extremity', 'forearm', 'radial', 'surface',
 false, false, false, true, false, true, false, 'medium'),

('FOREARM_ULNAR', 'Ulnar Forearm Surface', 'Ulnar Forearm', 'Pinky side of forearm',
 11, 3, 244, 'upper_extremity', 'forearm', 'ulnar', 'surface',
 false, false, false, true, false, true, false, 'medium'),

-- THIGH SURFACES (parent_id = 21 for thigh segment)
('THIGH_ANTERIOR', 'Anterior Thigh Surface', 'Anterior Thigh', 'Front surface of thigh',
 21, 3, 421, 'lower_extremity', 'thigh', 'anterior', 'surface',
 false, false, false, true, false, true, true, 'medium'),

('THIGH_POSTERIOR', 'Posterior Thigh Surface', 'Posterior Thigh', 'Back surface of thigh',
 21, 3, 422, 'lower_extremity', 'thigh', 'posterior', 'surface',
 false, false, false, true, false, true, true, 'medium'),

('THIGH_MEDIAL', 'Medial Thigh Surface', 'Medial Thigh', 'Inner surface of thigh',
 21, 3, 423, 'lower_extremity', 'thigh', 'medial', 'surface',
 false, false, false, true, false, true, true, 'medium'),

('THIGH_LATERAL', 'Lateral Thigh Surface', 'Lateral Thigh', 'Outer surface of thigh',
 21, 3, 424, 'lower_extremity', 'thigh', 'lateral', 'surface',
 false, false, false, true, false, true, true, 'medium'),

-- LEG SURFACES (parent_id = 23 for leg segment)
('LEG_ANTERIOR', 'Anterior Leg Surface', 'Anterior Leg', 'Front surface of lower leg',
 23, 3, 441, 'lower_extremity', 'leg', 'anterior', 'surface',
 false, false, false, true, false, true, true, 'medium'),

('LEG_POSTERIOR', 'Posterior Leg Surface', 'Posterior Leg', 'Back surface of lower leg (calf)',
 23, 3, 442, 'lower_extremity', 'leg', 'posterior', 'surface',
 false, false, false, true, false, true, true, 'medium'),

('LEG_MEDIAL', 'Medial Leg Surface', 'Medial Leg', 'Inner surface of lower leg',
 23, 3, 443, 'lower_extremity', 'leg', 'medial', 'surface',
 false, false, false, true, false, true, true, 'medium'),

('LEG_LATERAL', 'Lateral Leg Surface', 'Lateral Leg', 'Outer surface of lower leg',
 23, 3, 444, 'lower_extremity', 'leg', 'lateral', 'surface',
 false, false, false, true, false, true, true, 'medium'),

-- TRUNK SURFACES
('CHEST_ANTERIOR', 'Anterior Chest', 'Anterior Chest', 'Front chest wall',
 17, 3, 341, 'trunk', 'thorax', 'anterior', 'surface',
 false, false, false, true, false, false, false, 'medium'),

('CHEST_POSTERIOR', 'Posterior Chest', 'Upper Back', 'Upper back between shoulder blades',
 17, 3, 342, 'trunk', 'thorax', 'posterior', 'surface',
 false, false, false, true, false, false, false, 'medium'),

('ABDOMEN_ANTERIOR', 'Anterior Abdomen', 'Anterior Abdomen', 'Front abdominal wall',
 18, 3, 351, 'trunk', 'abdomen', 'anterior', 'surface',
 false, false, false, true, false, false, false, 'medium'),

('LOWER_BACK', 'Lower Back Surface', 'Lower Back', 'Lumbar region surface',
 15, 3, 323, 'trunk', 'lumbar', 'posterior', 'surface',
 false, false, false, true, false, false, true, 'high'),

-- HAND SURFACES
('HAND_DORSAL', 'Dorsal Hand Surface', 'Back of Hand', 'Top surface of hand',
 13, 4, 277, 'upper_extremity', 'hand', 'dorsal', 'surface',
 false, false, false, true, false, true, false, 'medium'),

('HAND_PALMAR', 'Palmar Hand Surface', 'Palm', 'Palm surface of hand',
 13, 4, 278, 'upper_extremity', 'hand', 'palmar', 'surface',
 false, false, false, true, true, true, false, 'high'),

-- FOOT SURFACES
('FOOT_DORSAL', 'Dorsal Foot Surface', 'Top of Foot', 'Top surface of foot',
 25, 4, 477, 'lower_extremity', 'foot', 'dorsal', 'surface',
 false, false, false, true, false, true, true, 'medium'),

('FOOT_PLANTAR', 'Plantar Foot Surface', 'Sole of Foot', 'Bottom surface of foot',
 25, 4, 478, 'lower_extremity', 'foot', 'plantar', 'surface',
 false, false, false, true, true, true, true, 'high');;