-- =====================================================
-- SISTEMA SIMPLES DE LEADS BÔNUS
-- =====================================================

-- 1. Criar tabela de perfil de usuário para leads bônus
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY,
  bonus_leads INTEGER DEFAULT 0,
  bonus_leads_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Função para dar leads bônus para novos usuários
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

-- 3. Função para consumir leads (bônus ou assinatura)
CREATE OR REPLACE FUNCTION consume_lead_simple(p_user_id UUID, p_quantity INTEGER DEFAULT 1)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user RECORD;
  v_subscription RECORD;
  v_remaining_bonus INTEGER;
  v_remaining_subscription INTEGER;
  v_total_available INTEGER;
BEGIN
  -- Buscar dados do usuário
  SELECT bonus_leads, bonus_leads_used INTO v_user
  FROM user_profiles WHERE user_id = p_user_id;
  
  -- Buscar assinatura ativa (se houver)
  SELECT us.*, sp.leads_limit
  INTO v_subscription
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id AND us.status = 'active'
  ORDER BY us.created_at DESC
  LIMIT 1;
  
  -- Calcular leads disponíveis
  v_remaining_bonus := GREATEST(0, v_user.bonus_leads - v_user.bonus_leads_used);
  
  IF v_subscription IS NOT NULL THEN
    v_remaining_subscription := GREATEST(0, v_subscription.leads_remaining);
  ELSE
    v_remaining_subscription := 0;
  END IF;
  
  v_total_available := v_remaining_bonus + v_remaining_subscription;
  
  -- Verificar se tem leads suficientes
  IF v_total_available < p_quantity THEN
    RETURN json_build_object(
      'success', false,
      'error', 'insufficient_leads',
      'message', 'Leads insuficientes',
      'available', v_total_available,
      'requested', p_quantity
    );
  END IF;
  
  -- Consumir leads bônus primeiro
  IF v_remaining_bonus > 0 THEN
    IF v_remaining_bonus >= p_quantity THEN
      -- Consumir apenas leads bônus
      UPDATE user_profiles 
      SET bonus_leads_used = bonus_leads_used + p_quantity
      WHERE user_id = p_user_id;
      
      RETURN json_build_object(
        'success', true,
        'message', 'Leads bônus consumidos',
        'consumed_bonus', p_quantity,
        'consumed_subscription', 0,
        'remaining_bonus', v_remaining_bonus - p_quantity,
        'remaining_subscription', v_remaining_subscription
      );
    ELSE
      -- Consumir todos os leads bônus e parte da assinatura
      UPDATE user_profiles 
      SET bonus_leads_used = bonus_leads
      WHERE user_id = p_user_id;
      
      UPDATE user_subscriptions 
      SET leads_remaining = leads_remaining - (p_quantity - v_remaining_bonus)
      WHERE id = v_subscription.id;
      
      RETURN json_build_object(
        'success', true,
        'message', 'Leads bônus e assinatura consumidos',
        'consumed_bonus', v_remaining_bonus,
        'consumed_subscription', p_quantity - v_remaining_bonus,
        'remaining_bonus', 0,
        'remaining_subscription', v_remaining_subscription - (p_quantity - v_remaining_bonus)
      );
    END IF;
  ELSE
    -- Consumir apenas leads da assinatura
    UPDATE user_subscriptions 
    SET leads_remaining = leads_remaining - p_quantity
    WHERE id = v_subscription.id;
    
    RETURN json_build_object(
      'success', true,
      'message', 'Leads da assinatura consumidos',
      'consumed_bonus', 0,
      'consumed_subscription', p_quantity,
      'remaining_bonus', 0,
      'remaining_subscription', v_remaining_subscription - p_quantity
    );
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Erro ao consumir leads: ' || SQLERRM
    );
END;
$$;

-- 4. Função para obter status completo do usuário
CREATE OR REPLACE FUNCTION get_user_leads_status(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user RECORD;
  v_subscription RECORD;
  v_remaining_bonus INTEGER;
  v_remaining_subscription INTEGER;
  v_total_available INTEGER;
BEGIN
  -- Buscar dados do usuário
  SELECT bonus_leads, bonus_leads_used INTO v_user
  FROM user_profiles WHERE user_id = p_user_id;
  
  -- Buscar assinatura ativa (se houver)
  SELECT us.*, sp.leads_limit, sp.display_name, sp.price_monthly
  INTO v_subscription
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id AND us.status = 'active'
  ORDER BY us.created_at DESC
  LIMIT 1;
  
  -- Calcular leads disponíveis
  v_remaining_bonus := GREATEST(0, v_user.bonus_leads - v_user.bonus_leads_used);
  
  IF v_subscription IS NOT NULL THEN
    v_remaining_subscription := GREATEST(0, v_subscription.leads_remaining);
  ELSE
    v_remaining_subscription := 0;
  END IF;
  
  v_total_available := v_remaining_bonus + v_remaining_subscription;
  
  RETURN json_build_object(
    'success', true,
    'user_id', p_user_id,
    'bonus_leads', v_user.bonus_leads,
    'bonus_leads_used', v_user.bonus_leads_used,
    'remaining_bonus', v_remaining_bonus,
    'has_subscription', v_subscription IS NOT NULL,
    'subscription', CASE 
      WHEN v_subscription IS NOT NULL THEN json_build_object(
        'id', v_subscription.id,
        'plan_name', v_subscription.plan_name,
        'display_name', v_subscription.display_name,
        'price_monthly', v_subscription.price_monthly,
        'leads_limit', v_subscription.leads_limit,
        'leads_remaining', v_remaining_subscription,
        'status', v_subscription.status
      )
      ELSE NULL
    END,
    'total_available', v_total_available,
    'total_used', (v_user.bonus_leads_used + COALESCE(v_subscription.leads_used, 0))
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Erro ao buscar status: ' || SQLERRM
    );
END;
$$;

-- 5. Dar leads bônus para usuários existentes que não têm assinatura
INSERT INTO user_profiles (user_id, bonus_leads, bonus_leads_used)
SELECT DISTINCT us.user_id, 30, 0
FROM user_subscriptions us
WHERE us.user_id NOT IN (
  SELECT DISTINCT user_id 
  FROM user_subscriptions 
  WHERE status = 'active'
) AND us.user_id NOT IN (SELECT user_id FROM user_profiles)
ON CONFLICT (user_id) DO NOTHING;
