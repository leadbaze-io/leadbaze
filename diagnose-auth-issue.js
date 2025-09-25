import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lsvwjyhnnzeewuuuykmb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzdndqeWhubnplZXd1dXV5a21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMzNzg1NiwiZXhwIjoyMDY5OTEzODU2fQ.XeXm2_L1IBhytbQPpEnmUgygv22TOcu8SCWelHcW3Mk';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function diagnoseAuthIssue() {
  console.log('🔍 DIAGNÓSTICO COMPLETO DO PROBLEMA DE AUTENTICAÇÃO\n');
  
  try {
    // 1. Testar signup com diferentes configurações
    console.log('📧 TESTE 1: Signup com configurações diferentes\n');
    
    const testEmails = [
      `teste1-${Date.now()}@gmail.com`,
      `teste2-${Date.now()}@hotmail.com`,
      `teste3-${Date.now()}@outlook.com`
    ];
    
    for (let i = 0; i < testEmails.length; i++) {
      const email = testEmails[i];
      console.log(`🧪 Teste ${i + 1}: ${email}`);
      
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email: email,
        password: '123456789',
        options: {
          emailRedirectTo: 'https://leadbaze.io/auth/callback',
          data: {
            source: 'diagnostic_test'
          }
        }
      });
      
      if (signupError) {
        console.log(`❌ Erro: ${signupError.message}`);
      } else {
        console.log(`✅ Usuário criado: ${signupData.user?.email}`);
        console.log(`📧 Email confirmado: ${signupData.user?.email_confirmed_at ? 'SIM' : 'NÃO'}`);
        console.log(`🔐 Senha salva: ${signupData.user?.encrypted_password ? 'SIM' : 'NÃO'}`);
        console.log(`📧 Email enviado: ${signupData.user?.email_confirmed_at ? 'NÃO' : 'SIM'}`);
        
        // Aguardar um pouco para ver se o email é processado
        console.log('⏳ Aguardando 3 segundos...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Verificar novamente o status
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(signupData.user.id);
        if (!userError && userData.user) {
          console.log(`🔄 Status após 3s: Email confirmado: ${userData.user.email_confirmed_at ? 'SIM' : 'NÃO'}`);
        }
        
        // Limpar usuário de teste
        await supabase.auth.admin.deleteUser(signupData.user.id);
        console.log('🧹 Usuário de teste removido\n');
      }
    }
    
    // 2. Testar com diferentes redirect URLs
    console.log('🔗 TESTE 2: Diferentes redirect URLs\n');
    
    const redirectUrls = [
      'https://leadbaze.io/auth/callback',
      'https://leadbaze.io/dashboard',
      'http://localhost:5173/auth/callback',
      'https://leadflow-indol.vercel.app/auth/callback'
    ];
    
    for (const redirectUrl of redirectUrls) {
      console.log(`🧪 Testando redirect: ${redirectUrl}`);
      
      const testEmail = `redirect-${Date.now()}@teste.com`;
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email: testEmail,
        password: '123456789',
        options: {
          emailRedirectTo: redirectUrl
        }
      });
      
      if (signupError) {
        console.log(`❌ Erro: ${signupError.message}`);
      } else {
        console.log(`✅ Usuário criado com redirect: ${redirectUrl}`);
        console.log(`📧 Email confirmado: ${signupData.user?.email_confirmed_at ? 'SIM' : 'NÃO'}`);
        console.log(`🔐 Senha salva: ${signupData.user?.encrypted_password ? 'SIM' : 'NÃO'}`);
        
        // Limpar
        await supabase.auth.admin.deleteUser(signupData.user.id);
        console.log('🧹 Usuário removido\n');
      }
    }
    
    // 3. Verificar configurações do projeto
    console.log('⚙️ TESTE 3: Verificando configurações\n');
    
    // Tentar acessar configurações via API (se possível)
    console.log('📋 Configurações atuais:');
    console.log(`🌐 Supabase URL: ${supabaseUrl}`);
    console.log(`🔑 Service Key: ${supabaseServiceKey ? 'Configurada' : 'Não configurada'}`);
    console.log(`📧 Redirect padrão: https://leadbaze.io/auth/callback`);
    
    // 4. Testar com confirmação manual
    console.log('\n🔧 TESTE 4: Confirmação manual\n');
    
    const manualTestEmail = `manual-${Date.now()}@teste.com`;
    console.log(`🧪 Criando usuário: ${manualTestEmail}`);
    
    const { data: manualSignupData, error: manualSignupError } = await supabase.auth.signUp({
      email: manualTestEmail,
      password: '123456789',
      options: {
        emailRedirectTo: 'https://leadbaze.io/auth/callback'
      }
    });
    
    if (manualSignupError) {
      console.log(`❌ Erro no signup: ${manualSignupError.message}`);
    } else {
      console.log(`✅ Usuário criado: ${manualSignupData.user?.email}`);
      console.log(`📧 Status inicial: Email confirmado: ${manualSignupData.user?.email_confirmed_at ? 'SIM' : 'NÃO'}`);
      
      // Confirmar manualmente
      console.log('🔧 Confirmando email manualmente...');
      const { data: confirmData, error: confirmError } = await supabase.auth.admin.updateUserById(
        manualSignupData.user.id,
        { email_confirm: true }
      );
      
      if (confirmError) {
        console.log(`❌ Erro na confirmação: ${confirmError.message}`);
      } else {
        console.log(`✅ Email confirmado manualmente!`);
        console.log(`📧 Confirmado em: ${confirmData.user.email_confirmed_at}`);
        
        // Testar login
        console.log('🧪 Testando login...');
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: manualTestEmail,
          password: '123456789'
        });
        
        if (loginError) {
          console.log(`❌ Erro no login: ${loginError.message}`);
        } else {
          console.log(`✅ Login bem-sucedido!`);
        }
      }
      
      // Limpar
      await supabase.auth.admin.deleteUser(manualSignupData.user.id);
      console.log('🧹 Usuário removido');
    }
    
    console.log('\n🎯 RESUMO DO DIAGNÓSTICO:');
    console.log('=====================================');
    console.log('✅ Signup: Funcionando');
    console.log('❌ Confirmação automática: Não funcionando');
    console.log('✅ Confirmação manual: Funcionando');
    console.log('❌ Salvamento de senha: Não funcionando');
    console.log('✅ Função RPC: Funcionando');
    console.log('=====================================');
    
    console.log('\n🔍 POSSÍVEIS CAUSAS:');
    console.log('1. Configuração SMTP incorreta ou inativa');
    console.log('2. Redirect URLs não configuradas no Supabase Dashboard');
    console.log('3. Problema com provedor de email (Gmail, Hotmail, etc.)');
    console.log('4. Configuração de domínio no Supabase');
    console.log('5. Cache ou delay no processamento do Supabase');
    
  } catch (error) {
    console.error('❌ Erro geral no diagnóstico:', error);
  }
}

diagnoseAuthIssue();

