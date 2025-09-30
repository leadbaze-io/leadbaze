-- =====================================================
-- DESCOBRIR CAMPOS OBRIGATÓRIOS DA TABELA user_profiles
-- =====================================================

-- Consultar campos obrigatórios (NOT NULL) da tabela user_profiles
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Consultar constraints NOT NULL específicos
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    tc.constraint_type
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'user_profiles' 
  AND tc.table_schema = 'public'
  AND tc.constraint_type = 'CHECK'
ORDER BY kcu.ordinal_position;

-- Verificar se há triggers ou regras especiais
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'user_profiles';









