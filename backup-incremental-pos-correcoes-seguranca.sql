-- =====================================================
-- BACKUP INCREMENTAL - APÓS CORREÇÕES DE SEGURANÇA
-- =====================================================
-- Este script faz backup das mudanças após corrigir
-- os 11 erros de segurança
-- =====================================================

-- =====================================================
-- BACKUP 1: Status atual das tabelas com RLS
-- =====================================================
CREATE TABLE IF NOT EXISTS backup_rls_status_pos_correcoes AS
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_ativo,
    'POS_CORRECOES_SEGURANCA' as backup_tag,
    NOW() as backup_timestamp
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN (
    'subscription_changes',
    'upgrade_pending', 
    'campaign_leads_backup',
    'user_payment_subscriptions',
    'backup_rls_performance',
    'backup_seguro_antes_rollback'
);

-- =====================================================
-- BACKUP 2: Políticas RLS atuais
-- =====================================================
CREATE TABLE IF NOT EXISTS backup_policies_pos_correcoes AS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check,
    'POS_CORRECOES_SEGURANCA' as backup_tag,
    NOW() as backup_timestamp
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN (
    'subscription_changes',
    'upgrade_pending', 
    'campaign_leads_backup',
    'user_payment_subscriptions',
    'backup_rls_performance',
    'backup_seguro_antes_rollback'
);

-- =====================================================
-- BACKUP 3: Views removidas (registro)
-- =====================================================
CREATE TABLE IF NOT EXISTS backup_views_removidas AS
SELECT 
    'campaign_metrics_summary' as view_name,
    'SECURITY DEFINER' as motivo_remocao,
    'POS_CORRECOES_SEGURANCA' as backup_tag,
    NOW() as backup_timestamp
UNION ALL
SELECT 
    'user_profiles_complete' as view_name,
    'SECURITY DEFINER' as motivo_remocao,
    'POS_CORRECOES_SEGURANCA' as backup_tag,
    NOW() as backup_timestamp
UNION ALL
SELECT 
    'campaign_leads_view' as view_name,
    'SECURITY DEFINER' as motivo_remocao,
    'POS_CORRECOES_SEGURANCA' as backup_tag,
    NOW() as backup_timestamp;

-- =====================================================
-- BACKUP 4: Status geral do sistema
-- =====================================================
CREATE TABLE IF NOT EXISTS backup_status_sistema_pos_correcoes AS
SELECT 
    'BACKUP_POS_CORRECOES_SEGURANCA' as backup_type,
    COUNT(*) as total_tabelas_publicas,
    COUNT(CASE WHEN rowsecurity THEN 1 END) as tabelas_com_rls,
    COUNT(CASE WHEN NOT rowsecurity THEN 1 END) as tabelas_sem_rls,
    NOW() as backup_timestamp
FROM pg_tables 
WHERE schemaname = 'public';

-- =====================================================
-- BACKUP 5: Contagem de políticas por tabela
-- =====================================================
CREATE TABLE IF NOT EXISTS backup_count_policies_pos_correcoes AS
SELECT 
    tablename,
    COUNT(*) as total_policies,
    COUNT(CASE WHEN cmd = 'SELECT' THEN 1 END) as select_policies,
    COUNT(CASE WHEN cmd = 'INSERT' THEN 1 END) as insert_policies,
    COUNT(CASE WHEN cmd = 'UPDATE' THEN 1 END) as update_policies,
    COUNT(CASE WHEN cmd = 'DELETE' THEN 1 END) as delete_policies,
    COUNT(CASE WHEN cmd = 'ALL' THEN 1 END) as all_policies,
    'POS_CORRECOES_SEGURANCA' as backup_tag,
    NOW() as backup_timestamp
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY total_policies DESC;

-- =====================================================
-- VERIFICAÇÃO: Status do backup
-- =====================================================
SELECT 
    'BACKUP INCREMENTAL CONCLUÍDO' as status,
    'Backup pós-correções de segurança realizado' as mensagem,
    'Dados salvos em tabelas backup_*_pos_correcoes' as detalhes;

-- =====================================================
-- RESUMO: O que foi salvo
-- =====================================================
SELECT 
    'RESUMO BACKUP' as categoria,
    'backup_rls_status_pos_correcoes' as tabela_backup,
    'Status RLS das tabelas corrigidas' as descricao
UNION ALL
SELECT 
    'RESUMO BACKUP' as categoria,
    'backup_policies_pos_correcoes' as tabela_backup,
    'Políticas RLS criadas' as descricao
UNION ALL
SELECT 
    'RESUMO BACKUP' as categoria,
    'backup_views_removidas' as tabela_backup,
    'Views removidas por SECURITY DEFINER' as descricao
UNION ALL
SELECT 
    'RESUMO BACKUP' as categoria,
    'backup_status_sistema_pos_correcoes' as tabela_backup,
    'Status geral do sistema' as descricao
UNION ALL
SELECT 
    'RESUMO BACKUP' as categoria,
    'backup_count_policies_pos_correcoes' as tabela_backup,
    'Contagem de políticas por tabela' as descricao;






















