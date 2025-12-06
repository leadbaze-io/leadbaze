import { supabase } from '../lib/supabaseClient'

export interface ConversationalLeadData {
    name: string
    phone?: string
    email: string
    company?: string
    segment?: string
    team_size?: string
    position?: string
    challenge?: string
    desired_volume?: string
    utm_source?: string
    utm_medium?: string
    utm_campaign?: string
}

export interface DemoAppointmentData {
    calendly_event_id: string
    calendly_invitee_id?: string
    calendly_event_uri?: string
    scheduled_at: string
    duration_minutes?: number
    timezone?: string
    attendee_name: string
    attendee_email: string
    attendee_phone?: string
    location?: string
    join_url?: string
    cancel_url?: string
    reschedule_url?: string
    notes?: string
    conversational_lead_id?: string
}

/**
 * Salva um lead do formulário conversacional no Supabase
 */
export async function saveConversationalLead(data: ConversationalLeadData) {
    try {
        const { data: lead, error } = await supabase
            .from('conversational_leads')
            .insert([{
                name: data.name,
                phone: data.phone,
                email: data.email,
                company: data.company,
                segment: data.segment,
                team_size: data.team_size,
                position: data.position,
                challenge: data.challenge,
                desired_volume: data.desired_volume,
                status: 'form_completed',
                source: 'conversational_form',
                utm_source: data.utm_source,
                utm_medium: data.utm_medium,
                utm_campaign: data.utm_campaign
            }])
            .select()
            .single()

        if (error) {
            console.error('Erro ao salvar lead:', error)
            throw error
        }

        console.log('Lead salvo com sucesso:', lead)
        return lead
    } catch (error) {
        console.error('Erro ao salvar lead no Supabase:', error)
        throw error
    }
}

/**
 * Atualiza o status de um lead
 */
export async function updateLeadStatus(leadId: string, status: string) {
    try {
        const { data, error } = await supabase
            .from('conversational_leads')
            .update({ status })
            .eq('id', leadId)
            .select()
            .single()

        if (error) throw error
        return data
    } catch (error) {
        console.error('Erro ao atualizar status do lead:', error)
        throw error
    }
}

/**
 * Busca um lead por email
 */
export async function findLeadByEmail(email: string) {
    try {
        const { data, error } = await supabase
            .from('conversational_leads')
            .select('*')
            .eq('email', email)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            throw error
        }

        return data
    } catch (error) {
        console.error('Erro ao buscar lead:', error)
        return null
    }
}

/**
 * Salva um agendamento de demonstração
 */
export async function saveDemoAppointment(data: DemoAppointmentData) {
    try {
        const { data: appointment, error } = await supabase
            .from('demo_appointments')
            .insert([{
                calendly_event_id: data.calendly_event_id,
                calendly_invitee_id: data.calendly_invitee_id,
                calendly_event_uri: data.calendly_event_uri,
                scheduled_at: data.scheduled_at,
                duration_minutes: data.duration_minutes || 30,
                timezone: data.timezone,
                attendee_name: data.attendee_name,
                attendee_email: data.attendee_email,
                attendee_phone: data.attendee_phone,
                location: data.location,
                join_url: data.join_url,
                cancel_url: data.cancel_url,
                reschedule_url: data.reschedule_url,
                notes: data.notes,
                status: 'scheduled',
                conversational_lead_id: data.conversational_lead_id
            }])
            .select()
            .single()

        if (error) {
            console.error('Erro ao salvar agendamento:', error)
            throw error
        }

        console.log('Agendamento salvo com sucesso:', appointment)
        return appointment
    } catch (error) {
        console.error('Erro ao salvar agendamento no Supabase:', error)
        throw error
    }
}

/**
 * Atualiza o status de um agendamento
 */
export async function updateAppointmentStatus(
    calendlyEventId: string,
    status: string,
    cancelledAt?: string
) {
    try {
        const updateData: any = { status }
        if (cancelledAt) {
            updateData.cancelled_at = cancelledAt
        }

        const { data, error } = await supabase
            .from('demo_appointments')
            .update(updateData)
            .eq('calendly_event_id', calendlyEventId)
            .select()
            .single()

        if (error) throw error
        return data
    } catch (error) {
        console.error('Erro ao atualizar status do agendamento:', error)
        throw error
    }
}

/**
 * Vincula um agendamento a um lead
 */
export async function linkAppointmentToLead(appointmentId: string, leadId: string) {
    try {
        // Atualiza o agendamento com o lead_id
        const { error: appointmentError } = await supabase
            .from('demo_appointments')
            .update({ conversational_lead_id: leadId })
            .eq('id', appointmentId)

        if (appointmentError) throw appointmentError

        // Atualiza o lead com o appointment_id e status
        const { error: leadError } = await supabase
            .from('conversational_leads')
            .update({
                demo_appointment_id: appointmentId,
                status: 'demo_scheduled'
            })
            .eq('id', leadId)

        if (leadError) throw leadError

        console.log('Agendamento vinculado ao lead com sucesso')
    } catch (error) {
        console.error('Erro ao vincular agendamento ao lead:', error)
        throw error
    }
}
