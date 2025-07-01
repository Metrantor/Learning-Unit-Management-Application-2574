-- 🚀 CRITICAL FIX: Add owner_id column to topics table
-- This SQL should be executed in Supabase SQL Editor

-- Add owner_id column to topics_sb2024 table if it doesn't exist
ALTER TABLE topics_sb2024 
ADD COLUMN IF NOT EXISTS owner_id UUID;

-- Add a comment to document the column
COMMENT ON COLUMN topics_sb2024.owner_id IS 'References the user who owns this topic';

-- Optional: Add an index for better performance
CREATE INDEX IF NOT EXISTS idx_topics_sb2024_owner_id ON topics_sb2024(owner_id);

-- Verify the column was created
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'topics_sb2024' 
AND column_name = 'owner_id';