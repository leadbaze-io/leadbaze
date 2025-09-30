import { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { useToast } from '../hooks/use-toast'
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

interface ConnectivityTestProps {
  webhookUrl?: string
}

export function ConnectivityTest({

  webhookUrl = 'https://n8n-n8n-start.kof6cn.easypanel.host/webhook/842e7854-35df-4b20-9a6e-994fd934505e'

}: ConnectivityTestProps) {
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error' | 'cors_error'>('idle')
  const [errorDetails, setErrorDetails] = useState<string>('')
  const { toast } = useToast()

  const testConnection = async () => {
    setIsTestingConnection(true)
    setConnectionStatus('idle')
    setErrorDetails('')

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          google_maps_url: 'https://www.google.com/maps/search/test',
          limit: 1,
          user_id: 'connectivity-test',
          timestamp: new Date().toISOString(),
          test: true
        })
      })

      if (response.ok) {
        setConnectionStatus('success')
        toast({
          title: "✅ Conectividade OK!",
          description: "O N8N está respondendo corretamente.",
          variant: 'success',
        })
      } else {
        setConnectionStatus('error')
        setErrorDetails(`HTTP ${response.status}: ${response.statusText}`)
        toast({
          title: "⚠️ Erro de Resposta",
          description: `O N8N retornou: ${response.status} ${response.statusText}`,
          variant: 'warning',
        })
      }
    } catch (error: unknown) {

      const err = error as Error
      if (err.name === 'TypeError' && err.message.includes('CORS')) {
        setConnectionStatus('cors_error')
        setErrorDetails('Erro de CORS - N8N não configurado para aceitar requisições do frontend')
        toast({
          title: "⚠️ Erro de CORS",
          description: "Configure CORS no N8N. Veja o arquivo N8N_CORS_SETUP.md",
          variant: 'warning',
        })
      } else {
        setConnectionStatus('error')
        setErrorDetails(err.message || 'Erro de conexão desconhecido')
        toast({
          title: "❌ Erro de Conexão",
          description: err.message || "Não foi possível conectar ao N8N",
          variant: 'destructive',
        })
      }
    } finally {
      setIsTestingConnection(false)
    }
  }

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'cors_error':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />
      default:
        return null
    }
  }

  const getStatusMessage = () => {
    switch (connectionStatus) {
      case 'success':
        return {
          title: 'Conectividade OK',
          description: 'O N8N está respondendo corretamente. Você pode gerar leads!',
          color: 'text-green-600'
        }
      case 'cors_error':
        return {
          title: 'Erro de CORS',
          description: 'O N8N precisa ser configurado para aceitar requisições do frontend. Veja as instruções em N8N_CORS_SETUP.md',
          color: 'text-orange-600'
        }
      case 'error':
        return {
          title: 'Erro de Conexão',
          description: errorDetails || 'Não foi possível conectar ao serviço N8N.',
          color: 'text-red-600'
        }
      default:
        return null
    }
  }

  const statusInfo = getStatusMessage()

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Teste de Conectividade N8N</span>
          {getStatusIcon()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-2">
              Endpoint: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{webhookUrl}</code>
            </p>
            <p className="text-sm text-gray-500">
              Teste a conectividade com o serviço de extração de leads
            </p>
          </div>
        </div>

        {statusInfo && (
          <div className={`p-4 rounded-lg border ${
            connectionStatus === 'success' ? 'border-green-200 bg-green-50' :
            connectionStatus === 'cors_error' ? 'border-orange-200 bg-orange-50' :
            'border-red-200 bg-red-50'
          }`}>
            <h4 className={`font-medium ${statusInfo.color} mb-1`}>
              {statusInfo.title}
            </h4>
            <p className={`text-sm ${statusInfo.color.replace('600', '700')}`}>
              {statusInfo.description}
            </p>
            {errorDetails && connectionStatus !== 'cors_error' && (
              <details className="mt-2">
                <summary className="cursor-pointer text-xs text-gray-500">
                  Detalhes do erro
                </summary>
                <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                  {errorDetails}
                </pre>
              </details>
            )}
          </div>
        )}

        <div className="flex space-x-3">
          <Button
            onClick={testConnection}
            disabled={isTestingConnection}
            className="flex items-center space-x-2"
          >
            {isTestingConnection ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Testando...</span>
              </>
            ) : (
              <span>Testar Conexão</span>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              setConnectionStatus('idle')
              setErrorDetails('')
            }}
          >
            Limpar
          </Button>
        </div>

        {connectionStatus === 'cors_error' && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">
              💡 Como resolver o erro de CORS:
            </h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Acesse as configurações do seu N8N</li>
              <li>Adicione a variável: <code className="bg-blue-100 px-1 rounded">N8N_CORS_ORIGIN=*</code></li>
              <li>Ou configure especificamente: <code className="bg-blue-100 px-1 rounded">N8N_CORS_ORIGIN=http://localhost:5173</code></li>
              <li>Reinicie o N8N e teste novamente</li>
            </ol>
            <p className="text-xs text-blue-600 mt-2">
              📖 Veja instruções completas no arquivo <code>N8N_CORS_SETUP.md</code>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}