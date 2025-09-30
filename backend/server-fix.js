const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: './config.env' });

const app = express();
const PORT = 3002; // Mudando para porta 3002

// Middleware
app.use(express.json());

// CORS simples
app.use(cors());

// Evolution API Configuration
const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;

// Headers padrão para todas as requisições à Evolution API
const evolutionHeaders = {
  'Content-Type': 'application/json',
  'apikey': EVOLUTION_API_KEY
};

// Middleware de logging para debug
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

/**
 * POST /api/create-instance-and-qrcode
 * Cria uma nova instância e retorna o QR Code
 */
app.post('/api/create-instance-and-qrcode', async (req, res) => {
  try {
    const { instanceName, userName } = req.body;
    
    if (!instanceName) {
      return res.status(400).json({
        success: false,
        error: 'instanceName é obrigatório'
      });
    }

    console.log(`Criando instância: ${instanceName}${userName ? ` para usuário: ${userName}` : ''}`);

    // 1. Criar a instância na Evolution API
    const createInstanceResponse = await axios.post(
      `${EVOLUTION_API_URL}/instance/create`,
      {
        instanceName: instanceName,
        token: uuidv4(), // Token único para a instância
        qrcode: true,
        number: "000000", // Placeholder válido para regex
        webhookByEvents: false,
        events: [],
        waitQrCode: true,
        integration: "WHATSAPP-BAILEYS"
      },
      { headers: evolutionHeaders }
    );

    console.log('Instância criada:', createInstanceResponse.data);

    // 2. INICIAR a instância
    console.log('🚀 Iniciando instância...');
    
    try {
      const startResponse = await axios.get(
        `${EVOLUTION_API_URL}/instance/start/${instanceName}`,
        { headers: evolutionHeaders }
      );
      console.log('✅ Instância iniciada:', startResponse.data);
    } catch (error) {
      console.log('⚠️ Erro ao iniciar instância (pode ser normal):', error.message);
    }

    // 3. Retornar dados para o frontend
    res.json({
      success: true,
      instanceName: instanceName,
      qrCodeBase64: null, // QR Code será buscado pelo frontend
      pairingCode: null,
      message: 'Instância criada com sucesso. Aguardando QR Code...'
    });

  } catch (error) {
    console.error('❌ Erro detalhado ao criar instância:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Data:', JSON.stringify(error.response?.data, null, 2));
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    
    res.status(500).json({
      success: false,
      error: 'Erro ao criar instância',
      details: error.response?.data || error.message
    });
  }
});

/**
 * GET /api/qrcode/:instanceName
 * Busca o QR Code de uma instância específica
 */
app.get('/api/qrcode/:instanceName', async (req, res) => {
  try {
    const { instanceName } = req.params;
    
    if (!instanceName) {
      return res.status(400).json({
        success: false,
        error: 'instanceName é obrigatório'
      });
    }

    console.log(`🔍 Buscando QR Code para instância: ${instanceName}`);

    // Tentar diferentes endpoints para obter o QR Code
    let qrCodeBase64 = null;
    let pairingCode = null;
    
    try {
      // Estratégia 1: Endpoint padrão
      const qrCodeResponse = await axios.get(
        `${EVOLUTION_API_URL}/instance/connect/${instanceName}`,
        { headers: evolutionHeaders }
      );

      console.log('📱 Resposta do QR Code:', JSON.stringify(qrCodeResponse.data, null, 2));
      
      // Verificar diferentes formatos de resposta
      const qrData = qrCodeResponse.data;
      const possibleQrFields = ['qrcode', 'code', 'qr', 'qrcodeBase64', 'base64'];
      
      for (const field of possibleQrFields) {
        if (qrData[field] && qrData[field] !== '' && qrData[field] !== '0' && qrData[field] !== 0) {
          qrCodeBase64 = qrData[field];
          console.log(`✅ QR Code encontrado no campo: ${field}`);
          break;
        }
      }
      
      // Verificar pairing code
      const possiblePairingFields = ['pairingCode', 'pairing', 'code'];
      for (const field of possiblePairingFields) {
        if (qrData[field] && qrData[field] !== '') {
          pairingCode = qrData[field];
          console.log(`✅ Pairing Code encontrado no campo: ${field}`);
          break;
        }
      }

    } catch (error) {
      console.log('⚠️ Erro ao buscar QR Code:', error.message);
    }

    res.json({
      success: true,
      instanceName: instanceName,
      qrCodeBase64: qrCodeBase64,
      pairingCode: pairingCode,
      hasQRCode: !!qrCodeBase64,
      message: qrCodeBase64 
        ? 'QR Code encontrado!'
        : 'QR Code ainda não disponível. Tente novamente.'
    });

  } catch (error) {
    console.error('Erro ao buscar QR Code:', error.response?.data || error.message);
    
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar QR Code',
      details: error.response?.data || error.message
    });
  }
});

/**
 * GET /api/connection-state/:instanceName
 * Verifica o estado da conexão da instância
 */
app.get('/api/connection-state/:instanceName', async (req, res) => {
  try {
    const { instanceName } = req.params;
    
    if (!instanceName) {
      return res.status(400).json({
        success: false,
        error: 'instanceName é obrigatório'
      });
    }

    console.log(`Verificando estado da instância: ${instanceName}`);

    // Consultar estado da conexão
    const connectionStateResponse = await axios.get(
      `${EVOLUTION_API_URL}/instance/connectionState/${instanceName}`,
      { headers: evolutionHeaders }
    );

    console.log('Estado da conexão:', connectionStateResponse.data);

    res.json({
      success: true,
      instanceName: instanceName,
      state: connectionStateResponse.data.state,
      message: getStateMessage(connectionStateResponse.data.state)
    });

  } catch (error) {
    console.error('Erro ao verificar estado da conexão:', error.response?.data || error.message);
    
    res.status(500).json({
      success: false,
      error: 'Erro ao verificar estado da conexão',
      details: error.response?.data || error.message
    });
  }
});

/**
 * GET /api/health
 * Endpoint de saúde do servidor
 */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Evolution API Backend está funcionando',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

/**
 * Função auxiliar para mensagens de estado
 */
function getStateMessage(state) {
  const messages = {
    'open': 'WhatsApp conectado com sucesso!',
    'connecting': 'Conectando ao WhatsApp...',
    'close': 'WhatsApp desconectado',
    'disconnected': 'WhatsApp desconectado',
    'qrcode': 'Escaneie o QR Code para conectar',
    'qrRead': 'QR Code lido, conectando...',
    'ready': 'WhatsApp pronto para uso!',
    'loading': 'Carregando WhatsApp...',
    'start': 'Iniciando conexão...',
    'stop': 'Conexão parada',
    'destroy': 'Instância destruída'
  };
  
  return messages[state] || `Estado: ${state}`;
}

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Evolution API Backend rodando na porta ${PORT}`);
  console.log(`📱 URL da Evolution API: ${EVOLUTION_API_URL}`);
  console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN}`);
  console.log(`🔧 Ambiente: ${process.env.NODE_ENV}`);
});

module.exports = app; 