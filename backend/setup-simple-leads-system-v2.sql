-- =====================================================
-- SISTEMA SIMPLES DE LEADS BÔNUS - VERSÃO 2
-- Usando tabela user_subscriptions existente
-- =====================================================

-- 1. Adicionar colunas de leads bônus na tabela user_subscriptions
ALTER TABLE user_subscriptions ADD COLUMN IF NOT EXISTS bonus_leads INTEGER DEFAULT 0;
ALTER TABLE user_subscriptions ADD COLUMN IF NOT EXISTS bonus_leads_used INTEGER DEFAULT 0;

-- 2. Função para dar leads bônus para novos usuários
CREATE OR REPLACE FUNCTION give_bonus_leads_to_new_user(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_bonus_leads INTEGER := 30;
  v_existing_subscription RECORD;
BEGIN
  -- Verificar se já existe uma assinatura para o usuário
  SELECT * INTO v_existing_subscription
  FROM user_subscriptions 
  WHERE user_id = p_user_id 
  ORDER BY created_at DESC 
  LIMIT 1;
  
  IF v_existing_subscription IS NOT NULL THEN
    -- Atualizar assinatura existente com leads bônus
    UPDATE user_subscriptions 
    SET 
      bonus_leads = v_bonus_leads,
      bonus_leads_used = 0,
      updated_at = NOW()
    WHERE id = v_existing_subscription.id;
  ELSE
    -- Criar uma "assinatura" especial para leads bônus (sem plano pago)
    INSERT INTO user_subscriptions (
      user_id,
      plan_id,
      status,
      billing_cycle,
      current_period_start,
      current_period_end,
      leads_used,
      leads_remaining,
      auto_renewal,
      gateway_subscription_id,
      bonus_leads,
      bonus_leads_used,
      created_at,
      updated_at
    ) VALUES (
      p_user_id,
      '00000000-0000-0000-0000-000000000000', -- ID do plano gratuito
      'active',
      'monthly',
      NOW(),
      NOW() + INTERVAL '1 month',
      0,
      0, -- Não tem leads da assinatura, apenas bônus
      false,
      'bonus_leads_' || p_user_id,
      v_bonus_leads,
      0,
      NOW(),
      NOW()
    );
  END IF;
  
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
  v_subscription RECORD;
  v_remaining_bonus INTEGER;
  v_remaining_subscription INTEGER;
  v_total_available INTEGER;
BEGIN
  -- Buscar assinatura do usuário (pode ser bônus ou paga)
  SELECT us.*, sp.leads_limit
  INTO v_subscription
  FROM user_subscriptions us
  LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id 
  ORDER BY us.created_at DESC
  LIMIT 1;
  
  IF v_subscription IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'no_subscription',
      'message', 'Usuário não possui assinatura'
    );
  END IF;
  
  -- Calcular leads disponíveis
  v_remaining_bonus := GREATEST(0, v_subscription.bonus_leads - v_subscription.bonus_leads_used);
  v_remaining_subscription := GREATEST(0, v_subscription.leads_remaining);
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
      UPDATE user_subscriptions 
      SET bonus_leads_used = bonus_leads_used + p_quantity
      WHERE id = v_subscription.id;
      
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
      UPDATE user_subscriptions 
      SET 
        bonus_leads_used = bonus_leads,
        leads_remaining = leads_remaining - (p_quantity - v_remaining_bonus)
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
  v_subscription RECORD;
  v_remaining_bonus INTEGER;
  v_remaining_subscription INTEGER;
  v_total_available INTEGER;
BEGIN
  -- Buscar assinatura do usuário (pode ser bônus ou paga)
  SELECT us.*, sp.leads_limit, sp.display_name, sp.price_monthly
  INTO v_subscription
  FROM user_subscriptions us
  LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id 
  ORDER BY us.created_at DESC
  LIMIT 1;
  
  IF v_subscription IS NULL THEN
    RETURN json_build_object(
      'success', true,
      'user_id', p_user_id,
      'has_subscription', false,
      'total_available', 0,
      'total_used', 0
    );
  END IF;
  
  -- Calcular leads disponíveis
  v_remaining_bonus := GREATEST(0, v_subscription.bonus_leads - v_subscription.bonus_leads_used);
  v_remaining_subscription := GREATEST(0, v_subscription.leads_remaining);
  v_total_available := v_remaining_bonus + v_remaining_subscription;
  
  RETURN json_build_object(
    'success', true,
    'user_id', p_user_id,
    'bonus_leads', v_subscription.bonus_leads,
    'bonus_leads_used', v_subscription.bonus_leads_used,
    'remaining_bonus', v_remaining_bonus,
    'has_subscription', true,
    'subscription', json_build_object(
      'id', v_subscription.id,
      'plan_id', v_subscription.plan_id,
      'plan_name', CASE 
        WHEN v_subscription.plan_id = '00000000-0000-0000-0000-000000000000' THEN 'bonus'
        ELSE 'paid'
      END,
      'display_name', COALESCE(v_subscription.display_name, 'Leads Bônus'),
      'price_monthly', COALESCE(v_subscription.price_monthly, 0),
      'leads_limit', COALESCE(v_subscription.leads_limit, 0),
      'leads_remaining', v_remaining_subscription,
      'status', v_subscription.status
    ),
    'total_available', v_total_available,
    'total_used', (v_subscription.bonus_leads_used + v_subscription.leads_used)
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Erro ao buscar status: ' || SQLERRM
    );
END;
$$;

-- 5. Dar leads bônus para usuários existentes que não têm leads bônus
-- (Esta parte será executada via função quando necessário)
