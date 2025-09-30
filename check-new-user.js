// ==============================================
// SCRIPT PARA VERIFICAR NOVO USUÁRIO
// ==============================================

import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase com Service Role Key
const supabaseUrl = 'https://lsvwjyhnnzeewuuuykmb.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkNewUser() {
  const testEmail = 'creaty1234567@gmail.com'
  
  console.log('🔍 Verificando novo usuário...')
  console.log('=' .repeat(60))

  try {
    // 1. Listar todos os usuários para encontrar o novo
    console.log('\n1️⃣ Procurando pelo novo usuário...')
    
    const { data: allUsers, error: allUsersError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 20
    })

    if (allUsersError) {
      console.log('❌ Erro ao listar usuários:', allUsersError.message)
      return
    }

    if (!allUsers || !allUsers.users) {
      console.log('❌ Nenhum usuário encontrado')
      return
    }

    // 2. Encontrar o usuário específico
    const newUser = allUsers.users.find(user => user.email === testEmail)
    
    if (!newUser) {
      console.log('❌ Usuário não encontrado:', testEmail)
      console.log('\n📋 Usuários encontrados:')
      allUsers.users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} - ID: ${user.id}`)
      })
      return
    }

    console.log('✅ Usuário encontrado:')
    console.log('   📧 Email:', newUser.email)
    console.log('   🆔 ID:', newUser.id)
    console.log('   📅 Criado em:', newUser.created_at)
    console.log('   📧 Email confirmado:', newUser.email_confirmed_at ? 'Sim' : 'Não')
    console.log('   🔒 Senha:', newUser.encrypted_password ? 'SIM' : 'NÃO')
    console.log('   📅 Última atualização:', newUser.updated_at)

    // 3. Verificar se a senha foi salva
    if (newUser.encrypted_password) {
      console.log('   🔐 Hash da senha:', newUser.encrypted_password.substring(0, 50) + '...')
      console.log('   ✅ Senha foi salva!')
    } else {
      console.log('   ❌ Senha NÃO foi salva!')
      console.log('   🔧 Este é o problema!')
    }

    // 4. Testar login com diferentes senhas
    console.log('\n2️⃣ Testando login...')
    
    const possiblePasswords = [
      'TestPassword123!',
      'testpassword123!',
      'TestPassword123',
      'testpassword123',
      '123456',
      'password',
      'senha123'
    ]

    for (const password of possiblePasswords) {
      console.log(`   🧪 Testando senha: ${password}`)
      
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: password
      })

      if (loginError) {
        console.log(`      ❌ Falhou: ${loginError.message}`)
      } else if (loginData.user) {
        console.log(`      ✅ SUCESSO! Senha correta: ${password}`)
        console.log('      🆔 User ID:', loginData.user.id)
        break
      }
    }

    // 5. Diagnóstico
    console.log('\n3️⃣ Diagnóstico:')
    
    if (newUser.email_confirmed_at && newUser.encrypted_password) {
      console.log('   ✅ Email confirmado e senha salva')
      console.log('   🔍 Problema pode ser na senha digitada')
    } else if (newUser.email_confirmed_at) {
      console.log('   ⚠️  Email confirmado mas senha NÃO salva')
      console.log('   🔧 Este é o bug! Senha não foi salva após confirmação')
    } else {
      console.log('   ❌ Email não confirmado')
      console.log('   📧 Confirme o email primeiro')
    }

    // 6. Solução
    if (newUser.email_confirmed_at && !newUser.encrypted_password) {
      console.log('\n4️⃣ SOLUÇÃO: Definir senha manualmente')
      
      const newPassword = 'TestPassword123!'
      const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(newUser.id, {
        password: newPassword
      })

      if (updateError) {
        console.log('❌ Erro ao definir senha:', updateError.message)
      } else {
        console.log('✅ Senha definida com sucesso!')
        console.log('   🔐 Nova senha:', newPassword)
        console.log('   🧪 Teste o login agora!')
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

// Executar script
checkNewUser()

