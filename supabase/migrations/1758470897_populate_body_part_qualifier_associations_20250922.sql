-- Migration: populate_body_part_qualifier_associations_20250922
-- Created at: 1758470897

-- Populate body part qualifier associations for common clinical combinations
-- This makes the system immediately usable by defining relevant qualifiers for each body part

-- Function to bulk insert qualifier associations
WITH qualifier_mappings AS (
    -- Surface qualifiers for extremity segments
    SELECT bp.id as body_part_id, aq.id as qualifier_id, 'primary' as qualifier_relevance
    FROM body_parts_new bp
    CROSS JOIN anatomical_qualifiers aq
    WHERE (
        (bp.anatomical_segment LIKE '%arm%' OR bp.anatomical_segment = 'forearm') 
        AND aq.qualifier_code IN ('ANTERIOR', 'POSTERIOR', 'MEDIAL', 'LATERAL', 'PROXIMAL', 'DISTAL')
    )
    OR (
        (bp.anatomical_segment LIKE '%thigh%' OR bp.anatomical_segment = 'leg') 
        AND aq.qualifier_code IN ('ANTERIOR', 'POSTERIOR', 'MEDIAL', 'LATERAL', 'PROXIMAL', 'DISTAL')
    )
    OR (
        bp.anatomical_segment = 'hand' 
        AND aq.qualifier_code IN ('DORSAL', 'PALMAR', 'RADIAL', 'ULNAR', 'PROXIMAL', 'DISTAL')
    )
    OR (
        bp.anatomical_segment = 'foot' 
        AND aq.qualifier_code IN ('DORSAL', 'PLANTAR', 'MEDIAL', 'LATERAL', 'PROXIMAL', 'DISTAL')
    )
    OR (
        bp.anatomical_segment IN ('cervical', 'thoracic', 'lumbar', 'sacral') 
        AND aq.qualifier_code IN ('ANTERIOR', 'POSTERIOR', 'CENTRAL', 'PARACENTRAL', 'SUPERIOR', 'INFERIOR')
    )
    OR (
        bp.anatomical_segment IN ('shoulder', 'elbow', 'wrist', 'hip', 'knee', 'ankle') 
        AND aq.qualifier_code IN ('ANTERIOR', 'POSTERIOR', 'MEDIAL', 'LATERAL', 'SUPERIOR', 'INFERIOR')
    )
    OR (
        bp.anatomical_segment IN ('thorax', 'abdomen') 
        AND aq.qualifier_code IN ('ANTERIOR', 'POSTERIOR', 'SUPERIOR', 'INFERIOR', 'CENTRAL', 'SUPERFICIAL', 'DEEP')
    )
    OR (
        bp.structure_type = 'surface'
        AND aq.qualifier_code IN ('SUPERFICIAL', 'DEEP')
    )
    OR (
        bp.weight_bearing = true 
        AND aq.qualifier_code IN ('WEIGHT_BEARING', 'NON_WEIGHT_BEARING')
    )
)
INSERT INTO body_part_qualifiers (body_part_id, qualifier_id, qualifier_relevance)
SELECT DISTINCT body_part_id, qualifier_id, qualifier_relevance
FROM qualifier_mappings;

-- Add specific high-relevance combinations for clinical priority areas
INSERT INTO body_part_qualifiers (body_part_id, qualifier_id, qualifier_relevance, clinical_notes)
SELECT 
    bp.id,
    aq.id,
    'primary',
    'High clinical relevance for ' || bp.display_name
FROM body_parts_new bp
CROSS JOIN anatomical_qualifiers aq
WHERE (
    -- Lumbar spine with directional qualifiers
    (bp.part_code LIKE 'L%' AND aq.qualifier_code IN ('CENTRAL', 'PARACENTRAL'))
    OR
    -- Shoulder complex with functional qualifiers
    (bp.part_code = 'GH_JOINT' AND aq.qualifier_code IN ('ANTERIOR', 'POSTERIOR', 'SUPERIOR', 'INFERIOR'))
    OR
    -- Knee with weight-bearing emphasis
    (bp.part_code IN ('TIBIOFEMORAL', 'PATELLOFEMORAL') AND aq.qualifier_code = 'WEIGHT_BEARING')
    OR
    -- Hand/finger precision
    (bp.part_code LIKE '%THUMB%' AND aq.qualifier_code IN ('RADIAL', 'PALMAR', 'DORSAL'))
)
ON CONFLICT (body_part_id, qualifier_id) DO NOTHING;

-- Create summary view for verification
CREATE VIEW qualifier_associations_summary AS
SELECT 
    bp.anatomical_region,
    bp.anatomical_segment,
    COUNT(bpq.qualifier_id) as qualifier_count,
    STRING_AGG(aq.qualifier_name, ', ' ORDER BY aq.sort_order) as available_qualifiers
FROM body_parts_new bp
LEFT JOIN body_part_qualifiers bpq ON bp.id = bpq.body_part_id
LEFT JOIN anatomical_qualifiers aq ON bpq.qualifier_id = aq.id
WHERE bp.status = 'active' AND (aq.status = 'active' OR aq.status IS NULL)
GROUP BY bp.anatomical_region, bp.anatomical_segment, bp.part_level
ORDER BY bp.anatomical_region, bp.part_level, bp.anatomical_segment;;