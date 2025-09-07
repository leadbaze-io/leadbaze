import { useState, useMemo } from 'react'
import { Trash2, Filter, Star, Phone, Globe, MapPin, Users, Eye, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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
        title: "⚠️ Nenhum Lead Selecionado",
        description: "Selecione pelo menos um lead para deletar.",
        className: 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 dark:from-amber-950 dark:to-orange-950 dark:border-amber-800',
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
        title: "🗑️ Leads Deletados",
        description: `${selectedLeads.size} lead(s) foram deletado(s) com sucesso.`,
        variant: 'success',
      })
    } catch {
      toast({
        title: "❌ Erro ao Deletar",
        description: "Ocorreu um erro ao deletar os leads selecionados.",
        variant: 'destructive',
        className: 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200 dark:from-red-950 dark:to-pink-950 dark:border-red-800',
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
              i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
        <span className="text-xs text-muted-foreground ml-1">{rating}</span>
      </div>
    )
  }

  const renderReviewsCount = (reviewsCount?: number) => {
    // Sempre mostrar, mesmo quando não há avaliações
    const count = reviewsCount || 0
    return (
      <div className="flex items-center space-x-2">
        <div className="text-base font-bold text-blue-600 dark:text-blue-400 disparador-texto-claro">
          {count}
        </div>
        <div className="text-xs disparador-texto-claro dark:text-gray-300 font-medium">
          Avaliações
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="lista-detalhes-header-claro lista-detalhes-header-escuro rounded-2xl p-6 border">
        <div className="flex items-center justify-between mb-4">
          <div>
                    <h2 className="text-3xl font-bold lista-detalhes-texto-claro dark:text-foreground">{title}</h2>
        <p className="lista-detalhes-texto-claro dark:text-muted-foreground mt-1">
              {filteredLeads.length} leads encontrados
            </p>
          </div>
          
        </div>

        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="lista-detalhes-card-claro lista-detalhes-card-escuro rounded-lg p-3 border">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium lista-detalhes-texto-claro dark:text-muted-foreground">Total</span>
            </div>
            <p className="text-2xl font-bold lista-detalhes-texto-claro dark:text-foreground">{filteredLeads.length}</p>
          </div>
          <div className="lista-detalhes-card-claro lista-detalhes-card-escuro rounded-lg p-3 border">
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium lista-detalhes-texto-claro dark:text-muted-foreground">Com Telefone</span>
            </div>
            <p className="text-2xl font-bold lista-detalhes-texto-claro dark:text-foreground">
              {filteredLeads.filter(lead => lead.phone).length}
            </p>
          </div>
          <div className="lista-detalhes-card-claro lista-detalhes-card-escuro rounded-lg p-3 border">
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium lista-detalhes-texto-claro dark:text-muted-foreground">Com Website</span>
            </div>
            <p className="text-2xl font-bold lista-detalhes-texto-claro dark:text-foreground">
              {filteredLeads.filter(lead => lead.website).length}
            </p>
          </div>
          <div className="lista-detalhes-card-claro lista-detalhes-card-escuro rounded-lg p-3 border">
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium lista-detalhes-texto-claro dark:text-muted-foreground">4+ Estrelas</span>
            </div>
            <p className="text-2xl font-bold lista-detalhes-texto-claro dark:text-foreground">
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
              <Label className="text-xs font-medium text-foreground mb-2 block">Buscar</Label>
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
              <Label className="text-xs font-medium text-foreground mb-2 block">Cidade</Label>
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
              <Label className="text-xs font-medium text-foreground mb-2 block">Avaliação Mínima</Label>
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
                <SelectContent className="bg-popover border border-border shadow-lg">
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="4">4+ estrelas</SelectItem>
                  <SelectItem value="3">3+ estrelas</SelectItem>
                  <SelectItem value="2">2+ estrelas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-xs font-medium text-foreground mb-2 block">Avaliações</Label>
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
                <SelectContent className="bg-popover border border-border shadow-lg">
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
              <Label className="text-xs font-medium text-foreground mb-2 block">Website</Label>
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
                <SelectContent className="bg-popover border border-border shadow-lg">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="with">Com website</SelectItem>
                  <SelectItem value="without">Sem website</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-xs font-medium text-foreground mb-2 block">Leads por Página</Label>
              <Select 
                value={leadsPerPage} 
                onValueChange={(value) => {
                  setLeadsPerPage(value)
                  resetPagination()
                }}
              >
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border shadow-lg">
                  <SelectItem value="12">12</SelectItem>
                  <SelectItem value="24">24</SelectItem>
                  <SelectItem value="48">48</SelectItem>
                  <SelectItem value="96">96</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginatedLeads.map((lead, index) => (
          <Card 
            key={lead.id || index} 
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border-2 rounded-lg overflow-hidden ${
              selectedLeads.has(lead.id || '') 
                ? 'ring-2 ring-blue-500 border-blue-500 shadow-md card-selecionado-claro card-selecionado-escuro dark:border-blue-400 dark:ring-blue-400' 
                : 'border-gray-200 dark:border-border bg-card hover:border-blue-300 dark:hover:border-blue-200'
            }`}
            onClick={() => toggleLeadSelection(lead.id || '')}
          >
            {/* Header do Card */}
            <div className={`p-4 border-b-2 rounded-b-none ${
              selectedLeads.has(lead.id || '') 
                ? 'border-blue-200 dark:border-blue-700 card-header-selecionado-claro card-header-selecionado-escuro'
                : 'border-gray-200 dark:border-border bg-muted/30'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <input 
                    type="checkbox" 
                    checked={selectedLeads.has(lead.id || '')}
                    onChange={(e) => {
                      e.stopPropagation()
                      toggleLeadSelection(lead.id || '')
                    }}
                    className={`rounded flex-shrink-0 w-4 h-4 focus:ring-2 focus:ring-blue-500 ${
                      selectedLeads.has(lead.id || '') 
                        ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:bg-blue-500 dark:text-white'
                        : 'border-gray-300 text-blue-600'
                    }`}
                  />
                  <div className="flex items-center space-x-2">
                    {renderReviewsCount(lead.reviews_count)}
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {renderStars(lead.rating)}
                </div>
              </div>
              
              {/* Nome do estabelecimento */}
              <div className="mb-3">
                <h3 className="font-semibold disparador-texto-claro dark:text-foreground text-base truncate mb-2 leading-tight">{lead.name}</h3>
                <div className="flex items-start space-x-2 text-sm disparador-texto-claro dark:text-muted-foreground">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="leading-relaxed">{lead.address}</span>
                </div>
              </div>
            </div>

            {/* Conteúdo do Card */}
            <div className="p-4 space-y-3">
              {/* Informações de contato */}
              <div className="space-y-2">
                {lead.phone && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="w-4 h-4 text-green-600" />
                    <span className="text-green-700 dark:text-green-300 font-medium disparador-texto-claro">{lead.phone}</span>
                  </div>
                )}
                {lead.website && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-700 dark:text-blue-300 font-medium disparador-texto-claro">Website disponível</span>
                  </div>
                )}
                {!lead.phone && !lead.website && (
                  <div className="flex items-center space-x-2 text-sm disparador-texto-claro dark:text-muted-foreground">
                    <Eye className="w-4 h-4" />
                    <span>Contato não disponível</span>
                  </div>
                )}
              </div>

              {/* Badges Profissionais - Máximo 3 por card */}
              <div className="flex flex-wrap gap-2 pt-2">
                {/* Badge de Qualidade (Baseado na avaliação) */}
                {lead.rating && lead.rating >= 4.5 && (
                  <Badge variant="secondary" className="text-xs px-3 py-1.5 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 font-medium">
                    ⭐ Alta Qualidade
                  </Badge>
                )}
                {lead.rating && lead.rating >= 4 && lead.rating < 4.5 && (
                  <Badge variant="secondary" className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 font-medium">
                    ⭐ Boa Qualidade
                  </Badge>
                )}
                
                {/* Badge de Reputação (Baseado no número de avaliações) */}
                {lead.reviews_count && lead.reviews_count >= 500 && (
                  <Badge variant="secondary" className="text-xs px-3 py-1.5 bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-600 dark:text-white dark:border-purple-500 font-medium">
                    🏆 Estabelecido
                  </Badge>
                )}
                {lead.reviews_count && lead.reviews_count >= 100 && lead.reviews_count < 500 && (
                  <Badge variant="secondary" className="text-xs px-3 py-1.5 bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800 font-medium">
                    🔥 Consolidado
                  </Badge>
                )}
                {lead.reviews_count && lead.reviews_count >= 25 && lead.reviews_count < 100 && (
                  <Badge variant="secondary" className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 font-medium">
                    📈 Em Crescimento
                  </Badge>
                )}
                
                {/* Badge de Contato (Baseado na disponibilidade de informações) */}
                {lead.phone && lead.website && (
                  <Badge variant="secondary" className="text-xs px-3 py-1.5 bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-800 font-medium">
                    🌐 Contato Completo
                  </Badge>
                )}
                {!lead.phone && lead.website && (
                  <Badge variant="secondary" className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 font-medium">
                    🌐 Online
                  </Badge>
                )}
                {!lead.phone && !lead.website && (
                  <Badge variant="secondary" className="text-xs px-3 py-1.5 bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800 font-medium">
                    📋 Informações Básicas
                  </Badge>
                )}
              </div>


            </div>
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
                  <Filter className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-medium disparador-texto-claro dark:text-foreground mb-2">Nenhum lead encontrado</h3>
        <p className="disparador-texto-claro dark:text-muted-foreground max-w-md mx-auto">
            Tente ajustar os filtros ou realizar uma nova busca para encontrar leads que correspondam aos seus critérios.
          </p>
        </div>
      )}

      {/* Botão Flutuante para Remoção */}
      <AnimatePresence>
        {selectedLeads.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-red-200 dark:border-red-700 p-4 min-w-[280px] relative">
              <button
                onClick={() => setSelectedLeads(new Set())}
                className="absolute -top-2 -right-2 w-6 h-6 bg-gray-500 hover:bg-gray-600 text-white rounded-full flex items-center justify-center text-xs transition-colors"
              >
                ×
              </button>
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Trash2 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {selectedLeads.size} Lead(s) Selecionado(s)
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Para remoção da lista
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button
                  onClick={toggleSelectAll}
                  variant="outline"
                  size="sm"
                  className="w-full border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  style={{ 
                    color: document.documentElement.classList.contains('dark') 
                      ? 'rgb(147 197 253)' // blue-300 para dark mode
                      : 'rgb(29 78 216)'   // blue-700 para light mode
                  }}
                >
                  <Check className="w-4 h-4 mr-2" />
                  {selectedLeads.size === filteredLeads.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                </Button>
                
                <Button
                  onClick={handleDeleteSelected}
                  disabled={isDeleting}
                  className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Removendo...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remover Selecionados
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
