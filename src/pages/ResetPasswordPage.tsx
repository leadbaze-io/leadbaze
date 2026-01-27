import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader, Lock, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import LogoImage from '../components/LogoImage'
import { useTheme } from '../contexts/ThemeContext'
import { PasswordStrengthIndicator } from '../components/PasswordStrengthIndicator'
import '../styles/toast-modern.css'
import './LoginPage.css'

export default function ResetPasswordPage() {
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [isValidSession, setIsValidSession] = useState(false)
    const navigate = useNavigate()
    const { forceLightMode } = useTheme()

    // Forçar modo claro
    useEffect(() => {
        forceLightMode()
    }, [forceLightMode])

    // Verificar se há uma sessão de recuperação válida ou token no hash
    useEffect(() => {
        const checkSession = async () => {
            // Primeiro, verificar se há um hash com type=recovery
            const hashParams = new URLSearchParams(window.location.hash.substring(1))
            const type = hashParams.get('type')

            // Se é recovery, o Supabase vai processar automaticamente
            if (type === 'recovery') {
                console.log('🔐 Recovery type detected in hash, waiting for Supabase to process...')
                // Aguardar um pouco para o Supabase processar
                await new Promise(resolve => setTimeout(resolve, 1000))
            }

            const { data: { session } } = await supabase.auth.getSession()

            if (session) {
                console.log('✅ Valid session found for password reset')
                setIsValidSession(true)
            } else {
                console.log('❌ No valid session found')
                setMessage({
                    type: 'error',
                    text: 'Link inválido ou expirado. Solicite um novo link de recuperação.'
                })
            }
        }

        checkSession()
    }, [])

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validações de senha (mesmas regras do cadastro)
        if (newPassword.length < 8) {
            setMessage({
                type: 'error',
                text: 'A senha deve ter pelo menos 8 caracteres'
            })
            return
        }

        if (!/[a-z]/.test(newPassword)) {
            setMessage({
                type: 'error',
                text: 'A senha deve conter pelo menos uma letra minúscula'
            })
            return
        }

        if (!/[A-Z]/.test(newPassword)) {
            setMessage({
                type: 'error',
                text: 'A senha deve conter pelo menos uma letra maiúscula'
            })
            return
        }

        if (!/[0-9]/.test(newPassword)) {
            setMessage({
                type: 'error',
                text: 'A senha deve conter pelo menos um número'
            })
            return
        }

        if (!/[^a-zA-Z0-9]/.test(newPassword)) {
            setMessage({
                type: 'error',
                text: 'A senha deve conter pelo menos um símbolo (!@#$%^&*)'
            })
            return
        }

        if (newPassword !== confirmPassword) {
            setMessage({
                type: 'error',
                text: 'As senhas não coincidem'
            })
            return
        }

        setIsLoading(true)
        setMessage(null)

        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            })

            if (error) {
                setMessage({
                    type: 'error',
                    text: error.message || 'Erro ao redefinir senha'
                })
            } else {
                setMessage({
                    type: 'success',
                    text: 'Senha redefinida com sucesso! Redirecionando para o login...'
                })

                // Redirecionar para login após 2 segundos
                setTimeout(() => {
                    navigate('/login')
                }, 2000)
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

    const isPasswordValid =
        newPassword.length >= 8 &&
        /[a-z]/.test(newPassword) &&
        /[A-Z]/.test(newPassword) &&
        /[0-9]/.test(newPassword) &&
        /[^a-zA-Z0-9]/.test(newPassword)

    const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0

    return (
        <div className="login-page-container flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="inline-flex justify-center mb-8">
                        <div className="logo-container">
                            <LogoImage className="h-8 w-auto" />
                        </div>
                    </div>

                    <h2 className="login-title text-3xl font-bold">
                        Redefinir Senha
                    </h2>
                    <p className="login-subtitle mt-2">
                        Digite sua nova senha abaixo
                    </p>
                </div>

                {/* Form Card */}
                <div className="login-form-card py-8 px-6 shadow-xl rounded-2xl">
                    {/* Message */}
                    {message && (
                        <div className={`mb-6 ${message.type === 'success'
                            ? 'login-message-success'
                            : 'login-message-error'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    {isValidSession ? (
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <div>
                                <label className="login-label block text-sm font-medium mb-2">
                                    Nova Senha
                                </label>
                                <div className="relative">
                                    <Lock className="login-icon absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="login-input-with-icon-button w-full"
                                        placeholder="Mínimo 8 caracteres"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="login-icon-button absolute right-3 top-1/2 transform -translate-y-1/2"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>

                                {/* Password Strength Indicator */}
                                {newPassword && (
                                    <div className="mt-2">
                                        <PasswordStrengthIndicator password={newPassword} />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="login-label block text-sm font-medium mb-2">
                                    Confirmar Nova Senha
                                </label>
                                <div className="relative">
                                    <Lock className="login-icon absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" />
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="login-input-with-icon-button w-full"
                                        placeholder="Digite a senha novamente"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="login-icon-button absolute right-3 top-1/2 transform -translate-y-1/2"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {confirmPassword && (
                                    <p className={`mt-1 text-sm ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                                        {passwordsMatch ? '✓ Senhas coincidem' : '✗ Senhas não coincidem'}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !isPasswordValid || !passwordsMatch}
                                className="login-button w-full flex items-center justify-center space-x-2"
                            >
                                {isLoading ? (
                                    <Loader className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        <span>Redefinir Senha</span>
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-600 mb-4">
                                Link inválido ou expirado
                            </p>
                            <button
                                onClick={() => navigate('/login')}
                                className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Voltar para o login
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
