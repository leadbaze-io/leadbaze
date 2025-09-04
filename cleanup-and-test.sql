-- Limpar dados e testar com nova função de hash
-- Execute este SQL no Supabase

-- 1. Limpar todos os dados existentes
DELETE FROM campaign_leads;

-- 2. Verificar se foi limpo
SELECT COUNT(*) as remaining_records FROM campaign_leads;
