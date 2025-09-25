export interface BlogCategory {

  id: string;

  name: string;

  slug: string;

  description?: string;

  color?: string;

  icon?: string;

  postCount?: number;

}

export interface BlogTag {

  id: string;

  name: string;

  slug: string;

  postCount?: number;

}

export interface BlogPost {

  id: string;

  title: string;

  slug: string;

  excerpt: string;

  content: string;

  author: {

    name: string;

    avatar?: string;

    bio?: string;

  };

  category: BlogCategory;

  tags: BlogTag[];

  featuredImage?: string;

  published: boolean;

  publishedAt: string;

  createdAt: string;

  updatedAt: string;

  readTime: number;

  views?: number;

  likes?: number;

  seoTitle?: string;

  seoDescription?: string;

  seoKeywords?: string[];

}

export interface BlogPagination {

  currentPage: number;

  totalPages: number;

  totalPosts: number;

  postsPerPage: number;

  hasNextPage: boolean;

  hasPrevPage: boolean;

}

export interface BlogFilters {

  category?: string;

  tag?: string;

  search?: string;

  sortBy?: 'newest' | 'oldest' | 'popular' | 'trending';

}

export interface BlogStats {

  totalPosts: number;

  totalCategories: number;

  totalTags: number;

  totalViews: number;

  popularPosts: BlogPost[];

  recentPosts: BlogPost[];

}
