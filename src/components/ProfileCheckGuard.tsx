// ==============================================
// COMPONENTE GUARDIÃO PARA VERIFICAÇÃO DE PERFIL
// ==============================================

import React from 'react'
import type { User } from '@supabase/supabase-js'
import { Loader, AlertCircle, RefreshCw } from 'lucide-react'
import { useProfileCheck } from '../hooks/useProfileCheck'

interface ProfileCheckGuardProps {
  user: User | null
  children: React.ReactNode
  fallback?: React.ReactNode
}

export const ProfileCheckGuard: React.FC<ProfileCheckGuardProps> = ({
  user,
  children,
  fallback
}) => {
  const {
    isLoading,
    hasProfile,
    error
  } = useProfileCheck(user)

  // Se não há usuário, mostrar fallback ou children
  if (!user) {
    return <>{fallback || children}</>
  }

  // Se está carregando
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Verificando sua conta...
          </h2>
          <p className="text-gray-600">
            Aguarde enquanto verificamos seu perfil
          </p>
        </div>
      </div>
    )
  }



  // Se há erro
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Erro ao configurar conta
          </h2>
          <p className="text-gray-600 mb-4">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  // Se não tem perfil (email não confirmado)
  if (!hasProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Confirme seu email
          </h2>
          <p className="text-gray-600 mb-4">
            Para acessar sua conta, você precisa confirmar seu email primeiro.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Email:</strong> {user?.email}
            </p>
            <p className="text-sm text-yellow-800 mt-2">
              Verifique sua caixa de entrada e clique no link de confirmação.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Se tem perfil, mostrar children
  return <>{children}</>
}

export default ProfileCheckGuard
