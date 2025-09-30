-- =====================================================
-- TESTE DA FUNÇÃO check_leads_availability_simple
-- =====================================================

-- Testar com 50 leads (mais que os 29 disponíveis)
SELECT 
    'Teste 50 leads:' as status,
    check_leads_availability_simple('084b6a9c-49d4-420d-9315-3c01d9620c9d', 50) as resultado;

-- Testar com 10 leads (menos que os 29 disponíveis)
SELECT 
    'Teste 10 leads:' as status,
    check_leads_availability_simple('084b6a9c-49d4-420d-9315-3c01d9620c9d', 10) as resultado;

-- Testar com exatamente 29 leads (igual aos disponíveis)
SELECT 
    'Teste 29 leads:' as status,
    check_leads_availability_simple('084b6a9c-49d4-420d-9315-3c01d9620c9d', 29) as resultado;










