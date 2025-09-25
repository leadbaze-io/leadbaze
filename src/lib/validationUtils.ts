/**

 * Utilitários de validação para dados brasileiros

 * Focados em compliance fiscal e gateway de pagamento

 */

// ==============================================

// TIPOS E INTERFACES

// ==============================================

export interface AddressData {

  street: string

  neighborhood: string

  city: string

  state: string

  zipCode: string

  complement?: string

}

export interface ValidationResult {

  isValid: boolean

  error?: string

  data?: any

}

export interface CPFValidationResult extends ValidationResult {

  formatted?: string

}

export interface CNPJValidationResult extends ValidationResult {

  formatted?: string

}

// ==============================================

// VALIDAÇÃO DE CPF

// ==============================================

/**

 * Valida CPF brasileiro

 * @param cpf - CPF com ou sem formatação

 * @returns Resultado da validação

 */

export const validateCPF = (cpf: string): CPFValidationResult => {

  // Remove formatação

  const cleanCPF = cpf.replace(/\D/g, '')

  // Verifica se tem 11 dígitos

  if (cleanCPF.length !== 11) {

    return {

      isValid: false,

      error: 'CPF deve ter 11 dígitos'

    }

  }

  // Verifica se não são todos iguais

  if (/^(\d)\1{10}$/.test(cleanCPF)) {

    return {

      isValid: false,

      error: 'CPF inválido'

    }

  }

  // Algoritmo de validação CPF

  let sum = 0

  for (let i = 0; i < 9; i++) {

    sum += parseInt(cleanCPF.charAt(i)) * (10 - i)

  }

  let remainder = (sum * 10) % 11

  if (remainder === 10 || remainder === 11) remainder = 0

  if (remainder !== parseInt(cleanCPF.charAt(9))) {

    return {

      isValid: false,

      error: 'CPF inválido'

    }

  }

  sum = 0

  for (let i = 0; i < 10; i++) {

    sum += parseInt(cleanCPF.charAt(i)) * (11 - i)

  }

  remainder = (sum * 10) % 11

  if (remainder === 10 || remainder === 11) remainder = 0

  if (remainder !== parseInt(cleanCPF.charAt(10))) {

    return {

      isValid: false,

      error: 'CPF inválido'

    }

  }

  return {

    isValid: true,

    formatted: formatCPF(cleanCPF)

  }

}

/**

 * Formata CPF

 * @param cpf - CPF sem formatação

 * @returns CPF formatado

 */

export const formatCPF = (cpf: string): string => {

  const cleanCPF = cpf.replace(/\D/g, '')

  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')

}

// ==============================================

// VALIDAÇÃO DE CNPJ

// ==============================================

/**

 * Valida CNPJ brasileiro

 * @param cnpj - CNPJ com ou sem formatação

 * @returns Resultado da validação

 */

export const validateCNPJ = (cnpj: string): CNPJValidationResult => {

  // Remove formatação

  const cleanCNPJ = cnpj.replace(/\D/g, '')

  // Verifica se tem 14 dígitos

  if (cleanCNPJ.length !== 14) {

    return {

      isValid: false,

      error: 'CNPJ deve ter 14 dígitos'

    }

  }

  // Verifica se não são todos iguais

  if (/^(\d)\1{13}$/.test(cleanCNPJ)) {

    return {

      isValid: false,

      error: 'CNPJ inválido'

    }

  }

  // Algoritmo de validação CNPJ

  let sum = 0

  let weight = 2

  // Primeiro dígito verificador

  for (let i = 11; i >= 0; i--) {

    sum += parseInt(cleanCNPJ.charAt(i)) * weight

    weight = weight === 9 ? 2 : weight + 1

  }

  let remainder = sum % 11

  let firstDigit = remainder < 2 ? 0 : 11 - remainder

  if (firstDigit !== parseInt(cleanCNPJ.charAt(12))) {

    return {

      isValid: false,

      error: 'CNPJ inválido'

    }

  }

  // Segundo dígito verificador

  sum = 0

  weight = 2

  for (let i = 12; i >= 0; i--) {

    sum += parseInt(cleanCNPJ.charAt(i)) * weight

    weight = weight === 9 ? 2 : weight + 1

  }

  remainder = sum % 11

  let secondDigit = remainder < 2 ? 0 : 11 - remainder

  if (secondDigit !== parseInt(cleanCNPJ.charAt(13))) {

    return {

      isValid: false,

      error: 'CNPJ inválido'

    }

  }

  return {

    isValid: true,

    formatted: formatCNPJ(cleanCNPJ)

  }

}

/**

 * Formata CNPJ

 * @param cnpj - CNPJ sem formatação

 * @returns CNPJ formatado

 */

export const formatCNPJ = (cnpj: string): string => {

  const cleanCNPJ = cnpj.replace(/\D/g, '')

  return cleanCNPJ.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')

}

// ==============================================

// VALIDAÇÃO DE CEP

// ==============================================

/**

 * Valida e busca dados do CEP

 * @param cep - CEP com ou sem formatação

 * @returns Dados do endereço ou erro

 */

export const validateCEP = async (cep: string): Promise<ValidationResult & { data?: AddressData }> => {

  const cleanCEP = cep.replace(/\D/g, '')

  // Verifica se tem 8 dígitos

  if (cleanCEP.length !== 8) {

    return {

      isValid: false,

      error: 'CEP deve ter 8 dígitos'

    }

  }

  try {

    const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`)

    const data = await response.json()

    if (data.erro) {

      return {

        isValid: false,

        error: 'CEP não encontrado'

      }

    }

    return {

      isValid: true,

      data: {

        street: data.logradouro,

        neighborhood: data.bairro,

        city: data.localidade,

        state: data.uf,

        zipCode: cleanCEP

      }

    }

  } catch (error) {

    return {

      isValid: false,

      error: 'Erro ao consultar CEP'

    }

  }

}

/**

 * Formata CEP

 * @param cep - CEP sem formatação

 * @returns CEP formatado

 */

export const formatCEP = (cep: string): string => {

  const cleanCEP = cep.replace(/\D/g, '')

  return cleanCEP.replace(/(\d{5})(\d{3})/, '$1-$2')

}

// ==============================================

// VALIDAÇÃO DE EMAIL

// ==============================================

/**

 * Valida email brasileiro

 * @param email - Email para validar

 * @returns Resultado da validação

 */

export const validateEmail = (email: string): ValidationResult => {

  // Regex robusto para email

  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

  if (!emailRegex.test(email)) {

    return {

      isValid: false,

      error: 'Email inválido'

    }

  }

  // Verifica domínios temporários comuns

  const tempDomains = [

    '10minutemail.com',

    'tempmail.org',

    'guerrillamail.com',

    'mailinator.com',

    'yopmail.com'

  ]

  const domain = email.split('@')[1]?.toLowerCase()

  if (tempDomains.includes(domain)) {

    return {

      isValid: false,

      error: 'Email temporário não permitido'

    }

  }

  return {

    isValid: true

  }

}

// ==============================================

// VALIDAÇÃO DE TELEFONE

// ==============================================

/**

 * Valida telefone brasileiro

 * @param phone - Telefone com ou sem formatação

 * @returns Resultado da validação

 */

export const validatePhone = (phone: string): ValidationResult => {

  const cleanPhone = phone.replace(/\D/g, '')

  // Verifica se tem 10 ou 11 dígitos

  if (cleanPhone.length < 10 || cleanPhone.length > 11) {

    return {

      isValid: false,

      error: 'Telefone deve ter 10 ou 11 dígitos'

    }

  }

  // Verifica se começa com DDD válido

  const ddd = cleanPhone.substring(0, 2)

  const validDDDs = [

    '11', '12', '13', '14', '15', '16', '17', '18', '19', // SP

    '21', '22', '24', // RJ

    '27', '28', // ES

    '31', '32', '33', '34', '35', '37', '38', // MG

    '41', '42', '43', '44', '45', '46', // PR

    '47', '48', '49', // SC

    '51', '53', '54', '55', // RS

    '61', // DF

    '62', '64', // GO

    '63', // TO

    '65', '66', // MT

    '67', // MS

    '68', // AC

    '69', // RO

    '71', '73', '74', '75', '77', // BA

    '79', // SE

    '81', '87', // PE

    '82', // AL

    '83', // PB

    '84', // RN

    '85', '88', // CE

    '86', '89', // PI

    '91', '93', '94', // PA

    '92', '97', // AM

    '95', // RR

    '96', // AP

    '98', '99' // MA

  ]

  if (!validDDDs.includes(ddd)) {

    return {

      isValid: false,

      error: 'DDD inválido'

    }

  }

  return {

    isValid: true,

    data: formatPhone(cleanPhone)

  }

}

/**

 * Formata telefone brasileiro

 * @param phone - Telefone sem formatação

 * @returns Telefone formatado

 */

export const formatPhone = (phone: string): string => {

  const cleanPhone = phone.replace(/\D/g, '')

  if (cleanPhone.length === 11) {

    return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')

  } else if (cleanPhone.length === 10) {

    return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')

  }

  return cleanPhone

}

// ==============================================

// VALIDAÇÃO DE NOME

// ==============================================

/**

 * Valida nome completo

 * @param name - Nome para validar

 * @returns Resultado da validação

 */

export const validateFullName = (name: string): ValidationResult => {

  const trimmedName = name.trim()

  if (trimmedName.length < 2) {

    return {

      isValid: false,

      error: 'Nome deve ter pelo menos 2 caracteres'

    }

  }

  if (trimmedName.length > 200) {

    return {

      isValid: false,

      error: 'Nome deve ter no máximo 200 caracteres'

    }

  }

  // Verifica se tem pelo menos nome e sobrenome

  const nameParts = trimmedName.split(' ').filter(part => part.length > 0)

  if (nameParts.length < 2) {

    return {

      isValid: false,

      error: 'Digite nome e sobrenome'

    }

  }

  // Verifica se não contém números

  if (/\d/.test(trimmedName)) {

    return {

      isValid: false,

      error: 'Nome não pode conter números'

    }

  }

  return {

    isValid: true,

    data: trimmedName

  }

}

// ==============================================

// VALIDAÇÃO DE DATA DE NASCIMENTO

// ==============================================

/**

 * Valida data de nascimento

 * @param birthDate - Data de nascimento

 * @returns Resultado da validação

 */

export const validateBirthDate = (birthDate: string | Date): ValidationResult => {

  const date = new Date(birthDate)

  const today = new Date()

  if (isNaN(date.getTime())) {

    return {

      isValid: false,

      error: 'Data inválida'

    }

  }

  if (date > today) {

    return {

      isValid: false,

      error: 'Data de nascimento não pode ser futura'

    }

  }

  // Calcula idade

  const age = today.getFullYear() - date.getFullYear()

  const monthDiff = today.getMonth() - date.getMonth()

  const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())

    ? age - 1

    : age

  if (actualAge < 18) {

    return {

      isValid: false,

      error: 'É necessário ser maior de 18 anos'

    }

  }

  if (actualAge > 120) {

    return {

      isValid: false,

      error: 'Idade inválida'

    }

  }

  return {

    isValid: true,

    data: {

      age: actualAge,

      formattedDate: date.toISOString().split('T')[0]

    }

  }

}

// ==============================================

// UTILITÁRIOS GERAIS

// ==============================================

/**

 * Remove formatação de string

 * @param str - String formatada

 * @returns String sem formatação

 */

export const removeFormatting = (str: string): string => {

  return str.replace(/\D/g, '')

}

/**

 * Valida se string não está vazia

 * @param str - String para validar

 * @param fieldName - Nome do campo para erro

 * @returns Resultado da validação

 */

export const validateRequired = (str: string, fieldName: string): ValidationResult => {

  if (!str || str.trim().length === 0) {

    return {

      isValid: false,

      error: `${fieldName} é obrigatório`

    }

  }

  return {

    isValid: true

  }

}

/**

 * Valida comprimento de string

 * @param str - String para validar

 * @param min - Comprimento mínimo

 * @param max - Comprimento máximo

 * @param fieldName - Nome do campo para erro

 * @returns Resultado da validação

 */

export const validateLength = (

  str: string,

  min: number,

  max: number,

  fieldName: string

): ValidationResult => {

  if (str.length < min) {

    return {

      isValid: false,

      error: `${fieldName} deve ter pelo menos ${min} caracteres`

    }

  }

  if (str.length > max) {

    return {

      isValid: false,

      error: `${fieldName} deve ter no máximo ${max} caracteres`

    }

  }

  return {

    isValid: true

  }

}

// ==============================================

// EXPORTAÇÕES

// ==============================================

export default {

  validateCPF,

  validateCNPJ,

  validateCEP,

  validateEmail,

  validatePhone,

  validateFullName,

  validateBirthDate,

  formatCPF,

  formatCNPJ,

  formatCEP,

  formatPhone,

  removeFormatting,

  validateRequired,

  validateLength

}
