-- Migration: create_anatomical_qualifier_system_20250922
-- Created at: 1758470875

-- Create anatomical qualifier and modifier system for precise clinical documentation
-- This allows for directional and positional specifications

-- Anatomical Qualifiers Table
CREATE TABLE anatomical_qualifiers (
    id SERIAL PRIMARY KEY,
    qualifier_code VARCHAR(30) NOT NULL UNIQUE,
    qualifier_name VARCHAR(50) NOT NULL,
    description TEXT,
    qualifier_type VARCHAR(30) NOT NULL, -- directional, positional, surface, functional
    opposite_qualifier_id INTEGER, -- References self for opposite directions
    
    -- Usage context
    applicable_regions TEXT[], -- Which anatomical regions this applies to
    clinical_relevance VARCHAR(20) DEFAULT 'medium', -- high, medium, low
    
    -- System fields
    status VARCHAR(20) DEFAULT 'active',
    sort_order INTEGER DEFAULT 1000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Body Part Qualifiers Junction Table (many-to-many)
CREATE TABLE body_part_qualifiers (
    id SERIAL PRIMARY KEY,
    body_part_id INTEGER NOT NULL REFERENCES body_parts_new(id),
    qualifier_id INTEGER NOT NULL REFERENCES anatomical_qualifiers(id),
    
    -- Context for this combination
    qualifier_relevance VARCHAR(20) DEFAULT 'applicable', -- primary, applicable, rare
    clinical_notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(body_part_id, qualifier_id)
);

-- Evaluation Selected Parts Enhanced (to replace evaluation_selected_parts)
CREATE TABLE evaluation_selected_parts_new (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id UUID NOT NULL, -- References evaluations table
    body_part_id INTEGER NOT NULL REFERENCES body_parts_new(id),
    
    -- Qualifier specifications
    primary_qualifier_id INTEGER REFERENCES anatomical_qualifiers(id),
    secondary_qualifier_id INTEGER REFERENCES anatomical_qualifiers(id),
    
    -- Side specification (for bilateral structures)
    anatomical_side VARCHAR(20) DEFAULT 'bilateral', -- left, right, bilateral, midline
    
    -- Problem specification
    problem_description TEXT,
    severity VARCHAR(20), -- mild, moderate, severe
    onset VARCHAR(30), -- acute, chronic, subacute
    
    -- System fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

-- Populate anatomical qualifiers
INSERT INTO anatomical_qualifiers (
    qualifier_code, qualifier_name, description, qualifier_type, 
    applicable_regions, clinical_relevance, sort_order
) VALUES
-- Directional Qualifiers
('ANTERIOR', 'Anterior', 'Front/forward aspect', 'directional', 
 ARRAY['upper_extremity', 'lower_extremity', 'trunk'], 'high', 100),

('POSTERIOR', 'Posterior', 'Back/rear aspect', 'directional', 
 ARRAY['upper_extremity', 'lower_extremity', 'trunk'], 'high', 110),

('SUPERIOR', 'Superior', 'Upper/above aspect', 'directional', 
 ARRAY['trunk', 'head_neck'], 'high', 120),

('INFERIOR', 'Inferior', 'Lower/below aspect', 'directional', 
 ARRAY['trunk', 'head_neck'], 'high', 130),

('MEDIAL', 'Medial', 'Toward midline', 'directional', 
 ARRAY['upper_extremity', 'lower_extremity'], 'high', 140),

('LATERAL', 'Lateral', 'Away from midline', 'directional', 
 ARRAY['upper_extremity', 'lower_extremity'], 'high', 150),

('PROXIMAL', 'Proximal', 'Closer to body center', 'directional', 
 ARRAY['upper_extremity', 'lower_extremity'], 'high', 160),

('DISTAL', 'Distal', 'Further from body center', 'directional', 
 ARRAY['upper_extremity', 'lower_extremity'], 'high', 170),

-- Surface-specific Qualifiers
('DORSAL', 'Dorsal', 'Back surface (hand/foot)', 'surface', 
 ARRAY['upper_extremity', 'lower_extremity'], 'high', 200),

('PALMAR', 'Palmar', 'Palm surface (hand)', 'surface', 
 ARRAY['upper_extremity'], 'high', 210),

('PLANTAR', 'Plantar', 'Sole surface (foot)', 'surface', 
 ARRAY['lower_extremity'], 'high', 220),

('VENTRAL', 'Ventral', 'Belly/front surface', 'surface', 
 ARRAY['trunk'], 'medium', 230),

-- Positional Qualifiers
('SUPERFICIAL', 'Superficial', 'Close to surface', 'positional', 
 ARRAY['upper_extremity', 'lower_extremity', 'trunk', 'head_neck'], 'medium', 300),

('DEEP', 'Deep', 'Deep within tissues', 'positional', 
 ARRAY['upper_extremity', 'lower_extremity', 'trunk', 'head_neck'], 'medium', 310),

-- Functional Qualifiers
('WEIGHT_BEARING', 'Weight-bearing', 'During weight-bearing activities', 'functional', 
 ARRAY['lower_extremity', 'trunk'], 'high', 400),

('NON_WEIGHT_BEARING', 'Non-weight-bearing', 'During non-weight-bearing activities', 'functional', 
 ARRAY['lower_extremity', 'upper_extremity'], 'medium', 410),

-- Spinal-specific Qualifiers
('CENTRAL', 'Central', 'Midline/central aspect', 'positional', 
 ARRAY['trunk', 'head_neck'], 'high', 500),

('PARACENTRAL', 'Paracentral', 'Adjacent to midline', 'positional', 
 ARRAY['trunk', 'head_neck'], 'medium', 510),

-- Hand/Finger specific
('RADIAL', 'Radial', 'Thumb side', 'directional', 
 ARRAY['upper_extremity'], 'high', 600),

('ULNAR', 'Ulnar', 'Pinky side', 'directional', 
 ARRAY['upper_extremity'], 'high', 610);

-- Set up opposite relationships
UPDATE anatomical_qualifiers SET opposite_qualifier_id = (SELECT id FROM anatomical_qualifiers WHERE qualifier_code = 'POSTERIOR') WHERE qualifier_code = 'ANTERIOR';
UPDATE anatomical_qualifiers SET opposite_qualifier_id = (SELECT id FROM anatomical_qualifiers WHERE qualifier_code = 'ANTERIOR') WHERE qualifier_code = 'POSTERIOR';
UPDATE anatomical_qualifiers SET opposite_qualifier_id = (SELECT id FROM anatomical_qualifiers WHERE qualifier_code = 'INFERIOR') WHERE qualifier_code = 'SUPERIOR';
UPDATE anatomical_qualifiers SET opposite_qualifier_id = (SELECT id FROM anatomical_qualifiers WHERE qualifier_code = 'SUPERIOR') WHERE qualifier_code = 'INFERIOR';
UPDATE anatomical_qualifiers SET opposite_qualifier_id = (SELECT id FROM anatomical_qualifiers WHERE qualifier_code = 'LATERAL') WHERE qualifier_code = 'MEDIAL';
UPDATE anatomical_qualifiers SET opposite_qualifier_id = (SELECT id FROM anatomical_qualifiers WHERE qualifier_code = 'MEDIAL') WHERE qualifier_code = 'LATERAL';
UPDATE anatomical_qualifiers SET opposite_qualifier_id = (SELECT id FROM anatomical_qualifiers WHERE qualifier_code = 'DISTAL') WHERE qualifier_code = 'PROXIMAL';
UPDATE anatomical_qualifiers SET opposite_qualifier_id = (SELECT id FROM anatomical_qualifiers WHERE qualifier_code = 'PROXIMAL') WHERE qualifier_code = 'DISTAL';

-- Create indexes for performance
CREATE INDEX idx_anatomical_qualifiers_type ON anatomical_qualifiers(qualifier_type);
CREATE INDEX idx_anatomical_qualifiers_active ON anatomical_qualifiers(status) WHERE status = 'active';
CREATE INDEX idx_body_part_qualifiers_body_part ON body_part_qualifiers(body_part_id);
CREATE INDEX idx_body_part_qualifiers_qualifier ON body_part_qualifiers(qualifier_id);
CREATE INDEX idx_eval_selected_parts_new_evaluation ON evaluation_selected_parts_new(evaluation_id);
CREATE INDEX idx_eval_selected_parts_new_body_part ON evaluation_selected_parts_new(body_part_id);;