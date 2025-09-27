-- Migration: populate_body_parts_level_4_digits_20250922
-- Created at: 1758470775

-- Populate Level 4: Individual finger and toe joints plus detailed hand/foot structures
INSERT INTO body_parts_new (
    part_code, part_name, display_name, description,
    parent_part_id, part_level, sort_order,
    anatomical_region, anatomical_segment, anatomical_level, structure_type, joint_type,
    has_rom, has_strength, has_special_tests, has_palpation, has_functional_tests,
    bilateral, weight_bearing, functional_priority
) VALUES
-- HAND/FINGER Level 4 (parent_id = 13 for hand segment)
-- Thumb (Digit 1)
('CMC_THUMB', 'Thumb Carpometacarpal Joint', 'Thumb CMC', 'Thumb base joint - highly mobile',
 13, 4, 261, 'upper_extremity', 'hand', 'CMC_1', 'joint', 'synovial',
 true, true, true, true, true, true, false, 'high'),

('MCP_THUMB', 'Thumb Metacarpophalangeal Joint', 'Thumb MCP', 'Thumb knuckle joint',
 13, 4, 262, 'upper_extremity', 'hand', 'MCP_1', 'joint', 'synovial',
 true, true, true, true, true, true, false, 'high'),

('IP_THUMB', 'Thumb Interphalangeal Joint', 'Thumb IP', 'Thumb tip joint',
 13, 4, 263, 'upper_extremity', 'hand', 'IP_1', 'joint', 'synovial',
 true, true, true, true, true, true, false, 'high'),

-- Index Finger (Digit 2)
('CMC_INDEX', 'Index Carpometacarpal Joint', 'Index CMC', 'Index finger base',
 13, 4, 264, 'upper_extremity', 'hand', 'CMC_2', 'joint', 'synovial',
 false, false, false, true, false, true, false, 'low'),

('MCP_INDEX', 'Index Metacarpophalangeal Joint', 'Index MCP', 'Index finger knuckle',
 13, 4, 265, 'upper_extremity', 'hand', 'MCP_2', 'joint', 'synovial',
 true, true, true, true, true, true, false, 'high'),

('PIP_INDEX', 'Index Proximal Interphalangeal Joint', 'Index PIP', 'Index finger middle joint',
 13, 4, 266, 'upper_extremity', 'hand', 'PIP_2', 'joint', 'synovial',
 true, true, true, true, true, true, false, 'high'),

('DIP_INDEX', 'Index Distal Interphalangeal Joint', 'Index DIP', 'Index finger tip joint',
 13, 4, 267, 'upper_extremity', 'hand', 'DIP_2', 'joint', 'synovial',
 true, true, true, true, true, true, false, 'medium'),

-- Middle Finger (Digit 3)
('MCP_MIDDLE', 'Middle Metacarpophalangeal Joint', 'Middle MCP', 'Middle finger knuckle',
 13, 4, 268, 'upper_extremity', 'hand', 'MCP_3', 'joint', 'synovial',
 true, true, true, true, true, true, false, 'medium'),

('PIP_MIDDLE', 'Middle Proximal Interphalangeal Joint', 'Middle PIP', 'Middle finger middle joint',
 13, 4, 269, 'upper_extremity', 'hand', 'PIP_3', 'joint', 'synovial',
 true, true, true, true, true, true, false, 'medium'),

('DIP_MIDDLE', 'Middle Distal Interphalangeal Joint', 'Middle DIP', 'Middle finger tip joint',
 13, 4, 270, 'upper_extremity', 'hand', 'DIP_3', 'joint', 'synovial',
 true, true, true, true, true, true, false, 'medium'),

-- Ring Finger (Digit 4)
('MCP_RING', 'Ring Metacarpophalangeal Joint', 'Ring MCP', 'Ring finger knuckle',
 13, 4, 271, 'upper_extremity', 'hand', 'MCP_4', 'joint', 'synovial',
 true, true, true, true, true, true, false, 'medium'),

('PIP_RING', 'Ring Proximal Interphalangeal Joint', 'Ring PIP', 'Ring finger middle joint',
 13, 4, 272, 'upper_extremity', 'hand', 'PIP_4', 'joint', 'synovial',
 true, true, true, true, true, true, false, 'medium'),

('DIP_RING', 'Ring Distal Interphalangeal Joint', 'Ring DIP', 'Ring finger tip joint',
 13, 4, 273, 'upper_extremity', 'hand', 'DIP_4', 'joint', 'synovial',
 true, true, true, true, true, true, false, 'medium'),

-- Little Finger (Digit 5)
('MCP_LITTLE', 'Little Metacarpophalangeal Joint', 'Little MCP', 'Little finger knuckle',
 13, 4, 274, 'upper_extremity', 'hand', 'MCP_5', 'joint', 'synovial',
 true, true, true, true, true, true, false, 'medium'),

('PIP_LITTLE', 'Little Proximal Interphalangeal Joint', 'Little PIP', 'Little finger middle joint',
 13, 4, 275, 'upper_extremity', 'hand', 'PIP_5', 'joint', 'synovial',
 true, true, true, true, true, true, false, 'medium'),

('DIP_LITTLE', 'Little Distal Interphalangeal Joint', 'Little DIP', 'Little finger tip joint',
 13, 4, 276, 'upper_extremity', 'hand', 'DIP_5', 'joint', 'synovial',
 true, true, true, true, true, true, false, 'medium'),

-- FOOT/TOE Level 4 (parent_id = 25 for foot segment)
-- Great Toe (Hallux)
('MTP_GREAT_TOE', 'Great Toe Metatarsophalangeal Joint', 'Great Toe MTP', 'Big toe base joint',
 25, 4, 461, 'lower_extremity', 'foot', 'MTP_1', 'joint', 'synovial',
 true, true, true, true, true, true, true, 'high'),

('IP_GREAT_TOE', 'Great Toe Interphalangeal Joint', 'Great Toe IP', 'Big toe tip joint',
 25, 4, 462, 'lower_extremity', 'foot', 'IP_1', 'joint', 'synovial',
 true, true, true, true, true, true, true, 'high'),

-- 2nd Toe
('MTP_TOE_2', '2nd Toe Metatarsophalangeal Joint', '2nd Toe MTP', '2nd toe base joint',
 25, 4, 463, 'lower_extremity', 'foot', 'MTP_2', 'joint', 'synovial',
 true, true, true, true, false, true, true, 'medium'),

('PIP_TOE_2', '2nd Toe Proximal Interphalangeal Joint', '2nd Toe PIP', '2nd toe middle joint',
 25, 4, 464, 'lower_extremity', 'foot', 'PIP_2', 'joint', 'synovial',
 true, false, true, true, false, true, true, 'medium'),

('DIP_TOE_2', '2nd Toe Distal Interphalangeal Joint', '2nd Toe DIP', '2nd toe tip joint',
 25, 4, 465, 'lower_extremity', 'foot', 'DIP_2', 'joint', 'synovial',
 true, false, true, true, false, true, true, 'low'),

-- 3rd Toe
('MTP_TOE_3', '3rd Toe Metatarsophalangeal Joint', '3rd Toe MTP', '3rd toe base joint',
 25, 4, 466, 'lower_extremity', 'foot', 'MTP_3', 'joint', 'synovial',
 true, true, true, true, false, true, true, 'medium'),

('PIP_TOE_3', '3rd Toe Proximal Interphalangeal Joint', '3rd Toe PIP', '3rd toe middle joint',
 25, 4, 467, 'lower_extremity', 'foot', 'PIP_3', 'joint', 'synovial',
 true, false, true, true, false, true, true, 'low'),

('DIP_TOE_3', '3rd Toe Distal Interphalangeal Joint', '3rd Toe DIP', '3rd toe tip joint',
 25, 4, 468, 'lower_extremity', 'foot', 'DIP_3', 'joint', 'synovial',
 true, false, true, true, false, true, true, 'low'),

-- 4th Toe
('MTP_TOE_4', '4th Toe Metatarsophalangeal Joint', '4th Toe MTP', '4th toe base joint',
 25, 4, 469, 'lower_extremity', 'foot', 'MTP_4', 'joint', 'synovial',
 true, true, true, true, false, true, true, 'medium'),

('PIP_TOE_4', '4th Toe Proximal Interphalangeal Joint', '4th Toe PIP', '4th toe middle joint',
 25, 4, 470, 'lower_extremity', 'foot', 'PIP_4', 'joint', 'synovial',
 true, false, true, true, false, true, true, 'low'),

('DIP_TOE_4', '4th Toe Distal Interphalangeal Joint', '4th Toe DIP', '4th toe tip joint',
 25, 4, 471, 'lower_extremity', 'foot', 'DIP_4', 'joint', 'synovial',
 true, false, true, true, false, true, true, 'low'),

-- 5th Toe (Little Toe)
('MTP_TOE_5', '5th Toe Metatarsophalangeal Joint', '5th Toe MTP', '5th toe base joint',
 25, 4, 472, 'lower_extremity', 'foot', 'MTP_5', 'joint', 'synovial',
 true, true, true, true, false, true, true, 'medium'),

('PIP_TOE_5', '5th Toe Proximal Interphalangeal Joint', '5th Toe PIP', '5th toe middle joint',
 25, 4, 473, 'lower_extremity', 'foot', 'PIP_5', 'joint', 'synovial',
 true, false, true, true, false, true, true, 'low'),

('DIP_TOE_5', '5th Toe Distal Interphalangeal Joint', '5th Toe DIP', '5th toe tip joint',
 25, 4, 474, 'lower_extremity', 'foot', 'DIP_5', 'joint', 'synovial',
 true, false, true, true, false, true, true, 'low'),

-- Additional foot structures
('MIDFOOT_JOINTS', 'Midfoot Joint Complex', 'Midfoot Joints', 'Tarsal and tarsometatarsal joints',
 25, 4, 475, 'lower_extremity', 'foot', 'midfoot', 'joint', 'synovial',
 true, false, true, true, true, true, true, 'medium'),

('HEEL_REGION', 'Heel Region', 'Heel', 'Calcaneal region',
 25, 4, 476, 'lower_extremity', 'foot', 'calcaneal', 'region', 'n/a',
 false, false, true, true, true, true, true, 'medium');;