-- ============================================
-- FIX RLS POLICY FOR CONVERSATIONAL LEADS
-- Permite que usuários autenticados também possam inserir leads
-- ============================================

-- Problema: A política atual só permite usuários anônimos (anon)
-- Solução: Adicionar política para usuários autenticados (authenticated)

-- Adicionar política para usuários autenticados
DROP POLICY IF EXISTS "Allow authenticated insert conversational_leads" ON public.conversational_leads;
CREATE POLICY "Allow authenticated insert conversational_leads"
    ON public.conversational_leads
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Verificar políticas ativas
-- SELECT * FROM pg_policies 
-- WHERE schemaname = 'public' 
-- AND tablename = 'conversational_leads';
