-- =================================================================
-- MIGRATION: Make billing address fields nullable
-- Purpose: Allow trigger to create minimal user profile without address
--          Address will be filled by frontend after signup
-- Date: 2025-12-12
-- =================================================================

-- Make billing address fields nullable (they're filled by form, not at signup)
ALTER TABLE public.user_profiles
  ALTER COLUMN billing_street DROP NOT NULL,
  ALTER COLUMN billing_number DROP NOT NULL,
  ALTER COLUMN billing_neighborhood DROP NOT NULL,
  ALTER COLUMN billing_city DROP NOT NULL,
  ALTER COLUMN billing_state DROP NOT NULL,
  ALTER COLUMN billing_zip_code DROP NOT NULL;

-- Add comment
COMMENT ON TABLE public.user_profiles IS 
'User profiles table. Billing address fields are optional during trigger-based creation and filled by frontend during registration flow.';
