-- Script básico para inserir dados de teste
-- Versão mais simples sem verificações complexas

-- Primeiro, vamos verificar se o usuário existe
SELECT id, email FROM auth.users WHERE email = 'creaty12345@gmail.com';

-- Se o usuário existir, execute o INSERT abaixo
-- (Substitua 'SEU_USER_ID_AQUI' pelo ID retornado acima)

INSERT INTO public.lead_lists (
    user_id, 
    name, 
    description, 
    leads, 
    total_leads, 
    status
)
VALUES (
    'SEU_USER_ID_AQUI', -- Substitua pelo ID real do usuário
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





























