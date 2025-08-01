-- 🔥 CRITICAL: Run this SQL to fix the database structure for tags and content types
-- This ensures proper JSON storage and retrieval

-- 1. First, check current structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_name = 'learning_units_sb2024'
AND column_name IN ('tags', 'content_types', 'custom_content_types')
ORDER BY column_name;

-- 2. Add missing columns if they don't exist
ALTER TABLE learning_units_sb2024 
ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS content_types JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS custom_content_types JSONB DEFAULT '[]'::jsonb;

-- 3. Update any NULL values to empty arrays
UPDATE learning_units_sb2024 
SET 
  tags = COALESCE(tags, '[]'::jsonb),
  content_types = COALESCE(content_types, '[]'::jsonb),
  custom_content_types = COALESCE(custom_content_types, '[]'::jsonb)
WHERE 
  tags IS NULL 
  OR content_types IS NULL 
  OR custom_content_types IS NULL;

-- 4. Add constraints to ensure proper JSON format
ALTER TABLE learning_units_sb2024 
ADD CONSTRAINT IF NOT EXISTS tags_is_array CHECK (jsonb_typeof(tags) = 'array'),
ADD CONSTRAINT IF NOT EXISTS content_types_is_array CHECK (jsonb_typeof(content_types) = 'array'),
ADD CONSTRAINT IF NOT EXISTS custom_content_types_is_array CHECK (jsonb_typeof(custom_content_types) = 'array');

-- 5. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_learning_units_tags ON learning_units_sb2024 USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_learning_units_content_types ON learning_units_sb2024 USING GIN (content_types);
CREATE INDEX IF NOT EXISTS idx_learning_units_custom_content_types ON learning_units_sb2024 USING GIN (custom_content_types);

-- 6. Verify the fixes
SELECT 
  id,
  title,
  jsonb_typeof(tags) as tags_type,
  jsonb_typeof(content_types) as content_types_type,
  jsonb_typeof(custom_content_types) as custom_content_types_type,
  COALESCE(jsonb_array_length(tags), 0) as tags_count,
  COALESCE(jsonb_array_length(content_types), 0) as content_types_count,
  COALESCE(jsonb_array_length(custom_content_types), 0) as custom_content_types_count
FROM learning_units_sb2024
ORDER BY created_at DESC
LIMIT 5;

-- 7. Test insertion to verify functionality
INSERT INTO learning_units_sb2024 (
  id,
  title,
  description,
  editorial_state,
  topic_id,
  tags,
  content_types,
  custom_content_types,
  created_at,
  updated_at
) VALUES (
  'test-tags-verification-' || extract(epoch from now())::text,
  'Test für Tags und Content Types Verifikation',
  'Diese Test-Lerneinheit überprüft, ob Tags und Content Types korrekt gespeichert werden.',
  'Planung',
  NULL,
  '[
    {"id": "test-tag-1", "label": "Test Tag 1", "color": "#3B82F6", "createdAt": "2024-01-01T00:00:00.000Z"},
    {"id": "test-tag-2", "label": "Test Tag 2", "color": "#10B981", "createdAt": "2024-01-01T00:00:00.000Z"}
  ]'::jsonb,
  '["explanation", "video", "quiz"]'::jsonb,
  '[
    {"id": "custom-1", "label": "Benutzerdefinierter Typ 1", "isCustom": true},
    {"id": "custom-2", "label": "Benutzerdefinierter Typ 2", "isCustom": true}
  ]'::jsonb,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 8. Show the test data to verify it worked
SELECT 
  id,
  title,
  tags,
  content_types,
  custom_content_types,
  created_at
FROM learning_units_sb2024 
WHERE title LIKE 'Test für Tags%'
ORDER BY created_at DESC
LIMIT 1;

-- 9. Clean up test data (optional)
-- DELETE FROM learning_units_sb2024 WHERE title LIKE 'Test für Tags%';

COMMIT;