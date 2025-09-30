// ==============================================
// SCRIPT PARA CONSULTAR INFORMAÇÕES DO USUÁRIO COM SERVICE ROLE
// ==============================================

import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase com Service Role Key
const supabaseUrl = 'https://lsvwjyhnnzeewuuuykmb.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkUserWithServiceRole() {
  const userId = '95ca9cd7-ecbf-445f-a48b-643927d27ccf'
  
  console.log('🔍 Consultando informações do usuário com Service Role:', userId)
  console.log('=' .repeat(60))

  try {
    // 1. Consultar informações básicas do usuário
    console.log('\n1️⃣ Informações básicas do usuário...')
    
    // Usar a API de administração do Supabase
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
    console.log('   🔒 Senha criptografada:', user.encrypted_password ? 'Sim (não pode ser descriptografada)' : 'Não')
    console.log('   📱 Telefone:', user.phone || 'Não informado')
    console.log('   🚫 Banido até:', user.banned_until || 'Não')
    console.log('   🗑️ Deletado em:', user.deleted_at || 'Não')

    // 2. Verificar dados relacionados
    console.log('\n2️⃣ Verificando dados relacionados...')
    
    const tables = [
      'lead_lists',
      'whatsapp_templates', 
      'contact_attempts',
      'user_preferences',
      'whatsapp_instances'
    ]

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('id')
          .eq('user_id', userId)

        if (error) {
          console.log(`   ❌ ${table}: Erro - ${error.message}`)
        } else {
          console.log(`   ✅ ${table}: ${data.length} registros`)
        }
      } catch (err) {
        console.log(`   ❌ ${table}: Erro - ${err.message}`)
      }
    }

    // 3. Informações sobre senha
    console.log('\n3️⃣ Informações sobre senha...')
    console.log('   ⚠️  IMPORTANTE: As senhas no Supabase são criptografadas e NÃO podem ser descriptografadas!')
    console.log('   🔄 Para redefinir a senha, use uma das opções:')
    console.log('      1. Dashboard Supabase > Authentication > Users > Send password reset')
    console.log('      2. Execute o script SQL: check-user-password.sql')
    console.log('      3. Use a API: supabase.auth.resetPasswordForEmail()')
    console.log('      4. Via SQL direto (se necessário):')
    console.log(`         UPDATE auth.users SET encrypted_password = crypt('nova_senha', gen_salt('bf')) WHERE id = '${userId}';`)

    // 4. Mostrar hash da senha (apenas para referência)
    if (user.encrypted_password) {
      console.log('\n4️⃣ Hash da senha (apenas para referência):')
      console.log('   🔐 Hash:', user.encrypted_password.substring(0, 50) + '...')
      console.log('   ⚠️  Este hash NÃO pode ser revertido para a senha original!')
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

// Executar script
checkUserWithServiceRole()
