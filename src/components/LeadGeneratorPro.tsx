import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import '../styles/gerador-leads.css'
import { useSubscription } from "../hooks/useSubscription"
import { supabase } from "../lib/supabaseClient"
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
import '../styles/toast-modern.css'
import { Loader2, Search, MapPin, Save, Zap, Target, Users, CheckCircle, Info } from "lucide-react"
import { Label } from "./ui/label"
import type { Lead, LeadList } from "../types"
import { motion, AnimatePresence } from "framer-motion"
import SuccessModal from './SuccessModal'
import { LeadCard } from './LeadCard'
import { LeadFiltersPro } from './LeadFiltersPro'
import { StatusIndicator } from './StatusIndicator'
import { LeadsControlGuard } from './LeadsControlGuard'
import { SimpleBonusLeadsAlert } from './SimpleBonusLeadsAlert'
import { useProfileCheck } from '../hooks/useProfileCheck'
import { useTheme } from '../contexts/ThemeContext'
import { useSaveLeadList } from '../hooks/useLeadLists'
import { Checkbox } from './ui/checkbox'
import { Upload } from 'lucide-react'

const searchFormSchema = z.object({
  businessType: z
    .string()
    .min(1, { message: "Por favor, insira o tipo de estabelecimento." }),
  location: z
    .string()
    .min(1, { message: "Por favor, insira a localidade." }),
  quantity: z.string().min(1, { message: "Selecione uma quantidade." }),
})

interface LeadGeneratorProProps {
  onLeadsGenerated?: (leads: Lead[]) => void
  onLeadsSaved?: () => void
  existingLists?: LeadList[]
}

export function LeadGeneratorPro({ onLeadsGenerated, onLeadsSaved, existingLists = [] }: LeadGeneratorProProps) {
  const { subscription } = useSubscription()
  const { isDark } = useTheme()

  // Função para detectar se um telefone é celular ou fixo
  const isMobilePhone = (phone: string): boolean => {
    if (!phone) return false

    // Remove todos os caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '')

    // Telefones celulares brasileiros geralmente começam com 9 (após o DDD)
    // Padrão: (XX) 9XXXX-XXXX ou (XX) 9XXXXXXXX
    if (cleanPhone.length === 11) {
      // Verifica se o 3º dígito (após DDD) é 9
      return cleanPhone.charAt(2) === '9'
    }

    // Telefones fixos brasileiros geralmente começam com 2, 3, 4 ou 5 (após o DDD)
    // Padrão: (XX) 2XXX-XXXX ou (XX) 3XXX-XXXX, etc.
    if (cleanPhone.length === 10) {
      const thirdDigit = cleanPhone.charAt(2)
      return ['2', '3', '4', '5'].includes(thirdDigit)
    }

    return false
  }

  const [quantity, setQuantity] = useState("10")
  const [generatedLeads, setGeneratedLeads] = useState<Lead[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [showSaveOptions, setShowSaveOptions] = useState(false)
  const [extractionStatus, setExtractionStatus] = useState<'ready' | 'generating' | 'completed' | 'error'>('ready')
  const [saveMode, setSaveMode] = useState<'new' | 'existing'>('new')
  const [selectedListId, setSelectedListId] = useState("")
  const [newListName, setNewListName] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [showQuantityAdjustment, setShowQuantityAdjustment] = useState(false)
  const [showBusinessTypeTooltip, setShowBusinessTypeTooltip] = useState(false)
  const [showLocationTooltip, setShowLocationTooltip] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [autoSyncToCRM, setAutoSyncToCRM] = useState(true) // Default: enviar para CRM

  // Buscar usuário atual
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  const { profile } = useProfileCheck(user); // Obter dados do perfil do usuário

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
  const [phoneFilter, setPhoneFilter] = useState("all")
  const [leadsPerPage, setLeadsPerPage] = useState("9")
  const [currentPage, setCurrentPage] = useState(1)

  // Novos filtros
  const [sortBy, setSortBy] = useState("relevance")
  const [sortOrder, setSortOrder] = useState("desc")
  const [maxReviews, setMaxReviews] = useState("none")

  const { toast } = useToast()
  const saveLeadListMutation = useSaveLeadList()

  const searchForm = useForm<z.infer<typeof searchFormSchema>>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      businessType: "",
      location: "",
      quantity: "10",
    },
  })

  // Verificar se o formulário está preenchido para ativar o botão
  const isFormValid = searchForm.watch("businessType") &&
    searchForm.watch("location") &&
    searchForm.watch("quantity")

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

    const matchesPhone = phoneFilter === "all" ||
      (phoneFilter === "mobile" && lead.phone && isMobilePhone(lead.phone)) ||
      (phoneFilter === "landline" && lead.phone && !isMobilePhone(lead.phone))

    return matchesSearch && matchesCity && matchesRating && matchesReviews && matchesMaxReviews && matchesWebsite && matchesPhone
  })

  // Desmarcar automaticamente leads que não estão mais visíveis quando filtros mudam
  useEffect(() => {
    if (generatedLeads.length === 0) return

    const filteredLeadIds = new Set(filteredLeads.map(lead =>
      `${lead.name}-${lead.phone}` // Usar combinação única para identificar leads
    ))

    // Verificar se há leads selecionados que não estão mais visíveis
    const hasInvisibleSelected = generatedLeads.some(lead => {
      const leadKey = `${lead.name}-${lead.phone}`
      return !filteredLeadIds.has(leadKey) && lead.selected
    })

    // Só atualizar se necessário para evitar loops
    if (hasInvisibleSelected) {
      setGeneratedLeads(prev =>
        prev.map(lead => {
          const leadKey = `${lead.name}-${lead.phone}`
          // Se o lead não está mais visível e estava selecionado, desmarcá-lo
          if (!filteredLeadIds.has(leadKey) && lead.selected) {
            return { ...lead, selected: false }
          }
          return lead
        })
      )
    }
  }, [searchTerm, cityFilter, ratingFilter, reviewsFilter, maxReviews, websiteFilter])

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

  // Função para scroll suave para o botão "Selecionar Todos"
  const scrollToLeadsTop = () => {
    // Primeiro, tentar encontrar o botão "Selecionar Todos" nos filtros
    const selectAllButton = document.querySelector('[data-select-all-button]')
    if (selectAllButton) {
      const buttonRect = selectAllButton.getBoundingClientRect()
      const navbarHeight = 80 // Altura aproximada da navbar
      const scrollPosition = window.pageYOffset + buttonRect.top - navbarHeight - 20 // 20px de margem extra

      window.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
      })
    } else {
      // Fallback: encontrar o container dos leads
      const leadsContainer = document.querySelector('[data-leads-container]')
      if (leadsContainer) {
        const containerRect = leadsContainer.getBoundingClientRect()
        const navbarHeight = 80 // Altura aproximada da navbar
        const scrollPosition = window.pageYOffset + containerRect.top - navbarHeight - 20 // 20px de margem extra

        window.scrollTo({
          top: scrollPosition,
          behavior: 'smooth'
        })
      } else {
        // Fallback final: scroll para o topo da página
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        })
      }
    }
  }

  const handleLeadGeneration = async (businessType: string, location: string, limit: number) => {
    setIsGenerating(true)
    setExtractionStatus('generating')
    setGeneratedLeads([])
    setShowSaveOptions(false)
    resetPagination()

    try {
      console.log('🚀 Iniciando geração de leads para:', `${businessType} em ${location}`)
      const result = await LeadService.generateLeadsFromSearch(businessType, location, limit)

      // Verificar se está em modo demo
      if (result.demo_mode) {
        toast({
          title: "🔧 Modo Demonstração Ativado",
          description: "N8N indisponível. Usando dados de exemplo para demonstração.",
          variant: 'default',
          className: 'toast-modern toast-warning'
        })
      }

      if (!result.success) {
        console.error('❌ Erro na resposta do serviço:', result.error)
        setExtractionStatus('error')
        toast({
          title: "❌ Erro na Extração",
          description: result.error || "Não foi possível extrair os leads.",
          variant: 'destructive',
          className: 'toast-modern toast-error'
        })
        return
      }

      if (result.leads.length === 0) {
        setExtractionStatus('error')
        toast({
          title: "🔍 Nenhum Lead Encontrado",
          description: "Sua busca não retornou resultados. Tente um termo ou URL diferente.",
          variant: 'warning',
          className: 'toast-modern toast-warning'
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
        className: 'toast-modern toast-success'
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
        className: 'toast-modern toast-error'
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
    // Verificar se todos os leads filtrados estão selecionados
    const allFilteredSelected = filteredLeads.every(lead => lead.selected)

    setGeneratedLeads(prev =>
      prev.map(lead => {
        // Verificar se este lead está na lista filtrada
        const isInFiltered = filteredLeads.some(filteredLead =>
          filteredLead.name === lead.name &&
          filteredLead.phone === lead.phone
        )

        // Se está na lista filtrada, alterar o estado de seleção
        if (isInFiltered) {
          return { ...lead, selected: !allFilteredSelected }
        }

        // Se não está na lista filtrada, manter o estado atual
        return lead
      })
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
        className: 'toast-modern toast-warning'
      })
      return
    }

    if (saveMode === 'new' && !newListName.trim()) {
      toast({
        title: "⚠️ Nome da Lista Obrigatório",
        description: "Digite um nome para a nova lista.",
        variant: 'warning',
        className: 'toast-modern toast-warning'
      })
      return
    }

    if (saveMode === 'existing' && !selectedListId) {
      toast({
        title: "⚠️ Lista Não Selecionada",
        description: "Selecione uma lista para adicionar os leads.",
        variant: 'warning',
        className: 'toast-modern toast-warning'
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
        // Usar o hook para ter suporte a auto-sync
        // IMPORTANTE: Usa leadsToSave (sem duplicatas) em vez de selectedLeads
        await saveLeadListMutation.mutateAsync({
          name: newListName,
          leads: leadsToSave,
          description: `Gerado em ${new Date().toLocaleDateString('pt-BR')}`,
          tags: [],
          autoSyncToCRM: autoSyncToCRM
        })
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
        className: 'toast-modern toast-error'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const onSearchSubmit = (values: z.infer<typeof searchFormSchema>) => {
    setExtractionStatus('ready') // Reset status before starting
    handleLeadGeneration(values.businessType, values.location, parseInt(values.quantity))
  }

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false)
    setSuccessData(null)

    // Atualizar a página para mostrar o saldo de leads atualizado
    console.log('🔄 Atualizando página para mostrar saldo de leads atualizado...')
    window.location.reload()
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

  // Função para ajustar quantidade quando limite é atingido
  const handleAdjustQuantity = () => {
    setShowQuantityAdjustment(true);
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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl mb-4 shadow-lg">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              <span className={isDark ? 'text-white' : 'text-black'}>Busca </span>
              <span
                className="aurora-text"
                style={{
                  background: 'linear-gradient(45deg, #10b981, #059669, #047857, #10b981)',
                  backgroundSize: '200% auto',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: 'aurora-text 3s ease-in-out infinite alternate'
                }}
              >
                Inteligente
              </span>
              <span className={isDark ? 'text-white' : 'text-black'}> de </span>
              <span
                className="aurora-text"
                style={{
                  background: 'linear-gradient(45deg, #10b981, #059669, #047857, #10b981)',
                  backgroundSize: '200% auto',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: 'aurora-text 3s ease-in-out infinite alternate'
                }}
              >
                Leads
              </span>
            </h1>
            <p className="text-lg sm:text-xl gerador-descricao-claro dark:text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Defina o tipo de negócio e localização desejada. <strong>Seja específico</strong> para obter leads de maior qualidade e relevância!
            </p>
          </motion.div>
        </div>

        {/* Aviso quando usuário está ajustando quantidade */}
        {showQuantityAdjustment && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6"
          >
            <div className="bg-orange-500 text-white rounded-lg p-4 border-2 shadow-lg" style={{ zIndex: 9999 }}>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                <div>
                  <h4 className="font-semibold text-sm text-white">
                    Ajuste necessário na quantidade
                  </h4>
                  <p className="text-xs mt-1 text-white">
                    Reduza a quantidade de leads solicitados para continuar com a busca.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Formulário de Extração */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6 sm:mb-8"
        >
          <Card className="border-0 shadow-2xl gerador-card-claro gerador-card-escuro backdrop-blur-sm">
            <CardHeader className="text-center pb-4 sm:pb-6 px-4 sm:px-6">
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-3 mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <Search className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <CardTitle className={`text-lg sm:text-xl lg:text-2xl font-bold text-center ${isDark ? 'gerador-titulo-dark' : 'gerador-titulo-light'}`}>Configuração da Busca</CardTitle>
              </div>
              <CardDescription className={`text-sm sm:text-base lg:text-lg text-center px-2 ${isDark ? 'gerador-descricao-dark' : 'gerador-descricao-light'}`}>
                Especifique o segmento de mercado e região de interesse. Nossa plataforma localizará estabelecimentos relevantes em segundos.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
              {/* Alerta simples para leads bônus - só aparece se NÃO tem assinatura ativa */}
              {(() => {
                const hasActiveSubscription = subscription && subscription.status === 'active'
                const hasCancelledSubscription = subscription && subscription.status === 'cancelled'
                const hasBonusLeads = (profile?.bonus_leads || 0) - (profile?.bonus_leads_used || 0) > 0

                // Só mostra se: não tem assinatura ativa E não tem assinatura cancelada E tem leads bônus E não está ajustando quantidade
                return !showQuantityAdjustment && !hasActiveSubscription && !hasCancelledSubscription && hasBonusLeads
              })() && (
                  <SimpleBonusLeadsAlert
                    leadsRemaining={(profile?.bonus_leads || 0) - (profile?.bonus_leads_used || 0)}
                    onAdjustQuantity={handleAdjustQuantity}
                  />
                )}

              {showQuantityAdjustment ? (
                // Mostrar formulário diretamente quando ajustando quantidade
                <div>
                  <Form {...searchForm}>
                    <form
                      onSubmit={searchForm.handleSubmit(onSearchSubmit)}
                      className="space-y-6"
                      data-lead-form
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={searchForm.control}
                          name="businessType"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Search className="w-4 h-4 text-blue-500" />
                                Tipo de Estabelecimento
                                <div className="relative">
                                  <Info
                                    className="w-4 h-4 gerador-info-icon cursor-help transition-colors"
                                    onMouseEnter={() => setShowBusinessTypeTooltip(true)}
                                    onMouseLeave={() => setShowBusinessTypeTooltip(false)}
                                  />
                                  {showBusinessTypeTooltip && (
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-80 gerador-tooltip text-xs rounded-lg p-3 shadow-lg z-50 border">
                                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent gerador-tooltip-arrow"></div>
                                      <div className="font-semibold mb-2 gerador-tooltip-title">💡 Dicas para Busca Eficaz:</div>
                                      <div className="space-y-1">
                                        <div><strong>Seja específico:</strong> "restaurantes italianos" em vez de "restaurantes"</div>
                                        <div><strong>Use termos comerciais:</strong> "farmácias 24h", "academias de musculação"</div>
                                        <div><strong>Inclua especialidades:</strong> "clínicas odontológicas", "consultórios médicos"</div>
                                        <div><strong>Adicione serviços:</strong> "padarias artesanais", "lojas de eletrônicos"</div>
                                      </div>
                                      <div className="mt-2 gerador-tooltip-highlight text-xs">
                                        Quanto mais específico, melhores serão os leads encontrados!
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ex: restaurantes, farmácias, academias, clínicas..."
                                  {...field}
                                  className="gerador-input-claro gerador-input-escuro text-base py-3 px-4"
                                  disabled={isGenerating}
                                />
                              </FormControl>
                              <FormMessage className="text-red-500 text-sm" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={searchForm.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-green-500" />
                                Localidade
                                <div className="relative">
                                  <Info
                                    className="w-4 h-4 gerador-info-icon cursor-help transition-colors"
                                    onMouseEnter={() => setShowLocationTooltip(true)}
                                    onMouseLeave={() => setShowLocationTooltip(false)}
                                  />
                                  {showLocationTooltip && (
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-80 gerador-tooltip text-xs rounded-lg p-3 shadow-lg z-50 border">
                                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent gerador-tooltip-arrow"></div>
                                      <div className="font-semibold mb-2 gerador-tooltip-title">📍 Dicas de Localização:</div>
                                      <div className="space-y-1">
                                        <div><strong>Cidade + Região:</strong> "Belo Horizonte, Nova Lima"</div>
                                        <div><strong>Bairro específico:</strong> "Copacabana, Rio de Janeiro"</div>
                                        <div><strong>Zona da cidade:</strong> "Zona Sul, São Paulo"</div>
                                        <div><strong>Centro comercial:</strong> "Centro, Brasília"</div>
                                      </div>
                                      <div className="mt-2 gerador-tooltip-highlight text-xs">
                                        Seja específico para encontrar estabelecimentos na região exata!
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ex: Belo Horizonte, Nova Lima / Copacabana, Rio de Janeiro..."
                                  {...field}
                                  className="gerador-input-claro gerador-input-escuro text-base py-3 px-4"
                                  disabled={isGenerating}
                                />
                              </FormControl>
                              <FormMessage className="text-red-500 text-sm" />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={searchForm.control}
                        name="quantity"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                              <Target className="w-4 h-4 text-purple-500" />
                              Quantidade de Leads
                            </FormLabel>
                            <Select onValueChange={(value) => {
                              field.onChange(value);
                              setQuantity(value);
                            }} value={field.value || ''} disabled={isGenerating}>
                              <FormControl>
                                <SelectTrigger className="gerador-select-claro gerador-select-escuro text-base py-3">
                                  <SelectValue placeholder="Selecione a quantidade" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {(() => {
                                  const leadsRemaining = (profile?.bonus_leads || 0) - (profile?.bonus_leads_used || 0);
                                  const options = [];

                                  if (leadsRemaining <= 0) {
                                    return [
                                      <SelectItem key="0" value="0" disabled>
                                        Sem leads disponíveis
                                      </SelectItem>
                                    ];
                                  }

                                  // Opções inteligentes baseadas nos leads restantes
                                  if (leadsRemaining >= 1) options.push(1);
                                  if (leadsRemaining >= 5) options.push(5);
                                  if (leadsRemaining >= 10) options.push(10);
                                  if (leadsRemaining >= 15) options.push(15);
                                  if (leadsRemaining >= 20) options.push(20);
                                  if (leadsRemaining >= 25) options.push(25);
                                  if (leadsRemaining >= 30) options.push(30);

                                  // Sempre incluir o valor máximo disponível
                                  if (leadsRemaining > 30 && !options.includes(leadsRemaining)) {
                                    options.push(leadsRemaining);
                                  }

                                  return options.map((num) => (
                                    <SelectItem key={num} value={num.toString()}>
                                      {num} lead{num > 1 ? 's' : ''} {num === leadsRemaining ? '(máximo)' : ''}
                                    </SelectItem>
                                  ));
                                })()}
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-red-500 text-sm" />
                          </FormItem>
                        )}
                      />

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="pt-2"
                      >
                        <Button
                          type="submit"
                          disabled={isGenerating || !searchForm.formState.isValid}
                          className="w-full gerador-button-claro gerador-button-escuro text-lg font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100"
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Buscando estabelecimentos...
                            </>
                          ) : (
                            <>
                              <Search className="mr-2 h-5 w-5" />
                              Localizar Estabelecimentos
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </form>
                  </Form>
                </div>
              ) : (
                <LeadsControlGuard
                  leadsToGenerate={parseInt(searchForm.watch("quantity") || "10")}
                  onAdjustQuantity={handleAdjustQuantity}
                  forceShowForm={showQuantityAdjustment}
                >
                  <Form {...searchForm}>
                    <form
                      onSubmit={searchForm.handleSubmit(onSearchSubmit)}
                      className="space-y-6"
                      data-lead-form
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={searchForm.control}
                          name="businessType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-semibold flex items-center space-x-2 gerador-texto-claro dark:text-foreground">
                                <Search className="w-4 h-4" />
                                <span>Tipo de Estabelecimento</span>
                                <div className="relative">
                                  <Info
                                    className="w-4 h-4 gerador-info-icon cursor-help transition-colors"
                                    onMouseEnter={() => setShowBusinessTypeTooltip(true)}
                                    onMouseLeave={() => setShowBusinessTypeTooltip(false)}
                                  />
                                  {showBusinessTypeTooltip && (
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-80 gerador-tooltip text-xs rounded-lg p-3 shadow-lg z-50 border">
                                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent gerador-tooltip-arrow"></div>
                                      <div className="font-semibold mb-2 gerador-tooltip-title">💡 Dicas para Busca Eficaz:</div>
                                      <div className="space-y-1">
                                        <div><strong>Seja específico:</strong> "restaurantes italianos" em vez de "restaurantes"</div>
                                        <div><strong>Use termos comerciais:</strong> "farmácias 24h", "academias de musculação"</div>
                                        <div><strong>Inclua especialidades:</strong> "clínicas odontológicas", "consultórios médicos"</div>
                                        <div><strong>Adicione serviços:</strong> "padarias artesanais", "lojas de eletrônicos"</div>
                                      </div>
                                      <div className="mt-2 gerador-tooltip-highlight text-xs">
                                        Quanto mais específico, melhores serão os leads encontrados!
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ex: restaurantes, farmácias, academias, clínicas..."
                                  {...field}
                                  disabled={isGenerating}
                                  className="h-12 text-base border-2 gerador-input-claro gerador-input-escuro focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={searchForm.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-semibold flex items-center space-x-2 gerador-texto-claro dark:text-foreground">
                                <MapPin className="w-4 h-4" />
                                <span>Localidade</span>
                                <div className="relative">
                                  <Info
                                    className="w-4 h-4 gerador-info-icon cursor-help transition-colors"
                                    onMouseEnter={() => setShowLocationTooltip(true)}
                                    onMouseLeave={() => setShowLocationTooltip(false)}
                                  />
                                  {showLocationTooltip && (
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-80 gerador-tooltip text-xs rounded-lg p-3 shadow-lg z-50 border">
                                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent gerador-tooltip-arrow"></div>
                                      <div className="font-semibold mb-2 gerador-tooltip-title">📍 Dicas de Localização:</div>
                                      <div className="space-y-1">
                                        <div><strong>Cidade + Região:</strong> "Belo Horizonte, Nova Lima"</div>
                                        <div><strong>Bairro específico:</strong> "Copacabana, Rio de Janeiro"</div>
                                        <div><strong>Zona da cidade:</strong> "Zona Sul, São Paulo"</div>
                                        <div><strong>Centro comercial:</strong> "Centro, Brasília"</div>
                                      </div>
                                      <div className="mt-2 gerador-tooltip-highlight text-xs">
                                        Seja específico para encontrar estabelecimentos na região exata!
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ex: Belo Horizonte, Nova Lima / Copacabana, Rio de Janeiro..."
                                  {...field}
                                  disabled={isGenerating}
                                  className="h-12 text-base border-2 gerador-input-claro gerador-input-escuro focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-2 sm:space-y-3">
                          <Label className="text-sm sm:text-base font-semibold flex items-center space-x-2 gerador-texto-claro dark:text-foreground">
                            <Users className="w-4 h-4" />
                            <span>Quantidade de Leads</span>
                            {showQuantityAdjustment && (
                              <span className="gerador-adjustment-badge-claro gerador-adjustment-badge-escuro text-xs px-2 py-1 rounded-full font-medium animate-pulse">
                                Ajuste necessário
                              </span>
                            )}
                          </Label>
                          <Select onValueChange={(value) => {
                            setQuantity(value)
                            searchForm.setValue('quantity', value) // Sincronizar com o formulário
                            setShowQuantityAdjustment(false) // Reset highlight when user changes
                          }} defaultValue={quantity} disabled={isGenerating}>
                            <SelectTrigger className={`h-10 sm:h-12 border-2 text-sm sm:text-base transition-all duration-300 ${showQuantityAdjustment
                              ? 'gerador-adjustment-select-claro gerador-adjustment-select-escuro'
                              : 'gerador-input-claro gerador-input-escuro focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                              }`}>
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border border-border shadow-lg">
                              <SelectItem value="10">10 Leads</SelectItem>
                              <SelectItem value="20">20 Leads</SelectItem>
                              <SelectItem value="30">30 Leads</SelectItem>
                              <SelectItem value="40">40 Leads</SelectItem>
                              <SelectItem value="50">50 Leads</SelectItem>
                              <SelectItem value="100">100 Leads</SelectItem>
                              <SelectItem value="150">150 Leads</SelectItem>
                              <SelectItem value="200">200 Leads</SelectItem>
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
                        className="inline-block"
                        style={{
                          width: '100%',
                          height: 'auto',
                          display: 'inline-block'
                        }}
                      >
                        <Button
                          type="submit"
                          className={`w-full h-12 sm:h-14 transition-all duration-300 text-base sm:text-lg font-semibold rounded-lg sm:rounded-xl m-0 p-0 ${isFormValid
                            ? 'gerador-botao-claro gerador-botao-escuro'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300'
                            }`}
                          disabled={isGenerating || !isFormValid}
                          size="lg"
                          style={{ margin: 0, padding: 0 }}
                        >
                          {isGenerating ? (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="flex items-center"
                            >
                              <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                              Processando busca...
                            </motion.div>
                          ) : (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="flex items-center"
                            >
                              <Search className="mr-3 h-5 w-5" />
                              {isFormValid ? '🚀 Iniciar Busca' : 'Complete os campos obrigatórios'}
                            </motion.div>
                          )}
                        </Button>
                      </motion.div>
                    </form>
                  </Form>
                </LeadsControlGuard>
              )}
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
                  <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl sm:text-2xl font-bold gerador-titulo-claro gerador-titulo-escuro text-center">
                      Leads Encontrados ({filteredLeads.length})
                    </CardTitle>
                  </div>
                  <CardDescription className="text-base sm:text-lg gerador-descricao-claro gerador-descricao-escuro text-center">
                    Selecione os leads que deseja salvar em sua lista
                  </CardDescription>

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
                      phoneFilter={phoneFilter}
                      setPhoneFilter={setPhoneFilter}
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
                        setPhoneFilter("all")
                        setSortBy("relevance")
                        setSortOrder("desc")
                        setMaxReviews("none")
                        setCurrentPage(1)
                      }}
                      totalLeads={generatedLeads.length}
                      filteredCount={sortedLeads.length}
                      showSelectAllButton={true}
                      onSelectAll={toggleSelectAll}
                      allSelected={filteredLeads.length > 0 && filteredLeads.every(lead => lead.selected)}
                      selectedCount={getSelectedLeads().length}
                    />
                  </div>

                  {/* Paginação Superior - Logo após os filtros */}
                  {totalPages > 1 && paginatedLeads.length > 0 && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 py-4 border-b border-border/50 mb-6">
                      <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                        Mostrando {startIndex + 1}-{Math.min(endIndex, filteredLeads.length)} de {filteredLeads.length} leads
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCurrentPage(prev => Math.max(prev - 1, 1))
                            setTimeout(scrollToLeadsTop, 100)
                          }}
                          disabled={currentPage === 1}
                          className="border-2 gerador-input-claro gerador-input-escuro text-xs sm:text-sm px-3 sm:px-4 transition-all duration-200 hover:scale-105"
                        >
                          Anterior
                        </Button>
                        <span className="flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium gerador-texto-claro dark:text-foreground bg-muted/50 rounded-lg">
                          Página {currentPage} de {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCurrentPage(prev => Math.min(prev + 1, totalPages))
                            setTimeout(scrollToLeadsTop, 100)
                          }}
                          disabled={currentPage === totalPages}
                          className="border-2 gerador-input-claro gerador-input-escuro text-xs sm:text-sm px-3 sm:px-4 transition-all duration-200 hover:scale-105"
                        >
                          Próxima
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Aviso flutuante para mobile - leads selecionados */}
                  {getSelectedLeads().length > 0 && createPortal(
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: 20 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30
                      }}
                      className="sm:hidden fixed bottom-4 right-4 z-[9999] bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-2 rounded-full shadow-xl border border-white/30 backdrop-blur-md"
                      style={{
                        position: 'fixed',
                        bottom: '16px',
                        right: '16px',
                        zIndex: 9999,
                        pointerEvents: 'auto'
                      }}
                    >
                      <div className="flex items-center space-x-1.5">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">
                          {getSelectedLeads().length}
                        </span>
                      </div>
                    </motion.div>,
                    document.body
                  )}

                  {/* Grid de Cards */}
                  <div
                    data-leads-container
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 auto-rows-fr"
                  >
                    {paginatedLeads.map((lead, index) => (
                      <LeadCard
                        key={lead.id || `lead-${index}`}
                        lead={lead}
                        index={index}
                        onToggleSelection={toggleLeadSelectionByFilteredIndex}
                        showCheckbox={true}
                      />
                    ))}
                  </div>

                  {/* Paginação Superior */}
                  {totalPages > 1 && paginatedLeads.length > 0 && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 py-4 border-b border-border/50">
                      <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                        Mostrando {startIndex + 1}-{Math.min(endIndex, filteredLeads.length)} de {filteredLeads.length} leads
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCurrentPage(prev => Math.max(prev - 1, 1))
                            setTimeout(scrollToLeadsTop, 100)
                          }}
                          disabled={currentPage === 1}
                          className="border-2 gerador-input-claro gerador-input-escuro text-xs sm:text-sm px-3 sm:px-4 transition-all duration-200 hover:scale-105"
                        >
                          Anterior
                        </Button>
                        <span className="flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium gerador-texto-claro dark:text-foreground bg-muted/50 rounded-lg">
                          Página {currentPage} de {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCurrentPage(prev => Math.min(prev + 1, totalPages))
                            setTimeout(scrollToLeadsTop, 100)
                          }}
                          disabled={currentPage === totalPages}
                          className="border-2 gerador-input-claro gerador-input-escuro text-xs sm:text-sm px-3 sm:px-4 transition-all duration-200 hover:scale-105"
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
                  <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                      <Save className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl sm:text-2xl font-bold gerador-titulo-claro gerador-titulo-escuro text-center">Salvar Leads Selecionados</CardTitle>
                  </div>
                  <CardDescription className="text-base sm:text-lg gerador-descricao-claro gerador-descricao-escuro text-center">
                    {getSelectedLeads().length} leads selecionados para salvar
                  </CardDescription>

                  {/* Botão Selecionar Todos na seção de salvar */}
                  <div className="flex justify-center mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleSelectAll}
                      className="border-2 font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg hover:opacity-90"
                      style={{
                        background: 'linear-gradient(135deg, rgb(16, 185, 129) 0%, rgb(5, 150, 105) 100%)',
                        color: 'white',
                        borderColor: 'transparent'
                      }}
                    >
                      {filteredLeads.length > 0 && filteredLeads.every(lead => lead.selected) ? 'Desmarcar Todos' : 'Selecionar Todos'}
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="px-8 pb-8">
                  <div className="space-y-6">
                    {/* Opções de Salvamento */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <label className={`flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 cursor-pointer transition-all duration-200 ${saveMode === 'new'
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

                        <label className={`flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 cursor-pointer transition-all duration-200 ${saveMode === 'existing'
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
                        <div className="space-y-4">
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

                          {/* Auto-Sync to CRM Checkbox */}
                          <div className="rounded-xl border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-md">
                            <div className="flex items-start space-x-3">
                              <Checkbox
                                id="auto-sync-crm"
                                checked={autoSyncToCRM}
                                onCheckedChange={(checked) => setAutoSyncToCRM(checked as boolean)}
                                className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                              />
                              <div className="flex-1 space-y-1">
                                <Label
                                  htmlFor="auto-sync-crm"
                                  className="text-base font-semibold flex items-center gap-2 cursor-pointer gerador-texto-claro dark:text-foreground"
                                >
                                  <Upload className="h-4 w-4 text-primary" />
                                  Enviar automaticamente para o CRM
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                  Os {getSelectedLeads().length} leads selecionados serão enviados para o pipeline BDR do seu Kommo CRM após serem salvos.
                                </p>
                              </div>
                            </div>
                          </div>
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
                          className={`w-full h-11 transition-all duration-300 text-base font-semibold rounded-lg ${getSelectedLeads().length > 0
                            ? 'gerador-botao-claro gerador-botao-escuro'
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