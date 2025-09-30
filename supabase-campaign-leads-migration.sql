-- Script de migração para remover campos de status da tabela campaign_leads
-- Execute este script no SQL Editor do Supabase para atualizar a tabela existente

-- ==============================================
-- REMOVER VIEWS E OBJETOS DEPENDENTES
-- ==============================================

-- Remover view que depende das colunas de status
DROP VIEW IF EXISTS campaign_leads_view;

-- ==============================================
-- REMOVER CAMPOS DE STATUS (SOFT DELETE)
-- ==============================================

-- Remover colunas relacionadas ao status
ALTER TABLE campaign_leads DROP COLUMN IF EXISTS status;
ALTER TABLE campaign_leads DROP COLUMN IF EXISTS removed_at;
ALTER TABLE campaign_leads DROP COLUMN IF EXISTS sent_at;
ALTER TABLE campaign_leads DROP COLUMN IF EXISTS error_message;

-- ==============================================
-- REMOVER ÍNDICES RELACIONADOS AO STATUS
-- ==============================================

-- Remover índice de status (se existir)
DROP INDEX IF EXISTS idx_campaign_leads_status;

-- ==============================================
-- ATUALIZAR FUNÇÕES
-- ==============================================

-- Atualizar função de contagem para não usar status
CREATE OR REPLACE FUNCTION count_campaign_leads(campaign_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) 
    FROM campaign_leads 
    WHERE campaign_id = campaign_uuid
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- ==============================================
-- RECRIAR VIEW SEM CAMPOS DE STATUS
-- ==============================================

-- Recriar view sem campos de status
CREATE OR REPLACE VIEW campaign_leads_view AS
SELECT 
  cl.id,
  cl.campaign_id,
  cl.list_id,
  cl.lead_data,
  cl.lead_hash,
  cl.added_at,
  ll.name as list_name,
  ll.total_leads as list_total_leads,
  bc.name as campaign_name,
  bc.status as campaign_status
FROM campaign_leads cl
JOIN lead_lists ll ON cl.list_id = ll.id
JOIN bulk_campaigns bc ON cl.campaign_id = bc.id;

-- ==============================================
-- VERIFICAÇÃO FINAL
-- ==============================================

-- Verificar estrutura final da tabela
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'campaign_leads'
ORDER BY ordinal_position;

-- Verificar se a view foi recriada
SELECT 
  schemaname,
  viewname,
  definition
FROM pg_views 
WHERE viewname = 'campaign_leads_view';

-- Verificar se as políticas RLS ainda existem
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'campaign_leads';
