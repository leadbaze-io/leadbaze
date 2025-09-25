-- Função RPC para criar perfil de usuário
-- Esta função pode ser chamada durante o signup com privilégios elevados

-- Remover TODAS as versões da função create_user_profile
DO $$ 
DECLARE
    func_record RECORD;
BEGIN
    -- Buscar todas as funções com o nome create_user_profile
    FOR func_record IN 
        SELECT proname, oidvectortypes(proargtypes) as argtypes
        FROM pg_proc 
        WHERE proname = 'create_user_profile'
    LOOP
        -- Remover cada função encontrada
        EXECUTE 'DROP FUNCTION IF EXISTS create_user_profile(' || func_record.argtypes || ')';
        RAISE NOTICE 'Removida função: create_user_profile(%)', func_record.argtypes;
    END LOOP;
END $$;

CREATE OR REPLACE FUNCTION create_user_profile(
  p_user_id UUID,
  p_tax_type TEXT,
  p_full_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_billing_street TEXT,
  p_billing_number TEXT,
  p_billing_neighborhood TEXT,
  p_billing_city TEXT,
  p_billing_state VARCHAR(2),
  p_billing_zip_code TEXT,
  p_cpf TEXT DEFAULT NULL,
  p_cnpj TEXT DEFAULT NULL,
  p_birth_date DATE DEFAULT NULL,
  p_company_name TEXT DEFAULT NULL,
  p_billing_complement TEXT DEFAULT NULL,
  p_billing_country TEXT DEFAULT 'BR',
  p_accepted_payment_methods TEXT[] DEFAULT ARRAY['credit_card', 'pix'],
  p_billing_cycle TEXT DEFAULT 'monthly',
  p_auto_renewal BOOLEAN DEFAULT true,
  p_lgpd_consent BOOLEAN DEFAULT true,
  p_lgpd_consent_ip TEXT DEFAULT '127.0.0.1',
  p_lgpd_consent_user_agent TEXT DEFAULT 'Signup Form'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER -- Executa com privilégios do criador da função
AS $$
DECLARE
  result JSON;
BEGIN
  -- Inserir o perfil
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
    lgpd_consent_user_agent
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
    p_lgpd_consent_user_agent
  )
  RETURNING to_json(user_profiles.*) INTO result;
  
  RETURN result;
END;
$$;

-- Conceder permissão para a função ser executada por usuários autenticados
GRANT EXECUTE ON FUNCTION create_user_profile TO authenticated;
