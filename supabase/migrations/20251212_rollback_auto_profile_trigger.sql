-- =================================================================
-- ROLLBACK MIGRATION: Remove Auto-Create User Profile Trigger
-- Purpose: Revert to manual profile creation if needed
-- Date: 2025-12-12
-- =================================================================

-- Drop the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the function
DROP FUNCTION IF EXISTS public.auto_create_user_profile();

-- Verification query (should return 0 rows after rollback)
-- SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
