-- Adicionar plano Enterprise se não existir
INSERT INTO subscription_plans (name, display_name, description, price_monthly, price_yearly, leads_limit, features, sort_order) 
VALUES (
  'enterprise',
  'Plano Enterprise',
  'Solução completa para grandes empresas que precisam de máxima performance',
  997.00,
  9970.00, -- 10% desconto anual
  10000,
  '[
    "10.000 leads por mês",
    "Suporte dedicado 24/7",
    "Relatórios customizados",
    "Automação avançada",
    "Integração ilimitada",
    "Consultoria estratégica",
    "API personalizada",
    "Treinamento da equipe"
  ]'::jsonb,
  3
) ON CONFLICT (name) DO NOTHING;

-- Verificar se foi inserido
SELECT id, name, display_name, price_monthly, leads_limit 
FROM subscription_plans 
WHERE name = 'enterprise';



