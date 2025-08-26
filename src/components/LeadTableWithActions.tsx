import { useState, useMemo } from 'react'
import { Trash2, CheckSquare, Square, Filter, Star, Phone, Globe, MapPin, Users, Eye } from 'lucide-react'
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
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'

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
  const [leadsPerPage, setLeadsPerPage] = useState("12")
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

  const renderStars = (rating?: number) => {
    if (!rating) return null
    return (
      <div className="flex items-center space-x-1">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${
              i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-xs text-gray-600 ml-1">{rating}</span>
      </div>
    )
  }

  const renderReviewsCount = (reviewsCount?: number) => {
    if (!reviewsCount) return null
    return (
      <div className="flex items-center space-x-1">
        <div className="flex items-center justify-center w-5 h-5 bg-blue-100 rounded-full">
          <span className="text-xs font-semibold text-blue-700">{reviewsCount}</span>
        </div>
        <span className="text-xs text-gray-600">Avaliações</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
            <p className="text-gray-600 mt-1">
              {filteredLeads.length} leads encontrados
              {selectedLeads.size > 0 && (
                <span className="ml-2 text-blue-600 font-medium">
                  • {selectedLeads.size} selecionado(s)
                </span>
              )}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {selectedLeads.size > 0 && (
              <Button
                onClick={handleDeleteSelected}
                disabled={isDeleting}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-lg shadow-lg border-2 border-red-500 hover:border-red-600 transition-all duration-200 transform hover:scale-105"
              >
                <Trash2 className="w-4 h-4" />
                <span>🗑️ Deletar {selectedLeads.size} Lead{selectedLeads.size > 1 ? 's' : ''}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Total</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{filteredLeads.length}</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-green-200">
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Com Telefone</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {filteredLeads.filter(lead => lead.phone).length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-purple-200">
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Com Website</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {filteredLeads.filter(lead => lead.website).length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-yellow-200">
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-gray-700">4+ Estrelas</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {filteredLeads.filter(lead => lead.rating && lead.rating >= 4).length}
            </p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label className="text-xs font-medium text-gray-700 mb-2 block">Buscar</Label>
              <Input
                placeholder="Nome ou endereço..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  resetPagination()
                }}
                className="h-10 text-sm"
              />
            </div>
            
            <div>
              <Label className="text-xs font-medium text-gray-700 mb-2 block">Cidade</Label>
              <Input
                placeholder="Filtrar por cidade..."
                value={cityFilter}
                onChange={(e) => {
                  setCityFilter(e.target.value)
                  resetPagination()
                }}
                className="h-10 text-sm"
              />
            </div>
            
            <div>
              <Label className="text-xs font-medium text-gray-700 mb-2 block">Avaliação Mínima</Label>
              <Select 
                value={ratingFilter} 
                onValueChange={(value) => {
                  setRatingFilter(value)
                  resetPagination()
                }}
              >
                <SelectTrigger className="h-10 text-sm">
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
              <Label className="text-xs font-medium text-gray-700 mb-2 block">Avaliações</Label>
              <Select 
                value={reviewsFilter} 
                onValueChange={(value) => {
                  setReviewsFilter(value)
                  resetPagination()
                }}
              >
                <SelectTrigger className="h-10 text-sm">
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
              <Label className="text-xs font-medium text-gray-700 mb-2 block">Website</Label>
              <Select 
                value={websiteFilter} 
                onValueChange={(value) => {
                  setWebsiteFilter(value)
                  resetPagination()
                }}
              >
                <SelectTrigger className="h-10 text-sm">
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
        </CardContent>
      </Card>

      {/* Controles de seleção */}
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSelectAll}
            className="flex items-center space-x-2 border-blue-300 text-blue-700 hover:bg-blue-100"
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
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {selectedLeads.size} de {filteredLeads.length} leads selecionados
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <Label className="text-sm font-medium text-gray-700">Leads por Página</Label>
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
              <SelectItem value="12">12</SelectItem>
              <SelectItem value="24">24</SelectItem>
              <SelectItem value="48">48</SelectItem>
              <SelectItem value="96">96</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginatedLeads.map((lead, index) => (
          <Card 
            key={lead.id || index} 
            className={`cursor-pointer transition-all duration-200 hover:shadow-xl hover:-translate-y-1 border-2 ${
              selectedLeads.has(lead.id || '') 
                ? 'border-blue-500 bg-blue-50 shadow-lg' 
                : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => toggleLeadSelection(lead.id || '')}
          >
            <CardContent className="p-4">
              {/* Header do Card */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <input 
                    type="checkbox" 
                    checked={selectedLeads.has(lead.id || '')}
                    onChange={(e) => {
                      e.stopPropagation()
                      toggleLeadSelection(lead.id || '')
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                  />
                  {renderReviewsCount(lead.reviews_count)}
                </div>
                {renderStars(lead.rating)}
              </div>

              {/* Nome do estabelecimento */}
              <div className="mb-3">
                <h3 className="font-semibold text-gray-900 text-sm truncate mb-1">{lead.name}</h3>
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{lead.address}</span>
                </div>
              </div>

              {/* Informações de contato */}
              <div className="space-y-2 mb-3">
                {lead.phone && (
                  <div className="flex items-center space-x-2 text-xs">
                    <Phone className="w-3 h-3 text-green-600" />
                    <span className="text-green-700 font-medium">{lead.phone}</span>
                  </div>
                )}
                {lead.website && (
                  <div className="flex items-center space-x-2 text-xs">
                    <Globe className="w-3 h-3 text-blue-600" />
                    <span className="text-blue-700 font-medium">Website disponível</span>
                  </div>
                )}
                {!lead.phone && !lead.website && (
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <Eye className="w-3 h-3" />
                    <span>Contato não disponível</span>
                  </div>
                )}
              </div>

              {/* Tags e badges */}
              <div className="flex flex-wrap gap-1">
                {lead.business_type && (
                  <Badge variant="outline" className="text-xs">
                    {lead.business_type}
                  </Badge>
                )}
                {lead.rating && lead.rating >= 4 && (
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    ⭐ Premium
                  </Badge>
                )}
                {lead.reviews_count && lead.reviews_count >= 100 && (
                  <Badge className="bg-purple-100 text-purple-800 text-xs">
                    🔥 Popular
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="w-8 h-8"
                >
                  {page}
                </Button>
              )
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Próxima
          </Button>
        </div>
      )}

      {/* Estado vazio */}
      {filteredLeads.length === 0 && (
        <div className="text-center py-16">
          <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">Nenhum lead encontrado</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Tente ajustar os filtros ou realizar uma nova busca para encontrar leads que correspondam aos seus critérios.
          </p>
        </div>
      )}
    </div>
  )
}
