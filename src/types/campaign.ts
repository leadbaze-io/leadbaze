/**
 * =====================================================
 * TIPOS PARA SISTEMA DE CAMPANHAS
 * =====================================================
 */

export interface Campaign {
  id: string
  user_id: string
  name: string
  message: string
  status: 'draft' | 'active' | 'completed' | 'paused' | 'scheduled' | 'sending' | 'failed'

  // Contadores
  total_leads: number
  unique_leads: number
  duplicates_count: number
  selected_lists_count: number
  ignored_lists_count: number
  success_count: number
  failed_count: number

  // Timestamps
  created_at: string
  updated_at: string
  scheduled_at?: string
  sent_at?: string
  completed_at?: string
}

export interface CampaignLead {
  id: string
  listId: string
  name: string
  phone: string
  email?: string
  company?: string
  position?: string
  phoneHash: string
}

export interface Lead {
  id?: string
  name: string
  address: string
  phone?: string
  email?: string
  company?: string
  position?: string
  rating?: number
  website?: string
  business_type?: string
  google_maps_url?: string
  place_id?: string
  reviews_count?: number
  price_level?: number
  opening_hours?: string[]
  photos?: string[]
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

export interface CampaignStats {
  totalLeads: number
  uniqueLeads: number
  selectedLists: number
  ignoredLists: number
  duplicates: number
  duplicatePercentage: number
}

export interface CampaignListState {
  selected: string[]
  ignored: string[]
  available: string[]
}

export interface LeadDeduplicationResult {
  originalLeads: Lead[]
  uniqueLeads: CampaignLead[]
  stats: {
    original: number
    unique: number
    duplicates: number
    percentage: number
  }
}

export interface CampaignOperationResult {
  success: boolean
  message: string
  data?: any
  error?: string
}

export interface CampaignWizardStep {
  id: number
  title: string
  description: string
  completed: boolean
  disabled: boolean
}

export interface CampaignFormData {
  name: string
  message: string
  selectedLists: string[]
  ignoredLists: string[]
}

export interface CampaignProgress {
  currentStep: number
  totalSteps: number
  completedSteps: number
  progress: number
}

export interface CampaignValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface CampaignExportOptions {
  format: 'csv' | 'xlsx' | 'json'
  includeDuplicates: boolean
  includeMetadata: boolean
}

export interface CampaignImportResult {
  success: boolean
  imported: number
  skipped: number
  errors: string[]
}

export interface EvolutionAPIConfig {
  baseUrl: string
  apiKey: string
  instanceName: string
}
