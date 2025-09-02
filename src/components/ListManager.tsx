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
  MoreVertical,
  Trash2,
  Download,
  Search
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card"
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

export function ListManager({ onSelectList }: ListManagerProps) {
  // onSelectList is used in the handleListClick function below
  void onSelectList; // Suppress unused variable warning
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
      console.error('Erro ao carregar listas:', err)
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
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando suas listas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar listas</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadLists}>Tentar novamente</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{getTotalLeads()}</p>
                <p className="text-gray-600">Total de Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{lists.length}</p>
                <p className="text-gray-600">Listas Criadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {lists.length > 0 ? Math.round(getTotalLeads() / lists.length) : 0}
                </p>
                <p className="text-gray-600">Média por Lista</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Controles */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <CardTitle>Suas Listas de Leads</CardTitle>
              <CardDescription>
                Gerencie e organize suas listas de leads
              </CardDescription>
            </div>
            <Link to="/gerador">
              <Button className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Nova Lista</span>
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Busca */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar listas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro por Status */}
            <Select value={filterStatus} onValueChange={(value: 'all' | 'active' | 'archived') => setFilterStatus(value)}>
              <SelectTrigger className="w-[180px]">
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
              <SelectTrigger className="w-[200px]">
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

          {/* Lista de Listas */}
          {filteredLists.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {lists.length === 0 ? 'Nenhuma lista criada ainda' : 'Nenhuma lista encontrada'}
              </h3>
              <p className="text-gray-600 mb-6">
                {lists.length === 0 
                  ? 'Comece criando sua primeira lista de leads usando links do Google Maps'
                  : 'Tente ajustar os filtros para encontrar suas listas'
                }
              </p>
              {lists.length === 0 && (
                <Link to="/gerador">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeira Lista
                  </Button>
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
                  >
                    <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg truncate">{list.name}</CardTitle>
                            {list.description && (
                              <CardDescription className="mt-1 line-clamp-2">
                                {list.description}
                              </CardDescription>
                            )}
                          </div>
                          
                          {/* Menu de ações */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          {/* Estatísticas */}
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Users className="w-4 h-4" />
                              <span>{list.total_leads} leads</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(list.created_at)}</span>
                            </div>
                          </div>

                          {/* Tags */}
                          {list.tags && list.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {list.tags.slice(0, 3).map((tag, i) => (
                                <span key={i} className="inline-block bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded">
                                  {tag}
                                </span>
                              ))}
                              {list.tags.length > 3 && (
                                <span className="text-xs text-gray-500">+{list.tags.length - 3}</span>
                              )}
                            </div>
                          )}

                          {/* Ações */}
                          <div className="flex items-center space-x-2 pt-2">
                            <Link to={`/lista/${list.id}`} className="flex-1">
                              <Button variant="outline" size="sm" className="w-full">
                                <Eye className="w-4 h-4 mr-1" />
                                Ver
                              </Button>
                            </Link>

                            

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => exportListToCSV(list)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteList(list.id, list.name)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}