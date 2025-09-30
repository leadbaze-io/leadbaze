import { useEffect, useState } from 'react'

import { useNavigate } from 'react-router-dom'

import { supabase } from '../lib/supabaseClient'

import { Loader2, CheckCircle, XCircle } from 'lucide-react'

export default function AuthCallback() {

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  const [message, setMessage] = useState('')

  const navigate = useNavigate()

  useEffect(() => {

    const handleAuthCallback = async () => {

      try {

        // Processar o callback de autenticação

        const { data, error } = await supabase.auth.getSession()

        if (error) {

          setStatus('error')

          setMessage('Erro ao confirmar email. Tente novamente.')

          return

        }

        if (data.session) {

          setStatus('success')

          setMessage('Email confirmado com sucesso! Redirecionando...')

          // Redirecionar para o dashboard após 2 segundos

          setTimeout(() => {

            navigate('/dashboard')

          }, 2000)

        } else {

          setStatus('error')

          setMessage('Sessão não encontrada. Tente fazer login novamente.')

        }

      } catch (error) {

        setStatus('error')

        setMessage('Erro interno. Tente novamente.')

      }

    }

    handleAuthCallback()

  }, [navigate])

  return (

    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">

      <div className="max-w-md w-full space-y-8">

        <div className="text-center">

          <div className="mx-auto flex items-center justify-center h-12 w-12">

            {status === 'loading' && (

              <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />

            )}

            {status === 'success' && (

              <CheckCircle className="h-12 w-12 text-green-600" />

            )}

            {status === 'error' && (

              <XCircle className="h-12 w-12 text-red-600" />

            )}

          </div>

          <h2 className="mt-6 text-3xl font-bold text-gray-900">

            {status === 'loading' && 'Confirmando email...'}

            {status === 'success' && 'Email confirmado!'}

            {status === 'error' && 'Erro na confirmação'}

          </h2>

          <p className="mt-2 text-sm text-gray-600">

            {message}

          </p>

          {status === 'error' && (

            <div className="mt-6">

              <button

                onClick={() => navigate('/login')}

                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"

              >

                Voltar ao Login

              </button>

            </div>

          )}

        </div>

      </div>

    </div>

  )

}
