// Backend API endpoint para receber webhooks do Calendly
// Arquivo: backend/routes/calendly-webhook.js (ou .ts se usar TypeScript)

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Inicializar Supabase
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key no backend
);

/**
 * Endpoint para receber webhooks do Calendly
 * POST /api/calendly/webhook
 * 
 * Configurar no Calendly:
 * 1. Acesse: https://calendly.com/integrations/webhooks
 * 2. Adicione webhook URL: https://seu-dominio.com/api/calendly/webhook
 * 3. Selecione eventos: invitee.created, invitee.canceled
 */
router.post('/webhook', async (req, res) => {
    try {
        const { event, payload } = req.body;

        console.log('Webhook recebido do Calendly:', event);

        // Evento: Agendamento criado
        if (event === 'invitee.created') {
            const {
                uri,
                name,
                email,
                text_reminder_number,
                timezone,
                event: eventDetails,
                questions_and_answers
            } = payload;

            // Extrair informações do evento
            const eventUri = eventDetails?.uri || '';
            const eventId = eventUri.split('/').pop() || '';
            const scheduledAt = eventDetails?.start_time;
            const location = eventDetails?.location?.join_url || eventDetails?.location?.location || '';

            // Buscar lead por email
            const { data: lead } = await supabase
                .from('conversational_leads')
                .select('*')
                .eq('email', email)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            // Extrair respostas customizadas (empresa, segmento, etc.)
            let notes = '';
            if (questions_and_answers && questions_and_answers.length > 0) {
                notes = questions_and_answers
                    .map(qa => `${qa.question}: ${qa.answer}`)
                    .join('\n');
            }

            // Salvar agendamento
            const { data: appointment, error: appointmentError } = await supabase
                .from('demo_appointments')
                .insert([{
                    calendly_event_id: eventId,
                    calendly_invitee_id: uri.split('/').pop(),
                    calendly_event_uri: eventUri,
                    scheduled_at: scheduledAt,
                    duration_minutes: 30,
                    timezone: timezone,
                    attendee_name: name,
                    attendee_email: email,
                    attendee_phone: text_reminder_number,
                    location: location,
                    join_url: location,
                    cancel_url: payload.cancel_url,
                    reschedule_url: payload.reschedule_url,
                    notes: notes,
                    status: 'scheduled',
                    conversational_lead_id: lead?.id || null
                }])
                .select()
                .single();

            if (appointmentError) {
                console.error('Erro ao salvar agendamento:', appointmentError);
                throw appointmentError;
            }

            // Se encontrou o lead, vincular e atualizar status
            if (lead && appointment) {
                await supabase
                    .from('conversational_leads')
                    .update({
                        demo_appointment_id: appointment.id,
                        status: 'demo_scheduled'
                    })
                    .eq('id', lead.id);

                console.log('Lead atualizado com agendamento:', lead.id);
            }

            console.log('Agendamento salvo:', appointment);

            // TODO: Enviar email de confirmação
            // TODO: Enviar mensagem WhatsApp
            // TODO: Notificar equipe de vendas
        }

        // Evento: Agendamento cancelado
        if (event === 'invitee.canceled') {
            const { uri, cancellation } = payload;
            const eventId = uri.split('/').pop();

            // Atualizar status do agendamento
            const { data, error } = await supabase
                .from('demo_appointments')
                .update({
                    status: 'cancelled',
                    cancelled_at: cancellation?.canceled_at || new Date().toISOString()
                })
                .eq('calendly_invitee_id', eventId)
                .select()
                .single();

            if (error) {
                console.error('Erro ao cancelar agendamento:', error);
                throw error;
            }

            // Atualizar status do lead
            if (data?.conversational_lead_id) {
                await supabase
                    .from('conversational_leads')
                    .update({ status: 'calendly_opened' })
                    .eq('id', data.conversational_lead_id);
            }

            console.log('Agendamento cancelado:', data);

            // TODO: Enviar email de cancelamento
            // TODO: Notificar equipe de vendas
        }

        res.status(200).json({ received: true, event });
    } catch (error) {
        console.error('Erro ao processar webhook do Calendly:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Endpoint de teste para verificar se o webhook está funcionando
 * GET /api/calendly/webhook/test
 */
router.get('/webhook/test', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Webhook endpoint está funcionando',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
