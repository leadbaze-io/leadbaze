import { useState } from 'react';
import { Plus, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface AddPostResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export default function AddPostToQueue() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AddPostResult | null>(null);

  // Gerar conteúdo único baseado no timestamp
  const generateUniqueContent = () => {
    const timestamp = new Date().toISOString();
    const dateStr = new Date().toLocaleDateString('pt-BR');
    const timeStr = new Date().toLocaleTimeString('pt-BR');

    const topics = [
      'Estratégias de Prospecção B2B',
      'Automação de Vendas',
      'Gestão de Leads',
      'Inteligência de Dados',
      'Outbound Marketing',
      'CRM e Vendas',
      'Análise de Performance',
      'Técnicas de Follow-up'
    ];

    const randomTopic = topics[Math.floor(Math.random() * topics.length)];

    return {
      title: `Artigo Automático - ${randomTopic} - ${dateStr}`,
      content: `# ${randomTopic}

Este é um artigo gerado automaticamente pelo sistema de teste do LeadBaze.

## Sobre Este Conteúdo

Este post foi criado automaticamente em **${dateStr} às ${timeStr}** para testar o sistema de processamento em tempo real do blog.

## Principais Tópicos

### 1. Introdução ao ${randomTopic}
- Conceitos fundamentais
- Aplicações práticas
- Benefícios para empresas

### 2. Implementação Prática
- Passo a passo detalhado
- Ferramentas recomendadas
- Casos de sucesso

### 3. Métricas e Resultados
- KPIs importantes
- Como medir o sucesso
- Otimizações contínuas

## Conclusão

O ${randomTopic} é essencial para o crescimento das empresas modernas. Com as estratégias corretas e ferramentas adequadas, é possível alcançar resultados significativos.

---

**Gerado automaticamente pelo sistema LeadBaze em ${timestamp}**`,
      category: 'Automação de Vendas',
      autor: 'Sistema LeadBaze',
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      tags: ['teste', 'automação', 'sistema', randomTopic.toLowerCase().replace(/\s+/g, '-')],
      meta_description: `Artigo automático sobre ${randomTopic} gerado pelo sistema LeadBaze para teste de processamento em tempo real.`
    };
  };

  const handleAddPost = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const postData = generateUniqueContent();
      const response = await fetch('/api/blog/queue/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      const data = await response.json();
      if (data.success) {
        setResult({
          success: true,
          message: 'Post adicionado à fila com sucesso!',
          data: data.data
        });
      } else {
        setResult({
          success: false,
          message: 'Erro ao adicionar post à fila',
          error: data.error || data.details
        });
      }
    } catch (error) {

      setResult({
        success: false,
        message: 'Erro de conexão',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Adicionar Post à Fila
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Gera automaticamente um post único para testar o sistema de processamento
        </p>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {/* Botão para adicionar post */}
          <button
            onClick={handleAddPost}
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adicionando à Fila...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Gerar e Adicionar Post
              </>
            )}
          </button>

          {/* Resultado da operação */}
          {result && (
            <div className={`p-4 rounded-lg border ${
              result.success

                ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'

                : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
            }`}>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>

                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    result.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                  }`}>
                    {result.message}
                  </p>

                  {result.error && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      {result.error}
                    </p>
                  )}

                  {result.data && (
                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                      <p><strong>ID:</strong> {result.data.id}</p>
                      <p><strong>Título:</strong> {result.data.title}</p>
                      <p><strong>Status:</strong> {result.data.processed ? 'Processado' : 'Pendente'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Informações sobre o sistema */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Como Funciona
            </h4>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Gera automaticamente conteúdo único baseado no timestamp</li>
              <li>• Adiciona o post à fila de processamento</li>
              <li>• O sistema detecta e processa automaticamente</li>
              <li>• Notificações aparecem em tempo real no monitor</li>
              <li>• Post é publicado no blog automaticamente</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
