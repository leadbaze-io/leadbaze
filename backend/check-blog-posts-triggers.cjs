require('dotenv').config({ path: './config.env' });
const { createClient } = require('@supabase/supabase-js');

console.log('🔧 Verificando triggers da tabela blog_posts...');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkTriggers() {
    try {
        // Verificar triggers usando query SQL direta
        console.log('🔍 Verificando triggers da tabela blog_posts...');
        const { data: triggers, error: triggerError } = await supabase
            .rpc('exec_sql', {
                sql: `
                    SELECT 
                        trigger_name,
                        event_manipulation,
                        action_statement,
                        action_timing
                    FROM information_schema.triggers 
                    WHERE event_object_table = 'blog_posts'
                `
            });
        
        if (triggerError) {
            console.error('❌ Erro ao verificar triggers:', triggerError);
        } else {
            console.log('📋 Triggers encontrados:', JSON.stringify(triggers, null, 2));
        }

        // Verificar funções relacionadas
        console.log('🔍 Verificando funções relacionadas...');
        const { data: functions, error: funcError } = await supabase
            .rpc('exec_sql', {
                sql: `
                    SELECT 
                        routine_name,
                        routine_definition
                    FROM information_schema.routines 
                    WHERE routine_definition ILIKE '%blog_posts%'
                `
            });
        
        if (funcError) {
            console.error('❌ Erro ao verificar funções:', funcError);
        } else {
            console.log('📋 Funções relacionadas:', JSON.stringify(functions, null, 2));
        }

        // Verificar se há triggers específicos
        console.log('🔍 Verificando triggers específicos...');
        const { data: specificTriggers, error: specError } = await supabase
            .rpc('exec_sql', {
                sql: `
                    SELECT 
                        trigger_name,
                        event_manipulation,
                        action_statement
                    FROM information_schema.triggers 
                    WHERE event_object_table = 'blog_posts'
                    AND action_statement ILIKE '%UPDATE%'
                `
            });
        
        if (specError) {
            console.error('❌ Erro ao verificar triggers específicos:', specError);
        } else {
            console.log('📋 Triggers com UPDATE:', JSON.stringify(specificTriggers, null, 2));
        }

    } catch (err) {
        console.error('💥 Erro geral:', err);
    }
}

checkTriggers();
