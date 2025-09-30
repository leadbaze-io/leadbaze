-- Script simples para inserir dados de teste
-- Sem usar ON CONFLICT (já que não há constraint única)

DO $$
DECLARE
    _user_id uuid := (SELECT id FROM auth.users WHERE email = 'creaty12345@gmail.com' LIMIT 1);
    _list_exists boolean;
BEGIN
    -- Verificar se o usuário existe
    IF _user_id IS NULL THEN
        RAISE NOTICE 'Usuário creaty12345@gmail.com não encontrado. Por favor, crie o usuário ou ajuste o script.';
        RETURN;
    END IF;

    -- Verificar se a lista já existe
    SELECT EXISTS(
        SELECT 1 FROM public.lead_lists 
        WHERE user_id = _user_id AND name = 'Teste Disparo'
    ) INTO _list_exists;

    -- Se a lista não existir, criar
    IF NOT _list_exists THEN
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
        );
        
        RAISE NOTICE 'Lista "Teste Disparo" criada com sucesso!';
        RAISE NOTICE 'Leads inseridos: Jean Lopes (31983323121) e Matheus Moura (3199766846)';
    ELSE
        RAISE NOTICE 'Lista "Teste Disparo" já existe. Atualizando dados...';
        
        -- Atualizar a lista existente
        UPDATE public.lead_lists SET
            description = 'Lista para testar o Disparador',
            leads = '[
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
            total_leads = 2,
            status = 'active',
            updated_at = now()
        WHERE user_id = _user_id AND name = 'Teste Disparo';
        
        RAISE NOTICE 'Lista "Teste Disparo" atualizada com sucesso!';
    END IF;

END $$;





























