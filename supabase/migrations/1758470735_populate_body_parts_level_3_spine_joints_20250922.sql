-- Migration: populate_body_parts_level_3_spine_joints_20250922
-- Created at: 1758470735

-- Populate Level 3: Specific spine segments and major joints
INSERT INTO body_parts_new (
    part_code, part_name, display_name, description,
    parent_part_id, part_level, sort_order,
    anatomical_region, anatomical_segment, anatomical_level, structure_type, joint_type,
    has_rom, has_strength, has_special_tests, has_palpation, has_functional_tests,
    bilateral, weight_bearing, functional_priority
) VALUES
-- CERVICAL SPINE Level 3 (parent_id = 6)
('C1_C2', 'C1-C2 Atlantooccipital/Atlantoaxial', 'C1-C2 (Upper Cervical)', 'Atlas and axis articulations',
 6, 3, 121, 'head_neck', 'cervical', 'C1-C2', 'joint', 'synovial',
 true, true, true, true, false, false, false, 'high'),

('C3_C7', 'C3-C7 Mid-Lower Cervical', 'C3-C7 (Lower Cervical)', 'Mid and lower cervical vertebrae',
 6, 3, 122, 'head_neck', 'cervical', 'C3-C7', 'joint', 'synovial',
 true, true, true, true, false, false, false, 'high'),

-- TMJ Level 3 (parent_id = 7)
('TMJ_LEFT', 'Left Temporomandibular Joint', 'Left TMJ', 'Left temporomandibular joint',
 7, 3, 131, 'head_neck', 'temporomandibular', 'left', 'joint', 'synovial',
 true, true, true, true, false, false, false, 'medium'),

('TMJ_RIGHT', 'Right Temporomandibular Joint', 'Right TMJ', 'Right temporomandibular joint',
 7, 3, 132, 'head_neck', 'temporomandibular', 'right', 'joint', 'synovial',
 true, true, true, true, false, false, false, 'medium'),

-- SHOULDER Level 3 (parent_id = 8)
('GH_JOINT', 'Glenohumeral Joint', 'Glenohumeral Joint', 'Primary shoulder ball-and-socket joint',
 8, 3, 211, 'upper_extremity', 'shoulder', 'glenohumeral', 'joint', 'synovial',
 true, true, true, true, true, true, false, 'high'),

('AC_JOINT', 'Acromioclavicular Joint', 'AC Joint', 'Joint between acromion and clavicle',
 8, 3, 212, 'upper_extremity', 'shoulder', 'acromioclavicular', 'joint', 'synovial',
 true, false, true, true, false, true, false, 'medium'),

('SC_JOINT', 'Sternoclavicular Joint', 'SC Joint', 'Joint between sternum and clavicle',
 8, 3, 213, 'upper_extremity', 'shoulder', 'sternoclavicular', 'joint', 'synovial',
 true, false, true, true, false, true, false, 'medium'),

('SCAPULOTHORACIC', 'Scapulothoracic Articulation', 'Scapulothoracic', 'Scapula movement on thoracic wall',
 8, 3, 214, 'upper_extremity', 'shoulder', 'scapulothoracic', 'joint', 'functional',
 true, true, true, true, true, true, false, 'high'),

-- ELBOW Level 3 (parent_id = 10)
('ELBOW_JOINT', 'Elbow Joint Complex', 'Elbow Joint', 'Humeroulnar and humeroradial joints',
 10, 3, 231, 'upper_extremity', 'elbow', 'humeroulnar', 'joint', 'synovial',
 true, true, true, true, true, true, false, 'high'),

('RADIOULNAR_PROX', 'Proximal Radioulnar Joint', 'Proximal Radioulnar', 'Forearm rotation joint',
 10, 3, 232, 'upper_extremity', 'elbow', 'radioulnar_proximal', 'joint', 'synovial',
 true, true, true, true, false, true, false, 'medium'),

-- WRIST Level 3 (parent_id = 12)
('RADIOCARPAL', 'Radiocarpal Joint', 'Radiocarpal Joint', 'Primary wrist joint',
 12, 3, 251, 'upper_extremity', 'wrist', 'radiocarpal', 'joint', 'synovial',
 true, true, true, true, true, true, false, 'high'),

('MIDCARPAL', 'Midcarpal Joint', 'Midcarpal Joint', 'Joint between carpal rows',
 12, 3, 252, 'upper_extremity', 'wrist', 'midcarpal', 'joint', 'synovial',
 true, false, true, true, false, true, false, 'medium'),

('RADIOULNAR_DIST', 'Distal Radioulnar Joint', 'Distal Radioulnar', 'Forearm rotation at wrist',
 12, 3, 253, 'upper_extremity', 'wrist', 'radioulnar_distal', 'joint', 'synovial',
 true, true, true, true, false, true, false, 'medium'),

-- THORACIC SPINE Level 3 (parent_id = 14)
('T1_T4', 'T1-T4 Upper Thoracic', 'T1-T4 (Upper Thoracic)', 'Upper thoracic vertebrae',
 14, 3, 311, 'trunk', 'thoracic', 'T1-T4', 'joint', 'synovial',
 true, true, true, true, false, false, true, 'medium'),

('T5_T8', 'T5-T8 Mid Thoracic', 'T5-T8 (Mid Thoracic)', 'Mid thoracic vertebrae',
 14, 3, 312, 'trunk', 'thoracic', 'T5-T8', 'joint', 'synovial',
 true, true, true, true, false, false, true, 'medium'),

('T9_T12', 'T9-T12 Lower Thoracic', 'T9-T12 (Lower Thoracic)', 'Lower thoracic vertebrae',
 14, 3, 313, 'trunk', 'thoracic', 'T9-T12', 'joint', 'synovial',
 true, true, true, true, false, false, true, 'medium'),

-- LUMBAR SPINE Level 3 (parent_id = 15)
('L1_L3', 'L1-L3 Upper Lumbar', 'L1-L3 (Upper Lumbar)', 'Upper lumbar vertebrae',
 15, 3, 321, 'trunk', 'lumbar', 'L1-L3', 'joint', 'synovial',
 true, true, true, true, true, false, true, 'high'),

('L4_L5', 'L4-L5 Lower Lumbar', 'L4-L5 (Lower Lumbar)', 'Lower lumbar vertebrae - high injury risk',
 15, 3, 322, 'trunk', 'lumbar', 'L4-L5', 'joint', 'synovial',
 true, true, true, true, true, false, true, 'high'),

-- SACRAL Level 3 (parent_id = 16)
('SI_JOINT', 'Sacroiliac Joint', 'SI Joint', 'Sacroiliac joint',
 16, 3, 331, 'trunk', 'sacral', 'sacroiliac', 'joint', 'synovial',
 true, true, true, true, true, true, true, 'high'),

('COCCYX', 'Coccygeal Segment', 'Coccyx', 'Tailbone and associated structures',
 16, 3, 332, 'trunk', 'sacral', 'coccygeal', 'joint', 'cartilaginous',
 false, false, true, true, false, false, false, 'low'),

-- HIP Level 3 (parent_id = 20)
('HIP_JOINT', 'Hip Joint', 'Hip Joint', 'Coxofemoral joint',
 20, 3, 411, 'lower_extremity', 'pelvis', 'coxofemoral', 'joint', 'synovial',
 true, true, true, true, true, true, true, 'high'),

-- KNEE Level 3 (parent_id = 22)
('TIBIOFEMORAL', 'Tibiofemoral Joint', 'Tibiofemoral Joint', 'Primary knee joint',
 22, 3, 431, 'lower_extremity', 'knee', 'tibiofemoral', 'joint', 'synovial',
 true, true, true, true, true, true, true, 'high'),

('PATELLOFEMORAL', 'Patellofemoral Joint', 'Patellofemoral Joint', 'Kneecap articulation',
 22, 3, 432, 'lower_extremity', 'knee', 'patellofemoral', 'joint', 'synovial',
 true, true, true, true, true, true, true, 'high'),

-- ANKLE Level 3 (parent_id = 24)
('ANKLE_JOINT', 'Ankle Joint', 'Ankle Joint', 'Talocrural joint',
 24, 3, 451, 'lower_extremity', 'ankle', 'talocrural', 'joint', 'synovial',
 true, true, true, true, true, true, true, 'high'),

('SUBTALAR', 'Subtalar Joint', 'Subtalar Joint', 'Hindfoot inversion/eversion',
 24, 3, 452, 'lower_extremity', 'ankle', 'subtalar', 'joint', 'synovial',
 true, true, true, true, true, true, true, 'high');;