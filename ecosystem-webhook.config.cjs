module.exports = {
  apps: [{
    name: 'leadbaze-webhook',
    script: 'backend-webhook-server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      SUPABASE_WEBHOOK_SECRET: 'webhook_leadbaze_2024_secure_key_xyz123'
    },
    env_development: {
      NODE_ENV: 'development',
      PORT: 3001,
      SUPABASE_WEBHOOK_SECRET: 'webhook_leadbaze_2024_secure_key_xyz123'
    },
    error_file: './logs/webhook-error.log',
    out_file: './logs/webhook-out.log',
    log_file: './logs/webhook-combined.log',
    time: true
  }]
}

