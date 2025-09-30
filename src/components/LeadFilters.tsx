import { Input } from "./ui/input"
import { Label } from "./ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"

interface LeadFiltersProps {
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
  leadsPerPage: string
  setLeadsPerPage: (value: string) => void
  onFilterChange?: () => void
  className?: string
}

export function LeadFilters({
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
  leadsPerPage,
  setLeadsPerPage,
  onFilterChange,
  className = ""
}: LeadFiltersProps) {
  const handleFilterChange = (setter: (value: string) => void, value: string) => {
    setter(value)
    if (onFilterChange) {
      onFilterChange()
    }
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 p-4 sm:p-6 bg-muted/50 rounded-xl border border-border/50 ${className}`}>
      <div className="space-y-2">
        <Label className="text-sm font-semibold gerador-texto-claro dark:text-foreground">Buscar</Label>
        <Input
          placeholder="Nome ou endereço..."
          value={searchTerm}
          onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)}
          className="h-10 text-sm w-full border-border/60 gerador-input-claro gerador-input-escuro focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold gerador-texto-claro dark:text-foreground">Cidade</Label>
        <Input
          placeholder="Filtrar por cidade..."
          value={cityFilter}
          onChange={(e) => handleFilterChange(setCityFilter, e.target.value)}
          className="h-10 text-sm w-full border-border/60 gerador-input-claro gerador-input-escuro focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold gerador-texto-claro dark:text-foreground">Avaliação Mínima</Label>
        <Select

          value={ratingFilter}

          onValueChange={(value) => handleFilterChange(setRatingFilter, value)}
        >
          <SelectTrigger className="h-10 text-sm w-full border-border/60 gerador-input-claro gerador-input-escuro focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20">
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent className="bg-popover border border-border shadow-lg">
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="4">4+ estrelas</SelectItem>
            <SelectItem value="3">3+ estrelas</SelectItem>
            <SelectItem value="2">2+ estrelas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold gerador-texto-claro dark:text-foreground">Avaliações</Label>
        <Select

          value={reviewsFilter}

          onValueChange={(value) => handleFilterChange(setReviewsFilter, value)}
        >
          <SelectTrigger className="h-10 text-sm w-full border-border/60 gerador-input-claro gerador-input-escuro focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20">
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent className="bg-popover border border-border shadow-lg">
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

      <div className="space-y-2">
        <Label className="text-sm font-semibold gerador-texto-claro dark:text-foreground">Website</Label>
        <Select

          value={websiteFilter}

          onValueChange={(value) => handleFilterChange(setWebsiteFilter, value)}
        >
          <SelectTrigger className="h-10 text-sm w-full border-border/60 gerador-input-claro gerador-input-escuro focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover border border-border shadow-lg">
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="with">Com website</SelectItem>
            <SelectItem value="without">Sem website</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold gerador-texto-claro dark:text-foreground">Leads por Página</Label>
        <Select

          value={leadsPerPage}

          onValueChange={(value) => handleFilterChange(setLeadsPerPage, value)}
        >
          <SelectTrigger className="h-10 text-sm w-full border-border/60 gerador-input-claro gerador-input-escuro focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover border border-border shadow-lg">
            <SelectItem value="9">9 leads</SelectItem>
            <SelectItem value="18">18 leads</SelectItem>
            <SelectItem value="27">27 leads</SelectItem>
            <SelectItem value="36">36 leads</SelectItem>
            <SelectItem value="45">45 leads</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
