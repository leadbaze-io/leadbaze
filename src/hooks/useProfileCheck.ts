// ==============================================
// HOOK PARA VERIFICAR PERFIL NA PRIMEIRA ENTRADA
// ==============================================

import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import { UserProfileService } from '../lib/userProfileService'

export interface ProfileCheckResult {
  isLoading: boolean
  hasProfile: boolean
  profile: any | null
  error: string | null
}

export function useProfileCheck(user: User | null): ProfileCheckResult {
  const [isLoading, setIsLoading] = useState(false)
  const [hasProfile, setHasProfile] = useState(false)
  const [profile, setProfile] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setHasProfile(false)
      setProfile(null)
      setError(null)
      return
    }

    checkUserProfile()
  }, [user])

  const checkUserProfile = async () => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      console.log('🔍 Verificando perfil para usuário:', user.email)

      // 1. Verificar se perfil existe
      const existingProfile = await UserProfileService.getProfile(user.id)
      
      if (existingProfile) {
        console.log('✅ Perfil encontrado:', existingProfile.full_name)
        setHasProfile(true)
        setProfile(existingProfile)
        setIsLoading(false)
        return
      }

      // 2. Se não existe perfil, verificar se email está confirmado
      if (!user.email_confirmed_at) {
        console.log('⚠️ Email não confirmado, aguardando confirmação...')
        setHasProfile(false)
        setProfile(null)
        setIsLoading(false)
        return
      }

            // 3. Email confirmado mas sem perfil - isso não deveria acontecer
            console.log('⚠️ Email confirmado mas sem perfil - isso não deveria acontecer')
            console.log('   O perfil deveria ter sido criado durante o signup')
            setError('Perfil não encontrado. Entre em contato com o suporte.')
            setIsLoading(false)

    } catch (error: any) {
      console.error('❌ Erro ao verificar perfil:', error)
      setError(error.message || 'Erro ao verificar perfil')
      setIsLoading(false)
    }
  }



  return {
    isLoading,
    hasProfile,
    profile,
    error
  }
}

export default useProfileCheck
