import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {

  Plus,

  Eye,

  Calendar,

  Users,

  Loader,

  AlertCircle,

  Trash2,
  Download,
  Search,
  Target,
  FolderPlus,
  TrendingUp,
  Sparkles,
  ArrowRight
} from 'lucide-react'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { useToast } from "../hooks/use-toast"
import { LeadService } from '../lib/leadService'
import type { LeadList } from '../types'

interface ListManagerProps {
  onSelectList?: (list: LeadList) => void
}

export function ListManager({ onSelectList: _onSelectList }: ListManagerProps) {
  // onSelectList is intentionally unused for now
  const [lists, setLists] = useState<LeadList[]>([])
  const [filteredLists, setFilteredLists] = useState<LeadList[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'created_at' | 'name' | 'total_leads'>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'archived'>('all')

  const { toast } = useToast()

  const filterAndSortLists = useCallback(() => {
    let filtered = [...lists]

    // Filtrar por busca
    if (searchTerm) {
      filtered = filtered.filter(list =>
        list.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (list.description?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (list.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      )
    }

    // Filtrar por status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(list =>

        (list.status || 'active') === filterStatus
      )
    }

    // Ordenar
    filtered.sort((a, b) => {
      let valueA: string | number, valueB: string | number

      switch (sortBy) {
        case 'name':
          valueA = a.name.toLowerCase()
          valueB = b.name.toLowerCase()
          break
        case 'total_leads':
          valueA = a.total_leads
          valueB = b.total_leads
          break
        case 'created_at':
        default:
          valueA = new Date(a.created_at).getTime()
          valueB = new Date(b.created_at).getTime()
          break
      }

      if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1
      if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    setFilteredLists(filtered)
  }, [lists, searchTerm, sortBy, sortOrder, filterStatus])

  useEffect(() => {
    loadLists()
  }, [])

  useEffect(() => {
    filterAndSortLists()
  }, [filterAndSortLists])

  const loadLists = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const userLists = await LeadService.getUserLeadLists()
      setLists(userLists)
    } catch (err) {

      setError(err instanceof Error ? err.message : 'Erro ao carregar listas')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteList = async (listId: string, listName: string) => {
    if (!confirm(`Tem certeza que deseja deletar a lista "${listName}"? Esta ação não pode ser desfeita.`)) {
      return
    }

    try {
      await LeadService.deleteLeadList(listId)
      toast({
        title: "Lista deletada",
        description: `A lista "${listName}" foi deletada com sucesso.`,
        variant: 'success',
      })
      await loadLists()
    } catch (error) {
      toast({
        title: "Erro ao deletar",
        description: error instanceof Error ? error.message : "Erro ao deletar lista.",
        variant: "destructive",
      })
    }
  }

  const exportListToCSV = (list: LeadList) => {
    const headers = ['Nome', 'Endereço', 'Telefone', 'Avaliação', 'Website', 'Tipo de Negócio']
    const csvData = [
      headers.join(','),
      ...list.leads.map(lead => [
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
      link.setAttribute('download', `${list.name.replace(/\s+/g, '_').toLowerCase()}_leads.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTotalLeads = () => lists.reduce((sum, list) => sum + list.total_leads, 0)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Loader className="w-6 h-6 text-white" />
          </motion.div>
          <p className="text-lg font-medium lista-texto-claro dark:text-muted-foreground">
            Carregando suas listas...
          </p>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <AlertCircle className="w-12 h-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold lista-titulo-claro dark:text-foreground mb-2">
            Erro ao carregar listas
          </h3>
          <p className="lista-texto-muted-claro dark:text-muted-foreground mb-4">{error}</p>
          <Button onClick={loadLists}>Tentar novamente</Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header com estatísticas redesenhadas */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
      >
        {[
          {
            icon: Users,
            title: "Total de Leads",
            value: getTotalLeads(),
            color: "blue",
            bgColor: "from-blue-500 to-blue-600"
          },
          {
            icon: FolderPlus,
            title: "Listas Criadas",
            value: lists.length,
            color: "green",
            bgColor: "from-green-500 to-green-600"
          },
          {
            icon: TrendingUp,
            title: "Média por Lista",
            value: lists.length > 0 ? Math.round(getTotalLeads() / lists.length) : 0,
            color: "purple",
            bgColor: "from-purple-500 to-purple-600"
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="lista-stats-card-claro lista-stats-card-escuro rounded-2xl p-6 shadow-lg border"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-semibold lista-texto-muted-claro dark:text-muted-foreground uppercase tracking-wide">
                  {stat.title}
                </p>
                <p className="text-2xl sm:text-3xl font-bold lista-titulo-claro dark:text-foreground">
                  {stat.value}
                </p>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-r ${stat.bgColor} rounded-xl flex items-center justify-center shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Filtros e Controles Redesenhados */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="lista-header-claro lista-header-escuro rounded-3xl p-6 sm:p-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold lista-titulo-claro dark:text-foreground">
              Suas Listas de Leads
            </h2>
            <p className="lista-texto-muted-claro dark:text-muted-foreground">
              Gerencie e organize suas listas de leads
            </p>
          </div>
          <Link to="/gerador">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg">
                <Plus className="w-5 h-5 mr-2" />
                Nova Lista
              </Button>
            </motion.div>
          </Link>
        </div>

        <div className="mt-8 flex flex-col md:flex-row gap-4">
          {/* Busca */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Buscar listas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 rounded-xl border-2 focus:border-blue-500"
            />
          </div>

          {/* Filtro por Status */}
          <Select value={filterStatus} onValueChange={(value: 'all' | 'active' | 'archived') => setFilterStatus(value)}>
            <SelectTrigger className="w-[180px] h-12 rounded-xl border-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as listas</SelectItem>
              <SelectItem value="active">Ativas</SelectItem>
              <SelectItem value="archived">Arquivadas</SelectItem>
            </SelectContent>
          </Select>

          {/* Ordenação */}
          <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
            const [field, order] = value.split('-')
            setSortBy(field as 'created_at' | 'name' | 'total_leads')
            setSortOrder(order as 'asc' | 'desc')
          }}>
            <SelectTrigger className="w-[200px] h-12 rounded-xl border-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at-desc">Mais recentes</SelectItem>
              <SelectItem value="created_at-asc">Mais antigas</SelectItem>
              <SelectItem value="name-asc">Nome (A-Z)</SelectItem>
              <SelectItem value="name-desc">Nome (Z-A)</SelectItem>
              <SelectItem value="total_leads-desc">Mais leads</SelectItem>
              <SelectItem value="total_leads-asc">Menos leads</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Lista de Listas Redesenhada */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        {filteredLists.length === 0 ? (
          <div className="text-center py-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Target className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </motion.div>
            <h3 className="text-xl font-semibold lista-titulo-claro dark:text-foreground mb-2">
              {lists.length === 0 ? 'Nenhuma lista criada ainda' : 'Nenhuma lista encontrada'}
            </h3>
            <p className="lista-texto-muted-claro dark:text-muted-foreground mb-8 max-w-md mx-auto">
              {lists.length === 0

                ? 'Comece criando sua primeira lista de leads usando links do Google Maps'
                : 'Tente ajustar os filtros para encontrar suas listas'
              }
            </p>
            {lists.length === 0 && (
              <Link to="/gerador">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Criar Primeira Lista
                  </Button>
                </motion.div>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredLists.map((list, index) => (
                <motion.div
                  key={list.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="lista-card-claro lista-card-escuro rounded-2xl shadow-lg border transition-all duration-300 cursor-pointer group"
                >
                  <div className="p-6">
                    {/* Header do Card */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold lista-card-titulo-claro dark:text-foreground truncate mb-1">
                          {list.name}
                        </h3>
                        {list.description && (
                          <p className="text-sm lista-card-muted-claro dark:text-muted-foreground line-clamp-2">
                            {list.description}
                          </p>
                        )}
                      </div>

                    </div>

                    {/* Estatísticas */}
                    <div className="flex items-center justify-between text-sm mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-semibold lista-card-texto-claro dark:text-foreground">
                          {list.total_leads} leads
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <span className="lista-card-muted-claro dark:text-muted-foreground">
                          {formatDate(list.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Tags */}
                    {list.tags && list.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {list.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs px-3 py-1 rounded-full font-medium">
                            {tag}
                          </span>
                        ))}
                        {list.tags.length > 3 && (
                          <span className="text-xs lista-card-muted-claro dark:text-muted-foreground">+{list.tags.length - 3}</span>
                        )}
                      </div>
                    )}

                    {/* Ações */}
                    <div className="flex items-center space-x-2">
                      <Link to={`/lista/${list.id}`} className="flex-1">
                        <Button

                          className="lista-card-btn-primary-claro lista-card-btn-primary-escuro w-full h-10 rounded-xl font-semibold transition-all duration-200 hover:scale-105"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Lista
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => exportListToCSV(list)}
                        className="lista-card-btn-secondary-claro lista-card-btn-secondary-escuro h-10 w-10 p-0 rounded-xl"
                      >
                        <Download className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteList(list.id, list.name)}
                        className="lista-card-btn-danger-claro lista-card-btn-danger-escuro h-10 w-10 p-0 rounded-xl"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  )
}