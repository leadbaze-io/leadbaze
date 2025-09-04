import { Link } from 'react-router-dom';
import { Calendar, Clock } from 'lucide-react';
import * as BlogTypes from '../../types/blog';
type BlogPost = BlogTypes.BlogPost;
import { BlogService } from '../../lib/blogService';

interface BlogPostCardProps {
  post: BlogPost;
  variant?: 'default' | 'featured' | 'compact';
  showAuthor?: boolean;
  showCategory?: boolean;
  showStats?: boolean;
}

export default function BlogPostCard({ 
  post, 
  variant = 'default',
  showAuthor = true,
  showCategory = true,
  showStats = true
}: BlogPostCardProps) {
  const formattedDate = BlogService.formatDate(post.publishedAt);
  
  if (variant === 'featured') {
    return (
      <article className="group relative">
        <Link 
          to={`/blog/${post.slug}`}
          className="block bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
        >
          {/* Featured Image */}
          <div className="relative h-64 md:h-80 overflow-hidden">
            <img
              src={post.featuredImage || 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&h=600&fit=crop'}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            
            {/* Category Badge */}
            {showCategory && (
              <div className="absolute top-4 left-4">
                <span className="inline-block px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
                  {post.category.name}
                </span>
              </div>
            )}
            
            {/* Read Time Badge */}
            <div className="absolute top-4 right-4">
              <div className="flex items-center space-x-1 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full border border-white/20 shadow-sm">
                <Clock className="w-3 h-3 text-gray-600" />
                <span className="text-xs font-medium text-gray-700">{post.readTime} min</span>
              </div>
            </div>
          </div>
          
          {/* Content Section */}
          <div className="p-6">
            {/* Title */}
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors leading-tight">
              {post.title}
            </h2>
            
            {/* Excerpt */}
            <p className="text-gray-600 mb-4 leading-relaxed line-clamp-2">
              {post.excerpt}
            </p>
            
            {/* Meta Info */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                {/* Author */}
                {showAuthor && (
                  <div className="flex items-center">
                    <img
                      src={post.author.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'}
                      alt={post.author.name}
                      className="w-6 h-6 rounded-full object-cover mr-2"
                    />
                    <span className="font-medium text-gray-700">{post.author.name}</span>
                  </div>
                )}
                
                {/* Date */}
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                  <span>{formattedDate}</span>
                </div>
              </div>
              
              {/* CTA Button */}
              <div className="flex items-center space-x-2 text-blue-600 font-medium group-hover:text-blue-700 transition-colors">
                <span>Ler artigo</span>
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </div>
        </Link>
      </article>
    );
  }
  
  if (variant === 'compact') {
    return (
      <article className="group">
        <Link 
          to={`/blog/${post.slug}`}
          className="flex items-start space-x-4 p-4 bg-white dark:bg-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          {/* Thumbnail */}
          <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden">
            <img
              src={post.featuredImage || '/images/blog/default-featured.jpg'}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
              {post.title}
            </h3>
            <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400 space-x-3">
              <span>{formattedDate}</span>
              <span>{post.readTime} min</span>
              {showStats && post.views && (
                <span>{post.views} views</span>
              )}
            </div>
          </div>
        </Link>
      </article>
    );
  }
  
  // Default variant - Compact and uniform design
  return (
    <article className="h-full">
      <Link 
        to={`/blog/${post.slug}`}
        className="block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-blue-200 h-full flex flex-col"
      >
        {/* Featured Image */}
        <div className="relative h-40 overflow-hidden">
          <img
            src={post.featuredImage || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop'}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Category Badge */}
          {showCategory && (
            <div className="absolute top-2 left-2">
              <span className="inline-block px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded-md">
                {post.category.name}
              </span>
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2 h-12 leading-tight">
            {post.title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-1">
            {post.excerpt}
          </p>
          
          {/* Meta Info */}
          <div className="pt-3 border-t border-gray-100 mt-auto">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-3">
                {/* Author */}
                {showAuthor && (
                  <div className="flex items-center">
                    <img
                      src={post.author.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'}
                      alt={post.author.name}
                      className="w-5 h-5 rounded-full object-cover mr-1"
                    />
                    <span className="text-xs">{post.author.name}</span>
                  </div>
                )}
                
                {/* Date */}
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span className="text-xs">{formattedDate}</span>
                </div>
              </div>
              
              {/* CTA */}
              <div className="text-blue-600 font-medium text-xs">
                Ler →
              </div>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
