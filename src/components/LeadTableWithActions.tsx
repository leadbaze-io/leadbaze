import { useState, useMemo } from 'react'
import { Trash2, CheckSquare, Square, Filter } from 'lucide-react'
import type { Lead } from '../types'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { useToast } from '../hooks/use-toast'

interface LeadTableWithActionsProps {
  leads: Lead[]
  title?: string
  onLeadsDeleted?: (deletedLeadIds: string[]) => void
}

export default function LeadTableWithActions({ leads, title = "Lista de Leads", onLeadsDeleted }: LeadTableWithActionsProps) {
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState("")
  const [cityFilter, setCityFilter] = useState("")
  const [ratingFilter, setRatingFilter] = useState("all")
  const [reviewsFilter, setReviewsFilter] = useState("all")
  const [websiteFilter, setWebsiteFilter] = useState("all")
  const [leadsPerPage, setLeadsPerPage] = useState("10")
  const [currentPage, setCurrentPage] = useState(1)
  
  const { toast } = useToast()

  // Filtrar leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = searchTerm === "" || 
        lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.address?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCity = cityFilter === "" || 
        lead.address?.toLowerCase().includes(cityFilter.toLowerCase())
      
      const matchesRating = ratingFilter === "all" || 
        (lead.rating && lead.rating >= parseFloat(ratingFilter))
      
      const matchesReviews = reviewsFilter === "all" || 
        (lead.reviews_count && lead.reviews_count >= parseInt(reviewsFilter))
      
      const matchesWebsite = websiteFilter === "all" || 
        (websiteFilter === "with" && lead.website) ||
        (websiteFilter === "without" && !lead.website)
      
      return matchesSearch && matchesCity && matchesRating && matchesReviews && matchesWebsite
    })
  }, [leads, searchTerm, cityFilter, ratingFilter, reviewsFilter, websiteFilter])

  // Paginação
  const leadsPerPageNum = parseInt(leadsPerPage)
  const totalPages = Math.ceil(filteredLeads.length / leadsPerPageNum)
  const startIndex = (currentPage - 1) * leadsPerPageNum
  const endIndex = startIndex + leadsPerPageNum
  const paginatedLeads = filteredLeads.slice(startIndex, endIndex)

  // Resetar página quando filtros mudam
  const resetPagination = () => setCurrentPage(1)

  const toggleLeadSelection = (leadId: string) => {
    const newSelected = new Set(selectedLeads)
    if (newSelected.has(leadId)) {
      newSelected.delete(leadId)
    } else {
      newSelected.add(leadId)
    }
    setSelectedLeads(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedLeads.size === filteredLeads.length) {
      setSelectedLeads(new Set())
    } else {
      setSelectedLeads(new Set(filteredLeads.map(lead => lead.id || '').filter(Boolean)))
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedLeads.size === 0) {
      toast({
        title: "Nenhum lead selecionado",
        description: "Selecione pelo menos um lead para deletar.",
        variant: "destructive",
      })
      return
    }

    if (!confirm(`Tem certeza que deseja deletar ${selectedLeads.size} lead(s) selecionado(s)? Esta ação não pode ser desfeita.`)) {
      return
    }

    setIsDeleting(true)
    try {
      const deletedIds = Array.from(selectedLeads)
      if (onLeadsDeleted) {
        onLeadsDeleted(deletedIds)
      }
      setSelectedLeads(new Set())
      toast({
        title: "Leads deletados",
        description: `${selectedLeads.size} lead(s) foram deletado(s) com sucesso.`,
      })
    } catch (error) {
      toast({
        title: "Erro ao deletar",
        description: "Ocorreu um erro ao deletar os leads selecionados.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header com ações */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="text-gray-600 mt-1">
            {filteredLeads.length} leads
            {selectedLeads.size > 0 && (
              <span className="ml-2 text-blue-600 font-medium">
                • {selectedLeads.size} selecionado(s)
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {selectedLeads.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteSelected}
              disabled={isDeleting}
              className="flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Deletar Selecionados</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <Label className="text-xs font-medium text-gray-700">Buscar</Label>
          <Input
            placeholder="Nome ou endereço..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              resetPagination()
            }}
            className="h-8 text-sm"
          />
        </div>
        
        <div>
          <Label className="text-xs font-medium text-gray-700">Cidade</Label>
          <Input
            placeholder="Filtrar por cidade..."
            value={cityFilter}
            onChange={(e) => {
              setCityFilter(e.target.value)
              resetPagination()
            }}
            className="h-8 text-sm"
          />
        </div>
        
        <div>
          <Label className="text-xs font-medium text-gray-700">Avaliação Mínima</Label>
          <Select 
            value={ratingFilter} 
            onValueChange={(value) => {
              setRatingFilter(value)
              resetPagination()
            }}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg">
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="4">4+ estrelas</SelectItem>
              <SelectItem value="3">3+ estrelas</SelectItem>
              <SelectItem value="2">2+ estrelas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="text-xs font-medium text-gray-700">Avaliações</Label>
          <Select 
            value={reviewsFilter} 
            onValueChange={(value) => {
              setReviewsFilter(value)
              resetPagination()
            }}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg">
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="10">10+ Avaliações</SelectItem>
              <SelectItem value="25">25+ Avaliações</SelectItem>
              <SelectItem value="50">50+ Avaliações</SelectItem>
              <SelectItem value="100">100+ Avaliações</SelectItem>
              <SelectItem value="250">250+ Avaliações</SelectItem>
              <SelectItem value="500">500+ Avaliações</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="text-xs font-medium text-gray-700">Website</Label>
          <Select 
            value={websiteFilter} 
            onValueChange={(value) => {
              setWebsiteFilter(value)
              resetPagination()
            }}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg">
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="with">Com website</SelectItem>
              <SelectItem value="without">Sem website</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Controles de seleção */}
      <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSelectAll}
            className="flex items-center space-x-2"
          >
            {selectedLeads.size === filteredLeads.length ? (
              <CheckSquare className="w-4 h-4" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            <span>
              {selectedLeads.size === filteredLeads.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
            </span>
          </Button>
          
          {selectedLeads.size > 0 && (
            <span className="text-sm text-blue-600 font-medium">
              {selectedLeads.size} de {filteredLeads.length} leads selecionados
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Label className="text-xs font-medium text-gray-700">Leads por Página</Label>
          <Select 
            value={leadsPerPage} 
            onValueChange={(value) => {
              setLeadsPerPage(value)
              resetPagination()
            }}
          >
            <SelectTrigger className="h-8 text-sm w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg">
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabela de leads com seleção */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={selectedLeads.size === filteredLeads.length && filteredLeads.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estabelecimento
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avaliação
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contato
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedLeads.map((lead, index) => (
              <tr key={lead.id || index} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedLeads.has(lead.id || '')}
                    onChange={() => toggleLeadSelection(lead.id || '')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-4 py-3">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                    <div className="text-sm text-gray-500">{lead.address}</div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    {lead.rating && (
                      <div className="flex items-center">
                        <span className="text-yellow-400">★</span>
                        <span className="text-sm text-gray-900 ml-1">{lead.rating}</span>
                      </div>
                    )}
                    {lead.reviews_count && (
                      <span className="text-sm text-gray-500">({lead.reviews_count} avaliações)</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    {lead.phone && (
                      <div className="text-sm text-blue-600">{lead.phone}</div>
                    )}
                    {lead.website && (
                      <div className="text-sm text-blue-600">Website</div>
                    )}
                    {!lead.phone && !lead.website && (
                      <div className="text-sm text-gray-400">Contato não disponível</div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Próxima
              </Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{startIndex + 1}</span> a{' '}
                  <span className="font-medium">{Math.min(endIndex, filteredLeads.length)}</span> de{' '}
                  <span className="font-medium">{filteredLeads.length}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Próxima
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        )}

        {filteredLeads.length === 0 && (
          <div className="text-center py-12">
            <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum lead encontrado</h3>
            <p className="text-gray-500">
              Tente ajustar os filtros ou realizar uma nova busca.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
