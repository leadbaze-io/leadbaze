// ==============================================
// TESTE SMTP VIA TERMINAL - SEM INTERFACE
// ==============================================

import nodemailer from 'nodemailer'
import readline from 'readline'

// Configuração do SMTP
const smtpConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'leadbaze@gmail.com',
    pass: 'jtucwfczikgntxdj'
  }
}

// Interface para input do usuário
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve)
  })
}

async function testSMTPConnection() {
  console.log('🧪 TESTE SMTP - LEADBAZE')
  console.log('=' .repeat(50))
  
  try {
    // 1. Verificar conexão
    console.log('\n1️⃣ Verificando conexão SMTP...')
    const transporter = nodemailer.createTransport(smtpConfig)
    await transporter.verify()
    console.log('✅ Conexão SMTP verificada com sucesso!')
    
    // 2. Perguntar email de destino
    const email = await askQuestion('\n📧 Digite o email de destino (ou Enter para leadbaze@gmail.com): ')
    const destinationEmail = email.trim() || 'leadbaze@gmail.com'
    
    // 3. Perguntar tipo de teste
    console.log('\n📋 Tipos de teste disponíveis:')
    console.log('1. Teste básico')
    console.log('2. Email de confirmação')
    console.log('3. Email de redefinição de senha')
    
    const testType = await askQuestion('\nEscolha o tipo de teste (1-3): ')
    
    let subject, htmlContent
    
    switch (testType) {
      case '1':
        subject = '🧪 Teste SMTP - LeadBaze'
        htmlContent = getTestEmailTemplate()
        break
      case '2':
        subject = '🎉 Confirme sua conta no LeadBaze'
        htmlContent = getConfirmationEmailTemplate()
        break
      case '3':
        subject = '🔐 Redefinir senha - LeadBaze'
        htmlContent = getPasswordResetEmailTemplate()
        break
      default:
        subject = '🧪 Teste SMTP - LeadBaze'
        htmlContent = getTestEmailTemplate()
    }
    
    // 4. Enviar email
    console.log(`\n2️⃣ Enviando email para: ${destinationEmail}`)
    console.log(`📝 Assunto: ${subject}`)
    
    const info = await transporter.sendMail({
      from: 'LeadBaze <leadbaze@gmail.com>',
      to: destinationEmail,
      subject: subject,
      html: htmlContent
    })
    
    console.log('✅ Email enviado com sucesso!')
    console.log(`📧 Message ID: ${info.messageId}`)
    console.log(`📬 Verifique a caixa de entrada de: ${destinationEmail}`)
    
    // 5. Perguntar se quer enviar outro
    const sendAnother = await askQuestion('\n🔄 Deseja enviar outro email de teste? (s/n): ')
    if (sendAnother.toLowerCase() === 's' || sendAnother.toLowerCase() === 'sim') {
      await testSMTPConnection()
    }
    
  } catch (error) {
    console.error('\n❌ Erro no teste SMTP:', error.message)
    
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
  } finally {
    rl.close()
  }
}

function getTestEmailTemplate() {
  return `
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

function getConfirmationEmailTemplate() {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2563eb;">🎉 Bem-vindo ao LeadBaze!</h1>
      <p>Olá,</p>
      <p>Sua conta foi criada com sucesso!</p>
      <p>Clique no botão abaixo para confirmar seu email:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="#" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Confirmar Email
        </a>
      </div>
      
      <p>Se você não criou esta conta, ignore este email.</p>
      <p>Equipe LeadBaze</p>
    </div>
  `
}

function getPasswordResetEmailTemplate() {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #dc2626;">🔐 Redefinir Senha</h1>
      <p>Olá,</p>
      <p>Você solicitou a redefinição de sua senha.</p>
      <p>Clique no botão abaixo para criar uma nova senha:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="#" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Redefinir Senha
        </a>
      </div>
      
      <p>Se você não solicitou isso, ignore este email.</p>
      <p>Equipe LeadBaze</p>
    </div>
  `
}

// Executar teste
testSMTPConnection()
