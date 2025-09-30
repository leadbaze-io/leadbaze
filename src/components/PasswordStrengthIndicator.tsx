import React from 'react'

import { Check, X } from 'lucide-react'

interface PasswordStrengthIndicatorProps {

  password: string

}

interface PasswordRequirement {

  label: string

  test: (password: string) => boolean

}

const requirements: PasswordRequirement[] = [

  {

    label: 'Mínimo 8 caracteres',

    test: (password) => password.length >= 8

  },

  {

    label: 'Pelo menos 1 letra minúscula (a-z)',

    test: (password) => /[a-z]/.test(password)

  },

  {

    label: 'Pelo menos 1 letra maiúscula (A-Z)',

    test: (password) => /[A-Z]/.test(password)

  },

  {

    label: 'Pelo menos 1 número (0-9)',

    test: (password) => /[0-9]/.test(password)

  },

  {

    label: 'Pelo menos 1 símbolo (!@#$%^&*)',

    test: (password) => /[^a-zA-Z0-9]/.test(password)

  }

]

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {

  const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {

    const validRequirements = requirements.filter(req => req.test(password)).length

    if (validRequirements < 3) return 'weak'

    if (validRequirements < 5) return 'medium'

    return 'strong'

  }

  const strength = getPasswordStrength(password)

  const validRequirements = requirements.filter(req => req.test(password)).length

  if (!password) return null

  return (

    <div className="mt-3 space-y-2">

      {/* Barra de força da senha */}

      <div className="flex items-center space-x-2">

        <div className="flex-1 bg-gray-200 rounded-full h-2">

          <div

            className={`h-2 rounded-full transition-all duration-300 ${

              strength === 'weak' ? 'bg-red-500 w-1/3' :

              strength === 'medium' ? 'bg-yellow-500 w-2/3' :

              'bg-green-500 w-full'

            }`}

          />

        </div>

        <span className={`text-xs font-medium ${

          strength === 'weak' ? 'text-red-600' :

          strength === 'medium' ? 'text-yellow-600' :

          'text-green-600'

        }`}>

          {strength === 'weak' ? 'Fraca' : strength === 'medium' ? 'Média' : 'Forte'}

        </span>

      </div>

      {/* Lista de requisitos */}

      <div className="space-y-1">

        {requirements.map((requirement, index) => {

          const isValid = requirement.test(password)

          return (

            <div key={index} className="flex items-center space-x-2 text-xs">

              {isValid ? (

                <Check className="w-3 h-3 text-green-600" />

              ) : (

                <X className="w-3 h-3 text-red-600" />

              )}

              <span className={isValid ? 'text-green-600' : 'text-red-600'}>

                {requirement.label}

              </span>

            </div>

          )

        })}

      </div>

      {/* Contador de requisitos */}

      <div className="text-xs text-gray-600">

        {validRequirements} de {requirements.length} requisitos atendidos

      </div>

    </div>

  )

}
