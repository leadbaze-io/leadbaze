import * as BlogTypes from '../types/blog';

type BlogPost = BlogTypes.BlogPost;

export interface N8NWebhookConfig {

  webhookUrl: string;

  apiKey?: string;

  enabled: boolean;

}

export interface N8NPostData {

  title: string;

  content: string;

  excerpt: string;

  category: string;

  tags: string[];

  author: {

    name: string;

    email?: string;

  };

  featuredImage?: string;

  seoTitle?: string;

  seoDescription?: string;

  seoKeywords?: string[];

  publishedAt?: string;

  published?: boolean;

}

export interface N8NWebhookResponse {

  success: boolean;

  postId?: string;

  slug?: string;

  message?: string;

  error?: string;

}

export class N8NWebhookService {

  private static config: N8NWebhookConfig = {

    webhookUrl: process.env.VITE_N8N_WEBHOOK_URL || '',

    apiKey: process.env.VITE_N8N_API_KEY || '',

    enabled: process.env.VITE_N8N_ENABLED === 'true'

  };

  /**

   * Configura o webhook do N8N

   */

  static setConfig(config: Partial<N8NWebhookConfig>) {

    this.config = { ...this.config, ...config };

  }

  /**

   * Envia um novo post para o webhook do N8N

   */

  static async createPost(postData: N8NPostData): Promise<N8NWebhookResponse> {

    if (!this.config.enabled || !this.config.webhookUrl) {

      throw new Error('N8N webhook não configurado ou desabilitado');

    }

    try {

      const payload = {

        action: 'create_post',

        data: {

          ...postData,

          timestamp: new Date().toISOString(),

          source: 'leadbaze-blog'

        }

      };

      const headers: Record<string, string> = {

        'Content-Type': 'application/json'

      };

      if (this.config.apiKey) {

        headers['Authorization'] = `Bearer ${this.config.apiKey}`;

      }

      const response = await fetch(this.config.webhookUrl, {

        method: 'POST',

        headers,

        body: JSON.stringify(payload)

      });

      if (!response.ok) {

        throw new Error(`HTTP ${response.status}: ${response.statusText}`);

      }

      const result = await response.json();

      return result as N8NWebhookResponse;

    } catch (error) {

      throw error;

    }

  }

  /**

   * Atualiza um post existente via webhook do N8N

   */

  static async updatePost(postId: string, postData: Partial<N8NPostData>): Promise<N8NWebhookResponse> {

    if (!this.config.enabled || !this.config.webhookUrl) {

      throw new Error('N8N webhook não configurado ou desabilitado');

    }

    try {

      const payload = {

        action: 'update_post',

        data: {

          id: postId,

          ...postData,

          timestamp: new Date().toISOString(),

          source: 'leadbaze-blog'

        }

      };

      const headers: Record<string, string> = {

        'Content-Type': 'application/json'

      };

      if (this.config.apiKey) {

        headers['Authorization'] = `Bearer ${this.config.apiKey}`;

      }

      const response = await fetch(this.config.webhookUrl, {

        method: 'POST',

        headers,

        body: JSON.stringify(payload)

      });

      if (!response.ok) {

        throw new Error(`HTTP ${response.status}: ${response.statusText}`);

      }

      const result = await response.json();

      return result as N8NWebhookResponse;

    } catch (error) {

      throw error;

    }

  }

  /**

   * Deleta um post via webhook do N8N

   */

  static async deletePost(postId: string): Promise<N8NWebhookResponse> {

    if (!this.config.enabled || !this.config.webhookUrl) {

      throw new Error('N8N webhook não configurado ou desabilitado');

    }

    try {

      const payload = {

        action: 'delete_post',

        data: {

          id: postId,

          timestamp: new Date().toISOString(),

          source: 'leadbaze-blog'

        }

      };

      const headers: Record<string, string> = {

        'Content-Type': 'application/json'

      };

      if (this.config.apiKey) {

        headers['Authorization'] = `Bearer ${this.config.apiKey}`;

      }

      const response = await fetch(this.config.webhookUrl, {

        method: 'POST',

        headers,

        body: JSON.stringify(payload)

      });

      if (!response.ok) {

        throw new Error(`HTTP ${response.status}: ${response.statusText}`);

      }

      const result = await response.json();

      return result as N8NWebhookResponse;

    } catch (error) {

      throw error;

    }

  }

  /**

   * Sincroniza posts do N8N com o banco local

   */

  static async syncPosts(): Promise<BlogPost[]> {

    if (!this.config.enabled || !this.config.webhookUrl) {

      throw new Error('N8N webhook não configurado ou desabilitado');

    }

    try {

      const payload = {

        action: 'sync_posts',

        data: {

          timestamp: new Date().toISOString(),

          source: 'leadbaze-blog'

        }

      };

      const headers: Record<string, string> = {

        'Content-Type': 'application/json'

      };

      if (this.config.apiKey) {

        headers['Authorization'] = `Bearer ${this.config.apiKey}`;

      }

      const response = await fetch(this.config.webhookUrl, {

        method: 'POST',

        headers,

        body: JSON.stringify(payload)

      });

      if (!response.ok) {

        throw new Error(`HTTP ${response.status}: ${response.statusText}`);

      }

      const result = await response.json();

      return result.posts || [];

    } catch (error) {

      throw error;

    }

  }

  /**

   * Testa a conexão com o webhook do N8N

   */

  static async testConnection(): Promise<boolean> {

    if (!this.config.webhookUrl) {

      return false;

    }

    try {

      const payload = {

        action: 'test_connection',

        data: {

          timestamp: new Date().toISOString(),

          source: 'leadbaze-blog'

        }

      };

      const headers: Record<string, string> = {

        'Content-Type': 'application/json'

      };

      if (this.config.apiKey) {

        headers['Authorization'] = `Bearer ${this.config.apiKey}`;

      }

      const response = await fetch(this.config.webhookUrl, {

        method: 'POST',

        headers,

        body: JSON.stringify(payload)

      });

      return response.ok;

    } catch (error) {

      return false;

    }

  }

  /**

   * Converte dados do blog para formato N8N

   */

  static blogPostToN8NData(post: Partial<BlogPost>): N8NPostData {

    return {

      title: post.title || '',

      content: post.content || '',

      excerpt: post.excerpt || '',

      category: post.category?.slug || '',

      tags: post.tags?.map(tag => tag.slug) || [],

      author: {

        name: post.author?.name || '',

      },

      featuredImage: post.featuredImage,

      seoTitle: post.seoTitle,

      seoDescription: post.seoDescription,

      seoKeywords: post.seoKeywords,

      publishedAt: post.publishedAt,

      published: post.published

    };

  }

  /**

   * Valida os dados antes de enviar para N8N

   */

  static validatePostData(data: N8NPostData): { valid: boolean; errors: string[] } {

    const errors: string[] = [];

    if (!data.title?.trim()) {

      errors.push('Título é obrigatório');

    }

    if (!data.content?.trim()) {

      errors.push('Conteúdo é obrigatório');

    }

    if (!data.excerpt?.trim()) {

      errors.push('Resumo é obrigatório');

    }

    if (!data.category?.trim()) {

      errors.push('Categoria é obrigatória');

    }

    if (!data.author?.name?.trim()) {

      errors.push('Nome do autor é obrigatório');

    }

    return {

      valid: errors.length === 0,

      errors

    };

  }

  /**

   * Gera um exemplo de configuração do workflow N8N

   */

  static generateN8NWorkflowExample() {

    return {

      name: 'LeadBaze Blog Integration',

      description: 'Workflow para integração automática do blog LeadBaze',

      nodes: [

        {

          name: 'Webhook',

          type: 'n8n-nodes-base.webhook',

          parameters: {

            httpMethod: 'POST',

            path: 'leadbaze-blog',

            responseMode: 'responseNode'

          }

        },

        {

          name: 'Switch',

          type: 'n8n-nodes-base.switch',

          parameters: {

            conditions: {

              options: {

                conditions: [

                  {

                    name: 'create_post',

                    condition: {

                      leftValue: '={{$json.action}}',

                      operation: 'equal',

                      rightValue: 'create_post'

                    }

                  },

                  {

                    name: 'update_post',

                    condition: {

                      leftValue: '={{$json.action}}',

                      operation: 'equal',

                      rightValue: 'update_post'

                    }

                  }

                ]

              }

            }

          }

        }

      ]

    };

  }

}
