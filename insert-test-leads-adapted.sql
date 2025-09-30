-- Script para inserir dados de teste na estrutura atual do Supabase
-- Adaptado para a estrutura existente com leads como JSONB

DO $$
DECLARE
    _user_id uuid := (SELECT id FROM auth.users WHERE email = 'creaty12345@gmail.com' LIMIT 1);
    _list_id uuid;
BEGIN
    -- Verificar se o usuário existe
    IF _user_id IS NULL THEN
        RAISE NOTICE 'Usuário creaty12345@gmail.com não encontrado. Por favor, crie o usuário ou ajuste o script.';
        RETURN;
    END IF;

    -- Inserir a lista de leads se ela não existir
    INSERT INTO public.lead_lists (
        user_id, 
        name, 
        description, 
        leads, 
        total_leads, 
        status
    )
    VALUES (
        _user_id, 
        'Teste Disparo', 
        'Lista para testar o Disparador',
        '[
            {
                "name": "Jean Lopes",
                "phone": "31983323121",
                "email": "jean.lopes@email.com",
                "company": "",
                "position": ""
            },
            {
                "name": "Matheus Moura", 
                "phone": "3199766846",
                "email": "matheus.moura@email.com",
                "company": "",
                "position": ""
            }
        ]'::jsonb,
        2,
        'active'
    )
    ON CONFLICT (user_id, name) DO UPDATE SET 
        description = EXCLUDED.description,
        leads = EXCLUDED.leads,
        total_leads = EXCLUDED.total_leads,
        status = EXCLUDED.status,
        updated_at = now();

    -- Obter o ID da lista
    SELECT id INTO _list_id
    FROM public.lead_lists
    WHERE user_id = _user_id AND name = 'Teste Disparo';

    RAISE NOTICE 'Lista "Teste Disparo" criada/atualizada com sucesso!';
    RAISE NOTICE 'ID da lista: %', _list_id;
    RAISE NOTICE 'Leads inseridos: Jean Lopes (31983323121) e Matheus Moura (3199766846)';

END $$;





























