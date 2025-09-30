#!/usr/bin/env node
require('dotenv').config({ path: './config.env' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Erro: Variáveis de ambiente SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configuradas.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function executeSqlFile(filePath) {
    console.log(`📄 Executando arquivo SQL: ${filePath}`);
    try {
        const sql = fs.readFileSync(filePath, 'utf8');
        
        // Dividir o SQL em comandos individuais
        const commands = sql.split(';').filter(cmd => cmd.trim().length > 0);
        
        for (const command of commands) {
            if (command.trim()) {
                console.log(`   Executando: ${command.trim().substring(0, 50)}...`);
                const { error } = await supabase.rpc('exec_sql', { query: command.trim() });
                
                if (error) {
                    console.error(`❌ Erro ao executar comando:`, error.message);
                    return false;
                }
            }
        }
        
        console.log('✅ SQL executado com sucesso!');
        return true;
    } catch (error) {
        console.error('❌ Erro ao ler ou executar arquivo SQL:', error.message);
        return false;
    }
}

async function verifyMigration() {
    console.log('\n🔍 Verificando migração...');
    
    try {
        const { data: packages, error } = await supabase
            .from('lead_packages')
            .select('*')
            .eq('active', true)
            .order('leads', { ascending: true });

        if (error) {
            console.error('❌ Erro ao verificar pacotes:', error.message);
            return false;
        }

        console.log(`✅ ${packages.length} pacotes encontrados:`);
        packages.forEach(pkg => {
            const price = (pkg.price_cents / 100).toLocaleString('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
            });
            console.log(`   📦 ${pkg.name}: ${price} (${pkg.leads} leads)`);
        });

        return true;
    } catch (error) {
        console.error('❌ Erro inesperado na verificação:', error.message);
        return false;
    }
}

async function runMigration() {
    console.log('🚀 EXECUTANDO MIGRAÇÃO DE PACOTES DE LEADS');
    console.log('==========================================');

    const sqlFilePath = path.join(__dirname, 'create-lead-packages-table.sql');
    const success = await executeSqlFile(sqlFilePath);

    if (success) {
        console.log('\n✅ Migração de pacotes de leads concluída com sucesso!');
        
        // Verificar se a migração funcionou
        const verified = await verifyMigration();
        
        if (verified) {
            console.log('\n🎯 PRÓXIMOS PASSOS:');
            console.log('   1. Atualizar rotas do backend para ler da tabela');
            console.log('   2. Testar funcionalidade completa');
            console.log('   3. Fazer commit das alterações');
        } else {
            console.log('\n⚠️ Migração concluída, mas verificação falhou.');
        }
    } else {
        console.log('\n❌ Migração de pacotes de leads falhou.');
    }
}

runMigration();
