-- Criar campanha no banco de produção
-- ID: bf20ef97-f9e7-4655-bb6a-4021a2d1adbe

INSERT INTO campaigns (
    id,
    user_id,
    name,
    status,
    total_leads,
    success_count,
    failed_count,
    sent_at,
    completed_at,
    created_at,
    updated_at
) VALUES (
    'bf20ef97-f9e7-4655-bb6a-4021a2d1adbe',
    '00000000-0000-0000-0000-000000000000', -- UUID padrão para teste
    'Deus o Melhor',
    'draft',
    2,
    0,
    0,
    NULL,
    NULL,
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    status = EXCLUDED.status,
    total_leads = EXCLUDED.total_leads,
    success_count = EXCLUDED.success_count,
    failed_count = EXCLUDED.failed_count,
    updated_at = NOW();

-- Verificar se a campanha foi criada
SELECT 
    id,
    name,
    status,
    total_leads,
    success_count,
    failed_count,
    sent_at,
    completed_at,
    created_at,
    updated_at
FROM campaigns 
WHERE id = 'bf20ef97-f9e7-4655-bb6a-4021a2d1adbe';
