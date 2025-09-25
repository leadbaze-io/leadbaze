import { useState, useMemo } from 'react'
import { Star, Phone, Globe, MapPin, Filter, Search, Download, Clock, DollarSign } from 'lucide-react'
import type { Lead } from '../types'

interface LeadTableProps {
  leads: Lead[]
  title?: string
}

export default function LeadTable({ leads, title = "Lista de Leads" }: LeadTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [minRating, setMinRating] = useState(0)
  const [minReviews, setMinReviews] = useState(0)
  const [maxLeads, setMaxLeads] = useState(50)
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'address'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Filtrar e ordenar leads
  const filteredAndSortedLeads = useMemo(() => {
    const filtered = leads.filter(lead => {
      const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           lead.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (lead.business_type?.toLowerCase().includes(searchTerm.toLowerCase()) || false)

      const matchesRating = !lead.rating || lead.rating >= minRating
      const matchesReviews = !lead.reviews_count || lead.reviews_count >= minReviews

      return matchesSearch && matchesRating && matchesReviews
    })

    // Ordenar
    filtered.sort((a, b) => {
      let valueA: string | number = ''
      let valueB: string | number = ''

      switch (sortBy) {
        case 'name':
          valueA = a.name.toLowerCase()
          valueB = b.name.toLowerCase()
          break
        case 'rating':
          valueA = a.rating || 0
          valueB = b.rating || 0
          break
        case 'address':
          valueA = a.address.toLowerCase()
          valueB = b.address.toLowerCase()
          break
      }

      if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1
      if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    // Limitar quantidade
    return filtered.slice(0, maxLeads)
  }, [leads, searchTerm, minRating, minReviews, maxLeads, sortBy, sortOrder])

  const handleSort = (field: 'name' | 'rating' | 'address') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }
  const exportToCSV = () => {
    const headers = ['Nome', 'Endereço', 'Telefone', 'Avaliação', 'Website', 'Tipo de Negócio']
    const csvData = [
      headers.join(','),
      ...filteredAndSortedLeads.map(lead => [
        `"${lead.name}"`,
        `"${lead.address}"`,
        `"${lead.phone || ''}"`,
        lead.rating || '',
        `"${lead.website || ''}"`,
        `"${lead.business_type || ''}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `${title.replace(/\s+/g, '_').toLowerCase()}_leads.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              {filteredAndSortedLeads.length} de {leads.length} leads
            </p>
          </div>

          <button
            onClick={exportToCSV}
            className="inline-flex items-center space-x-2 bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
          </div>

          {/* Quantidade máxima */}
          <div>
            <select
              value={maxLeads}
              onChange={(e) => setMaxLeads(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value={10}>10 leads</option>
              <option value={20}>20 leads</option>
              <option value={30}>30 leads</option>
              <option value={40}>40 leads</option>
              <option value={50}>50 leads</option>
              <option value={100}>100 leads</option>
            </select>
          </div>

          {/* Avaliação Mínima */}
          <div>
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value={0}>Qualquer avaliação</option>
              <option value={3}>3+ estrelas</option>
              <option value={4}>4+ estrelas</option>
              <option value={4.5}>4.5+ estrelas</option>
            </select>
          </div>

          {/* Avaliações */}
          <div>
            <select
              value={minReviews}
              onChange={(e) => setMinReviews(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value={0}>Qualquer quantidade</option>
              <option value={10}>10+ Avaliações</option>
              <option value={25}>25+ Avaliações</option>
              <option value={50}>50+ Avaliações</option>
              <option value={100}>100+ Avaliações</option>
              <option value={250}>250+ Avaliações</option>
              <option value={500}>500+ Avaliações</option>
            </select>
          </div>

          {/* Ordenar por */}
          <div>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-')
                setSortBy(field as 'name' | 'rating' | 'address')
                setSortOrder(order as 'asc' | 'desc')
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="name-asc">Nome (A-Z)</option>
              <option value="name-desc">Nome (Z-A)</option>
              <option value="rating-desc">Maior avaliação</option>
              <option value="rating-asc">Menor avaliação</option>
              <option value="address-asc">Endereço (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th

                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('name')}
              >
                Estabelecimento & Cidade
              </th>
              <th

                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('rating')}
              >
                Avaliação
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Contato
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredAndSortedLeads.map((lead, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">{lead.name}</div>

                      {/* Cidade abaixo do nome */}
                      <div className="flex items-start space-x-2 mb-2">
                        <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <span className="text-base font-semibold text-blue-700 dark:text-blue-300 leading-relaxed">{lead.address || 'Cidade não disponível'}</span>
                      </div>

                      {lead.business_type && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                          {lead.business_type}
                        </span>
                      )}

                      {/* Horário de funcionamento */}
                      {lead.opening_hours && lead.opening_hours.length > 0 && (
                        <div className="flex items-start space-x-2 mt-2">
                          <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {lead.opening_hours.slice(0, 2).map((hour, i) => (
                              <div key={i}>{hour}</div>
                            ))}
                            {lead.opening_hours.length > 2 && (
                              <div className="text-blue-600 dark:text-blue-400">+{lead.opening_hours.length - 2} mais</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-2">
                    {/* Avaliação com Star */}
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Star className="h-4 w-4 text-amber-500 dark:text-amber-400 fill-amber-500 dark:fill-amber-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {lead.totalScore ? `${lead.totalScore} / 5` : 'N/A'}
                        </span>
                      </div>
                      {/* Número de Avaliações com Destaque Especial */}
                      {lead.reviews_count && (
                        <div className="mt-2">
                          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {lead.reviews_count}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                            Avaliações
                          </div>
                        </div>
                      )}
                </div>

                {/* Nível de preço */}
                {lead.price_level && (
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                    <div className="flex">
                      {Array.from({ length: 4 }, (_, i) => (
                        <span

                          key={i}

                          className={`text-xs ${i < lead.price_level! ? 'text-green-600 dark:text-green-400' : 'text-gray-300 dark:text-gray-600'}`}
                        >
                          $
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="space-y-2">
                {/* Telefone */}
                {lead.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <a

                      href={`tel:${lead.phone}`}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                    >
                      {lead.phone}
                    </a>
                  </div>
                )}

                {/* Website */}
                {lead.website && (
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <a

                      href={lead.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                    >
                      Website
                    </a>
                  </div>
                )}

                {/* Se não tem telefone nem website */}
                {!lead.phone && !lead.website && (
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    Contato não disponível
                  </div>
                )}
              </div>
            </td>

          </tr>
        ))}
          </tbody>
        </table>

        {filteredAndSortedLeads.length === 0 && (
          <div className="text-center py-12">
            <Filter className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhum lead encontrado</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Tente ajustar os filtros ou realizar uma nova busca.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}