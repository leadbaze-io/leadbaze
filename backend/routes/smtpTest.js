// ==============================================
// API ENDPOINT PARA TESTE SMTP
// ==============================================

const express = require('express')
const nodemailer = require('nodemailer')

const router = express.Router()

// Configuração SMTP (mesma do Supabase)
const smtpConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'leadbaze@gmail.com',
    pass: 'jtucwfczikgntxdj' // Senha de app
  }
}

// ==============================================
// ROTAS
// ==============================================

// Teste básico de conexão SMTP
router.get('/test-connection', async (req, res) => {
  try {
    console.log('🧪 Testando conexão SMTP...')
    
    const transporter = nodemailer.createTransport(smtpConfig)
    await transporter.verify()
    
    res.json({
      success: true,
      message: 'Conexão SMTP verificada com sucesso!',
      config: {
        host: smtpConfig.host,
        port: smtpConfig.port,
        user: smtpConfig.auth.user
      }
    })
  } catch (error) {
    console.error('❌ Erro na conexão SMTP:', error)
    res.status(500).json({
      success: false,
      message: 'Erro na conexão SMTP',
      error: error.message,
      code: error.code
    })
  }
})

// Enviar email de teste
router.post('/send-test-email', async (req, res) => {
  try {
    const { to, subject = '🧪 Teste SMTP - LeadBaze', type = 'test' } = req.body
    
    if (!to) {
      return res.status(400).json({
        success: false,
        message: 'Email de destino é obrigatório'
      })
    }

    console.log(`📧 Enviando email de teste para: ${to}`)
    
    const transporter = nodemailer.createTransport(smtpConfig)
    
    // Verificar conexão primeiro
    await transporter.verify()
    
    // Template do email baseado no tipo
    let emailContent = ''
    
    switch (type) {
      case 'test':
        emailContent = `
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
        break
        
      case 'confirmation':
        emailContent = `
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
        break
        
      default:
        emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">📧 Email de Teste</h1>
            <p>Este é um email de teste enviado pelo sistema LeadBaze.</p>
            <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
          </div>
        `
    }
    
    const mailOptions = {
      from: 'LeadBaze <leadbaze@gmail.com>',
      to: to,
      subject: subject,
      html: emailContent
    }
    
    const info = await transporter.sendMail(mailOptions)
    
    console.log('✅ Email enviado com sucesso!')
    console.log('📧 Message ID:', info.messageId)
    
    res.json({
      success: true,
      message: 'Email de teste enviado com sucesso!',
      messageId: info.messageId,
      to: to,
      subject: subject,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error)
    res.status(500).json({
      success: false,
      message: 'Erro ao enviar email de teste',
      error: error.message,
      code: error.code
    })
  }
})

// Teste completo do sistema SMTP
router.post('/full-test', async (req, res) => {
  try {
    const { to } = req.body
    const results = []
    
    console.log('🧪 Iniciando teste completo do SMTP...')
    
    // Teste 1: Verificar conexão
    try {
      const transporter = nodemailer.createTransport(smtpConfig)
      await transporter.verify()
      results.push({
        test: 'Conexão SMTP',
        success: true,
        message: 'Conexão verificada com sucesso'
      })
    } catch (error) {
      results.push({
        test: 'Conexão SMTP',
        success: false,
        message: error.message
      })
      throw error
    }
    
    // Teste 2: Enviar email (se email fornecido)
    if (to) {
      try {
        const transporter = nodemailer.createTransport(smtpConfig)
        const info = await transporter.sendMail({
          from: 'LeadBaze <leadbaze@gmail.com>',
          to: to,
          subject: '🧪 Teste Completo SMTP - LeadBaze',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #2563eb;">🧪 Teste Completo SMTP</h1>
              <p>Este é um teste completo do sistema SMTP do LeadBaze.</p>
              
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>✅ Testes Realizados:</h3>
                <ul>
                  <li>✅ Conexão SMTP verificada</li>
                  <li>✅ Email de teste enviado</li>
                  <li>✅ Configuração validada</li>
                </ul>
              </div>
              
              <p><strong>Data do teste:</strong> ${new Date().toLocaleString('pt-BR')}</p>
              <p>Se você recebeu este email, o sistema SMTP está funcionando perfeitamente!</p>
            </div>
          `
        })
        
        results.push({
          test: 'Envio de Email',
          success: true,
          message: 'Email enviado com sucesso',
          messageId: info.messageId
        })
      } catch (error) {
        results.push({
          test: 'Envio de Email',
          success: false,
          message: error.message
        })
      }
    }
    
    res.json({
      success: true,
      message: 'Teste completo realizado',
      results: results,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Erro no teste completo:', error)
    res.status(500).json({
      success: false,
      message: 'Erro no teste completo do SMTP',
      error: error.message,
      results: results || []
    })
  }
})

module.exports = router
