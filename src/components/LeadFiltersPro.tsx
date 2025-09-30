import { useState } from "react"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Button } from "./ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { Badge } from "./ui/badge"
import { 
  Search, 
  Filter, 
  Star, 
  Users, 
  Globe, 
  MapPin, 
  ChevronDown,
  RotateCcw,
  SlidersHorizontal,
  TrendingUp,
  TrendingDown,
  Award,
  Phone
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface LeadFiltersProProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
  cityFilter: string
  setCityFilter: (value: string) => void
  ratingFilter: string
  setRatingFilter: (value: string) => void
  reviewsFilter: string
  setReviewsFilter: (value: string) => void
  websiteFilter: string
  setWebsiteFilter: (value: string) => void
  phoneFilter: string
  setPhoneFilter: (value: string) => void
  leadsPerPage: string
  setLeadsPerPage: (value: string) => void
  sortBy: string
  setSortBy: (value: string) => void
  sortOrder: string
  setSortOrder: (value: string) => void
  maxReviews: string
  setMaxReviews: (value: string) => void
  onFilterChange?: () => void
  // Props para o botão Selecionar Todos
  showSelectAllButton?: boolean
  onSelectAll?: () => void
  allSelected?: boolean
  selectedCount?: number
  onResetFilters?: () => void
  className?: string
  totalLeads?: number
  filteredCount?: number
}

export function LeadFiltersPro({
  searchTerm,
  setSearchTerm,
  cityFilter,
  setCityFilter,
  ratingFilter,
  setRatingFilter,
  reviewsFilter,
  setReviewsFilter,
  websiteFilter,
  setWebsiteFilter,
  phoneFilter,
  setPhoneFilter,
  leadsPerPage,
  setLeadsPerPage,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  maxReviews,
  setMaxReviews,
  onFilterChange,
  onResetFilters,
  className = "",
  totalLeads = 0,
  filteredCount = 0,
  showSelectAllButton = false,
  onSelectAll,
  allSelected = false,
  selectedCount
}: LeadFiltersProProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleFilterChange = (setter: (value: string) => void, value: string) => {
    setter(value)
    if (onFilterChange) {
      onFilterChange()
    }
  }

  const handleResetFilters = () => {
    setSearchTerm("")
    setCityFilter("")
    setRatingFilter("all")
    setReviewsFilter("all")
    setWebsiteFilter("all")
    setPhoneFilter("all")
    setSortBy("relevance")
    setSortOrder("desc")
    setMaxReviews("none")
    
    if (onResetFilters) {
      onResetFilters()
    }
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (searchTerm) count++
    if (cityFilter) count++
    if (ratingFilter !== "all") count++
    if (reviewsFilter !== "all") count++
    if (websiteFilter !== "all") count++
    if (phoneFilter !== "all") count++
    if (sortBy !== "relevance") count++
    if (sortOrder !== "desc") count++
    if (maxReviews && maxReviews !== "none") count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
            <SlidersHorizontal className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white">
              Filtros e Ordenação
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {filteredCount > 0 ? `${filteredCount} de ${totalLeads} leads` : `${totalLeads} leads encontrados`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 shadow-md">
              {activeFiltersCount} filtro{activeFiltersCount > 1 ? 's' : ''} ativo{activeFiltersCount > 1 ? 's' : ''}
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetFilters}
            className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 border-gray-300 dark:border-gray-600 hover:border-red-400 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Limpar Filtros
          </Button>
        </div>
      </div>

      {/* Filtros Principais */}
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Busca */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
              <Search className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
              Buscar
            </Label>
            <Input
              placeholder="Nome, endereço, telefone..."
              value={searchTerm}
              onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)}
              className="h-11 text-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200"
            />
          </div>

          {/* Cidade */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
              Cidade
            </Label>
            <Input
              placeholder="Filtrar por cidade..."
              value={cityFilter}
              onChange={(e) => handleFilterChange(setCityFilter, e.target.value)}
              className="h-11 text-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-green-400 dark:hover:border-green-500 transition-all duration-200"
            />
          </div>

          {/* Avaliação Mínima */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
              <Star className="w-4 h-4 mr-2 text-yellow-600 dark:text-yellow-400" />
              Avaliação Mínima
            </Label>
            <Select 
              value={ratingFilter} 
              onValueChange={(value) => handleFilterChange(setRatingFilter, value)}
            >
              <SelectTrigger className="h-11 text-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-yellow-400 dark:hover:border-yellow-500 transition-all duration-200">
                <SelectValue placeholder="Selecionar avaliação" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl">
                <SelectItem value="all">Todas as avaliações</SelectItem>
                <SelectItem value="4.5">4.5+ estrelas</SelectItem>
                <SelectItem value="4">4+ estrelas</SelectItem>
                <SelectItem value="3.5">3.5+ estrelas</SelectItem>
                <SelectItem value="3">3+ estrelas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Website */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
              <Globe className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" />
              Website
            </Label>
            <Select 
              value={websiteFilter} 
              onValueChange={(value) => handleFilterChange(setWebsiteFilter, value)}
            >
              <SelectTrigger className="h-11 text-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-200">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="with">Com website</SelectItem>
                <SelectItem value="without">Sem website</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Botão Filtros Avançados */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center space-x-2 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <Filter className="w-4 h-4" />
          <span>Filtros Avançados</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      {/* Botão Selecionar Todos - embaixo dos Filtros Avançados */}
      {showSelectAllButton && onSelectAll && (
        <div className="flex flex-col items-center space-y-3 mt-4">
          <Button
            size="sm"
            onClick={onSelectAll}
            className="inline-flex items-center justify-center whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-xs gerador-botao-selecionar-todos-claro gerador-botao-selecionar-todos-escuro border-2 font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
          >
            {allSelected ? 'Desmarcar Todos' : 'Selecionar Todos'}
          </Button>
          
          {/* Contador de leads selecionados */}
          {selectedCount !== undefined && (
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {selectedCount} leads selecionados para salvar
              </p>
            </div>
          )}
        </div>
      )}

      {/* Filtros Avançados */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="gerador-filtros-avancados-claro gerador-filtros-avancados-escuro rounded-xl sm:rounded-2xl border-2 p-4 sm:p-6 shadow-lg relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {/* Avaliações Mínimas */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                    <Users className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                    Avaliações Mínimas
                  </Label>
                  <Select 
                    value={reviewsFilter} 
                    onValueChange={(value) => handleFilterChange(setReviewsFilter, value)}
                  >
                    <SelectTrigger className="h-11 text-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200">
                      <SelectValue placeholder="Selecionar" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl">
                      <SelectItem value="all">Todas as avaliações</SelectItem>
                      <SelectItem value="10">10+ avaliações</SelectItem>
                      <SelectItem value="25">25+ avaliações</SelectItem>
                      <SelectItem value="50">50+ avaliações</SelectItem>
                      <SelectItem value="100">100+ avaliações</SelectItem>
                      <SelectItem value="250">250+ avaliações</SelectItem>
                      <SelectItem value="500">500+ avaliações</SelectItem>
                      <SelectItem value="1000">1000+ avaliações</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Avaliações Máximas */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                    <TrendingDown className="w-4 h-4 mr-2 text-red-600 dark:text-red-400" />
                    Até X Avaliações
                  </Label>
                  <Select 
                    value={maxReviews} 
                    onValueChange={(value) => handleFilterChange(setMaxReviews, value)}
                  >
                    <SelectTrigger className="h-11 text-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-red-400 dark:hover:border-red-500 transition-all duration-200">
                      <SelectValue placeholder="Sem limite" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl">
                      <SelectItem value="none">Sem limite</SelectItem>
                      <SelectItem value="10">Até 10 avaliações</SelectItem>
                      <SelectItem value="25">Até 25 avaliações</SelectItem>
                      <SelectItem value="50">Até 50 avaliações</SelectItem>
                      <SelectItem value="100">Até 100 avaliações</SelectItem>
                      <SelectItem value="250">Até 250 avaliações</SelectItem>
                      <SelectItem value="500">Até 500 avaliações</SelectItem>
                      <SelectItem value="1000">Até 1.000 avaliações</SelectItem>
                      <SelectItem value="2000">Até 2.000 avaliações</SelectItem>
                      <SelectItem value="5000">Até 5.000 avaliações</SelectItem>
                      <SelectItem value="10000">Até 10.000 avaliações</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Ordenar Por */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                    <Award className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
                    Ordenar Por
                  </Label>
                  <Select 
                    value={sortBy} 
                    onValueChange={(value) => handleFilterChange(setSortBy, value)}
                  >
                    <SelectTrigger className="h-11 text-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-green-400 dark:hover:border-green-500 transition-all duration-200">
                      <SelectValue placeholder="Selecionar" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl">
                      <SelectItem value="relevance">Relevância</SelectItem>
                      <SelectItem value="rating">Avaliação</SelectItem>
                      <SelectItem value="reviews">Número de avaliações</SelectItem>
                      <SelectItem value="name">Nome (A-Z)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Ordem */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-orange-600 dark:text-orange-400" />
                    Ordem
                  </Label>
                  <Select 
                    value={sortOrder} 
                    onValueChange={(value) => handleFilterChange(setSortOrder, value)}
                  >
                    <SelectTrigger className="h-11 text-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-orange-400 dark:hover:border-orange-500 transition-all duration-200">
                      <SelectValue placeholder="Selecionar" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl">
                      <SelectItem value="desc">Maior para Menor</SelectItem>
                      <SelectItem value="asc">Menor para Maior</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tipo de Telefone */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-teal-600 dark:text-teal-400" />
                    Tipo de Telefone
                  </Label>
                  <Select 
                    value={phoneFilter} 
                    onValueChange={(value) => handleFilterChange(setPhoneFilter, value)}
                  >
                    <SelectTrigger className="h-11 text-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-teal-400 dark:hover:border-teal-500 transition-all duration-200">
                      <SelectValue placeholder="Todos os telefones" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl">
                      <SelectItem value="all">Todos os telefones</SelectItem>
                      <SelectItem value="mobile">Apenas celulares</SelectItem>
                      <SelectItem value="landline">Apenas fixos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Leads por Página */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                    <Users className="w-4 h-4 mr-2 text-indigo-600 dark:text-indigo-400" />
                    Selecionar quantidade de Leads
                  </Label>
                  <Select 
                    value={leadsPerPage} 
                    onValueChange={(value) => handleFilterChange(setLeadsPerPage, value)}
                  >
                    <SelectTrigger className="h-11 text-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all duration-200">
                      <SelectValue placeholder="Escolher quantidade..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl">
                      <SelectItem value="9">9 leads</SelectItem>
                      <SelectItem value="18">18 leads</SelectItem>
                      <SelectItem value="27">27 leads</SelectItem>
                      <SelectItem value="36">36 leads</SelectItem>
                      <SelectItem value="45">45 leads</SelectItem>
                      <SelectItem value="50">50 leads</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              </div>
              
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}