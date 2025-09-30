import { supabase } from './supabaseClient'

import { validateCPF, validateCNPJ, validateCEP, validateEmail, validatePhone } from './validationUtils'

// ==============================================

// TIPOS E INTERFACES

// ==============================================

export interface UserProfile {

  id: string

  user_id: string

  tax_type: 'pessoa_fisica' | 'pessoa_juridica'

  // Dados pessoais

  cpf?: string

  cnpj?: string

  full_name: string

  birth_date?: string

  rg?: string

  // Dados da empresa

  company_name?: string

  trade_name?: string

  state_registration?: string

  municipal_registration?: string

  // Contato

  email: string

  phone: string

  alternative_phone?: string

  preferred_contact: 'email' | 'phone' | 'whatsapp'

  // Endereço

  billing_street: string

  billing_number: string

  billing_complement?: string

  billing_neighborhood: string

  billing_city: string

  billing_state: string

  billing_zip_code: string

  billing_country: string

  // Pagamento

  accepted_payment_methods: string[]

  billing_cycle: 'monthly' | 'yearly'

  auto_renewal: boolean

  // Dados do cartão

  card_last4?: string

  card_brand?: string

  card_expiry_month?: number

  card_expiry_year?: number

  card_holder_name?: string

  // Status

  profile_completion_percentage: number

  is_verified: boolean

  verification_status: Record<string, any>

  // Compliance

  lgpd_consent: boolean

  lgpd_consent_date?: string

  lgpd_consent_ip?: string

  lgpd_consent_user_agent?: string

  // Metadados

  created_at: string

  updated_at: string

}

export interface UserVerification {

  id: string

  user_id: string

  verification_type: 'cpf' | 'cnpj' | 'phone' | 'email' | 'address' | 'document'

  verification_method: 'api' | 'sms' | 'email' | 'upload' | 'manual'

  verification_code?: string

  verification_token?: string

  external_id?: string

  status: 'pending' | 'verified' | 'failed' | 'expired'

  attempts: number

  max_attempts: number

  verification_result?: Record<string, any>

  error_message?: string

  verified_at?: string

  expires_at?: string

  created_at: string

}

export interface UserDocument {

  id: string

  user_id: string

  document_type: 'cpf' | 'cnpj' | 'rg' | 'cnh' | 'passport' | 'address_proof' | 'income_proof'

  document_name: string

  file_url: string

  file_size?: number

  mime_type?: string

  status: 'pending' | 'approved' | 'rejected' | 'expired'

  rejection_reason?: string

  uploaded_at: string

  reviewed_at?: string

  expires_at?: string

}

export interface UserPaymentMethod {

  id: string

  user_id: string

  payment_type: 'credit_card' | 'debit_card' | 'pix' | 'boleto' | 'bank_transfer'

  is_default: boolean

  card_token?: string

  card_last4?: string

  card_brand?: string

  card_expiry_month?: number

  card_expiry_year?: number

  card_holder_name?: string

  pix_key?: string

  pix_type?: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random'

  is_active: boolean

  is_verified: boolean

  created_at: string

  updated_at: string

}

export interface CreateProfileData {

  tax_type: 'pessoa_fisica' | 'pessoa_juridica'

  cpf?: string

  cnpj?: string

  full_name: string

  birth_date?: string

  company_name?: string

  email: string

  phone: string

  billing_street: string

  billing_number: string

  billing_complement?: string

  billing_neighborhood: string

  billing_city: string

  billing_state: string

  billing_zip_code: string

  accepted_payment_methods: string[]

  billing_cycle: 'monthly' | 'yearly'

  auto_renewal: boolean

  lgpd_consent: boolean

  lgpd_consent_ip?: string

  lgpd_consent_user_agent?: string

}

export interface UpdateProfileData extends Partial<CreateProfileData> {

  id?: never // Não permitir atualizar ID

}

// ==============================================

// SERVIÇO PRINCIPAL

// ==============================================

export class UserProfileService {

  /**

   * Obtém o perfil completo do usuário

   */

  static async getProfile(userId: string): Promise<UserProfile | null> {

    try {

      const { data, error } = await supabase

        .from('user_profiles')

        .select('*')

        .eq('user_id', userId)

        .single()

      if (error) {

        return null

      }

      return data

    } catch (error) {

      return null

    }

  }

  /**

   * Cria um novo perfil de usuário

   */

  static async createProfile(userId: string, profileData: CreateProfileData): Promise<UserProfile | null> {

    try {

      // Validar dados antes de salvar

      const validation = await this.validateProfileData(profileData)

      if (!validation.isValid) {

        throw new Error(validation.error)

      }

      const { data, error } = await supabase

        .from('user_profiles')

        .insert({

          user_id: userId,

          ...profileData,

          lgpd_consent_date: new Date().toISOString()

        })

        .select()

        .single()

      if (error) {

        throw error

      }

      return data

    } catch (error) {

      throw error

    }

  }

  /**

   * Atualiza o perfil do usuário

   */

  static async updateProfile(userId: string, updates: UpdateProfileData): Promise<UserProfile | null> {

    try {

      // Validar dados se fornecidos

      if (Object.keys(updates).length > 0) {

        const validation = await this.validateProfileData(updates as CreateProfileData)

        if (!validation.isValid) {

          throw new Error(validation.error)

        }

      }

      const { data, error } = await supabase

        .from('user_profiles')

        .update(updates)

        .eq('user_id', userId)

        .select()

        .single()

      if (error) {

        throw error

      }

      return data

    } catch (error) {

      throw error

    }

  }

  /**

   * Valida dados do perfil

   */

  static async validateProfileData(data: Partial<CreateProfileData>): Promise<{ isValid: boolean; error?: string }> {

    try {

      // Validar CPF se fornecido

      if (data.cpf) {

        const cpfValidation = validateCPF(data.cpf)

        if (!cpfValidation.isValid) {

          return { isValid: false, error: cpfValidation.error }

        }

      }

      // Validar CNPJ se fornecido

      if (data.cnpj) {

        const cnpjValidation = validateCNPJ(data.cnpj)

        if (!cnpjValidation.isValid) {

          return { isValid: false, error: cnpjValidation.error }

        }

      }

      // Validar email se fornecido

      if (data.email) {

        const emailValidation = validateEmail(data.email)

        if (!emailValidation.isValid) {

          return { isValid: false, error: emailValidation.error }

        }

      }

      // Validar telefone se fornecido

      if (data.phone) {

        const phoneValidation = validatePhone(data.phone)

        if (!phoneValidation.isValid) {

          return { isValid: false, error: phoneValidation.error }

        }

      }

      // Validar CEP se fornecido

      if (data.billing_zip_code) {

        const cepValidation = await validateCEP(data.billing_zip_code)

        if (!cepValidation.isValid) {

          return { isValid: false, error: cepValidation.error }

        }

      }

      return { isValid: true }

    } catch (error) {

      return { isValid: false, error: 'Erro na validação dos dados' }

    }

  }

  /**

   * Obtém verificações do usuário

   */

  static async getVerifications(userId: string): Promise<UserVerification[]> {

    try {

      const { data, error } = await supabase

        .from('user_verifications')

        .select('*')

        .eq('user_id', userId)

        .order('created_at', { ascending: false })

      if (error) {

        return []

      }

      return data || []

    } catch (error) {

      return []

    }

  }

  /**

   * Cria uma nova verificação

   */

  static async createVerification(

    userId: string,

    verificationType: UserVerification['verification_type'],

    verificationMethod: UserVerification['verification_method'],

    data?: Record<string, any>

  ): Promise<UserVerification | null> {

    try {

      const { data: verification, error } = await supabase

        .from('user_verifications')

        .insert({

          user_id: userId,

          verification_type: verificationType,

          verification_method: verificationMethod,

          verification_result: data,

          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas

        })

        .select()

        .single()

      if (error) {

        throw error

      }

      return verification

    } catch (error) {

      throw error

    }

  }

  /**

   * Atualiza status de verificação

   */

  static async updateVerification(

    verificationId: string,

    status: UserVerification['status'],

    result?: Record<string, any>,

    errorMessage?: string

  ): Promise<boolean> {

    try {

      const updateData: any = { status }

      if (status === 'verified') {

        updateData.verified_at = new Date().toISOString()

        updateData.verification_result = result

      } else if (status === 'failed') {

        updateData.error_message = errorMessage

        updateData.attempts = 1

      }

      const { error } = await supabase

        .from('user_verifications')

        .update(updateData)

        .eq('id', verificationId)

      if (error) {

        return false

      }

      return true

    } catch (error) {

      return false

    }

  }

  /**

   * Obtém documentos do usuário

   */

  static async getDocuments(userId: string): Promise<UserDocument[]> {

    try {

      const { data, error } = await supabase

        .from('user_documents')

        .select('*')

        .eq('user_id', userId)

        .order('uploaded_at', { ascending: false })

      if (error) {

        return []

      }

      return data || []

    } catch (error) {

      return []

    }

  }

  /**

   * Faz upload de documento

   */

  static async uploadDocument(

    userId: string,

    file: File,

    documentType: UserDocument['document_type']

  ): Promise<UserDocument | null> {

    try {

      // Upload do arquivo para Supabase Storage

      const fileExt = file.name.split('.').pop()

      const fileName = `${userId}/${documentType}_${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage

        .from('user-documents')

        .upload(fileName, file)

      if (uploadError) {

        throw uploadError

      }

      // Obter URL pública

      const { data: urlData } = supabase.storage

        .from('user-documents')

        .getPublicUrl(fileName)

      // Salvar referência no banco

      const { data, error } = await supabase

        .from('user_documents')

        .insert({

          user_id: userId,

          document_type: documentType,

          document_name: file.name,

          file_url: urlData.publicUrl,

          file_size: file.size,

          mime_type: file.type

        })

        .select()

        .single()

      if (error) {

        throw error

      }

      return data

    } catch (error) {

      throw error

    }

  }

  /**

   * Obtém métodos de pagamento do usuário

   */

  static async getPaymentMethods(userId: string): Promise<UserPaymentMethod[]> {

    try {

      const { data, error } = await supabase

        .from('user_payment_methods')

        .select('*')

        .eq('user_id', userId)

        .eq('is_active', true)

        .order('is_default', { ascending: false })

      if (error) {

        return []

      }

      return data || []

    } catch (error) {

      return []

    }

  }

  /**

   * Adiciona método de pagamento

   */

  static async addPaymentMethod(

    userId: string,

    paymentData: Partial<UserPaymentMethod>

  ): Promise<UserPaymentMethod | null> {

    try {

      const { data, error } = await supabase

        .from('user_payment_methods')

        .insert({

          user_id: userId,

          ...paymentData

        })

        .select()

        .single()

      if (error) {

        throw error

      }

      return data

    } catch (error) {

      throw error

    }

  }

  /**

   * Remove método de pagamento

   */

  static async removePaymentMethod(paymentMethodId: string): Promise<boolean> {

    try {

      const { error } = await supabase

        .from('user_payment_methods')

        .update({ is_active: false })

        .eq('id', paymentMethodId)

      if (error) {

        return false

      }

      return true

    } catch (error) {

      return false

    }

  }

  /**

   * Define método de pagamento padrão

   */

  static async setDefaultPaymentMethod(userId: string, paymentMethodId: string): Promise<boolean> {

    try {

      // Primeiro, remove o padrão de todos os métodos

      await supabase

        .from('user_payment_methods')

        .update({ is_default: false })

        .eq('user_id', userId)

      // Depois, define o novo padrão

      const { error } = await supabase

        .from('user_payment_methods')

        .update({ is_default: true })

        .eq('id', paymentMethodId)

        .eq('user_id', userId)

      if (error) {

        return false

      }

      return true

    } catch (error) {

      return false

    }

  }

  /**

   * Calcula porcentagem de completude do perfil

   */

  static calculateCompletionPercentage(profile: Partial<UserProfile>): number {

    let completion = 0

    const totalFields = 15 // Total de campos obrigatórios

    // Dados básicos (40%)

    if (profile.full_name) completion += 2

    if (profile.email) completion += 2

    if (profile.phone) completion += 2

    if (profile.cpf || profile.cnpj) completion += 2

    // Endereço (30%)

    if (profile.billing_street) completion += 2

    if (profile.billing_number) completion += 2

    if (profile.billing_neighborhood) completion += 2

    if (profile.billing_city) completion += 2

    if (profile.billing_state) completion += 2

    if (profile.billing_zip_code) completion += 2

    // Pagamento (20%)

    if (profile.accepted_payment_methods?.length) completion += 2

    if (profile.billing_cycle) completion += 2

    // Compliance (10%)

    if (profile.lgpd_consent) completion += 2

    return Math.round((completion / totalFields) * 100)

  }

  /**

   * Verifica se o perfil está completo para pagamentos

   */

  static isProfileCompleteForPayments(profile: Partial<UserProfile>): boolean {

    const requiredFields = [

      'full_name',

      'email',

      'phone',

      'billing_street',

      'billing_number',

      'billing_neighborhood',

      'billing_city',

      'billing_state',

      'billing_zip_code',

      'accepted_payment_methods',

      'billing_cycle',

      'lgpd_consent'

    ]

    // Verifica se é pessoa física ou jurídica

    if (profile.tax_type === 'pessoa_fisica') {

      requiredFields.push('cpf')

    } else if (profile.tax_type === 'pessoa_juridica') {

      requiredFields.push('cnpj', 'company_name')

    }

    return requiredFields.every(field => {

      const value = profile[field as keyof UserProfile]

      return value !== undefined && value !== null && value !== ''

    })

  }

}

export default UserProfileService
