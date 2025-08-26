import { useState, useMemo } from 'react'
import { Trash2, CheckSquare, Square } from 'lucide-react'
import type { Lead } from '../types'
import { Button } from './ui/button'
import { useToast } from '../hooks/use-toast'
import LeadTable from './LeadTable'

interface LeadTableWithActionsProps {
  leads: Lead[]
  title?: string
  onLeadsDeleted?: (deletedLeadIds: string[]) => void
}

export default function LeadTableWithActions({ leads, title = "Lista de Leads", onLeadsDeleted }: LeadTableWithActionsProps) {
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)
  
  const { toast } = useToast()

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
    if (selectedLeads.size === leads.length) {
      setSelectedLeads(new Set())
    } else {
      setSelectedLeads(new Set(leads.map(lead => lead.id || '').filter(Boolean)))
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

  return (
    <div className="space-y-4">
      {/* Header com ações */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="text-gray-600 mt-1">
            {leads.length} leads
            {selectedLeads.size > 0 && (
              <span className="ml-2 text-blue-600 font-medium">
                • {selectedLeads.size} selecionado(s)
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {selectedLeads.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteSelected}
              disabled={isDeleting}
              className="flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Deletar Selecionados</span>
            </Button>
          )}
        </div>
      </div>

      {/* Tabela de leads */}
      <LeadTable leads={leads} title={title} />
    </div>
  )
}
