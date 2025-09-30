-- Adicionar coluna para contagem de leads duplicados ignorados
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS duplicates_count INTEGER DEFAULT 0;

-- Comentário para documentar a coluna
COMMENT ON COLUMN campaigns.duplicates_count IS 'Número de leads duplicados que foram ignorados durante a deduplicação';


















