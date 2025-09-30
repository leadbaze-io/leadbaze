-- Script para verificar se a lista de teste foi criada corretamente

-- Verificar se a lista existe
SELECT 
    id,
    name,
    description,
    total_leads,
    status,
    created_at
FROM public.lead_lists 
WHERE name = 'Teste Disparo';

-- Verificar os leads na lista (formato JSONB)
SELECT 
    name,
    leads,
    jsonb_array_length(leads) as total_leads_count
FROM public.lead_lists 
WHERE name = 'Teste Disparo';

-- Extrair informações dos leads individuais
SELECT 
    name as lista_name,
    jsonb_array_elements(leads) as lead_data
FROM public.lead_lists 
WHERE name = 'Teste Disparo';





























