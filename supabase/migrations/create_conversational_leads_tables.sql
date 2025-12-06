-- ============================================
-- LEADBAZE - CONVERSATIONAL FORM DATA PERSISTENCE
-- Versão 2.0 - Ajustada para padrões do banco existente
-- ============================================

-- 1. Tabela para armazenar leads do formulário conversacional
CREATE TABLE IF NOT EXISTS public.conversational_leads (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    
    -- Dados pessoais
    name character varying NOT NULL,
    phone character varying,
    email character varying NOT NULL,
    
    -- Dados da empresa
    company character varying,
    segment character varying,
    team_size character varying,
    position character varying,
    
    -- Dados de qualificação
    challenge character varying,
    desired_volume character varying,
    
    -- Metadados
    status character varying DEFAULT 'form_completed'::character varying 
        CHECK (status::text = ANY (ARRAY[
            'form_completed'::character varying,
            'calendly_opened'::character varying,
            'demo_scheduled'::character varying,
            'demo_completed'::character varying,
            'converted'::character varying,
            'lost'::character varying
        ]::text[])),
    
    source character varying DEFAULT 'conversational_form'::character varying,
    utm_source character varying,
    utm_medium character varying,
    utm_campaign character varying,
    
    -- Relacionamento com usuário (se estiver logado)
    user_id uuid,
    
    -- Timestamps
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    
    -- Relacionamento com agendamento
    demo_appointment_id uuid,
    
    -- Constraints
    CONSTRAINT conversational_leads_pkey PRIMARY KEY (id),
    CONSTRAINT conversational_leads_user_id_fkey FOREIGN KEY (user_id) 
        REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 2. Tabela para armazenar agendamentos de demonstração
CREATE TABLE IF NOT EXISTS public.demo_appointments (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    
    -- Dados do Calendly
    calendly_event_id character varying UNIQUE,
    calendly_invitee_id character varying,
    calendly_event_uri text,
    
    -- Dados do agendamento
    scheduled_at timestamp with time zone NOT NULL,
    duration_minutes integer DEFAULT 30,
    timezone character varying,
    
    -- Dados do participante
    attendee_name character varying NOT NULL,
    attendee_email character varying NOT NULL,
    attendee_phone character varying,
    
    -- Informações adicionais do Calendly
    location text,
    join_url text,
    cancel_url text,
    reschedule_url text,
    
    -- Status do agendamento
    status character varying DEFAULT 'scheduled'::character varying
        CHECK (status::text = ANY (ARRAY[
            'scheduled'::character varying,
            'confirmed'::character varying,
            'completed'::character varying,
            'cancelled'::character varying,
            'no_show'::character varying,
            'rescheduled'::character varying
        ]::text[])),
    
    -- Notas e observações
    notes text,
    internal_notes text,
    
    -- Relacionamento com usuário (se existir)
    user_id uuid,
    
    -- Timestamps
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    cancelled_at timestamp with time zone,
    
    -- Relacionamento com lead
    conversational_lead_id uuid,
    
    -- Constraints
    CONSTRAINT demo_appointments_pkey PRIMARY KEY (id),
    CONSTRAINT demo_appointments_user_id_fkey FOREIGN KEY (user_id) 
        REFERENCES auth.users(id) ON DELETE SET NULL,
    CONSTRAINT demo_appointments_conversational_lead_id_fkey FOREIGN KEY (conversational_lead_id) 
        REFERENCES public.conversational_leads(id) ON DELETE SET NULL
);

-- 3. Adicionar FK reversa (após criar ambas as tabelas)
ALTER TABLE public.conversational_leads
    ADD CONSTRAINT conversational_leads_demo_appointment_id_fkey 
    FOREIGN KEY (demo_appointment_id) 
    REFERENCES public.demo_appointments(id) ON DELETE SET NULL;

-- 4. Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_conversational_leads_email 
    ON public.conversational_leads(email);
    
CREATE INDEX IF NOT EXISTS idx_conversational_leads_status 
    ON public.conversational_leads(status);
    
CREATE INDEX IF NOT EXISTS idx_conversational_leads_created_at 
    ON public.conversational_leads(created_at DESC);
    
CREATE INDEX IF NOT EXISTS idx_conversational_leads_company 
    ON public.conversational_leads(company);
    
CREATE INDEX IF NOT EXISTS idx_conversational_leads_user_id 
    ON public.conversational_leads(user_id);

CREATE INDEX IF NOT EXISTS idx_demo_appointments_calendly_event_id 
    ON public.demo_appointments(calendly_event_id);
    
CREATE INDEX IF NOT EXISTS idx_demo_appointments_email 
    ON public.demo_appointments(attendee_email);
    
CREATE INDEX IF NOT EXISTS idx_demo_appointments_scheduled_at 
    ON public.demo_appointments(scheduled_at DESC);
    
CREATE INDEX IF NOT EXISTS idx_demo_appointments_status 
    ON public.demo_appointments(status);
    
CREATE INDEX IF NOT EXISTS idx_demo_appointments_user_id 
    ON public.demo_appointments(user_id);

-- 5. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Triggers para atualizar updated_at
DROP TRIGGER IF EXISTS update_conversational_leads_updated_at ON public.conversational_leads;
CREATE TRIGGER update_conversational_leads_updated_at
    BEFORE UPDATE ON public.conversational_leads
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_demo_appointments_updated_at ON public.demo_appointments;
CREATE TRIGGER update_demo_appointments_updated_at
    BEFORE UPDATE ON public.demo_appointments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Row Level Security (RLS) Policies
ALTER TABLE public.conversational_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_appointments ENABLE ROW LEVEL SECURITY;

-- Políticas para conversational_leads

-- Permitir inserção pública (formulário conversacional)
DROP POLICY IF EXISTS "Allow public insert conversational_leads" ON public.conversational_leads;
CREATE POLICY "Allow public insert conversational_leads"
    ON public.conversational_leads
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Permitir leitura autenticada
DROP POLICY IF EXISTS "Allow authenticated read conversational_leads" ON public.conversational_leads;
CREATE POLICY "Allow authenticated read conversational_leads"
    ON public.conversational_leads
    FOR SELECT
    TO authenticated
    USING (true);

-- Permitir atualização autenticada
DROP POLICY IF EXISTS "Allow authenticated update conversational_leads" ON public.conversational_leads;
CREATE POLICY "Allow authenticated update conversational_leads"
    ON public.conversational_leads
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Políticas para demo_appointments

-- Permitir inserção pública (webhook do Calendly)
DROP POLICY IF EXISTS "Allow public insert demo_appointments" ON public.demo_appointments;
CREATE POLICY "Allow public insert demo_appointments"
    ON public.demo_appointments
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Permitir atualização pública (webhook do Calendly)
DROP POLICY IF EXISTS "Allow public update demo_appointments" ON public.demo_appointments;
CREATE POLICY "Allow public update demo_appointments"
    ON public.demo_appointments
    FOR UPDATE
    TO anon
    USING (true)
    WITH CHECK (true);

-- Permitir leitura autenticada
DROP POLICY IF EXISTS "Allow authenticated read demo_appointments" ON public.demo_appointments;
CREATE POLICY "Allow authenticated read demo_appointments"
    ON public.demo_appointments
    FOR SELECT
    TO authenticated
    USING (true);

-- Permitir atualização autenticada
DROP POLICY IF EXISTS "Allow authenticated update demo_appointments" ON public.demo_appointments;
CREATE POLICY "Allow authenticated update demo_appointments"
    ON public.demo_appointments
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 8. Comentários nas tabelas
COMMENT ON TABLE public.conversational_leads IS 
    'Armazena leads capturados através do formulário conversacional da página de agendamento';
    
COMMENT ON TABLE public.demo_appointments IS 
    'Armazena agendamentos de demonstração via Calendly';

COMMENT ON COLUMN public.conversational_leads.status IS 
    'Status do lead: form_completed, calendly_opened, demo_scheduled, demo_completed, converted, lost';
    
COMMENT ON COLUMN public.demo_appointments.status IS 
    'Status do agendamento: scheduled, confirmed, completed, cancelled, no_show, rescheduled';

-- ============================================
-- FIM DO SCRIPT - VERSÃO OTIMIZADA
-- ============================================

-- VERIFICAÇÃO PÓS-EXECUÇÃO:
-- Execute estas queries para confirmar que tudo foi criado corretamente:

-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('conversational_leads', 'demo_appointments');

-- SELECT * FROM pg_policies 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('conversational_leads', 'demo_appointments');
