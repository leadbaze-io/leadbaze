-- Adicionar colunas de leads bônus na tabela user_subscriptions
ALTER TABLE user_subscriptions ADD COLUMN IF NOT EXISTS bonus_leads INTEGER DEFAULT 0;
ALTER TABLE user_subscriptions ADD COLUMN IF NOT EXISTS bonus_leads_used INTEGER DEFAULT 0;

