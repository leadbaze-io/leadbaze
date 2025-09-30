-- =====================================================
-- SISTEMA SIMPLES DE LEADS BÔNUS - SEM ASSINATURA
-- =====================================================
-- Apenas adiciona 30 leads bônus na tabela user_profiles
-- quando o usuário cria a conta

-- 1. Garantir que a tabela user_profiles existe com as colunas necessárias
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  bonus_leads INTEGER DEFAULT 0,
  bonus_leads_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Função simples para dar 30 leads bônus para novos usuários
CREATE OR REPLACE FUNCTION give_bonus_leads_to_new_user(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_bonus_leads INTEGER := 30;
BEGIN
  -- Dar 30 leads bônus para o usuário
  INSERT INTO user_profiles (user_id, bonus_leads, bonus_leads_used)
  VALUES (p_user_id, v_bonus_leads, 0)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    bonus_leads = v_bonus_leads,
    bonus_leads_used = 0,
    updated_at = NOW();
  
  RETURN json_build_object(
    'success', true,
    'message', 'Leads bônus concedidos com sucesso',
    'bonus_leads', v_bonus_leads
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Erro ao conceder leads bônus: ' || SQLERRM
    );
END;
$$;

-- 3. Função para verificar leads disponíveis (bônus + assinatura)
CREATE OR REPLACE FUNCTION check_leads_availability_simple(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_bonus_leads INTEGER := 0;
  v_bonus_leads_used INTEGER := 0;
  v_subscription_leads INTEGER := 0;
  v_subscription_leads_used INTEGER := 0;
  v_total_available INTEGER := 0;
  v_total_used INTEGER := 0;
BEGIN
  -- Buscar leads bônus do usuário
  SELECT 
    COALESCE(bonus_leads, 0),
    COALESCE(bonus_leads_used, 0)
  INTO v_bonus_leads, v_bonus_leads_used
  FROM user_profiles
  WHERE user_id = p_user_id;
  
  -- Buscar leads da assinatura (se existir)
  SELECT 
    COALESCE(pp.leads_included, 0),
    COALESCE(ups.leads_balance, 0)
  INTO v_subscription_leads, v_subscription_leads_used
  FROM user_payment_subscriptions ups
  JOIN payment_plans pp ON ups.plan_id = pp.id
  WHERE ups.user_id = p_user_id 
    AND ups.status = 'active'
    AND ups.current_period_end > NOW();
  
  -- Calcular totais
  v_total_available := v_bonus_leads + v_subscription_leads;
  v_total_used := v_bonus_leads_used + v_subscription_leads_used;
  
  RETURN json_build_object(
    'success', true,
    'bonus_leads', v_bonus_leads,
    'bonus_leads_used', v_bonus_leads_used,
    'subscription_leads', v_subscription_leads,
    'subscription_leads_used', v_subscription_leads_used,
    'total_available', v_total_available,
    'total_used', v_total_used,
    'remaining', v_total_available - v_total_used
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Erro ao verificar leads: ' || SQLERRM
    );
END;
$$;

-- 4. Função para consumir leads (prioriza bônus primeiro)
CREATE OR REPLACE FUNCTION consume_leads_simple(p_user_id UUID, p_quantity INTEGER DEFAULT 1)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_bonus_leads INTEGER := 0;
  v_bonus_leads_used INTEGER := 0;
  v_subscription_leads INTEGER := 0;
  v_subscription_leads_used INTEGER := 0;
  v_remaining_bonus INTEGER := 0;
  v_remaining_subscription INTEGER := 0;
  v_consumed_from_bonus INTEGER := 0;
  v_consumed_from_subscription INTEGER := 0;
BEGIN
  -- Buscar leads bônus do usuário
  SELECT 
    COALESCE(bonus_leads, 0),
    COALESCE(bonus_leads_used, 0)
  INTO v_bonus_leads, v_bonus_leads_used
  FROM user_profiles
  WHERE user_id = p_user_id;
  
  -- Buscar leads da assinatura (se existir)
  SELECT 
    COALESCE(pp.leads_included, 0),
    COALESCE(ups.leads_balance, 0)
  INTO v_subscription_leads, v_subscription_leads_used
  FROM user_payment_subscriptions ups
  JOIN payment_plans pp ON ups.plan_id = pp.id
  WHERE ups.user_id = p_user_id 
    AND ups.status = 'active'
    AND ups.current_period_end > NOW();
  
  -- Calcular leads restantes
  v_remaining_bonus := v_bonus_leads - v_bonus_leads_used;
  v_remaining_subscription := v_subscription_leads - v_subscription_leads_used;
  
  -- Verificar se há leads suficientes
  IF (v_remaining_bonus + v_remaining_subscription) < p_quantity THEN
    RETURN json_build_object(
      'success', false,
      'error', 'insufficient_leads',
      'message', 'Leads insuficientes',
      'available', v_remaining_bonus + v_remaining_subscription,
      'requested', p_quantity
    );
  END IF;
  
  -- Consumir leads (prioriza bônus primeiro)
  IF v_remaining_bonus >= p_quantity THEN
    -- Consumir apenas do bônus
    v_consumed_from_bonus := p_quantity;
    v_consumed_from_subscription := 0;
    
    UPDATE user_profiles 
    SET 
      bonus_leads_used = bonus_leads_used + v_consumed_from_bonus,
      updated_at = NOW()
    WHERE user_id = p_user_id;
    
  ELSE
    -- Consumir do bônus e da assinatura
    v_consumed_from_bonus := v_remaining_bonus;
    v_consumed_from_subscription := p_quantity - v_remaining_bonus;
    
    -- Atualizar bônus
    UPDATE user_profiles 
    SET 
      bonus_leads_used = bonus_leads_used + v_consumed_from_bonus,
      updated_at = NOW()
    WHERE user_id = p_user_id;
    
    -- Atualizar assinatura
    UPDATE user_payment_subscriptions 
    SET 
      leads_balance = leads_balance - v_consumed_from_subscription,
      updated_at = NOW()
    WHERE user_id = p_user_id 
      AND status = 'active'
      AND current_period_end > NOW();
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Leads consumidos com sucesso',
    'consumed_from_bonus', v_consumed_from_bonus,
    'consumed_from_subscription', v_consumed_from_subscription,
    'total_consumed', p_quantity
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Erro ao consumir leads: ' || SQLERRM
    );
END;
$$;

-- 5. Dar leads bônus para usuários existentes que não têm
INSERT INTO user_profiles (user_id, bonus_leads, bonus_leads_used)
SELECT DISTINCT u.id, 30, 0
FROM auth.users u
WHERE u.id NOT IN (SELECT user_id FROM user_profiles)
ON CONFLICT (user_id) DO NOTHING;












