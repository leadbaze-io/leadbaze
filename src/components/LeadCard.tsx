import { Star, Phone, Globe, MapPin, Eye } from "lucide-react"
import { motion } from "framer-motion"
import { Badge } from "./ui/badge"
import type { Lead } from "../types"

interface LeadCardProps {
  lead: Lead & { selected?: boolean }
  index: number
  onToggleSelection?: (index: number) => void
  showCheckbox?: boolean
  className?: string
}

export function LeadCard({ 
  lead, 
  index, 
  onToggleSelection, 
  showCheckbox = true,
  className = ""
}: LeadCardProps) {
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
        <span className="text-xs disparador-texto-claro dark:text-gray-600 ml-1">{rating}</span>
      </div>
    )
  }

  const renderReviewsCount = (reviewsCount?: number) => {
    const count = reviewsCount || 0
    
    return (
      <div className="flex items-center space-x-2">
        <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 disparador-texto-claro">
          {count}
        </div>
        <div className="text-xs disparador-texto-claro dark:text-muted-foreground">
          Avaliações
        </div>
      </div>
    )
  }

  const handleClick = () => {
    if (onToggleSelection) {
      onToggleSelection(index)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border-2 rounded-lg overflow-hidden ${
        lead.selected 
          ? 'ring-2 ring-blue-500 border-blue-500 shadow-md gerador-lead-selecionado-claro gerador-lead-selecionado-escuro dark:border-blue-400 dark:ring-blue-400' 
          : 'gerador-lead-card-claro gerador-lead-card-escuro hover:border-blue-300 dark:hover:border-blue-200'
      } ${className}`}
      onClick={handleClick}
    >
      {/* Header do Card */}
      <div className={`p-4 border-b-2 rounded-b-none ${
        lead.selected 
          ? 'border-blue-200 dark:border-blue-700 gerador-lead-header-selecionado-claro gerador-lead-header-selecionado-escuro' 
          : 'border-gray-200 dark:border-border gerador-lead-header-claro gerador-lead-header-escuro'
      }`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            {showCheckbox && (
              <input
                type="checkbox"
                checked={lead.selected || false}
                onChange={(e) => {
                  e.stopPropagation()
                  handleClick()
                }}
                className={`rounded w-4 h-4 focus:ring-2 focus:ring-blue-500 ${
                  lead.selected 
                    ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:bg-blue-500 dark:text-white' 
                    : 'border-gray-300 text-blue-600 dark:border-gray-600'
                }`}
              />
            )}
            <div className="flex items-center space-x-2">
              {renderReviewsCount(lead.reviews_count)}
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {renderStars(lead.rating)}
          </div>
        </div>
        
        {/* Nome do estabelecimento */}
        <h3 className="font-semibold gerador-texto-claro dark:text-foreground text-base mb-2 leading-tight">
          {lead.name}
        </h3>
        
        {/* Endereço */}
        <div className="flex items-center space-x-2 text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span className="text-sm gerador-descricao-claro dark:text-muted-foreground">{lead.address}</span>
        </div>
      </div>

      {/* Conteúdo do Card */}
      <div className="p-4 space-y-3">
        {/* Informações de contato */}
        <div className="space-y-2">
          {lead.phone && (
            <div className="flex items-center space-x-2 text-sm">
              <Phone className="w-4 h-4 text-green-600" />
              <span className="text-green-700 dark:text-green-300 font-medium gerador-texto-claro">{lead.phone}</span>
            </div>
          )}
          {lead.website && (
            <div className="flex items-center space-x-2 text-sm">
              <Globe className="w-4 h-4 text-blue-600" />
              <span className="text-blue-700 dark:text-blue-300 font-medium gerador-texto-claro">Website disponível</span>
            </div>
          )}
          {!lead.phone && !lead.website && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Eye className="w-4 h-4" />
              <span className="gerador-descricao-claro dark:text-muted-foreground">Contato não disponível</span>
            </div>
          )}
        </div>

        {/* Badges Premium - Máximo 3 por card */}
        <div className="flex flex-wrap gap-2 pt-3">
          {/* Badge de Qualidade (Baseado na avaliação) */}
          {lead.rating && lead.rating >= 4.5 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg border border-emerald-400/20">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
              ⭐ Alta Qualidade
            </div>
          )}
          {lead.rating && lead.rating >= 4 && lead.rating < 4.5 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg border border-blue-400/20">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              ⭐ Boa Qualidade
            </div>
          )}
          
          {/* Badge de Reputação (Baseado no número de avaliações) */}
          {lead.reviews_count && lead.reviews_count >= 500 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg border border-purple-400/20">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              🏆 Estabelecido
            </div>
          )}
          {lead.reviews_count && lead.reviews_count >= 100 && lead.reviews_count < 500 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg border border-amber-400/20">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              🔥 Consolidado
            </div>
          )}
          {lead.reviews_count && lead.reviews_count >= 25 && lead.reviews_count < 100 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg border border-indigo-400/20">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              📈 Em Crescimento
            </div>
          )}
          
          {/* Badge de Contato (Baseado na disponibilidade de informações) */}
          {lead.phone && lead.website && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg border border-cyan-400/20">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              🌐 Contato Completo
            </div>
          )}
          
          {!lead.phone && lead.website && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-lg border border-sky-400/20">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              🌐 Online
            </div>
          )}
          {!lead.phone && !lead.website && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-slate-500 to-slate-600 text-white shadow-lg border border-slate-400/20">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              📋 Informações Básicas
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
