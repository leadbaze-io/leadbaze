import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { useToast } from "../hooks/use-toast"
import { LeadService } from "../lib/leadService"
import { Loader2, Search, MapPin, Save, Zap, Target, Users, CheckCircle } from "lucide-react"
import { Label } from "./ui/label"
import type { Lead, LeadList } from "../types"
import { motion, AnimatePresence } from "framer-motion"
import SuccessModal from './SuccessModal'
import { LeadCard } from './LeadCard'
import { LeadFiltersPro } from './LeadFiltersPro'
import { StatusIndicator } from './StatusIndicator'

const urlFormSchema = z.object({
  searchUrl: z
    .string()
    .url({ message: "Por favor, insira um link de pesquisa válido." })
    .min(1, { message: "O campo não pode estar vazio." }),
})

interface LeadGeneratorProProps {
  onLeadsGenerated?: (leads: Lead[]) => void
  onLeadsSaved?: () => void
  existingLists?: LeadList[]
}

export function LeadGeneratorPro({ onLeadsGenerated, onLeadsSaved, existingLists = [] }: LeadGeneratorProProps) {
  const [quantity, setQuantity] = useState("10")
  const [generatedLeads, setGeneratedLeads] = useState<Lead[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [showSaveOptions, setShowSaveOptions] = useState(false)
  const [extractionStatus, setExtractionStatus] = useState<'ready' | 'generating' | 'completed' | 'error'>('ready')
  const [saveMode, setSaveMode] = useState<'new' | 'existing'>('new')
  const [selectedListId, setSelectedListId] = useState("")
  const [newListName, setNewListName] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  
  // Estados para verificação de duplicatas
  const [duplicateLeads, setDuplicateLeads] = useState<Lead[]>([])
  const [newLeads, setNewLeads] = useState<Lead[]>([])
  const [showDuplicateInfo, setShowDuplicateInfo] = useState(false)
  
  // Estados para modal de sucesso
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successData, setSuccessData] = useState<{
    listName: string
    leadsCount: number
    isNewList: boolean
  } | null>(null)
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState("")
  const [cityFilter, setCityFilter] = useState("")
  const [ratingFilter, setRatingFilter] = useState("all")
  const [reviewsFilter, setReviewsFilter] = useState("all")
  const [websiteFilter, setWebsiteFilter] = useState("all")
  const [leadsPerPage, setLeadsPerPage] = useState("9")
  const [currentPage, setCurrentPage] = useState(1)
  
  // Novos filtros
  const [sortBy, setSortBy] = useState("relevance")
  const [sortOrder, setSortOrder] = useState("desc")
  const [maxReviews, setMaxReviews] = useState("none")
  
  const { toast } = useToast()

  const urlForm = useForm<z.infer<typeof urlFormSchema>>({
    resolver: zodResolver(urlFormSchema),
    defaultValues: {
      searchUrl: "",
    },
  })

  // Verificar se o formulário está preenchido para ativar o botão
  const isFormValid = urlForm.watch("searchUrl") && quantity

  // Filtrar leads
  const filteredLeads = generatedLeads.filter(lead => {
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

  // Ordenar leads
  const sortedLeads = [...filteredLeads].sort((a, b) => {
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

  // Paginação
  const leadsPerPageNum = parseInt(leadsPerPage)
  const totalPages = Math.ceil(sortedLeads.length / leadsPerPageNum)
  const startIndex = (currentPage - 1) * leadsPerPageNum
  const endIndex = startIndex + leadsPerPageNum
  const paginatedLeads = sortedLeads.slice(startIndex, endIndex)

  // Resetar página quando filtros mudam
  const resetPagination = () => setCurrentPage(1)

  const handleLeadGeneration = async (searchUrl: string, limit: number) => {
    setIsGenerating(true)
    setExtractionStatus('generating')
    setGeneratedLeads([])
    setShowSaveOptions(false)
    resetPagination()
    
    try {
      console.log('🚀 Iniciando geração de leads para:', searchUrl)
      const result = await LeadService.generateLeads(searchUrl, limit)

      // Verificar se está em modo demo
      if (result.demo_mode) {
        toast({
          title: "🔧 Modo Demonstração Ativado",
          description: "N8N indisponível. Usando dados de exemplo para demonstração.",
          variant: 'info',
        })
      }

      if (!result.success) {
        console.error('❌ Erro na resposta do serviço:', result.error)
        setExtractionStatus('error')
        toast({
          title: "❌ Erro na Extração",
          description: result.error || "Não foi possível extrair os leads.",
          variant: 'destructive',
        })
        return
      }

      if (result.leads.length === 0) {
        setExtractionStatus('error')
        toast({
          title: "🔍 Nenhum Lead Encontrado",
          description: "Sua busca não retornou resultados. Tente um termo ou URL diferente.",
          variant: 'warning',
        })
        return
      }

      // Adicionar propriedade selected a cada lead
      const leadsWithSelection = result.leads.map(lead => ({
        ...lead,
        selected: false
      }))

      setGeneratedLeads(leadsWithSelection)
      setExtractionStatus('completed')
      
      // Mostrar opções de salvar automaticamente
      setShowSaveOptions(true)
      
      toast({
        title: "🎉 Leads Extraídos com Sucesso!",
        description: `${result.leads.length} leads encontrados. Selecione os que deseja salvar.`,
        variant: 'success',
      })

      if (onLeadsGenerated) {
        onLeadsGenerated(result.leads)
      }

    } catch (error) {
      console.error('❌ Erro na geração de leads:', error)
      setExtractionStatus('error')
      toast({
        title: "❌ Erro na Extração",
        description: "Ocorreu um erro durante a extração dos leads. Tente novamente.",
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const toggleLeadSelection = (leadIndex: number) => {
    setGeneratedLeads(prev => 
      prev.map((lead, i) => 
        i === leadIndex ? { ...lead, selected: !lead.selected } : lead
      )
    )
    
    // Verificar duplicatas após mudança na seleção
    setTimeout(() => {
      if (saveMode === 'existing' && selectedListId) {
        const selectedLeads = getSelectedLeads()
        if (selectedLeads.length > 0) {
          const { newLeads: newLeadsToAdd, duplicateLeads: duplicates } = checkDuplicateLeads(selectedLeads, selectedListId)
          setNewLeads(newLeadsToAdd)
          setDuplicateLeads(duplicates)
          setShowDuplicateInfo(true)
        } else {
          setShowDuplicateInfo(false)
          setNewLeads([])
          setDuplicateLeads([])
        }
      }
    }, 100)
  }

  const toggleLeadSelectionByFilteredIndex = (filteredIndex: number) => {
    // Encontrar o lead correto na lista filtrada
    const filteredLead = paginatedLeads[filteredIndex]
    if (filteredLead) {
      // Encontrar o índice real na lista original
      const actualIndex = generatedLeads.findIndex(lead => 
        lead.name === filteredLead.name && 
        lead.phone === filteredLead.phone
      )
      if (actualIndex !== -1) {
        toggleLeadSelection(actualIndex)
      }
    }
  }

  const toggleSelectAll = () => {
    const allSelected = generatedLeads.every(lead => lead.selected)
    setGeneratedLeads(prev => 
      prev.map(lead => ({ ...lead, selected: !allSelected }))
    )
    
    // Verificar duplicatas após mudança na seleção
    setTimeout(() => {
      if (saveMode === 'existing' && selectedListId) {
        const selectedLeads = getSelectedLeads()
        if (selectedLeads.length > 0) {
          const { newLeads: newLeadsToAdd, duplicateLeads: duplicates } = checkDuplicateLeads(selectedLeads, selectedListId)
          setNewLeads(newLeadsToAdd)
          setDuplicateLeads(duplicates)
          setShowDuplicateInfo(true)
        } else {
          setShowDuplicateInfo(false)
          setNewLeads([])
          setDuplicateLeads([])
        }
      }
    }, 100)
  }

  const getSelectedLeads = () => generatedLeads.filter(lead => lead.selected)

  // Verificar leads duplicados
  const checkDuplicateLeads = (selectedLeads: Lead[], targetListId?: string): { newLeads: Lead[], duplicateLeads: Lead[] } => {
    if (saveMode === 'new') {
      // Para nova lista, não há duplicatas
      return { newLeads: selectedLeads, duplicateLeads: [] }
    }

    // Buscar leads existentes na lista selecionada
    const targetList = existingLists.find(list => list.id === targetListId)
    if (!targetList || !targetList.leads) {
      return { newLeads: selectedLeads, duplicateLeads: [] }
    }

    // Criar Set com telefones existentes (normalizados)
    const existingPhones = new Set(
      targetList.leads.map(lead => lead.phone?.replace(/\D/g, '')).filter(Boolean)
    )

    const newLeads: Lead[] = []
    const duplicateLeads: Lead[] = []

    selectedLeads.forEach(lead => {
      const normalizedPhone = lead.phone?.replace(/\D/g, '')
      
      if (normalizedPhone && existingPhones.has(normalizedPhone)) {
        duplicateLeads.push(lead)
      } else {
        newLeads.push(lead)
        if (normalizedPhone) {
          existingPhones.add(normalizedPhone)
        }
      }
    })

    return { newLeads, duplicateLeads }
  }

  const handleSaveLeads = async () => {
    const selectedLeads = getSelectedLeads()
    
    if (selectedLeads.length === 0) {
      toast({
        title: "⚠️ Nenhum Lead Selecionado",
        description: "Selecione pelo menos um lead para salvar.",
        variant: 'warning',
      })
      return
    }

    if (saveMode === 'new' && !newListName.trim()) {
      toast({
        title: "⚠️ Nome da Lista Obrigatório",
        description: "Digite um nome para a nova lista.",
        variant: 'warning',
      })
      return
    }

    if (saveMode === 'existing' && !selectedListId) {
      toast({
        title: "⚠️ Lista Não Selecionada",
        description: "Selecione uma lista para adicionar os leads.",
        variant: 'warning',
      })
      return
    }

    // Verificar duplicatas antes de salvar
    const { newLeads: leadsToSave, duplicateLeads: duplicates } = checkDuplicateLeads(selectedLeads, selectedListId)
    
    setNewLeads(leadsToSave)
    setDuplicateLeads(duplicates)
    setShowDuplicateInfo(true)

    // Se há duplicatas, mostrar informação e perguntar se quer continuar
    if (duplicates.length > 0) {
      const shouldContinue = window.confirm(
        `${leadsToSave.length} leads novos serão adicionados.\n${duplicates.length} leads duplicados serão ignorados.\n\nDeseja continuar?`
      )
      
      if (!shouldContinue) {
        setShowDuplicateInfo(false)
        return
      }
    }

    setIsSaving(true)

    try {
      if (saveMode === 'new') {
        await LeadService.saveLeadList(newListName, selectedLeads)
      } else {
        // Salvar apenas os leads não duplicados
        await LeadService.addLeadsToList(selectedListId, leadsToSave)
      }

      // Preparar dados para o modal de sucesso
      const finalListName = saveMode === 'new' ? newListName : 
        existingLists.find(list => list.id === selectedListId)?.name || 'Lista'
      
      setSuccessData({
        listName: finalListName,
        leadsCount: leadsToSave.length,
        isNewList: saveMode === 'new'
      })
      
      // Mostrar modal de sucesso
      setShowSuccessModal(true)
      
      // Limpar estados
      setShowSaveOptions(false)
      setShowDuplicateInfo(false)
      setGeneratedLeads([])
      setNewListName("")
      setSelectedListId("")
      setNewLeads([])
      setDuplicateLeads([])
    } catch (error) {
      console.error('❌ Erro ao salvar leads:', error)
      toast({
        title: "❌ Erro ao Salvar",
        description: "Não foi possível salvar os leads. Tente novamente.",
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const onUrlSubmit = (values: z.infer<typeof urlFormSchema>) => {
    setExtractionStatus('ready') // Reset status before starting
    handleLeadGeneration(values.searchUrl, parseInt(quantity))
  }

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false)
    setSuccessData(null)
  }


  const handleGoToDashboard = () => {
    // Emitir evento para o componente pai navegar para o dashboard
    if (onLeadsSaved) {
      onLeadsSaved()
    }
    // Fechar modal
    setShowSuccessModal(false)
    setSuccessData(null)
  }

  // Verificar duplicatas quando lista existente é selecionada
  const handleListSelection = (listId: string) => {
    setSelectedListId(listId)
    
    if (listId && generatedLeads.length > 0) {
      const selectedLeads = getSelectedLeads()
      if (selectedLeads.length > 0) {
        const { newLeads: newLeadsToAdd, duplicateLeads: duplicates } = checkDuplicateLeads(selectedLeads, listId)
        setNewLeads(newLeadsToAdd)
        setDuplicateLeads(duplicates)
        setShowDuplicateInfo(true)
      }
    } else {
      setShowDuplicateInfo(false)
      setNewLeads([])
      setDuplicateLeads([])
    }
  }


  return (
    <div className="min-h-screen gerador-bg-claro gerador-bg-escuro">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Gerador de Leads
            </h1>
            <p className="text-xl gerador-descricao-claro dark:text-muted-foreground max-w-2xl mx-auto">
              Extraia leads qualificados do Google Maps de forma rápida e eficiente
            </p>
          </motion.div>
        </div>

        {/* Formulário de Extração */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6 sm:mb-8"
        >
          <Card className="border-0 shadow-2xl gerador-card-claro gerador-card-escuro backdrop-blur-sm">
            <CardHeader className="text-center pb-4 sm:pb-6 px-4 sm:px-6">
              <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <Search className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <CardTitle className="text-xl sm:text-2xl font-bold gerador-titulo-claro dark:text-foreground">Extrair Leads do Google Maps</CardTitle>
              </div>
              <CardDescription className="text-sm sm:text-base lg:text-lg gerador-descricao-claro dark:text-muted-foreground">
                Cole o link de pesquisa do Google Maps e configure a quantidade de leads desejada
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
              <Form {...urlForm}>
                <form
                  onSubmit={urlForm.handleSubmit(onUrlSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={urlForm.control}
                    name="searchUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold flex items-center space-x-2 gerador-texto-claro dark:text-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>URL de Pesquisa do Google Maps</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://www.google.com/maps/search/..."
                            {...field}
                            disabled={isGenerating}
                            className="h-12 text-base border-2 gerador-input-claro gerador-input-escuro focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2 sm:space-y-3">
                      <Label className="text-sm sm:text-base font-semibold flex items-center space-x-2 gerador-texto-claro dark:text-foreground">
                        <Users className="w-4 h-4" />
                        <span>Quantidade de Leads</span>
                      </Label>
                      <Select onValueChange={setQuantity} defaultValue={quantity} disabled={isGenerating}>
                        <SelectTrigger className="h-10 sm:h-12 border-2 gerador-input-claro gerador-input-escuro focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm sm:text-base">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border border-border shadow-lg">
                          <SelectItem value="10">10 Leads</SelectItem>
                          <SelectItem value="20">20 Leads</SelectItem>
                          <SelectItem value="30">30 Leads</SelectItem>
                          <SelectItem value="40">40 Leads</SelectItem>
                          <SelectItem value="50">50 Leads</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2 sm:space-y-3">
                      <Label className="text-sm sm:text-base font-semibold flex items-center space-x-2 gerador-texto-claro dark:text-foreground">
                        <Zap className="w-4 h-4" />
                        <span>Status</span>
                      </Label>
                      <StatusIndicator 
                        status={extractionStatus} 
                        className="w-full"
                      />
                    </div>
                  </div>

                  <motion.div
                    initial={{ scale: 1 }}
                    animate={{ 
                      scale: isFormValid ? 1.02 : 1,
                      boxShadow: isFormValid ? "0 20px 40px rgba(59, 130, 246, 0.3)" : "0 4px 12px rgba(0, 0, 0, 0.1)"
                    }}
                    transition={{ duration: 0.3 }}
                    className="pt-4"
                  >
                    <Button
                      type="submit"
                      className={`w-full h-12 sm:h-14 transition-all duration-300 text-base sm:text-lg font-semibold rounded-lg sm:rounded-xl ${
                        isFormValid 
                          ? 'gerador-botao-claro gerador-botao-escuro shadow-lg hover:shadow-xl transform hover:-translate-y-1' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={isGenerating || !isFormValid}
                      size="lg"
                    >
                      {isGenerating ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center"
                        >
                          <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                          Extraindo leads...
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center"
                        >
                          <Search className="mr-3 h-5 w-5" />
                          {isFormValid ? '🚀 Iniciar Extração' : 'Preencha os campos acima'}
                        </motion.div>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Lista de Leads Gerados */}
        <AnimatePresence>
          {generatedLeads.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-8"
            >
              <Card className="border-0 shadow-2xl gerador-card-claro gerador-card-escuro backdrop-blur-sm">
                <CardHeader className="text-center pb-6">
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold gerador-titulo-claro dark:text-foreground">
                      Leads Encontrados ({filteredLeads.length})
                    </CardTitle>
                  </div>
                  <CardDescription className="text-lg gerador-descricao-claro dark:text-muted-foreground">
                    Selecione os leads que deseja salvar em sua lista
                  </CardDescription>
                  
                  {/* Botão Selecionar Todos */}
                  <div className="flex justify-center mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleSelectAll}
                      className="gerador-botao-selecionar-todos-claro gerador-botao-selecionar-todos-escuro border-2 font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                    >
                      {generatedLeads.every(lead => lead.selected) ? 'Desmarcar Todos' : 'Selecionar Todos'}
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="px-8">
                  {/* Filtros */}
                  <div className="gerador-filtros-claro gerador-filtros-escuro rounded-xl border border-border/50 mb-8 p-6">
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
                      totalLeads={generatedLeads.length}
                      filteredCount={sortedLeads.length}
                    />
                  </div>

                  {/* Grid de Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {paginatedLeads.map((lead, index) => (
                      <LeadCard
                        key={index}
                        lead={lead}
                        index={index}
                        onToggleSelection={toggleLeadSelectionByFilteredIndex}
                        showCheckbox={true}
                      />
                    ))}
                  </div>

                  {/* Paginação */}
                  {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t gerador-paginacao-claro gerador-paginacao-escuro">
                      <div className="text-xs sm:text-sm gerador-descricao-claro dark:text-muted-foreground text-center sm:text-left">
                        Mostrando {startIndex + 1}-{Math.min(endIndex, filteredLeads.length)} de {filteredLeads.length} leads
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="border-2 gerador-input-claro gerador-input-escuro text-xs sm:text-sm px-3 sm:px-4"
                        >
                          Anterior
                        </Button>
                        <span className="flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium gerador-texto-claro dark:text-foreground bg-muted/50 rounded-lg">
                          {currentPage} de {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="border-2 gerador-input-claro gerador-input-escuro text-xs sm:text-sm px-3 sm:px-4"
                        >
                          Próxima
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Opções de Salvamento */}
        <AnimatePresence>
          {generatedLeads.length > 0 && showSaveOptions && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mb-8"
            >
              <Card className="border-0 shadow-2xl gerador-card-claro gerador-card-escuro backdrop-blur-sm">
                <CardHeader className="text-center pb-6">
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                      <Save className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold gerador-titulo-claro dark:text-foreground">Salvar Leads Selecionados</CardTitle>
                  </div>
                  <CardDescription className="text-lg gerador-descricao-claro dark:text-muted-foreground">
                    {getSelectedLeads().length} leads selecionados para salvar
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="px-8 pb-8">
                  <div className="space-y-6">
                    {/* Opções de Salvamento */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <label className={`flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                          saveMode === 'new' 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                            : 'border-border hover:border-blue-300'
                        }`}>
                          <input
                            type="radio"
                            name="saveMode"
                            checked={saveMode === 'new'}
                            onChange={() => {
                              setSaveMode('new')
                              setShowDuplicateInfo(false)
                              setNewLeads([])
                              setDuplicateLeads([])
                            }}
                            className="w-4 h-4 text-blue-600"
                          />
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                              <Users className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-medium gerador-texto-claro dark:text-foreground">Criar nova lista</span>
                          </div>
                        </label>
                        
                        <label className={`flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                          saveMode === 'existing' 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                            : 'border-border hover:border-blue-300'
                        } ${existingLists.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          <input
                            type="radio"
                            name="saveMode"
                            checked={saveMode === 'existing'}
                            onChange={() => {
                              setSaveMode('existing')
                              setShowDuplicateInfo(false)
                              setNewLeads([])
                              setDuplicateLeads([])
                            }}
                            disabled={existingLists.length === 0}
                            className="w-4 h-4 text-blue-600"
                          />
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-md">
                              <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-medium gerador-texto-claro dark:text-foreground">Adicionar à lista existente</span>
                          </div>
                        </label>
                      </div>

                      {saveMode === 'new' && (
                        <div className="space-y-3">
                          <Label className="text-base font-semibold flex items-center space-x-2 gerador-texto-claro dark:text-foreground">
                            <Users className="w-4 h-4" />
                            <span>Nome da Nova Lista</span>
                          </Label>
                          <Input
                            placeholder="Ex: Restaurantes em São Paulo"
                            value={newListName}
                            onChange={(e) => setNewListName(e.target.value)}
                            className="h-12 text-base border-2 gerador-input-claro gerador-input-escuro focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>
                      )}

                      {saveMode === 'existing' && (
                        <div className="space-y-4">
                          <div className="space-y-3">
                            <Label className="text-base font-semibold flex items-center space-x-2 gerador-texto-claro dark:text-foreground">
                              <CheckCircle className="w-4 h-4" />
                              <span>Selecionar Lista Existente</span>
                            </Label>
                            <Select value={selectedListId} onValueChange={handleListSelection}>
                              <SelectTrigger className="h-12 border-2 gerador-input-claro gerador-input-escuro focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:border-blue-400">
                                <SelectValue placeholder="Selecione uma lista..." />
                              </SelectTrigger>
                              <SelectContent className="gerador-lista-select-claro gerador-lista-select-escuro border-2 shadow-xl max-h-60">
                                {existingLists.map((list) => (
                                  <SelectItem 
                                    key={list.id} 
                                    value={list.id}
                                    className="gerador-lista-item-claro gerador-lista-item-escuro hover:gerador-lista-item-hover-claro hover:gerador-lista-item-hover-escuro transition-all duration-200 cursor-pointer"
                                  >
                                    <div className="flex items-center justify-between w-full">
                                      <span className="font-medium">{list.name}</span>
                                      <span className="text-sm opacity-70 ml-2">({list.total_leads} leads)</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Feedback de Duplicatas */}
                          {showDuplicateInfo && selectedListId && (
                            <div className="space-y-3">
                              {newLeads.length > 0 && (
                                <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-xl">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <span className="text-green-800 dark:text-green-200 font-medium">
                                      ✅ {newLeads.length} leads novos serão adicionados
                                    </span>
                                  </div>
                                </div>
                              )}
                              
                              {duplicateLeads.length > 0 && (
                                <div className="gerador-aviso-duplicados-claro gerador-aviso-duplicados-escuro p-4 border-2 rounded-xl shadow-sm">
                                  <div className="flex items-center space-x-3 mb-3">
                                    <div className="w-3 h-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full shadow-sm"></div>
                                    <span className="gerador-aviso-titulo-claro gerador-aviso-titulo-escuro font-medium">
                                      ⚠️ {duplicateLeads.length} leads duplicados serão ignorados
                                    </span>
                                  </div>
                                  <div className="gerador-aviso-texto-claro gerador-aviso-texto-escuro text-sm">
                                    <p className="font-medium mb-2">Leads duplicados encontrados:</p>
                                    <div className="space-y-1">
                                      {duplicateLeads.slice(0, 3).map((lead, index) => (
                                        <div key={index} className="flex items-center space-x-2">
                                          <span>• {lead.name}</span>
                                          {lead.phone && <span className="gerador-aviso-phone-claro gerador-aviso-phone-escuro">({lead.phone})</span>}
                                        </div>
                                      ))}
                                      {duplicateLeads.length > 3 && (
                                        <span className="gerador-aviso-phone-claro gerador-aviso-phone-escuro">
                                          ... e mais {duplicateLeads.length - 3} leads
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                      <motion.div
                        initial={{ scale: 1 }}
                        animate={{ 
                          scale: getSelectedLeads().length > 0 ? 1.02 : 1,
                          boxShadow: getSelectedLeads().length > 0 ? "0 8px 16px rgba(34, 197, 94, 0.2)" : "0 2px 8px rgba(0, 0, 0, 0.1)"
                        }}
                        transition={{ duration: 0.3 }}
                        className="flex-1"
                      >
                        <Button
                          onClick={handleSaveLeads}
                          disabled={isSaving || getSelectedLeads().length === 0}
                          className={`w-full h-11 transition-all duration-300 text-base font-semibold rounded-lg ${
                            getSelectedLeads().length > 0 
                              ? 'gerador-botao-claro gerador-botao-escuro shadow-md hover:shadow-lg transform hover:-translate-y-0.5 hover:scale-102 active:scale-98' 
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                          size="default"
                        >
                          {isSaving ? (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="flex items-center"
                            >
                              <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                              Salvando...
                            </motion.div>
                          ) : (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="flex items-center"
                            >
                              <motion.div
                                initial={{ scale: 1 }}
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                              >
                                <Save className="mr-2 h-4 w-4" />
                              </motion.div>
                              {getSelectedLeads().length > 0 ? `Salvar ${getSelectedLeads().length} leads` : 'Selecione leads para salvar'}
                            </motion.div>
                          )}
                        </Button>
                      </motion.div>
                      
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowSaveOptions(false)
                          setGeneratedLeads([])
                        }}
                        className="h-11 border-2 hover:bg-muted/50 text-base font-semibold rounded-lg"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de Sucesso */}
        {successData && (
          <SuccessModal
            isOpen={showSuccessModal}
            onClose={handleCloseSuccessModal}
            onGoToDashboard={handleGoToDashboard}
            listName={successData.listName}
            leadsCount={successData.leadsCount}
            isNewList={successData.isNewList}
          />
        )}
      </div>
    </div>
  )
}