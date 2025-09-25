// Dados de demonstração para quando o N8N não estiver disponível

import type { Lead, LeadGenerationResponse } from '../types'

export const generateDemoLeads = (searchUrl: string, limit: number = 10): LeadGenerationResponse => {

  // Detectar tipo de busca baseado na URL

  let businessType = 'Estabelecimento'

  let locationName = 'São Paulo, SP'

  if (searchUrl.includes('restaurante') || searchUrl.includes('restaurant')) {

    businessType = 'Restaurante'

  } else if (searchUrl.includes('hotel') || searchUrl.includes('pousada')) {

    businessType = 'Hotel'

  } else if (searchUrl.includes('farmacia') || searchUrl.includes('pharmacy')) {

    businessType = 'Farmácia'

  } else if (searchUrl.includes('academia') || searchUrl.includes('gym')) {

    businessType = 'Academia'

  } else if (searchUrl.includes('dentista') || searchUrl.includes('dental')) {

    businessType = 'Clínica Odontológica'

  } else if (searchUrl.includes('salao') || searchUrl.includes('salon')) {

    businessType = 'Salão de Beleza'

  }

  // Detectar localização

  if (searchUrl.includes('bh') || searchUrl.includes('horizonte')) {

    locationName = 'Belo Horizonte, MG'

  } else if (searchUrl.includes('rio') || searchUrl.includes('rj')) {

    locationName = 'Rio de Janeiro, RJ'

  } else if (searchUrl.includes('brasilia') || searchUrl.includes('df')) {

    locationName = 'Brasília, DF'

  }

  // Gerar telefones realísticos no formato N8N (5531993866785)

  const generatePhoneN8NFormat = (index: number) => {

    const ddd = locationName.includes('São Paulo') ? '11' :

               locationName.includes('Rio') ? '21' :

               locationName.includes('Belo Horizonte') ? '31' : '11'

    const base = [99999, 98888, 97777, 96666, 95555, 94444, 93333, 92222, 91111, 90000]

    const number = `${base[index]}${1000 + index * 111}`

    return `55${ddd}${number}` // Formato N8N: 5531993866785

  }

  // Função para formatar telefone para exibição

  const formatPhoneForDisplay = (phoneN8N: string) => {

    if (phoneN8N.length >= 13) {

      const withoutCountryCode = phoneN8N.substring(2)

      const ddd = withoutCountryCode.substring(0, 2)

      const number = withoutCountryCode.substring(2)

      if (number.length === 9) {

        return `(${ddd}) ${number.substring(0, 5)}-${number.substring(5)}`

      }

    }

    return phoneN8N

  }

  // Gerar websites realísticos

  const generateWebsite = (name: string, hasWebsite: boolean) => {

    if (!hasWebsite) return undefined

    const cleanName = name.toLowerCase()

      .replace(/[^a-z0-9]/g, '')

      .substring(0, 15)

    return `https://${cleanName}.com.br`

  }

  const demoLeads: Lead[] = [

    {

      id: 'demo_1',

      name: `${businessType} Central`,

      address: locationName.split(',')[0], // Apenas a cidade

      phone: generatePhoneN8NFormat(0),

      rating: 4.5,

      totalScore: 4.5,

      website: generateWebsite(`${businessType} Central`, true),

      business_type: businessType,

      google_maps_url: searchUrl,

      reviews_count: 85,

      price_level: 2,

      opening_hours: ['Segunda a Sexta: 08:00–18:00', 'Sábado: 08:00–16:00', 'Domingo: Fechado'],

      selected: false

    },

    {

      id: 'demo_2',

      name: `${businessType} Premium`,

      address: locationName.split(',')[0],

      phone: formatPhoneForDisplay(generatePhoneN8NFormat(1)),

      rating: 4.8,

      totalScore: 4.8,

      website: generateWebsite(`${businessType} Premium`, true),

      business_type: businessType,

      google_maps_url: searchUrl,

      reviews_count: 142,

      price_level: 3,

      opening_hours: ['Segunda a Domingo: 09:00–22:00'],

      selected: false

    },

    {

      id: 'demo_3',

      name: `${businessType} do Bairro`,

      address: locationName.split(',')[0],

      phone: formatPhoneForDisplay(generatePhoneN8NFormat(2)),

      rating: 4.2,

      totalScore: 4.2,

      business_type: businessType,

      google_maps_url: searchUrl,

      reviews_count: 63,

      price_level: 2,

      opening_hours: ['Segunda a Sábado: 07:00–19:00', 'Domingo: 08:00–15:00'],

      selected: false

    },

    {

      id: 'demo_4',

      name: `${businessType} Express`,

      address: locationName.split(',')[0],

      phone: formatPhoneForDisplay(generatePhoneN8NFormat(3)),

      rating: 4.6,

      totalScore: 4.6,

      website: generateWebsite(`${businessType} Express`, true),

      business_type: businessType,

      google_maps_url: searchUrl,

      reviews_count: 97,

      price_level: 1,

      opening_hours: ['Segunda a Domingo: 06:00–23:00'],

      selected: false

    },

    {

      id: 'demo_5',

      name: `${businessType} Tradicional`,

      address: locationName.split(',')[0],

      phone: formatPhoneForDisplay(generatePhoneN8NFormat(4)),

      rating: 4.3,

      totalScore: 4.3,

      business_type: businessType,

      google_maps_url: searchUrl,

      reviews_count: 78,

      price_level: 2,

      opening_hours: ['Segunda a Sexta: 09:00–18:00', 'Sábado: 09:00–14:00'],

      selected: false

    },

    {

      id: 'demo_6',

      name: `${businessType} Moderno`,

      address: locationName.split(',')[0],

      phone: formatPhoneForDisplay(generatePhoneN8NFormat(5)),

      rating: 4.7,

      totalScore: 4.7,

      website: generateWebsite(`${businessType} Moderno`, true),

      business_type: businessType,

      google_maps_url: searchUrl,

      reviews_count: 156,

      price_level: 3,

      opening_hours: ['Segunda a Domingo: 10:00–21:00'],

      selected: false

    },

    {

      id: 'demo_7',

      name: `${businessType} da Esquina`,

      address: locationName.split(',')[0],

      phone: formatPhoneForDisplay(generatePhoneN8NFormat(6)),

      rating: 4.1,

      totalScore: 4.1,

      business_type: businessType,

      google_maps_url: searchUrl,

      reviews_count: 44,

      price_level: 1,

      opening_hours: ['Segunda a Sábado: 08:00–20:00'],

      selected: false

    },

    {

      id: 'demo_8',

      name: `${businessType} Elite`,

      address: locationName.split(',')[0],

      phone: formatPhoneForDisplay(generatePhoneN8NFormat(7)),

      rating: 4.9,

      website: generateWebsite(`${businessType} Elite`, true),

      business_type: businessType,

      google_maps_url: searchUrl,

      reviews_count: 203,

      price_level: 4,

      opening_hours: ['Segunda a Sexta: 08:00–19:00', 'Sábado: 09:00–17:00', 'Domingo: 10:00–16:00'],

      selected: false

    },

    {

      id: 'demo_9',

      name: `${businessType} Familiar`,

      address: locationName.split(',')[0],

      phone: formatPhoneForDisplay(generatePhoneN8NFormat(8)),

      rating: 4.4,

      totalScore: 4.4,

      website: generateWebsite(`${businessType} Familiar`, false), // Sem website

      business_type: businessType,

      google_maps_url: searchUrl,

      reviews_count: 67,

      price_level: 2,

      opening_hours: ['Segunda a Domingo: 11:00–22:00'],

      selected: false

    },

    {

      id: 'demo_10',

      name: `${businessType} 24h`,

      address: locationName.split(',')[0],

      phone: formatPhoneForDisplay(generatePhoneN8NFormat(9)),

      rating: 4.0,

      totalScore: 4.0,

      website: generateWebsite(`${businessType} 24h`, true),

      business_type: businessType,

      google_maps_url: searchUrl,

      reviews_count: 112,

      price_level: 2,

      opening_hours: ['Aberto 24 horas'],

      selected: false

    }

  ]

  // Retornar apenas a quantidade solicitada

  const limitedLeads = demoLeads.slice(0, Math.min(limit, demoLeads.length))

  return {

    success: true,

    leads: limitedLeads,

    total_found: limitedLeads.length,

    search_url: searchUrl,

    location: locationName,

    search_term: `${businessType}s em ${locationName}`,

    processing_time: 1.2

  }

}