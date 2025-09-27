-- Migration: create_enhanced_body_parts_system_20250922
-- Created at: 1758470654

-- Create enhanced body parts reference system with comprehensive clinical detail
-- This replaces the existing selectable_parts with a more robust, hierarchical system

-- Enhanced body parts table with comprehensive clinical structure
CREATE TABLE body_parts_new (
    id SERIAL PRIMARY KEY,
    part_code VARCHAR(50) NOT NULL UNIQUE,
    part_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Hierarchical structure
    parent_part_id INTEGER REFERENCES body_parts_new(id),
    part_level SMALLINT NOT NULL DEFAULT 1,
    sort_order INTEGER DEFAULT 1000,
    
    -- Anatomical classification
    anatomical_region VARCHAR(50) NOT NULL, -- head_neck, upper_extremity, trunk, lower_extremity
    anatomical_segment VARCHAR(50), -- shoulder, elbow, hand, finger, spine, etc.
    anatomical_level VARCHAR(50), -- C1-C2, L4-L5, DIP, PIP, etc.
    anatomical_side VARCHAR(20) DEFAULT 'bilateral', -- bilateral, left, right, midline
    
    -- Joint/structure classification
    structure_type VARCHAR(30) NOT NULL, -- joint, bone, muscle_group, surface, region
    joint_type VARCHAR(30), -- synovial, cartilaginous, fibrous, n/a
    movement_degrees SMALLINT, -- degrees of freedom (0-6)
    
    -- Clinical testing flags
    has_rom BOOLEAN NOT NULL DEFAULT false,
    has_strength BOOLEAN NOT NULL DEFAULT false,
    has_special_tests BOOLEAN NOT NULL DEFAULT false,
    has_palpation BOOLEAN NOT NULL DEFAULT false,
    has_functional_tests BOOLEAN NOT NULL DEFAULT false,
    
    -- Clinical significance
    bilateral BOOLEAN NOT NULL DEFAULT true,
    weight_bearing BOOLEAN NOT NULL DEFAULT false,
    functional_priority VARCHAR(20) DEFAULT 'medium', -- high, medium, low
    injury_risk VARCHAR(20) DEFAULT 'medium', -- high, medium, low
    
    -- System fields
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, deprecated
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'system_migration',
    notes TEXT
);

-- Create indexes for performance
CREATE INDEX idx_body_parts_parent ON body_parts_new(parent_part_id);
CREATE INDEX idx_body_parts_region ON body_parts_new(anatomical_region);
CREATE INDEX idx_body_parts_level ON body_parts_new(part_level);
CREATE INDEX idx_body_parts_active ON body_parts_new(status) WHERE status = 'active';

-- Legacy mapping table to bridge old and new naming conventions
CREATE TABLE body_part_legacy_mapping (
    id SERIAL PRIMARY KEY,
    body_part_id INTEGER NOT NULL REFERENCES body_parts_new(id),
    legacy_name VARCHAR(100) NOT NULL,
    legacy_system VARCHAR(50) NOT NULL, -- 'evaluation_selected_parts', 'protocol_tables', etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_legacy_mapping_name ON body_part_legacy_mapping(legacy_name);
CREATE INDEX idx_legacy_mapping_system ON body_part_legacy_mapping(legacy_system);;