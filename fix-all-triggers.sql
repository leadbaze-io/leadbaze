-- CORREÇÃO COMPLETA: Corrigir todos os triggers que interferem com a mensagem
-- O problema é que os triggers fazem UPDATE em bulk_campaigns sem preservar a mensagem

-- 1. Primeiro, vamos ver a função atual
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'update_campaign_total_leads';

-- 2. Recriar a função para preservar TODOS os campos existentes
CREATE OR REPLACE FUNCTION update_campaign_total_leads()
RETURNS TRIGGER AS $$
DECLARE
  current_message TEXT;
  current_name TEXT;
  current_status TEXT;
  current_selected_lists TEXT[];
  current_created_at TIMESTAMP;
  current_user_id UUID;
BEGIN
  -- Obter os valores atuais dos campos importantes
  SELECT message, name, status, selected_lists, created_at, user_id
  INTO current_message, current_name, current_status, current_selected_lists, current_created_at, current_user_id
  FROM bulk_campaigns 
  WHERE id = NEW.campaign_id;
  
  -- Atualizar APENAS o campo total_leads, preservando TODOS os outros campos
  UPDATE bulk_campaigns 
  SET 
    total_leads = count_campaign_leads(NEW.campaign_id),
    updated_at = NOW(),
    -- Preservar todos os campos importantes
    message = COALESCE(current_message, message),
    name = COALESCE(current_name, name),
    status = COALESCE(current_status, status),
    selected_lists = COALESCE(current_selected_lists, selected_lists),
    created_at = COALESCE(current_created_at, created_at),
    user_id = COALESCE(current_user_id, user_id)
  WHERE id = NEW.campaign_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Verificar se a função foi atualizada
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'update_campaign_total_leads';

-- 4. Verificar se os triggers ainda estão ativos
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'campaign_leads'
ORDER BY trigger_name;

-- 5. Teste: Verificar se a correção funcionou
-- Execute este comando para testar se a mensagem é preservada
SELECT 
    id,
    name,
    message,
    total_leads,
    updated_at
FROM bulk_campaigns 
WHERE name = 'grrgdgf';
