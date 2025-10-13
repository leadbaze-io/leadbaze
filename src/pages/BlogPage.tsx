import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader, ArrowLeft, Search, X, Filter, ChevronDown, Mail, Phone } from 'lucide-react';
import LogoImage from '../components/LogoImage';
import * as BlogTypes from '../types/blog';

type BlogPost = BlogTypes.BlogPost;
type BlogPagination = BlogTypes.BlogPagination;
type BlogFilters = BlogTypes.BlogFilters;
import { BlogService } from '../lib/blogService';
import BlogPostCard from '../components/blog/BlogPostCard';
import ScrollToTopButton from '../components/ScrollToTopButton';

export default function BlogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [pagination, setPagination] = useState<BlogPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<BlogTypes.BlogCategory[]>([]);

  // Estados para controlar a navbar
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Extract filters from URL params - otimizado com useMemo
  const filters: BlogFilters = useMemo(() => ({
    category: searchParams.get('category') || undefined,
    tag: searchParams.get('tag') || undefined,
    search: searchParams.get('search') || undefined,
    sortBy: (searchParams.get('sortBy') as BlogFilters['sortBy']) || 'newest'
  }), [searchParams]);

  // Função para controlar a visibilidade da navbar baseada no scroll
  const controlNavbar = useCallback(() => {
    if (typeof window !== 'undefined') {
      const currentScrollY = window.scrollY;

      // Se está scrollando para baixo e a navbar está visível, esconde
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsNavbarVisible(false);
      }
      // Se está scrollando para cima, mostra a navbar
      else if (currentScrollY < lastScrollY) {
        setIsNavbarVisible(true);
      }

      setLastScrollY(currentScrollY);
    }
  }, [lastScrollY]);

  const currentPage = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      try {
        const { posts: postsData, pagination: paginationData } = await BlogService.getPosts(
          filters,
          currentPage,
          9 // 9 posts per page (3x3 grid)
        );

        setPosts(postsData);
        setPagination(paginationData);
      } catch (error) {

      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [searchParams, currentPage, filters]);

  // Forçar modo claro no Blog
  useEffect(() => {
    document.documentElement.classList.remove('dark');

  }, []);

  // Adicionar listener de scroll para controlar a navbar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlNavbar, { passive: true });

      return () => {
        window.removeEventListener('scroll', controlNavbar);
      };
    }
  }, [controlNavbar]);

  // Load categories for filter dropdown
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await BlogService.getCategories();
        setCategories(categoriesData);
      } catch (error) {

      }
    };

    loadCategories();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      // Para filtros - fechar se clicar fora do dropdown
      if (!target.closest('.filters-dropdown')) {
        setShowFilters(false);
      }

      // Para busca - fechar apenas se clicar fora da barra de pesquisa expandida
      if (showSearch && !target.closest('.search-bar-expanded')) {
        setShowSearch(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSearch]);

  const handleFiltersChange = (newFilters: BlogFilters) => {
    const params = new URLSearchParams();

    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.tag) params.set('tag', newFilters.tag);
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.sortBy && newFilters.sortBy !== 'newest') params.set('sortBy', newFilters.sortBy);

    // Reset to first page when filters change
    params.delete('page');

    setSearchParams(params);
  };

  const handleSearch = (search: string) => {
    const params = new URLSearchParams(searchParams);
    if (search.trim()) {
      params.set('search', search.trim());
    } else {
      params.delete('search');
    }
    params.delete('page');
    setSearchParams(params);
    setShowSearch(false);
    setSearchTerm('');
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', page.toString());
    }
    setSearchParams(params);
  };
  const getPageDescription = () => {
    if (filters.category || filters.tag || filters.search) {
      return `${pagination?.totalPosts || 0} artigo(s) encontrado(s)`;
    }
    return '';
  };

  return (
    <div className="min-h-screen bg-gray-50">
             {/* Header com AnimatePresence para mostrar/esconder */}
             <AnimatePresence>
               {isNavbarVisible && (
                 <motion.div
                   initial={{ y: -100, opacity: 0 }}
                   animate={{ y: 0, opacity: 1 }}
                   exit={{ y: -100, opacity: 0 }}
                   transition={{ duration: 0.3, ease: "easeInOut" }}
                   className="fixed top-16 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg"
                 >
                   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                     <div className="flex items-center justify-between py-4">
                       <div className="flex items-center space-x-4">
                         <Link
                           to="/"
                           className="flex items-center text-gray-600 hover:text-gray-900 transition-colors font-medium"
                         >
                           <ArrowLeft className="w-5 h-5 mr-2" />
                           Voltar ao LeadBaze
                         </Link>
                       </div>

                       <div className="flex items-center space-x-4">
                         {/* Search Icon */}
                         <button
                           onClick={() => {
                             setShowSearch(!showSearch);
                             setShowFilters(false);
                           }}
                           className="search-dropdown p-2 text-gray-600 hover:text-green-600 transition-colors"
                         >
                           <Search className="w-5 h-5" />
                         </button>

                         {/* Filters Dropdown */}
                         <div className="relative filters-dropdown">
                           <button
                             onClick={() => {
                               setShowFilters(!showFilters);
                               setShowSearch(false);
                             }}
                             className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-green-600 transition-colors border border-gray-300 rounded-lg hover:border-green-500"
                           >
                             <Filter className="w-4 h-4" />
                             <span className="text-sm font-medium">Filtros</span>
                             <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                             {(filters.category || filters.sortBy !== 'newest') && (
                               <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                             )}
                           </button>

                           {/* Dropdown Menu */}
                           {showFilters && (
                             <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                               <div className="p-4 space-y-4">
                                 {/* Categories */}
                                 <div>
                                   <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                                     Categorias
                                   </h3>
                                   <div className="space-y-2">
                                     <button
                                       onClick={() => {
                                         handleFiltersChange({ ...filters, category: undefined });
                                         setShowFilters(false);
                                       }}
                                       className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                                         !filters.category
                                           ? 'bg-green-600 text-white'
                                           : 'text-gray-700 hover:bg-gray-100'
                                       }`}
                                     >
                                       Todas as Categorias
                                     </button>
                                     {categories.map(category => (
                                       <button
                                         key={category.id}
                                         onClick={() => {
                                           handleFiltersChange({ ...filters, category: category.slug });
                                           setShowFilters(false);
                                         }}
                                         className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                                           filters.category === category.slug
                                             ? 'bg-green-600 text-white'
                                             : 'text-gray-700 hover:bg-gray-100'
                                         }`}
                                       >
                                         {category.name}
                                         {category.postCount && category.postCount > 0 && (
                                           <span className="ml-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                             {category.postCount}
                                           </span>
                                         )}
                                       </button>
                                     ))}
                                   </div>
                                 </div>

                                 {/* Sort Options */}
                                 <div>
                                   <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                                     Ordenar por
                                   </h3>
                                   <div className="space-y-2">
                                     {[
                                       { value: 'newest', label: 'Mais Recentes' },
                                       { value: 'popular', label: 'Mais Populares' },
                                       { value: 'oldest', label: 'Mais Antigos' }
                                     ].map(option => (
                                       <button
                                         key={option.value}
                                         onClick={() => {
                                           handleFiltersChange({ ...filters, sortBy: option.value as BlogFilters['sortBy'] });
                                           setShowFilters(false);
                                         }}
                                         className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                                           filters.sortBy === option.value
                                             ? 'bg-green-600 text-white'
                                             : 'text-gray-700 hover:bg-gray-100'
                                         }`}
                                       >
                                         {option.label}
                                       </button>
                                     ))}
                                   </div>
                                 </div>

                                 {/* Clear Filters */}
                                 {(filters.category || filters.sortBy !== 'newest') && (
                                   <div className="pt-3 border-t border-gray-200">
                                     <button
                                       onClick={() => {
                                         handleFiltersChange({});
                                         setShowFilters(false);
                                       }}
                                       className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors text-sm"
                                     >
                                       Limpar Filtros
                                     </button>
                                   </div>
                                 )}
                               </div>
                             </div>
                           )}
                         </div>
                       </div>
                     </div>
                   </div>
                 </motion.div>
               )}
             </AnimatePresence>

             {/* Espaçador para compensar a navbar fixa */}
             <div className="h-36"></div>

        {/* Search Bar */}
        {showSearch && (
          <div className="search-bar-expanded bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar artigos por título, conteúdo ou tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchTerm)}
                  className="w-full pl-12 pr-16 py-3 border border-gray-300  rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500  bg-white  text-gray-900  placeholder-gray-500  transition-colors"
                  autoFocus
                />
                <div className="absolute inset-y-0 right-0 flex items-center space-x-2 pr-4">
                  <button
                    onClick={() => handleSearch(searchTerm)}
                    className="px-4 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    Buscar
                  </button>
                  <button
                    onClick={() => {
                      setShowSearch(false);
                      setSearchTerm('');
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600  transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

                          {/* Hero Section - Professional */}
          <div className="bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="text-center max-w-4xl mx-auto">
                                 {/* Título Principal */}
                 <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                   <span className="bg-gradient-to-r from-green-500 via-green-400 to-green-600 bg-clip-text text-transparent font-extrabold" style={{WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                     LeadBaze
                   </span>
                   <span className="text-gray-900  ml-4">
                     Blog
                   </span>
                 </h1>

                 {/* Texto de Impacto */}
                 <p className="text-lg text-gray-600  mb-4 font-medium">
                   Sua fonte definitiva de informação e prospecção B2B
                 </p>

                {/* Estatísticas */}
                {getPageDescription() && (
                  <div className="text-base font-medium text-green-600 ">
                    {getPageDescription()}
                  </div>
                )}
             </div>
           </div>
         </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Content sem sidebar - layout full width */}

        {/* Grid de Artigos - Layout Mailchimp */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader className="w-8 h-8 animate-spin text-green-600" />
            <span className="ml-3 text-gray-600">
              Carregando artigos...
            </span>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum artigo encontrado
            </h3>
            <p className="text-gray-600 mb-6">
              Tente ajustar seus filtros ou buscar por outros termos.
            </p>
            <button
              onClick={() => handleFiltersChange({})}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Ver Todos os Artigos
            </button>
          </div>
        ) : (
          <>
            {/* Grid Clean e Organizado */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <BlogPostCard

                    post={post}

                    variant="default"
                    showAuthor={true}
                    showStats={false}
                  />
                </motion.div>
              ))}
            </motion.div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="mt-12 flex justify-center">
                    <nav className="flex items-center space-x-2">
                      {/* Previous Button */}
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={!pagination.hasPrevPage}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          pagination.hasPrevPage
                            ? 'bg-white  text-gray-700  hover:bg-gray-50  border border-gray-300 '
                            : 'bg-gray-100  text-gray-400  cursor-not-allowed'
                        }`}
                      >
                        Anterior
                      </button>

                      {/* Page Numbers */}
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                            page === currentPage
                              ? 'bg-green-600 text-white'
                              : 'bg-white  text-gray-700  hover:bg-gray-50  border border-gray-300 '
                          }`}
                        >
                          {page}
                        </button>
                      ))}

                      {/* Next Button */}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!pagination.hasNextPage}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          pagination.hasNextPage
                            ? 'bg-white  text-gray-700  hover:bg-gray-50  border border-gray-300 '
                            : 'bg-gray-100  text-gray-400  cursor-not-allowed'
                        }`}
                      >
                        Próximo
                      </button>
                    </nav>
                  </div>
                )}
          </>
        )}
      </div>

      {/* Newsletter Section */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h3 className="text-xl md:text-2xl font-bold mb-3">
              <span className="bg-gradient-to-r from-green-600 via-green-500 to-emerald-600 bg-clip-text text-transparent">
                LeadBaze
              </span>
              <span className="text-black ml-2">
                Newsletter
              </span>
            </h3>
            <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
              Receba estratégias exclusivas de geração de leads B2B e automação de vendas.
            </p>
            <div className="bg-white rounded-lg shadow-md p-4 max-w-sm mx-auto border border-gray-100">
              <form className="space-y-2">
                <input
                  type="email"
                  placeholder="Digite seu e-mail"
                  className="w-full px-3 py-2.5 rounded-md border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-all text-center text-sm"
                />
                <button
                  type="submit"
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-green-600 via-green-500 to-emerald-600 hover:from-green-700 hover:via-green-600 hover:to-emerald-700 text-white font-medium rounded-md transition-all duration-200 text-sm"
                >
                  Assinar
                </button>
              </form>
              <div className="flex items-center justify-center mt-3 space-x-2 text-xs text-gray-500">
                <span>✓ Sem spam</span>
                <span>•</span>
                <span>✓ Cancele quando quiser</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Cópia Exata da Landing Page */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo e Descrição */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <LogoImage className="h-9 w-auto" />
              </div>
              <p className="text-gray-300 mb-6 max-w-md">
                A plataforma mais eficiente para gerar leads qualificados usando dados do Google Maps.

                Transforme localizações em oportunidades de negócio.
              </p>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2 text-gray-300">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">leadbaze@gmail.com</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-300">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">31 97266-1278</span>
                </div>
              </div>
            </div>

            {/* Links Rápidos */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Links Rápidos</h3>
              <div className="space-y-2">
                <button

                  onClick={() => {
                    navigate('/');
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }, 100);
                  }}
                  className="block text-gray-300 hover:text-white transition-colors text-left w-full"
                >
                  Início
                </button>
                <button

                  onClick={() => {
                    navigate('/dashboard');
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }, 100);
                  }}
                  className="block text-gray-300 hover:text-white transition-colors text-left w-full"
                >
                  Dashboard
                </button>
                <button

                  onClick={() => {
                    navigate('/gerador');
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }, 100);
                  }}
                  className="block text-gray-300 hover:text-white transition-colors text-left w-full"
                >
                  Gerar Leads
                </button>
                <button

                  onClick={() => {
                    navigate('/disparador');
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }, 100);
                  }}
                  className="block text-gray-300 hover:text-white transition-colors text-left w-full"
                >
                  Disparador
                </button>
                <button

                  onClick={() => {
                    navigate('/blog');
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }, 100);
                  }}
                  className="block text-gray-300 hover:text-white transition-colors text-left w-full"
                >
                  Blog
                </button>
              </div>
            </div>

            {/* Suporte */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Suporte</h3>
              <div className="space-y-2">
                <button

                  onClick={() => {
                    navigate('/');
                    setTimeout(() => {
                      const faqSection = document.getElementById('faq-section-desktop');
                      if (faqSection) {
                        faqSection.scrollIntoView({

                          behavior: 'smooth',

                          block: 'start'
                        });
                      }
                    }, 100);
                  }}
                  className="block text-gray-300 hover:text-white transition-colors text-left w-full"
                >
                  FAQ
                </button>
                <button

                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="block text-gray-300 hover:text-white transition-colors text-left w-full"
                >
                  Contato
                </button>
              </div>
            </div>
          </div>

          {/* Linha de Copyright */}
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 LeadBaze. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* Botão Voltar ao Topo */}
      <ScrollToTopButton />
    </div>
  );
}
