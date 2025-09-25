import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {

  ArrowLeft,

  Calendar,

  Clock,

  Eye,

  Heart,

  User,
  ChevronRight,
  Facebook,
  Twitter,
  Linkedin,
  Link as LinkIcon,
  Mail,
  Phone
} from 'lucide-react';
import LogoImage from '../components/LogoImage';
import * as BlogTypes from '../types/blog';

type BlogPost = BlogTypes.BlogPost;
import { BlogService } from '../lib/blogService';
import ScrollToTopButton from '../components/ScrollToTopButton';

import { toast } from '../hooks/use-toast';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  // Forçar modo claro no Blog
  useEffect(() => {
    document.documentElement.classList.remove('dark');

  }, []);

  useEffect(() => {
    const loadPost = async () => {
      if (!slug) {
        navigate('/blog');
        return;
      }

      try {
        const postData = await BlogService.getPostBySlug(slug);
        if (!postData) {
          navigate('/blog');
          return;
        }
        setPost(postData);
      } catch (error) {

        navigate('/blog');
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [slug, navigate]);

  const handleLike = () => {
    setLiked(!liked);
    toast({
      title: liked ? 'Like removido!' : 'Obrigado pelo like! ❤️',
      description: liked ? 'Você removeu seu like do artigo.' : 'Seu feedback nos ajuda a criar mais conteúdo relevante.',
      variant: 'success',
    });
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = post?.title || '';

    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}&via=LeadBaze`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        toast({
          title: 'Link copiado!',
          description: 'O link do artigo foi copiado para sua área de transferência.',
          variant: 'success',
        });
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/4" />
            <div className="h-12 bg-gray-200 rounded w-3/4" />
            <div className="h-64 bg-gray-200 rounded" />
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  const formattedDate = BlogService.formatDate(post.publishedAt);

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <nav className="flex items-center space-x-2 text-sm">
              <Link
                to="/"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                LeadBaze
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <Link
                to="/blog"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Blog
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900 font-medium truncate max-w-xs">
                {post.title}
              </span>
            </nav>

            <Link
              to="/blog"
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Voltar ao Blog</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article>
          {/* Article Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            {/* Category Badge */}
            <div className="mb-4">
              <Link
                to={`/blog?category=${post.category.slug}`}
                className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full hover:bg-blue-200 transition-colors"
              >
                {post.category.name}
              </Link>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {post.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
              {/* Author */}
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                <span className="font-medium">{post.author.name}</span>
              </div>

              {/* Date */}
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{formattedDate}</span>
              </div>

              {/* Read Time */}
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                <span>{post.readTime} minutos de leitura</span>
              </div>

              {/* Views */}
              {post.views && (
                <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-2" />
                  <span>{post.views.toLocaleString()} visualizações</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Featured Image */}
          {post.featuredImage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-8"
            >
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-64 md:h-80 object-cover rounded-lg"
              />
            </motion.div>
          )}

          {/* Article Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="prose prose-lg max-w-none mb-8"
          >
            <div

              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </motion.div>

                     {/* Tags */}
           {post.tags.length > 0 && (
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6, delay: 0.3 }}
               className="mb-6 pt-4 border-t border-gray-200"
             >
               <h3 className="text-sm font-medium text-gray-600 mb-3 uppercase tracking-wide">
                 Tags relacionadas
               </h3>
               <div className="flex flex-wrap gap-3">
                 {post.tags.map((tag: { id: string; name: string; slug: string }) => (
                   <Link
                     key={tag.id}
                     to={`/blog?tag=${tag.slug}`}
                     onClick={() => window.scrollTo(0, 0)}
                     className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                   >
                     #{tag.name.toLowerCase().replace(/\s+/g, '-')}
                   </Link>
                 ))}
               </div>
             </motion.div>
           )}

          {/* Social Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-8 pt-6 border-t border-gray-200"
          >
            <div className="flex items-center justify-between">
              {/* Like Button */}
              <button
                onClick={handleLike}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  liked
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                <span className="font-medium">{(post.likes || 0) + (liked ? 1 : 0)}</span>
              </button>

              {/* Share Buttons */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 mr-2">Compartilhar:</span>
                <button
                  onClick={() => handleShare('facebook')}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Compartilhar no Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleShare('twitter')}
                  className="p-2 text-blue-400 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Compartilhar no Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleShare('linkedin')}
                  className="p-2 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Compartilhar no LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleShare('copy')}
                  className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  title="Copiar link"
                >
                  <LinkIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Newsletter CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-blue-50 rounded-lg p-6 text-center"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Gostou do conteúdo?
            </h3>
            <p className="text-gray-600 mb-4">
              Receba os melhores artigos sobre geração de leads e automação de vendas diretamente no seu e-mail.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Seu melhor e-mail"
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Assinar
              </button>
            </div>
          </motion.div>
        </article>
      </div>

      {/* Footer - Cópia Exata da Landing Page */}
      <footer className="bg-gray-900 text-white mt-16">
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
