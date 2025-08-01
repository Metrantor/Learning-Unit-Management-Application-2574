-- 🔥 CRITICAL DATABASE FIXES for Tags and Content Types Storage
-- Execute this to ensure proper column structure

-- 1. Ensure tags, content_types, and custom_content_types columns exist
ALTER TABLE learning_units_sb2024 
ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS content_types JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS custom_content_types JSONB DEFAULT '[]'::jsonb;

-- 2. Add indexes for better performance on JSON queries
CREATE INDEX IF NOT EXISTS idx_learning_units_tags ON learning_units_sb2024 USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_learning_units_content_types ON learning_units_sb2024 USING GIN (content_types);
CREATE INDEX IF NOT EXISTS idx_learning_units_custom_content_types ON learning_units_sb2024 USING GIN (custom_content_types);

-- 3. Add constraints to ensure proper JSON format
ALTER TABLE learning_units_sb2024 
ADD CONSTRAINT IF NOT EXISTS tags_is_array CHECK (jsonb_typeof(tags) = 'array'),
ADD CONSTRAINT IF NOT EXISTS content_types_is_array CHECK (jsonb_typeof(content_types) = 'array'),
ADD CONSTRAINT IF NOT EXISTS custom_content_types_is_array CHECK (jsonb_typeof(custom_content_types) = 'array');

-- 4. Update any existing NULL values to empty arrays
UPDATE learning_units_sb2024 
SET 
  tags = COALESCE(tags, '[]'::jsonb),
  content_types = COALESCE(content_types, '[]'::jsonb),
  custom_content_types = COALESCE(custom_content_types, '[]'::jsonb)
WHERE 
  tags IS NULL 
  OR content_types IS NULL 
  OR custom_content_types IS NULL;

-- 5. Verify the structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_name = 'learning_units_sb2024'
AND column_name IN ('tags', 'content_types', 'custom_content_types')
ORDER BY column_name;

-- 6. Test data integrity
SELECT 
  id,
  title,
  jsonb_typeof(tags) as tags_type,
  jsonb_typeof(content_types) as content_types_type,
  jsonb_typeof(custom_content_types) as custom_content_types_type,
  jsonb_array_length(tags) as tags_count,
  jsonb_array_length(content_types) as content_types_count,
  jsonb_array_length(custom_content_types) as custom_content_types_count
FROM learning_units_sb2024
LIMIT 5;

-- 7. Create a sample test unit to verify functionality
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
  'test-tags-' || gen_random_uuid()::text,
  'Test Unit für Tags und Content Types',
  'Test-Lerneinheit zum Überprüfen der Tags- und Content-Types-Funktionalität',
  'Planung',
  NULL,
  '[
    {"id": "tag1", "label": "Test Tag 1", "color": "#3B82F6", "createdAt": "2024-01-01T00:00:00.000Z"},
    {"id": "tag2", "label": "Test Tag 2", "color": "#10B981", "createdAt": "2024-01-01T00:00:00.000Z"}
  ]'::jsonb,
  '["explanation", "video", "quiz"]'::jsonb,
  '[
    {"id": "custom1", "label": "Benutzerdefinierter Typ 1", "isCustom": true},
    {"id": "custom2", "label": "Benutzerdefinierter Typ 2", "isCustom": true}
  ]'::jsonb,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 8. Show the test data
SELECT 
  id,
  title,
  tags,
  content_types,
  custom_content_types
FROM learning_units_sb2024 
WHERE title LIKE 'Test Unit für Tags%'
LIMIT 1;

-- Summary: This script ensures that:
-- ✅ Tags, content_types, and custom_content_types columns exist as JSONB
-- ✅ Default values are empty arrays
-- ✅ Proper constraints ensure data integrity
-- ✅ Indexes are created for performance
-- ✅ Existing NULL values are converted to empty arrays
-- ✅ A test record validates the functionality