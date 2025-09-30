-- Script para corrigir a view category_performance
-- Execute este script no SQL Editor do Supabase

-- Dropar a view existente se ela existir
DROP VIEW IF EXISTS category_performance;

-- Recriar a view com a sintaxe correta usando LATERAL
CREATE OR REPLACE VIEW category_performance AS
SELECT 
  ll.user_id,
  lead_data->>'business_type' as category,
  COUNT(*) as total_leads,
  AVG((lead_data->>'rating')::DECIMAL) as avg_rating,
  COUNT(CASE WHEN lead_data->>'website' IS NOT NULL THEN 1 END) as leads_with_website,
  COUNT(CASE WHEN lead_data->>'phone' IS NOT NULL THEN 1 END) as leads_with_phone
FROM lead_lists ll,
LATERAL jsonb_array_elements(ll.leads) as lead_data
WHERE lead_data->>'business_type' IS NOT NULL
GROUP BY ll.user_id, lead_data->>'business_type';

-- Comentário da view
COMMENT ON VIEW category_performance IS 'Performance por categoria de negócio dos leads';


























