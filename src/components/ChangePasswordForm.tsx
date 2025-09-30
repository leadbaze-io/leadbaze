import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { supabase } from '../lib/supabaseClient'
import { useToast } from '../hooks/use-toast'
import '../styles/toast-modern.css'
import '../styles/change-password-modal.css'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from 'lucide-react'
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator'

// Schema de validação para alteração de senha
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string()
    .min(8, 'A nova senha deve ter pelo menos 8 caracteres')
    .max(128, 'A nova senha deve ter no máximo 128 caracteres')
    .regex(/[a-z]/, 'A nova senha deve conter pelo menos uma letra minúscula')
    .regex(/[A-Z]/, 'A nova senha deve conter pelo menos uma letra maiúscula')
    .regex(/[0-9]/, 'A nova senha deve conter pelo menos um número')
    .regex(/[^a-zA-Z0-9]/, 'A nova senha deve conter pelo menos um símbolo (!@#$%^&*)'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: "A nova senha deve ser diferente da senha atual",
  path: ["newPassword"],
})

type ChangePasswordForm = z.infer<typeof changePasswordSchema>

interface ChangePasswordFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export default function ChangePasswordForm({ onSuccess, onCancel }: ChangePasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  })

  const newPassword = watch('newPassword')

  const onSubmit = async (data: ChangePasswordForm) => {
    setIsLoading(true)

    try {
      // Verificar se a senha atual está correta
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: (await supabase.auth.getUser()).data.user?.email || '',
        password: data.currentPassword
      })

      if (signInError) {
        toast({
          title: "❌ Senha atual incorreta",
          description: "A senha atual informada não está correta.",
          variant: 'destructive',
          className: 'toast-modern toast-error'
        })
        return
      }

      // Alterar a senha
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword
      })

      if (updateError) {
        toast({
          title: "❌ Erro ao alterar senha",
          description: updateError.message || "Tente novamente mais tarde.",
          variant: 'destructive',
          className: 'toast-modern toast-error'
        })
        return
      }

      toast({
        title: "✅ Senha alterada com sucesso!",
        description: "Sua senha foi alterada com segurança.",
        variant: 'success',
        className: 'toast-modern toast-success'
      })

      reset()
      onSuccess?.()
    } catch (error: any) {

      toast({
        title: "❌ Erro inesperado",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: 'destructive',
        className: 'toast-modern toast-error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="change-password-modal w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="change-password-title flex items-center gap-2">
          <Lock className="w-5 h-5" />
          Alterar Senha
        </CardTitle>
        <CardDescription className="change-password-description">
          Para sua segurança, confirme sua senha atual antes de definir uma nova.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Senha Atual */}
          <div>
            <label className="change-password-label block text-sm font-medium mb-2">
              Senha Atual
            </label>
            <div className="relative">
              <Lock className="change-password-icon absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" />
              <Input
                {...register('currentPassword')}
                type={showCurrentPassword ? 'text' : 'password'}
                placeholder="Digite sua senha atual"
                className="change-password-input pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="change-password-toggle absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="change-password-error mt-1 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          {/* Nova Senha */}
          <div>
            <label className="change-password-label block text-sm font-medium mb-2">
              Nova Senha
            </label>
            <div className="relative">
              <Lock className="change-password-icon absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" />
              <Input
                {...register('newPassword')}
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Mínimo 8 caracteres com maiúscula, minúscula, número e símbolo"
                className="change-password-input pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="change-password-toggle absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="change-password-error mt-1 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.newPassword.message}
              </p>
            )}
            <PasswordStrengthIndicator password={newPassword || ''} />
          </div>

          {/* Confirmar Nova Senha */}
          <div>
            <label className="change-password-label block text-sm font-medium mb-2">
              Confirmar Nova Senha
            </label>
            <div className="relative">
              <Lock className="change-password-icon absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" />
              <Input
                {...register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirme sua nova senha"
                className="change-password-input pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="change-password-toggle absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="change-password-error mt-1 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="change-password-btn-cancel flex-1"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="change-password-btn-submit flex-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Alterando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Alterar Senha
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
