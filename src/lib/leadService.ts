import axios from 'axios'
import { supabase, getCurrentUser } from './supabaseClient'
import type { Lead, LeadList, LeadGenerationResponse } from '../types'
import { generateDemoLeads } from './demoLeads'
import { LeadsControlService } from '../services/leadsControlService'

const N8N_WEBHOOK_URL = 'https://n8n-n8n-start.kof6cn.easypanel.host/webhook/842e7854-35df-4b20-9a6e-994fd934505e'

export class LeadService {
  /**
   * Gera leads a partir de uma URL do Google Maps
   * Agora integrado com o sistema de controle de leads
   */
  static async generateLeads(searchUrl: string, limit: number = 10): Promise<LeadGenerationResponse> {
    try {
      const user = await getCurrentUser()
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      // Validar URL do Google Maps
      if (!this.isValidGoogleMapsUrl(searchUrl)) {
        throw new Error('URL do Google Maps inválida')
      }

      // Verificar se o usuário pode gerar leads
      const availability = await LeadsControlService.checkLeadsAvailability(limit)
      if (!availability.can_generate) {
        throw new Error(availability.message)
      }

      console.log(`🎯 Verificação de leads: ${availability.leads_remaining} disponíveis de ${availability.leads_limit}`)

      const response = await axios.post(
        N8N_WEBHOOK_URL,
        {
          google_maps_url: searchUrl,
          limit,
          user_id: user.id,
          timestamp: new Date().toISOString()
        },
        {
          timeout: 120000, // 2 minutos timeout
          headers: {
            'Content-Type': 'application/json'
            // User-Agent removido - não é permitido pelo navegador
          }
        }
      )

      // Processar resposta do N8N
      const data = response.data
      
      // Log para debug - ajuda a entender o formato da resposta
      console.log('🔍 Resposta completa do N8N:', data)
      console.log('🔍 Tipo da resposta:', typeof data)
      console.log('🔍 Status da resposta:', response.status)
      console.log('🔍 Headers da resposta:', response.headers)
      
      // Verificar se a resposta está vazia ou é uma string vazia
      if (!data || data === "" || data === null) {
        console.error('❌ Resposta vazia do N8N')
        throw new Error('N8N retornou resposta vazia. Verifique se o webhook está configurado corretamente.')
      }
      
      // Parser flexível - tenta extrair leads de diferentes estruturas
      let leads: unknown[] = []
      
      if (Array.isArray(data)) {
        // Caso 1: Resposta é diretamente um array de leads
        leads = data
        console.log('✅ Parser: Array direto detectado')
      } else if (data && Array.isArray(data.leads)) {
        // Caso 2: Resposta tem propriedade 'leads' com array
        leads = data.leads
        console.log('✅ Parser: data.leads detectado')
      } else if (data && Array.isArray(data.data)) {
        // Caso 3: Resposta tem propriedade 'data' com array
        leads = data.data
        console.log('✅ Parser: data.data detectado')
      } else if (data && Array.isArray(data.results)) {
        // Caso 4: Resposta tem propriedade 'results' com array
        leads = data.results
        console.log('✅ Parser: data.results detectado')
      } else if (data && Array.isArray(data.items)) {
        // Caso 5: Resposta tem propriedade 'items' com array
        leads = data.items
        console.log('✅ Parser: data.items detectado')
      } else if (data && Array.isArray(data.businesses)) {
        // Caso 6: Resposta tem propriedade 'businesses' com array
        leads = data.businesses
        console.log('✅ Parser: data.businesses detectado')
      } else if (data && Array.isArray(data.places)) {
        // Caso 7: Resposta tem propriedade 'places' com array
        leads = data.places
        console.log('✅ Parser: data.places detectado')
      } else if (data && typeof data === 'object') {
        // Caso 8: Busca automática por arrays em propriedades do objeto
        const possibleArrays = ['leads', 'data', 'results', 'items', 'businesses', 'places', 'establishments', 'locations']
        for (const prop of possibleArrays) {
          if (Array.isArray(data[prop])) {
            leads = data[prop]
            console.log(`✅ Parser: data.${prop} detectado automaticamente`)
            break
          }
        }
      }
      
      // Validar se encontrou leads
      if (!Array.isArray(leads) || leads.length === 0) {
        console.error('❌ Nenhum lead encontrado na resposta')
        console.error('📄 Estrutura da resposta:', JSON.stringify(data, null, 2))
        throw new Error(`Nenhum lead encontrado. Formato recebido: ${typeof data}. Verifique se o webhook N8N está retornando dados no formato correto ou tente uma URL diferente.`)
      }

      console.log(`✅ ${leads.length} leads encontrados`)

      // Normalizar dados dos leads vindos do N8N
      const normalizedLeads: Lead[] = leads.map((lead, index: number) => {
        const leadData = lead as Record<string, unknown>
        return {
          id: (leadData.id as string) || `temp_${Date.now()}_${index}`,
          name: (leadData.title as string) || (leadData.name as string) || 'Nome não disponível',
          address: (leadData.city as string) || (leadData.address as string) || 'Cidade não disponível',
          phone: LeadService.formatPhoneFromN8N((leadData.phoneUnformatted as string) || (leadData.phone as string)),
          rating: this.normalizeRating((leadData.totalScore as number) || (leadData.rating as number)),
          totalScore: (leadData.totalScore as number) || (leadData.rating as number) || 0,
          website: (leadData.website as string) || (leadData.url as string),
          business_type: (leadData.business_type as string) || (leadData.category as string) || 'Estabelecimento',
          google_maps_url: (leadData.google_maps_url as string) || (leadData.url as string),
          place_id: (leadData.place_id as string) || (leadData.placeId as string),
          reviews_count: (leadData.reviewsCount as number) || (leadData.reviews_count as number) || (leadData.review_count as number),
          price_level: (leadData.price_level as number) || (leadData.priceLevel as number),
          opening_hours: Array.isArray(leadData.opening_hours) ? (leadData.opening_hours as string[]) : 
                         Array.isArray(leadData.openingHours) ? (leadData.openingHours as string[]) : 
                         Array.isArray(leadData.hours) ? (leadData.hours as string[]) : [],
          photos: (leadData.photos as string[]) || (leadData.images as string[]) || [],
          selected: false
        }
      })

      console.log(`✅ ${normalizedLeads.length} leads normalizados com sucesso`)

      // Consumir leads do saldo do usuário após sucesso da geração
      const actualLeadsGenerated = normalizedLeads.length
      const consumeResult = await LeadsControlService.consumeLeads(
        actualLeadsGenerated, 
        `lead_generation_from_maps: ${searchUrl}`
      )

      if (!consumeResult.success) {
        console.warn('⚠️ Leads gerados mas não foram consumidos do saldo:', consumeResult.message)
        // Ainda retorna os leads, mas com aviso
      } else {
        console.log(`✅ ${actualLeadsGenerated} leads consumidos do saldo. Restantes: ${consumeResult.leads_remaining}`)
      }

      return {
        success: true,
        leads: normalizedLeads,
        total_found: normalizedLeads.length,
        search_url: searchUrl,
        location: data?.location || 'Localização detectada',
        search_term: data?.search_term || 'Busca realizada',
        processing_time: data?.processing_time || 2.0,
        leads_consumed: actualLeadsGenerated,
        leads_remaining: consumeResult.leads_remaining || 0,
        consumption_success: consumeResult.success
      }

    } catch (error: unknown) {
      console.error('❌ Erro ao conectar com N8N:', error)
      
      // Se houver erro de conectividade, usar dados demo
      const errorMessage = error instanceof Error ? error.message : String(error)
      const errorCode = (error as { code?: string })?.code
      const errorResponse = (error as { response?: { status?: number } })?.response
      
      if (errorCode === 'ERR_NETWORK' || 
          errorMessage.includes('Network Error') || 
          errorMessage.includes('CORS') || 
          errorCode === 'ERR_CORS' ||
          errorCode === 'ECONNABORTED' ||
          errorResponse?.status === 404 ||
          errorMessage.includes('resposta vazia') ||
          errorMessage.includes('N8N não está respondendo')) {
        
        console.log('🎭 N8N indisponível, usando dados de demonstração')
        
        // Retornar dados demo em vez de erro
        const demoResult = generateDemoLeads(searchUrl, limit)
        
        // Consumir leads mesmo em modo demo
        const actualLeadsGenerated = demoResult.leads.length
        const consumeResult = await LeadsControlService.consumeLeads(
          actualLeadsGenerated, 
          `lead_generation_from_maps_demo: ${searchUrl}`
        )

        if (!consumeResult.success) {
          console.warn('⚠️ Leads demo gerados mas não foram consumidos do saldo:', consumeResult.message)
        } else {
          console.log(`✅ ${actualLeadsGenerated} leads demo consumidos do saldo. Restantes: ${consumeResult.leads_remaining}`)
        }
        
        // Adicionar uma nota sobre ser dados demo
        return {
          ...demoResult,
          demo_mode: true,
          error: 'Conectado com dados de demonstração. Configure o N8N para dados reais.',
          leads_consumed: actualLeadsGenerated,
          leads_remaining: consumeResult.leads_remaining || 0,
          consumption_success: consumeResult.success
        }
      }
      
      // Para outros erros, retornar erro específico
      let finalErrorMessage = 'Erro interno no serviço de extração'
      
      if (errorMessage.includes('timeout')) {
        finalErrorMessage = 'Timeout: A extração está demorando mais que o esperado. Tente novamente com menos leads.'
      } else if (errorResponse?.status && errorResponse.status >= 500) {
        finalErrorMessage = 'Erro no servidor de extração. Tente novamente em alguns minutos.'
      } else if (errorMessage.includes('URL do Google Maps inválida')) {
        finalErrorMessage = 'URL inválida. Cole uma URL de busca ou lugar do Google Maps (ex: https://www.google.com/maps/search/restaurantes+sp)'
      } else if (errorMessage.includes('resposta vazia')) {
        finalErrorMessage = 'N8N não está respondendo corretamente. Verifique se o webhook está ativo e configurado.'
      } else if (errorMessage.includes('Nenhum lead encontrado')) {
        finalErrorMessage = 'N8N não retornou dados válidos. Verifique se o workflow está funcionando corretamente.'
      } else if (errorMessage) {
        finalErrorMessage = errorMessage
      }

      return {
        success: false,
        leads: [],
        total_found: 0,
        search_url: searchUrl,
        error: finalErrorMessage
      }
    }
  }

  /**
   * Salva uma lista de leads no Supabase
   */
  static async saveLeadList(
    name: string, 
    leads: Lead[], 
    description?: string,
    tags?: string[]
  ): Promise<LeadList> {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    // Remover propriedades temporárias dos leads
    const cleanLeads = leads.map(lead => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { selected, ...cleanLead } = lead
      return cleanLead
    })

    const listData = {
      user_id: user.id,
      name: name.trim(),
      leads: cleanLeads,
      total_leads: cleanLeads.length,
      description: description?.trim(),
      tags: tags || [],
      status: 'active' as const
    }

    const { data, error } = await supabase
      .from('lead_lists')
      .insert(listData)
      .select()
      .single()

    if (error) {
      console.error('Erro ao salvar lista:', error)
      throw new Error('Erro ao salvar lista de leads')
    }

    return data as LeadList
  }

  /**
   * Adiciona leads a uma lista existente
   */
  static async addLeadsToList(listId: string, newLeads: Lead[]): Promise<LeadList> {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    // Buscar lista existente
    const { data: existingList, error: fetchError } = await supabase
      .from('lead_lists')
      .select('*')
      .eq('id', listId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingList) {
      throw new Error('Lista não encontrada')
    }

    // Combinar leads existentes com novos
    const existingLeads = existingList.leads || []
    const cleanNewLeads = newLeads.map(lead => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { selected, ...cleanLead } = lead
      return cleanLead
    })

    // Evitar duplicatas baseadas no nome e endereço
    const combinedLeads = [...existingLeads]
    
    cleanNewLeads.forEach(newLead => {
      const isDuplicate = existingLeads.some((existing: Lead) => 
        existing.name.toLowerCase() === newLead.name.toLowerCase() &&
        existing.address.toLowerCase() === newLead.address.toLowerCase()
      )
      
      if (!isDuplicate) {
        combinedLeads.push(newLead)
      }
    })

    // Atualizar lista
    const { data, error } = await supabase
      .from('lead_lists')
      .update({
        leads: combinedLeads,
        total_leads: combinedLeads.length,
        updated_at: new Date().toISOString()
      })
      .eq('id', listId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar lista:', error)
      throw new Error('Erro ao adicionar leads à lista')
    }

    return data as LeadList
  }

  /**
   * Busca todas as listas do usuário
   */
  static async getUserLeadLists(): Promise<LeadList[]> {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    const { data, error } = await supabase
      .from('lead_lists')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar listas:', error)
      throw new Error('Erro ao carregar listas de leads')
    }

    return data as LeadList[]
  }

  /**
   * Busca uma lista específica
   */
  static async getLeadList(listId: string): Promise<LeadList | null> {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    const { data, error } = await supabase
      .from('lead_lists')
      .select('*')
      .eq('id', listId)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Lista não encontrada
      }
      console.error('Erro ao buscar lista:', error)
      throw new Error('Erro ao carregar lista de leads')
    }

    return data as LeadList
  }

  /**
   * Deleta uma lista de leads
   */
  static async deleteLeadList(listId: string): Promise<void> {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    const { error } = await supabase
      .from('lead_lists')
      .delete()
      .eq('id', listId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Erro ao deletar lista:', error)
      throw new Error('Erro ao deletar lista de leads')
    }
  }

  /**
   * Validações e utilitários
   */
  private static isValidGoogleMapsUrl(url: string): boolean {
    try {
      const urlObj = new URL(url)
      const hostname = urlObj.hostname.toLowerCase()
      const pathname = urlObj.pathname.toLowerCase()
      
      // Verificar diferentes formatos de URLs do Google Maps
      const validHostnames = [
        'maps.google.com',
        'www.google.com',
        'google.com',
        'maps.app.goo.gl',
        'goo.gl'
      ]
      
      const validPaths = [
        '/maps',
        '/search',
        '/place',
        '/dir'
      ]
      
      // Verificar se é um hostname válido
      const isValidHostname = validHostnames.some(validHost => 
        hostname === validHost || hostname.endsWith('.' + validHost)
      )
      
      if (!isValidHostname) {
        return false
      }
      
      // Para google.com, verificar se o path contém /maps
      if (hostname.includes('google.com')) {
        return pathname.includes('/maps') || validPaths.some(path => pathname.startsWith(path))
      }
      
      // Para goo.gl, assumir que é válido (URLs encurtadas)
      if (hostname.includes('goo.gl')) {
        return true
      }
      
      return true
      
    } catch (error) {
      console.warn('Erro ao validar URL:', error)
      return false
    }
  }

  private static normalizePhone(phone?: string): string | undefined {
    if (!phone) return undefined
    
    // Remover caracteres não numéricos exceto + e espaços
    const cleaned = phone.replace(/[^\d+\s()-]/g, '')
    return cleaned.trim() || undefined
  }

  /**
   * Formatar telefone vindo do N8N (formato: 5531993866785)
   */
  private static formatPhoneFromN8N(phoneUnformatted?: string): string | undefined {
    if (!phoneUnformatted) return undefined
    
    // Remove todos os caracteres não numéricos
    const numbers = phoneUnformatted.replace(/\D/g, '')
    
    // Formato esperado: 5531993866785 (55 + 31 + 99386-6785)
    if (numbers.length >= 13) {
      // Remove o código do país (55) e formata
      const withoutCountryCode = numbers.substring(2)
      const ddd = withoutCountryCode.substring(0, 2)
      const number = withoutCountryCode.substring(2)
      
      if (number.length === 9) {
        // Celular: (31) 99386-6785
        return `(${ddd}) ${number.substring(0, 5)}-${number.substring(5)}`
      } else if (number.length === 8) {
        // Fixo: (31) 3386-6785
        return `(${ddd}) ${number.substring(0, 4)}-${number.substring(4)}`
      }
    }
    
    // Fallback: retorna formatado simples
    return LeadService.normalizePhone(phoneUnformatted)
  }

  private static normalizeRating(rating?: unknown): number | undefined {
    if (!rating) return undefined
    
    const num = parseFloat(String(rating))
    if (isNaN(num)) return undefined
    
    // Garantir que está entre 0 e 5
    return Math.max(0, Math.min(5, num))
  }
}