-- Script de teste para verificar se a view category_performance funciona
-- Execute este script no SQL Editor do Supabase

-- Testar a view category_performance
SELECT * FROM category_performance LIMIT 10;

-- Testar com dados específicos de um usuário
SELECT * FROM category_performance 
WHERE user_id = (SELECT id FROM auth.users LIMIT 1)
ORDER BY total_leads DESC;

-- Verificar se a view retorna dados corretos
SELECT 
  category,
  total_leads,
  avg_rating,
  leads_with_website,
  leads_with_phone,
  ROUND((leads_with_website::DECIMAL / total_leads) * 100, 2) as website_percentage,
  ROUND((leads_with_phone::DECIMAL / total_leads) * 100, 2) as phone_percentage
FROM category_performance
ORDER BY total_leads DESC;


























