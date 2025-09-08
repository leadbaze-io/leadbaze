import { useState, useMemo } from 'react'
import { Trash2, Star, Phone, Globe, Users, Check, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Lead } from '../types'
import { Button } from './ui/button'
import { useToast } from '../hooks/use-toast'
import { Card, CardContent } from './ui/card'
import { LeadCard } from './LeadCard'
import { LeadFiltersPro } from './LeadFiltersPro'

interface LeadTableWithActionsProps {
  leads: Lead[]
  title?: string
  onLeadsDeleted?: (deletedLeadIds: string[]) => void
}

export default function LeadTableWithActions({ leads, onLeadsDeleted }: LeadTableWithActionsProps) {
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
  
  // Novos filtros avançados
  const [sortBy, setSortBy] = useState("relevance")
  const [sortOrder, setSortOrder] = useState("desc")
  const [maxReviews, setMaxReviews] = useState("none")
  
  const { toast } = useToast()

  // Filtrar leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = searchTerm === "" || 
        lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCity = cityFilter === "" || 
        lead.address?.toLowerCase().includes(cityFilter.toLowerCase())
      
      const matchesRating = ratingFilter === "all" || 
        (lead.rating && lead.rating >= parseFloat(ratingFilter))
      
      const matchesReviews = reviewsFilter === "all" || 
        (lead.reviews_count && lead.reviews_count >= parseInt(reviewsFilter))
      
      const matchesMaxReviews = maxReviews === "" || maxReviews === "none" || 
        (lead.reviews_count && lead.reviews_count <= parseInt(maxReviews))
      
      const matchesWebsite = websiteFilter === "all" || 
        (websiteFilter === "with" && lead.website) ||
        (websiteFilter === "without" && !lead.website)
      
      return matchesSearch && matchesCity && matchesRating && matchesReviews && matchesMaxReviews && matchesWebsite
    })
  }, [leads, searchTerm, cityFilter, ratingFilter, reviewsFilter, maxReviews, websiteFilter])

  // Ordenar leads
  const sortedLeads = useMemo(() => {
    return [...filteredLeads].sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case "rating":
          comparison = (a.rating || 0) - (b.rating || 0)
          break
        case "reviews":
          comparison = (a.reviews_count || 0) - (b.reviews_count || 0)
          break
        case "name":
          comparison = (a.name || "").localeCompare(b.name || "")
          break
        case "relevance":
        default:
          // Para relevância, usar número de avaliações como critério secundário
          comparison = (a.reviews_count || 0) - (b.reviews_count || 0)
          break
      }
      
      // Aplicar a ordem selecionada (Maior para Menor / Menor para Maior)
      return sortOrder === "desc" ? -comparison : comparison
    })
  }, [filteredLeads, sortBy, sortOrder])

  // Paginação
  const leadsPerPageNum = parseInt(leadsPerPage)
  const totalPages = Math.ceil(sortedLeads.length / leadsPerPageNum)
  const startIndex = (currentPage - 1) * leadsPerPageNum
  const endIndex = startIndex + leadsPerPageNum
  const paginatedLeads = sortedLeads.slice(startIndex, endIndex)

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
    const allLeadIds = paginatedLeads.map(lead => lead.id || '').filter(id => id)
    const allSelected = allLeadIds.every(id => selectedLeads.has(id))
    
    if (allSelected) {
      // Desmarcar todos os leads da página atual
      const newSelected = new Set(selectedLeads)
      allLeadIds.forEach(id => newSelected.delete(id))
      setSelectedLeads(newSelected)
    } else {
      // Selecionar todos os leads da página atual
      const newSelected = new Set(selectedLeads)
      allLeadIds.forEach(id => newSelected.add(id))
      setSelectedLeads(newSelected)
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

    const shouldDelete = window.confirm(
      `Tem certeza que deseja deletar ${selectedLeads.size} lead(s) selecionado(s)? Esta ação não pode ser desfeita.`
    )

    if (!shouldDelete) return

    setIsDeleting(true)

    try {
      // Simular deleção - em uma implementação real, você faria uma chamada para a API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const deletedLeadIds = Array.from(selectedLeads)
      
      toast({
        title: "✅ Leads Deletados",
        description: `${deletedLeadIds.length} lead(s) foram deletados com sucesso.`,
        className: 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-950 dark:to-emerald-950 dark:border-green-800',
      })

      // Notificar o componente pai sobre a deleção
      if (onLeadsDeleted) {
        onLeadsDeleted(deletedLeadIds)
      }

      // Limpar seleção
      setSelectedLeads(new Set())
      
    } catch (error) {
      console.error('Erro ao deletar leads:', error)
      toast({
        title: "❌ Erro ao Deletar",
        description: "Ocorreu um erro ao deletar os leads. Tente novamente.",
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }


  return (
    <div className="space-y-6">
      {/* Header com Estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="lista-detalhes-card-claro lista-detalhes-card-escuro rounded-lg p-2 sm:p-3 border">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
            <span className="text-xs sm:text-sm font-medium lista-detalhes-texto-claro dark:text-muted-foreground">Total</span>
          </div>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold lista-detalhes-texto-claro dark:text-foreground">
            {sortedLeads.length}
          </p>
        </div>
        <div className="lista-detalhes-card-claro lista-detalhes-card-escuro rounded-lg p-2 sm:p-3 border">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
            <span className="text-xs sm:text-sm font-medium lista-detalhes-texto-claro dark:text-muted-foreground">Com Telefone</span>
          </div>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold lista-detalhes-texto-claro dark:text-foreground">
            {sortedLeads.filter(lead => lead.phone).length}
          </p>
        </div>
        <div className="lista-detalhes-card-claro lista-detalhes-card-escuro rounded-lg p-2 sm:p-3 border">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Globe className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
            <span className="text-xs sm:text-sm font-medium lista-detalhes-texto-claro dark:text-muted-foreground">Com Website</span>
          </div>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold lista-detalhes-texto-claro dark:text-foreground">
            {sortedLeads.filter(lead => lead.website).length}
          </p>
        </div>
        <div className="lista-detalhes-card-claro lista-detalhes-card-escuro rounded-lg p-2 sm:p-3 border">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600" />
            <span className="text-xs sm:text-sm font-medium lista-detalhes-texto-claro dark:text-muted-foreground">4+ Estrelas</span>
          </div>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold lista-detalhes-texto-claro dark:text-foreground">
            {sortedLeads.filter(lead => lead.rating && lead.rating >= 4).length}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4 sm:p-6">
          <LeadFiltersPro
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            cityFilter={cityFilter}
            setCityFilter={setCityFilter}
            ratingFilter={ratingFilter}
            setRatingFilter={setRatingFilter}
            reviewsFilter={reviewsFilter}
            setReviewsFilter={setReviewsFilter}
            websiteFilter={websiteFilter}
            setWebsiteFilter={setWebsiteFilter}
            leadsPerPage={leadsPerPage}
            setLeadsPerPage={setLeadsPerPage}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            maxReviews={maxReviews}
            setMaxReviews={setMaxReviews}
            onFilterChange={resetPagination}
            onResetFilters={() => {
              setSearchTerm("")
              setCityFilter("")
              setRatingFilter("all")
              setReviewsFilter("all")
              setWebsiteFilter("all")
              setSortBy("relevance")
              setSortOrder("desc")
              setMaxReviews("none")
              setCurrentPage(1)
            }}
            totalLeads={leads.length}
            filteredCount={sortedLeads.length}
          />
        </CardContent>
      </Card>

      {/* Botão Selecionar Todos */}
      {paginatedLeads.length > 0 && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSelectAll}
            className="gerador-botao-selecionar-todos-claro gerador-botao-selecionar-todos-escuro border-2 font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5"
          >
            {paginatedLeads.every(lead => selectedLeads.has(lead.id || '')) ? 'Desmarcar Todos' : 'Selecionar Todos'}
          </Button>
        </div>
      )}

      {/* Ações em Lote */}
      {selectedLeads.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg"
        >
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            <span className="text-blue-800 dark:text-blue-200 font-medium text-sm sm:text-base">
              {selectedLeads.size} lead(s) selecionado(s)
            </span>
          </div>
          <div className="flex justify-end">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteSelected}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
                  <span className="hidden sm:inline">Deletando...</span>
                  <span className="sm:hidden">Deletando</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Deletar Selecionados</span>
                  <span className="sm:hidden">Deletar</span>
                </>
              )}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {paginatedLeads.map((lead, index) => (
          <LeadCard
            key={lead.id || index}
            lead={{
              ...lead,
              selected: selectedLeads.has(lead.id || '')
            }}
            index={index}
            onToggleSelection={() => toggleLeadSelection(lead.id || '')}
            showCheckbox={true}
          />
        ))}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-border/50">
          <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
            Mostrando {startIndex + 1}-{Math.min(endIndex, sortedLeads.length)} de {sortedLeads.length} leads
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="border-2 text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5"
            >
              Anterior
            </Button>
            <span className="flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-foreground bg-muted/50 rounded-lg">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="border-2 text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5"
            >
              Próxima
            </Button>
          </div>
        </div>
      )}

      {/* Mensagem quando não há leads */}
      {sortedLeads.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">Nenhum lead encontrado</h3>
          <p className="text-sm sm:text-base text-muted-foreground px-4">
            {searchTerm || cityFilter || ratingFilter !== "all" || reviewsFilter !== "all" || websiteFilter !== "all" || maxReviews !== "none"
              ? "Tente ajustar os filtros para encontrar mais leads."
              : "Esta lista ainda não possui leads."}
          </p>
        </div>
      )}
    </div>
  )
}