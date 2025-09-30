-- Migration script to add ignored_lists column to existing bulk_campaigns table
-- Execute this script in the Supabase SQL Editor

-- Add the ignored_lists column to existing table
ALTER TABLE bulk_campaigns 
ADD COLUMN IF NOT EXISTS ignored_lists TEXT[] DEFAULT '{}';

-- Update existing campaigns to have empty ignored_lists array
UPDATE bulk_campaigns 
SET ignored_lists = '{}' 
WHERE ignored_lists IS NULL;

-- Add comment for the new column
COMMENT ON COLUMN bulk_campaigns.ignored_lists IS 'Array com IDs das listas de leads ignoradas (duplicadas)';

-- Verify the column was added
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'bulk_campaigns' 
  AND column_name = 'ignored_lists';



















