// Tipos principais da aplicação

export interface User {
  id: string
  email?: string
  user_metadata?: {
    name?: string
    [key: string]: unknown
  }
  [key: string]: unknown
}

export interface Lead {
  id?: string
  name: string
  address: string
  phone?: string
  rating?: number
  totalScore?: number // Campo para avaliação de 0 a 5
  website?: string
  business_type?: string
  google_maps_url?: string
  place_id?: string
  reviews_count?: number
  price_level?: number
  opening_hours?: string[]
  photos?: string[]
  selected?: boolean // Para controle de seleção na UI
}

export interface LeadList {
  id: string
  user_id: string
  name: string
  leads: Lead[]
  total_leads: number
  created_at: string
  updated_at?: string
  description?: string
  tags?: string[]
  status?: 'active' | 'archived' | 'processing'
}

export interface LeadGenerationResponse {
  success: boolean
  leads: Lead[]
  total_found: number
  search_url: string
  location?: string
  search_term?: string
  processing_time?: number
  error?: string
  demo_mode?: boolean // Indica se está usando dados de demonstração
}

export interface WhatsAppTemplate {
  id: string
  name: string
  message: string
  variables: string[]
  created_at: string
  user_id: string
}

export interface ContactAttempt {
  id: string
  lead_id: string
  list_id: string
  user_id: string
  method: 'whatsapp' | 'phone' | 'email'
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'replied' | 'failed'
  message?: string
  template_id?: string
  sent_at?: string
  delivered_at?: string
  read_at?: string
  replied_at?: string
  error_message?: string
}

export interface UserPreferences {
  id: string
  user_id: string
  whatsapp_number?: string
  default_message_template?: string
  auto_follow_up?: boolean
  follow_up_delay_hours?: number
  created_at: string
  updated_at: string
}

export interface BulkCampaign {
  id: string
  user_id: string
  name: string
  message: string
  selected_lists_count: number // Contador de listas selecionadas
  ignored_lists_count: number // Contador de listas ignoradas
  total_leads: number
  unique_leads: number
  duplicates_count: number
  status: 'draft' | 'active' | 'scheduled' | 'sending' | 'completed' | 'failed' | 'paused'
  scheduled_at?: string
  sent_at?: string
  completed_at?: string
  success_count: number
  failed_count: number
  created_at: string
  updated_at: string
}

// ==============================================
// NOVOS TIPOS PARA RASTREAMENTO ROBUSTO
// ==============================================

// Lead dentro de uma campanha com rastreamento completo
export interface CampaignLead {
  id: string
  campaign_id: string
  list_id: string
  lead_data: Lead // Dados completos do lead
  lead_hash: string // Hash único para evitar duplicatas
  added_at: string
  
  // Campos adicionais para UI
  list_name?: string
  list_total_leads?: number
  campaign_name?: string
  campaign_status?: string
}

// Resumo de lista utilizada em uma campanha
export interface UsedListSummary {
  list_id: string
  list_name: string
  total_leads: number
  leads_in_campaign: number
  added_at: string
}

// Resposta de operação com leads da campanha
export interface CampaignLeadsOperation {
  success: boolean
  message: string
  added_leads: number
  removed_leads: number
  duplicate_leads: number
  total_campaign_leads: number
  error?: string
}

// ==============================================
// TIPOS PARA EVOLUTION API
// ==============================================

export interface EvolutionAPIConfig {
  id: string
  user_id: string
  api_url: string
  api_key: string
  instance_name: string
  whatsapp_number?: string
  status: 'active' | 'inactive' | 'error'
  created_at: string
  updated_at: string
}

export interface EvolutionAPIResponse {
  success: boolean
  error?: string
  data?: unknown
}

// ==============================================
// TIPOS PARA WEBHOOK N8N
// ==============================================

export interface WebhookPayload {
  instance_name: string
  mensagem: string
  itens: WebhookItem[]
}

export interface WebhookItem {
  nome: string
  telefone: string
  cidade: string
}

export interface WebhookResponse {
  success: boolean
  error?: string
  message?: string
}