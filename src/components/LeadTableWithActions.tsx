import { useState, useMemo } from 'react'
import { Trash2, Star, Phone, Globe, Users, Check, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Lead } from '../types'
import { Button } from './ui/button'
import { useToast } from '../hooks/use-toast'
import { Card, CardContent } from './ui/card'
import { LeadCard } from './LeadCard'
import { LeadFilters } from './LeadFilters'

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="lista-detalhes-card-claro lista-detalhes-card-escuro rounded-lg p-3 border">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium lista-detalhes-texto-claro dark:text-muted-foreground">Total</span>
          </div>
          <p className="text-2xl font-bold lista-detalhes-texto-claro dark:text-foreground">
            {filteredLeads.length}
          </p>
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

      {/* Filtros */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <LeadFilters
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
            onFilterChange={resetPagination}
          />
        </CardContent>
      </Card>

      {/* Ações em Lote */}
      {selectedLeads.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg"
        >
          <div className="flex items-center space-x-3">
            <Check className="w-5 h-5 text-blue-600" />
            <span className="text-blue-800 dark:text-blue-200 font-medium">
              {selectedLeads.size} lead(s) selecionado(s)
            </span>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedLeads(new Set())}
              className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900"
            >
              Desmarcar Todos
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteSelected}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deletando...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Deletar Selecionados
                </>
              )}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
        <div className="flex items-center justify-between pt-6 border-t border-border/50">
          <div className="text-sm text-muted-foreground">
            Mostrando {startIndex + 1}-{Math.min(endIndex, filteredLeads.length)} de {filteredLeads.length} leads
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="border-2"
            >
              Anterior
            </Button>
            <span className="flex items-center px-4 py-2 text-sm font-medium text-foreground bg-muted/50 rounded-lg">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="border-2"
            >
              Próxima
            </Button>
          </div>
        </div>
      )}

      {/* Mensagem quando não há leads */}
      {filteredLeads.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum lead encontrado</h3>
          <p className="text-muted-foreground">
            {searchTerm || cityFilter || ratingFilter !== "all" || reviewsFilter !== "all" || websiteFilter !== "all"
              ? "Tente ajustar os filtros para encontrar mais leads."
              : "Esta lista ainda não possui leads."}
          </p>
        </div>
      )}
    </div>
  )
}