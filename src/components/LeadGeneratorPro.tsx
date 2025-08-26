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
import { Loader2, Search, MapPin, Star, Phone, Globe, Save, Eye } from "lucide-react"
import { Label } from "./ui/label"
import { Badge } from "./ui/badge"
import type { Lead, LeadList } from "../types"
import { motion, AnimatePresence } from "framer-motion"

const urlFormSchema = z.object({
  searchUrl: z
    .string()
    .url({ message: "Por favor, insira um link de pesquisa válido." })
    .min(1, { message: "O campo não pode estar vazio." }),
})

interface LeadGeneratorProProps {
  onLeadsGenerated?: (leads: Lead[]) => void
  existingLists?: LeadList[]
}

export function LeadGeneratorPro({ onLeadsGenerated, existingLists = [] }: LeadGeneratorProProps) {
  const [quantity, setQuantity] = useState("10")
  const [generatedLeads, setGeneratedLeads] = useState<Lead[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [showSaveOptions, setShowSaveOptions] = useState(false)
  const [saveMode, setSaveMode] = useState<'new' | 'existing'>('new')
  const [selectedListId, setSelectedListId] = useState("")
  const [newListName, setNewListName] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  
  // Estados para verificação de duplicatas
  const [duplicateLeads, setDuplicateLeads] = useState<Lead[]>([])
  const [newLeads, setNewLeads] = useState<Lead[]>([])
  const [showDuplicateInfo, setShowDuplicateInfo] = useState(false)
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState("")
  const [cityFilter, setCityFilter] = useState("")
  const [ratingFilter, setRatingFilter] = useState("all")
  const [reviewsFilter, setReviewsFilter] = useState("all")
  const [websiteFilter, setWebsiteFilter] = useState("all")
  const [leadsPerPage, setLeadsPerPage] = useState("9")
  const [currentPage, setCurrentPage] = useState(1)
  
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

  // Paginação
  const leadsPerPageNum = parseInt(leadsPerPage)
  const totalPages = Math.ceil(filteredLeads.length / leadsPerPageNum)
  const startIndex = (currentPage - 1) * leadsPerPageNum
  const endIndex = startIndex + leadsPerPageNum
  const paginatedLeads = filteredLeads.slice(startIndex, endIndex)

  // Resetar página quando filtros mudam
  const resetPagination = () => setCurrentPage(1)

  const handleLeadGeneration = async (searchUrl: string, limit: number) => {
    setIsGenerating(true)
    setGeneratedLeads([])
    setShowSaveOptions(false)
    resetPagination()
    
    try {
      console.log('🚀 Iniciando geração de leads para:', searchUrl)
      const result = await LeadService.generateLeads(searchUrl, limit)

      // Verificar se está em modo demo
      if (result.demo_mode) {
        toast({
          title: "Modo Demonstração Ativado",
          description: "N8N indisponível. Usando dados de exemplo para demonstração.",
        })
      }

      if (!result.success) {
        console.error('❌ Erro na resposta do serviço:', result.error)
        toast({
          title: "Erro na Extração",
          description: result.error || "Não foi possível extrair os leads.",
          variant: "destructive",
        })
        return
      }

      if (result.leads.length === 0) {
        toast({
          title: "Nenhum lead encontrado",
          description: "Sua busca não retornou resultados. Tente um termo ou URL diferente.",
          variant: "destructive",
        })
        return
      }

      // Adicionar propriedade selected a cada lead
      const leadsWithSelection = result.leads.map(lead => ({
        ...lead,
        selected: false
      }))

      setGeneratedLeads(leadsWithSelection)
      
      // Mostrar opções de salvar automaticamente
      setShowSaveOptions(true)
      
      toast({
        title: "Leads Extraídos com Sucesso!",
        description: `${result.leads.length} leads encontrados. Selecione os que deseja salvar.`,
      })

      if (onLeadsGenerated) {
        onLeadsGenerated(result.leads)
      }

    } catch (error) {
      console.error('❌ Erro na geração de leads:', error)
      toast({
        title: "Erro na Extração",
        description: "Ocorreu um erro durante a extração dos leads. Tente novamente.",
        variant: "destructive",
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
    const actualIndex = startIndex + filteredIndex
    if (actualIndex < generatedLeads.length) {
      toggleLeadSelection(actualIndex)
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
        title: "Nenhum lead selecionado",
        description: "Selecione pelo menos um lead para salvar.",
        variant: "destructive",
      })
      return
    }

    if (saveMode === 'new' && !newListName.trim()) {
      toast({
        title: "Nome da lista obrigatório",
        description: "Digite um nome para a nova lista.",
        variant: "destructive",
      })
      return
    }

    if (saveMode === 'existing' && !selectedListId) {
      toast({
        title: "Lista não selecionada",
        description: "Selecione uma lista para adicionar os leads.",
        variant: "destructive",
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

      // Mostrar feedback baseado no resultado
      if (duplicates.length > 0) {
        toast({
          title: "Leads Salvos com Sucesso!",
          description: `${leadsToSave.length} leads novos adicionados. ${duplicates.length} leads duplicados ignorados.`,
        })
      } else {
        toast({
          title: "Leads Salvos com Sucesso!",
          description: `${selectedLeads.length} leads foram salvos na lista.`,
        })
      }
      
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
        title: "Erro ao Salvar",
        description: "Não foi possível salvar os leads. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const onUrlSubmit = (values: z.infer<typeof urlFormSchema>) => {
    handleLeadGeneration(values.searchUrl, parseInt(quantity))
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

  const renderStars = (rating?: number) => {
    if (!rating) return null
    
    return (
      <div className="flex items-center space-x-1">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${
              i < Math.floor(rating) 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
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
        <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full">
          <span className="text-xs font-semibold text-blue-700">{reviewsCount}</span>
        </div>
        <span className="text-xs text-gray-600">Avaliações</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Formulário de Extração */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Extrair Leads do Google Maps</span>
          </CardTitle>
          <CardDescription>
            Cole o link de pesquisa do Google Maps e extraia leads qualificados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...urlForm}>
            <form
              onSubmit={urlForm.handleSubmit(onUrlSubmit)}
              className="flex flex-col space-y-4"
            >
              <FormField
                control={urlForm.control}
                name="searchUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL de Pesquisa do Google Maps</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Cole aqui o link de pesquisa do Google Maps..."
                        {...field}
                        disabled={isGenerating}
                        className="text-base"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-2">
                <Label>Quantidade de Leads</Label>
                <Select onValueChange={setQuantity} defaultValue={quantity} disabled={isGenerating}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="10">10 Leads</SelectItem>
                    <SelectItem value="20">20 Leads</SelectItem>
                    <SelectItem value="30">30 Leads</SelectItem>
                    <SelectItem value="40">40 Leads</SelectItem>
                    <SelectItem value="50">50 Leads</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <motion.div
                initial={{ scale: 1 }}
                animate={{ 
                  scale: isFormValid ? 1.02 : 1,
                  boxShadow: isFormValid ? "0 10px 25px rgba(59, 130, 246, 0.3)" : "0 1px 3px rgba(0, 0, 0, 0.1)"
                }}
                transition={{ duration: 0.3 }}
              >
                <Button
                  type="submit"
                  className={`w-full transition-all duration-300 ${
                    isFormValid 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1' 
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
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Extraindo leads...
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center"
                    >
                      <Search className="mr-2 h-4 w-4" />
                      {isFormValid ? '🚀 Iniciar Extração' : 'Preencha os campos acima'}
                    </motion.div>
                  )}
                </Button>
              </motion.div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Lista de Leads Gerados */}
      <AnimatePresence>
        {generatedLeads.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="w-5 h-5" />
                      <span>Leads Encontrados ({filteredLeads.length})</span>
                    </CardTitle>
                    <CardDescription className="flex items-center space-x-2">
                      <span>Selecione os leads que deseja salvar</span>
                      {!showSaveOptions && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          💾 Opções de salvar disponíveis
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleSelectAll}
                      className="text-xs"
                    >
                      {generatedLeads.every(lead => lead.selected) ? 'Desmarcar Todos' : 'Selecionar Todos'}
                    </Button>
                    <Button
                      onClick={() => setShowSaveOptions(!showSaveOptions)}
                      size="sm"
                      className={showSaveOptions ? "bg-gray-600 hover:bg-gray-700" : "bg-green-600 hover:bg-green-700"}
                    >
                      <Save className="w-4 h-4 mr-1" />
                      {showSaveOptions ? 'Ocultar Opções' : 'Salvar Leads'}
                    </Button>
                  </div>
                </div>

                {/* Filtros */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
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
                  
                                     <div>
                     <Label className="text-xs font-medium text-gray-700">Leads por Página</Label>
                     <Select 
                       value={leadsPerPage} 
                       onValueChange={(value) => {
                         setLeadsPerPage(value)
                         setCurrentPage(1)
                       }}
                     >
                       <SelectTrigger className="h-8 text-sm">
                         <SelectValue />
                       </SelectTrigger>
                       <SelectContent className="bg-white border border-gray-200 shadow-lg">
                         <SelectItem value="9">9 leads</SelectItem>
                         <SelectItem value="18">18 leads</SelectItem>
                         <SelectItem value="27">27 leads</SelectItem>
                         <SelectItem value="36">36 leads</SelectItem>
                         <SelectItem value="45">45 leads</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedLeads.map((lead, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-xl hover:-translate-y-1 border-2 rounded-lg p-4 ${
                        lead.selected 
                          ? 'border-blue-500 bg-blue-50 shadow-lg' 
                          : 'border-gray-200 hover:border-blue-300 bg-white'
                      }`}
                      onClick={() => toggleLeadSelectionByFilteredIndex(index)}
                    >
                      {/* Header do Card */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <input
                            type="checkbox"
                            checked={lead.selected}
                            onChange={() => toggleLeadSelectionByFilteredIndex(index)}
                            onClick={(e) => e.stopPropagation()}
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
                    </motion.div>
                  ))}
                </div>

                {/* Paginação */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      Mostrando {startIndex + 1}-{Math.min(endIndex, filteredLeads.length)} de {filteredLeads.length} leads
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        Anterior
                      </Button>
                      <span className="flex items-center px-3 text-sm">
                        Página {currentPage} de {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Salvar Leads Selecionados</CardTitle>
                <CardDescription>
                  {getSelectedLeads().length} leads selecionados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2">
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
                      />
                      <span>Criar nova lista</span>
                    </label>
                    <label className="flex items-center space-x-2">
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
                      />
                      <span>Adicionar à lista existente</span>
                    </label>
                  </div>

                  {saveMode === 'new' && (
                    <Input
                      placeholder="Nome da nova lista"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                    />
                  )}

                  {saveMode === 'existing' && (
                    <div className="space-y-3">
                      <Select value={selectedListId} onValueChange={handleListSelection}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma lista..." />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200 shadow-lg">
                          {existingLists.map((list) => (
                            <SelectItem key={list.id} value={list.id}>
                              {list.name} ({list.total_leads} leads)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Feedback de Duplicatas */}
                      {showDuplicateInfo && selectedListId && (
                        <div className="space-y-2">
                          {newLeads.length > 0 && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-green-800 text-sm font-medium">
                                  ✅ {newLeads.length} leads novos serão adicionados
                                </span>
                              </div>
                            </div>
                          )}
                          
                          {duplicateLeads.length > 0 && (
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                <span className="text-yellow-800 text-sm font-medium">
                                  ⚠️ {duplicateLeads.length} leads duplicados serão ignorados
                                </span>
                              </div>
                              <div className="mt-2 text-xs text-yellow-700">
                                <p>Leads duplicados encontrados:</p>
                                <div className="mt-1 space-y-1">
                                  {duplicateLeads.slice(0, 3).map((lead, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                      <span>• {lead.name}</span>
                                      {lead.phone && <span className="text-yellow-600">({lead.phone})</span>}
                                    </div>
                                  ))}
                                  {duplicateLeads.length > 3 && (
                                    <span className="text-yellow-600">
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

                <div className="flex space-x-3">
                  <motion.div
                    initial={{ scale: 1 }}
                    animate={{ 
                      scale: getSelectedLeads().length > 0 ? 1.02 : 1,
                      boxShadow: getSelectedLeads().length > 0 ? "0 10px 25px rgba(34, 197, 94, 0.3)" : "0 1px 3px rgba(0, 0, 0, 0.1)"
                    }}
                    transition={{ duration: 0.3 }}
                    className="flex-1"
                  >
                    <Button
                      onClick={handleSaveLeads}
                      disabled={isSaving || getSelectedLeads().length === 0}
                      className={`w-full transition-all duration-300 ${
                        getSelectedLeads().length > 0 
                          ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      size="lg"
                    >
                      {isSaving ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center"
                        >
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Salvando...
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center"
                        >
                          <Save className="mr-2 h-4 w-4" />
                          {getSelectedLeads().length > 0 ? `💾 Salvar ${getSelectedLeads().length} leads` : 'Selecione leads para salvar'}
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
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}