-- =================================================================
-- MIGRATION: Fix create_user_profile RPC
-- Purpose: Change INSERT to UPSERT (ON CONFLICT DO UPDATE) to handle 
--          profiles already created by the auto-trigger
-- Date: 2025-12-12
-- =================================================================

CREATE OR REPLACE FUNCTION public.create_user_profile(
    p_user_id uuid,
    p_tax_type text,
    p_full_name text,
    p_email text,
    p_phone text,
    p_billing_street text,
    p_billing_number text,
    p_billing_neighborhood text,
    p_billing_city text,
    p_billing_state character varying,
    p_billing_zip_code text,
    p_cpf text DEFAULT NULL::text,
    p_cnpj text DEFAULT NULL::text,
    p_birth_date date DEFAULT NULL::date,
    p_company_name text DEFAULT NULL::text,
    p_billing_complement text DEFAULT NULL::text,
    p_billing_country text DEFAULT 'BR'::text,
    p_accepted_payment_methods text[] DEFAULT ARRAY['credit_card'::text, 'pix'::text],
    p_billing_cycle text DEFAULT 'monthly'::text,
    p_auto_renewal boolean DEFAULT true,
    p_lgpd_consent boolean DEFAULT true,
    p_lgpd_consent_ip text DEFAULT '127.0.0.1'::text,
    p_lgpd_consent_user_agent text DEFAULT 'Signup Form'::text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  result JSON;
BEGIN
  -- Insert or Update profile (Upsert)
  INSERT INTO user_profiles (
    user_id,
    tax_type,
    cpf,
    cnpj,
    full_name,
    email,
    phone,
    birth_date,
    company_name,
    billing_street,
    billing_number,
    billing_complement,
    billing_neighborhood,
    billing_city,
    billing_state,
    billing_zip_code,
    billing_country,
    accepted_payment_methods,
    billing_cycle,
    auto_renewal,
    lgpd_consent,
    lgpd_consent_date,
    lgpd_consent_ip,
    lgpd_consent_user_agent,
    updated_at
  ) VALUES (
    p_user_id,
    p_tax_type,
    p_cpf,
    p_cnpj,
    p_full_name,
    p_email,
    p_phone,
    p_birth_date,
    p_company_name,
    p_billing_street,
    p_billing_number,
    p_billing_complement,
    p_billing_neighborhood,
    p_billing_city,
    p_billing_state,
    p_billing_zip_code,
    p_billing_country,
    p_accepted_payment_methods,
    p_billing_cycle,
    p_auto_renewal,
    p_lgpd_consent,
    NOW(),
    p_lgpd_consent_ip,
    p_lgpd_consent_user_agent,
    NOW()
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    tax_type = EXCLUDED.tax_type,
    cpf = EXCLUDED.cpf,
    cnpj = EXCLUDED.cnpj,
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    birth_date = EXCLUDED.birth_date,
    company_name = EXCLUDED.company_name,
    billing_street = EXCLUDED.billing_street,
    billing_number = EXCLUDED.billing_number,
    billing_complement = EXCLUDED.billing_complement,
    billing_neighborhood = EXCLUDED.billing_neighborhood,
    billing_city = EXCLUDED.billing_city,
    billing_state = EXCLUDED.billing_state,
    billing_zip_code = EXCLUDED.billing_zip_code,
    billing_country = EXCLUDED.billing_country,
    accepted_payment_methods = EXCLUDED.accepted_payment_methods,
    billing_cycle = EXCLUDED.billing_cycle,
    auto_renewal = EXCLUDED.auto_renewal,
    lgpd_consent = EXCLUDED.lgpd_consent,
    lgpd_consent_date = EXCLUDED.lgpd_consent_date,
    lgpd_consent_ip = EXCLUDED.lgpd_consent_ip,
    lgpd_consent_user_agent = EXCLUDED.lgpd_consent_user_agent,
    updated_at = NOW()
  
  RETURNING to_json(user_profiles.*) INTO result;
  
  RETURN result;
END;
$function$;
