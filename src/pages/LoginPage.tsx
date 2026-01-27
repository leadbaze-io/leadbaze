import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Eye, EyeOff, Loader, Mail, Lock } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import LogoImage from '../components/LogoImage'
import { useTheme } from '../contexts/ThemeContext'
import EnhancedSignupForm from '../components/EnhancedSignupForm'
import { useAnalytics } from '../hooks/useAnalytics'
import '../styles/toast-modern.css'
import './LoginPage.css'

// Schemas de validação
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória')
})
// Tipos para os formulários
type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const navigate = useNavigate()
  const { forceLightMode } = useTheme()
  const { trackLogin } = useAnalytics()

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
    reset: resetLogin
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  })
  // Forçar modo claro na página de Login
  useEffect(() => {
    forceLightMode()

  }, [forceLightMode])

  // Verificar se usuário já está logado e configurar listener de sessão
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        navigate('/dashboard')
        // Scroll para o topo após navegação
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }, 100)
      }
    }
    checkUser()

    // Configurar listener para mudanças de sessão
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          navigate('/dashboard')
          // Scroll para o topo após navegação
          setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }, 100)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [navigate])

  const handleLogin = async (data: LoginForm) => {
    setIsLoading(true)
    setMessage(null)

    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      })

      if (error) {
        let errorMessage = "Erro ao fazer login. Tente novamente."

        if (error.message.includes('Invalid login credentials')) {
          errorMessage = "Email ou senha incorretos. Verifique os dados e tente novamente."
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = "Email não confirmado. Verifique sua caixa de entrada e clique no link de confirmação."
        } else if (error.message.includes('Too many requests')) {
          errorMessage = "Muitas tentativas de login. Aguarde alguns minutos antes de tentar novamente."
        } else if (error.message.includes('Invalid email')) {
          errorMessage = "Email inválido. Verifique o formato do email."
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = "Senha muito curta. A senha deve ter pelo menos 6 caracteres."
        } else if (error.message.includes('network')) {
          errorMessage = "Erro de conexão. Verifique sua internet e tente novamente."
        } else if (error.message.includes('timeout')) {
          errorMessage = "Tempo limite excedido. Tente novamente."
        } else if (error.message) {
          errorMessage = error.message
        }

        setMessage({ type: 'error', text: errorMessage })
      } else if (authData.user) {
        // Rastrear login bem-sucedido
        trackLogin('email');

        setMessage({ type: 'success', text: 'Login realizado com sucesso! Redirecionando...' })
        // Aguardar um pouco para o listener processar
        setTimeout(() => {
          navigate('/dashboard')
          // Scroll para o topo após navegação
          setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }, 100)
        }, 1000)
      }
    } catch (error: any) {

      let errorMessage = "Erro interno. Tente novamente."

      if (error.message && error.message.includes('network')) {
        errorMessage = "Erro de conexão. Verifique sua internet e tente novamente."
      } else if (error.message && error.message.includes('timeout')) {
        errorMessage = "Tempo limite excedido. Tente novamente."
      } else if (error.message && error.message.includes('fetch')) {
        errorMessage = "Erro de conexão com o servidor. Tente novamente."
      } else if (error.message) {
        errorMessage = error.message
      }

      setMessage({ type: 'error', text: errorMessage })
    } finally {
      setIsLoading(false)
    }
  }
  const toggleMode = () => {
    setIsLogin(!isLogin)
    setMessage(null)
    resetLogin()
  }

  const handleEnhancedSignupSuccess = () => {
    setMessage({

      type: 'success',

      text: 'Conta criada com sucesso! Verifique seu email para confirmar.'

    })
    setIsLogin(true)
  }

  const handleEnhancedSignupError = (error: string) => {
    setMessage({
      type: 'error',
      text: error
    })
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const redirectUrl = window.location.origin.includes('localhost')
        ? 'http://localhost:5173/reset-password'
        : 'https://leadbaze.io/reset-password'

      console.log('📧 Sending password reset email with redirect:', redirectUrl)

      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: redirectUrl
      })

      if (error) {
        setMessage({
          type: 'error',
          text: error.message || 'Erro ao enviar email de recuperação'
        })
      } else {
        setMessage({
          type: 'success',
          text: 'Email de recuperação enviado! Verifique sua caixa de entrada.'
        })
        // Voltar para login após 3 segundos
        setTimeout(() => {
          setIsForgotPassword(false)
          setResetEmail('')
        }, 3000)
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Erro ao processar solicitação'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Se não estiver em modo de login, mostrar o formulário completo
  if (!isLogin) {
    return (
      <div className="login-page-container py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex justify-center mb-4">
              <div className="logo-container">
                <LogoImage className="h-8 w-auto" />
              </div>
            </Link>
            <h1 className="login-title text-3xl font-bold">
              Crie sua conta no LeadBaze
            </h1>
            <p className="login-subtitle mt-2">
              Preencha seus dados para começar a gerar leads
            </p>
          </div>

          <EnhancedSignupForm
            onSuccess={handleEnhancedSignupSuccess}
            onError={handleEnhancedSignupError}
          />

          <div className="text-center mt-8">
            <p className="login-help-text">
              Já tem uma conta?
              <button
                onClick={toggleMode}
                className="login-link"
              >
                Fazer login
              </button>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="login-page-container flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">

      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex justify-center mb-8">
            <div className="logo-container">
              <LogoImage className="h-8 w-auto" />
            </div>
          </Link>

          <h2 className="login-title text-3xl font-bold">
            {isLogin ? 'Faça seu login' : 'Crie sua conta'}
          </h2>
          <p className="login-subtitle mt-2">
            {isLogin

              ? 'Acesse sua conta e continue gerando leads'

              : 'Comece a gerar leads qualificados hoje mesmo'
            }
          </p>
        </div>

        {/* Form Card */}
        <div className="login-form-card py-8 px-6 shadow-xl rounded-2xl">
          {/* Forgot Password Mode */}
          {isForgotPassword && (
            <div className="mb-6">
              <button
                onClick={() => {
                  setIsForgotPassword(false)
                  setMessage(null)
                  setResetEmail('')
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium mb-4 inline-flex items-center transition-colors"
              >
                ← Voltar para login
              </button>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Recuperar Senha</h3>
              <p className="text-sm text-gray-600 mb-4">
                Digite seu email e enviaremos um link para redefinir sua senha.
              </p>
            </div>
          )}
          {/* Message */}
          {message && (
            <div className={`mb-6 ${message.type === 'success'

              ? 'login-message-success'

              : 'login-message-error'
              }`}>
              {message.text}
            </div>
          )}

          {/* Login Form ou Forgot Password Form */}
          {isForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div>
                <label className="login-label block text-sm font-medium mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="login-icon absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" />
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="login-input-with-icon w-full"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !resetEmail}
                className="login-button w-full flex items-center justify-center space-x-2"
              >
                {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : <span>Enviar link de recuperação</span>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLoginSubmit(handleLogin)} className="space-y-6">
              <div>
                <label className="login-label block text-sm font-medium mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="login-icon absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" />
                  <input
                    {...registerLogin('email')}
                    type="email"
                    className="login-input-with-icon w-full"
                    placeholder="seu@email.com"
                  />
                </div>
                {loginErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{loginErrors.email.message}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="login-label block text-sm font-medium">
                    Senha
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Esqueci minha senha
                  </button>
                </div>
                <div className="relative">
                  <Lock className="login-icon absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" />
                  <input
                    {...registerLogin('password')}
                    type={showPassword ? 'text' : 'password'}
                    className="login-input-with-icon-button w-full"
                    placeholder="Sua senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="login-icon-button absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {loginErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{loginErrors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="login-button w-full flex items-center justify-center space-x-2"
              >
                {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : <span>Entrar</span>}
              </button>
            </form>
          )}
          {/* Toggle Mode */}
          <div className="mt-6 text-center">
            <p className="login-help-text">
              {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
              <button
                onClick={toggleMode}
                className="login-link ml-1"
              >
                {isLogin ? 'Criar conta' : 'Fazer login'}
              </button>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <Link

            to="/"

            className="login-back-link transition-colors"
          >
            ← Voltar para o início
          </Link>
        </div>
      </div>
    </div>
  )
}