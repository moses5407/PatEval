-- Migration: create_body_parts_reference_table
-- Created at: 1758471425

-- Create the main body_parts reference table
CREATE TABLE body_parts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    body_region_id INTEGER,
    has_rom BOOLEAN DEFAULT false,
    has_strength BOOLEAN DEFAULT false,
    is_joint BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_body_parts_name ON body_parts(name);
CREATE INDEX idx_body_parts_region ON body_parts(body_region_id);;