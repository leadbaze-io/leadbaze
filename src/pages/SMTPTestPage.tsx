import { useState } from 'react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Loader2, Mail, CheckCircle, XCircle, Send, RefreshCw } from 'lucide-react'
import { useToast } from '../hooks/use-toast'
import '../styles/toast-modern.css'

interface TestResult {
  success: boolean
  message: string
  details?: string
  timestamp: string
}

export default function SMTPTestPage() {
  const [email, setEmail] = useState('leadbaze@gmail.com')
  const [isLoading, setIsLoading] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const { toast } = useToast()

  const runSMTPTest = async () => {
    setIsLoading(true)
    const timestamp = new Date().toLocaleString('pt-BR')

    try {
      // Teste 1: Verificar configuração SMTP
      setTestResults(prev => [...prev, {
        success: true,
        message: 'Iniciando teste SMTP...',
        timestamp
      }])

      // Simular teste SMTP (em produção, chamaria API real)
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Teste 2: Enviar email de teste
      const response = await fetch('/api/test-smtp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          subject: '🧪 Teste SMTP - LeadBaze',
          type: 'test'
        })
      })

      if (response.ok) {
        const result = await response.json()
        setTestResults(prev => [...prev, {
          success: true,
          message: 'Email de teste enviado com sucesso!',
          details: `Message ID: ${result.messageId}`,
          timestamp: new Date().toLocaleString('pt-BR')
        }])

        toast({
          title: "✅ Teste SMTP bem-sucedido!",
          description: `Email enviado para ${email}`,
          variant: 'default',
          className: 'toast-modern toast-success'
        })
      } else {
        throw new Error('Falha ao enviar email de teste')
      }

    } catch (error: any) {
      setTestResults(prev => [...prev, {
        success: false,
        message: 'Erro no teste SMTP',
        details: error.message,
        timestamp: new Date().toLocaleString('pt-BR')
      }])

      toast({
        title: "❌ Erro no teste SMTP",
        description: error.message,
        variant: 'destructive',
        className: 'toast-modern toast-error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Teste SMTP - LeadBaze
          </h1>
          <p className="text-gray-600">
            Teste a configuração SMTP sem precisar criar contas
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Painel de Controle */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="w-5 h-5" />
                <span>Configuração do Teste</span>
              </CardTitle>
              <CardDescription>
                Configure os parâmetros do teste SMTP
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email de Destino
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email que receberá o teste SMTP
                </p>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={runSMTPTest}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Testando SMTP...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Executar Teste SMTP
                    </>
                  )}
                </Button>

                <Button
                  onClick={clearResults}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Limpar Resultados
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Resultados dos Testes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span>Resultados dos Testes</span>
              </CardTitle>
              <CardDescription>
                Histórico dos testes SMTP executados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {testResults.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum teste executado ainda</p>
                  <p className="text-sm">Clique em "Executar Teste SMTP" para começar</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {testResults.map((result, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        result.success
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {result.success ? (
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <p className={`font-medium ${
                              result.success ? 'text-green-800' : 'text-red-800'
                            }`}>
                              {result.message}
                            </p>
                            <Badge variant={result.success ? 'default' : 'destructive'}>
                              {result.success ? 'Sucesso' : 'Erro'}
                            </Badge>
                          </div>
                          {result.details && (
                            <p className="text-sm text-gray-600 mb-1">
                              {result.details}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            {result.timestamp}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Informações de Configuração */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>📋 Configuração SMTP Atual</CardTitle>
            <CardDescription>
              Detalhes da configuração SMTP do LeadBaze
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Host:</span>
                  <span className="text-sm text-gray-600">smtp.gmail.com</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Porta:</span>
                  <span className="text-sm text-gray-600">587</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Segurança:</span>
                  <span className="text-sm text-gray-600">TLS</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Usuário:</span>
                  <span className="text-sm text-gray-600">leadbaze@gmail.com</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Senha:</span>
                  <span className="text-sm text-gray-600">••••••••••••••••</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge variant="default">Configurado</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
