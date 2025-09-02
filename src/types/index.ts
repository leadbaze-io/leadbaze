// Tipos principais da aplicação

export interface User {
  id: string
  email?: string
  user_metadata?: {
    name?: string
    [key: string]: any
  }
  [key: string]: any
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
  selected_lists: string[] // IDs das listas selecionadas
  total_leads: number
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed'
  scheduled_at?: string
  sent_at?: string
  completed_at?: string
  success_count: number
  failed_count: number
  created_at: string
  updated_at: string
}

export interface EvolutionAPIConfig {
  id: string
  user_id: string
  api_url: string
  api_key: string
  instance_name: string
  whatsapp_number: string
  status: 'active' | 'inactive' | 'error'
  last_test_at?: string
  error_message?: string
  created_at: string
  updated_at: string
}