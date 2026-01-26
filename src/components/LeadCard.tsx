import { Star, Phone, Globe, MapPin, ExternalLink, Clock } from "lucide-react"
import { motion } from "framer-motion"
import type { Lead } from "../types"
import { useState } from "react"
import { createPortal } from "react-dom"

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
  const [showHours, setShowHours] = useState(false);

  const renderStars = (rating?: number) => {
    if (!rating) return null

    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`full-${i}`}
          className="w-3 h-3 text-yellow-400 fill-current"
          aria-hidden="true"
        />
      )
    }

    if (hasHalfStar) {
      stars.push(
        <Star
          key="half"
          className="w-3 h-3 text-yellow-400 fill-current"
          style={{ clipPath: 'inset(0 50% 0 0)' }}
          aria-hidden="true"
        />
      )
    }

    return stars
  }

  const handleClick = () => {
    if (onToggleSelection) {
      onToggleSelection(index)
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className={`group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border-2 rounded-lg overflow-hidden h-full flex flex-col gerador-lead-card-claro gerador-lead-card-escuro ${lead.selected
          ? 'border-blue-500 dark:border-blue-400 gerador-lead-selecionado-claro gerador-lead-selecionado-escuro'
          : 'hover:border-blue-300 dark:hover:border-blue-200'
          } ${className}`}
        onClick={handleClick}
      >
        {/* Header do Card - Altura Fixa */}
        <div
          className={`p-4 border-b-2 rounded-b-none ${lead.selected
            ? 'border-blue-200 dark:border-blue-700 gerador-lead-header-selecionado-claro gerador-lead-header-selecionado-escuro'
            : 'border-gray-200 dark:border-border gerador-lead-header-claro gerador-lead-header-escuro'
            }`}
          style={{ minHeight: '120px' }}
        >
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
                  className="rounded w-4 h-4 focus:ring-2 focus:ring-blue-500 border-gray-300 text-blue-600 dark:border-gray-600"
                />
              )}
              <div className="flex items-center space-x-2">
                <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 disparador-texto-claro">
                  {lead.rating ? Math.round((lead.rating / 5) * 100) : 0}
                </div>
                <div className="text-xs disparador-texto-claro dark:text-muted-foreground">
                  Avaliações
                </div>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-1">
              {renderStars(lead.rating)}
              <span className="text-xs disparador-texto-claro dark:text-gray-600 ml-1">
                {lead.rating?.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Nome e Status */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold gerador-texto-claro dark:text-foreground text-base leading-tight flex-1">
              {lead.name}
            </h3>
            {lead.is_open_now !== undefined && (
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${lead.is_open_now
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                <span className={`w-1.5 h-1.5 rounded-full mr-1 ${lead.is_open_now ? 'bg-green-600' : 'bg-red-600'}`}></span>
                {lead.is_open_now ? 'Aberto' : 'Fechado'}
              </div>
            )}
          </div>
        </div>

        {/* Conteúdo do Card */}
        <div className="p-4 space-y-3 flex-1 overflow-y-auto">
          {/* Informações de contato - Altura Fixa */}
          <div className="space-y-2" style={{ minHeight: '60px' }}>
            {lead.phone ? (
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="text-green-700 dark:text-green-300 font-medium gerador-texto-claro truncate">
                  {lead.phone}
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-500 dark:text-gray-400 text-xs italic">
                  Telefone indisponível
                </span>
              </div>
            )}

            {lead.website ? (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  <Globe className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="text-blue-700 dark:text-blue-300 font-medium gerador-texto-claro truncate">
                    Website disponível
                  </span>
                </div>
                <a
                  href={lead.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200 text-xs font-medium flex-shrink-0 ml-2"
                >
                  <span>Acessar</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-sm">
                <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-500 dark:text-gray-400 text-xs italic">
                  Website indisponível
                </span>
              </div>
            )}
          </div>

          {/* Redes Sociais e Dados da Empresa */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            {lead.instagram && (
              <a
                href={lead.instagram}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center space-x-1 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-md transition-colors duration-200 text-xs font-medium"
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                <span>Instagram</span>
              </a>
            )}

            {(lead.cnpj || lead.company_size) && (
              <div className="w-full flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                {lead.cnpj && <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">CNPJ: {lead.cnpj}</span>}
                {lead.company_size && <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">{lead.company_size}</span>}
              </div>
            )}
          </div>

          {/* Endereço - Altura Fixa com Truncate */}
          <div className="flex items-start space-x-2 pt-2 border-t border-gray-200 dark:border-gray-700" style={{ minHeight: '50px' }}>
            <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300 line-clamp-2">
              {lead.address}
            </span>
          </div>

          {/* Horários - Sempre presente */}
          <div className="mt-3">
            {lead.opening_hours && lead.opening_hours.length > 0 ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowHours(true);
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-sm font-medium"
              >
                <Clock className="w-4 h-4" />
                Ver horários
              </button>
            ) : (
              <button
                disabled
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 text-red-600 dark:text-red-400 text-sm font-medium cursor-not-allowed"
              >
                <Clock className="w-4 h-4" />
                Horários indisponíveis
              </button>
            )}
          </div>

          {/* Galeria de Fotos - Altura Fixa */}
          <div className="mt-3" style={{ minHeight: '100px' }}>
            {lead.photos && lead.photos.length > 0 && (
              <>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">📸 Fotos do estabelecimento</p>
                <div className="grid grid-cols-3 gap-2">
                  {lead.photos.slice(0, 3).map((photo, i) => (
                    <img
                      key={i}
                      src={photo}
                      alt={`${lead.name} - foto ${i + 1}`}
                      className="w-full h-20 object-cover rounded border border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(photo, '_blank');
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div >

      {/* Modal de Horários - Renderizado via Portal */}
      {
        showHours && createPortal(
          <div
            className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4"
            onClick={(e) => {
              e.stopPropagation();
              setShowHours(false);
            }}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md sm:max-w-lg max-h-[90vh] sm:max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white flex-shrink-0" />
                    <h3 className="text-base sm:text-lg font-bold text-white">Horários de Funcionamento</h3>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowHours(false);
                    }}
                    className="text-white hover:bg-white/20 rounded-full p-1 transition-colors flex-shrink-0"
                    aria-label="Fechar"
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-white/90 mt-1 truncate">{lead.name}</p>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6 max-h-[calc(90vh-120px)] sm:max-h-[60vh] overflow-y-auto bg-white dark:bg-gray-800">
                <div className="space-y-2">
                  {lead.opening_hours && lead.opening_hours.map((hours, i) => {
                    const [day, time] = hours.split(': ');
                    return (
                      <div
                        key={i}
                        className="flex justify-between items-center px-3 sm:px-4 py-2 sm:py-2.5 bg-white dark:bg-gray-700/50 rounded-lg border border-blue-100 dark:border-gray-600"
                      >
                        <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                          {day}
                        </span>
                        <span className="text-xs sm:text-sm tabular-nums text-blue-600 dark:text-blue-400 font-semibold">
                          {time}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )
      }
    </>
  )
}
