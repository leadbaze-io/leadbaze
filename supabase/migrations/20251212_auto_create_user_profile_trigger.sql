-- =================================================================
-- MIGRATION: Auto-Create User Profile Trigger (FIXED)
-- Purpose: Automatically create a basic user profile when auth user is created
-- Fix: Added required columns (tax_type, phone) that were causing rollback
-- Date: 2025-12-12
-- =================================================================

-- Create function to auto-create user profile
CREATE OR REPLACE FUNCTION public.auto_create_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert basic profile (will be updated later by frontend with full data)
  INSERT INTO public.user_profiles (
    user_id,
    email,
    full_name,
    tax_type,          -- REQUIRED
    phone,             -- REQUIRED
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    'pessoa_fisica',   -- Default placeholder, will be updated by frontend
    COALESCE(NEW.phone, ''), -- Default empty if no phone provided
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;  -- Evita erro se já existe
  
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_user_profile();

-- Add comment for documentation
COMMENT ON FUNCTION public.auto_create_user_profile() IS 
'Automatically creates a basic user profile when a new user registers. Includes required fields to prevent transaction rollback.';
