/**
 * =====================================================
 * SERVIÇO DE DEDUPLICAÇÃO DE LEADS
 * =====================================================
 */

import type { Lead, CampaignLead } from '../types/campaign'

export class LeadDeduplicationService {
  /**
   * Normalizar número de telefone
   */
  static normalizePhone(phone: string | undefined): string {
    if (!phone || typeof phone !== 'string') {
      return ''
    }

    // Remove todos os caracteres não numéricos
    const cleaned = phone.replace(/\D/g, '')

    // Se estiver vazio após limpeza, retorna vazio
    if (!cleaned) {
      return ''
    }

    // Se começar com 55 (Brasil) e tiver 12+ dígitos, remove o 55
    if (cleaned.startsWith('55') && cleaned.length >= 12) {
      return cleaned.substring(2)
    }

    // Se começar com 0 e tiver 11+ dígitos, remove o 0
    if (cleaned.startsWith('0') && cleaned.length >= 11) {
      return cleaned.substring(1)
    }

    return cleaned
  }

  /**
   * Gerar hash do telefone normalizado
   */
  static generatePhoneHash(phone: string): string {
    const normalized = this.normalizePhone(phone)
    if (!normalized) return ''

    // Usar hash simples para performance
    let hash = 0
    for (let i = 0; i < normalized.length; i++) {
      const char = normalized.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36)
  }

  /**
   * Converter Lead para CampaignLead
   */
  static convertToCampaignLead(lead: Lead, listId: string): CampaignLead {
    const phoneHash = this.generatePhoneHash(lead.phone || '')

    return {
      id: `${listId}-${lead.phone || 'unknown'}`,
      listId,
      name: lead.name || '',
      phone: lead.phone || '',
      email: lead.email || '',
      company: lead.company || '',
      position: lead.position || '',
      phoneHash
    }
  }

  /**
   * Deduplicar leads por telefone normalizado
   */
  static deduplicateLeads(leads: Lead[], listId: string): CampaignLead[] {
    const phoneMap = new Map<string, CampaignLead>()
    const uniqueLeads: CampaignLead[] = []

    for (const lead of leads) {
      const normalizedPhone = this.normalizePhone(lead.phone)

      // Pular leads sem telefone válido
      if (!normalizedPhone) {
        continue
      }

      const phoneHash = this.generatePhoneHash(lead.phone || '')

      // Se já existe um lead com este telefone, pular
      if (phoneMap.has(phoneHash)) {
        continue
      }

      // Converter e adicionar lead único
      const campaignLead = this.convertToCampaignLead(lead, listId)
      phoneMap.set(phoneHash, campaignLead)
      uniqueLeads.push(campaignLead)
    }

    return uniqueLeads
  }

  /**
   * Deduplicar leads com contagem de duplicados
   */
  static deduplicateLeadsWithCount(leads: Lead[], listId: string): { uniqueLeads: CampaignLead[], duplicatesCount: number } {
    const phoneMap = new Map<string, CampaignLead>()
    const uniqueLeads: CampaignLead[] = []
    let duplicatesCount = 0

    for (const lead of leads) {
      const normalizedPhone = this.normalizePhone(lead.phone)

      // Pular leads sem telefone válido
      if (!normalizedPhone) {
        continue
      }

      const phoneHash = this.generatePhoneHash(lead.phone || '')

      // Se já existe um lead com este telefone, contar como duplicado
      if (phoneMap.has(phoneHash)) {
        duplicatesCount++
        continue
      }

      // Converter e adicionar lead único
      const campaignLead = this.convertToCampaignLead(lead, listId)
      phoneMap.set(phoneHash, campaignLead)
      uniqueLeads.push(campaignLead)
    }

    return { uniqueLeads, duplicatesCount }
  }

  /**
   * Deduplicar leads de múltiplas listas
   */
  static deduplicateMultipleLists(listLeads: { listId: string, leads: Lead[] }[]): CampaignLead[] {
    const globalPhoneMap = new Map<string, CampaignLead>()
    const allUniqueLeads: CampaignLead[] = []

    for (const { listId, leads } of listLeads) {
      const uniqueLeads = this.deduplicateLeads(leads, listId)

      for (const lead of uniqueLeads) {
        // Se já existe um lead com este telefone, pular
        if (globalPhoneMap.has(lead.phoneHash)) {
          continue
        }

        globalPhoneMap.set(lead.phoneHash, lead)
        allUniqueLeads.push(lead)
      }
    }

    return allUniqueLeads
  }

  /**
   * Adicionar novos leads mantendo deduplicação
   */
  static addLeadsWithDeduplication(
    existingLeads: CampaignLead[],

    newLeads: CampaignLead[]
  ): CampaignLead[] {
    const phoneMap = new Map<string, CampaignLead>()

    // Mapear leads existentes
    for (const lead of existingLeads) {
      phoneMap.set(lead.phoneHash, lead)
    }

    // Adicionar novos leads únicos
    const updatedLeads = [...existingLeads]

    for (const newLead of newLeads) {
      if (!phoneMap.has(newLead.phoneHash)) {
        phoneMap.set(newLead.phoneHash, newLead)
        updatedLeads.push(newLead)
      }
    }

    return updatedLeads
  }

  /**
   * Remover leads por lista
   */
  static removeLeadsByList(leads: CampaignLead[], listId: string): CampaignLead[] {
    return leads.filter(lead => lead.listId !== listId)
  }

  /**
   * Remover lead específico
   */
  static removeLead(leads: CampaignLead[], leadId: string): CampaignLead[] {
    return leads.filter(lead => lead.id !== leadId)
  }

  /**
   * Estatísticas de deduplicação
   */
  static getDeduplicationStats(originalLeads: Lead[], uniqueLeads: CampaignLead[]): {
    original: number
    unique: number
    duplicates: number
    percentage: number
  } {
    const original = originalLeads.length
    const unique = uniqueLeads.length
    const duplicates = original - unique
    const percentage = original > 0 ? Math.round((duplicates / original) * 100) : 0

    return {
      original,
      unique,
      duplicates,
      percentage
    }
  }
}
