// ==============================================
// SCRIPT PARA VER O HASH DA SENHA DO USUÁRIO
// ==============================================

import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase com Service Role Key
const supabaseUrl = 'https://lsvwjyhnnzeewuuuykmb.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function viewPasswordHash() {
  const userId = '95ca9cd7-ecbf-445f-a48b-643927d27ccf'
  const userEmail = 'creaty123456@gmail.com'
  
  console.log('🔍 Consultando hash da senha do usuário...')
  console.log('=' .repeat(60))

  try {
    // 1. Usar a API de administração para obter dados completos
    console.log('\n1️⃣ Obtendo dados do usuário via API admin...')
    
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId)

    if (userError) {
      console.log('❌ Erro ao consultar usuário:', userError.message)
      return
    }

    if (!userData || !userData.user) {
      console.log('❌ Usuário não encontrado')
      return
    }

    const user = userData.user
    console.log('✅ Usuário encontrado:')
    console.log('   📧 Email:', user.email)
    console.log('   🆔 ID:', user.id)
    console.log('   📅 Criado em:', user.created_at)
    console.log('   📧 Email confirmado:', user.email_confirmed_at ? 'Sim' : 'Não')
    console.log('   🔐 Último login:', user.last_sign_in_at || 'Nunca')

    // 2. Verificar se tem senha criptografada
    console.log('\n2️⃣ Verificando senha...')
    
    if (user.encrypted_password) {
      console.log('   🔒 Senha criptografada: SIM')
      console.log('   🔐 Hash completo:', user.encrypted_password)
      console.log('   📏 Tamanho do hash:', user.encrypted_password.length, 'caracteres')
      console.log('   🔍 Primeiros 50 caracteres:', user.encrypted_password.substring(0, 50) + '...')
      console.log('   🔍 Últimos 20 caracteres:', '...' + user.encrypted_password.substring(user.encrypted_password.length - 20))
    } else {
      console.log('   ❌ Senha criptografada: NÃO')
      console.log('   ⚠️  O usuário não tem senha definida ou há um problema no sistema')
    }

    // 3. Verificar outros campos relacionados à autenticação
    console.log('\n3️⃣ Outros campos de autenticação...')
    console.log('   🔑 Confirmation token:', user.confirmation_token ? 'Presente' : 'Ausente')
    console.log('   🔄 Recovery token:', user.recovery_token ? 'Presente' : 'Ausente')
    console.log('   📧 Email change token:', user.email_change_token_new ? 'Presente' : 'Ausente')
    console.log('   📱 Telefone:', user.phone || 'Não informado')
    console.log('   🚫 Banido até:', user.banned_until || 'Não')
    console.log('   🗑️ Deletado em:', user.deleted_at || 'Não')

    // 4. Verificar metadata
    console.log('\n4️⃣ Metadata do usuário...')
    if (user.raw_app_meta_data) {
      console.log('   📊 App metadata:', JSON.stringify(user.raw_app_meta_data, null, 2))
    }
    if (user.raw_user_meta_data) {
      console.log('   👤 User metadata:', JSON.stringify(user.raw_user_meta_data, null, 2))
    }

    // 5. Informações importantes
    console.log('\n5️⃣ Informações importantes:')
    console.log('   ⚠️  IMPORTANTE: O hash da senha NÃO pode ser revertido para a senha original')
    console.log('   🔄 Para testar senhas, use a API de login do Supabase')
    console.log('   📧 Para redefinir senha, use: supabase.auth.resetPasswordForEmail()')
    console.log('   🛠️  Para definir nova senha, use: supabase.auth.admin.updateUserById()')

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

// Executar script
viewPasswordHash()

