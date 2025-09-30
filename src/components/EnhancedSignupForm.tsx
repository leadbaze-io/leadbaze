import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  Phone, 
  MapPin, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Loader,
  Building,
  Calendar,
  FileText
} from 'lucide-react'

import { Input } from './ui/input'
import { InputMask, MASKS } from './ui/InputMask'
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator'
import { useToast } from '../hooks/use-toast'
import { useAnalytics } from '../hooks/useAnalytics'
import { supabase } from '../lib/supabaseClient'
import { 
  validateCPF, 
  validateCNPJ, 
  validateCEP, 
  validateEmail, 
  validatePhone
} from '../lib/validationUtils'
import '../styles/toast-modern.css'

// ==============================================
// SCHEMAS DE VALIDAÇÃO
// ==============================================

const personalInfoSchema = z.object({
  taxType: z.enum(['pessoa_fisica', 'pessoa_juridica']),
  cpf: z.string().optional(),
  cnpj: z.string().optional(),
  fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  birthDate: z.string().optional(),
  companyName: z.string().optional()
}).refine((data) => {
  if (data.taxType === 'pessoa_fisica') {
    return data.cpf && data.birthDate
  }
  return data.cnpj && data.companyName
}, {
  message: 'Dados obrigatórios não preenchidos',
  path: ['taxType']
})

const addressSchema = z.object({
  zipCode: z.string().min(8, 'CEP inválido'),
  street: z.string().min(1, 'Rua é obrigatória'),
  number: z.string().min(1, 'Número é obrigatório'),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, 'Bairro é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().min(2, 'Estado é obrigatório')
})

const paymentSchema = z.object({
  acceptedMethods: z.array(z.string()).min(1, 'Selecione pelo menos um método'),
  billingCycle: z.enum(['monthly', 'yearly']),
  autoRenewal: z.boolean()
})

const complianceSchema = z.object({
  password: z.string()
    .min(8, 'A senha deve ter pelo menos 8 caracteres')
    .max(128, 'A senha deve ter no máximo 128 caracteres')
    .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula')
    .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
    .regex(/[0-9]/, 'A senha deve conter pelo menos um número')
    .regex(/[^a-zA-Z0-9]/, 'A senha deve conter pelo menos um símbolo (!@#$%^&*)'),
  confirmPassword: z.string(),
  lgpdConsent: z.boolean().refine(val => val === true, {
    message: 'É necessário aceitar os termos de uso'
  }),
  marketingConsent: z.boolean().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
})

// ==============================================
// TIPOS
// ==============================================

type PersonalInfoForm = z.infer<typeof personalInfoSchema>
type AddressForm = z.infer<typeof addressSchema>
type PaymentForm = z.infer<typeof paymentSchema>
type ComplianceForm = z.infer<typeof complianceSchema>

interface EnhancedSignupFormProps {
  onSuccess?: () => void
  onError?: (error: string) => void
}

// ==============================================
// COMPONENTE PRINCIPAL
// ==============================================

export const EnhancedSignupForm: React.FC<EnhancedSignupFormProps> = ({
  onSuccess,
  onError
}) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setLoading] = useState(false)
  const [, setVerificationStatus] = useState<Record<string, boolean>>({})
  const [, setCepData] = useState<any>(null)
  
  const { toast } = useToast()
  const { trackSignUp } = useAnalytics()
  
  const totalSteps = 3

  // Formulários para cada etapa
  const personalForm = useForm<PersonalInfoForm>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      taxType: 'pessoa_fisica'
    }
  })

  const addressForm = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      zipCode: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: ''
    }
  })

  const paymentForm = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      acceptedMethods: ['credit_card', 'pix'],
      billingCycle: 'monthly',
      autoRenewal: true
    }
  })

  const complianceForm = useForm<ComplianceForm>({
    resolver: zodResolver(complianceSchema)
  })

  // ==============================================
  // HANDLERS
  // ==============================================

  const handleCPFChange = (value: string) => {
    const validation = validateCPF(value)
    if (validation.isValid) {
      personalForm.setValue('cpf', value)
      setVerificationStatus(prev => ({ ...prev, cpf: true }))
    } else {
      setVerificationStatus(prev => ({ ...prev, cpf: false }))
    }
  }

  const handleCNPJChange = (value: string) => {
    const validation = validateCNPJ(value)
    if (validation.isValid) {
      personalForm.setValue('cnpj', value)
      setVerificationStatus(prev => ({ ...prev, cnpj: true }))
    } else {
      setVerificationStatus(prev => ({ ...prev, cnpj: false }))
    }
  }

  const handleCEPChange = async (value: string) => {
    if (value.length === 8) {
      const validation = await validateCEP(value)
      if (validation.isValid && validation.data) {
        setCepData(validation.data)
        addressForm.setValue('street', validation.data.street)
        addressForm.setValue('neighborhood', validation.data.neighborhood)
        addressForm.setValue('city', validation.data.city)
        addressForm.setValue('state', validation.data.state)
        setVerificationStatus(prev => ({ ...prev, cep: true }))
      } else {
        setVerificationStatus(prev => ({ ...prev, cep: false }))
      }
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value
    const validation = validateEmail(email)
    setVerificationStatus(prev => ({ ...prev, email: validation.isValid }))
  }

  const handlePhoneChange = (value: string) => {
    const validation = validatePhone(value)
    if (validation.isValid) {
      setVerificationStatus(prev => ({ ...prev, phone: true }))
    } else {
      setVerificationStatus(prev => ({ ...prev, phone: false }))
    }
  }

  const nextStep = async () => {
    let isValid = false

    switch (currentStep) {
      case 1:
        isValid = await personalForm.trigger()
        break
      case 2:
        isValid = await addressForm.trigger()
        break
      case 3:
        isValid = await paymentForm.trigger()
        break
      case 4:
        isValid = await complianceForm.trigger()
        break
    }

    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)

    // Validação explícita antes de enviar
    try {
      // Validar cada formulário
      await personalForm.trigger()
      await addressForm.trigger()
      await paymentForm.trigger()
      await complianceForm.trigger()

      // Verificar se há erros
      const personalErrors = personalForm.formState.errors
      const addressErrors = addressForm.formState.errors
      const paymentErrors = paymentForm.formState.errors
      const complianceErrors = complianceForm.formState.errors

      if (Object.keys(personalErrors).length > 0 || 
          Object.keys(addressErrors).length > 0 || 
          Object.keys(paymentErrors).length > 0 || 
          Object.keys(complianceErrors).length > 0) {
        console.log('❌ BLOQUEANDO SUBMIT - Há erros de validação')
        toast({
          title: "⚠️ Erro de Validação",
          description: "Por favor, corrija os erros no formulário antes de continuar.",
          variant: 'destructive',
          className: 'toast-modern toast-error-validation'
        })
        setLoading(false)
        return
      }

      console.log('✅ Dados validados com sucesso')
    } catch (validationError: any) {
      console.error('❌ Erro de validação:', validationError)
      toast({
        title: "⚠️ Erro de Validação",
        description: "Dados inválidos. Verifique os campos obrigatórios.",
        variant: 'destructive',
        className: 'toast-modern toast-error-validation'
      })
      setLoading(false)
      return
    }

    try {
      const personalData = personalForm.getValues()
      const addressData = addressForm.getValues()
      const paymentData = paymentForm.getValues()
      const complianceData = complianceForm.getValues()

      // Criar usuário no Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: personalData.email,
        password: complianceData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            name: personalData.fullName,
            tax_type: personalData.taxType,
            cpf: personalData.cpf,
            cnpj: personalData.cnpj
          }
        }
      })

      if (authError) {
        throw authError
      }

      if (authData.user) {
        // SEMPRE criar perfil, independente da confirmação de email
        console.log('📝 Criando perfil com dados reais do formulário...')
        
        // Converter data de nascimento do formato brasileiro (DD/MM/YYYY) para ISO (YYYY-MM-DD)
        const convertBirthDate = (dateStr: string): string | null => {
          if (!dateStr) return null;
          
          // Verificar se está no formato DD/MM/YYYY
          const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
          const match = dateStr.match(dateRegex);
          
          if (match) {
            const [, day, month, year] = match;
            return `${year}-${month}-${day}`;
          }
          
          return dateStr; // Se já estiver no formato correto, retorna como está
        };

        // Preparar dados do perfil
        const profileData = {
          tax_type: personalData.taxType,
          cpf: personalData.cpf,
          cnpj: personalData.cnpj,
          full_name: personalData.fullName,
          email: personalData.email,
          phone: personalData.phone,
          birth_date: convertBirthDate(personalData.birthDate || ''),
          company_name: personalData.companyName,
          billing_street: addressData.street,
          billing_number: addressData.number,
          billing_complement: addressData.complement,
          billing_neighborhood: addressData.neighborhood,
          billing_city: addressData.city,
          billing_state: addressData.state,
          billing_zip_code: addressData.zipCode,
          accepted_payment_methods: paymentData.acceptedMethods,
          billing_cycle: paymentData.billingCycle,
          auto_renewal: paymentData.autoRenewal,
          lgpd_consent: complianceData.lgpdConsent,
          lgpd_consent_ip: '127.0.0.1', // Em produção, pegar IP real
          lgpd_consent_user_agent: navigator.userAgent
        }

        // Aguardar um pouco para garantir que o usuário esteja na tabela auth.users
        console.log('⏳ Aguardando usuário ser registrado no sistema...')
        await new Promise(resolve => setTimeout(resolve, 3000)) // Aguardar 3 segundos
        
        console.log('🔐 Prosseguindo com criação do perfil para usuário:', authData.user.id)
        
        // Criar perfil usando função RPC (bypassa RLS)
        console.log('🔐 Usuário autenticado:', authData.user.id)
        console.log('📊 Dados do perfil:', profileData)
        
        const { data: profileResult, error: profileError } = await supabase.rpc('create_user_profile', {
          p_user_id: authData.user.id,
          p_tax_type: profileData.tax_type,
          p_full_name: profileData.full_name,
          p_email: profileData.email,
          p_phone: profileData.phone,
          p_billing_street: profileData.billing_street,
          p_billing_number: profileData.billing_number,
          p_billing_neighborhood: profileData.billing_neighborhood,
          p_billing_city: profileData.billing_city,
          p_billing_state: profileData.billing_state,
          p_billing_zip_code: profileData.billing_zip_code,
          p_cpf: profileData.cpf,
          p_cnpj: profileData.cnpj,
          p_birth_date: profileData.birth_date,
          p_company_name: profileData.company_name,
          p_billing_complement: profileData.billing_complement,
          p_billing_country: 'BR',
          p_accepted_payment_methods: profileData.accepted_payment_methods,
          p_billing_cycle: profileData.billing_cycle,
          p_auto_renewal: profileData.auto_renewal,
          p_lgpd_consent: profileData.lgpd_consent,
          p_lgpd_consent_ip: profileData.lgpd_consent_ip,
          p_lgpd_consent_user_agent: profileData.lgpd_consent_user_agent
        })

        if (profileError) {
          console.error('❌ Erro ao criar perfil:', profileError)
          
          // Tratar erro específico de foreign key do usuário
          if (profileError.code === '23503' && profileError.message.includes('user_id')) {
            console.log('🔄 Erro de foreign key - tentando novamente em 2 segundos...')
            await new Promise(resolve => setTimeout(resolve, 2000))
            
            // Tentar criar o perfil novamente
            const { data: retryResult, error: retryError } = await supabase.rpc('create_user_profile', {
              p_user_id: authData.user.id,
              p_tax_type: profileData.tax_type,
              p_full_name: profileData.full_name,
              p_email: profileData.email,
              p_phone: profileData.phone,
              p_billing_street: profileData.billing_street,
              p_billing_number: profileData.billing_number,
              p_billing_neighborhood: profileData.billing_neighborhood,
              p_billing_city: profileData.billing_city,
              p_billing_state: profileData.billing_state,
              p_billing_zip_code: profileData.billing_zip_code,
              p_cpf: profileData.cpf,
              p_cnpj: profileData.cnpj,
              p_birth_date: profileData.birth_date,
              p_company_name: profileData.company_name,
              p_billing_complement: profileData.billing_complement,
              p_billing_country: 'BR',
              p_accepted_payment_methods: profileData.accepted_payment_methods,
              p_billing_cycle: profileData.billing_cycle,
              p_auto_renewal: profileData.auto_renewal,
              p_lgpd_consent: profileData.lgpd_consent,
              p_lgpd_consent_ip: profileData.lgpd_consent_ip,
              p_lgpd_consent_user_agent: profileData.lgpd_consent_user_agent
            })
            
            if (retryError) {
              throw new Error("Erro de sincronização. Aguarde alguns minutos e tente novamente ou entre em contato com o suporte.")
            } else {
              console.log('✅ Perfil criado com sucesso na segunda tentativa!', retryResult)
              // Continuar com o fluxo normal - não há erro
            }
          } else {
            // Outros tipos de erro
            let profileErrorMessage = "Erro ao criar perfil. Tente novamente."
            
            if (profileError.code === '23505') {
              // Violação de constraint única
              if (profileError.message.includes('cpf')) {
                profileErrorMessage = "Este CPF já está cadastrado em nossa base de dados. Verifique os dados ou entre em contato com o suporte."
              } else if (profileError.message.includes('cnpj')) {
                profileErrorMessage = "Este CNPJ já está cadastrado em nossa base de dados. Verifique os dados ou entre em contato com o suporte."
              } else if (profileError.message.includes('email')) {
                profileErrorMessage = "Este email já está cadastrado. Tente fazer login ou use outro email."
              } else {
                profileErrorMessage = "Dados já cadastrados. Verifique as informações ou entre em contato com o suporte."
              }
            } else if (profileError.code === '23514') {
              profileErrorMessage = "Dados inválidos. Verifique as informações e tente novamente."
            } else if (profileError.message.includes('value too long')) {
              profileErrorMessage = "Algum campo contém muitos caracteres. Verifique os dados e tente novamente."
            } else if (profileError.message.includes('invalid input')) {
              profileErrorMessage = "Dados inválidos. Verifique as informações e tente novamente."
            }
            
            throw new Error(profileErrorMessage)
          }
        }

        console.log('✅ Perfil criado com sucesso!', profileResult)

        // Dar 30 leads bônus para o usuário (após criar o perfil)
        console.log('🎁 Dando 30 leads bônus para o usuário...')
        const { data: bonusResult, error: bonusError } = await supabase.rpc('give_bonus_leads_to_new_user', {
          p_user_id: authData.user.id
        })

        if (bonusError) {
          console.error('❌ Erro ao dar leads bônus:', bonusError)
          // Não falhar o cadastro por causa disso, apenas logar o erro
        } else {
          console.log('✅ Leads bônus dados com sucesso!', bonusResult)
        }

        // Verificar se o email foi confirmado para mostrar mensagem apropriada
        if (!authData.user.email_confirmed_at) {
          // Email não confirmado - mostrar mensagem de confirmação
          toast({
            title: "📧 Verifique seu email!",
            description: "Enviamos um link de confirmação para seu email. Clique no link para ativar sua conta. Seu perfil já foi criado e estará disponível após a confirmação.",
            variant: 'default',
            className: 'toast-modern toast-info'
          })
        } else {
          // Email confirmado - conta pronta para uso
          // Rastrear cadastro bem-sucedido
          trackSignUp('email');
          
          toast({
            title: "✅ Conta criada com sucesso!",
            description: "Sua conta foi ativada e você pode fazer login.",
            variant: 'success',
            className: 'toast-modern toast-success'
          })
        }

        onSuccess?.()
      }
    } catch (error: any) {
      console.error('Erro ao criar conta:', error)
      
      let errorMessage = "Erro inesperado. Tente novamente mais tarde."
      let errorTitle = "❌ Erro ao criar conta"
      
      // Tratar erros de autenticação
      if (error.message && error.message.includes('User already registered')) {
        errorMessage = "Este email já está cadastrado. Tente fazer login ou use outro email."
        errorTitle = "📧 Email já cadastrado"
      } else if (error.message && error.message.includes('Invalid email')) {
        errorMessage = "Email inválido. Verifique o formato do email e tente novamente."
        errorTitle = "📧 Email inválido"
      } else if (error.message && error.message.includes('Password should be at least')) {
        errorMessage = "A senha deve ter pelo menos 6 caracteres. Tente uma senha mais forte."
        errorTitle = "🔒 Senha muito fraca"
      } else if (error.message && error.message.includes('rate limit')) {
        errorMessage = "Muitas tentativas de cadastro. Aguarde alguns minutos antes de tentar novamente."
        errorTitle = "⏰ Muitas tentativas"
      } else if (error.message && error.message.includes('network')) {
        errorMessage = "Erro de conexão. Verifique sua internet e tente novamente."
        errorTitle = "🌐 Erro de conexão"
      } else if (error.message && error.message.includes('timeout')) {
        errorMessage = "Tempo limite excedido. Tente novamente."
        errorTitle = "⏱️ Tempo limite"
      } else if (error.message && error.message.includes('CPF já está cadastrado')) {
        errorMessage = error.message
        errorTitle = "📋 CPF já cadastrado"
      } else if (error.message && error.message.includes('CNPJ já está cadastrado')) {
        errorMessage = error.message
        errorTitle = "🏢 CNPJ já cadastrado"
      } else if (error.message && error.message.includes('Dados já cadastrados')) {
        errorMessage = error.message
        errorTitle = "📋 Dados duplicados"
      } else if (error.message && error.message.includes('Erro ao criar perfil')) {
        errorMessage = error.message
        errorTitle = "👤 Erro no perfil"
      } else if (error.message && error.message.includes('Dados inválidos')) {
        errorMessage = error.message
        errorTitle = "⚠️ Dados inválidos"
      } else if (error.message && error.message.includes('value too long')) {
        errorMessage = error.message
        errorTitle = "📝 Campo muito longo"
      } else if (error.message && error.message.includes('Erro de validação')) {
        errorMessage = error.message
        errorTitle = "✅ Erro de validação"
      } else if (error.message) {
        // Usar a mensagem personalizada se disponível
        errorMessage = error.message
      }
      
      // Determinar o tipo de erro para o CSS
      let errorClass = 'toast-modern toast-error'
      if (errorMessage.includes('CPF')) {
        errorClass = 'toast-modern toast-error-cpf'
      } else if (errorMessage.includes('CNPJ')) {
        errorClass = 'toast-modern toast-error-cnpj'
      } else if (errorMessage.includes('email') || errorMessage.includes('Email')) {
        errorClass = 'toast-modern toast-error-email'
      } else if (errorMessage.includes('conexão') || errorMessage.includes('network')) {
        errorClass = 'toast-modern toast-error-network'
      } else if (errorMessage.includes('validação') || errorMessage.includes('Validação')) {
        errorClass = 'toast-modern toast-error-validation'
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: 'destructive',
        className: errorClass
      })
      onError?.(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // ==============================================
  // RENDERIZAÇÃO DAS ETAPAS
  // ==============================================

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Dados Pessoais
        </h2>
        <p className="text-gray-600 mt-2">
          Preencha suas informações básicas
        </p>
      </div>

      {/* Tipo de Pessoa */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Tipo de Pessoa
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => personalForm.setValue('taxType', 'pessoa_fisica')}
            className={`p-4 border rounded-lg text-center transition-colors ${
              personalForm.watch('taxType') === 'pessoa_fisica'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <User className="w-6 h-6 mx-auto mb-2" />
            Pessoa Física
          </button>
          <button
            type="button"
            onClick={() => personalForm.setValue('taxType', 'pessoa_juridica')}
            className={`p-4 border rounded-lg text-center transition-colors ${
              personalForm.watch('taxType') === 'pessoa_juridica'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <Building className="w-6 h-6 mx-auto mb-2" />
            Pessoa Jurídica
          </button>
        </div>
      </div>

      {/* CPF ou CNPJ */}
      {personalForm.watch('taxType') === 'pessoa_fisica' ? (
        <div className="space-y-4">
          <InputMask
            {...personalForm.register('cpf')}
            mask={MASKS.CPF}
            label="CPF"
            placeholder="000.000.000-00"
            icon={<FileText className="w-5 h-5" />}
            onValueChange={handleCPFChange}
            error={personalForm.formState.errors.cpf?.message}
            forceLightMode={true}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data de Nascimento
            </label>
            <InputMask
              {...personalForm.register('birthDate')}
              mask={MASKS.DATE}
              placeholder="DD/MM/AAAA"
              icon={<Calendar className="w-5 h-5" />}
              forceLightMode={true}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <InputMask
            {...personalForm.register('cnpj')}
            mask={MASKS.CNPJ}
            label="CNPJ"
            placeholder="00.000.000/0000-00"
            icon={<Building className="w-5 h-5" />}
            onValueChange={handleCNPJChange}
            error={personalForm.formState.errors.cnpj?.message}
            forceLightMode={true}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Razão Social
            </label>
            <Input
              {...personalForm.register('companyName')}
              placeholder="Nome da empresa"
            />
          </div>
        </div>
      )}

      {/* Nome Completo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Nome Completo
        </label>
        <Input
          {...personalForm.register('fullName')}
          placeholder="Seu nome completo"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Email
        </label>
        <Input
          {...personalForm.register('email')}
          type="email"
          placeholder="seu@email.com"
          onChange={handleEmailChange}
        />
      </div>

      {/* Telefone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Telefone
        </label>
        <InputMask
          {...personalForm.register('phone')}
          mask={MASKS.PHONE}
          placeholder="(11) 99999-9999"
          icon={<Phone className="w-5 h-5" />}
          onValueChange={handlePhoneChange}
          error={personalForm.formState.errors.phone?.message}
          forceLightMode={true}
        />
      </div>
    </motion.div>
  )

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Endereço
        </h2>
        <p className="text-gray-600 mt-2">
          Informe seu endereço de cobrança
        </p>
      </div>

      {/* CEP */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          CEP
        </label>
        <InputMask
          {...addressForm.register('zipCode')}
          mask={MASKS.CEP}
          placeholder="00000-000"
          icon={<MapPin className="w-5 h-5" />}
          onValueChange={handleCEPChange}
          error={addressForm.formState.errors.zipCode?.message}
          forceLightMode={true}
        />
      </div>

      {/* Rua e Número */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Rua
          </label>
          <Input
            {...addressForm.register('street')}
            placeholder="Nome da rua"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Número
          </label>
          <Input
            {...addressForm.register('number')}
            placeholder="123"
          />
        </div>
      </div>

      {/* Complemento */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Complemento (opcional)
        </label>
        <Input
          {...addressForm.register('complement')}
          placeholder="Apartamento, sala, etc."
        />
      </div>

      {/* Bairro */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Bairro
        </label>
        <Input
          {...addressForm.register('neighborhood')}
          placeholder="Nome do bairro"
        />
      </div>

      {/* Cidade e Estado */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Cidade
          </label>
          <Input
            {...addressForm.register('city')}
            placeholder="Nome da cidade"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Estado
          </label>
          <Input
            {...addressForm.register('state')}
            placeholder="UF"
            maxLength={2}
          />
        </div>
      </div>
    </motion.div>
  )

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Termos e Condições
        </h2>
        <p className="text-gray-600 mt-2">
          Aceite os termos para finalizar seu cadastro
        </p>
      </div>

      {/* Senha */}
      <div>
        <label className="login-label block text-sm font-medium mb-2">
          Senha
        </label>
        <Input
          {...complianceForm.register('password')}
          type="password"
          placeholder="Mínimo 8 caracteres com maiúscula, minúscula, número e símbolo"
        />
        {complianceForm.formState.errors.password && (
          <p className="text-sm text-red-600">
            {complianceForm.formState.errors.password.message}
          </p>
        )}
        <PasswordStrengthIndicator password={complianceForm.watch('password') || ''} />
      </div>

      {/* Confirmar Senha */}
      <div>
        <label className="login-label block text-sm font-medium mb-2">
          Confirmar Senha
        </label>
        <Input
          {...complianceForm.register('confirmPassword')}
          type="password"
          placeholder="Confirme sua senha"
        />
        {complianceForm.formState.errors.confirmPassword && (
          <p className="text-sm text-red-600">
            {complianceForm.formState.errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* LGPD Consent */}
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="lgpdConsent"
            {...complianceForm.register('lgpdConsent')}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
          />
          <label htmlFor="lgpdConsent" className="text-sm text-gray-700">
            Eu aceito os{' '}
            <a href="/terms" className="text-blue-600 hover:underline">
              Termos de Uso
            </a>{' '}
            e a{' '}
            <a href="/privacy" className="text-blue-600 hover:underline">
              Política de Privacidade
            </a>
            , e autorizo o tratamento dos meus dados pessoais conforme a LGPD.
          </label>
        </div>
        {complianceForm.formState.errors.lgpdConsent && (
          <p className="text-sm text-red-600">
            {complianceForm.formState.errors.lgpdConsent.message}
          </p>
        )}
      </div>

      {/* Marketing Consent */}
      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          id="marketingConsent"
          {...complianceForm.register('marketingConsent')}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
        />
        <label htmlFor="marketingConsent" className="text-sm text-gray-700">
          Quero receber ofertas e novidades por email (opcional)
        </label>
      </div>

      {/* Resumo */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-4">
          Resumo do Cadastro
        </h3>
        <div className="space-y-2 text-sm">
          <p><strong>Nome:</strong> {personalForm.watch('fullName')}</p>
          <p><strong>Email:</strong> {personalForm.watch('email')}</p>
          <p><strong>Tipo:</strong> {personalForm.watch('taxType') === 'pessoa_fisica' ? 'Pessoa Física' : 'Pessoa Jurídica'}</p>
        </div>
      </div>
    </motion.div>
  )


  // ==============================================
  // RENDERIZAÇÃO PRINCIPAL
  // ==============================================

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Etapa {currentStep} de {totalSteps}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round((currentStep / totalSteps) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <AnimatePresence mode="wait">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="login-nav-button"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>

          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={nextStep}
              className="login-primary-button"
            >
              <span>Próximo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="login-primary-button"
            >
              {isLoading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              <span>{isLoading ? 'Criando conta...' : 'Criar Conta'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default EnhancedSignupForm
