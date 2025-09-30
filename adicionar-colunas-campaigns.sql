-- =====================================================
-- ADICIONAR COLUNAS FALTANTES NA TABELA CAMPAIGNS
-- =====================================================

-- Adicionar colunas necessárias para o sistema de campanhas
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS success_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS failed_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Verificar se as colunas foram adicionadas
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'campaigns'
AND column_name IN ('success_count', 'failed_count', 'sent_at', 'completed_at', 'total_leads')
ORDER BY column_name;

-- Atualizar campanhas existentes com valores padrão
UPDATE campaigns 
SET 
    success_count = 0,
    failed_count = 0
WHERE success_count IS NULL OR failed_count IS NULL;

-- Verificar dados atualizados
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
LIMIT 5;


















