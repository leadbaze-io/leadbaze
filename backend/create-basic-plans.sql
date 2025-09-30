-- Criar planos básicos se não existirem
INSERT INTO subscription_plans (name, display_name, description, price_monthly, price_yearly, leads_limit, features, sort_order) VALUES
(
  'start',
  'Plano Start',
  'Ideal para pequenas empresas que estão começando no marketing digital',
  200.00,
  2000.00, -- 10% desconto anual
  1000,
  '[
    "1.000 leads por mês",
    "Suporte por email",
    "Relatórios básicos",
    "Integração com CRM",
    "Templates de email"
  ]'::jsonb,
  1
),
(
  'scale',
  'Plano Scale',
  'Perfeito para empresas em crescimento que precisam de mais volume',
  497.00,
  4970.00, -- 10% desconto anual
  4000,
  '[
    "4.000 leads por mês",
    "Suporte prioritário",
    "Relatórios avançados",
    "Integração com múltiplos CRMs",
    "Templates personalizados",
    "Automação de follow-up",
    "Análise de performance"
  ]'::jsonb,
  2
),
(
  'enterprise',
  'Plano Enterprise',
  'Solução completa para grandes empresas com alta demanda',
  997.00,
  9970.00, -- 10% desconto anual
  10000,
  '[
    "10.000+ leads por mês",
    "Suporte dedicado 24/7",
    "Relatórios customizados",
    "Integração ilimitada",
    "Templates exclusivos",
    "Automação avançada",
    "Consultoria estratégica",
    "SLA garantido"
  ]'::jsonb,
  3
) ON CONFLICT (name) DO NOTHING;

-- Verificar se foram criados
SELECT id, name, display_name, price_monthly, leads_limit, is_active
FROM subscription_plans 
ORDER BY sort_order;



