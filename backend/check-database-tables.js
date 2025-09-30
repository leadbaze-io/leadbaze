#!/usr/bin/env node
require('dotenv').config({ path: './config.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTables() {
  console.log('🔍 VERIFICANDO TABELAS DO BANCO DE DADOS');
  console.log('========================================');
  
  try {
    // Listar todas as tabelas usando query SQL direta
    const { data: tables, error } = await supabase.rpc('exec_sql', {
      query: `
        SELECT table_name, table_type 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `
    });
    
    if (error) {
      console.log('❌ Erro ao buscar tabelas:', error.message);
      
      // Tentar método alternativo
      console.log('🔄 Tentando método alternativo...');
      const { data: altTables, error: altError } = await supabase
        .from('pg_tables')
        .select('tablename')
        .eq('schemaname', 'public');
        
      if (altError) {
        console.log('❌ Erro no método alternativo:', altError.message);
        return;
      }
      
      console.log('📋 Tabelas encontradas (método alternativo):');
      altTables.forEach(table => {
        console.log(`   - ${table.tablename}`);
      });
      
    } else {
      console.log('📋 Tabelas encontradas:');
      tables.forEach(table => {
        console.log(`   - ${table.table_name} (${table.table_type})`);
      });
    }
    
    console.log('');
    
    // Verificar tabelas específicas que podem conter webhooks
    const webhookRelatedTables = [
      'perfect_pay_webhooks',
      'webhooks',
      'payment_webhooks',
      'perfect_pay_logs',
      'payment_logs',
      'transaction_logs'
    ];
    
    console.log('🎯 Verificando tabelas relacionadas a webhooks:');
    for (const tableName of webhookRelatedTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
          
        if (error) {
          console.log(`   ❌ ${tableName}: Não existe`);
        } else {
          console.log(`   ✅ ${tableName}: Existe`);
        }
      } catch (err) {
        console.log(`   ❌ ${tableName}: Não existe`);
      }
    }
    
    console.log('');
    
    // Verificar estrutura da tabela user_payment_subscriptions
    console.log('📊 Estrutura da tabela user_payment_subscriptions:');
    try {
      const { data: columns, error: columnsError } = await supabase
        .from('user_payment_subscriptions')
        .select('*')
        .limit(1);
        
      if (columnsError) {
        console.log('❌ Erro ao verificar estrutura:', columnsError.message);
      } else {
        // Pegar uma linha para ver as colunas
        const sampleRow = columns[0];
        if (sampleRow) {
          console.log('   Colunas encontradas:');
          Object.keys(sampleRow).forEach(col => {
            console.log(`   - ${col}`);
          });
        }
      }
    } catch (err) {
      console.log('❌ Erro ao verificar estrutura:', err.message);
    }
    
    console.log('');
    
    // Verificar se há logs de webhook em outras tabelas
    console.log('🔍 Verificando se há logs de webhook em outras tabelas:');
    
    // Verificar tabela de atividades de assinatura
    try {
      const { data: activities, error: activitiesError } = await supabase
        .from('user_subscription_activities')
        .select('*')
        .limit(5);
        
      if (activitiesError) {
        console.log('   ❌ user_subscription_activities: Não existe');
      } else {
        console.log('   ✅ user_subscription_activities: Existe');
        console.log('   📝 Atividades recentes:');
        activities.forEach((activity, index) => {
          console.log(`      ${index + 1}. ${activity.activity_type} - ${activity.created_at}`);
        });
      }
    } catch (err) {
      console.log('   ❌ user_subscription_activities: Não existe');
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
  }
}

checkTables();



