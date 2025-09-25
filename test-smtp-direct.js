// ==============================================
// TESTE DIRETO DO SMTP - SEM CRIAR CONTAS
// ==============================================

import nodemailer from 'nodemailer'

// Configuração do SMTP (mesma do Supabase)
const smtpConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true para 465, false para outras portas
  auth: {
    user: 'leadbaze@gmail.com',
    pass: 'jtucwfczikgntxdj' // Senha de app gerada
  }
}

async function testSMTP() {
  console.log('🧪 Testando SMTP diretamente...')
  console.log('=' .repeat(60))

  try {
    // 1. Criar transporter
    console.log('\n1️⃣ Criando transporter SMTP...')
    const transporter = nodemailer.createTransport(smtpConfig)

    // 2. Verificar conexão
    console.log('\n2️⃣ Verificando conexão SMTP...')
    await transporter.verify()
    console.log('✅ Conexão SMTP verificada com sucesso!')

    // 3. Enviar email de teste
    console.log('\n3️⃣ Enviando email de teste...')
    const testEmail = {
      from: 'LeadBaze <leadbaze@gmail.com>',
      to: 'leadbaze@gmail.com', // Enviar para o próprio email
      subject: '🧪 Teste SMTP - LeadBaze',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">🧪 Teste SMTP - LeadBaze</h1>
          <p>Este é um email de teste para verificar se o SMTP está funcionando corretamente.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>📋 Detalhes do Teste:</h3>
            <ul>
              <li><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</li>
              <li><strong>Host:</strong> smtp.gmail.com</li>
              <li><strong>Porta:</strong> 587</li>
              <li><strong>Status:</strong> ✅ Funcionando</li>
            </ul>
          </div>
          
          <p>Se você recebeu este email, o SMTP está configurado corretamente!</p>
          
          <hr style="margin: 30px 0;">
          <p style="color: #6b7280; font-size: 12px;">
            Email enviado automaticamente pelo sistema de teste SMTP do LeadBaze
          </p>
        </div>
      `
    }

    const info = await transporter.sendMail(testEmail)
    console.log('✅ Email de teste enviado com sucesso!')
    console.log('📧 Message ID:', info.messageId)
    console.log('📬 Verifique a caixa de entrada de: leadbaze@gmail.com')

  } catch (error) {
    console.error('❌ Erro no teste SMTP:', error.message)
    
    if (error.code === 'EAUTH') {
      console.log('\n💡 Possíveis soluções:')
      console.log('1. Verifique se a senha de app está correta')
      console.log('2. Confirme se 2-Step Verification está ativo')
      console.log('3. Gere uma nova senha de app')
    }
    
    if (error.code === 'ECONNECTION') {
      console.log('\n💡 Possíveis soluções:')
      console.log('1. Verifique a conexão com a internet')
      console.log('2. Confirme se a porta 587 está liberada')
      console.log('3. Teste com outra rede')
    }
  }
}

// Executar teste
testSMTP()
