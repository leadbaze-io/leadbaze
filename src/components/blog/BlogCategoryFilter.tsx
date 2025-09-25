import { useState, useEffect } from 'react';
import { Filter, X } from 'lucide-react';
import * as BlogTypes from '../../types/blog';
type BlogCategory = BlogTypes.BlogCategory;
type BlogFilters = BlogTypes.BlogFilters;
import { BlogService } from '../../lib/blogService';

interface BlogCategoryFilterProps {
  filters: BlogFilters;
  onFiltersChange: (filters: BlogFilters) => void;
}

export default function BlogCategoryFilter({

  filters,

  onFiltersChange
}: BlogCategoryFilterProps) {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await BlogService.getCategories();
        setCategories(data);
      } catch (error) {

      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleCategoryChange = (categorySlug: string) => {
    const newCategory = filters.category === categorySlug ? undefined : categorySlug;
    onFiltersChange({
      ...filters,
      category: newCategory
    });
  };

  const handleSortChange = (sortBy: BlogFilters['sortBy']) => {
    onFiltersChange({
      ...filters,
      sortBy
    });
  };
  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = filters.category || filters.search || filters.sortBy;

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Categories Skeleton */}
        <div className="flex flex-wrap gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 w-24 bg-gray-200  rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

        return (
     <div className="space-y-4">

       {/* Mobile Filter Toggle */}
       <div className="md:hidden">
         <button
           onClick={() => setIsFilterOpen(!isFilterOpen)}
           className="flex items-center justify-between w-full px-3 py-2 bg-white  border border-gray-200  rounded-lg text-gray-700  text-sm"
         >
           <span className="flex items-center">
             <Filter className="w-4 h-4 mr-2" />
             Filtros
             {hasActiveFilters && (
               <span className="ml-2 w-2 h-2 bg-purple-500 rounded-full" />
             )}
           </span>
           <X className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-45' : ''}`} />
         </button>
       </div>

      {/* Filters Content */}
      <div className={`space-y-4 ${isFilterOpen ? 'block' : 'hidden md:block'}`}>
        {/* Categories */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700  mb-3 uppercase tracking-wide">
            Categorias
          </h3>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => handleCategoryChange('')}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                !filters.category
                  ? 'bg-gray-900  text-white '
                  : 'bg-gray-100  text-gray-700  hover:bg-gray-200 '
              }`}
            >
              Todos
            </button>

            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.slug)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filters.category === category.slug
                    ? 'bg-gray-900  text-white '
                    : 'bg-gray-100  text-gray-700  hover:bg-gray-200 '
                }`}
              >
                {category.name}
                {category.postCount && (
                  <span className="ml-1 text-xs opacity-75">
                    ({category.postCount})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700  mb-3 uppercase tracking-wide">
            Ordenar por
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {[
              { value: 'newest', label: 'Mais Recentes' },
              { value: 'popular', label: 'Mais Populares' },
              { value: 'oldest', label: 'Mais Antigos' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => handleSortChange(option.value as BlogFilters['sortBy'])}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filters.sortBy === option.value
                    ? 'bg-gray-900  text-white '
                    : 'bg-gray-200 '
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

                 {/* Clear Filters */}
         {hasActiveFilters && (
           <div className="pt-3 border-t border-gray-200 ">
             <button
               onClick={clearFilters}
               className="flex items-center px-3 py-1.5 text-red-600  hover:bg-red-50  rounded-md transition-colors text-sm"
             >
               <X className="w-3 h-3 mr-1.5" />
               Limpar Filtros
             </button>
           </div>
         )}
      </div>
    </div>
  );
}
