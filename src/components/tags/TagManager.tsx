import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Hash, Search, Filter } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'

interface Tag {
  id: string
  name: string
  color: string
  count: number
  category?: string
}

interface TagManagerProps {
  tags: Tag[]
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  onCreateTag?: (tag: Omit<Tag, 'id' | 'count'>) => void
  onDeleteTag?: (tagId: string) => void
  className?: string
}

const PRESET_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green

  '#8B5CF6', // purple
  '#F59E0B', // yellow
  '#EF4444', // red
  '#6366F1', // indigo
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F97316', // orange
  '#84CC16', // lime
]

const TAG_CATEGORIES = [
  'Localização',
  'Tipo de Negócio',
  'Qualidade',
  'Status',
  'Campanha',
  'Personalizada'
]

export default function TagManager({
  tags,
  selectedTags,
  onTagsChange,
  onCreateTag,
  onDeleteTag,
  className = ''
}: TagManagerProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState(PRESET_COLORS[0])
  const [newTagCategory, setNewTagCategory] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  // Filtrar tags baseado na busca e categoria
  const filteredTags = tags.filter(tag => {
    const matchesSearch = tag.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || tag.category === filterCategory
    return matchesSearch && matchesCategory
  })

  // Agrupar tags por categoria
  const groupedTags = filteredTags.reduce((acc, tag) => {
    const category = tag.category || 'Sem Categoria'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(tag)
    return acc
  }, {} as Record<string, Tag[]>)

  const handleCreateTag = () => {
    if (!newTagName.trim() || !onCreateTag) return

    onCreateTag({
      name: newTagName.trim(),
      color: newTagColor,
      category: newTagCategory || undefined
    })

    // Reset form
    setNewTagName('')
    setNewTagColor(PRESET_COLORS[0])
    setNewTagCategory('')
    setIsCreating(false)
  }

  const toggleTag = (tagId: string) => {
    const newSelectedTags = selectedTags.includes(tagId)
      ? selectedTags.filter(id => id !== tagId)
      : [...selectedTags, tagId]

    onTagsChange(newSelectedTags)
  }

  const clearAllTags = () => {
    onTagsChange([])
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Hash className="w-5 h-5" />
            <span>Tags e Categorias</span>
          </div>

          {onCreateTag && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreating(!isCreating)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Nova Tag
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search and Filter */}
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {TAG_CATEGORIES.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selected Tags */}
        {selectedTags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Tags Selecionadas ({selectedTags.length})
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllTags}
                className="text-blue-600 hover:text-blue-800"
              >
                Limpar Todas
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedTags.map(tagId => {
                const tag = tags.find(t => t.id === tagId)
                if (!tag) return null

                return (
                  <motion.div
                    key={tagId}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    layout
                  >
                    <Badge
                      variant="secondary"
                      className="cursor-pointer hover:bg-red-100 transition-colors"
                      style={{ backgroundColor: tag.color + '20', color: tag.color }}
                      onClick={() => toggleTag(tagId)}
                    >
                      {tag.name}
                      <X className="w-3 h-3 ml-1" />
                    </Badge>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Create New Tag Form */}
        <AnimatePresence>
          {isCreating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 border border-border rounded-lg bg-muted"
            >
              <div className="space-y-3">
                <Input
                  placeholder="Nome da tag..."
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateTag()}
                />

                <div className="grid grid-cols-2 gap-3">
                  <Select value={newTagCategory} onValueChange={setNewTagCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Categoria (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {TAG_CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex space-x-1">
                    {PRESET_COLORS.slice(0, 5).map(color => (
                      <button
                        key={color}
                        onClick={() => setNewTagColor(color)}
                        className={`w-8 h-8 rounded-full border-2 ${
                          newTagColor === color ? 'border-gray-800 dark:border-white' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={handleCreateTag}
                    disabled={!newTagName.trim()}
                  >
                    Criar Tag
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCreating(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tags List */}
        <div className="space-y-4">
          {Object.entries(groupedTags).map(([category, categoryTags]) => (
            <div key={category}>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {category}
              </h4>

              <div className="flex flex-wrap gap-2">
                {categoryTags.map(tag => (
                  <motion.div
                    key={tag.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Badge
                      variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                      className="cursor-pointer transition-all hover:shadow-md group"
                      style={{
                        backgroundColor: selectedTags.includes(tag.id) ? tag.color : 'transparent',
                        borderColor: tag.color,
                        color: selectedTags.includes(tag.id) ? 'white' : tag.color
                      }}
                      onClick={() => toggleTag(tag.id)}
                    >
                      <span>{tag.name}</span>
                      <span className="ml-1 text-xs opacity-70">
                        ({tag.count})
                      </span>

                      {onDeleteTag && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteTag(tag.id)
                          }}
                          className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {filteredTags.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchTerm || filterCategory !== 'all'

              ? 'Nenhuma tag encontrada com os filtros aplicados'
              : 'Nenhuma tag criada ainda'
            }
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Hook para gerenciar tags
export function useTagManager() {
  const [tags, setTags] = useState<Tag[]>([
    // Tags padrão
    { id: '1', name: 'São Paulo', color: '#3B82F6', count: 45, category: 'Localização' },
    { id: '2', name: 'Rio de Janeiro', color: '#10B981', count: 32, category: 'Localização' },
    { id: '3', name: 'Restaurante', color: '#F59E0B', count: 78, category: 'Tipo de Negócio' },
    { id: '4', name: 'Clínica', color: '#8B5CF6', count: 23, category: 'Tipo de Negócio' },
    { id: '5', name: 'Alta Qualidade', color: '#10B981', count: 56, category: 'Qualidade' },
    { id: '6', name: 'Potencial Alto', color: '#EF4444', count: 34, category: 'Status' },
  ])

  const createTag = (newTag: Omit<Tag, 'id' | 'count'>) => {
    const tag: Tag = {
      ...newTag,
      id: Date.now().toString(),
      count: 0
    }
    setTags(prev => [...prev, tag])
  }

  const deleteTag = (tagId: string) => {
    setTags(prev => prev.filter(tag => tag.id !== tagId))
  }

  const updateTagCount = (tagId: string, count: number) => {
    setTags(prev => prev.map(tag =>

      tag.id === tagId ? { ...tag, count } : tag
    ))
  }

  return {
    tags,
    createTag,
    deleteTag,
    updateTagCount
  }
}
