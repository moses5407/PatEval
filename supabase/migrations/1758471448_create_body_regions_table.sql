-- Migration: create_body_regions_table
-- Created at: 1758471448

-- Create the body_regions reference table
CREATE TABLE IF NOT EXISTS body_regions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);;