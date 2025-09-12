-- Verificar estrutura das tabelas para entender os campos disponíveis

-- 1. Estrutura da tabela lead_lists
SELECT 'Estrutura da tabela lead_lists:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'lead_lists' 
ORDER BY ordinal_position;

-- 2. Estrutura da tabela leads
SELECT 'Estrutura da tabela leads:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'leads' 
ORDER BY ordinal_position;

-- 3. Estrutura da tabela campaigns
SELECT 'Estrutura da tabela campaigns:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'campaigns' 
ORDER BY ordinal_position;

-- 4. Estrutura da tabela campaign_lists
SELECT 'Estrutura da tabela campaign_lists:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'campaign_lists' 
ORDER BY ordinal_position;

-- 5. Estrutura da tabela campaign_unique_leads
SELECT 'Estrutura da tabela campaign_unique_leads:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'campaign_unique_leads' 
ORDER BY ordinal_position;